```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsForm from '@/pages/SettingsForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockSettings = {
  id: '1',
  email: 'test@example.com',
  name: 'テストユーザー',
  notificationEnabled: true,
  language: 'ja',
  timezone: 'Asia/Tokyo'
};

const mockOnSubmit = jest.fn();

describe('SettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期値が正しく表示されること', () => {
    render(<SettingsForm settings={mockSettings} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('名前')).toHaveValue('テストユーザー');
    expect(screen.getByLabelText('通知を有効にする')).toBeChecked();
    expect(screen.getByLabelText('言語')).toHaveValue('ja');
    expect(screen.getByLabelText('タイムゾーン')).toHaveValue('Asia/Tokyo');
  });

  it('フォームの入力値が変更できること', async () => {
    render(<SettingsForm settings={mockSettings} onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('名前'), '新しい名前');
    await userEvent.click(screen.getByLabelText('通知を有効にする'));
    await userEvent.selectOptions(screen.getByLabelText('言語'), 'en');
    await userEvent.selectOptions(screen.getByLabelText('タイムゾーン'), 'UTC');

    expect(screen.getByLabelText('メールアドレス')).toHaveValue('new@example.com');
    expect(screen.getByLabelText('名前')).toHaveValue('新しい名前');
    expect(screen.getByLabelText('通知を有効にする')).not.toBeChecked();
    expect(screen.getByLabelText('言語')).toHaveValue('en');
    expect(screen.getByLabelText('タイムゾーン')).toHaveValue('UTC');
  });

  it('必須フィールドが空の場合にエラーが表示されること', async () => {
    render(<SettingsForm settings={mockSettings} onSubmit={mockOnSubmit} />);

    await userEvent.clear(screen.getByLabelText('メールアドレス'));
    await userEvent.clear(screen.getByLabelText('名前'));
    
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
    expect(screen.getByText('名前は必須です')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('メールアドレスの形式が不正な場合にエラーが表示されること', async () => {
    render(<SettingsForm settings={mockSettings} onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('フォームが正しく送信されること', async () => {
    render(<SettingsForm settings={mockSettings} onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('名前'), '新しい名前');
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      ...mockSettings,
      email: 'new@example.com',
      name: '新しい名前'
    });
  });

  it('リセットボタンで入力値がクリアされること', async () => {
    render(<SettingsForm settings={mockSettings} onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('名前'), '新しい名前');
    
    await userEvent.click(screen.getByRole('button', { name: 'リセット' }));

    expect(screen.getByLabelText('メールアドレス')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('名前')).toHaveValue('テストユーザー');
  });

  it('送信中は送信ボタンが無効化されること', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<SettingsForm settings={mockSettings} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('保存中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(screen.queryByText('保存中...')).not.toBeInTheDocument();
    });
  });
});
```