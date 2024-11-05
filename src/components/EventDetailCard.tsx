import React from 'react';
import { FaMapMarkerAlt, FaClock, FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type EventType = {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDatetime: string;
  endDatetime: string;
  venue: {
    name: string;
    address: string;
  };
  registrationStart: string;
  registrationEnd: string;
  status: string;
};

type TicketType = {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
};

type Props = {
  event: EventType;
  tickets: TicketType[];
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy年M月d日 HH:mm', { locale: ja });
};

const formatPrice = (price: number) => {
  return `¥${price.toLocaleString()}`;
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const EventDetailCard: React.FC<Props> = ({ event, tickets }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {event.status}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{truncateText(event.description, 200)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center text-gray-700">
            <FaCalendarAlt className="mr-2" />
            <div>
              <div>開始：{formatDate(event.startDatetime)}</div>
              <div>終了：{formatDate(event.endDatetime)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="mr-2" />
            <div>
              <div>{event.venue.name}</div>
              <div className="text-sm text-gray-500">{event.venue.address}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <FaClock className="mr-2" />
            <div>
              <div>申込開始：{formatDate(event.registrationStart)}</div>
              <div>申込締切：{formatDate(event.registrationEnd)}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <FaTicketAlt className="mr-2" />
            <h2 className="text-lg font-semibold">チケット情報</h2>
          </div>
          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{ticket.name}</span>
                    <span className="text-blue-600 font-semibold">
                      {formatPrice(ticket.price)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    定員: {ticket.capacity}名
                  </div>
                  <div className="text-sm text-gray-600">
                    {ticket.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">チケット情報なし</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailCard;