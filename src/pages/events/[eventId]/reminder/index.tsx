import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiMail, FiClock, FiSend, FiSave } from 'react-icons/fi';
import { MdPreview } from 'react-icons/md';
import { toast } from 'react-hot-toast';

type ReminderSettings = {
  id: string;
  eventId: string;
  subject: string;
  body: string;
  sendTiming: number;
  enabled: boolean;
};

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
};

export default function ReminderPage() {
  const router = useRouter();
  const { eventId } = router.query;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [settings, setSettings] = useState<ReminderSettings>({
    id: '',
    eventId: eventId as string,
    subject: '',
    body: '',
    sendTiming: 24,
    enabled: true
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchReminderSettings();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      setEvent(data);
    } catch (error) {
      toast.error('イベント情報の取得に失敗しました');
    }
  };

  const fetchReminderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('reminderSettings')
        .select('*')
        .eq('eventId', eventId)
        .single();
      
      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('リマインダー設定の取得に失敗しました');
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!settings.subject) newErrors.subject = '件名は必須です';
    if (!settings.body) newErrors.body = '本文は必須です';
    if (settings.sendTiming < 1) newErrors.sendTiming = '送信タイミングは1時間以上に設定してください';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reminderSettings')
        .upsert({
          ...settings,
          eventId: eventId
        });

      if (error) throw error;
      toast.success('設定を保存しました');
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSend = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/reminder/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error();
      toast.success('テストメールを送信しました');
    } catch (error) {
      toast.error('テストメール送信に失敗しました');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <FiMail className="mr-2" />
            リマインドメール設定
          </h1>

          {event && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">件名</label>
              <input
                type="text"
                value={settings.subject}
                onChange={(e) => setSettings({...settings, subject: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                aria-label="件名"
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">本文</label>
              <textarea
                value={settings.body}
                onChange={(e) => setSettings({...settings, body: e.target.value})}
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                aria-label="本文"
              />
              {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FiClock className="inline mr-1" />
                送信タイミング（時間前）
              </label>
              <input
                type="number"
                value={settings.sendTiming}
                onChange={(e) => setSettings({...settings, sendTiming: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                aria-label="送信タイミング"
              />
              {errors.sendTiming && <p className="text-red-500 text-sm mt-1">{errors.sendTiming}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
                className="rounded border-gray-300"
              />
              <label className="ml-2 text-sm">リマインドメールを有効にする</label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiSave className="mr-2" />
                保存
              </button>
              <button
                type="button"
                onClick={handleTestSend}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <MdPreview className="mr-2" />
                テスト送信
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}