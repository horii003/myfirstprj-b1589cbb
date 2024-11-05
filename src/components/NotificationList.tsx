import { useState, useEffect } from 'react'
import { FiInfo, FiAlertCircle, FiBell, FiCheckCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type NotificationType = {
  id: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
  type: 'info' | 'warning' | 'success' | 'alert'
}

type Props = {
  notifications: NotificationType[]
  onRead: (id: string) => void
  onScroll?: () => void
  filter?: 'all' | 'unread' | 'read'
}

const NotificationList = ({ notifications, onRead, onScroll, filter = 'all' }: Props) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      onScroll?.()
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  const getIcon = (type: string, id: string) => {
    switch (type) {
      case 'info':
        return <FiInfo data-testid={`info-icon-${id}`} className="text-blue-500" />
      case 'warning':
        return <FiAlertCircle data-testid={`warning-icon-${id}`} className="text-yellow-500" />
      case 'success':
        return <FiCheckCircle data-testid={`success-icon-${id}`} className="text-green-500" />
      default:
        return <FiBell data-testid={`alert-icon-${id}`} className="text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年M月d日', { locale: ja })
  }

  if (notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        通知はありません
      </div>
    )
  }

  return (
    <div 
      className="divide-y divide-gray-200 overflow-auto max-h-[600px]"
      onScroll={handleScroll}
    >
      {filteredNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 transition-colors duration-200 cursor-pointer ${
            hoveredId === notification.id ? 'bg-gray-50' : 'bg-white'
          } ${!notification.isRead ? 'font-semibold' : ''}`}
          onClick={() => !notification.isRead && onRead(notification.id)}
          onMouseEnter={() => setHoveredId(notification.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getIcon(notification.type, notification.id)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(notification.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationList