import { useState, useEffect } from 'react';
import { FiCalendar, FiUsers, FiActivity, FiBell, FiRefreshCw } from 'react-icons/fi';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    activeEvents: 0,
    upcomingEvents: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState('week');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_datetime', { ascending: false });

      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select('*');

      if (eventsError || registrationsError) throw new Error('データの取得に失敗しました');

      setEvents(eventsData || []);
      setStats({
        totalEvents: eventsData?.length || 0,
        totalParticipants: registrationsData?.length || 0,
        activeEvents: eventsData?.filter(e => e.status === '開催中').length || 0,
        upcomingEvents: eventsData?.filter(e => e.status === '準備中').length || 0
      });

    } catch (error) {
      setError('データの取得に失敗しました');
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const filteredEvents = events.filter(event => {
    if (filter === 'active') return event.status === '開催中';
    if (filter === 'upcoming') return event.status === '準備中';
    return true;
  });

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">主催者ダッシュボード</h1>
          <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="更新"
          >
            <FiRefreshCw className="mr-2" />
            更新
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiCalendar className="text-blue-500 text-xl mr-2" />
              <h3 className="text-gray-600">総イベント数</h3>
            </div>
            <p className="text-2xl font-bold mt-2">総イベント数: {stats.totalEvents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiUsers className="text-green-500 text-xl mr-2" />
              <h3 className="text-gray-600">総参加者数</h3>
            </div>
            <p className="text-2xl font-bold mt-2">総参加者数: {stats.totalParticipants}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiActivity className="text-yellow-500 text-xl mr-2" />
              <h3 className="text-gray-600">開催中イベント</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.activeEvents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiCalendar className="text-purple-500 text-xl mr-2" />
              <h3 className="text-gray-600">今後のイベント</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.upcomingEvents}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">開催中のイベント</h2>
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded p-2"
                aria-label="イベント表示"
              >
                <option value="all">すべて</option>
                <option value="active">開催中</option>
                <option value="upcoming">準備中</option>
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border rounded p-2"
                aria-label="期間選択"
              >
                <option value="week">1週間</option>
                <option value="month">1ヶ月</option>
                <option value="year">1年</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">イベント名</th>
                  <th className="px-4 py-2 text-left">開催日</th>
                  <th className="px-4 py-2 text-left">参加者数</th>
                  <th className="px-4 py-2 text-left">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-t">
                    <td className="px-4 py-2">{event.title}</td>
                    <td className="px-4 py-2">
                      {new Date(event.start_datetime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">50</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        event.status === '開催中' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiBell className="text-xl mr-2 text-blue-500" />
            <h2 className="text-xl font-bold">最近の通知</h2>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border-b pb-4">
                <p>{notification.message}</p>
                <span className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}