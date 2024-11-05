import React, { useState, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

type CategoryType = {
  id: number;
  name: string;
};

type HelpSearchProps = {
  categories: CategoryType[];
  onSearch: (params: { keyword: string; categoryId: number | null }) => void;
};

const HelpSearch: React.FC<HelpSearchProps> = ({ categories, onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSearch = useCallback(() => {
    if (!keyword.trim()) {
      setError('検索キーワードを入力してください');
      return;
    }
    setError('');
    onSearch({ keyword: keyword.trim(), categoryId: selectedCategoryId });
  }, [keyword, selectedCategoryId, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setKeyword('');
    setSelectedCategoryId(null);
    setError('');
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(selectedCategoryId === categoryId ? null : categoryId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="キーワードを入力してください"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FiSearch className="text-gray-400 w-5 h-5" />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategoryId === category.id
                  ? 'bg-blue-500 text-white selected'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FiSearch className="w-4 h-4" />
            検索
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            クリア
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSearch;