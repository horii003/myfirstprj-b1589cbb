```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import Register from '@/pages/events/[eventId]/register'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'

// モックデータ
const mockEvent = {
  id: 'event-1',
  title: 'テストイベント',
  description: 'テストイベントの説明',
  startDateTime: '2024-01-01T10:00:00',
  endDateTime: '2024-01-01T17:00:00',
  venue: { name: 'テスト会場', address: '東京都渋谷区' }
}

const mockTickets = [
  {
    id: 'ticket-1',
    name: '一般チケット',
    price: 1000,
    description: '一般参加者向けチケット',
    capacity: 100,
    remainingCount: 50
  },
  {
    id: 'ticket-2', 
    name: '学生チケット',
    price: 500,
    description: '学生向けチケット',
    capacity: 50,
    remainingCount: 30
  }
]

const mockFormItems = [
  {
    id: 'name',
    type: 'text',
    label: '氏名',
    required: true
  },
  {
    id: 'email',
    type: 'email', 
    label: 'メールアドレス',
    required: true
  }
]

// モック関数の設定
jest.mock('next/navigation')
const mockUseRouter = useRouter as jest.Mock

describe('Register Page', () => {
  beforeEach(() => {
    mockUseRouter.mockImplementation(() => ({
      push: jest.fn(),
      query: { eventId: 'event-1' }
    }))

    global.fetch = jest.fn((url) => {
      if(url.includes('/api/events/event-1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEvent)
        })
      } else if(url.includes('/api/events/event-1/tickets')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTickets)
        })
      } else if(url.includes('/api/events/event-1/form-items')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFormItems)
        })
      }
      return Promise.reject(new Error('Not found'))
    }) as jest.Mock
  })

  it('正しくページが表示される', async () => {
    await act(async () => {
      render(<Register />)
    })

    expect(screen.getByText('テストイベント')).toBeInTheDocument()
    expect(screen.getByText('一般チケット')).toBeInTheDocument()
    expect(screen.getByText('学生チケット')).toBeInTheDocument()
    expect(screen.getByLabelText('氏名')).toBeInTheDocument()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
  })

  it('フォームに必須項目が未入力の場合エラーが表示される', async () => {
    await act(async () => {
      render(<Register />)
    })

    const submitButton = screen.getByRole('button', { name: '参加登録する' })
    
    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(screen.getByText('氏名を入力してください')).toBeInTheDocument()
    expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument()
  })

  it('フォームに正しく入力して送信できる', async () => {
    global.fetch = jest.fn().mockImplementationOnce((url) => {
      if(url.includes('/api/events/event-1/register')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      }
      return Promise.reject(new Error('Not found'))
    }) as jest.Mock

    await act(async () => {
      render(<Register />)
    })

    const nameInput = screen.getByLabelText('氏名')
    const emailInput = screen.getByLabelText('メールアドレス')
    const ticketSelect = screen.getByLabelText('チケット種別')
    const submitButton = screen.getByRole('button', { name: '参加登録する' })

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'テスト太郎' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(ticketSelect, { target: { value: 'ticket-1' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/event-1/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            ticketId: 'ticket-1',
            participantInfo: {
              name: 'テスト太郎',
              email: 'test@example.com'
            }
          })
        })
      )
    })
  })

  it('チケットが売り切れの場合エラーメッセージが表示される', async () => {
    const soldOutTickets = [
      {
        ...mockTickets[0],
        remainingCount: 0
      }
    ]

    global.fetch = jest.fn((url) => {
      if(url.includes('/api/events/event-1/tickets')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(soldOutTickets)
        })
      }
      return Promise.reject(new Error('Not found'))
    }) as jest.Mock

    await act(async () => {
      render(<Register />)
    })

    expect(screen.getByText('このチケットは売り切れです')).toBeInTheDocument()
  })

  it('APIエラー時にエラーメッセージが表示される', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'))

    await act(async () => {
      render(<Register />)
    })

    expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
  })

  it('登録完了後に完了画面に遷移する', async () => {
    const mockPush = jest.fn()
    mockUseRouter.mockImplementation(() => ({
      push: mockPush,
      query: { eventId: 'event-1' }
    }))

    global.fetch = jest.fn().mockImplementationOnce((url) => {
      if(url.includes('/api/events/event-1/register')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      }
      return Promise.reject(new Error('Not found'))
    }) as jest.Mock

    await act(async () => {
      render(<Register />)
    })

    const nameInput = screen.getByLabelText('氏名')
    const emailInput = screen.getByLabelText('メールアドレス')
    const submitButton = screen.getByRole('button', { name: '参加登録する' })

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'テスト太郎' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/events/event-1/register/complete')
      )
    })
  })
})
```