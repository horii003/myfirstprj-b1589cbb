import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { FaDownload, FaSpinner, FaChartLine, FaUser, FaCheck } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EventType {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
}

interface StatsType {
  totalRegistrations: number;
  actualAttendees: number;
  surveyResponses: number;
  satisfactionRate: number;
  registrationTrend: { date: string; count: number }[];
  participantDemographics: {
    gender: { male: number; female: number };
    age: { [key: string]: number };
  };
  error?: string;
  loading?: boolean;
}

interface ReportGeneratorProps {
  event: EventType;
  stats: StatsType;
  onExport: (options: { format: string; eventId: string }) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ event, stats, onExport }) => {
  const [surveyResponseRate, setSurveyResponseRate] = useState<number>(0);

  useEffect(() => {
    if (stats.actualAttendees > 0) {
      const rate = (stats.surveyResponses / stats.actualAttendees) * 100;
      setSurveyResponseRate(parseFloat(rate.toFixed(2)));
    }
  }, [stats.surveyResponses, stats.actualAttendees]);

  const registrationTrendData = {
    labels: stats.registrationTrend.map(item => item.date),
    datasets: [
      {
        label: '参加登録数',
        data: stats.registrationTrend.map(item => item.count),
        borderColor: '#2C5282',
        tension: 0.4,
      },
    ],
  };

  const demographicsData = {
    labels: ['男性', '女性'],
    datasets: [
      {
        data: [stats.participantDemographics.gender.male, stats.participantDemographics.gender.female],
        backgroundColor: ['#4299E1', '#ED64A6'],
      },
    ],
  };

  if (stats.loading) {
    return (
      <div className="min-h-screen h-full flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" data-testid="loading-spinner" />
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="min-h-screen h-full p-6 bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {stats.error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{event.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg font-medium">総参加登録数: {stats.totalRegistrations}名</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-lg font-medium">実際の参加者数: {stats.actualAttendees}名</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-lg font-medium">アンケート回答率: {surveyResponseRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">参加登録推移</h2>
            <div data-testid="registration-trend-chart">
              <Line data={registrationTrendData} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">参加者属性</h2>
            <div data-testid="demographics-chart">
              <Pie data={demographicsData} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">満足度: {stats.satisfactionRate}</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 rounded-full h-4"
              style={{ width: `${stats.satisfactionRate * 20}%` }}
              data-testid="satisfaction-indicator"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onExport({ format: 'pdf', eventId: event.id })}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={stats.loading || !!stats.error}
          >
            <FaDownload />
            PDFでエクスポート
          </button>
          <button
            onClick={() => onExport({ format: 'csv', eventId: event.id })}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={stats.loading || !!stats.error}
          >
            <FaDownload />
            CSVでエクスポート
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;