import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { FiBell, FiCheck, FiFilter, FiCalendar } from 'react-icons/fi';
import { supabase } from '@/supabase';

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'event' | 'system';
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('date-desc');
  const [error, setError] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*');

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      setError('通知の取得に失敗しました');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ isRead: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (error) {
      setError('既読の更新に失敗しました');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ isRead: true })
        .in('id', notifications.map(n => n.id));

      if (error) throw error;

      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })));
    } catch (error) {
      setError('一括既読の更新に失敗しました');
    }
  };

  const filteredNotifications = notifications
    .filter(notification => filter === 'all' || notification.type === filter)
    .sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiBell className="mr-2" />
              通知一覧
            </h1>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              全て既読にする
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <select
              aria-label="通知タイプ"
              className="border rounded p-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">全て</option>
              <option value="event">イベント</option>
              <option value="system">システム</option>
            </select>

            <select
              aria-label="並び替え"
              className="border rounded p-2"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="date-desc">新しい順</option>
              <option value="date-asc">古い順</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                data-testid="notification-item"
                className={`p-4 rounded-lg border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
                onClick={() => {
                  setSelectedNotification(notification);
                  markAsRead(notification.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{notification.title}</h3>
                  <div className="flex items-center space-x-2">
                    {notification.isRead ? (
                      <FiCheck className="text-green-500" />
                    ) : (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {selectedNotification?.id === notification.id && (
                  <p className="mt-2 text-gray-600">{notification.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}