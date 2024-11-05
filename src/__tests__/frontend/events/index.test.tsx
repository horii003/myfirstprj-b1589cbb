```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import EventListPage from '@/pages/events/index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockEvents = [
  {
    id: '1',
    title: 'テストイベント1',
    description: 'テストイベント1の説明',
    startDate: '2024-01-01',
    endDate: '2024-01-02',
    capacity: 100,
    status: 'published'
  },
  {
    id: '2', 
    title: 'テストイベント2',
    description: 'テストイベント2の説明',
    startDate: '2024-02-01',
    endDate: '2024-02-02',
    capacity: 50,
    status: 'published'
  }
];

const mockEventTypes = [
  { id: '1', name: 'オンライン' },
  { id: '2', name: 'オフライン' }
];

describe('EventListPage', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockEvents })
      .mockResolvedValueOnce({ data: mockEventTypes });
  });

  it('イベント一覧が正しく表示される', async () => {
    render(<EventListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('テストイベント1')).toBeInTheDocument();
      expect(screen.getByText('テストイベント2')).toBeInTheDocument();
    });
  });

  it('検索フォームで絞り込みができる', async () => {
    render(<EventListPage />);

    const searchInput = screen.getByPlaceholderText('イベントを検索');
    fireEvent.change(searchInput, { target: { value: 'テストイベント1' } });
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('テストイベント1')).toBeInTheDocument();
      expect(screen.queryByText('テストイベント2')).not.toBeInTheDocument();
    });
  });

  it('ページネーションが機能する', async () => {
    render(<EventListPage />);
    
    const nextPageButton = screen.getByRole('button', { name: '次へ' });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<EventListPage />);

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('イベントカードがクリック可能', async () => {
    render(<EventListPage />);

    await waitFor(() => {
      const eventCard = screen.getByText('テストイベント1');
      fireEvent.click(eventCard);
      expect(global.mockNextRouter.push).toHaveBeenCalledWith('/events/1');
    });
  });

  it('フィルターの適用と解除ができる', async () => {
    render(<EventListPage />);

    const filterButton = screen.getByText('フィルター');
    fireEvent.click(filterButton);

    const onlineFilter = screen.getByLabelText('オンライン');
    fireEvent.click(onlineFilter);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('type=1')
      );
    });

    const clearButton = screen.getByText('クリア');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.not.stringContaining('type=')
      );
    });
  });

  it('ローディング状態が表示される', async () => {
    render(<EventListPage />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });
  });
});
```