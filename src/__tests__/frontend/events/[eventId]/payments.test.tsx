```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import PaymentManagementPage from '@/pages/events/[eventId]/payments';
import userEvent from '@testing-library/user-event';

// モックデータ
const mockPayments = [
  {
    id: '1',
    participantId: 'p1',
    amount: 5000,
    status: '未払い',
    dueDate: '2024-01-31',
    participantName: '山田太郎',
    ticketType: '一般チケット'
  },
  {
    id: '2', 
    participantId: 'p2',
    amount: 3000,
    status: '支払い済み',
    dueDate: '2024-01-31',
    participantName: '鈴木花子',
    ticketType: '学生チケット'
  }
];

// API モック
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: mockPayments })),
  put: jest.fn(() => Promise.resolve({ data: { success: true } }))
}));

describe('支払い管理画面', () => {
  beforeEach(() => {
    // URLパラメータのモック
    const mockParams = new URLSearchParams({ eventId: 'event123' });
    jest.spyOn(require('next/navigation'), 'useSearchParams').mockImplementation(() => mockParams);
  });

  test('支払い一覧が正しく表示される', async () => {
    render(<PaymentManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
    });
  });

  test('支払いステータスの更新が正しく動作する', async () => {
    render(<PaymentManagementPage />);
    
    await waitFor(() => {
      const statusButton = screen.getByRole('button', { name: '未払い' });
      fireEvent.click(statusButton);
    });

    const updateButton = screen.getByRole('button', { name: '支払い済みに更新' });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.axios.put).toHaveBeenCalledWith(
        '/api/events/event123/payments/1/status',
        { status: '支払い済み' }
      );
    });
  });

  test('検索フィルターが正しく動作する', async () => {
    render(<PaymentManagementPage />);

    const searchInput = screen.getByPlaceholderText('参加者名で検索');
    await userEvent.type(searchInput, '山田');

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument();
    });
  });

  test('支払いステータスでフィルタリングできる', async () => {
    render(<PaymentManagementPage />);

    const statusFilter = screen.getByRole('combobox', { name: 'ステータスフィルター' });
    fireEvent.change(statusFilter, { target: { value: '支払い済み' } });

    await waitFor(() => {
      expect(screen.queryByText('山田太郎')).not.toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
    });
  });

  test('エラー時にエラーメッセージが表示される', async () => {
    global.axios.get.mockRejectedValueOnce(new Error('データの取得に失敗しました'));
    
    render(<PaymentManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('CSV出力が正しく動作する', async () => {
    render(<PaymentManagementPage />);

    const exportButton = screen.getByRole('button', { name: 'CSV出力' });
    fireEvent.click(exportButton);

    const downloadLink = await waitFor(() => screen.getByRole('link', { name: 'ダウンロード' }));
    expect(downloadLink).toHaveAttribute('download', '支払い一覧.csv');
  });

  test('ページネーションが正しく動作する', async () => {
    render(<PaymentManagementPage />);

    const nextButton = screen.getByRole('button', { name: '次へ' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(global.axios.get).toHaveBeenCalledWith(
        '/api/events/event123/payments',
        expect.objectContaining({ params: { page: 2 } })
      );
    });
  });

  test('一括更新機能が正しく動作する', async () => {
    render(<PaymentManagementPage />);

    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const bulkUpdateButton = screen.getByRole('button', { name: '一括更新' });
    fireEvent.click(bulkUpdateButton);

    const confirmButton = screen.getByRole('button', { name: '確定' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.axios.put).toHaveBeenCalledWith(
        '/api/events/event123/payments/bulk-update',
        { paymentIds: ['1', '2'], status: '支払い済み' }
      );
    });
  });
});
```