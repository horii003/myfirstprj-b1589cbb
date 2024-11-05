import { createMocks } from 'node-mocks-http';
import { NextApiRequest } from 'next';
import submitHandler from '@/pages/api/events/[eventId]/survey/submit';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('アンケート回答API', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockImplementation(() => mockSupabaseClient);
  });

  const mockSurveyData = {
    eventId: 'event-123',
    surveyId: 'survey-123',
    answers: [
      { questionId: 'q1', answer: 'とても良かったです' },
      { questionId: 'q2', answer: '満足' }
    ],
    participantId: 'participant-123'
  };

  it('有効なデータで回答が保存できること', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: mockSurveyData,
      query: { eventId: 'event-123' }
    });

    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: 'response-123' },
      error: null
    });

    await submitHandler(req as NextApiRequest, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('id', 'response-123');
  });

  it('必須パラメータが不足している場合にエラーを返すこと', async () => {
    const invalidData = {
      eventId: 'event-123',
      answers: []
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: invalidData,
      query: { eventId: 'event-123' }
    });

    await submitHandler(req as NextApiRequest, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('error');
  });

  it('無効なイベントIDの場合にエラーを返すこと', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: mockSurveyData,
      query: { eventId: 'invalid-event' }
    });

    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'イベントが見つかりません' }
    });

    await submitHandler(req as NextApiRequest, res);

    expect(res._getStatusCode()).toBe(404);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('error', 'イベントが見つかりません');
  });

  it('DBエラー時に500エラーを返すこと', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: mockSurveyData,
      query: { eventId: 'event-123' }
    });

    mockSupabaseClient.single.mockRejectedValueOnce(new Error('DB接続エラー'));

    await submitHandler(req as NextApiRequest, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('error');
  });

  it('POSTメソッド以外でアクセスした場合にエラーを返すこと', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { eventId: 'event-123' }
    });

    await submitHandler(req as NextApiRequest, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('error', 'Method not allowed');
  });

  it('重複回答の場合にエラーを返すこと', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: mockSurveyData,
      query: { eventId: 'event-123' }
    });

    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: 'existing-response' },
      error: null
    });

    await submitHandler(req as NextApiRequest, res);

    expect(res._getStatusCode()).toBe(409);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('error', '既に回答が存在します');
  });

  it('回答内容のバリデーションが機能すること', async () => {
    const invalidAnswerData = {
      ...mockSurveyData,
      answers: [
        { questionId: 'q1', answer: '' },
        { questionId: 'q2', answer: '無効な選択肢' }
      ]
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: invalidAnswerData,
      query: { eventId: 'event-123' }
    });

    await submitHandler(req as NextApiRequest, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('error');
  });
});