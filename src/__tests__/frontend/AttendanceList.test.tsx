```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AttendanceList from '@/pages/AttendanceList'
import { useState } from 'react'

type Participant = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
}

type Attendance = {
  participantId: string;
  status: 'present' | 'absent' | 'pending';
  checkedInAt?: Date;
}

const mockParticipants: Participant[] = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@test.com', 
    ticketType: '一般'
  },
  {
    id: '2',
    name: '鈴木花子',
    email: 'suzuki@test.com',
    ticketType: 'VIP'
  }
]

const mockAttendance: Attendance[] = [
  {
    participantId: '1',
    status: 'present',
    checkedInAt: new Date('2024-01-01T09:00:00')
  },
  {
    participantId: '2', 
    status: 'pending'
  }
]

const mockOnUpdate = jest.fn()

describe('AttendanceList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('参加者一覧が表示される', () => {
    render(
      <AttendanceList 
        participants={mockParticipants}
        attendance={mockAttendance}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByText('鈴木花子')).toBeInTheDocument()
    expect(screen.getByText('一般')).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
  })

  it('出欠ステータスが正しく表示される', () => {
    render(
      <AttendanceList
        participants={mockParticipants}
        attendance={mockAttendance} 
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('出席')).toBeInTheDocument()
    expect(screen.getByText('未確認')).toBeInTheDocument()
  })

  it('出欠ステータスを更新できる', async () => {
    render(
      <AttendanceList
        participants={mockParticipants}
        attendance={mockAttendance}
        onUpdate={mockOnUpdate} 
      />
    )

    const statusButton = screen.getByTestId('attendance-status-2')
    fireEvent.click(statusButton)

    const presentButton = screen.getByText('出席に変更')
    fireEvent.click(presentButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        participantId: '2',
        status: 'present',
        checkedInAt: expect.any(Date)
      })
    })
  })

  it('検索フィルターが機能する', () => {
    render(
      <AttendanceList
        participants={mockParticipants}
        attendance={mockAttendance}
        onUpdate={mockOnUpdate}
      />
    )

    const searchInput = screen.getByPlaceholderText('名前やメールアドレスで検索')
    fireEvent.change(searchInput, { target: { value: '山田' } })

    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument()
  })

  it('チケットタイプでフィルターできる', () => {
    render(
      <AttendanceList
        participants={mockParticipants}
        attendance={mockAttendance}
        onUpdate={mockOnUpdate}
      />
    )

    const ticketSelect = screen.getByLabelText('チケットタイプ')
    fireEvent.change(ticketSelect, { target: { value: 'VIP' } })

    expect(screen.queryByText('山田太郎')).not.toBeInTheDocument()
    expect(screen.getByText('鈴木花子')).toBeInTheDocument()
  })

  it('出欠ステータスでフィルターできる', () => {
    render(
      <AttendanceList
        participants={mockParticipants}
        attendance={mockAttendance}
        onUpdate={mockOnUpdate}
      />
    )

    const statusSelect = screen.getByLabelText('出欠ステータス')
    fireEvent.change(statusSelect, { target: { value: 'present' } })

    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument()
  })

  it('参加者が0人の場合メッセージが表示される', () => {
    render(
      <AttendanceList
        participants={[]}
        attendance={[]}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('参加者がいません')).toBeInTheDocument()
  })

  it('CSVエクスポートができる', async () => {
    render(
      <AttendanceList
        participants={mockParticipants}
        attendance={mockAttendance}
        onUpdate={mockOnUpdate}
      />
    )

    const exportButton = screen.getByText('CSVエクスポート')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(screen.getByText('エクスポートが完了しました')).toBeInTheDocument()
    })
  })
  
  it('QRコード読み取りボタンが機能する', () => {
    render(
      <AttendanceList
        participants={mockParticipants}
        attendance={mockAttendance}
        onUpdate={mockOnUpdate}
      />
    )

    const qrButton = screen.getByText('QRコード読取')
    fireEvent.click(qrButton)

    expect(screen.getByText('QRコードを読み取ってください')).toBeInTheDocument()
  })
})
```