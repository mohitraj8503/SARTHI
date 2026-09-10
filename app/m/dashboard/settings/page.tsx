'use client'

import { useEffect, useState } from 'react'
import MobileHeader from '@/components/mobile/MobileHeader'
import { User, Bell, Shield, HelpCircle, ChevronRight, LogOut, Camera } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function MobileSettings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const json = await res.json();
          setUser(json);
        }
      } catch (err) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const menuGroups = [
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Personal Information', icon: User, path: '/m/dashboard/settings/profile' },
        { label: 'Notifications', icon: Bell, path: '/m/dashboard/settings/notifications', value: 'On' },
        { label: 'Privacy & Security', icon: Shield, path: '/m/dashboard/settings/privacy' },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'Help Center', icon: HelpCircle, path: '/m/dashboard/support' },
      ]
    }
  ];

  const handleSignOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/?signedOut=true';
    } catch {
      window.location.href = '/?signedOut=true';
    }
  };

  return (
    <>
      <MobileHeader title="Settings" />
      
      <main style={{ padding: '16px' }}>
        {/* Profile Section */}
        <div 
          style={{ 
            background: '#FFFFFF', 
            borderRadius: 16, 
            padding: 20, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16,
            border: '1px solid #E5E7EB',
            marginBottom: 24
          }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user?.image ? (
                <Image src={user.image} alt={user.name} width={64} height={64} />
              ) : (
                <User size={32} color="#2D6A4F" />
              )}
            </div>
            <div style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#FFFFFF', padding: 4, borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
              <Camera size={12} color="#6B7280" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: '0 0 2px 0' }}>{user?.name || 'Practitioner'}</h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{user?.email || 'student@sarthi-woad.vercel.app'}</p>
          </div>
          <ChevronRight size={20} color="#D1D5DB" />
        </div>

        {/* Menu Groups */}
        {menuGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 12, marginBottom: 12 }}>
              {group.title}
            </h3>
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              {group.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  style={{
                    width: '100%',
                    height: 56,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    borderBottom: i === group.items.length - 1 ? 'none' : '1px solid #F3F4F6',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: '#6B7280' }}>
                      <item.icon size={20} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.value && <span style={{ fontSize: 14, color: '#6B7280' }}>{item.value}</span>}
                    <ChevronRight size={18} color="#D1D5DB" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            height: 52,
            backgroundColor: '#FFF1F2',
            color: '#E11D48',
            border: 'none',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 12,
            marginBottom: 40
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </main>
    </>
  )
}

