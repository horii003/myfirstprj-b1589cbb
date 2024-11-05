import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import loginHandler from '@/pages/api/auth/login';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('ログインAPI', () => {
  const mockSignIn = jest.fn();
  const mockSupabase = {
    auth: {
      signInWithPassword: mockSignIn
    }
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockImplementation(() => mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正常なログインリクエストを処理できる', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com'
    };

    mockSignIn.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      user: mockUser,
      message: 'ログインに成功しました'
    });
  });

  it('メールアドレスが未入力の場合エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        email: '',
        password: 'password123'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'メールアドレスは必須です'
    });
  });

  it('パスワードが未入力の場合エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: ''
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'パスワードは必須です'
    });
  });

  it('認証エラーの場合適切なエラーメッセージを返す', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid login credentials' }
    });

    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'メールアドレスまたはパスワードが間違っています'
    });
  });

  it('POSTメソッド以外のリクエストを拒否する', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET'
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('不正なメールアドレス形式の場合エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: 'password123'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '有効なメールアドレスを入力してください'
    });
  });

  it('パスワードが最小文字数未満の場合エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: '123'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'パスワードは8文字以上で入力してください'
    });
  });

  it('Supabaseエラー発生時に適切なエラーレスポンスを返す', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Database connection error'));

    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'サーバーエラーが発生しました'
    });
  });

  it('リクエストボディが不正な場合エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: null
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '不正なリクエストです'
    });
  });
});