import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiSearch, FiDownload, FiMail, FiEdit, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';

type Participant = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  status: string;
  registeredAt: string;
};

export default function ParticipantListPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      fetchParticipants();
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEventData(event);
    } catch (error) {
      setError('イベント情報の取得に失敗しました');
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/participants/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('CSVエクスポートに失敗しました');
    } catch (error) {
      setError('CSVエクスポートに失敗しました');
    }
  };

  const handleSendReminder = () => {
    router.push(`/events/${eventId}/mail/reminder`);
  };

  const handleBulkUpdate = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/participants/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: selectedParticipants }),
      });
      if (!response.ok) throw new Error('一括更新に失敗しました');
    } catch (error) {
      setError('一括更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="flex justify-center items-center h-screen">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{eventData?.title} - 参加者一覧</h1>
            <div className="flex gap-4">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FiDownload />
                CSVエクスポート
              </button>
              <button
                onClick={handleSendReminder}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <FiMail />
                リマインドメール送信
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="参加者を検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8">
              <p>参加者がいません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants(participants.map(p => p.id));
                          } else {
                            setSelectedParticipants([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      チケットタイプ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日時
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      onClick={() => router.push(`/events/${eventId}/participants/${participant.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(participant.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, participant.id]);
                            } else {
                              setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{participant.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{participant.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{participant.ticketType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          participant.status === '参加確定' ? 'bg-green-100 text-green-800' :
                          participant.status === 'キャンセル' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {participant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(participant.registeredAt), 'yyyy/MM/dd HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedParticipants.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleBulkUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <FiEdit />
                一括操作
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}