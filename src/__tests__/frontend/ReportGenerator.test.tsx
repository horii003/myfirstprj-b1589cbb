```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import ReportGenerator from '@/pages/ReportGenerator'
import '@testing-library/jest-dom'

const mockEvent = {
  id: '1',
  title: 'テストイベント',
  description: 'テストの説明',
  startDate: '2024-01-01',
  endDate: '2024-01-02',
  venue: '東京会場',
  capacity: 100
}

const mockStats = {
  totalRegistrations: 80,
  actualAttendees: 70,
  surveyResponses: 50,
  satisfactionRate: 4.5,
  registrationTrend: [
    { date: '2023-12-01', count: 10 },
    { date: '2023-12-02', count: 20 }
  ],
  participantDemographics: {
    gender: { male: 40, female: 40 },
    age: { '20s': 30, '30s': 30, '40s': 20 }
  }
}

const mockOnExport = jest.fn()

describe('ReportGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('イベント情報とレポート概要が正しく表示される', () => {
    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockStats} 
        onExport={mockOnExport} 
      />
    )

    expect(screen.getByText('テストイベント')).toBeInTheDocument()
    expect(screen.getByText('総参加登録数: 80名')).toBeInTheDocument()
    expect(screen.getByText('実際の参加者数: 70名')).toBeInTheDocument()
  })

  it('PDFエクスポートボタンのクリックで正しく関数が呼ばれる', async () => {
    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockStats} 
        onExport={mockOnExport}
      />
    )

    const exportButton = screen.getByText('PDFでエクスポート')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledTimes(1)
      expect(mockOnExport).toHaveBeenCalledWith({
        format: 'pdf',
        eventId: '1'
      })
    })
  })

  it('CSVエクスポートボタンのクリックで正しく関数が呼ばれる', async () => {
    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockStats} 
        onExport={mockOnExport}
      />
    )

    const exportButton = screen.getByText('CSVでエクスポート')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledTimes(1)
      expect(mockOnExport).toHaveBeenCalledWith({
        format: 'csv',
        eventId: '1'
      })
    })
  })

  it('グラフが正しく表示される', () => {
    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockStats} 
        onExport={mockOnExport}
      />
    )

    expect(screen.getByTestId('registration-trend-chart')).toBeInTheDocument()
    expect(screen.getByTestId('demographics-chart')).toBeInTheDocument()
  })

  it('満足度が正しく表示される', () => {
    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockStats} 
        onExport={mockOnExport}
      />
    )

    expect(screen.getByText('満足度: 4.5')).toBeInTheDocument()
    expect(screen.getByTestId('satisfaction-indicator')).toHaveStyle({
      width: '90%'
    })
  })

  it('エラー状態が適切に処理される', () => {
    const mockErrorStats = {
      ...mockStats,
      error: 'データの取得に失敗しました'
    }

    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockErrorStats} 
        onExport={mockOnExport}
      />
    )

    expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
    const exportButtons = screen.getAllByRole('button')
    exportButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('ローディング状態が適切に表示される', () => {
    const mockLoadingStats = {
      ...mockStats,
      loading: true
    }

    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockLoadingStats} 
        onExport={mockOnExport}
      />
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    const exportButtons = screen.getAllByRole('button')
    exportButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('アンケート回答率が正しく計算され表示される', () => {
    render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockStats} 
        onExport={mockOnExport}
      />
    )

    // 50 / 70 * 100 = 71.43%
    expect(screen.getByText('アンケート回答率: 71.43%')).toBeInTheDocument()
  })

  it('データが更新された時に再レンダリングされる', async () => {
    const { rerender } = render(
      <ReportGenerator 
        event={mockEvent} 
        stats={mockStats} 
        onExport={mockOnExport}
      />
    )

    const updatedStats = {
      ...mockStats,
      totalRegistrations: 90
    }

    rerender(
      <ReportGenerator 
        event={mockEvent} 
        stats={updatedStats} 
        onExport={mockOnExport}
      />
    )

    expect(screen.getByText('総参加登録数: 90名')).toBeInTheDocument()
  })
})
```