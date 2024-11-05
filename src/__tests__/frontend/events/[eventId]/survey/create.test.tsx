```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SurveyCreatePage from '@/pages/events/[eventId]/survey/create';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { useRouter } from 'next/navigation';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('SurveyCreatePage', () => {
  const mockRouter = {
    push: jest.fn(),
    query: { eventId: 'test-event-id' }
  };

  beforeEach(() => {
    mockUseRouter.mockImplementation(() => mockRouter);
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    render(<SurveyCreatePage />);
    
    expect(screen.getByText('アンケート作成')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'プレビュー' })).toBeInTheDocument();
  });

  it('質問項目を追加できること', async () => {
    render(<SurveyCreatePage />);
    
    const addButton = screen.getByRole('button', { name: '質問を追加' });
    await userEvent.click(addButton);
    
    expect(screen.getByLabelText('質問文')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '質問タイプ' })).toBeInTheDocument();
  });

  it('必須項目が未入力の場合エラーが表示されること', async () => {
    render(<SurveyCreatePage />);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveButton);
    
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
  });

  it('アンケートを正常に保存できること', async () => {
    const mockAxios = {
      post: jest.fn().mockResolvedValue({ data: { id: 'test-survey-id' } })
    };
    global.axios = mockAxios as any;

    render(<SurveyCreatePage />);
    
    await userEvent.type(screen.getByLabelText('アンケートタイトル'), 'テストアンケート');
    await userEvent.type(screen.getByLabelText('説明'), 'テストの説明文です');
    
    const addButton = screen.getByRole('button', { name: '質問を追加' });
    await userEvent.click(addButton);
    
    await userEvent.type(screen.getByLabelText('質問文'), 'テスト質問1');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '質問タイプ' }), '選択式');
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/surveys'),
        expect.objectContaining({
          title: 'テストアンケート',
          description: 'テストの説明文です'
        })
      );
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('/events/test-event-id/survey/test-survey-id')
    );
  });

  it('プレビューモードを切り替えられること', async () => {
    render(<SurveyCreatePage />);
    
    const previewButton = screen.getByRole('button', { name: 'プレビュー' });
    await userEvent.click(previewButton);
    
    expect(screen.getByText('プレビューモード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '編集に戻る' })).toBeInTheDocument();
  });

  it('質問項目を削除できること', async () => {
    render(<SurveyCreatePage />);
    
    const addButton = screen.getByRole('button', { name: '質問を追加' });
    await userEvent.click(addButton);
    
    await userEvent.type(screen.getByLabelText('質問文'), 'テスト質問1');
    
    const deleteButton = screen.getByRole('button', { name: '質問を削除' });
    await userEvent.click(deleteButton);
    
    expect(screen.queryByText('テスト質問1')).not.toBeInTheDocument();
  });

  it('入力内容をリセットできること', async () => {
    render(<SurveyCreatePage />);
    
    await userEvent.type(screen.getByLabelText('アンケートタイトル'), 'テストアンケート');
    await userEvent.type(screen.getByLabelText('説明'), 'テストの説明文です');
    
    const resetButton = screen.getByRole('button', { name: 'リセット' });
    await userEvent.click(resetButton);
    
    expect(screen.getByLabelText('アンケートタイトル')).toHaveValue('');
    expect(screen.getByLabelText('説明')).toHaveValue('');
  });

  it('エラー発生時にエラーメッセージが表示されること', async () => {
    const mockAxios = {
      post: jest.fn().mockRejectedValue(new Error('保存に失敗しました'))
    };
    global.axios = mockAxios as any;

    render(<SurveyCreatePage />);
    
    await userEvent.type(screen.getByLabelText('アンケートタイトル'), 'テストアンケート');
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('保存に失敗しました')).toBeInTheDocument();
    });
  });
});
```