```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SurveyForm from '@/pages/SurveyForm';

const mockOnSubmit = jest.fn();

const defaultProps = {
  survey: {
    id: '',
    title: '',
    description: '',
    questions: []
  },
  onSubmit: mockOnSubmit
};

describe('SurveyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態で必須フィールドが空の場合にエラーが表示される', async () => {
    render(<SurveyForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('アンケートフォームに正しく入力できる', async () => {
    render(<SurveyForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('タイトル'), 'テストアンケート');
    await userEvent.type(screen.getByLabelText('説明'), 'テストの説明文です');
    
    const addQuestionButton = screen.getByRole('button', { name: '質問を追加' });
    fireEvent.click(addQuestionButton);

    await userEvent.type(screen.getByLabelText('質問1'), '好きな食べ物は？');
    
    const submitButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: '',
        title: 'テストアンケート',
        description: 'テストの説明文です',
        questions: [
          {
            id: expect.any(String),
            text: '好きな食べ物は？',
            type: 'text',
            required: false,
            options: []
          }
        ]
      });
    });
  });

  it('質問の追加と削除が正しく動作する', async () => {
    render(<SurveyForm {...defaultProps} />);

    const addQuestionButton = screen.getByRole('button', { name: '質問を追加' });
    fireEvent.click(addQuestionButton);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      expect(screen.getByLabelText('質問1')).toBeInTheDocument();
      expect(screen.getByLabelText('質問2')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByLabelText('質問1')).not.toBeInTheDocument();
      expect(screen.getByLabelText('質問2')).toBeInTheDocument();
    });
  });

  it('質問タイプを変更できる', async () => {
    render(<SurveyForm {...defaultProps} />);

    const addQuestionButton = screen.getByRole('button', { name: '質問を追加' });
    fireEvent.click(addQuestionButton);

    const typeSelect = screen.getByLabelText('質問タイプ');
    fireEvent.change(typeSelect, { target: { value: 'radio' } });

    const addOptionButton = screen.getByRole('button', { name: '選択肢を追加' });
    fireEvent.click(addOptionButton);

    await userEvent.type(screen.getByLabelText('選択肢1'), 'オプション1');

    const submitButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        questions: [expect.objectContaining({
          type: 'radio',
          options: ['オプション1']
        })]
      }));
    });
  });

  it('既存のアンケートデータを編集できる', async () => {
    const existingSurvey = {
      id: '1',
      title: '既存アンケート',
      description: '既存の説明',
      questions: [
        {
          id: '1',
          text: '既存の質問',
          type: 'text',
          required: true,
          options: []
        }
      ]
    };

    render(<SurveyForm survey={existingSurvey} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('タイトル')).toHaveValue('既存アンケート');
    expect(screen.getByLabelText('説明')).toHaveValue('既存の説明');
    expect(screen.getByLabelText('質問1')).toHaveValue('既存の質問');

    await userEvent.clear(screen.getByLabelText('タイトル'));
    await userEvent.type(screen.getByLabelText('タイトル'), '更新後のタイトル');

    const submitButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        title: '更新後のタイトル',
        description: '既存の説明'
      }));
    });
  });

  it('必須フィールドのトグルが正しく動作する', async () => {
    render(<SurveyForm {...defaultProps} />);

    const addQuestionButton = screen.getByRole('button', { name: '質問を追加' });
    fireEvent.click(addQuestionButton);

    const requiredToggle = screen.getByRole('checkbox', { name: '必須' });
    fireEvent.click(requiredToggle);

    const submitButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        questions: [expect.objectContaining({
          required: true
        })]
      }));
    });
  });
});
```