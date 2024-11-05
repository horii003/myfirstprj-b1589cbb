import { createMocks } from 'node-mocks-http';
import { jest } from '@jest/globals';
import updateEvent from '@/pages/api/events/[eventId]/update';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('イベント更新 API', () => {
  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    })),
    auth: {
      getUser: jest.fn()
    }
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEventData = {
    title: '更新後のイベント',
    description: '更新後の説明文',
    startDateTime: '2024-01-01T10:00:00',
    endDateTime: '2024-01-01T17:00:00',
    venue: {
      name: '更新後の会場',
      address: '東京都新宿区'
    },
    tickets: [
      {
        id: '1',
        name: '更新後のチケット',
        price: 2000,
        capacity: 150
      }
    ]
  };

  it('正常なイベント更新のリクエストを処理できる', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: '1234' },
      body: mockEventData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } }
    });

    mockSupabaseClient.from().select().single.mockResolvedValue({
      data: { id: '1234', organizer_id: 'user123' }
    });

    mockSupabaseClient.from().update().eq.mockResolvedValue({
      data: { ...mockEventData, id: '1234' },
      error: null
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ success: true })
    );
  });

  it('未認証ユーザーからのリクエストを拒否する', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: '1234' },
      body: mockEventData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: '未認証です' }
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: '認証が必要です' })
    );
  });

  it('不正なイベントIDの場合はエラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: 'invalid-id' },
      body: mockEventData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } }
    });

    mockSupabaseClient.from().select().single.mockResolvedValue({
      data: null,
      error: { message: 'イベントが見つかりません' }
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: 'イベントが見つかりません' })
    );
  });

  it('更新権限のないユーザーからのリクエストを拒否する', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: '1234' },
      body: mockEventData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'unauthorized-user' } }
    });

    mockSupabaseClient.from().select().single.mockResolvedValue({
      data: { id: '1234', organizer_id: 'different-user' }
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: '更新権限がありません' })
    );
  });

  it('必須フィールドが欠落している場合はエラーを返す', async () => {
    const invalidEventData = {
      description: '説明のみ',
      startDateTime: '2024-01-01T10:00:00'
    };

    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: '1234' },
      body: invalidEventData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } }
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: 'タイトルは必須です' })
    );
  });

  it('データベース更新エラー時に適切なエラーレスポンスを返す', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: '1234' },
      body: mockEventData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } }
    });

    mockSupabaseClient.from().select().single.mockResolvedValue({
      data: { id: '1234', organizer_id: 'user123' }
    });

    mockSupabaseClient.from().update().eq.mockResolvedValue({
      data: null,
      error: { message: 'データベースエラー' }
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: 'イベントの更新に失敗しました' })
    );
  });

  it('不正なHTTPメソッドを拒否する', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { eventId: '1234' }
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: 'Method Not Allowed' })
    );
  });

  it('日付バリデーションが正しく機能する', async () => {
    const invalidDateData = {
      ...mockEventData,
      startDateTime: '2024-01-01T17:00:00',
      endDateTime: '2024-01-01T10:00:00'
    };

    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: '1234' },
      body: invalidDateData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } }
    });

    await updateEvent(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: '開始日時は終了日時より前である必要があります' })
    );
  });

  it('チケット情報の更新が正しく処理される', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { eventId: '1234' },
      body: mockEventData
    });

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } }
    });

    mockSupabaseClient.from().select().single.mockResolvedValue({
      data: { id: '1234', organizer_id: 'user123' }
    });

    const mockTicketUpdate = jest.fn().mockResolvedValue({ data: null, error: null });
    mockSupabaseClient.from = jest.fn().mockReturnValue({
      update: mockTicketUpdate,
      eq: jest.fn().mockReturnThis()
    });

    await updateEvent(req, res);

    expect(mockTicketUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '更新後のチケット',
        price: 2000,
        capacity: 150
      })
    );
  });
});