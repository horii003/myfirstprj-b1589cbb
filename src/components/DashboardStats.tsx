import React from 'react';
import { Line } from 'react-chartjs-2';
import { FaUsers, FaCalendarAlt, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type StatsType = {
  totalEvents: number;
  totalParticipants: number;
  activeEvents: number;
  todayEvents: number;
  monthlyRegistrations: {
    month: string;
    count: number;
  }[];
  attendanceRate: number;
  ticketSales: {
    totalAmount: number;
    monthlyAmount: number;
  };
};

const DashboardStats: React.FC<{ stats: StatsType }> = ({ stats }) => {
  const hasData = stats.totalEvents > 0 || stats.totalParticipants > 0;

  const chartData = {
    labels: stats.monthlyRegistrations.map(item => item.month),
    datasets: [
      {
        label: '月次登録数',
        data: stats.monthlyRegistrations.map(item => item.count),
        borderColor: '#4299E1',
        backgroundColor: 'rgba(66, 153, 225, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '月次登録推移',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!hasData) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">総イベント数</p>
              <p className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</p>
            </div>
            <FaCalendarAlt className="text-3xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">総参加者数</p>
              <p className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
            </div>
            <FaUsers className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">開催中のイベント</p>
              <p className="text-2xl font-bold">{stats.activeEvents}</p>
            </div>
            <FaChartLine className="text-3xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">本日のイベント</p>
              <p className="text-2xl font-bold">{stats.todayEvents}</p>
            </div>
            <FaCalendarAlt className="text-3xl text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">出席率</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.attendanceRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">総売上</h3>
          <p className="text-3xl font-bold text-green-600">
            ¥{stats.ticketSales.totalAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">今月の売上</h3>
          <p className="text-3xl font-bold text-purple-600">
            ¥{stats.ticketSales.monthlyAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-[300px]" role="img" aria-label="月次登録推移">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;