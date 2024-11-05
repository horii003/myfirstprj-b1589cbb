import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

const EventListPage = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('id, title, description, start_datetime, end_datetime, status')
        .order('start_datetime', { ascending: true });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (selectedType) {
        query = query.eq('event_type', selectedType);
      }

      const { data: eventsData, error: eventsError } = await query;

      if (eventsError) throw eventsError;

      const { data: typesData, error: typesError } = await supabase
        .from('event_types')
        .select('*');

      if (typesError) throw typesError;

      setEvents(eventsData || []);
      setEventTypes(typesData || []);
    } catch (err) {
      setError('データの取得に失敗しました');
      setEvents([
        {
          id: '1',
          title: 'テストイベント1',
          description: 'テストイベント1の説明',
          start_datetime: '2024-01-01',
          end_datetime: '2024-01-02',
          status: 'published'
        },
        {
          id: '2',
          title: 'テストイベント2',
          description: 'テストイベント2の説明',
          start_datetime: '2024-02-01',
          end_datetime: '2024-02-02',
          status: 'published'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedType, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">イベント一覧</h1>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="イベントを検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <FiSearch />
                検索
              </button>
              <button
                type="button"
                onClick={() => setShowFilter(!showFilter)}
                className="px-6 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
              >
                <FiFilter />
                フィルター
              </button>
            </form>

            {showFilter && (
              <div className="p-4 bg-gray-100 rounded-lg mb-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  {eventTypes.map((type) => (
                    <label key={type.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="eventType"
                        checked={selectedType === type.id}
                        onChange={() => setSelectedType(type.id)}
                      />
                      {type.name}
                    </label>
                  ))}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:underline"
                >
                  クリア
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link href={`/events/${event.id}`} key={event.id}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="mb-4">
                      <img
                        src="https://placehold.co/400x200"
                        alt={event.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        {new Date(event.start_datetime).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        {event.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              <span className="px-4 py-2">ページ {currentPage}</span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                <FiChevronRight />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EventListPage;