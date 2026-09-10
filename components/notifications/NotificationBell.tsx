'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, Radio, Video, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const handleOpen = async () => {
    setOpen(!open)
    if (!open && unreadCount > 0) {
      await fetch('/api/notifications', { method: 'PATCH' })
      setUnreadCount(0)
    }
  }

  const getIcon = (type: string) => {
    if (type.includes('LIVE')) return <Radio size={14} className="text-red-500" />
    if (type.includes('RECORDING')) return <Video size={14} className="text-green-500" />
    return <Bell size={14} className="text-indigo-500" />
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl flex items-center 
                   justify-center text-gray-500 hover:text-gray-700 
                   hover:bg-gray-100 transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 
                           w-4 h-4 rounded-full bg-red-500 
                           text-white text-[9px] font-bold 
                           flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 w-80 
                        bg-white rounded-2xl shadow-2xl 
                        border border-gray-100 z-50 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between 
                          px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">
              Notifications
            </span>
            <button onClick={() => setOpen(false)} 
                    className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y 
                          divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((n: any) => (
                <Link
                  key={n.id}
                  href={n.data?.lessonId 
                    ? `/student/live/${n.data.lessonId}` 
                    : '#'}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 
                               hover:bg-gray-50 transition-colors
                               ${!n.isRead ? 'bg-indigo-50/40' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 
                                  flex items-center justify-center 
                                  shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 
                                    leading-snug">
                      {n.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 
                                    leading-snug">
                      {n.body}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), 
                        { addSuffix: true })}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 
                                    shrink-0 mt-1.5" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

