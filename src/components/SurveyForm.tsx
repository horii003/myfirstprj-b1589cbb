import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FiTrash2, FiPlus } from 'react-icons/fi';

type QuestionType = {
  id: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options: string[];
};

type SurveyType = {
  id: string;
  title: string;
  description: string;
  questions: QuestionType[];
};

type SurveyFormProps = {
  survey?: SurveyType;
  onSubmit: (survey: SurveyType) => void;
};

const SurveyForm: React.FC<SurveyFormProps> = ({ survey, onSubmit }) => {
  const [formData, setFormData] = useState<SurveyType>({
    id: survey?.id || '',
    title: survey?.title || '',
    description: survey?.description || '',
    questions: survey?.questions || []
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuestionType = {
      id: uuidv4(),
      text: '',
      type: 'text',
      required: false,
      options: []
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<QuestionType>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const addOption = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, options: [...q.options, ''] } : q
      )
    }));
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, i) => (i === index ? value : opt)) }
          : q
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-6">
        {formData.questions.map((question, index) => (
          <div key={question.id} className="p-4 border rounded-lg shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">質問{index + 1}</h3>
              <button
                type="button"
                onClick={() => deleteQuestion(question.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 className="w-5 h-5" />
                <span className="sr-only">削除</span>
              </button>
            </div>

            <div>
              <label htmlFor={`question-${question.id}`} className="block text-sm font-medium text-gray-700">
                質問{index + 1}
              </label>
              <input
                id={`question-${question.id}`}
                type="text"
                value={question.text}
                onChange={e => updateQuestion(question.id, { text: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor={`type-${question.id}`} className="block text-sm font-medium text-gray-700">
                  質問タイプ
                </label>
                <select
                  id={`type-${question.id}`}
                  value={question.type}
                  onChange={e => updateQuestion(question.id, { type: e.target.value as QuestionType['type'] })}
                  className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="text">テキスト</option>
                  <option value="radio">ラジオボタン</option>
                  <option value="checkbox">チェックボックス</option>
                  <option value="textarea">テキストエリア</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id={`required-${question.id}`}
                  type="checkbox"
                  checked={question.required}
                  onChange={e => updateQuestion(question.id, { required: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`required-${question.id}`} className="ml-2 block text-sm text-gray-700">
                  必須
                </label>
              </div>
            </div>

            {(question.type === 'radio' || question.type === 'checkbox') && (
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <label className="block text-sm font-medium text-gray-700">
                      選択肢{optionIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={e => updateOption(question.id, optionIndex, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(question.id)}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <FiPlus className="mr-1" />
                  選択肢を追加
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FiPlus className="mr-2" />
          質問を追加
        </button>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          保存
        </button>
      </div>
    </form>
  );
};

export default SurveyForm;