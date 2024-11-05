```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '@/pages/Header'
import { jest } from '@jest/globals'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation')

describe('Header', () => {
  const mockUser = {
    id: '1',
    name: 'テストユーザー',
    email: 'test@example.com',
    role: 'USER'
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: jest.fn(),
      pathname: '/'
    }))
  })

  it('未ログイン時はログインボタンが表示される', () => {
    render(<Header isLoggedIn={false} user={null} />)
    expect(screen.getByText('ログイン')).toBeInTheDocument()
  })

  it('ログイン時はユーザー名とドロップダウンメニューが表示される', () => {
    render(<Header isLoggedIn={true} user={mockUser} />)
    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /メニュー/i })).toBeInTheDocument()
  })

  it('ナビゲーションメニューが正しく表示される', () => {
    render(<Header isLoggedIn={true} user={mockUser} />)
    expect(screen.getByText('イベント一覧')).toBeInTheDocument()
    expect(screen.getByText('イベント作成')).toBeInTheDocument()
    expect(screen.getByText('参加者管理')).toBeInTheDocument()
  })

  it('メニューボタンクリックでドロップダウンが表示される', async () => {
    render(<Header isLoggedIn={true} user={mockUser} />)
    const menuButton = screen.getByRole('button', { name: /メニュー/i })
    fireEvent.click(menuButton)
    
    await waitFor(() => {
      expect(screen.getByText('プロフィール')).toBeInTheDocument()
      expect(screen.getByText('設定')).toBeInTheDocument()
      expect(screen.getByText('ログアウト')).toBeInTheDocument()
    })
  })

  it('ロゴクリックでトップページに遷移する', () => {
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
      pathname: '/'
    }))

    render(<Header isLoggedIn={true} user={mockUser} />)
    const logo = screen.getByRole('link', { name: /イベント管理システム/i })
    fireEvent.click(logo)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('レスポンシブ時にハンバーガーメニューが表示される', () => {
    global.innerWidth = 500
    global.dispatchEvent(new Event('resize'))
    
    render(<Header isLoggedIn={true} user={mockUser} />)
    expect(screen.getByRole('button', { name: /メニューを開く/i })).toBeInTheDocument()
  })

  it('通知アイコンをクリックすると通知一覧が表示される', async () => {
    render(<Header isLoggedIn={true} user={mockUser} />)
    const notificationButton = screen.getByRole('button', { name: /通知/i })
    fireEvent.click(notificationButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /通知一覧/i })).toBeInTheDocument()
    })
  })

  it('ヘルプボタンクリックでヘルプページに遷移する', () => {
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
      pathname: '/'
    }))

    render(<Header isLoggedIn={true} user={mockUser} />)
    const helpButton = screen.getByRole('link', { name: /ヘルプ/i })
    fireEvent.click(helpButton)
    expect(mockPush).toHaveBeenCalledWith('/help')
  })

  it('管理者ユーザーの場合は管理者メニューが表示される', () => {
    const adminUser = { ...mockUser, role: 'ADMIN' }
    render(<Header isLoggedIn={true} user={adminUser} />)
    expect(screen.getByText('管理者設定')).toBeInTheDocument()
  })
})
```