import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiMapPin, FiUser, FiClock, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import { supabase } from '@/supabase';

type VenueType = {
  name: string;
  address: string;
  capacity: number | null;
};

type EventType = {
  id?: string;
  title: string;
  description: string;
  eventType: string;
  startDatetime: string;
  endDatetime: string;
  venue: VenueType;
  registrationStart: string;
  registrationEnd: string;
  status: string;
};

type EventFormProps = {
  event?: EventType;
  onSubmit: (formData: EventType) => void;
};

const EventForm = ({ event, onSubmit }: EventFormProps) => {
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<EventType>({
    title: '',
    description: '',
    eventType: 'オンライン',
    startDatetime: '',
    endDatetime: '',
    venue: {
      name: '',
      address: '',
      capacity: null
    },
    registrationStart: '',
    registrationEnd: '',
    status: '下書き'
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title) {
      newErrors.title = 'タイトルは必須です';
    }
    if (!formData.startDatetime) {
      newErrors.startDatetime = '開始日時は必須です';
    }
    if (!formData.endDatetime) {
      newErrors.endDatetime = '終了日時は必須です';
    }

    if (formData.startDatetime && formData.endDatetime) {
      if (new Date(formData.endDatetime) <= new Date(formData.startDatetime)) {
        newErrors.endDatetime = '終了日時は開始日時より後に設定してください';
      }
    }

    if (formData.registrationStart && formData.registrationEnd) {
      if (new Date(formData.registrationEnd) <= new Date(formData.registrationStart)) {
        newErrors.registrationEnd = '募集終了日時は募集開始日時より後に設定してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            イベントタイトル
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
            イベント形式
          </label>
          <select
            id="eventType"
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="オンライン">オンライン</option>
            <option value="オフライン">オフライン</option>
            <option value="ハイブリッド">ハイブリッド</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDatetime" className="block text-sm font-medium text-gray-700">
              開始日時
            </label>
            <input
              id="startDatetime"
              type="datetime-local"
              value={formData.startDatetime}
              onChange={(e) => setFormData({ ...formData, startDatetime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.startDatetime && <p className="text-red-500 text-sm mt-1">{errors.startDatetime}</p>}
          </div>

          <div>
            <label htmlFor="endDatetime" className="block text-sm font-medium text-gray-700">
              終了日時
            </label>
            <input
              id="endDatetime"
              type="datetime-local"
              value={formData.endDatetime}
              onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.endDatetime && <p className="text-red-500 text-sm mt-1">{errors.endDatetime}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
            会場名
          </label>
          <input
            id="venueName"
            type="text"
            value={formData.venue.name}
            onChange={(e) => setFormData({
              ...formData,
              venue: { ...formData.venue, name: e.target.value }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="registrationStart" className="block text-sm font-medium text-gray-700">
              募集開始日時
            </label>
            <input
              id="registrationStart"
              type="datetime-local"
              value={formData.registrationStart}
              onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="registrationEnd" className="block text-sm font-medium text-gray-700">
              募集終了日時
            </label>
            <input
              id="registrationEnd"
              type="datetime-local"
              value={formData.registrationEnd}
              onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.registrationEnd && <p className="text-red-500 text-sm mt-1">{errors.registrationEnd}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </form>
  );
};

export default EventForm;