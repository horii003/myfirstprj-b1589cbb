```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import EventReport from '@/pages/events/[eventId]/report';
import '@testing-library/jest-dom';

// モックデータ
const mockEventData = {
  id: 'event-1',
  title: 'テストイベント',
  startDate: '2024-01-01',
  endDate: '2024-01-02',
  venue: '東京会議室',
  participants: 100
};

const mockStats = {
  totalParticipants: 100,
  attendanceRate: 0.85,
  satisfaction: 4.2,
  revenue: 500000,
  costs: 300000
};

jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">ヘッダー</div>;
  };
});

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">フッター</div>;
  };
});

jest.mock('@/components/ReportGenerator', () => {
  return function MockReportGenerator({ event, stats, onExport }) {
    return (
      <div data-testid="mock-report-generator">
        <button onClick={() => onExport()}>レポート出力</button>
      </div>
    );
  };
});

describe('イベントレポート画面', () => {
  beforeEach(() => {
    // API モック
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ event: mockEventData, stats: mockStats }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('画面の初期表示が正しく行われる', async () => {
    await act(async () => {
      render(<EventReport />);
    });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-report-generator')).toBeInTheDocument();
  });

  it('期間選択が正しく機能する', async () => {
    await act(async () => {
      render(<EventReport />);
    });

    const startDateInput = screen.getByLabelText('開始日');
    const endDateInput = screen.getByLabelText('終了日');

    await userEvent.type(startDateInput, '2024-01-01');
    await userEvent.type(endDateInput, '2024-01-31');

    expect(startDateInput).toHaveValue('2024-01-01');
    expect(endDateInput).toHaveValue('2024-01-31');
  });

  it('レポート出力ボタンのクリックでPDF生成が実行される', async () => {
    const mockExport = jest.fn();

    await act(async () => {
      render(<EventReport onExport={mockExport} />);
    });

    const exportButton = screen.getByText('レポート出力');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockExport).toHaveBeenCalled();
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('データの取得に失敗しました'))
    );

    await act(async () => {
      render(<EventReport />);
    });

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('レポート項目の選択が正しく機能する', async () => {
    await act(async () => {
      render(<EventReport />);
    });

    const participantsCheckbox = screen.getByLabelText('参加者統計');
    const surveyCheckbox = screen.getByLabelText('アンケート結果');
    const financialCheckbox = screen.getByLabelText('収支報告');

    await userEvent.click(participantsCheckbox);
    await userEvent.click(surveyCheckbox);
    await userEvent.click(financialCheckbox);

    expect(participantsCheckbox).toBeChecked();
    expect(surveyCheckbox).toBeChecked();
    expect(financialCheckbox).toBeChecked();
  });

  it('ローディング状態が正しく表示される', async () => {
    let resolvePromise;
    global.fetch = jest.fn().mockImplementation(
      () => new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    render(<EventReport />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    await act(async () => {
      resolvePromise({
        ok: true,
        json: () => Promise.resolve({ event: mockEventData, stats: mockStats })
      });
    });

    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
  });
});
```