'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, Video, Menu } from 'lucide-react'

export default function MobileBottomNav({ onOpenMore }: { onOpenMore: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/m/dashboard' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/m/dashboard/courses' },
    { id: 'live', label: 'Live', icon: Video, path: '/m/dashboard/live-lessons' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: 64, 
        backgroundColor: '#FFFFFF', 
        borderTop: '1px solid #E5E7EB', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-around', 
        paddingBottom: 'env(safe-area-inset-bottom)', 
        zIndex: 100 
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(item.path)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '8px 12px'
          }}
        >
          <item.icon 
            size={24} 
            color={isActive(item.path) ? '#2D6A4F' : '#6B7280'} 
            strokeWidth={isActive(item.path) ? 2.5 : 2}
          />
          <span 
            style={{ 
              fontSize: 10, 
              fontWeight: 700, 
              color: isActive(item.path) ? '#2D6A4F' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}
          >
            {item.label}
          </span>
        </button>
      ))}

      <button
        onClick={onOpenMore}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: '8px 12px'
        }}
      >
        <Menu size={24} color="#6B7280" />
        <span 
          style={{ 
            fontSize: 10, 
            fontWeight: 700, 
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}
        >
          More
        </span>
      </button>
    </nav>
  )
}

