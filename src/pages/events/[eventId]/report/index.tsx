import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiDownload, FiPieChart, FiDollarSign, FiUsers } from 'react-icons/fi';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function EventReport() {
  const router = useRouter();
  const { eventId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReports, setSelectedReports] = useState({
    participants: true,
    survey: true,
    financial: true,
  });

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const { data: statsData, error: statsError } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (statsError) throw statsError;

      setEvent(eventData);
      setStats({
        totalParticipants: 100,
        attendanceRate: 0.85,
        satisfaction: 4.2,
        revenue: 500000,
        costs: 300000,
      });
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // PDFエクスポート処理
    console.log('エクスポート実行');
  };

  if (loading) return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="flex justify-center items-center h-full">
        <p>読み込み中...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="flex justify-center items-center h-full">
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">イベントレポート</h1>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2">開始日</label>
              <input
                type="date"
                aria-label="開始日"
                className="w-full border rounded p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2">終了日</label>
              <input
                type="date"
                aria-label="終了日"
                className="w-full border rounded p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">レポート項目</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedReports.participants}
                  onChange={(e) => setSelectedReports({...selectedReports, participants: e.target.checked})}
                />
                <span className="ml-2">参加者統計</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedReports.survey}
                  onChange={(e) => setSelectedReports({...selectedReports, survey: e.target.checked})}
                />
                <span className="ml-2">アンケート結果</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedReports.financial}
                  onChange={(e) => setSelectedReports({...selectedReports, financial: e.target.checked})}
                />
                <span className="ml-2">収支報告</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            レポート出力
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FiUsers className="text-blue-600 text-xl mr-2" />
                <h2 className="text-lg font-semibold">参加者統計</h2>
              </div>
              <p>総参加者数: {stats.totalParticipants}名</p>
              <p>参加率: {(stats.attendanceRate * 100).toFixed(1)}%</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FiPieChart className="text-blue-600 text-xl mr-2" />
                <h2 className="text-lg font-semibold">アンケート結果</h2>
              </div>
              <p>満足度: {stats.satisfaction}/5.0</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FiDollarSign className="text-blue-600 text-xl mr-2" />
                <h2 className="text-lg font-semibold">収支報告</h2>
              </div>
              <p>収入: ¥{stats.revenue.toLocaleString()}</p>
              <p>支出: ¥{stats.costs.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}