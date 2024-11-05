import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

type AnalyticsDataType = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
};

type AnalyticsChartProps = {
  data: AnalyticsDataType;
  type: string;
};

const AnalyticsChart = ({ data, type }: AnalyticsChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!chartRef.current) return;

    if (data.labels.length === 0 || data.datasets.length === 0) {
      setError('データがありません');
      return;
    }

    try {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(chartRef.current, {
        type: type as 'line' | 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'アクセス分析'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (err) {
      setError('グラフの表示に失敗しました');
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type]);

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-white rounded-lg shadow-sm p-4" data-testid="analytics-chart">
      <canvas ref={chartRef} />
    </div>
  );
};

export default AnalyticsChart;