```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/pages/RegisterForm';
import { useRouter } from 'next/navigation';

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();
  const mockRouter = useRouter();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = (error?: string) => {
    return render(
      <RegisterForm onSubmit={mockOnSubmit} error={error} />
    );
  };

  it('正しくフォームが表示される', () => {
    setup();
    
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード(確認)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
  });

  it('バリデーションエラーが表示される', async () => {
    setup();
    
    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
    });
  });

  it('パスワードの不一致エラーが表示される', async () => {
    setup();
    
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.type(screen.getByLabelText('パスワード(確認)'), 'differentpassword');
    
    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });
  });

  it('正しい値で送信される', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.type(screen.getByLabelText('パスワード(確認)'), 'password123');

    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('エラーメッセージが表示される', () => {
    const errorMessage = 'このメールアドレスは既に登録されています';
    setup(errorMessage);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('ログインページへのリンクが機能する', () => {
    setup();
    
    const loginLink = screen.getByText('ログインはこちら');
    fireEvent.click(loginLink);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('メールアドレスの形式バリデーションが機能する', async () => {
    setup();
    
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('正しいメールアドレス形式で入力してください')).toBeInTheDocument();
    });
  });

  it('パスワードの最小文字数バリデーションが機能する', async () => {
    setup();
    
    await userEvent.type(screen.getByLabelText('パスワード'), 'pass');
    
    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('パスワードは8文字以上で入力してください')).toBeInTheDocument();
    });
  });

  it('送信中は登録ボタンが無効化される', async () => {
    setup();
    
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.type(screen.getByLabelText('パスワード(確認)'), 'password123');

    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('登録中...');
  });
});
```