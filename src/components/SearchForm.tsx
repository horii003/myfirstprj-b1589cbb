import React, { useState, useEffect, useCallback } from 'react';
import { BsSearch, BsX } from 'react-icons/bs';
import { debounce } from 'lodash';

export type FilterType = {
  keyword: string;
  category: string;
  date: string;
  status: string;
};

type SearchFormProps = {
  onSearch: (filters: FilterType) => void;
  filters: FilterType;
};

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, filters }) => {
  const [formData, setFormData] = useState<FilterType>(filters);
  const [error, setError] = useState('');

  const debouncedSearch = useCallback(
    debounce((filters: FilterType) => {
      onSearch(filters);
    }, 500),
    [onSearch]
  );

  useEffect(() => {
    setFormData(filters);
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    debouncedSearch({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }
    onSearch(formData);
  };

  const handleClear = () => {
    const clearedFilters = {
      keyword: '',
      category: '',
      date: '',
      status: '',
    };
    setFormData(clearedFilters);
    setError('');
    onSearch(clearedFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            name="keyword"
            value={formData.keyword}
            onChange={handleChange}
            placeholder="キーワードを入力"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリー
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            <option value="セミナー">セミナー</option>
            <option value="ワークショップ">ワークショップ</option>
            <option value="カンファレンス">カンファレンス</option>
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            開催日
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            <option value="公開中">公開中</option>
            <option value="準備中">準備中</option>
            <option value="終了">終了</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={handleClear}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <BsX className="w-5 h-5" />
          クリア
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <BsSearch className="w-4 h-4" />
          検索
        </button>
      </div>
    </form>
  );
};

export default SearchForm;