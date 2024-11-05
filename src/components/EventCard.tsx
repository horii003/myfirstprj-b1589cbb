import React from 'react';
import { FaMapMarkerAlt, FaClock, FaVideo, FaBuilding } from 'react-icons/fa';

type VenueType = {
  name: string;
  address: string;
};

type EventType = {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDatetime: string;
  endDatetime: string;
  venue: VenueType;
  status: string;
};

type EventCardProps = {
  event: EventType;
  onClick: (event: EventType) => void;
};

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  if (!event || !onClick) {
    throw new Error('Required props missing in EventCard');
  }

  const formatDateTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const day = startDate.getDate();
    const startTime = startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

    return `${year}年${month}月${day}日 ${startTime}〜${endTime}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      data-testid="event-card"
      className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(event)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
        <span className="status-badge px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
          {event.status}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{truncateText(event.description, 150)}</p>

      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          {event.eventType === 'オンライン' ? (
            <FaVideo className="mr-2" />
          ) : (
            <FaBuilding className="mr-2" />
          )}
          <span className="mr-2">{event.eventType}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <FaClock className="mr-2" />
          <span>{formatDateTime(event.startDatetime, event.endDatetime)}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <FaMapMarkerAlt className="mr-2" />
          <span>{event.venue.name}</span>
          {event.eventType === 'オフライン' && event.venue.address && (
            <span className="ml-2">{event.venue.address}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;