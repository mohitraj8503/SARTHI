'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | number;
    withText?: boolean;
    textClassName?: string;
}

export default function Logo({
    className = '',
    size = 'md',
    withText = false,
    textClassName = '',
}: LogoProps) {
    const sizeMap = {
        sm: 32,
        md: 40,
        lg: 48,
    };

    const finalSize = typeof size === 'number' ? size : sizeMap[size];

    return (
        <Link href="/" className={cn("flex items-center gap-2 group cursor-pointer", className)} style={{ textDecoration: 'none' }}>
            <div 
                className="bg-white rounded-xl flex items-center justify-center shadow-md p-0 overflow-hidden"
                style={{ width: finalSize, height: finalSize }}
            >
                <Image 
                    src="/sarthi-logo.png" 
                    alt="TT" 
                    width={finalSize}
                    height={finalSize}
                    priority
                    loading="eager"
                    quality={100}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
            </div>
            {withText && (
                <div className={cn("flex items-baseline", textClassName)}>
                    <span className="text-xl font-black tracking-tight text-[#FF9933]">SAR</span>
                    <span className="text-xl font-black tracking-tight text-[#138808]">THI</span>
                </div>
            )}
        </Link>
    );
}

