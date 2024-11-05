```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import '@testing-library/jest-dom'
import RegistrationForm from '@/pages/RegistrationForm'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

// モックデータ
const mockEvent = {
  id: '1',
  title: 'テストイベント',
  description: 'テストイベントの説明',
  startDateTime: '2024-01-01T10:00:00',
  endDateTime: '2024-01-01T17:00:00',
}

const mockTickets = [
  {
    id: '1',
    name: '一般チケット',
    price: 1000,
    capacity: 100,
    description: '一般参加者向けチケット'
  },
  {
    id: '2', 
    name: '学生チケット',
    price: 500,
    capacity: 50,
    description: '学生向け割引チケット'
  }
]

const mockFormItems = [
  {
    id: '1',
    type: 'text',
    label: '氏名',
    required: true,
    placeholder: '山田太郎'
  },
  {
    id: '2',
    type: 'email', 
    label: 'メールアドレス',
    required: true,
    placeholder: 'example@email.com'
  }
]

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('RegistrationForm', () => {
  const mockRouter = {
    push: jest.fn(),
  }
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  test('フォームが正しくレンダリングされる', () => {
    render(
      <RegistrationForm 
        event={mockEvent}
        tickets={mockTickets}
        formItems={mockFormItems}
      />
    )

    expect(screen.getByText('テストイベント')).toBeInTheDocument()
    expect(screen.getByText('一般チケット')).toBeInTheDocument()
    expect(screen.getByText('学生チケット')).toBeInTheDocument()
    expect(screen.getByLabelText('氏名')).toBeInTheDocument()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
  })

  test('必須項目が入力されていない場合にエラーが表示される', async () => {
    render(
      <RegistrationForm
        event={mockEvent}
        tickets={mockTickets}
        formItems={mockFormItems} 
      />
    )

    const submitButton = screen.getByRole('button', { name: '申し込む' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('氏名は必須項目です')).toBeInTheDocument()
      expect(screen.getByText('メールアドレスは必須項目です')).toBeInTheDocument()
    })
  })

  test('チケット選択が正しく動作する', async () => {
    render(
      <RegistrationForm
        event={mockEvent}
        tickets={mockTickets}
        formItems={mockFormItems}
      />
    )

    const ticketSelect = screen.getByRole('combobox')
    await userEvent.selectOptions(ticketSelect, '2')

    expect(screen.getByText('500円')).toBeInTheDocument()
  })

  test('フォームの送信が正しく動作する', async () => {
    const mockSubmit = jest.fn()
    render(
      <RegistrationForm
        event={mockEvent}
        tickets={mockTickets}
        formItems={mockFormItems}
        onSubmit={mockSubmit}
      />
    )

    await userEvent.type(screen.getByLabelText('氏名'), '山田太郎')
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    const ticketSelect = screen.getByRole('combobox')
    await userEvent.selectOptions(ticketSelect, '1')

    const submitButton = screen.getByRole('button', { name: '申し込む' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: '山田太郎',
        email: 'test@example.com',
        ticketId: '1'
      })
    })
  })

  test('入力値のバリデーションが正しく動作する', async () => {
    render(
      <RegistrationForm
        event={mockEvent}
        tickets={mockTickets}
        formItems={mockFormItems}
      />
    )

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'invalid-email')

    const submitButton = screen.getByRole('button', { name: '申し込む' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('正しいメールアドレスを入力してください')).toBeInTheDocument()
    })
  })

  test('送信中の状態が正しく表示される', async () => {
    render(
      <RegistrationForm
        event={mockEvent}
        tickets={mockTickets}
        formItems={mockFormItems}
      />
    )

    await userEvent.type(screen.getByLabelText('氏名'), '山田太郎')
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: '申し込む' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('送信中...')).toBeInTheDocument()
    })
  })

  test('APIエラー時のエラーメッセージが表示される', async () => {
    const mockError = new Error('API Error')
    const mockSubmit = jest.fn().mockRejectedValue(mockError)

    render(
      <RegistrationForm
        event={mockEvent}
        tickets={mockTickets}
        formItems={mockFormItems}
        onSubmit={mockSubmit}
      />
    )

    await userEvent.type(screen.getByLabelText('氏名'), '山田太郎')
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: '申し込む' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('登録に失敗しました。もう一度お試しください。')).toBeInTheDocument()
    })
  })
})
```