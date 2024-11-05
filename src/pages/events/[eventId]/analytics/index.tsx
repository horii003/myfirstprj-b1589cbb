import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Topbar from '@/components/Topbar';
import { FiDownload, FiFilter, FiRefreshCw } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const router = useRouter();
  const { eventId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly'>('daily');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/events/${eventId}/analytics/stats`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupBy
        }
      });
      setAnalyticsData(response.data);
    } catch (err) {
      setError('データの取得に失敗しました');
      // サンプルデータを設定
      setAnalyticsData({
        pageViews: {
          daily: [
            { date: '2024-01-01', count: 100 },
            { date: '2024-01-02', count: 150 },
          ],
          total: 250
        },
        registrations: {
          daily: [
            { date: '2024-01-01', count: 10 },
            { date: '2024-01-02', count: 15 },
          ],
          total: 25
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchAnalyticsData();
    }
  }, [eventId, startDate, endDate, groupBy]);

  const handleExport = async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}/analytics/export`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics-data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('エクスポートに失敗しました');
    }
  };

  if (!analyticsData && !error) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="p-8">
          <div className="text-center py-12">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: analyticsData?.pageViews.daily.map((item: any) => item.date) || [],
    datasets: [
      {
        label: 'ページビュー',
        data: analyticsData?.pageViews.daily.map((item: any) => item.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: '登録数',
        data: analyticsData?.registrations.daily.map((item: any) => item.count) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">アクセス分析</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="startDate">開始日</label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={(date: Date) => setStartDate(date)}
                className="border rounded p-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="endDate">終了日</label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={(date: Date) => setEndDate(date)}
                className="border rounded p-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGroupBy('daily')}
                className={`px-4 py-2 rounded ${groupBy === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                日別
              </button>
              <button
                onClick={() => setGroupBy('weekly')}
                className={`px-4 py-2 rounded ${groupBy === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                週別
              </button>
            </div>
            <button
              onClick={handleExport}
              className="ml-auto flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              <FiDownload />
              CSVエクスポート
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">総アクセス数</h3>
              <p className="text-3xl font-bold">{analyticsData?.pageViews.total || 0}</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">総登録数</h3>
              <p className="text-3xl font-bold">{analyticsData?.registrations.total || 0}</p>
            </div>
          </div>

          {analyticsData && (analyticsData.pageViews.daily.length > 0 || analyticsData.registrations.daily.length > 0) ? (
            <div className="bg-white p-4 rounded-lg">
              <Line data={chartData} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              データが存在しません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}