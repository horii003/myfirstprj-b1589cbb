```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import EventCard from '@/pages/EventCard';
import '@testing-library/jest-dom';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'テストイベント',
    description: 'イベントの説明文です',
    eventType: 'オンライン',
    startDatetime: '2024-01-01T10:00:00',
    endDatetime: '2024-01-01T12:00:00',
    venue: {
      name: 'オンライン会場',
      address: ''
    },
    status: '公開中'
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('イベント情報が正しく表示される', () => {
    render(<EventCard event={mockEvent} onClick={mockOnClick} />);

    expect(screen.getByText('テストイベント')).toBeInTheDocument();
    expect(screen.getByText('イベントの説明文です')).toBeInTheDocument();
    expect(screen.getByText('オンライン')).toBeInTheDocument();
    expect(screen.getByText('2024年1月1日 10:00〜12:00')).toBeInTheDocument();
    expect(screen.getByText('オンライン会場')).toBeInTheDocument();
  });

  it('クリックイベントが正しく発火する', () => {
    render(<EventCard event={mockEvent} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('event-card');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
  });

  it('ステータスバッジが表示される', () => {
    render(<EventCard event={mockEvent} onClick={mockOnClick} />);
    
    const badge = screen.getByText('公開中');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-badge');
  });

  it('オンラインイベントの場合、会場住所が表示されない', () => {
    render(<EventCard event={mockEvent} onClick={mockOnClick} />);
    
    expect(screen.queryByText('住所:')).not.toBeInTheDocument();
  });

  it('オフラインイベントの場合、会場住所が表示される', () => {
    const offlineEvent = {
      ...mockEvent,
      eventType: 'オフライン',
      venue: {
        name: '渋谷会議室',
        address: '東京都渋谷区渋谷1-1-1'
      }
    };

    render(<EventCard event={offlineEvent} onClick={mockOnClick} />);
    
    expect(screen.getByText('渋谷会議室')).toBeInTheDocument();
    expect(screen.getByText('東京都渋谷区渋谷1-1-1')).toBeInTheDocument();
  });

  it('長い説明文は省略されて表示される', () => {
    const longDescriptionEvent = {
      ...mockEvent,
      description: 'あ'.repeat(200)
    };

    render(<EventCard event={longDescriptionEvent} onClick={mockOnClick} />);
    
    const description = screen.getByText(/あ+/);
    expect(description.textContent?.length).toBeLessThan(200);
    expect(description.textContent?.endsWith('...')).toBeTruthy();
  });

  it('必須のpropsが欠けている場合にエラーを投げる', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      // @ts-ignore
      render(<EventCard />);
    }).toThrow();

    expect(() => {
      // @ts-ignore
      render(<EventCard event={mockEvent} />);
    }).toThrow();

    consoleError.mockRestore();
  });
});
```