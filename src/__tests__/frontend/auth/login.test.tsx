```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Login from '@/pages/auth/login';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Login画面', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ログインフォームが表示される', () => {
    render(<Login />);
    expect(screen.getByRole('textbox', { name: /メールアドレス/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  it('バリデーションエラーが表示される', async () => {
    render(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /ログイン/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
  });

  it('ログイン成功時にダッシュボードへリダイレクトする', async () => {
    render(<Login />);

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i });
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('ログイン失敗時にエラーメッセージが表示される', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject('Login failed')
    ) as jest.Mock;

    render(<Login />);

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i });
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
  });

  it('パスワードリセットリンクが機能する', async () => {
    render(<Login />);
    
    const resetLink = screen.getByText('パスワードをお忘れの方');
    
    await act(async () => {
      fireEvent.click(resetLink);
    });

    expect(mockPush).toHaveBeenCalledWith('/auth/reset-password');
  });

  it('メールアドレスの形式バリデーションが機能する', async () => {
    render(<Login />);

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i });
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
  });

  it('パスワードの最小文字数バリデーションが機能する', async () => {
    render(<Login />);

    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('パスワードは8文字以上で入力してください')).toBeInTheDocument();
  });
});
```