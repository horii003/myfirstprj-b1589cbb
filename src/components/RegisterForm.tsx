import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

interface RegisterFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!email) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = '正しいメールアドレス形式で入力してください';
    }

    if (!password) {
      errors.password = 'パスワードを入力してください';
    } else if (password.length < 8) {
      errors.password = 'パスワードは8文字以上で入力してください';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">アカウント登録</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-600">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <div className="mt-1 relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <FiMail className="absolute right-3 top-3 text-gray-400" />
          </div>
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <FiLock className="absolute right-3 top-3 text-gray-400" />
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            パスワード(確認)
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <FiLock className="absolute right-3 top-3 text-gray-400" />
          </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '登録中...' : '登録'}
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-600">既にアカウントをお持ちですか？</span>{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            ログインはこちら
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;