```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventDetailCard from '@/pages/EventDetailCard';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

const mockEvent = {
  id: '1',
  title: 'テストイベント',
  description: 'イベントの説明文',
  eventType: 'オンライン', 
  startDatetime: '2024-01-01T10:00:00',
  endDatetime: '2024-01-01T12:00:00',
  venue: {
    name: 'オンライン会場',
    address: '-'
  },
  registrationStart: '2023-12-01T00:00:00',
  registrationEnd: '2023-12-31T23:59:59',
  status: '公開中'
};

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
];

describe('EventDetailCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('イベント詳細が正しく表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={mockTickets} />);
    
    expect(screen.getByText('テストイベント')).toBeInTheDocument();
    expect(screen.getByText('イベントの説明文')).toBeInTheDocument();
    expect(screen.getByText('オンライン')).toBeInTheDocument();
    expect(screen.getByText('2024年1月1日 10:00')).toBeInTheDocument();
    expect(screen.getByText('2024年1月1日 12:00')).toBeInTheDocument();
  });

  it('チケット情報が正しく表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={mockTickets} />);

    expect(screen.getByText('一般チケット')).toBeInTheDocument();
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
    expect(screen.getByText('学生チケット')).toBeInTheDocument();
    expect(screen.getByText('¥500')).toBeInTheDocument();
  });

  it('参加申込期間が正しく表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={mockTickets} />);

    expect(screen.getByText('2023年12月1日 00:00')).toBeInTheDocument();
    expect(screen.getByText('2023年12月31日 23:59')).toBeInTheDocument();
  });

  it('イベントステータスが表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={mockTickets} />);

    expect(screen.getByText('公開中')).toBeInTheDocument();
  });

  it('会場情報が表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={mockTickets} />);

    expect(screen.getByText('オンライン会場')).toBeInTheDocument();
  });

  it('チケットの定員数が表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={mockTickets} />);

    expect(screen.getByText('定員: 100名')).toBeInTheDocument();
    expect(screen.getByText('定員: 50名')).toBeInTheDocument();
  });

  it('チケットの説明文が表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={mockTickets} />);

    expect(screen.getByText('一般参加者向けチケット')).toBeInTheDocument();
    expect(screen.getByText('学生向け割引チケット')).toBeInTheDocument();
  });

  it('チケットがない場合は「チケット情報なし」と表示される', () => {
    render(<EventDetailCard event={mockEvent} tickets={[]} />);

    expect(screen.getByText('チケット情報なし')).toBeInTheDocument();
  });

  it('イベント説明文が長い場合は省略表示される', () => {
    const longDescEvent = {
      ...mockEvent,
      description: 'a'.repeat(300)
    };
    
    render(<EventDetailCard event={longDescEvent} tickets={mockTickets} />);
    
    const description = screen.getByText(/^a+/);
    expect(description.textContent?.length).toBeLessThan(300);
    expect(description).toHaveTextContent('...');
  });
});
```