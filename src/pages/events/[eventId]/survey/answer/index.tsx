import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    type: string;
    required: boolean;
    question: string;
    options?: string[];
  }[];
}

export default function SurveyAnswer() {
  const router = useRouter();
  const { eventId } = router.query;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .eq('event_id', eventId)
          .single();

        if (error) throw error;
        setSurvey(data);
      } catch (err) {
        setError('アンケートの取得に失敗しました。');
      }
    };

    if (eventId) {
      fetchSurvey();
    }
  }, [eventId]);

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert([
          {
            survey_id: survey?.id,
            event_id: eventId,
            answers: answers
          }
        ]);

      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      setError('回答の送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 p-4 rounded-lg flex items-center">
            <FiAlertTriangle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-green-50 p-8 rounded-lg text-center">
            <FiCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">回答ありがとうございました</h2>
            <p className="text-green-600">アンケートの回答が正常に送信されました。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-4xl mx-auto p-6">
        {survey ? (
          <form onSubmit={handleSubmit} role="form" className="bg-white shadow-sm rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">{survey.title}</h1>
            <p className="text-gray-600 mb-8">{survey.description}</p>

            {survey.questions.map((question) => (
              <div key={question.id} className="mb-6">
                <label className="block mb-2">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {question.type === 'text' ? (
                  <input
                    type="text"
                    required={question.required}
                    className="w-full p-2 border rounded"
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    data-testid={`answer${question.id}`}
                  />
                ) : question.type === 'radio' && question.options ? (
                  <select
                    required={question.required}
                    className="w-full p-2 border rounded"
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    data-testid={`answer${question.id}`}
                  >
                    <option value="">選択してください</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">アンケートを読み込んでいます...</p>
          </div>
        )}
      </div>
    </div>
  );
}