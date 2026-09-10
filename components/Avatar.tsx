import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: number;
  className?: string;
  isLoading?: boolean;
}

export function Avatar({ avatarUrl, name, size = 40, className, isLoading }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    ? name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : '?';

  const content =
    avatarUrl && !imageError ? (
      <div className={cn('relative rounded-full overflow-hidden', className)} style={{ width: '100%', height: '100%' }}>
        <Image
          src={avatarUrl}
          alt={`${name || 'User'} avatar`}
          fill
          priority
          quality={85}
          className="object-cover"
          onError={() => setImageError(true)}
          sizes={`${size}px`}
        />
      </div>
    ) : (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold w-full h-full',
          className
        )}
      >
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      </div>
    );

  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {content}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-[1px] z-10">
          <Loader2 className="w-1/2 h-1/2 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}

