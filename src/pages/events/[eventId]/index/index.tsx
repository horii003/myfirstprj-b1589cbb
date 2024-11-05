import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaTicketAlt } from 'react-icons/fa';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

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
}

const EventDetail = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string>('');
  const [registeredCount, setRegisteredCount] = useState(0);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('event_id', eventId);

        if (ticketError) throw ticketError;
        setTickets(ticketData);

        const { count, error: registrationError } = await supabase
          .from('registrations')
          .select('*', { count: 'exact' })
          .eq('event_id', eventId);

        if (registrationError) throw registrationError;
        setRegisteredCount(count || 0);

      } catch (error) {
        setError('データの取得に失敗しました');
        console.error(error);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (error) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            エラーが発生しました
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年M月d日(E) HH:mm', { locale: ja });
  };

  const totalCapacity = tickets.reduce((sum, ticket) => sum + ticket.capacity, 0);
  const isFullyBooked = registeredCount >= totalCapacity;

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64">
            <img
              src="https://placehold.co/1200x400"
              alt="イベントバナー"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="event-detail-card">
              {event.title}
            </h1>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <FaCalendarAlt className="mr-2" />
                <span>
                  {formatDate(event.start_datetime)} 〜 {format(new Date(event.end_datetime), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <span>{event.venue.name}<br />{event.venue.address}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaUsers className="mr-2" />
                <span>残席: {totalCapacity - registeredCount}名</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">イベント詳細</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaTicketAlt className="mr-2" />
                チケット
              </h2>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ticket.name}</span>
                      <span className="text-lg font-bold">¥{ticket.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push(`/events/${eventId}/register`)}
                disabled={isFullyBooked}
                className={`px-8 py-3 rounded-lg text-white font-semibold
                  ${isFullyBooked
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isFullyBooked ? '定員に達しました' : '参加登録'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;