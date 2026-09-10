'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
}

export default function MobileHeader({ title, showBack = false }: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 56, 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid #E5E7EB', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 16px', 
        zIndex: 100 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button 
            onClick={() => router.back()} 
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </button>
        )}
        <h1 
          style={{ 
            fontSize: 18, 
            fontWeight: 800, 
            color: '#1A1A1A', 
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px'
          }}
        >
          {title}
        </h1>
      </div>
      
      <button 
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Bell size={22} color="#1A1A1A" />
      </button>
    </header>
  )
}

