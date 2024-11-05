```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '@/pages/auth/register';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

const mockRegisterUser = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    registerUser: mockRegisterUser
  })
}));

describe('アカウント登録画面', () => {
  beforeEach(() => {
    mockRegisterUser.mockClear();
  });

  it('アカウント登録フォームが表示される', () => {
    render(<Register />);
    expect(screen.getByRole('heading', { name: 'アカウント登録' })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード(確認)')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '利用規約に同意する' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
  });

  it('必須項目が未入力の場合はエラーが表示される', async () => {
    render(<Register />);
    
    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワードを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('利用規約に同意してください')).toBeInTheDocument();
  });

  it('パスワードと確認用パスワードが一致しない場合はエラーが表示される', async () => {
    render(<Register />);

    const passwordInput = screen.getByLabelText('パスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード(確認)');

    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password456');

    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('パスワードが一致しません')).toBeInTheDocument();
  });

  it('登録に成功した場合はホーム画面に遷移する', async () => {
    mockRegisterUser.mockResolvedValue({ success: true });
    const { push } = jest.requireMock('next/navigation').useRouter();

    render(<Register />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.type(screen.getByLabelText('パスワード(確認)'), 'password123');
    await userEvent.click(screen.getByRole('checkbox', { name: '利用規約に同意する' }));

    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(push).toHaveBeenCalledWith('/');
    });
  });

  it('登録に失敗した場合はエラーメッセージが表示される', async () => {
    mockRegisterUser.mockRejectedValue(new Error('登録に失敗しました'));

    render(<Register />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.type(screen.getByLabelText('パスワード(確認)'), 'password123');
    await userEvent.click(screen.getByRole('checkbox', { name: '利用規約に同意する' }));

    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('登録に失敗しました')).toBeInTheDocument();
  });

  it('メールアドレスの形式が不正な場合はエラーが表示される', async () => {
    render(<Register />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
  });

  it('パスワードが8文字未満の場合はエラーが表示される', async () => {
    render(<Register />);

    await userEvent.type(screen.getByLabelText('パスワード'), 'pass');
    
    const submitButton = screen.getByRole('button', { name: '登録' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('パスワードは8文字以上で入力してください')).toBeInTheDocument();
  });
});
```