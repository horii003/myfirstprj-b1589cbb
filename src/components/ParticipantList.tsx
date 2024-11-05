import React, { useState, useEffect, useMemo } from 'react';
import { FiDownload, FiMoreVertical, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BsFilter } from 'react-icons/bs';

type ParticipantType = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  registeredAt: string;
  status: string;
};

type ParticipantListProps = {
  participants: ParticipantType[];
  onAction: (participant: ParticipantType | ParticipantType[]) => void;
};

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, onAction }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ParticipantType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const itemsPerPage = 10;

  const filteredParticipants = useMemo(() => {
    return participants
      .filter(p => 
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter ? p.status === statusFilter : true)
      )
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }, [participants, search, statusFilter, sortField, sortDirection]);

  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredParticipants.slice(start, start + itemsPerPage);
  }, [filteredParticipants, currentPage]);

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);

  const handleSort = (field: keyof ParticipantType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', '氏名', 'メール', 'チケットタイプ', '登録日時', 'ステータス'];
    const csvContent = [
      headers.join(','),
      ...filteredParticipants.map(p => 
        [p.id, p.name, p.email, p.ticketType, p.registeredAt, p.status].join(',')
      )
    ].join('
');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'participants.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkAction = () => {
    const selectedItems = participants.filter(p => selectedParticipants.includes(p.id));
    onAction(selectedItems);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParticipants(paginatedParticipants.map(p => p.id));
    } else {
      setSelectedParticipants([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="参加者を検索..."
            className="px-4 py-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="ステータス"
          >
            <option value="">全てのステータス</option>
            <option value="参加予定">参加予定</option>
            <option value="キャンセル">キャンセル</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleBulkAction}
            disabled={selectedParticipants.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            一括操作
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            <FiDownload />
            CSVエクスポート
          </button>
        </div>
      </div>

      {filteredParticipants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">参加者がいません</div>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedParticipants.length === paginatedParticipants.length}
                  />
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  氏名
                </th>
                <th className="px-4 py-2">メール</th>
                <th className="px-4 py-2">チケットタイプ</th>
                <th className="px-4 py-2">登録日時</th>
                <th className="px-4 py-2">ステータス</th>
                <th className="px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedParticipants.map((participant) => (
                <tr key={participant.id} role="row">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants([...selectedParticipants, participant.id]);
                        } else {
                          setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">{participant.name}</td>
                  <td className="px-4 py-2">{participant.email}</td>
                  <td className="px-4 py-2">{participant.ticketType}</td>
                  <td className="px-4 py-2">
                    {new Date(participant.registeredAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      participant.status === '参加予定' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {participant.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onAction(participant)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      aria-label="操作"
                    >
                      <FiMoreVertical />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              全{filteredParticipants.length}件中 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredParticipants.length)}件を表示
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50"
                aria-label="前のページ"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50"
                aria-label="次のページ"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantList;