```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReminderPage from '@/pages/events/[eventId]/reminder';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// モック
jest.mock('next/navigation');
jest.mock('axios');
const mockRouter = useRouter as jest.Mock;

describe('ReminderPage', () => {
  const mockEventId = 'test-event-id';
  const mockEvent = {
    id: mockEventId,
    title: 'テストイベント',
    description: 'テスト用のイベントです',
    startDate: '2024-01-01',
    endDate: '2024-01-02'
  };

  const mockReminderSettings = {
    id: 'reminder-1',
    eventId: mockEventId,
    subject: 'リマインダー',
    body: 'イベント開催が近づいてきました',
    sendTiming: 24, // 24時間前
    enabled: true
  };

  beforeEach(() => {
    mockRouter.mockImplementation(() => ({
      query: { eventId: mockEventId },
      push: jest.fn()
    }));

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/events/')) {
        return Promise.resolve({ data: mockEvent });
      }
      if (url.includes('/api/reminder-settings/')) {
        return Promise.resolve({ data: mockReminderSettings });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('ページが正しくレンダリングされること', async () => {
    render(<ReminderPage />);
    
    await waitFor(() => {
      expect(screen.getByText('リマインドメール設定')).toBeInTheDocument();
    });
  });

  test('フォームに初期値が設定されること', async () => {
    render(<ReminderPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('件名')).toHaveValue(mockReminderSettings.subject);
      expect(screen.getByLabelText('本文')).toHaveValue(mockReminderSettings.body);
      expect(screen.getByLabelText('送信タイミング')).toHaveValue(mockReminderSettings.sendTiming.toString());
    });
  });

  test('フォームの送信が正しく動作すること', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(<ReminderPage />);

    await waitFor(() => {
      screen.getByLabelText('件名');
    });

    await userEvent.type(screen.getByLabelText('件名'), '新しい件名');
    await userEvent.type(screen.getByLabelText('本文'), '新しい本文');
    await userEvent.type(screen.getByLabelText('送信タイミング'), '48');

    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`/api/events/${mockEventId}/reminder`, expect.any(Object));
    });
  });

  test('テスト送信が正しく動作すること', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(<ReminderPage />);

    await waitFor(() => {
      screen.getByText('テスト送信');
    });

    fireEvent.click(screen.getByText('テスト送信'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`/api/events/${mockEventId}/reminder/test`, expect.any(Object));
      expect(screen.getByText('テストメールを送信しました')).toBeInTheDocument();
    });
  });

  test('エラー時にエラーメッセージが表示されること', async () => {
    axios.post.mockRejectedValue({ response: { data: { message: 'エラーが発生しました' } } });
    
    render(<ReminderPage />);

    await waitFor(() => {
      screen.getByText('保存');
    });

    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });

  test('無効な入力でバリデーションエラーが表示されること', async () => {
    render(<ReminderPage />);

    await waitFor(() => {
      screen.getByLabelText('件名');
    });

    await userEvent.clear(screen.getByLabelText('件名'));
    await userEvent.clear(screen.getByLabelText('本文'));
    
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText('件名は必須です')).toBeInTheDocument();
      expect(screen.getByText('本文は必須です')).toBeInTheDocument();
    });
  });
});
```