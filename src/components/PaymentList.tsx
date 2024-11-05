import { useState, useEffect } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';

type PaymentType = {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  participantName: string;
  eventTitle: string;
};

type PaymentListProps = {
  payments: PaymentType[];
  onStatusUpdate: (id: string, status: string) => void;
};

const PaymentList = ({ payments, onStatusUpdate }: PaymentListProps) => {
  const [filteredPayments, setFilteredPayments] = useState<PaymentType[]>(payments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');

  useEffect(() => {
    let result = [...payments];

    if (searchTerm) {
      result = result.filter(payment =>
        payment.participantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(payment => payment.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredPayments(result);
  }, [payments, searchTerm, statusFilter, sortDirection]);

  const handleStatusUpdate = (id: string, newStatus: string) => {
    onStatusUpdate(id, newStatus);
    setShowStatusModal(false);
  };

  const handleBulkStatusUpdate = (status: string) => {
    selectedPayments.forEach(id => {
      onStatusUpdate(id, status);
    });
    setSelectedPayments([]);
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const togglePaymentSelection = (id: string) => {
    setSelectedPayments(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (payments.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        支払い情報がありません
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="参加者名で検索"
            className="pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">全てのステータス</option>
          <option value="未払い">未払い</option>
          <option value="支払い済み">支払い済み</option>
        </select>

        {selectedPayments.length > 0 && (
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            一括ステータス更新
          </button>
        )}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPayments(filteredPayments.map(p => p.id));
                  } else {
                    setSelectedPayments([]);
                  }
                }}
              />
            </th>
            <th className="p-4 text-left">参加者</th>
            <th className="p-4 text-left">イベント</th>
            <th className="p-4 text-left">
              <button
                onClick={toggleSort}
                className="flex items-center"
                aria-label="支払期限でソート"
              >
                支払期限
                {sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </th>
            <th className="p-4 text-right">金額</th>
            <th className="p-4 text-center">ステータス</th>
            <th className="p-4 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment) => (
            <tr key={payment.id} className="border-t" role="row">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedPayments.includes(payment.id)}
                  onChange={() => togglePaymentSelection(payment.id)}
                />
              </td>
              <td className="p-4">{payment.participantName}</td>
              <td className="p-4">{payment.eventTitle}</td>
              <td className="p-4">{payment.dueDate}</td>
              <td className="p-4 text-right" data-testid="payment-amount">
                ¥{payment.amount.toLocaleString()}
              </td>
              <td className="p-4 text-center">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  payment.status === '支払い済み' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {payment.status}
                </span>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => {
                    setSelectedPaymentId(payment.id);
                    setShowStatusModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="ステータス変更"
                >
                  <FiEdit2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">ステータスを更新</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (selectedPaymentId) {
                    handleStatusUpdate(selectedPaymentId, '支払い済み');
                  } else {
                    handleBulkStatusUpdate('支払い済み');
                  }
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                {selectedPaymentId ? '支払い済みに変更' : '選択した支払いを支払い済みに更新'}
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;