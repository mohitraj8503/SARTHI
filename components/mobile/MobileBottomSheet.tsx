'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, Settings, LogOut, X } from 'lucide-react'

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileBottomSheet({ isOpen, onClose }: MobileBottomSheetProps) {
  const router = useRouter();

  const menuItems = [
    { label: 'Certificates', icon: Trophy, path: '/m/dashboard/certificates' },
    { label: 'Achievements', icon: Award, path: '/m/dashboard/grades' },
    { label: 'Settings', icon: Settings, path: '/m/dashboard/settings' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      await fetch('/api/auth/logout', { method: 'POST' });
      onClose();
      window.location.href = '/?signedOut=true';
    } catch (err) {
      console.error('Logout failed');
      window.location.href = '/?signedOut=true';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 200
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '24px 16px 40px',
              zIndex: 201,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Menu</h2>
              <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', padding: 6 }}>
                <X size={20} color="#6B7280" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #F3F4F6',
                    borderRadius: 16,
                    padding: '20px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ backgroundColor: '#E8F5EE', padding: 12, borderRadius: 12 }}>
                    <item.icon size={24} color="#2D6A4F" />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A' }}>{item.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                height: 52,
                backgroundColor: 'transparent',
                color: '#EF4444',
                border: '2px solid #FEE2E2',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer'
              }}
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

