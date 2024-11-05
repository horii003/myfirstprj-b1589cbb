import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FaPlus, FaTrash, FaEye, FaEdit, FaSave, FaUndo } from 'react-icons/fa';

type Question = {
    id: string;
    question: string;
    type: 'text' | 'radio' | 'checkbox' | 'textarea';
    required: boolean;
    options?: string[];
};

const SurveyCreatePage = () => {
    const router = useRouter();
    const { eventId } = router.query;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isPreview, setIsPreview] = useState(false);
    const [error, setError] = useState('');

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now().toString(),
            question: '',
            type: 'text',
            required: false,
            options: []
        }]);
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(questions.map(q => 
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const handleSave = async () => {
        if (!title) {
            setError('タイトルは必須です');
            return;
        }

        try {
            const { data: survey, error: surveyError } = await supabase
                .from('surveys')
                .insert([{
                    event_id: eventId,
                    title,
                    description,
                    questions: questions
                }])
                .select()
                .single();

            if (surveyError) throw surveyError;

            router.push(`/events/${eventId}/survey/${survey.id}`);
        } catch (err) {
            setError('保存に失敗しました');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setQuestions([]);
        setError('');
    };

    return (
        <div className="min-h-screen h-full bg-gray-50">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">アンケート作成</h1>

                <div className="bg-white rounded-lg shadow p-6">
                    {!isPreview ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="title">
                                    アンケートタイトル
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    aria-label="アンケートタイトル"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="description">
                                    説明
                                </label>
                                <textarea
                                    id="description"
                                    className="w-full border rounded-lg p-2"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    aria-label="説明"
                                />
                            </div>

                            <div className="space-y-4">
                                {questions.map((question) => (
                                    <div key={question.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between mb-4">
                                            <input
                                                type="text"
                                                className="w-full border rounded-lg p-2 mr-2"
                                                value={question.question}
                                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                                placeholder="質問文"
                                                aria-label="質問文"
                                            />
                                            <button
                                                onClick={() => deleteQuestion(question.id)}
                                                className="text-red-500"
                                                aria-label="質問を削除"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        <select
                                            className="w-full border rounded-lg p-2 mb-2"
                                            value={question.type}
                                            onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                            aria-label="質問タイプ"
                                        >
                                            <option value="text">テキスト</option>
                                            <option value="radio">選択式</option>
                                            <option value="checkbox">複数選択</option>
                                            <option value="textarea">長文回答</option>
                                        </select>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={question.required}
                                                onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                                                className="mr-2"
                                            />
                                            必須
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={addQuestion}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg"
                                    aria-label="質問を追加"
                                >
                                    <FaPlus className="mr-2" /> 質問を追加
                                </button>
                                <button
                                    onClick={() => setIsPreview(true)}
                                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg"
                                    aria-label="プレビュー"
                                >
                                    <FaEye className="mr-2" /> プレビュー
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg"
                                    aria-label="保存"
                                >
                                    <FaSave className="mr-2" /> 保存
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg"
                                    aria-label="リセット"
                                >
                                    <FaUndo className="mr-2" /> リセット
                                </button>
                            </div>

                            {error && (
                                <div className="text-red-500 mt-4">
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">プレビューモード</h2>
                                <button
                                    onClick={() => setIsPreview(false)}
                                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg"
                                    aria-label="編集に戻る"
                                >
                                    <FaEdit className="mr-2" /> 編集に戻る
                                </button>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-4">{title}</h3>
                                <p className="mb-6">{description}</p>

                                {questions.map((question) => (
                                    <div key={question.id} className="mb-6">
                                        <p className="font-medium mb-2">
                                            {question.question}
                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                        </p>

                                        {question.type === 'text' && (
                                            <input type="text" className="w-full border rounded-lg p-2" disabled />
                                        )}
                                        {question.type === 'textarea' && (
                                            <textarea className="w-full border rounded-lg p-2" disabled />
                                        )}
                                        {question.type === 'radio' && (
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <input type="radio" disabled className="mr-2" />
                                                    <span>選択肢1</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <input type="radio" disabled className="mr-2" />
                                                    <span>選択肢2</span>
                                                </div>
                                            </div>
                                        )}
                                        {question.type === 'checkbox' && (
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <input type="checkbox" disabled className="mr-2" />
                                                    <span>選択肢1</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <input type="checkbox" disabled className="mr-2" />
                                                    <span>選択肢2</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurveyCreatePage;