import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaSave, FaEye, FaTimes } from 'react-icons/fa';
import { IoMdArrowBack } from 'react-icons/io';

interface Event {
  id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  venue: {
    name: string;
    address: string;
  };
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
}

export default function EventEdit() {
  const router = useRouter();
  const { eventId } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [event, setEvent] = useState<Event>({
    id: '',
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    venue: {
      name: '',
      address: ''
    }
  });

  const [tickets, setTickets] = useState<Ticket[]>([{
    id: '',
    name: '',
    price: 0,
    capacity: 0,
    description: ''
  }]);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId);

      if (ticketError) throw ticketError;

      setEvent(eventData);
      setTickets(ticketData || []);
    } catch (error) {
      setError('イベント情報の取得に失敗しました');
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!event.title) errors.title = 'タイトルは必須です';
    if (!event.start_datetime) errors.start_datetime = '開始日時は必須です';
    if (!event.end_datetime) errors.end_datetime = '終了日時は必須です';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error: eventError } = await supabase
        .from('events')
        .update({
          title: event.title,
          description: event.description,
          start_datetime: event.start_datetime,
          end_datetime: event.end_datetime,
          venue: event.venue
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      for (const ticket of tickets) {
        const { error: ticketError } = await supabase
          .from('tickets')
          .upsert({
            event_id: eventId,
            name: ticket.name,
            price: ticket.price,
            capacity: ticket.capacity,
            description: ticket.description
          });

        if (ticketError) throw ticketError;
      }

      router.push(`/events/${eventId}`);
    } catch (error) {
      setError('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">イベント編集</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <IoMdArrowBack className="mr-1" />
            戻る
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                イベントタイトル
              </label>
              <input
                type="text"
                id="title"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                aria-label="イベントタイトル"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea
                id="description"
                value={event.description}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_datetime" className="block text-sm font-medium text-gray-700">
                  開始日時
                </label>
                <input
                  type="datetime-local"
                  id="start_datetime"
                  value={event.start_datetime}
                  onChange={(e) => setEvent({ ...event, start_datetime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  aria-label="開始日時"
                />
              </div>

              <div>
                <label htmlFor="end_datetime" className="block text-sm font-medium text-gray-700">
                  終了日時
                </label>
                <input
                  type="datetime-local"
                  id="end_datetime"
                  value={event.end_datetime}
                  onChange={(e) => setEvent({ ...event, end_datetime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  aria-label="終了日時"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">チケット情報</h3>
              {tickets.map((ticket, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      チケット名
                    </label>
                    <input
                      type="text"
                      value={ticket.name}
                      onChange={(e) => {
                        const newTickets = [...tickets];
                        newTickets[index].name = e.target.value;
                        setTickets(newTickets);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      aria-label="チケット名"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        価格
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].price = Number(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        aria-label="価格"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        定員
                      </label>
                      <input
                        type="number"
                        value={ticket.capacity}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].capacity = Number(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/events')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaTimes className="mr-2" />
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaEye className="mr-2" />
              プレビュー
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaSave className="mr-2" />
              {loading ? '更新中...' : '更新する'}
            </button>
          </div>
        </form>

        {isPreview && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <div className="mb-4 text-sm text-gray-500">プレビューモード</div>
            <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
            <p className="whitespace-pre-wrap mb-4">{event.description}</p>
            <div className="space-y-2">
              <p><span className="font-medium">開始:</span> {new Date(event.start_datetime).toLocaleString()}</p>
              <p><span className="font-medium">終了:</span> {new Date(event.end_datetime).toLocaleString()}</p>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">チケット情報</h3>
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={index} className="border p-4 rounded-md">
                    <p className="font-medium">{ticket.name}</p>
                    <p>価格: ¥{ticket.price.toLocaleString()}</p>
                    <p>定員: {ticket.capacity}名</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}