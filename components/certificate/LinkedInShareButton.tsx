'use client';

import React, { useState } from 'react';
import { Linkedin, Loader2 } from 'lucide-react';

interface LinkedInShareButtonProps {
  certificateId: string;
  userName: string;
  courseName: string;
  issueDate?: string;
  className?: string;
}

/**
 * LinkedIn Share Button Component
 * Uses LinkedIn's share URL scheme for no-auth sharing
 * Premium feature for ₹49+ tier certificates
 */
export default function LinkedInShareButton({
  certificateId,
  userName,
  courseName,
  issueDate,
  className = ''
}: LinkedInShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const generateShareUrl = () => {
    const baseUrl = 'https://www.linkedin.com/sharing/share-offsite/';
    const shareUrl = `https://sarthi-woad.vercel.app/verify/${certificateId}`;
    
    // Create share content
    const shareData = {
      url: shareUrl,
      title: `${userName} - ${courseName} Certificate`,
      text: `
🎓 I've successfully completed the ${courseName} course from SARTHI!

Certificate ID: ${certificateId}
Completion Date: ${issueDate || 'Recently'}

This comprehensive certification has enhanced my professional skills. 
Thanks to SARTHI for this amazing learning experience!

#SARTHI #CourseCompletion #ProfessionalDevelopment #OnlineLearning
      `.trim()
    };

    // Encode the data as a URL-encoded JSON string
    const encoded = encodeURIComponent(JSON.stringify(shareData));
    return `${baseUrl}?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.text)}`;
  };

  const handleShare = async () => {
    setLoading(true);
    
    try {
      const shareUrl = generateShareUrl();
      window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    } catch (error) {
      console.error('LinkedIn share error:', error);
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
        bg-[#0077B5] text-white rounded-lg 
        font-medium text-sm transition-all duration-200
        hover:bg-[#005885] hover:shadow-md
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Linkedin className="w-4 h-4" />
      )}
      Share on LinkedIn
    </button>
  );
}

/**
 * LinkedIn Share URL Generator (for programmatic use)
 */
export function generateLinkedInShareUrl(params: {
  certificateId: string;
  userName: string;
  courseName: string;
  issueDate?: string;
  verificationUrl?: string;
}): string {
  const { certificateId, userName, courseName, issueDate, verificationUrl } = params;
  
  const shareUrl = `https://sarthi-woad.vercel.app/verify/${certificateId}`;
    
  const previewUrl = verificationUrl || `https://sarthi-woad.vercel.app/api/certificates/${certificateId}/preview`;

  const text = `
🎓 ${userName} - ${courseName} Certificate

I've successfully completed the ${courseName} course from SARTHI!

Certificate ID: ${certificateId}
Completed: ${issueDate || 'Recently'}

This certification validates my professional skills in this domain.
Thanks to SARTHI for the quality education!

#SARTHI #ProfessionalCertification #SkillDevelopment
  `.trim();

  const paramsEncoded = new URLSearchParams({
    url: shareUrl,
    title: `${userName} - ${courseName} Certificate`,
    summary: text,
    image: previewUrl
  });

  return `https://www.linkedin.com/sharing/share-offsite/?${paramsEncoded.toString()}`;
}

