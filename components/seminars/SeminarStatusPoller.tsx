"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LiveStatusPoller() {
    const [liveData, setLiveData] = useState<{
        isLive: boolean;
        videoId: string | null;
        title: string | null;
    } | null>(null);

    useEffect(() => {
        const checkLive = async () => {
            try {
                const res = await fetch("/api/live/status");
                if (res.ok) {
                    const data = await res.json();
                    setLiveData(data);
                }
            } catch (err) {
                console.error("Live status check failed:", err);
            }
        };

        checkLive(); // Immediate check
        const interval = setInterval(checkLive, 60000); // Check every 60 seconds
        return () => clearInterval(interval);
    }, []);

    if (!liveData?.isLive) return null;

    return (
        <Link href="/student/live" className="block w-full">
            <div className="flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 border border-red-500 rounded-xl transition shadow-lg shadow-red-900/20">
                <span className="w-3 h-3 bg-white rounded-full animate-ping shadow-[0_0_8px_white]" />
                <div>
                    <p className="text-white/90 text-[10px] font-extrabold uppercase tracking-widest leading-none mb-0.5">Live Now</p>
                    <p className="text-white text-sm font-semibold truncate leading-tight">{liveData.title}</p>
                </div>
                <span className="ml-auto text-white font-black">→</span>
            </div>
        </Link>
    );
}

