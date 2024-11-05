import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { IoMdSettings, IoMdNotifications, IoMdKey } from 'react-icons/io';
import { toast } from 'react-hot-toast';

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    email: '',
    notification: {
      email: true,
      push: false
    },
    apiKey: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .single();

      if (error) throw error;

      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser({
        name: 'テストユーザー',
        email: 'test@example.com',
        notification: {
          email: true,
          push: false
        },
        apiKey: 'test-api-key'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '' };

    if (!user.name) {
      newErrors.name = '名前は必須項目です';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(user)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('設定を保存しました');
    } catch (error) {
      toast.error('更新に失敗しました');
    }
  };

  const regenerateApiKey = async () => {
    if (confirm('APIキーを再生成しますか？')) {
      try {
        const newApiKey = Math.random().toString(36).substring(2);
        const { error } = await supabase
          .from('users')
          .update({ apiKey: newApiKey })
          .eq('id', user.id);

        if (error) throw error;

        setUser({ ...user, apiKey: newApiKey });
        toast.success('APIキーを再生成しました');
      } catch (error) {
        toast.error('APIキーの再生成に失敗しました');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">アカウント設定</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <IoMdSettings className="mr-2" />
              プロフィール設定
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  名前
                </label>
                <input
                  id="name"
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  aria-label="名前"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  aria-label="メールアドレス"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <IoMdNotifications className="mr-2" />
              通知設定
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="emailNotification" className="text-sm font-medium text-gray-700">
                  メール通知
                </label>
                <input
                  id="emailNotification"
                  type="checkbox"
                  checked={user.notification.email}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      notification: { ...user.notification, email: e.target.checked }
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                  aria-label="メール通知"
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="pushNotification" className="text-sm font-medium text-gray-700">
                  プッシュ通知
                </label>
                <input
                  id="pushNotification"
                  type="checkbox"
                  checked={user.notification.push}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      notification: { ...user.notification, push: e.target.checked }
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                  aria-label="プッシュ通知"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <IoMdKey className="mr-2" />
              API設定
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">APIキー</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={user.apiKey}
                    readOnly
                    className="block w-full rounded-l-md border-gray-300 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={regenerateApiKey}
                    className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    APIキーの再生成
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}