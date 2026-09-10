'use client';

import { useState } from 'react';
import { Linkedin, Copy, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CertificateShareButtonProps {
  courseTitle: string;
  certificateNumber: string;
  certId: string;
}

export default function CertificateShareButton({
  courseTitle,
  certificateNumber,
  certId,
}: CertificateShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const verifyUrl = `https://sarthi-woad.vercel.app/verify/${certificateNumber}`;

  const linkedInText = encodeURIComponent(
    `🎓 Thrilled to share that I've earned a certificate for "${courseTitle}" on SARTHI!\n\nVerify it here: ${verifyUrl}\n\n#SARTHI #LearningNeverStops #Certified`
  );
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}&summary=${linkedInText}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-4 bg-[#F7F4EF] text-[#1A3C2E] rounded-2xl border border-[#EAE6DF] hover:bg-[#D4956A] hover:text-white transition-all shadow-sm"
        title="Share Certificate"
      >
        <Share2 className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="absolute bottom-full right-0 mb-3 z-20 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xl p-3 space-y-2 min-w-[200px]"
            >
              <p className="text-[9px] font-black text-[#8BA898] uppercase tracking-widest px-2 pb-1">Share Achievement</p>

              <a
                href={linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F4EF] transition-colors group"
              >
                <div className="w-8 h-8 bg-[#0077B5] rounded-lg flex items-center justify-center shrink-0">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-[#1A3C2E] group-hover:text-[#D4956A] transition-colors">
                  Share on LinkedIn
                </span>
              </a>

              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F4EF] transition-colors group"
              >
                <div className="w-8 h-8 bg-[#F7F4EF] rounded-lg flex items-center justify-center shrink-0 border border-[#EAE6DF]">
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#1A3C2E]" />
                  )}
                </div>
                <span className="text-xs font-bold text-[#1A3C2E] group-hover:text-[#D4956A] transition-colors">
                  {copied ? 'Link Copied!' : 'Copy Verify Link'}
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

