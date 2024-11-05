```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import PaymentList from '@/pages/PaymentList';

const mockPayments = [
  {
    id: '1',
    amount: 5000,
    status: '未払い',
    dueDate: '2024-02-01',
    participantName: '山田太郎',
    eventTitle: 'テストイベント1'
  },
  {
    id: '2', 
    amount: 3000,
    status: '支払い済み',
    dueDate: '2024-02-15',
    participantName: '鈴木花子',
    eventTitle: 'テストイベント2'
  }
];

const mockOnStatusUpdate = jest.fn();

describe('PaymentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('支払い情報一覧が正しく表示される', () => {
    render(<PaymentList payments={mockPayments} onStatusUpdate={mockOnStatusUpdate} />);
    
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('鈴木花子')).toBeInTheDocument();
    expect(screen.getByText('¥5,000')).toBeInTheDocument();
    expect(screen.getByText('¥3,000')).toBeInTheDocument();
  });

  it('ステータス更新ボタンが機能する', async () => {
    render(<PaymentList payments={mockPayments} onStatusUpdate={mockOnStatusUpdate} />);
    
    const statusButtons = screen.getAllByRole('button', { name: 'ステータス変更' });
    fireEvent.click(statusButtons[0]);

    const completeButton = screen.getByRole('button', { name: '支払い済みに変更' });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnStatusUpdate).toHaveBeenCalledWith('1', '支払い済み');
    });
  });

  it('検索フィルターが機能する', () => {
    render(<PaymentList payments={mockPayments} onStatusUpdate={mockOnStatusUpdate} />);
    
    const searchInput = screen.getByPlaceholderText('参加者名で検索');
    fireEvent.change(searchInput, { target: { value: '山田' } });

    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument();
  });

  it('ステータスフィルターが機能する', () => {
    render(<PaymentList payments={mockPayments} onStatusUpdate={mockOnStatusUpdate} />);

    const statusFilter = screen.getByRole('combobox');
    fireEvent.change(statusFilter, { target: { value: '支払い済み' } });

    expect(screen.queryByText('山田太郎')).not.toBeInTheDocument();
    expect(screen.getByText('鈴木花子')).toBeInTheDocument();
  });

  it('支払い情報が空の場合にメッセージが表示される', () => {
    render(<PaymentList payments={[]} onStatusUpdate={mockOnStatusUpdate} />);
    
    expect(screen.getByText('支払い情報がありません')).toBeInTheDocument();
  });

  it('支払い期限でソートができる', () => {
    render(<PaymentList payments={mockPayments} onStatusUpdate={mockOnStatusUpdate} />);
    
    const sortButton = screen.getByRole('button', { name: '支払期限でソート' });
    fireEvent.click(sortButton);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('山田太郎');
    expect(rows[2]).toHaveTextContent('鈴木花子');

    fireEvent.click(sortButton);
    
    expect(rows[1]).toHaveTextContent('鈴木花子');
    expect(rows[2]).toHaveTextContent('山田太郎');
  });

  it('金額表示が正しくフォーマットされている', () => {
    render(<PaymentList payments={mockPayments} onStatusUpdate={mockOnStatusUpdate} />);
    
    const amounts = screen.getAllByTestId('payment-amount');
    expect(amounts[0]).toHaveTextContent('¥5,000');
    expect(amounts[1]).toHaveTextContent('¥3,000');
  });

  it('一括ステータス更新が機能する', async () => {
    render(<PaymentList payments={mockPayments} onStatusUpdate={mockOnStatusUpdate} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // 最初の支払いを選択
    fireEvent.click(checkboxes[2]); // 2番目の支払いを選択

    const bulkUpdateButton = screen.getByRole('button', { name: '一括ステータス更新' });
    fireEvent.click(bulkUpdateButton);

    const completeButton = screen.getByRole('button', { name: '選択した支払いを支払い済みに更新' });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnStatusUpdate).toHaveBeenCalledTimes(2);
    });
  });
});
```