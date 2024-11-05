```typescript
import { render, screen } from '@testing-library/react';
import DashboardStats from '@/pages/DashboardStats';

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
}

describe('DashboardStats', () => {
  const mockStats: StatsType = {
    totalEvents: 100,
    totalParticipants: 1500,
    activeEvents: 10,
    todayEvents: 3,
    monthlyRegistrations: [
      { month: '2024-01', count: 250 },
      { month: '2024-02', count: 300 }
    ],
    attendanceRate: 85.5,
    ticketSales: {
      totalAmount: 1500000,
      monthlyAmount: 250000
    }
  };

  it('すべての統計情報が正しく表示されること', () => {
    render(<DashboardStats stats={mockStats} />);
    
    expect(screen.getByText('総イベント数')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    
    expect(screen.getByText('総参加者数')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
    
    expect(screen.getByText('開催中のイベント')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    expect(screen.getByText('本日のイベント')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('出席率が正しくフォーマットされて表示されること', () => {
    render(<DashboardStats stats={mockStats} />);
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('売上金額が正しくフォーマットされて表示されること', () => {
    render(<DashboardStats stats={mockStats} />);
    expect(screen.getByText('¥1,500,000')).toBeInTheDocument();
    expect(screen.getByText('¥250,000')).toBeInTheDocument();
  });

  it('月次登録数のグラフが表示されること', () => {
    render(<DashboardStats stats={mockStats} />);
    const chartElement = screen.getByRole('img', { name: '月次登録推移' });
    expect(chartElement).toBeInTheDocument();
  });

  it('統計情報が存在しない場合にプレースホルダーが表示されること', () => {
    const emptyStats: StatsType = {
      totalEvents: 0,
      totalParticipants: 0,
      activeEvents: 0,
      todayEvents: 0,
      monthlyRegistrations: [],
      attendanceRate: 0,
      ticketSales: {
        totalAmount: 0,
        monthlyAmount: 0
      }
    };

    render(<DashboardStats stats={emptyStats} />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });
});
```