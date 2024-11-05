import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Topbar from '@/components/Topbar'
import { FaSearch, FaQuestionCircle } from 'react-icons/fa'
import { supabase } from '@/supabase'

type Article = {
  id: string
  title: string
  category: string
  content: string
}

type Category = {
  id: string
  name: string
}

export default function HelpCenter() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('helpCategories')
        .select('*')

      const { data: articlesData, error: articlesError } = await supabase
        .from('helpArticles')
        .select('*')

      if (categoriesError || articlesError) throw new Error('データの取得に失敗しました。')

      setCategories(categoriesData || [])
      setArticles(articlesData || [])
    } catch (err) {
      setError('データの取得に失敗しました。')
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
            <FaQuestionCircle className="mr-2" />
            ヘルプセンター
          </h1>
          
          <div className="relative">
            <input
              type="text"
              placeholder="キーワードを入力"
              className="w-full p-4 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-bold text-lg mb-4">カテゴリー</h2>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              {selectedArticle ? (
                <div className="bg-white p-6 rounded-lg shadow">
                  <button
                    className="text-blue-500 mb-4"
                    onClick={() => setSelectedArticle(null)}
                  >
                    ← 戻る
                  </button>
                  <h2 className="text-2xl font-bold mb-4">{selectedArticle.title}</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedArticle.content}</p>
                </div>
              ) : (
                <>
                  {filteredArticles.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                      <p>検索結果が見つかりませんでした</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredArticles.map(article => (
                        <button
                          key={article.id}
                          className="w-full bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <h3 className="text-xl font-semibold text-gray-800">
                            {article.title}
                          </h3>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}