```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import Analytics from '@/pages/events/[eventId]/analytics';
import userEvent from '@testing-library/user-event';

// モックデータ
const mockAnalyticsData = {
  pageViews: {
    daily: [
      { date: '2024-01-01', count: 100 },
      { date: '2024-01-02', count: 150 }, 
    ],
    total: 250
  },
  registrations: {
    daily: [
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 15 },
    ],
    total: 25
  }
};

// APIモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockResolvedValue({ data: mockAnalyticsData });

describe('Analytics画面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期表示時にデータを取得して表示する', async () => {
    render(<Analytics />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/'),
        expect.any(Object)
      );
    });

    expect(screen.getByText('アクセス分析')).toBeInTheDocument();
    expect(screen.getByText('総アクセス数: 250')).toBeInTheDocument();
    expect(screen.getByText('総登録数: 25')).toBeInTheDocument();
  });

  it('期間フィルターが機能する', async () => {
    render(<Analytics />);
    
    const startDateInput = screen.getByLabelText('開始日');
    const endDateInput = screen.getByLabelText('終了日');
    
    await userEvent.clear(startDateInput);
    await userEvent.type(startDateInput, '2024-01-01');
    await userEvent.clear(endDateInput);
    await userEvent.type(endDateInput, '2024-01-02');
    
    const applyButton = screen.getByText('適用');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      );
    });
  });

  it('エクスポートボタンが機能する', async () => {
    render(<Analytics />);
    
    const exportButton = screen.getByText('CSVエクスポート');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/export'),
        expect.any(Object)
      );
    });
  });

  it('エラー時にエラーメッセージを表示する', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('グラフタイプの切り替えが機能する', async () => {
    render(<Analytics />);

    const dailyButton = screen.getByText('日別');
    const weeklyButton = screen.getByText('週別');
    
    fireEvent.click(weeklyButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('groupBy=weekly'),
        expect.any(Object)
      );
    });

    fireEvent.click(dailyButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('groupBy=daily'),
        expect.any(Object)
      );
    });
  });

  it('ローディング状態を表示する', async () => {
    mockedAxios.get.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<Analytics />);

    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('データを読み込み中...')).not.toBeInTheDocument();
    });
  });

  it('データが存在しない場合のメッセージを表示する', async () => {
    mockedAxios.get.mockResolvedValueOnce({ 
      data: {
        pageViews: { daily: [], total: 0 },
        registrations: { daily: [], total: 0 }
      }
    });

    render(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('データが存在しません')).toBeInTheDocument();
    });
  });

  it('カスタム期間選択が機能する', async () => {
    render(<Analytics />);

    const customRangeButton = screen.getByText('カスタム期間');
    fireEvent.click(customRangeButton);

    const startDateInput = screen.getByLabelText('開始日');
    const endDateInput = screen.getByLabelText('終了日');

    await userEvent.clear(startDateInput);
    await userEvent.type(startDateInput, '2024-01-01');
    await userEvent.clear(endDateInput);
    await userEvent.type(endDateInput, '2024-01-31');

    const applyButton = screen.getByText('適用');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/startDate=2024-01-01.*endDate=2024-01-31/),
        expect.any(Object)
      );
    });
  });
});
```