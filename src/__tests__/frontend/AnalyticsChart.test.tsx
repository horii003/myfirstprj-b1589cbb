```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useEffect, useRef, useState } from 'react';
import AnalyticsChart from '@/pages/AnalyticsChart';
import Chart from 'chart.js/auto';

// モック
jest.mock('chart.js/auto');

// テストデータ
const mockData = {
  labels: ['1月', '2月', '3月'],
  datasets: [
    {
      label: 'アクセス数',
      data: [100, 200, 300],
      backgroundColor: '#4299E1',
      borderColor: '#2C5282'
    }
  ]
};

describe('AnalyticsChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    render(<AnalyticsChart data={mockData} type="line" />);
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('line typeで正しくチャートが描画されること', () => {
    render(<AnalyticsChart data={mockData} type="line" />);
    expect(Chart).toHaveBeenCalledWith(expect.any(Object), {
      type: 'line',
      data: mockData,
      options: expect.any(Object)
    });
  });

  it('bar typeで正しくチャートが描画されること', () => {
    render(<AnalyticsChart data={mockData} type="bar" />);
    expect(Chart).toHaveBeenCalledWith(expect.any(Object), {
      type: 'bar', 
      data: mockData,
      options: expect.any(Object)
    });
  });

  it('データが更新された時にチャートが更新されること', async () => {
    const { rerender } = render(<AnalyticsChart data={mockData} type="line" />);
    
    const newData = {
      ...mockData,
      datasets: [{
        ...mockData.datasets[0],
        data: [150, 250, 350]
      }]
    };

    rerender(<AnalyticsChart data={newData} type="line" />);

    expect(Chart).toHaveBeenCalledTimes(2);
  });

  it('チャートタイプが変更された時にチャートが更新されること', () => {
    const { rerender } = render(<AnalyticsChart data={mockData} type="line" />);
    rerender(<AnalyticsChart data={mockData} type="bar" />);
    
    expect(Chart).toHaveBeenCalledTimes(2);
  });

  it('エラー時にエラーメッセージが表示されること', () => {
    (Chart as jest.Mock).mockImplementationOnce(() => {
      throw new Error('チャートの描画に失敗しました');
    });

    render(<AnalyticsChart data={mockData} type="line" />);
    expect(screen.getByText('グラフの表示に失敗しました')).toBeInTheDocument();
  });

  it('データが空の場合に適切なメッセージが表示されること', () => {
    const emptyData = {
      labels: [],
      datasets: []
    };
    
    render(<AnalyticsChart data={emptyData} type="line" />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });

  it('コンポーネントのアンマウント時にチャートが破棄されること', () => {
    const mockDestroy = jest.fn();
    (Chart as jest.Mock).mockImplementation(() => ({
      destroy: mockDestroy
    }));

    const { unmount } = render(<AnalyticsChart data={mockData} type="line" />);
    unmount();

    expect(mockDestroy).toHaveBeenCalled();
  });
});
```