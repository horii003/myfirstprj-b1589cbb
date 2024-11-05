import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FaCalendarAlt, FaMoneyBillWave, FaUsers, FaEye, FaEdit } from 'react-icons/fa';
import axios from 'axios';

interface EventData {
  title: string;
  description: string;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  venue: {
    name: string;
    address: string;
  };
  registration_start: string;
  registration_end: string;
}

interface TicketData {
  name: string;
  price: number;
  capacity: number;
  description: string;
}

const EventCreate = () => {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState('');
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    description: '',
    event_type: 'オンライン',
    start_datetime: '',
    end_datetime: '',
    venue: {
      name: '',
      address: '',
    },
    registration_start: '',
    registration_end: '',
  });

  const [tickets, setTickets] = useState<TicketData[]>([{
    name: '',
    price: 0,
    capacity: 0,
    description: '',
  }]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    };
    checkAuth();
  }, []);

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTicketChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newTickets = [...tickets];
    newTickets[index] = {
      ...newTickets[index],
      [name]: name === 'price' || name === 'capacity' ? Number(value) : value
    };
    setTickets(newTickets);
  };

  const addTicket = () => {
    setTickets([...tickets, {
      name: '',
      price: 0,
      capacity: 0,
      description: '',
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/events/create', {
        event: eventData,
        tickets: tickets
      });
      router.push(`/events/${response.data.id}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">イベント作成</h1>
        
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isPreview ? <><FaEdit className="mr-2" />編集に戻る</> : <><FaEye className="mr-2" />プレビュー</>}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="mock-event-form">
          <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${isPreview ? 'hidden' : ''}`}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  イベント名 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={eventData.title}
                  onChange={handleEventChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  aria-label="イベント名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleEventChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  aria-label="説明"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始日時 *
                  </label>
                  <input
                    type="datetime-local"
                    name="start_datetime"
                    value={eventData.start_datetime}
                    onChange={handleEventChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    終了日時 *
                  </label>
                  <input
                    type="datetime-local"
                    name="end_datetime"
                    value={eventData.end_datetime}
                    onChange={handleEventChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${isPreview ? 'hidden' : ''}`}>
            <h2 className="text-xl font-bold mb-4">チケット設定</h2>
            {tickets.map((ticket, index) => (
              <div key={index} className="mb-6 border-b pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      チケット名
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={ticket.name}
                      onChange={(e) => handleTicketChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      価格
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={ticket.price}
                      onChange={(e) => handleTicketChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTicket}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ＋ チケットを追加
            </button>
          </div>

          {isPreview && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6" data-testid="preview-mode">
              <h2 className="text-2xl font-bold mb-4">{eventData.title || 'イベントタイトル'}</h2>
              <div className="prose max-w-none">
                <p>{eventData.description || '説明文がありません'}</p>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-3">チケット情報</h3>
                {tickets.map((ticket, index) => (
                  <div key={index} className="border-b py-3">
                    <h4 className="font-bold">{ticket.name || 'チケット名未設定'}</h4>
                    <p className="text-gray-600">¥{ticket.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreate;