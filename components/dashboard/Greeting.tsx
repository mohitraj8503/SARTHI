'use client';

import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GreetingProps } from '@/types/dashboard';

export function Greeting({ name, localTime }: GreetingProps) {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const date = localTime ? new Date(localTime) : new Date();
    const hour = date.getHours();
    let message = 'Welcome Back';
    let Icon = Sun;

    if (mounted) {
        if (hour < 12) {
            message = 'Good Morning';
            Icon = Sunrise;
        } else if (hour >= 12 && hour < 17) {
            message = 'Good Afternoon';
            Icon = Sun;
        } else {
            message = 'Good Evening';
            Icon = Sunset;
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1 mb-6"
        >
            <div className="flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider">
                <Icon className="w-4 h-4" />
                <span>{message}</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
                {name}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
                Ready to move one step closer to your goal?
            </p>
        </motion.div>
    );
}

