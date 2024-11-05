import { createMocks } from 'node-mocks-http';
import { NextApiRequest } from 'next';
import type { MockResponse } from 'node-mocks-http';
import createEvent from '@/pages/api/events/create';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('イベント作成 API', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn(),
    select: jest.fn()
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    jest.clearAllMocks();
  });

  it('正常にイベントが作成されること', async () => {
    const eventData = {
      title: 'テストイベント',
      description: 'テスト説明',
      startDate: '2024-01-01T10:00:00',
      endDate: '2024-01-01T17:00:00',
      tickets: [
        { name: '一般チケット', price: 1000 }
      ]
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: eventData,
    });

    mockSupabaseClient.insert.mockResolvedValueOnce({
      data: { id: '123e4567-e89b-12d3-a456-426614174000' },
      error: null
    });

    await createEvent(req as NextApiRequest, res as MockResponse);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000'
    });
  });

  it('必須項目が不足している場合はエラーを返すこと', async () => {
    const eventData = {
      description: 'テスト説明'
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: eventData,
    });

    await createEvent(req as NextApiRequest, res as MockResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'イベント名は必須です'
    });
  });

  it('開始日時が終了日時より後の場合はエラーを返すこと', async () => {
    const eventData = {
      title: 'テストイベント',
      description: 'テスト説明',
      startDate: '2024-01-02T10:00:00',
      endDate: '2024-01-01T17:00:00',
      tickets: [
        { name: '一般チケット', price: 1000 }
      ]
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: eventData,
    });

    await createEvent(req as NextApiRequest, res as MockResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '開始日時は終了日時より前に設定してください'
    });
  });

  it('DBエラーが発生した場合は500エラーを返すこと', async () => {
    const eventData = {
      title: 'テストイベント',
      description: 'テスト説明',
      startDate: '2024-01-01T10:00:00',
      endDate: '2024-01-01T17:00:00',
      tickets: [
        { name: '一般チケット', price: 1000 }
      ]
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: eventData,
    });

    mockSupabaseClient.insert.mockRejectedValueOnce(new Error('DB Error'));

    await createEvent(req as NextApiRequest, res as MockResponse);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'イベントの作成に失敗しました'
    });
  });

  it('POSTメソッド以外は405エラーを返すこと', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await createEvent(req as NextApiRequest, res as MockResponse);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('チケット情報が正しく保存されること', async () => {
    const eventData = {
      title: 'テストイベント',
      description: 'テスト説明',
      startDate: '2024-01-01T10:00:00',
      endDate: '2024-01-01T17:00:00',
      tickets: [
        { name: '一般チケット', price: 1000 },
        { name: 'VIPチケット', price: 5000 }
      ]
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: eventData,
    });

    const eventId = '123e4567-e89b-12d3-a456-426614174000';
    mockSupabaseClient.insert.mockImplementation((data) => {
      if (data.table === 'events') {
        return Promise.resolve({ data: { id: eventId }, error: null });
      } else if (data.table === 'tickets') {
        return Promise.resolve({ data: null, error: null });
      }
    });

    await createEvent(req as NextApiRequest, res as MockResponse);

    expect(mockSupabaseClient.insert).toHaveBeenCalledTimes(2);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('tickets');
    expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_id: eventId,
          name: '一般チケット',
          price: 1000
        }),
        expect.objectContaining({
          event_id: eventId,
          name: 'VIPチケット',
          price: 5000
        })
      ])
    );
  });

  it('認証されていない場合は401エラーを返すこと', async () => {
    const eventData = {
      title: 'テストイベント'
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: eventData,
    });

    mockSupabaseClient.auth = {
      getUser: jest.fn().mockResolvedValueOnce({ data: null, error: new Error('Unauthorized') })
    };

    await createEvent(req as NextApiRequest, res as MockResponse);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: '認証が必要です'
    });
  });
});