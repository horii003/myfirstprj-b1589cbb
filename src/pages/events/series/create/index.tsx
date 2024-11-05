import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { BsCalendarEvent } from 'react-icons/bs';

const CreateSeriesPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('seriesDraft');
    if (savedData) {
      const { title, description, events } = JSON.parse(savedData);
      setTitle(title || '');
      setDescription(description || '');
      setEvents(events || []);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    if (events.length === 0) {
      newErrors.events = '最低1回のイベントを設定してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addEvent = () => {
    setEvents([...events, { startDateTime: '' }]);
  };

  const removeEvent = (index) => {
    const newEvents = [...events];
    newEvents.splice(index, 1);
    setEvents(newEvents);
  };

  const handleEventDateChange = (index, value) => {
    const newEvents = [...events];
    newEvents[index].startDateTime = value;
    setEvents(newEvents);
  };

  const saveDraft = () => {
    localStorage.setItem('seriesDraft', JSON.stringify({
      title,
      description,
      events
    }));
    setNotification('下書きを保存しました');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .insert([
          { title, description }
        ])
        .select()
        .single();

      if (seriesError) throw seriesError;

      const eventPromises = events.map(event => (
        supabase
          .from('events')
          .insert([{
            series_id: seriesData.id,
            title: `${title} #${events.indexOf(event) + 1}`,
            start_datetime: event.startDateTime,
            status: 'draft'
          }])
      ));

      await Promise.all(eventPromises);
      localStorage.removeItem('seriesDraft');
      router.push(`/events/series/${seriesData.id}`);
    } catch (error) {
      setErrors({ submit: error.message || 'サーバーエラーが発生しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">シリーズイベント作成</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="title">
                シリーズタイトル
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                aria-label="シリーズタイトル"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                説明
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                aria-label="説明"
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">回数設定</h2>
                <button
                  type="button"
                  onClick={addEvent}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <FiPlus className="mr-2" />
                  イベントを追加
                </button>
              </div>

              {events.map((event, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2">
                      開催日時
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={event.startDateTime}
                      onChange={(e) => handleEventDateChange(index, e.target.value)}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                      aria-label="開催日時"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvent(index)}
                    className="mt-8 p-2 text-red-500 hover:text-red-700"
                    aria-label="削除"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              ))}
              {errors.events && (
                <p className="text-red-500 text-sm">{errors.events}</p>
              )}
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
                {errors.submit}
              </div>
            )}

            {notification && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
                {notification}
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <button
                type="button"
                onClick={() => router.push('/events/series')}
                className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                キャンセル
              </button>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex items-center px-6 py-2 border rounded text-blue-600 hover:bg-blue-50"
                >
                  <FiSave className="mr-2" />
                  下書き保存
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  作成する
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSeriesPage;