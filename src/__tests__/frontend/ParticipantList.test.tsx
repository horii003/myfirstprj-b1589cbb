```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ParticipantList from '@/pages/ParticipantList';

// モックデータ
const mockParticipants = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    ticketType: '一般参加',
    registeredAt: '2024-01-01T10:00:00',
    status: '参加予定'
  },
  {
    id: '2', 
    name: '鈴木花子',
    email: 'suzuki@example.com',
    ticketType: 'VIP',
    registeredAt: '2024-01-02T11:00:00',
    status: 'キャンセル'
  }
];

const mockOnAction = jest.fn();

describe('ParticipantList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('参加者一覧が正しく表示される', () => {
    render(<ParticipantList participants={mockParticipants} onAction={mockOnAction} />);
    
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('suzuki@example.com')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('参加者が0人の場合、メッセージが表示される', () => {
    render(<ParticipantList participants={[]} onAction={mockOnAction} />);
    
    expect(screen.getByText('参加者がいません')).toBeInTheDocument();
  });

  it('アクションボタンクリックでonActionが呼ばれる', async () => {
    render(<ParticipantList participants={mockParticipants} onAction={mockOnAction} />);

    const actionButton = screen.getAllByRole('button', { name: '操作' })[0];
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith(mockParticipants[0]);
    });
  });

  it('検索フィルターが機能する', () => {
    render(<ParticipantList participants={mockParticipants} onAction={mockOnAction} />);

    const searchInput = screen.getByPlaceholderText('参加者を検索...');
    fireEvent.change(searchInput, { target: { value: '鈴木' } });

    expect(screen.getByText('鈴木花子')).toBeInTheDocument();
    expect(screen.queryByText('山田太郎')).not.toBeInTheDocument();
  });

  it('ステータスフィルターが機能する', () => {
    render(<ParticipantList participants={mockParticipants} onAction={mockOnAction} />);

    const statusSelect = screen.getByLabelText('ステータス');
    fireEvent.change(statusSelect, { target: { value: 'キャンセル' } });

    expect(screen.getByText('鈴木花子')).toBeInTheDocument();
    expect(screen.queryByText('山田太郎')).not.toBeInTheDocument();
  });

  it('CSVエクスポートボタンが機能する', async () => {
    const mockCreateObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    
    render(<ParticipantList participants={mockParticipants} onAction={mockOnAction} />);

    const exportButton = screen.getByText('CSVエクスポート');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  it('ソート機能が正しく動作する', () => {
    render(<ParticipantList participants={mockParticipants} onAction={mockOnAction} />);

    const nameHeader = screen.getByText('氏名');
    fireEvent.click(nameHeader);

    const participants = screen.getAllByRole('row');
    expect(participants[1]).toHaveTextContent('鈴木花子');
    expect(participants[2]).toHaveTextContent('山田太郎');
  });

  it('ページネーションが機能する', () => {
    const manyParticipants = Array(25).fill(null).map((_, index) => ({
      ...mockParticipants[0],
      id: String(index),
      name: `参加者${index}`
    }));

    render(<ParticipantList participants={manyParticipants} onAction={mockOnAction} />);

    const nextPageButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextPageButton);

    expect(screen.getByText('参加者20')).toBeInTheDocument();
    expect(screen.queryByText('参加者5')).not.toBeInTheDocument();
  });

  it('一括操作が機能する', async () => {
    render(<ParticipantList participants={mockParticipants} onAction={mockOnAction} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // 最初の参加者を選択
    fireEvent.click(checkboxes[2]); // 2番目の参加者を選択

    const bulkActionButton = screen.getByText('一括操作');
    fireEvent.click(bulkActionButton);

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith(expect.arrayContaining([
        mockParticipants[0],
        mockParticipants[1]
      ]));
    });
  });
});
```