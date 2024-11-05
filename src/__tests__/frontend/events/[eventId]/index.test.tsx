```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import EventDetail from '@/pages/events/[eventId]/index';

// モックデータ
const mockEvent = {
  id: '1',
  title: 'テストイベント',
  description: 'イベントの説明',
  startDateTime: '2024-01-01T10:00:00',
  endDateTime: '2024-01-01T17:00:00',
  venue: {
    name: 'テスト会場',
    address: '東京都渋谷区'
  },
  capacity: 100,
  registeredCount: 50
};

const mockTickets = [
  {
    id: '1',
    name: '一般チケット',
    price: 1000,
    capacity: 50,
    remainingCount: 30
  },
  {
    id: '2', 
    name: '学生チケット',
    price: 500,
    capacity: 50,
    remainingCount: 20
  }
];

// モック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    query: { eventId: '1' },
    push: jest.fn()
  }),
  useParams: () => ({ eventId: '1' })
}));

jest.mock('@/api/event', () => ({
  getEventDetail: jest.fn(() => Promise.resolve(mockEvent)),
  getEventTickets: jest.fn(() => Promise.resolve(mockTickets))
}));

describe('イベント詳細画面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('イベント詳細が正しく表示される', async () => {
    render(<EventDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('テストイベント')).toBeInTheDocument();
      expect(screen.getByText('イベントの説明')).toBeInTheDocument();
      expect(screen.getByText('テスト会場')).toBeInTheDocument();
      expect(screen.getByText('東京都渋谷区')).toBeInTheDocument();
    });
  });

  it('チケット情報が正しく表示される', async () => {
    render(<EventDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('一般チケット')).toBeInTheDocument();
      expect(screen.getByText('学生チケット')).toBeInTheDocument();
      expect(screen.getByText('¥1,000')).toBeInTheDocument();
      expect(screen.getByText('¥500')).toBeInTheDocument();
    });
  });

  it('参加登録ボタンがクリック可能', async () => {
    const user = userEvent.setup();
    const { container } = render(<EventDetail />);

    const registerButton = await screen.findByRole('button', { name: /参加登録/i });
    await user.click(registerButton);

    expect(mockNextRouter.push).toHaveBeenCalledWith('/events/1/register');
  });

  it('定員に達している場合は参加登録ボタンが無効になる', async () => {
    const fullEvent = {
      ...mockEvent,
      registeredCount: 100
    };

    jest.spyOn(require('@/api/event'), 'getEventDetail')
      .mockImplementationOnce(() => Promise.resolve(fullEvent));

    render(<EventDetail />);

    await waitFor(() => {
      const registerButton = screen.getByRole('button', { name: /参加登録/i });
      expect(registerButton).toBeDisabled();
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    jest.spyOn(require('@/api/event'), 'getEventDetail')
      .mockRejectedValueOnce(new Error('データの取得に失敗しました'));

    render(<EventDetail />);

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });

  it('残席数が正しく表示される', async () => {
    render(<EventDetail />);

    await waitFor(() => {
      expect(screen.getByText('残席: 50名')).toBeInTheDocument();
    });
  });

  it('開催日時が正しいフォーマットで表示される', async () => {
    render(<EventDetail />);

    await waitFor(() => {
      expect(screen.getByText('2024年1月1日(月) 10:00〜17:00')).toBeInTheDocument();
    });
  });

  it('共通コンポーネントが正しく表示される', async () => {
    render(<EventDetail />);

    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('event-detail-card')).toBeInTheDocument();
    });
  });
});
```