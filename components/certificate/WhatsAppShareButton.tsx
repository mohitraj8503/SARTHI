'use client';

import React, { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';

interface WhatsAppShareButtonProps {
  certificateId: string;
  userName: string;
  courseName: string;
  phoneNumber?: string;
  className?: string;
}

/**
 * WhatsApp Share Button Component
 * Uses WhatsApp's direct message API for sharing
 * Premium feature for ₹49+ tier certificates
 */
export default function WhatsAppShareButton({
  certificateId,
  userName,
  courseName,
  phoneNumber,
  className = ''
}: WhatsAppShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const generateWhatsAppMessage = () => {
    return `
🎓 *SARTHI Certificate Verification*

*Student:* ${userName}
*Course:* ${courseName}
*Certificate ID:* ${certificateId}

🔗 *Verify at:* https://sarthi-woad.vercel.app/verify/${certificateId}

_This certificate is verified and authentic._
    `.trim();
  };

  const handleShare = async () => {
    setLoading(true);
    
    try {
      const message = generateWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      
      if (phoneNumber) {
        // Direct message to specific number
        const waUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
        window.open(waUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
      } else {
        // Open WhatsApp web with pre-filled message
        const waUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
        window.open(waUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
      }
    } catch (error) {
      console.error('WhatsApp share error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-[#25D366] text-white rounded-lg 
        font-medium text-sm transition-all duration-200
        hover:bg-[#128C7E] hover:shadow-md
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      Share via WhatsApp
    </button>
  );
}

/**
 * WhatsApp Verification Link Generator
 * For sending verification links via WhatsApp API
 */
export function generateWhatsAppVerificationLink(params: {
  certificateId: string;
  userName: string;
  courseName: string;
  issueDate?: string;
}): string {
  const { certificateId, userName, courseName, issueDate } = params;
  const message = `
🎓 *SARTHI Certificate*

*Student:* ${userName}
*Course:* ${courseName}
${issueDate ? `*Completed:* ${issueDate}\n` : ''}
*Certificate ID:* ${certificateId}

🔗 *Verify:* https://sarthi-woad.vercel.app/verify/${certificateId}
  `.trim();

  return encodeURIComponent(message);
}

