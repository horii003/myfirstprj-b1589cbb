```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReminderForm from '@/pages/ReminderForm';

describe('ReminderForm', () => {
  const mockOnSubmit = jest.fn();
  const defaultSettings = {
    enabled: true,
    timing: {
      days: 1,
      hours: 0
    },
    template: {
      subject: 'イベント開催のリマインド',
      body: 'イベントの開催が近づいてきました。'
    },
    targets: ['全員']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期値なしで正しくレンダリングされる', () => {
    render(<ReminderForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('リマインドメール設定')).toBeInTheDocument();
    expect(screen.getByLabelText('有効化')).not.toBeChecked();
    expect(screen.getByLabelText('日前')).toHaveValue('1');
    expect(screen.getByLabelText('時間前')).toHaveValue('0');
    expect(screen.getByLabelText('件名')).toHaveValue('');
    expect(screen.getByLabelText('本文')).toHaveValue('');
  });

  it('初期値ありで正しくレンダリングされる', () => {
    render(<ReminderForm settings={defaultSettings} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('有効化')).toBeChecked();
    expect(screen.getByLabelText('日前')).toHaveValue('1');
    expect(screen.getByLabelText('時間前')).toHaveValue('0');
    expect(screen.getByLabelText('件名')).toHaveValue('イベント開催のリマインド');
    expect(screen.getByLabelText('本文')).toHaveValue('イベントの開催が近づいてきました。');
  });

  it('フォームの入力値が変更できる', async () => {
    render(<ReminderForm onSubmit={mockOnSubmit} />);

    const enabledCheckbox = screen.getByLabelText('有効化');
    const daysInput = screen.getByLabelText('日前');
    const hoursInput = screen.getByLabelText('時間前');
    const subjectInput = screen.getByLabelText('件名');
    const bodyInput = screen.getByLabelText('本文');

    await userEvent.click(enabledCheckbox);
    await userEvent.clear(daysInput);
    await userEvent.type(daysInput, '2');
    await userEvent.clear(hoursInput);
    await userEvent.type(hoursInput, '12');
    await userEvent.type(subjectInput, 'テストリマインド');
    await userEvent.type(bodyInput, 'テスト本文です');

    expect(enabledCheckbox).toBeChecked();
    expect(daysInput).toHaveValue('2');
    expect(hoursInput).toHaveValue('12');
    expect(subjectInput).toHaveValue('テストリマインド');
    expect(bodyInput).toHaveValue('テスト本文です');
  });

  it('バリデーションエラーが表示される', async () => {
    render(<ReminderForm onSubmit={mockOnSubmit} />);

    const daysInput = screen.getByLabelText('日前');
    const submitButton = screen.getByText('保存');

    await userEvent.clear(daysInput);
    await userEvent.type(daysInput, '-1');
    await userEvent.click(submitButton);

    expect(await screen.findByText('0以上の値を入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('フォームが正しく送信される', async () => {
    render(<ReminderForm settings={defaultSettings} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('保存');
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      enabled: true,
      timing: {
        days: 1,
        hours: 0
      },
      template: {
        subject: 'イベント開催のリマインド',
        body: 'イベントの開催が近づいてきました。'
      },
      targets: ['全員']
    });
  });

  it('送信中は送信ボタンが無効化される', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<ReminderForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('保存');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('保存中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(screen.getByText('保存')).toBeInTheDocument();
    });
  });

  it('送信に失敗するとエラーメッセージが表示される', async () => {
    mockOnSubmit.mockRejectedValue(new Error('送信に失敗しました'));
    render(<ReminderForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('保存');
    await userEvent.click(submitButton);

    expect(await screen.findByText('エラー: 送信に失敗しました')).toBeInTheDocument();
  });

  it('対象者の選択が機能する', async () => {
    render(<ReminderForm onSubmit={mockOnSubmit} />);

    const allTargetsCheckbox = screen.getByLabelText('全員');
    const unpaidTargetsCheckbox = screen.getByLabelText('未支払いの参加者');

    await userEvent.click(unpaidTargetsCheckbox);
    expect(allTargetsCheckbox).not.toBeChecked();
    expect(unpaidTargetsCheckbox).toBeChecked();

    await userEvent.click(allTargetsCheckbox);
    expect(allTargetsCheckbox).toBeChecked();
    expect(unpaidTargetsCheckbox).not.toBeChecked();
  });
});
```