```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchForm from '@/pages/SearchForm';
import userEvent from '@testing-library/user-event';

const mockOnSearch = jest.fn();

const mockFilters = {
  keyword: '',
  category: '',
  date: '',
  status: ''
};

describe('SearchForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('検索フォームが正しくレンダリングされること', () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    expect(screen.getByPlaceholderText('キーワードを入力')).toBeInTheDocument();
    expect(screen.getByLabelText('カテゴリー')).toBeInTheDocument();
    expect(screen.getByLabelText('開催日')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'クリア' })).toBeInTheDocument();
  });

  it('キーワード入力が正しく動作すること', async () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const input = screen.getByPlaceholderText('キーワードを入力');
    await userEvent.type(input, 'テストイベント');
    
    expect(input).toHaveValue('テストイベント');
  });

  it('カテゴリー選択が正しく動作すること', async () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const select = screen.getByLabelText('カテゴリー');
    await userEvent.selectOptions(select, 'セミナー');
    
    expect(select).toHaveValue('セミナー');
  });

  it('検索ボタンクリックで正しく検索が実行されること', async () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const keyword = screen.getByPlaceholderText('キーワードを入力');
    await userEvent.type(keyword, 'テスト');
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        ...mockFilters,
        keyword: 'テスト'
      });
    });
  });

  it('クリアボタンで入力値がリセットされること', async () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const keyword = screen.getByPlaceholderText('キーワードを入力');
    await userEvent.type(keyword, 'テスト');
    
    const clearButton = screen.getByRole('button', { name: 'クリア' });
    fireEvent.click(clearButton);
    
    expect(keyword).toHaveValue('');
    expect(screen.getByLabelText('カテゴリー')).toHaveValue('');
    expect(screen.getByLabelText('開催日')).toHaveValue('');
    expect(screen.getByLabelText('ステータス')).toHaveValue('');
  });

  it('日付選択が正しく動作すること', async () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const dateInput = screen.getByLabelText('開催日');
    await userEvent.type(dateInput, '2024-01-01');
    
    expect(dateInput).toHaveValue('2024-01-01');
  });

  it('ステータス選択が正しく動作すること', async () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const statusSelect = screen.getByLabelText('ステータス');
    await userEvent.selectOptions(statusSelect, '公開中');
    
    expect(statusSelect).toHaveValue('公開中');
  });

  it('初期値が正しく設定されること', () => {
    const initialFilters = {
      keyword: 'テスト',
      category: 'セミナー',
      date: '2024-01-01',
      status: '公開中'
    };
    
    render(<SearchForm onSearch={mockOnSearch} filters={initialFilters} />);
    
    expect(screen.getByPlaceholderText('キーワードを入力')).toHaveValue('テスト');
    expect(screen.getByLabelText('カテゴリー')).toHaveValue('セミナー');
    expect(screen.getByLabelText('開催日')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('ステータス')).toHaveValue('公開中');
  });

  it('フォームのバリデーションが正しく動作すること', async () => {
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const keyword = screen.getByPlaceholderText('キーワードを入力');
    await userEvent.type(keyword, '   ');
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    expect(screen.getByText('キーワードを入力してください')).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('デバウンス処理が正しく動作すること', async () => {
    jest.useFakeTimers();
    
    render(<SearchForm onSearch={mockOnSearch} filters={mockFilters} />);
    
    const keyword = screen.getByPlaceholderText('キーワードを入力');
    await userEvent.type(keyword, 'テスト');
    
    jest.advanceTimersByTime(300);
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(200);
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        ...mockFilters,
        keyword: 'テスト'
      });
    });
    
    jest.useRealTimers();
  });
});
```