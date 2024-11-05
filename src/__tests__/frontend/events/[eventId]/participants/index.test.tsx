```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ParticipantListPage from '@/pages/events/[eventId]/participants/index';
import { useRouter } from 'next/navigation';

// モックデータ
const mockParticipants = [
  {
    id: '1',
    name: 'テスト太郎',
    email: 'test1@example.com',
    ticketType: '一般',
    status: '参加確定',
    registeredAt: '2024-01-01T10:00:00'
  },
  {
    id: '2', 
    name: 'テスト花子',
    email: 'test2@example.com',
    ticketType: '学生',
    status: 'キャンセル',
    registeredAt: '2024-01-02T11:00:00'
  }
];

const mockEventData = {
  id: 'event-1',
  title: 'テストイベント',
  date: '2024-01-15'
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// APIコールのモック
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('ParticipantListPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: jest.fn(),
      query: { eventId: 'event-1' }
    }));
    
    global.axios.get.mockImplementation((url) => {
      if(url.includes('/api/events/event-1/participants')) {
        return Promise.resolve({ data: { participants: mockParticipants } });
      }
      if(url.includes('/api/events/event-1')) {
        return Promise.resolve({ data: mockEventData });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('参加者一覧が正しく表示される', async () => {
    render(<ParticipantListPage />);

    await waitFor(() => {
      expect(screen.getByText('テスト太郎')).toBeInTheDocument();
      expect(screen.getByText('テスト花子')).toBeInTheDocument();
    });
  });

  it('検索フィルターが機能する', async () => {
    render(<ParticipantListPage />);

    const searchInput = screen.getByPlaceholderText('参加者を検索');
    fireEvent.change(searchInput, { target: { value: '太郎' } });

    await waitFor(() => {
      expect(screen.getByText('テスト太郎')).toBeInTheDocument();
      expect(screen.queryByText('テスト花子')).not.toBeInTheDocument();
    });
  });

  it('CSVエクスポートボタンが機能する', async () => {
    render(<ParticipantListPage />);

    const exportButton = screen.getByText('CSVエクスポート');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.axios.post).toHaveBeenCalledWith(
        '/api/events/event-1/participants/export',
        expect.any(Object)
      );
    });
  });

  it('リマインドメール送信ボタンが機能する', async () => {
    render(<ParticipantListPage />);

    const sendMailButton = screen.getByText('リマインドメール送信');
    fireEvent.click(sendMailButton);

    await waitFor(() => {
      expect(global.mockNextRouter.push).toHaveBeenCalledWith(
        '/events/event-1/mail/reminder'
      );
    });
  });

  it('参加者ステータスの一括更新が機能する', async () => {
    render(<ParticipantListPage />);

    // 参加者選択
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const bulkActionButton = screen.getByText('一括操作');
    fireEvent.click(bulkActionButton);

    const updateStatusButton = screen.getByText('ステータス更新');
    fireEvent.click(updateStatusButton);

    await waitFor(() => {
      expect(global.axios.post).toHaveBeenCalledWith(
        '/api/events/event-1/participants/bulk-update',
        expect.any(Object)
      );
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    global.axios.get.mockRejectedValueOnce(new Error('データ取得に失敗しました'));
    
    render(<ParticipantListPage />);

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });

  it('ローディング状態が表示される', () => {
    render(<ParticipantListPage />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('参加者が0人の場合に適切なメッセージが表示される', async () => {
    global.axios.get.mockImplementationOnce(() => 
      Promise.resolve({ data: { participants: [] } })
    );

    render(<ParticipantListPage />);

    await waitFor(() => {
      expect(screen.getByText('参加者がいません')).toBeInTheDocument();
    });
  });

  it('参加者詳細画面へ遷移できる', async () => {
    render(<ParticipantListPage />);

    await waitFor(() => {
      const participantRow = screen.getByText('テスト太郎').closest('tr');
      fireEvent.click(participantRow!);
    });

    expect(global.mockNextRouter.push).toHaveBeenCalledWith(
      '/events/event-1/participants/1'
    );
  });
});
```