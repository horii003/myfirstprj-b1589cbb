```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/pages/LoginForm';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation');

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn()
    });
  });

  it('必須フィールドが空の場合にエラーメッセージを表示する', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワードを入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('不正なメールアドレス形式の場合にエラーメッセージを表示する', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('正しいメールアドレスの形式で入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('パスワードが8文字未満の場合にエラーメッセージを表示する', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'pass');
    
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('パスワードは8文字以上で入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('エラープロパティが渡された場合にエラーメッセージを表示する', () => {
    const errorMessage = '認証に失敗しました';
    render(<LoginForm onSubmit={mockOnSubmit} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('有効な入力の場合にonSubmitが呼ばれる', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('パスワード表示/非表示の切り替えが機能する', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText('パスワード');
    const toggleButton = screen.getByRole('button', { name: 'パスワードを表示' });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('入力フィールドのフォーカス時にエラーメッセージがクリアされる', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    const emailError = await screen.findByText('メールアドレスを入力してください');
    const emailInput = screen.getByLabelText('メールアドレス');
    
    fireEvent.focus(emailInput);
    expect(emailError).not.toBeInTheDocument();
  });

  it('フォーム送信中はボタンが無効化される', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('送信中...');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('ログイン');
    });
  });
});
```