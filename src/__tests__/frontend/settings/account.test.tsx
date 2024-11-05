```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import AccountSettings from '@/pages/settings/account';
import { jest } from '@jest/globals';

// モックの設定
const mockAxios = {
  get: jest.fn(),
  put: jest.fn()
};

jest.mock('axios', () => mockAxios);

const mockUserData = {
  id: '1',
  name: 'テストユーザー',
  email: 'test@example.com',
  notification: {
    email: true,
    push: false
  },
  apiKey: 'test-api-key'
};

describe('AccountSettings', () => {
  beforeEach(() => {
    mockAxios.get.mockResolvedValue({ data: mockUserData });
    mockAxios.put.mockResolvedValue({ data: mockUserData });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('初期表示時にユーザーデータを取得して表示する', async () => {
    await act(async () => {
      render(<AccountSettings />);
    });

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('テストユーザー')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('プロフィール情報を更新できる', async () => {
    await act(async () => {
      render(<AccountSettings />);
    });

    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '新しい名前');

    const submitButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: '新しい名前'
        })
      );
    });
  });

  it('通知設定を切り替えられる', async () => {
    await act(async () => {
      render(<AccountSettings />);
    });

    const emailToggle = screen.getByRole('checkbox', { name: 'メール通知' });
    const pushToggle = screen.getByRole('checkbox', { name: 'プッシュ通知' });

    await userEvent.click(emailToggle);
    await userEvent.click(pushToggle);

    const submitButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          notification: {
            email: false,
            push: true
          }
        })
      );
    });
  });

  it('APIキーを再生成できる', async () => {
    await act(async () => {
      render(<AccountSettings />);
    });

    const regenerateButton = screen.getByRole('button', { name: 'APIキーの再生成' });
    await userEvent.click(regenerateButton);

    const confirmButton = screen.getByRole('button', { name: '確認' });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          apiKey: expect.any(String)
        })
      );
    });
  });

  it('エラー時にエラーメッセージを表示する', async () => {
    mockAxios.put.mockRejectedValueOnce(new Error('更新に失敗しました'));

    await act(async () => {
      render(<AccountSettings />);
    });

    const submitButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('更新に失敗しました')).toBeInTheDocument();
    });
  });

  it('必須項目が未入力の場合にバリデーションエラーを表示する', async () => {
    await act(async () => {
      render(<AccountSettings />);
    });

    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    await userEvent.clear(nameInput);

    const submitButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(submitButton);

    expect(screen.getByText('名前は必須項目です')).toBeInTheDocument();
    expect(mockAxios.put).not.toHaveBeenCalled();
  });

  it('メールアドレスの形式チェックを行う', async () => {
    await act(async () => {
      render(<AccountSettings />);
    });

    const emailInput = screen.getByLabelText('メールアドレス') as HTMLInputElement;
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, '不正なメールアドレス');

    const submitButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(submitButton);

    expect(screen.getByText('正しいメールアドレスを入力してください')).toBeInTheDocument();
    expect(mockAxios.put).not.toHaveBeenCalled();
  });

  it('データ読み込み中はローディング表示をする', async () => {
    mockAxios.get.mockImplementationOnce(() => new Promise(() => {}));

    render(<AccountSettings />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
```