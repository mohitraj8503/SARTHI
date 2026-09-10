'use client';

import {
    RefreshCcw,
    Database,
    AlertCircle,
    WifiOff
} from 'lucide-react';
import { useState } from 'react';

export function DBErrorState() {
    const [retrying, setRetrying] = useState(false);

    const handleRetry = () => {
        setRetrying(true);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 border border-red-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <WifiOff className="w-10 h-10 relative z-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-xl border border-red-50 border-red-100 shadow-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
            </div>

            <div className="max-w-md space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Unable to connect
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                    We&apos;re having trouble reaching our servers. This could be due to your internet connection or a temporary server issue.
                </p>

                <div className="pt-6">
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A3C2E] hover:bg-[#D4956A] text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        <RefreshCcw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
                        {retrying ? 'Connecting...' : 'Try Refreshing'}
                    </button>
                    
                    <p className="mt-6 text-[12px] text-slate-400 font-medium">
                        If the problem persists, please contact support.
                    </p>
                </div>
            </div>
        </div>
    );
}

