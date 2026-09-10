'use client';

import { useEffect } from 'react';
import '@/lib/errorMonitor';

export default function TerminalMonitor() {
    useEffect(() => {
        console.log('Terminal Reliability Monitor Active');
    }, []);
    return null;
}

