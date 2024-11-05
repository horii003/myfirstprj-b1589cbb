import { createMocks } from 'node-mocks-http';
import { NextApiRequest } from 'next';
import type { MockResponse } from 'node-mocks-http';
import participantsList from '@/pages/api/events/[eventId]/participants/list';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  data: null,
  error: null,
};

(createClient as jest.Mock).mockImplementation(() => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
  },
  from: () => mockSupabase,
}));

describe('参加者一覧API', () => {
  const mockParticipants = [
    {
      id: '1',
      name: 'テスト太郎',
      email: 'test1@example.com',
      ticketType: '一般',
      status: '参加確定',
      registeredAt: '2024-01-01T10:00:00'
    },
    {
      id: '2',
      name: 'テスト花子',
      email: 'test2@example.com',
      ticketType: '学生',
      status: 'キャンセル',
      registeredAt: '2024-01-02T11:00:00'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常に参加者一覧を取得できる', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: { eventId: 'event-1' },
    });

    mockSupabase.data = mockParticipants;

    await participantsList(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      participants: mockParticipants,
      total: mockParticipants.length
    });
  });

  it('検索フィルターが正しく適用される', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: {
        eventId: 'event-1',
        search: '太郎',
        status: '参加確定'
      },
    });

    mockSupabase.data = [mockParticipants[0]];

    await participantsList(req, res);

    expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%太郎%');
    expect(mockSupabase.eq).toHaveBeenCalledWith('status', '参加確定');
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      participants: [mockParticipants[0]],
      total: 1
    });
  });

  it('ページネーションが正しく機能する', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: {
        eventId: 'event-1',
        page: '1',
        limit: '1'
      },
    });

    mockSupabase.data = [mockParticipants[0]];

    await participantsList(req, res);

    expect(mockSupabase.range).toHaveBeenCalledWith(0, 0);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      participants: [mockParticipants[0]],
      total: 1
    });
  });

  it('認証エラー時に401を返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: { eventId: 'event-1' },
    });

    const mockSupabaseAuth = createClient as jest.Mock;
    mockSupabaseAuth.mockImplementationOnce(() => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Unauthorized'),
        }),
      },
    }));

    await participantsList(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Unauthorized'
    });
  });

  it('DBエラー時に500を返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: { eventId: 'event-1' },
    });

    mockSupabase.error = new Error('Database error');

    await participantsList(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Internal Server Error'
    });
  });

  it('不正なHTTPメソッドで405を返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: 'event-1' },
    });

    await participantsList(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('イベントIDが無い場合に400を返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: {},
    });

    await participantsList(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Event ID is required'
    });
  });

  it('参加者が0人の場合に空配列を返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: { eventId: 'event-1' },
    });

    mockSupabase.data = [];

    await participantsList(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      participants: [],
      total: 0
    });
  });
});