import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';

interface LoginRequest {
  email: string;
  password: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as LoginRequest;

    if (!body) {
      return res.status(400).json({ error: '不正なリクエストです' });
    }

    const { email, password } = body;

    // 入力値のバリデーション
    if (!email) {
      return res.status(400).json({ error: 'メールアドレスは必須です' });
    }

    if (!password) {
      return res.status(400).json({ error: 'パスワードは必須です' });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '有効なメールアドレスを入力してください' });
    }

    // パスワードの長さチェック
    if (password.length < 8) {
      return res.status(400).json({ error: 'パスワードは8文字以上で入力してください' });
    }

    // Supabaseでの認証
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが間違っています' });
    }

    return res.status(200).json({
      user: data.user,
      message: 'ログインに成功しました'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}