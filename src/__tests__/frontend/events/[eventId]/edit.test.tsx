```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import EventEdit from '@/pages/events/[eventId]/edit';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

// モックデータ
const mockEvent = {
  id: '1234',
  title: 'テストイベント',
  description: 'テストイベントの説明',
  startDateTime: '2024-01-01T10:00:00',
  endDateTime: '2024-01-01T17:00:00',
  venue: {
    name: 'テスト会場',
    address: '東京都渋谷区'
  },
  tickets: [
    {
      id: '1',
      name: '一般チケット',
      price: 1000,
      capacity: 100
    }
  ]
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: () => '/events/1234/edit',
  useSearchParams: () => new URLSearchParams()
}));

describe('EventEdit', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: jest.fn(),
      query: { eventId: '1234' }
    }));

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEvent)
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('イベント情報が正しく表示される', async () => {
    render(<EventEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('テストイベント')).toBeInTheDocument();
      expect(screen.getByDisplayValue('テストイベントの説明')).toBeInTheDocument();
    });
  });

  it('入力フォームの値を更新できる', async () => {
    render(<EventEdit />);

    await waitFor(() => {
      const titleInput = screen.getByLabelText('イベントタイトル') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: '更新後のタイトル' } });
      expect(titleInput.value).toBe('更新後のタイトル');
    });
  });

  it('フォーム送信時にAPIが呼ばれる', async () => {
    const mockFetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    global.fetch = mockFetch;

    render(<EventEdit />);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: '更新する' });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('バリデーションエラーが表示される', async () => {
    render(<EventEdit />);

    await waitFor(() => {
      const titleInput = screen.getByLabelText('イベントタイトル') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: '' } });
      
      const submitButton = screen.getByRole('button', { name: '更新する' });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    });
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    render(<EventEdit />);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: '更新する' });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('更新に失敗しました')).toBeInTheDocument();
    });
  });

  it('キャンセルボタンクリックで一覧画面に戻る', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
      query: { eventId: '1234' }
    }));

    render(<EventEdit />);

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/events');
  });

  it('日時入力が正しく機能する', async () => {
    render(<EventEdit />);

    await waitFor(() => {
      const startDateInput = screen.getByLabelText('開始日時') as HTMLInputElement;
      const endDateInput = screen.getByLabelText('終了日時') as HTMLInputElement;

      fireEvent.change(startDateInput, { target: { value: '2024-01-01T10:00' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-01T17:00' } });

      expect(startDateInput.value).toBe('2024-01-01T10:00');
      expect(endDateInput.value).toBe('2024-01-01T17:00');
    });
  });

  it('チケット情報の更新が正しく機能する', async () => {
    render(<EventEdit />);

    await waitFor(() => {
      const ticketNameInput = screen.getByLabelText('チケット名') as HTMLInputElement;
      const ticketPriceInput = screen.getByLabelText('価格') as HTMLInputElement;
      
      fireEvent.change(ticketNameInput, { target: { value: '更新後のチケット' } });
      fireEvent.change(ticketPriceInput, { target: { value: '2000' } });

      expect(ticketNameInput.value).toBe('更新後のチケット');
      expect(ticketPriceInput.value).toBe('2000');
    });
  });

  it('プレビューモードが正しく機能する', async () => {
    render(<EventEdit />);

    const previewButton = screen.getByRole('button', { name: 'プレビュー' });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('プレビューモード')).toBeInTheDocument();
      expect(screen.getByText('テストイベント')).toBeInTheDocument();
      expect(screen.getByText('テストイベントの説明')).toBeInTheDocument();
    });
  });

  it('フォーム送信時のローディング状態が正しく表示される', async () => {
    render(<EventEdit />);

    const submitButton = screen.getByRole('button', { name: '更新する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('更新中...')).toBeInTheDocument();
    });
  });
});
```