'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
  image?: string;
  badge?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  description,
  image,
  badge = 'Masterclass'
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  if (!isOpen) return null;

  const shareText = `${title}\n${description ? description.slice(0, 120) + '...' : ''}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      triggerHaptic('light');
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Failed to copy link', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url
        });
        triggerHaptic('medium');
        onClose();
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error('Share error:', err);
      }
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      ),
      bg: 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_4px_15px_rgba(37,211,102,0.3)]',
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.12 9.99c-.16.71-.58.88-1.18.55l-3.24-2.39-1.56 1.5c-.17.17-.32.32-.66.32l.23-3.29 5.99-5.41c.26-.23-.06-.36-.4-.13L7.22 13.9l-3.2-.1c-.7-.22-.71-.7.15-1.04l12.51-4.82c.58-.21 1.09.14.88.22z"/>
        </svg>
      ),
      bg: 'bg-[#2AABEE] hover:bg-[#229ad8] text-white shadow-[0_4px_15px_rgba(42,171,238,0.3)]',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      bg: 'bg-[#0A66C2] hover:bg-[#084e96] text-white shadow-[0_4px_15px_rgba(10,102,194,0.3)]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bg: 'bg-[#14171A] hover:bg-black text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)]',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bg: 'bg-[#1877F2] hover:bg-[#115cc4] text-white shadow-[0_4px_15px_rgba(24,119,242,0.3)]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
        {/* Backdrop overlay tap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-white z-10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-plus-jakarta">Share Masterclass</h3>
                <p className="text-xs text-slate-400">Spread knowledge with friends & network</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Course Preview Card (if available) */}
          {(title || image) && (
            <div className="flex items-center gap-3.5 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl mb-6">
              {image && (
                <img
                  src={image.startsWith('http') || image.startsWith('/') ? image : `/${image}`}
                  alt={title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700/50 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full inline-block mb-1">
                  {badge}
                </span>
                <h4 className="text-xs font-bold text-slate-200 truncate">{title}</h4>
                <p className="text-[11px] text-slate-400 truncate">{url}</p>
              </div>
            </div>
          )}

          {/* Quick Social Share Buttons Grid */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
              Direct Share Channels
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${social.bg} flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95`}
                  >
                    {social.icon}
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white text-center truncate max-w-full">
                    {social.name}
                  </span>
                </a>
              ))}

              {/* Native System Share Button (Mobile) */}
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-md">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white text-center truncate">
                    More...
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Copy Direct Link Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Or Copy Direct Link
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl focus-within:border-emerald-500/50 transition-all">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-slate-300 outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-plus-jakarta transition-all flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
