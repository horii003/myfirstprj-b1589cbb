import { jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { createClient } from '@supabase/supabase-js';
import updatePaymentStatus from '@/pages/api/events/[eventId]/payments/update';

jest.mock('@supabase/supabase-js');

describe('支払い状態更新 API', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockImplementation(() => mockSupabaseClient);
  });

  it('支払い状態を正常に更新できる', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {
        eventId: 'event-123',
        paymentId: 'payment-123'
      },
      body: {
        status: '支払い済み'
      }
    });

    mockSupabaseClient.single.mockResolvedValueOnce({
      data: {
        id: 'payment-123',
        participantId: 'participant-123',
        status: '未払い'
      },
      error: null
    });

    mockSupabaseClient.update.mockResolvedValueOnce({
      data: {
        id: 'payment-123',
        status: '支払い済み'
      },
      error: null
    });

    await updatePaymentStatus(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: 'payment-123',
        status: '支払い済み'
      }
    });
  });

  it('存在しない支払い情報の場合はエラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {
        eventId: 'event-123',
        paymentId: 'invalid-payment'
      },
      body: {
        status: '支払い済み'
      }
    });

    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: { message: '支払い情報が見つかりません' }
    });

    await updatePaymentStatus(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      error: '支払い情報が見つかりません'
    });
  });

  it('無効なステータス値の場合はエラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {
        eventId: 'event-123',
        paymentId: 'payment-123'
      },
      body: {
        status: '無効なステータス'
      }
    });

    await updatePaymentStatus(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '無効な支払いステータスです'
    });
  });

  it('データベース更新エラー時は500エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {
        eventId: 'event-123',
        paymentId: 'payment-123'
      },
      body: {
        status: '支払い済み'
      }
    });

    mockSupabaseClient.single.mockResolvedValueOnce({
      data: {
        id: 'payment-123',
        status: '未払い'
      },
      error: null
    });

    mockSupabaseClient.update.mockResolvedValueOnce({
      data: null,
      error: { message: 'データベースエラー' }
    });

    await updatePaymentStatus(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'データベースエラー'
    });
  });

  it('必須パラメータが不足している場合はエラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {
        eventId: 'event-123'
      },
      body: {}
    });

    await updatePaymentStatus(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '必須パラメータが不足しています'
    });
  });

  it('更新履歴が正しく記録される', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {
        eventId: 'event-123',
        paymentId: 'payment-123'
      },
      body: {
        status: '支払い済み'
      }
    });

    mockSupabaseClient.single.mockResolvedValueOnce({
      data: {
        id: 'payment-123',
        status: '未払い'
      },
      error: null
    });

    mockSupabaseClient.update.mockResolvedValueOnce({
      data: {
        id: 'payment-123',
        status: '支払い済み'
      },
      error: null
    });

    mockSupabaseClient.insert.mockResolvedValueOnce({
      data: {
        id: 'history-123',
        paymentId: 'payment-123',
        oldStatus: '未払い',
        newStatus: '支払い済み'
      },
      error: null
    });

    await updatePaymentStatus(req, res);

    expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
      paymentId: 'payment-123',
      oldStatus: '未払い',
      newStatus: '支払い済み',
      updatedAt: expect.any(String)
    });
  });

  it('PUTメソッド以外のリクエストの場合はエラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: {
        eventId: 'event-123',
        paymentId: 'payment-123'
      }
    });

    await updatePaymentStatus(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('認証エラー時は401エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: {
        eventId: 'event-123',
        paymentId: 'payment-123'
      },
      body: {
        status: '支払い済み'
      },
      headers: {
        authorization: 'invalid-token'
      }
    });

    mockSupabaseClient.single.mockRejectedValueOnce(new Error('認証エラー'));

    await updatePaymentStatus(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: '認証エラー'
    });
  });
});