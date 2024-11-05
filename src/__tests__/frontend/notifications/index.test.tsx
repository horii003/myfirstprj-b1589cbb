```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationsPage from '@/pages/notifications/index';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// モックの通知データ
const mockNotifications = [
  {
    id: '1',
    title: 'イベント開催のお知らせ',
    message: 'イベントが開催されます',
    isRead: false,
    createdAt: '2024-01-01T00:00:00Z',
    type: 'event'
  },
  {
    id: '2', 
    title: 'システムメンテナンス',
    message: 'システムメンテナンスを実施します',
    isRead: true,
    createdAt: '2024-01-02T00:00:00Z',
    type: 'system'
  }
];

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('通知一覧画面', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockNotifications });
    mockedAxios.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('通知一覧を表示する', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('イベント開催のお知らせ')).toBeInTheDocument();
      expect(screen.getByText('システムメンテナンス')).toBeInTheDocument();
    });
  });

  it('通知を既読にできる', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      const unreadNotification = screen.getByText('イベント開催のお知らせ');
      fireEvent.click(unreadNotification);
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/notifications/1/read');
    });
  });

  it('通知をフィルタリングできる', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      const filterSelect = screen.getByLabelText('通知タイプ');
      fireEvent.change(filterSelect, { target: { value: 'event' } });
    });

    await waitFor(() => {
      expect(screen.getByText('イベント開催のお知らせ')).toBeInTheDocument();
      expect(screen.queryByText('システムメンテナンス')).not.toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージを表示する', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('データの取得に失敗しました'));
    
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('通知の取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('全件既読機能が動作する', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      const markAllReadButton = screen.getByText('全て既読にする');
      fireEvent.click(markAllReadButton);
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/notifications/read-all');
    });
  });

  it('通知を日付順にソートできる', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      const sortSelect = screen.getByLabelText('並び替え');
      fireEvent.change(sortSelect, { target: { value: 'date-desc' } });
    });

    const notifications = screen.getAllByTestId('notification-item');
    expect(notifications[0]).toHaveTextContent('システムメンテナンス');
    expect(notifications[1]).toHaveTextContent('イベント開催のお知らせ');
  });

  it('通知の詳細を表示できる', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      const notification = screen.getByText('イベント開催のお知らせ');
      fireEvent.click(notification);
    });

    expect(screen.getByText('イベントが開催されます')).toBeInTheDocument();
  });
});
```