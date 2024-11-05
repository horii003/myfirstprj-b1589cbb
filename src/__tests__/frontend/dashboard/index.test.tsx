```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import Dashboard from '@/pages/dashboard/index';
import axios from 'axios';
import { act } from 'react-dom/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockEvents = [
  {
    id: '1',
    title: 'テストイベント1',
    startDate: '2024-01-01',
    participants: 50,
    status: '開催中'
  },
  {
    id: '2', 
    title: 'テストイベント2',
    startDate: '2024-02-01',
    participants: 30,
    status: '準備中'
  }
];

const mockStats = {
  totalEvents: 2,
  totalParticipants: 80,
  activeEvents: 1,
  upcomingEvents: 1
};

const mockNotifications = [
  {
    id: 1,
    message: 'テスト通知1',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('events')) {
        return Promise.resolve({ data: mockEvents });
      }
      if (url.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      }
      if (url.includes('notifications')) {
        return Promise.resolve({ data: mockNotifications });
      }
    });
  });

  test('ダッシュボードが正しくレンダリングされること', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    expect(screen.getByText('主催者ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('開催中のイベント')).toBeInTheDocument();
    expect(screen.getByText('最近の通知')).toBeInTheDocument();
  });

  test('イベント一覧が表示されること', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('テストイベント1')).toBeInTheDocument();
      expect(screen.getByText('テストイベント2')).toBeInTheDocument();
    });
  });

  test('統計情報が表示されること', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('総イベント数: 2')).toBeInTheDocument();
      expect(screen.getByText('総参加者数: 80')).toBeInTheDocument();
    });
  });

  test('通知一覧が表示されること', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('テスト通知1')).toBeInTheDocument();
    });
  });

  test('APIエラー時のエラーメッセージ表示', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('イベントフィルター機能', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    const filterSelect = screen.getByLabelText('イベント表示');
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: 'active' } });
    });

    await waitFor(() => {
      expect(screen.queryByText('テストイベント1')).toBeInTheDocument();
      expect(screen.queryByText('テストイベント2')).not.toBeInTheDocument();
    });
  });

  test('期間選択機能', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    const periodSelect = screen.getByLabelText('期間選択');
    await act(async () => {
      fireEvent.change(periodSelect, { target: { value: 'month' } });
    });

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('period=month'));
  });

  test('更新ボタンのクリック', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    const refreshButton = screen.getByRole('button', { name: '更新' });
    await act(async () => {
      fireEvent.click(refreshButton);
    });

    expect(axios.get).toHaveBeenCalledTimes(4);
  });
});
```