import { useState, useEffect } from 'react';
import { FiSave, FiRotateCcw } from 'react-icons/fi';

type UserSettingsType = {
  id: string;
  email: string;
  name: string;
  notificationEnabled: boolean;
  language: string;
  timezone: string;
};

type SettingsFormProps = {
  settings: UserSettingsType;
  onSubmit: (data: UserSettingsType) => Promise<void>;
};

const SettingsForm = ({ settings, onSubmit }: SettingsFormProps) => {
  const [formData, setFormData] = useState<UserSettingsType>(settings);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.name) {
      newErrors.name = '名前は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(settings);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="メールアドレス"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="名前"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="notificationEnabled"
              checked={formData.notificationEnabled}
              onChange={handleChange}
              className="rounded text-blue-500 focus:ring-blue-500"
              aria-label="通知を有効にする"
            />
            <span>通知を有効にする</span>
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            言語
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="言語"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            タイムゾーン
          </label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="タイムゾーン"
          >
            <option value="Asia/Tokyo">Asia/Tokyo</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <FiSave className="mr-2" />
          {isSubmitting ? '保存中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FiRotateCcw className="mr-2" />
          リセット
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;