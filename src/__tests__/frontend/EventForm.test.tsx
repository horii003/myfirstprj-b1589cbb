```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventForm from '@/pages/EventForm';
import { useRouter } from 'next/navigation';
import { act } from 'react-dom/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('EventForm', () => {
  const mockOnSubmit = jest.fn();
  const mockEvent = {
    id: '1',
    title: 'テストイベント',
    description: 'テストの説明',
    eventType: 'オンライン',
    startDatetime: '2024-01-01T10:00',
    endDatetime: '2024-01-01T12:00',
    venue: {
      name: 'オンライン会場',
      address: '',
      capacity: 100
    },
    registrationStart: '2023-12-01T10:00',
    registrationEnd: '2023-12-31T23:59',
    status: '下書き'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('新規作成モードで必須フィールドが表示されること', () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('イベントタイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('イベント形式')).toBeInTheDocument();
    expect(screen.getByLabelText('開始日時')).toBeInTheDocument();
    expect(screen.getByLabelText('終了日時')).toBeInTheDocument();
    expect(screen.getByLabelText('会場名')).toBeInTheDocument();
    expect(screen.getByLabelText('募集開始日時')).toBeInTheDocument();
    expect(screen.getByLabelText('募集終了日時')).toBeInTheDocument();
  });

  it('編集モードで既存のイベント情報が表示されること', () => {
    render(<EventForm event={mockEvent} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('イベントタイトル')).toHaveValue('テストイベント');
    expect(screen.getByLabelText('説明')).toHaveValue('テストの説明');
    expect(screen.getByLabelText('イベント形式')).toHaveValue('オンライン');
    expect(screen.getByLabelText('会場名')).toHaveValue('オンライン会場');
  });

  it('必須フィールドが未入力の場合にバリデーションエラーが表示されること', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: '保存' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    expect(screen.getByText('開始日時は必須です')).toBeInTheDocument();
    expect(screen.getByText('終了日時は必須です')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('正常に入力された場合にonSubmitが呼ばれること', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      await userEvent.type(screen.getByLabelText('イベントタイトル'), 'テストイベント');
      await userEvent.type(screen.getByLabelText('説明'), 'テストの説明');
      await userEvent.selectOptions(screen.getByLabelText('イベント形式'), 'オンライン');
      await userEvent.type(screen.getByLabelText('開始日時'), '2024-01-01T10:00');
      await userEvent.type(screen.getByLabelText('終了日時'), '2024-01-01T12:00');
      await userEvent.type(screen.getByLabelText('会場名'), 'オンライン会場');
      await userEvent.type(screen.getByLabelText('募集開始日時'), '2023-12-01T10:00');
      await userEvent.type(screen.getByLabelText('募集終了日時'), '2023-12-31T23:59');
    });

    const submitButton = screen.getByRole('button', { name: '保存' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'テストイベント',
        description: 'テストの説明', 
        eventType: 'オンライン',
        startDatetime: '2024-01-01T10:00',
        endDatetime: '2024-01-01T12:00',
        venue: {
          name: 'オンライン会場',
          address: '',
          capacity: null
        },
        registrationStart: '2023-12-01T10:00',
        registrationEnd: '2023-12-31T23:59',
        status: '下書き'
      });
    });
  });

  it('キャンセルボタンクリック時に前の画面に戻ること', async () => {
    const mockRouter = { back: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<EventForm onSubmit={mockOnSubmit} />);
    
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('日時の前後関係のバリデーションが機能すること', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      await userEvent.type(screen.getByLabelText('開始日時'), '2024-01-01T12:00');
      await userEvent.type(screen.getByLabelText('終了日時'), '2024-01-01T10:00');
    });

    const submitButton = screen.getByRole('button', { name: '保存' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('終了日時は開始日時より後に設定してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('募集期間の前後関係のバリデーションが機能すること', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      await userEvent.type(screen.getByLabelText('募集開始日時'), '2024-01-01T10:00');
      await userEvent.type(screen.getByLabelText('募集終了日時'), '2023-12-31T23:59');
    });

    const submitButton = screen.getByRole('button', { name: '保存' });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('募集終了日時は募集開始日時より後に設定してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```