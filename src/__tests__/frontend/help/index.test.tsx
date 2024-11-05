```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import HelpCenter from '@/pages/help/index'

const mockCategories = [
  { id: '1', name: 'イベント作成' },
  { id: '2', name: '参加者管理' },
]

const mockArticles = [
  {
    id: '1',
    title: 'イベントの作成方法',
    category: '1',
    content: 'イベント作成の手順について説明します。',
  },
  {
    id: '2', 
    title: '参加者の管理方法',
    category: '2',
    content: '参加者の管理方法について説明します。',
  }
]

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pathname: '/help'
    }
  }
}))

describe('HelpCenter', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: mockCategories, articles: mockArticles })
      })
    ) as jest.Mock
  })

  it('初期表示時にヘルプカテゴリーと記事が表示される', async () => {
    render(<HelpCenter />)
    
    await waitFor(() => {
      expect(screen.getByText('イベント作成')).toBeInTheDocument()
      expect(screen.getByText('参加者管理')).toBeInTheDocument()
      expect(screen.getByText('イベントの作成方法')).toBeInTheDocument()
      expect(screen.getByText('参加者の管理方法')).toBeInTheDocument()
    })
  })

  it('検索ボックスに入力すると記事がフィルタリングされる', async () => {
    render(<HelpCenter />)
    
    const searchInput = screen.getByPlaceholderText('キーワードを入力')
    await userEvent.type(searchInput, 'イベント')

    await waitFor(() => {
      expect(screen.getByText('イベントの作成方法')).toBeInTheDocument()
      expect(screen.queryByText('参加者の管理方法')).not.toBeInTheDocument()
    })
  })

  it('カテゴリーを選択すると該当カテゴリーの記事のみ表示される', async () => {
    render(<HelpCenter />)

    const categoryButton = screen.getByText('イベント作成')
    await userEvent.click(categoryButton)

    await waitFor(() => {
      expect(screen.getByText('イベントの作成方法')).toBeInTheDocument()
      expect(screen.queryByText('参加者の管理方法')).not.toBeInTheDocument()
    })
  })

  it('記事をクリックすると詳細が表示される', async () => {
    render(<HelpCenter />)

    const article = screen.getByText('イベントの作成方法')
    await userEvent.click(article)

    await waitFor(() => {
      expect(screen.getByText('イベント作成の手順について説明します。')).toBeInTheDocument()
    })
  })

  it('データ取得に失敗した場合エラーメッセージが表示される', async () => {
    global.fetch = jest.fn(() => 
      Promise.reject('API Error')
    ) as jest.Mock

    render(<HelpCenter />)

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました。')).toBeInTheDocument()
    })
  })

  it('検索結果が0件の場合メッセージが表示される', async () => {
    render(<HelpCenter />)
    
    const searchInput = screen.getByPlaceholderText('キーワードを入力')
    await userEvent.type(searchInput, '該当なし')

    await waitFor(() => {
      expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument()
    })
  })
})
```