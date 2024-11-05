import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiUsers, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

type SeriesType = {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  frequency: string;
  eventTimes?: string[];
  maxParticipants?: number;
  price?: number;
  location?: string;
};

type SeriesFormProps = {
  series?: SeriesType;
  onSubmit: (data: SeriesType) => void;
};

const SeriesForm: React.FC<SeriesFormProps> = ({ series, onSubmit }) => {
  const [formData, setFormData] = useState<SeriesType>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    frequency: 'weekly',
    eventTimes: [],
    maxParticipants: undefined,
    price: undefined,
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (series) {
      setFormData(series);
    }
  }, [series]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = 'タイトルは必須です';
    }
    if (!formData.startDate) {
      newErrors.startDate = '開始日は必須です';
    }
    if (!formData.endDate) {
      newErrors.endDate = '終了日は必須です';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '終了日は開始日より後の日付を選択してください';
    }
    if (formData.maxParticipants !== undefined && formData.maxParticipants < 1) {
      newErrors.maxParticipants = '最大参加者数は1以上の数値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      frequency: 'weekly',
      eventTimes: [],
      maxParticipants: undefined,
      price: undefined,
      location: '',
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            シリーズタイトル
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              開始日
            </label>
            <div className="mt-1 relative">
              <FiCalendar className="absolute top-3 left-3 text-gray-400" />
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              終了日
            </label>
            <div className="mt-1 relative">
              <FiCalendar className="absolute top-3 left-3 text-gray-400" />
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
            開催頻度
          </label>
          <div className="mt-1 relative">
            <FiClock className="absolute top-3 left-3 text-gray-400" />
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
            最大参加者数
          </label>
          <div className="mt-1 relative">
            <FiUsers className="absolute top-3 left-3 text-gray-400" />
            <input
              type="number"
              id="maxParticipants"
              value={formData.maxParticipants || ''}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || undefined })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
            />
            {errors.maxParticipants && <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            保存
          </button>
        </div>
      </div>
    </form>
  );
};

export default SeriesForm;