'use client'

import { useState } from 'react'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'
import MobileBottomSheet from '@/components/mobile/MobileBottomSheet'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="safe-area min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Toaster position="top-center" />
      
      <main className="pt-14 pb-20">
        {children}
      </main>

      <MobileBottomNav onOpenMore={() => setIsMenuOpen(true)} />
      <MobileBottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}

