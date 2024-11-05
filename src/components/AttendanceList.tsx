import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiCamera, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { supabase } from '@/supabase';
import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';

type ParticipantType = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
}

type AttendanceType = {
  participantId: string;
  status: 'present' | 'absent' | 'pending';
  checkedInAt?: Date;
}

type Props = {
  participants: ParticipantType[];
  attendance: AttendanceType[];
  onUpdate: (attendance: AttendanceType) => void;
}

const AttendanceList = ({ participants, attendance, onUpdate }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantType[]>([]);
  const [showQRReader, setShowQRReader] = useState(false);
  const [showExportMessage, setShowExportMessage] = useState(false);

  useEffect(() => {
    let filtered = participants.filter(participant => {
      const matchesSearch = participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTicket = ticketFilter === 'all' || participant.ticketType === ticketFilter;
      
      const participantAttendance = attendance.find(a => a.participantId === participant.id);
      const matchesStatus = statusFilter === 'all' || 
        (participantAttendance && participantAttendance.status === statusFilter);

      return matchesSearch && matchesTicket && matchesStatus;
    });

    setFilteredParticipants(filtered);
  }, [participants, searchQuery, ticketFilter, statusFilter, attendance]);

  const handleStatusUpdate = (participantId: string, status: 'present' | 'absent' | 'pending') => {
    const updatedAttendance: AttendanceType = {
      participantId,
      status,
      checkedInAt: status === 'present' ? new Date() : undefined
    };
    onUpdate(updatedAttendance);
  };

  const handleExport = async () => {
    const csvData = participants.map(participant => {
      const attendanceRecord = attendance.find(a => a.participantId === participant.id);
      return {
        名前: participant.name,
        メール: participant.email,
        チケット: participant.ticketType,
        ステータス: attendanceRecord ? 
          (attendanceRecord.status === 'present' ? '出席' : 
           attendanceRecord.status === 'absent' ? '欠席' : '未確認') : '未確認',
        チェックイン時間: attendanceRecord?.checkedInAt ? 
          format(new Date(attendanceRecord.checkedInAt), 'yyyy/MM/dd HH:mm', { locale: ja }) : '-'
      };
    });

    const headers = ['名前', 'メール', 'チケット', 'ステータス', 'チェックイン時間'];
    const csv = [
      headers.join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('
');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(new Date(), 'yyyyMMdd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setShowExportMessage(true);
    setTimeout(() => setShowExportMessage(false), 3000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="名前やメールアドレスで検索"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <select
            aria-label="チケットタイプ"
            className="border rounded-lg px-4 py-2"
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
          >
            <option value="all">全てのチケット</option>
            <option value="一般">一般</option>
            <option value="VIP">VIP</option>
          </select>

          <select
            aria-label="出欠ステータス"
            className="border rounded-lg px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">全てのステータス</option>
            <option value="present">出席</option>
            <option value="absent">欠席</option>
            <option value="pending">未確認</option>
          </select>

          <button
            onClick={() => setShowQRReader(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiCamera />
            QRコード読取
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FiDownload />
            CSVエクスポート
          </button>
        </div>
      </div>

      {showExportMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          エクスポートが完了しました
        </div>
      )}

      {filteredParticipants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          参加者がいません
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">名前</th>
                <th className="px-4 py-3 text-left">メールアドレス</th>
                <th className="px-4 py-3 text-left">チケット</th>
                <th className="px-4 py-3 text-left">ステータス</th>
                <th className="px-4 py-3 text-left">チェックイン時間</th>
                <th className="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => {
                const attendanceRecord = attendance.find(a => a.participantId === participant.id);
                return (
                  <tr key={participant.id} className="border-b">
                    <td className="px-4 py-3">{participant.name}</td>
                    <td className="px-4 py-3">{participant.email}</td>
                    <td className="px-4 py-3">{participant.ticketType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${
                          attendanceRecord?.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : attendanceRecord?.status === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {attendanceRecord?.status === 'present' ? '出席' :
                         attendanceRecord?.status === 'absent' ? '欠席' : '未確認'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {attendanceRecord?.checkedInAt
                        ? format(new Date(attendanceRecord.checkedInAt), 'HH:mm', { locale: ja })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          data-testid={`attendance-status-${participant.id}`}
                          onClick={() => {
                            const currentStatus = attendanceRecord?.status || 'pending';
                            const newStatus = currentStatus === 'present' ? 'pending' :
                                           currentStatus === 'pending' ? 'absent' : 'present';
                            handleStatusUpdate(participant.id, newStatus);
                          }}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          {attendanceRecord?.status === 'present' ? (
                            <FiCheck className="text-green-600" />
                          ) : attendanceRecord?.status === 'absent' ? (
                            <FiX className="text-red-600" />
                          ) : (
                            <FiClock className="text-gray-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showQRReader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">QRコードを読み取ってください</h3>
            <button
              onClick={() => setShowQRReader(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;