```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import EventCreate from '@/pages/events/create';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EventForm } from '@/components/EventForm';
import axios from 'axios';

// モック
jest.mock('@/components/Header');
jest.mock('@/components/Footer'); 
jest.mock('@/components/EventForm');
jest.mock('axios');

describe('EventCreate', () => {
  const mockUser = {
    id: '1',
    name: 'テストユーザー'
  };

  beforeEach(() => {
    (Header as jest.Mock).mockImplementation(() => <div data-testid="mock-header" />);
    (Footer as jest.Mock).mockImplementation(() => <div data-testid="mock-footer" />);
    (EventForm as jest.Mock).mockImplementation(({ onSubmit }) => (
      <form data-testid="mock-event-form" onSubmit={onSubmit}>
        <button type="submit">保存</button>
      </form>
    ));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    render(<EventCreate />);
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-event-form')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByText('イベント作成')).toBeInTheDocument();
  });

  it('フォーム送信時に正しくAPIが呼ばれること', async () => {
    const mockEventData = {
      title: 'テストイベント',
      description: 'テスト説明',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      tickets: [
        { name: '一般チケット', price: 1000 }
      ]
    };

    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: '123' }
    });

    render(<EventCreate />);

    await act(async () => {
      const form = screen.getByTestId('mock-event-form');
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/events/create', expect.any(Object));
      expect(mockNextRouter.push).toHaveBeenCalledWith('/events/123');
    });
  });

  it('APIエラー時にエラーメッセージが表示されること', async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        data: { message: 'エラーが発生しました' }
      }
    });

    render(<EventCreate />);

    await act(async () => {
      const form = screen.getByTestId('mock-event-form');
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });

  it('未ログイン時にログイン画面にリダイレクトされること', async () => {
    render(<EventCreate />);

    await waitFor(() => {
      expect(mockNextRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('プレビューモードを切り替えられること', async () => {
    render(<EventCreate />);

    const previewButton = screen.getByText('プレビュー');
    await userEvent.click(previewButton);

    expect(screen.getByTestId('preview-mode')).toBeInTheDocument();

    const editButton = screen.getByText('編集に戻る');
    await userEvent.click(editButton);

    expect(screen.queryByTestId('preview-mode')).not.toBeInTheDocument();
  });

  it('フォームの入力値が保持されること', async () => {
    render(<EventCreate />);

    const titleInput = screen.getByLabelText('イベント名');
    await userEvent.type(titleInput, 'テストイベント');

    const descInput = screen.getByLabelText('説明');
    await userEvent.type(descInput, 'テスト説明');

    expect(titleInput).toHaveValue('テストイベント');
    expect(descInput).toHaveValue('テスト説明');
  });

  it('必須項目が未入力の場合にバリデーションエラーが表示されること', async () => {
    render(<EventCreate />);

    const submitButton = screen.getByText('保存');
    await userEvent.click(submitButton);

    expect(screen.getByText('イベント名は必須です')).toBeInTheDocument();
    expect(screen.getByText('開催日時は必須です')).toBeInTheDocument();
  });
});
```