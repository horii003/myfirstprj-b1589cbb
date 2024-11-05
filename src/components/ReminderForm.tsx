import { useState, useEffect } from 'react';
import { FiClock, FiMail, FiCheckSquare, FiAlertTriangle } from 'react-icons/fi';

type ReminderSettingsType = {
  enabled: boolean;
  timing: {
    days: number;
    hours: number;
  };
  template: {
    subject: string;
    body: string;
  };
  targets: string[];
};

type ReminderFormProps = {
  settings?: ReminderSettingsType;
  onSubmit: (settings: ReminderSettingsType) => Promise<void>;
};

export default function ReminderForm({ settings, onSubmit }: ReminderFormProps) {
  const [formData, setFormData] = useState<ReminderSettingsType>({
    enabled: settings?.enabled ?? false,
    timing: {
      days: settings?.timing?.days ?? 1,
      hours: settings?.timing?.hours ?? 0,
    },
    template: {
      subject: settings?.template?.subject ?? '',
      body: settings?.template?.body ?? '',
    },
    targets: settings?.targets ?? ['全員'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (formData.timing.days < 0) {
      errors.days = '0以上の値を入力してください';
    }
    if (formData.timing.hours < 0) {
      errors.hours = '0以上の値を入力してください';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(`エラー: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTargetChange = (target: string) => {
    if (target === '全員') {
      setFormData(prev => ({
        ...prev,
        targets: ['全員']
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targets: prev.targets.includes('全員') 
          ? [target]
          : prev.targets.includes(target)
            ? prev.targets.filter(t => t !== target)
            : [...prev.targets, target]
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FiMail className="mr-2" />
        リマインドメール設定
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="form-checkbox h-5 w-5 text-blue-600"
              aria-label="有効化"
            />
            <span>リマインドメールを有効にする</span>
          </label>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FiClock className="mr-2" />
            送信タイミング
          </h3>
          <div className="flex items-center space-x-4">
            <div>
              <input
                type="number"
                value={formData.timing.days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  timing: { ...prev.timing, days: parseInt(e.target.value) }
                }))}
                className="form-input w-20 px-3 py-2 border rounded"
                aria-label="日前"
              />
              <span className="ml-2">日前</span>
            </div>
            <div>
              <input
                type="number"
                value={formData.timing.hours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  timing: { ...prev.timing, hours: parseInt(e.target.value) }
                }))}
                className="form-input w-20 px-3 py-2 border rounded"
                aria-label="時間前"
              />
              <span className="ml-2">時間前</span>
            </div>
          </div>
          {validationErrors.days && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.days}</p>
          )}
          {validationErrors.hours && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.hours}</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">メール内容</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="block mb-1">件名</label>
              <input
                id="subject"
                type="text"
                value={formData.template.subject}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  template: { ...prev.template, subject: e.target.value }
                }))}
                className="form-input w-full px-3 py-2 border rounded"
                aria-label="件名"
              />
            </div>
            <div>
              <label htmlFor="body" className="block mb-1">本文</label>
              <textarea
                id="body"
                value={formData.template.body}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  template: { ...prev.template, body: e.target.value }
                }))}
                className="form-textarea w-full px-3 py-2 border rounded"
                rows={5}
                aria-label="本文"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FiCheckSquare className="mr-2" />
            送信対象
          </h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.targets.includes('全員')}
                onChange={() => handleTargetChange('全員')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>全員</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.targets.includes('未支払いの参加者')}
                onChange={() => handleTargetChange('未支払いの参加者')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>未支払いの参加者</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <FiAlertTriangle className="mr-2" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}