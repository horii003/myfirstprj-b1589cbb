```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeriesForm from '@/pages/SeriesForm';
import { jest } from '@jest/globals';

describe('SeriesForm', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
  };

  const mockSeries = {
    id: '1',
    title: 'テストシリーズ',
    description: 'テスト説明',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    frequency: 'weekly',
    eventTimes: ['10:00', '15:00'],
    maxParticipants: 100,
    price: 1000,
    location: 'オンライン',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態で必須フィールドが表示されること', () => {
    render(<SeriesForm {...defaultProps} />);

    expect(screen.getByLabelText('シリーズタイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('開始日')).toBeInTheDocument();
    expect(screen.getByLabelText('終了日')).toBeInTheDocument();
    expect(screen.getByLabelText('開催頻度')).toBeInTheDocument();
  });

  it('シリーズデータが渡された場合にフォームに値が設定されること', () => {
    render(<SeriesForm {...defaultProps} series={mockSeries} />);

    expect(screen.getByLabelText('シリーズタイトル')).toHaveValue(mockSeries.title);
    expect(screen.getByLabelText('説明')).toHaveValue(mockSeries.description);
    expect(screen.getByLabelText('開始日')).toHaveValue(mockSeries.startDate);
    expect(screen.getByLabelText('終了日')).toHaveValue(mockSeries.endDate);
    expect(screen.getByLabelText('開催頻度')).toHaveValue(mockSeries.frequency);
  });

  it('必須フィールドが未入力の場合にバリデーションエラーが表示されること', async () => {
    render(<SeriesForm {...defaultProps} />);

    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
      expect(screen.getByText('開始日は必須です')).toBeInTheDocument();
      expect(screen.getByText('終了日は必須です')).toBeInTheDocument();
    });
  });

  it('開催頻度が変更された時に時間選択フィールドが更新されること', async () => {
    render(<SeriesForm {...defaultProps} />);

    const frequencySelect = screen.getByLabelText('開催頻度');
    await userEvent.selectOptions(frequencySelect, 'daily');

    expect(screen.getByLabelText('開催時間')).toBeInTheDocument();
  });

  it('正しい入力値でフォームが送信されること', async () => {
    render(<SeriesForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('シリーズタイトル'), 'テストシリーズ');
    await userEvent.type(screen.getByLabelText('説明'), 'テスト説明');
    await userEvent.type(screen.getByLabelText('開始日'), '2024-01-01');
    await userEvent.type(screen.getByLabelText('終了日'), '2024-12-31');
    await userEvent.selectOptions(screen.getByLabelText('開催頻度'), 'weekly');
    
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'テストシリーズ',
        description: 'テスト説明',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        frequency: 'weekly',
      });
    });
  });

  it('終了日が開始日より前の場合にエラーが表示されること', async () => {
    render(<SeriesForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('開始日'), '2024-12-31');
    await userEvent.type(screen.getByLabelText('終了日'), '2024-01-01');

    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText('終了日は開始日より後の日付を選択してください')).toBeInTheDocument();
    });
  });

  it('キャンセルボタンがクリックされた時にフォームがリセットされること', async () => {
    render(<SeriesForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('シリーズタイトル'), 'テスト');
    fireEvent.click(screen.getByText('キャンセル'));

    expect(screen.getByLabelText('シリーズタイトル')).toHaveValue('');
  });

  it('最大参加者数に負の値が入力された場合にエラーが表示されること', async () => {
    render(<SeriesForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('最大参加者数'), '-10');
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText('最大参加者数は1以上の数値を入力してください')).toBeInTheDocument();
    });
  });
});
```