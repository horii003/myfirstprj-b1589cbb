```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Attendance from '@/pages/events/[eventId]/attendance'
import '@testing-library/jest-dom'
import { useState as useStateMock } from 'react'

// モックデータ
const mockParticipants = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@test.com',
    status: '出席予定'
  },
  {
    id: '2', 
    name: '鈴木花子',
    email: 'suzuki@test.com',
    status: '欠席'
  }
]

const mockAttendance = [
  {
    participantId: '1',
    status: '出席',
    note: ''
  }
]

// モック
jest.mock('next/navigation')
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn()
}))

const mockSetParticipants = jest.fn()
const mockSetAttendance = jest.fn()

describe('出欠確認画面', () => {
  beforeEach(() => {
    ;(useStateMock as jest.Mock)
      .mockImplementationOnce([mockParticipants, mockSetParticipants])
      .mockImplementationOnce([mockAttendance, mockSetAttendance])
      
    ;(useRouter as jest.Mock).mockReturnValue({
      query: { eventId: '1' }
    })
  })

  it('参加者リストが表示される', () => {
    render(<Attendance />)
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByText('鈴木花子')).toBeInTheDocument()
  })

  it('QRコードリーダーボタンが機能する', () => {
    render(<Attendance />)
    const qrButton = screen.getByText('QRコード読取')
    fireEvent.click(qrButton)
    expect(screen.getByTestId('qr-reader')).toBeInTheDocument()
  })

  it('手動で出欠入力ができる', async () => {
    render(<Attendance />)
    
    const statusSelect = screen.getByLabelText('出欠状態')
    fireEvent.change(statusSelect, { target: { value: '出席' }})

    const noteInput = screen.getByLabelText('備考')
    fireEvent.change(noteInput, { target: { value: 'テスト備考' }})

    const submitButton = screen.getByText('保存')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSetAttendance).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            status: '出席',
            note: 'テスト備考'
          })
        ])
      )
    })
  })

  it('エラー時にエラーメッセージが表示される', async () => {
    const mockFetch = jest.spyOn(global, 'fetch')
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<Attendance />)
    
    const submitButton = screen.getByText('保存')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    })
  })

  it('参加者の検索ができる', () => {
    render(<Attendance />)
    
    const searchInput = screen.getByPlaceholderText('参加者検索')
    fireEvent.change(searchInput, { target: { value: '山田' }})

    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument()
  })

  it('集計情報が表示される', () => {
    render(<Attendance />)
    expect(screen.getByText('出席者数:')).toBeInTheDocument()
    expect(screen.getByText('欠席者数:')).toBeInTheDocument()
  })

  it('CSVエクスポートができる', async () => {
    render(<Attendance />)
    
    const exportButton = screen.getByText('CSVエクスポート')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/1/attendance/export'),
        expect.any(Object)
      )
    })
  })
})
```