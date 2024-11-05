```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateSeriesPage from '@/pages/events/series/create';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// モック
jest.mock('next/navigation');
jest.mock('axios');

const mockRouter = {
  push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('シリーズイベント作成画面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('シリーズイベント作成フォームが表示される', () => {
    render(<CreateSeriesPage />);
    
    expect(screen.getByText('シリーズイベント作成')).toBeInTheDocument();
    expect(screen.getByLabelText('シリーズタイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByText('回数設定')).toBeInTheDocument();
  });

  it('必須項目が未入力の場合にエラーメッセージを表示', async () => {
    render(<CreateSeriesPage />);
    
    const submitButton = screen.getByRole('button', { name: '作成する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
      expect(screen.getByText('最低1回のイベントを設定してください')).toBeInTheDocument();
    });
  });

  it('正常に送信できる場合、APIが呼び出される', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: 'series-1' }
    });

    render(<CreateSeriesPage />);

    await userEvent.type(screen.getByLabelText('シリーズタイトル'), 'テストシリーズ');
    await userEvent.type(screen.getByLabelText('説明'), 'シリーズの説明文');
    
    // イベント追加ボタンクリック
    const addButton = screen.getByText('イベントを追加');
    fireEvent.click(addButton);

    // 日時入力
    await userEvent.type(screen.getByLabelText('開催日時'), '2024-01-01T10:00');
    
    const submitButton = screen.getByRole('button', { name: '作成する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/series', {
        title: 'テストシリーズ',
        description: 'シリーズの説明文',
        events: [
          {
            startDateTime: '2024-01-01T10:00',
          }
        ]
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/events/series/series-1');
    });
  });

  it('APIエラー時にエラーメッセージを表示', async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: 'サーバーエラーが発生しました'
        }
      }
    });

    render(<CreateSeriesPage />);

    await userEvent.type(screen.getByLabelText('シリーズタイトル'), 'テストシリーズ');
    const addButton = screen.getByText('イベントを追加');
    fireEvent.click(addButton);
    await userEvent.type(screen.getByLabelText('開催日時'), '2024-01-01T10:00');

    const submitButton = screen.getByRole('button', { name: '作成する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument();
    });
  });

  it('イベントの追加と削除が正しく動作する', async () => {
    render(<CreateSeriesPage />);

    const addButton = screen.getByText('イベントを追加');
    
    // 1回目の追加
    fireEvent.click(addButton);
    expect(screen.getAllByLabelText('開催日時')).toHaveLength(1);

    // 2回目の追加 
    fireEvent.click(addButton);
    expect(screen.getAllByLabelText('開催日時')).toHaveLength(2);

    // 削除
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getAllByLabelText('開催日時')).toHaveLength(1);
  });

  it('キャンセルボタンクリックで一覧画面に戻る', () => {
    render(<CreateSeriesPage />);

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/events/series');
  });

  it('入力内容の一時保存と復元が動作する', async () => {
    render(<CreateSeriesPage />);

    await userEvent.type(screen.getByLabelText('シリーズタイトル'), 'テストシリーズ');
    
    // 一時保存
    const saveButton = screen.getByText('下書き保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('下書きを保存しました')).toBeInTheDocument();
    });

    // 再レンダリング
    render(<CreateSeriesPage />);

    expect(screen.getByLabelText('シリーズタイトル')).toHaveValue('テストシリーズ');
  });
});
```