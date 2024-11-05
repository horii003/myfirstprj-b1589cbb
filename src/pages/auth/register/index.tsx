import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    if (!agreed) {
      newErrors.agreed = '利用規約に同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
    } catch (error) {
      setGeneralError('登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, agreed, router]);

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-md mx-auto pt-16 pb-8 px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-center mb-8">アカウント登録</h1>

          {generalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                メールアドレス
              </label>
              <div className="relative">
                <FiMail className="absolute top-3 left-3 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                パスワード
              </label>
              <div className="relative">
                <FiLock className="absolute top-3 left-3 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                パスワード(確認)
              </label>
              <div className="relative">
                <FiLock className="absolute top-3 left-3 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="ml-2 text-sm">
                  利用規約に同意する
                </span>
              </label>
              {errors.agreed && (
                <p className="mt-1 text-sm text-red-600">{errors.agreed}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : '登録'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              こちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}