```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelpSearch from '@/pages/HelpSearch';
import { act } from 'react-dom/test-utils';

const mockCategories = [
  { id: 1, name: 'よくある質問' },
  { id: 2, name: '使い方ガイド' },
  { id: 3, name: 'トラブルシューティング' }
];

const mockOnSearch = jest.fn();

describe('HelpSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('カテゴリーリストが正しくレンダリングされること', () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    mockCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  it('検索ボックスに入力できること', async () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('キーワードを入力してください');
    await userEvent.type(searchInput, 'テスト検索');
    
    expect(searchInput).toHaveValue('テスト検索');
  });

  it('カテゴリー選択が機能すること', async () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    const categoryButton = screen.getByText('よくある質問');
    await userEvent.click(categoryButton);
    
    expect(categoryButton).toHaveClass('selected');
  });

  it('検索実行時にonSearch関数が呼ばれること', async () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('キーワードを入力してください');
    await userEvent.type(searchInput, 'テスト検索');
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    await userEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith({
      keyword: 'テスト検索',
      categoryId: null
    });
  });

  it('カテゴリー選択して検索実行時にonSearch関数が正しく呼ばれること', async () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    const categoryButton = screen.getByText('よくある質問');
    await userEvent.click(categoryButton);
    
    const searchInput = screen.getByPlaceholderText('キーワードを入力してください');
    await userEvent.type(searchInput, 'テスト検索');
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    await userEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith({
      keyword: 'テスト検索',
      categoryId: 1
    });
  });

  it('検索条件クリアボタンが機能すること', async () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('キーワードを入力してください');
    await userEvent.type(searchInput, 'テスト検索');
    
    const categoryButton = screen.getByText('よくある質問');
    await userEvent.click(categoryButton);
    
    const clearButton = screen.getByRole('button', { name: 'クリア' });
    await userEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(categoryButton).not.toHaveClass('selected');
  });

  it('Enterキーで検索が実行されること', async () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('キーワードを入力してください');
    await userEvent.type(searchInput, 'テスト検索{enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith({
      keyword: 'テスト検索',
      categoryId: null
    });
  });

  it('入力値が空の場合はエラーメッセージが表示されること', async () => {
    render(<HelpSearch categories={mockCategories} onSearch={mockOnSearch} />);
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    await userEvent.click(searchButton);
    
    expect(screen.getByText('検索キーワードを入力してください')).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
```