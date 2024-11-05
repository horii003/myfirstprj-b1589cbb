```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SurveyAnswerForm from '@/pages/SurveyAnswerForm';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';

const mockSurvey = {
  id: 'survey-1',
  title: 'イベントアンケート',
  description: 'イベントの感想をお聞かせください'
};

const mockQuestions = [
  {
    id: 'q1',
    type: 'radio',
    title: '満足度を教えてください',
    required: true,
    options: ['とても満足', '満足', '普通', '不満']
  },
  {
    id: 'q2', 
    type: 'text',
    title: 'ご意見・ご感想をお聞かせください',
    required: false
  },
  {
    id: 'q3',
    type: 'checkbox',
    title: '興味のある項目を選択してください',
    required: false,
    options: ['セミナー', 'ワークショップ', '交流会', '展示']
  }
];

const mockOnSubmit = jest.fn();

describe('SurveyAnswerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('アンケートのタイトルと説明が表示される', () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('イベントアンケート')).toBeInTheDocument();
    expect(screen.getByText('イベントの感想をお聞かせください')).toBeInTheDocument();
  });

  it('全ての質問項目が表示される', () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    mockQuestions.forEach(question => {
      expect(screen.getByText(question.title)).toBeInTheDocument();
    });
  });

  it('ラジオボタンの選択が正しく動作する', async () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    const radioOption = screen.getByLabelText('満足');
    await userEvent.click(radioOption);
    expect(radioOption).toBeChecked();
  });

  it('テキスト入力が正しく動作する', async () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    const textInput = screen.getByRole('textbox');
    await userEvent.type(textInput, 'とても良い経験になりました');
    expect(textInput).toHaveValue('とても良い経験になりました');
  });

  it('チェックボックスの選択が正しく動作する', async () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    const checkbox1 = screen.getByLabelText('セミナー');
    const checkbox2 = screen.getByLabelText('ワークショップ');
    
    await userEvent.click(checkbox1);
    await userEvent.click(checkbox2);

    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked();
  });

  it('必須項目が未入力の場合エラーメッセージが表示される', async () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: '送信' });
    await userEvent.click(submitButton);

    expect(await screen.findByText('この質問は必須です')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('全ての必須項目が入力された場合、フォームが送信される', async () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    // 必須項目の入力
    await userEvent.click(screen.getByLabelText('満足'));
    
    const submitButton = screen.getByRole('button', { name: '送信' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const expectedSubmitData = {
      surveyId: mockSurvey.id,
      answers: [
        { questionId: 'q1', answer: '満足' },
      ]
    };

    expect(mockOnSubmit).toHaveBeenCalledWith(expectedSubmitData);
  });

  it('送信中は送信ボタンが無効化される', async () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    await userEvent.click(screen.getByLabelText('満足'));
    
    const submitButton = screen.getByRole('button', { name: '送信' });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('送信中...')).toBeInTheDocument();
  });

  it('リセットボタンでフォームがクリアされる', async () => {
    render(
      <SurveyAnswerForm
        survey={mockSurvey}
        questions={mockQuestions}
        onSubmit={mockOnSubmit}
      />
    );

    const textInput = screen.getByRole('textbox');
    await userEvent.type(textInput, 'テストコメント');
    await userEvent.click(screen.getByLabelText('満足'));
    await userEvent.click(screen.getByLabelText('セミナー'));

    const resetButton = screen.getByRole('button', { name: 'リセット' });
    await userEvent.click(resetButton);

    expect(textInput).toHaveValue('');
    expect(screen.getByLabelText('満足')).not.toBeChecked();
    expect(screen.getByLabelText('セミナー')).not.toBeChecked();
  });
});
```