import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import analyticsHandler from '@/pages/api/events/[eventId]/analytics/stats';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('アクセス統計取得 API', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnThis(),
      execute: jest.fn()
    }))
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('正常なリクエストで統計データを返却する', async () => {
    const mockPageViews = {
      data: [
        { date: '2024-01-01', count: 100 },
        { date: '2024-01-02', count: 150 }
      ],
      count: 250
    };

    const mockRegistrations = {
      data: [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 }
      ],
      count: 25
    };

    mockSupabase.from().execute.mockResolvedValueOnce(mockPageViews);
    mockSupabase.from().execute.mockResolvedValueOnce(mockRegistrations);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        eventId: 'event-1',
        startDate: '2024-01-01',
        endDate: '2024-01-02'
      }
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      pageViews: {
        daily: mockPageViews.data,
        total: mockPageViews.count
      },
      registrations: {
        daily: mockRegistrations.data,
        total: mockRegistrations.count
      }
    });
  });

  it('週別集計でデータを返却する', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        eventId: 'event-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'weekly'
      }
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith('page_views');
    expect(mockSupabase.from().select).toHaveBeenCalledWith('date, count');
  });

  it('期間パラメータが無い場合はデフォルト期間で検索する', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        eventId: 'event-1'
      }
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSupabase.from().where).toHaveBeenCalled();
  });

  it('DBエラー時に500エラーを返す', async () => {
    mockSupabase.from().execute.mockRejectedValueOnce(new Error('DB Error'));

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        eventId: 'event-1'
      }
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'データの取得に失敗しました'
    });
  });

  it('イベントIDが無い場合は400エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {}
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'イベントIDが必要です'
    });
  });

  it('不正な日付形式の場合は400エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        eventId: 'event-1',
        startDate: 'invalid-date'
      }
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '不正な日付形式です'
    });
  });

  it('不正なグループ化パラメータの場合は400エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        eventId: 'event-1',
        groupBy: 'invalid'
      }
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '不正なグループ化パラメータです'
    });
  });

  it('GET以外のメソッドの場合は405エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: {
        eventId: 'event-1'
      }
    });

    await analyticsHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });
});