import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiBell, FiHelpCircle, FiMenu, FiX, FiSettings, FiUser, FiLogOut } from 'react-icons/fi'
import { supabase } from '@/supabase'

type UserType = {
  id: string
  name: string
  email: string
  role: string
}

type HeaderProps = {
  isLoggedIn: boolean
  user: UserType | null
}

export default function Header({ isLoggedIn, user }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { label: 'イベント一覧', href: '/events' },
    { label: 'イベント作成', href: '/events/create' },
    { label: '参加者管理', href: '/participants' },
  ]

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-800">イベント管理システム</span>
            </Link>
          </div>

          {!isMobile && (
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="通知"
                >
                  <FiBell className="h-6 w-6" />
                </button>

                <Link href="/help" className="p-2 rounded-full hover:bg-gray-100" aria-label="ヘルプ">
                  <FiHelpCircle className="h-6 w-6" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                    aria-label="メニュー"
                  >
                    <span className="text-sm font-medium">{user?.name}</span>
                    <FiMenu className="h-5 w-5" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          プロフィール
                        </Link>
                        <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          設定
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            管理者設定
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          ログアウト
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                ログイン
              </Link>
            )}

            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="メニューを開く"
              >
                {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isNotificationOpen && (
        <div
          role="dialog"
          aria-label="通知一覧"
          className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
        >
          <div className="p-4">
            <h3 className="text-lg font-medium">通知一覧</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">新しい通知はありません</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}