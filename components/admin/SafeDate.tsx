'use client';

import { useState, useEffect } from 'react';

interface SafeDateProps {
  date: string | Date | number;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  fallback?: string;
}

export function SafeDate({ date, options, className, fallback = '—' }: SafeDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className} suppressHydrationWarning>{fallback}</span>;
  }

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return <span className={className}>{fallback}</span>;
    
    return (
      <span className={className}>
        {d.toLocaleDateString(undefined, options)}
      </span>
    );
  } catch {
    return <span className={className}>{fallback}</span>;
  }
}

