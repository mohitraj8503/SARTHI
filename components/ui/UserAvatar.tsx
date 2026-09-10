'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user?: {
    name?: string | null;
    image?: string | null;
    avatar_url?: string | null;
    avatar_version?: number | null;
    role?: string | null;
  } | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-9 h-9 text-[10px]',
  md: 'w-12 h-12 text-[14px]',
  lg: 'w-16 h-16 text-[18px]',
  xl: 'w-24 h-24 text-[24px]',
};

export default function UserAvatar({ user, className, size = 'md', showBadge = false }: UserAvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??';

  /**
   * Premium Image Priority System:
   * 1. avatar_url (Manual User Upload)
   * 2. image (OAuth / Standard Field)
   * 3. Hardcoded Fallbacks for VIPs
   * 4. UI Avatars (Smart Generation)
   */
  const getAvatarUrl = () => {
    const rawUrl = user?.avatar_url || user?.image;
    
    // Check if URL is valid (starts with http, /images, or /api)
    const isValidUrl = rawUrl && (
      rawUrl.startsWith('http') || 
      rawUrl.startsWith('/') || 
      rawUrl.startsWith('data:image')
    );

    if (isValidUrl && !imgError) {
      // Don't append version suffix to data URLs as it breaks them
      if (rawUrl.startsWith('data:image')) return rawUrl;
      
      const versionSuffix = user?.avatar_version ? `${rawUrl.includes('?') ? '&' : '?'}v=${user.avatar_version}` : '';
      return `${rawUrl}${versionSuffix}`;
    }

    // VIP Fallbacks (Secondary)
    // Removed VIP fallback for Mohit Raj

    // Default Smart Fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=174F3A&color=fff&bold=true&font-size=0.33`;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className={cn("relative inline-block shrink-0 rounded-full", className)}>
      <div className={cn(
        "rounded-full overflow-hidden flex items-center justify-center border border-white/10 shadow-sm transition-all duration-300",
        sizeMap[size],
        "bg-gradient-to-br from-[#174F3A] to-[#0D1E12]"
      )}>
        <Image
          src={avatarUrl}
          alt={`${user?.name || 'User'}'s profile photo`}
          width={256}
          height={256}
          quality={100}
          onLoadingComplete={(result) => {
            if (result.naturalWidth === 0) setImgError(true);
          }}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={true}
        />
      </div>

      {showBadge && user?.role && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title={user.role} />
      )}
    </div>
  );
}
