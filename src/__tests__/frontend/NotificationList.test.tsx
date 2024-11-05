```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import NotificationList from '@/pages/NotificationList'
import { jest } from '@jest/globals'

const mockNotifications = [
  {
    id: '1',
    title: 'お知らせ1', 
    message: 'テストメッセージ1',
    createdAt: '2024-01-01T00:00:00Z',
    isRead: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'お知らせ2',
    message: 'テストメッセージ2', 
    createdAt: '2024-01-02T00:00:00Z',
    isRead: true,
    type: 'warning'
  }
]

const mockOnRead = jest.fn()

describe('NotificationList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('通知一覧が正しくレンダリングされること', () => {
    render(<NotificationList notifications={mockNotifications} onRead={mockOnRead} />)
    
    expect(screen.getByText('お知らせ1')).toBeInTheDocument()
    expect(screen.getByText('テストメッセージ1')).toBeInTheDocument()
    expect(screen.getByText('お知らせ2')).toBeInTheDocument()
    expect(screen.getByText('テストメッセージ2')).toBeInTheDocument()
  })

  it('未読通知をクリックすると既読になること', async () => {
    render(<NotificationList notifications={mockNotifications} onRead={mockOnRead} />)
    
    const unreadNotification = screen.getByText('お知らせ1').closest('div')
    fireEvent.click(unreadNotification!)
    
    await waitFor(() => {
      expect(mockOnRead).toHaveBeenCalledWith('1')
    })
  })

  it('既読通知をクリックしても既読処理が呼ばれないこと', () => {
    render(<NotificationList notifications={mockNotifications} onRead={mockOnRead} />)
    
    const readNotification = screen.getByText('お知らせ2').closest('div')
    fireEvent.click(readNotification!)
    
    expect(mockOnRead).not.toHaveBeenCalled()
  })

  it('通知が空の場合、メッセージが表示されること', () => {
    render(<NotificationList notifications={[]} onRead={mockOnRead} />)
    
    expect(screen.getByText('通知はありません')).toBeInTheDocument()
  })

  it('通知タイプに応じて適切なアイコンが表示されること', () => {
    render(<NotificationList notifications={mockNotifications} onRead={mockOnRead} />)
    
    const infoIcon = screen.getByTestId('info-icon-1')
    const warningIcon = screen.getByTestId('warning-icon-2')
    
    expect(infoIcon).toBeInTheDocument()
    expect(warningIcon).toBeInTheDocument()
  })

  it('通知の日時が正しいフォーマットで表示されること', () => {
    render(<NotificationList notifications={mockNotifications} onRead={mockOnRead} />)
    
    expect(screen.getByText('2024年1月1日')).toBeInTheDocument()
    expect(screen.getByText('2024年1月2日')).toBeInTheDocument()
  })

  it('スクロール時に追加の通知がロードされること', async () => {
    const mockHandleScroll = jest.fn()
    const { container } = render(
      <NotificationList 
        notifications={mockNotifications} 
        onRead={mockOnRead}
        onScroll={mockHandleScroll}
      />
    )

    fireEvent.scroll(container, { target: { scrollY: 1000 } })

    await waitFor(() => {
      expect(mockHandleScroll).toHaveBeenCalled()
    })
  })

  it('通知アイテムにホバー効果があること', () => {
    render(<NotificationList notifications={mockNotifications} onRead={mockOnRead} />)
    
    const notification = screen.getByText('お知らせ1').closest('div')
    
    fireEvent.mouseEnter(notification!)
    expect(notification).toHaveStyle('background-color: rgba(0, 0, 0, 0.05)')
    
    fireEvent.mouseLeave(notification!)
    expect(notification).not.toHaveStyle('background-color: rgba(0, 0, 0, 0.05)')
  })

  it('既読/未読でスタイルが異なること', () => {
    render(<NotificationList notifications={mockNotifications} onRead={mockOnRead} />)
    
    const unreadNotification = screen.getByText('お知らせ1').closest('div')
    const readNotification = screen.getByText('お知らせ2').closest('div')
    
    expect(unreadNotification).toHaveStyle('font-weight: bold')
    expect(readNotification).not.toHaveStyle('font-weight: bold')
  })

  it('通知をフィルタリングできること', () => {
    render(
      <NotificationList 
        notifications={mockNotifications} 
        onRead={mockOnRead}
        filter="unread"
      />
    )

    expect(screen.getByText('お知らせ1')).toBeInTheDocument()
    expect(screen.queryByText('お知らせ2')).not.toBeInTheDocument()
  })
})
```