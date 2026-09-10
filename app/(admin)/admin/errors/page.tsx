'use client';

import React, { useState, useEffect } from 'react';
import { 
    AlertTriangle, Server, Activity, Database, 
    RefreshCcw, Trash2, Clock, MapPin, Monitor 
} from 'lucide-react';
import Link from 'next/link';

export default function ErrorDashboard() {
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [logRes, healthRes] = await Promise.all([
                fetch('/api/errors/log'),
                fetch('/api/health')
            ]);
            
            const logData = await logRes.json();
            const healthData = await healthRes.json();
            
            setLogs(logData.recent || []);
            setStats(healthData);
        } catch (e) {
            console.error('Failed to sync monitor:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s auto refresh
        return () => clearInterval(interval);
    }, []);

    const clearLogs = async () => {
        await fetch('/api/errors/clear', { method: 'POST' });
        fetchData();
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
            <div className="animate-spin text-[#1A3C2E]">
                <RefreshCcw className="w-12 h-12" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F5F0E8] text-[#1A3C2E] p-8 md:p-12 font-sans selection:bg-[#1A3C2E]/10">
            <div className="max-w-[1440px] mx-auto space-y-10">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[#2D6A4F] mb-4">
                            <Activity className="w-5 h-5 animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Live_Stability_Monitor</span>
                        </div>
                        <h1 className="text-[42px] font-black italic tracking-tighter uppercase leading-none">
                            Reliability <span className="text-red-600">Hub</span>
                        </h1>
                        <p className="text-[11px] font-bold text-[#5D705C] uppercase tracking-[0.4em] opacity-80">
                            SARTHI High-Performance Infrastructure Monitoring V2.1
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={fetchData}
                            className={`flex items-center gap-3 px-8 py-4 bg-white border border-[#EAE6DF] rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-[#F5F0E8] active:scale-95 ${refreshing ? 'animate-pulse opacity-50' : ''}`}
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Re-Sync
                        </button>
                        <button 
                            onClick={clearLogs}
                            className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-black active:scale-95 shadow-xl"
                        >
                            <Trash2 className="w-4 h-4" />
                            Purge_Logs
                        </button>
                    </div>
                </header>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-[#EAE6DF] p-8 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3 text-[#5D705C]">
                            <Server className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Health Score</span>
                        </div>
                        <div className={`text-[48px] font-black tracking-tighter ${stats?.healthScore < 80 ? 'text-orange-500' : 'text-emerald-600'}`}>
                            {stats?.healthScore}/100
                        </div>
                    </div>
                    <div className="bg-white border border-[#EAE6DF] p-8 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3 text-[#5D705C]">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Uptime</span>
                        </div>
                        <div className="text-[32px] font-black tracking-tighter text-[#1A3C2E]">
                            {stats?.uptime}
                        </div>
                    </div>
                    <div className="bg-white border border-[#EAE6DF] p-8 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3 text-[#5D705C]">
                            <Monitor className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">RAM Usage</span>
                        </div>
                        <div className="text-[32px] font-black tracking-tighter text-[#1A3C2E]">
                            {stats?.memory?.usedPercent}
                        </div>
                    </div>
                    <div className="bg-white border border-[#EAE6DF] p-8 rounded-[40px] space-y-4">
                        <div className="flex items-center gap-3 text-[#5D705C]">
                            <Database className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">DB Status</span>
                        </div>
                        <div className={`text-[20px] font-black tracking-widest uppercase ${stats?.database === 'ONLINE' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stats?.database}
                        </div>
                    </div>
                </div>

                {/* Primary Data Hub */}
                <div className="bg-white border border-[#EAE6DF] rounded-[64px] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-[#EAE6DF] bg-white sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#1A3C2E]">Exception Repository Audit</h3>
                        <span className="text-[10px] font-bold text-[#5D705C] uppercase">Total Logs: {logs.length}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8FAF8] border-b border-[#EAE6DF]">
                                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-[#5D705C]">Time (UTC)</th>
                                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-[#5D705C]">Failure Class</th>
                                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-[#5D705C]">Route_ID</th>
                                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-[#5D705C]">Exception Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5F0E8]">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-32 text-center text-[#5D705C] italic">Zero Exceptions Detected. System Optimal.</td>
                                    </tr>
                                ) : logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-[#F8FAF8] transition-colors group">
                                        <td className="p-6 tabular-nums align-top">
                                            <div className="flex items-center gap-3 text-[12px] font-medium text-[#5D705C]">
                                                <Clock className="w-3.5 h-3.5 opacity-40" />
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="p-6 align-top">
                                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${
                                                log.type === 'APP_CRASH' ? 'bg-red-600 text-white' : 
                                                log.type === 'JS_RUNTIME_ERROR' ? 'bg-orange-500 text-white' : 
                                                'bg-[#1A3C2E] text-white'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="p-6 align-top max-w-[240px]">
                                            <div className="flex items-start gap-3 truncate text-[#1A3C2E] text-[13px] font-bold">
                                                <MapPin className="w-3.5 h-3.5 opacity-20 shrink-0 mt-1" />
                                                {log.url?.replace(/https?:\/\/[^\/]+/, '') || '/'}
                                            </div>
                                        </td>
                                        <td className="p-6 align-top">
                                            <div className="space-y-2">
                                                <div className="text-[13px] font-black text-[#1A3C2E] leading-relaxed italic">{log.message}</div>
                                                <div className="text-[10px] font-mono text-[#5D705C] line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                                                    {log.stack || log.digest}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="pt-12 pb-24 text-center space-y-4">
                    <p className="text-[10px] font-black text-[#5D705C] uppercase tracking-[0.5em]">SARTHI STABILITY OPS</p>
                    <div className="flex justify-center gap-6">
                        <Link href="/" className="text-[11px] font-bold text-[#1A3C2E]/60 hover:text-[#1A3C2E] transition-colors uppercase tracking-widest">Back to Production</Link>
                        <Link href="/api/health" target="_blank" className="text-[11px] font-bold text-[#1A3C2E]/60 hover:text-[#1A3C2E] transition-colors uppercase tracking-widest">Raw Health_JSON</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}

