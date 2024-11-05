import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiSearch, FiDownload, FiRefreshCw } from 'react-icons/fi';

type Payment = {
  id: string;
  participantId: string;
  amount: number;
  status: string;
  dueDate: string;
  participantName: string;
  ticketType: string;
};

export default function PaymentManagementPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [eventId, page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('event_id', eventId)
        .range((page - 1) * 10, page * 10 - 1);

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', paymentId);

      if (error) throw error;
      await fetchPayments();
    } catch (err) {
      setError('ステータスの更新に失敗しました');
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: '支払い済み' })
        .in('id', selectedPayments);

      if (error) throw error;
      setSelectedPayments([]);
      await fetchPayments();
    } catch (err) {
      setError('一括更新に失敗しました');
    }
  };

  const exportCSV = () => {
    const headers = ['参加者名', 'チケットタイプ', '金額', '支払い状況', '支払期限'];
    const csvData = payments.map(payment => 
      `${payment.participantName},${payment.ticketType},${payment.amount},${payment.status},${payment.dueDate}`
    ).join('
');
    const csv = [headers.join(','), csvData].join('
');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', '支払い一覧.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.participantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">支払い管理</h1>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="参加者名で検索"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="ステータスフィルター"
            >
              <option value="all">すべてのステータス</option>
              <option value="未払い">未払い</option>
              <option value="支払い済み">支払い済み</option>
            </select>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiDownload /> CSV出力
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments(payments.map(p => p.id));
                        } else {
                          setSelectedPayments([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    参加者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    チケットタイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支払期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPayments([...selectedPayments, payment.id]);
                          } else {
                            setSelectedPayments(selectedPayments.filter(id => id !== payment.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.participantName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.ticketType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.amount}円</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className={`px-3 py-1 rounded-full text-sm ${
                          payment.status === '支払い済み'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                        onClick={() => {
                          const newStatus = payment.status === '未払い' ? '支払い済み' : '未払い';
                          updatePaymentStatus(payment.id, newStatus);
                        }}
                      >
                        {payment.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => updatePaymentStatus(payment.id, '支払い済み')}
                      >
                        支払い済みに更新
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-2">
              {selectedPayments.length > 0 && (
                <button
                  onClick={handleBulkUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  一括更新
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                前へ
              </button>
              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border rounded-lg"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}