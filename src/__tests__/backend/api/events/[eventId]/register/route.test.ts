import { createMocks } from 'node-mocks-http';
import { jest } from '@jest/globals';
import type { NextApiRequest, NextApiResponse } from 'next';
import registerHandler from '@/pages/api/events/[eventId]/register';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  data: null,
  error: null,
};

(createClient as jest.Mock).mockImplementation(() => mockSupabase);

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('参加登録 API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEventId = 'event-1';
  const mockTicketId = 'ticket-1';
  const mockParticipantInfo = {
    name: 'テスト太郎',
    email: 'test@example.com'
  };

  it('正常な参加登録処理が成功すること', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: mockEventId },
      body: {
        ticketId: mockTicketId,
        participantInfo: mockParticipantInfo
      }
    });

    mockSupabase.single
      .mockResolvedValueOnce({ data: { remainingCount: 5 }, error: null })
      .mockResolvedValueOnce({ data: { id: 'reg-1' }, error: null });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      registrationId: 'reg-1'
    });
  });

  it('チケット在庫切れの場合エラーを返すこと', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: mockEventId },
      body: {
        ticketId: mockTicketId,
        participantInfo: mockParticipantInfo
      }
    });

    mockSupabase.single
      .mockResolvedValueOnce({ data: { remainingCount: 0 }, error: null });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'チケットが売り切れです'
    });
  });

  it('必須パラメータが不足している場合エラーを返すこと', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: mockEventId },
      body: {
        ticketId: mockTicketId,
        participantInfo: {
          email: 'test@example.com'
        }
      }
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '必須項目が入力されていません'
    });
  });

  it('不正なHTTPメソッドの場合エラーを返すこと', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: { eventId: mockEventId }
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('DBエラー時に適切なエラーレスポンスを返すこと', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: mockEventId },
      body: {
        ticketId: mockTicketId,
        participantInfo: mockParticipantInfo
      }
    });

    mockSupabase.single
      .mockResolvedValueOnce({ data: { remainingCount: 5 }, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: '参加登録に失敗しました'
    });
  });

  it('メール送信エラー時も登録自体は成功すること', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: mockEventId },
      body: {
        ticketId: mockTicketId,
        participantInfo: mockParticipantInfo
      }
    });

    mockSupabase.single
      .mockResolvedValueOnce({ data: { remainingCount: 5 }, error: null })
      .mockResolvedValueOnce({ data: { id: 'reg-1' }, error: null });

    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Mail Error'));

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      registrationId: 'reg-1'
    });
  });

  it('同時登録時の在庫チェックが正しく機能すること', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: mockEventId },
      body: {
        ticketId: mockTicketId,
        participantInfo: mockParticipantInfo
      }
    });

    let remainingCount = 1;
    mockSupabase.single
      .mockImplementation(async () => {
        if (remainingCount > 0) {
          remainingCount--;
          return { data: { remainingCount }, error: null };
        }
        return { data: { remainingCount: 0 }, error: null };
      });

    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(registerHandler(req, res));
    }

    await Promise.all(promises);

    const successCount = JSON.parse(res._getData()).success ? 1 : 0;
    expect(successCount).toBe(1);
  });

  it('不正なイベントIDの場合エラーを返すこと', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: 'invalid-event' },
      body: {
        ticketId: mockTicketId,
        participantInfo: mockParticipantInfo
      }
    });

    mockSupabase.single
      .mockResolvedValueOnce({ data: null, error: new Error('Not Found') });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'イベントが見つかりません'
    });
  });
});