import { useState, useEffect } from 'react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdError } from 'react-icons/md';

type QuestionType = {
  id: string;
  type: 'radio' | 'text' | 'checkbox';
  title: string;
  required: boolean;
  options?: string[];
};

type SurveyType = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  survey: SurveyType;
  questions: QuestionType[];
  onSubmit: (data: { surveyId: string; answers: { questionId: string; answer: string | string[] }[] }) => void;
};

type AnswerType = {
  [key: string]: string | string[];
};

const SurveyAnswerForm = ({ survey, questions, onSubmit }: Props) => {
  const [answers, setAnswers] = useState<AnswerType>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (questionId: string, option: string) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(item => item !== option)
      : [...currentAnswers, option];
    handleInputChange(questionId, newAnswers);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = 'この質問は必須です';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      await onSubmit({
        surveyId: survey.id,
        answers: formattedAnswers,
      });
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setErrors({});
    setSubmitStatus('idle');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">{survey.title}</h2>
      <p className="text-gray-600 mb-6">{survey.description}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="border-b pb-6">
            <label className="block mb-2">
              <span className="text-lg font-semibold">
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>

            {question.type === 'radio' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'text' && (
              <textarea
                value={(answers[question.id] as string) || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            )}

            {question.type === 'checkbox' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(answers[question.id] as string[] || []).includes(option)}
                      onChange={() => handleCheckboxChange(question.id, option)}
                      className="form-checkbox text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {errors[question.id] && (
              <p className="text-red-500 mt-1">{errors[question.id]}</p>
            )}
          </div>
        ))}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            リセット
          </button>
        </div>

        {submitStatus === 'success' && (
          <div className="flex items-center text-green-600">
            <IoMdCheckmarkCircleOutline className="mr-2" />
            アンケートが送信されました
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center text-red-600">
            <MdError className="mr-2" />
            送信に失敗しました
          </div>
        )}
      </form>
    </div>
  );
};

export default SurveyAnswerForm;