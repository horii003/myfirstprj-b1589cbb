import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import updateAttendance from '@/pages/api/events/[eventId]/attendance/update';
import { jest } from '@jest/globals';

jest.mock('@supabase/supabase-js');

interface MockResponse extends NextApiResponse {
    _getStatusCode(): number;
    _getData(): string;
}

const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn(),
    insert: jest.fn(),
};

(createClient as jest.Mock).mockImplementation(() => mockSupabaseClient);

describe('出欠状態更新 API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('出欠状態を正常に更新できる', async () => {
        const { req, res } = createMocks<NextApiRequest, MockResponse>({
            method: 'PUT',
            query: {
                eventId: 'event-1',
            },
            body: {
                participantId: '1',
                status: '出席',
                note: 'テスト備考'
            },
        });

        mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: '1' } });
        mockSupabaseClient.update.mockResolvedValueOnce({ 
            data: { 
                id: '1',
                status: '出席',
                note: 'テスト備考'
            }
        });

        await updateAttendance(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({
            success: true,
            data: {
                id: '1',
                status: '出席',
                note: 'テスト備考'
            }
        });
    });

    it('存在しない参加者IDの場合エラーを返す', async () => {
        const { req, res } = createMocks<NextApiRequest, MockResponse>({
            method: 'PUT',
            query: {
                eventId: 'event-1',
            },
            body: {
                participantId: 'invalid-id',
                status: '出席'
            },
        });

        mockSupabaseClient.single.mockResolvedValueOnce({ data: null });

        await updateAttendance(req, res);

        expect(res._getStatusCode()).toBe(404);
        expect(JSON.parse(res._getData())).toEqual({
            error: '参加者が見つかりません'
        });
    });

    it('必要なパラメータが不足している場合エラーを返す', async () => {
        const { req, res } = createMocks<NextApiRequest, MockResponse>({
            method: 'PUT',
            query: {
                eventId: 'event-1',
            },
            body: {
                participantId: '1'
            },
        });

        await updateAttendance(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({
            error: '出欠状態は必須です'
        });
    });

    it('DBエラー時に500エラーを返す', async () => {
        const { req, res } = createMocks<NextApiRequest, MockResponse>({
            method: 'PUT',
            query: {
                eventId: 'event-1',
            },
            body: {
                participantId: '1',
                status: '出席'
            },
        });

        mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: '1' } });
        mockSupabaseClient.update.mockRejectedValueOnce(new Error('DB Error'));

        await updateAttendance(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            error: '出欠状態の更新に失敗しました'
        });
    });

    it('不正なHTTPメソッドの場合エラーを返す', async () => {
        const { req, res } = createMocks<NextApiRequest, MockResponse>({
            method: 'GET',
            query: {
                eventId: 'event-1',
            },
        });

        await updateAttendance(req, res);

        expect(res._getStatusCode()).toBe(405);
        expect(JSON.parse(res._getData())).toEqual({
            error: 'Method not allowed'
        });
    });

    it('出欠履歴が正常に記録される', async () => {
        const { req, res } = createMocks<NextApiRequest, MockResponse>({
            method: 'PUT',
            query: {
                eventId: 'event-1',
            },
            body: {
                participantId: '1',
                status: '出席',
                note: 'テスト備考'
            },
        });

        mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: '1' } });
        mockSupabaseClient.update.mockResolvedValueOnce({ data: { id: '1' } });
        mockSupabaseClient.insert.mockResolvedValueOnce({ data: { id: 'history-1' } });

        await updateAttendance(req, res);

        expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
            participantId: '1',
            eventId: 'event-1',
            status: '出席',
            note: 'テスト備考'
        });
    });
});