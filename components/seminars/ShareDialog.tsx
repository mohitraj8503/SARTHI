'use client';
import { useState } from 'react';
import { Share2, Link2, Check, MessageCircle, Linkedin, Twitter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShareButton({ seminar }: { seminar: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sarthi-woad.vercel.app';
  const shareUrl = `${baseUrl}/seminars/${seminar.slug || seminar.id}`;
  const shareText = `Join me for "${seminar.title}" - Free live seminar on SARTHI!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Link2,
      color: 'emerald',
      action: copyToClipboard,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'green',
      action: () => window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        '_blank'
      ),
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'blue',
      action: () => window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      ),
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'sky',
      action: () => window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      ),
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-4 rounded-[20px] bg-white border border-[#E8E2D9]
                 hover:border-[#2D6A4F] hover:scale-105
                 transition-all duration-300 group shadow-sm"
      >
        <Share2 className="w-5 h-5 text-[#5D705C] group-hover:text-[#2D6A4F] transition-colors" />
      </button>

      {/* Dialog Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#1A3C2E]/20 backdrop-blur-md z-[100] 
                     flex items-end md:items-center justify-center p-4
                     animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        >
          {/* Dialog Card */}
          <div 
            className="w-full max-w-md bg-white border border-[#E8E2D9] rounded-[40px] shadow-2xl
                       animate-in slide-in-from-bottom-[50px] duration-500
                       p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#5D705C] hover:text-[#1A3C2E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-10 text-center">
              <div className="w-16 h-16 rounded-[24px] bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-[#2D6A4F]" />
              </div>
              <h3 className="text-2xl font-black text-[#1A3C2E] tracking-tight mb-2 uppercase">Share Seminar</h3>
              <p className="text-sm text-[#5D705C] font-bold tracking-tight">
                Empower your network with strategic knowledge.
              </p>
            </div>

            {/* Share options grid */}
            <div className="grid grid-cols-2 gap-4">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={() => {
                      option.action();
                      if (option.name !== 'Copy Link') setIsOpen(false);
                    }}
                    className="p-6 rounded-[28px] border border-[#E8E2D9] bg-[#F5F0E8]/50 transition-all duration-300 flex flex-col items-center gap-4 group hover:border-[#2D6A4F] hover:bg-white hover:shadow-md"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-inner",
                      option.color === 'emerald' ? "bg-emerald-500/10 text-emerald-600" : 
                      option.color === 'green' ? "bg-green-500/10 text-green-600" :
                      option.color === 'blue' ? "bg-blue-500/10 text-blue-600" :
                      "bg-sky-500/10 text-sky-600"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-[#5D705C] uppercase tracking-widest group-hover:text-[#1A3C2E] transition-colors">
                      {option.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 pt-8 border-t border-[#E8E2D9]">
               <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-[20px] bg-[#F5F0E8] text-[#1A3C2E] font-black tracking-widest text-xs uppercase
                           hover:bg-[#E8E2D9] transition-all active:scale-95"
                >
                  Dismiss
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

