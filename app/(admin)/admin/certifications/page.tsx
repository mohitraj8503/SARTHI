'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Award, Search, Plus, Trash2, Edit, Eye, 
    ChevronLeft, ChevronRight, Loader2, CheckCircle,
    Clock, Target, DollarSign, X, Upload, CheckCircle2,
    TrendingUp, ShieldCheck, Activity, AlertCircle, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { useQuery } from '@tanstack/react-query';
import { CertificationCreateModal } from '@/components/admin/CertificationCreateModal';

/**
 * UNIFIED SYSTEM CONTRACT
 * Synchronized with @/lib/services/certification.service
 */
interface UnifiedCertification {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    level: string;
    durationMinutes: number;
    passingScore: number;
    price: number;
    proPrice?: number;
    premiumPrice?: number;
    slug: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    stats?: {
        enrollments: number;
        attempts: number;
    };
    createdAt: string;
}

interface Stats {
    totalAttempts: number;
    totalCertificates: number;
    avgPassRate: number;
    totalRevenue: number;
}

export default function AdminCertificationsPage() {
    const router = useRouter();
    const { addToast } = useToast();
    
    // Tab & Search state
    const [activeTab, setActiveTab] = useState<'All' | 'Published' | 'Draft' | 'Archived'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Data Fetching
    const { data: certsData, isLoading, error, refetch } = useQuery({
        queryKey: ['admin-certifications', activeTab, searchTerm],
        queryFn: async () => {
            const status = activeTab === 'All' ? '' : activeTab.toUpperCase();
            const res = await fetch(`/api/admin/certification-exams?status=${status}&search=${searchTerm}&pageSize=100`);
            if (!res.ok) throw new Error('Failed to fetch certifications');
            const json = await res.json();
            return json.data || [];
        }
    });

    // Summary Stats
    const { data: summary } = useQuery({
        queryKey: ['admin-certifications-summary'],
        queryFn: async () => {
            const res = await fetch('/api/admin/certification-exams/summary');
            if (!res.ok) return { total: 0, published: 0, draft: 0, revenue: 0 };
            const json = await res.json();
            return json.data;
        }
    });

    const certifications: UnifiedCertification[] = certsData || [];

    const stats = useMemo(() => {
        if (!summary) return [];
        return [
            { label: 'Total Inventory', value: summary.total || 0, icon: Award, color: 'text-brand-dark', bg: 'bg-brand-dark/5' },
            { label: 'Live Tracks', value: summary.published || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'In Drafting', value: summary.draft || 0, icon: Edit, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
            { label: 'Total Value', value: `₹${(summary.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-brand-dark', bg: 'bg-brand-dark/5' }
        ];
    }, [summary]);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/certification-exams/${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast({ message: 'Certification purged successfully', type: 'success' });
                refetch();
            }
        } catch (error) {
            addToast({ message: 'Failed to purge record', type: 'error' });
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-premium-border/40 shadow-sm font-nunito">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 stroke-[2]" />
                </div>
                <h3 className="text-[28px] font-black text-brand-dark uppercase tracking-tight font-outfit mb-3">Sync Interrupted</h3>
                <p className="text-[15px] text-premium-muted font-medium mb-10 max-w-sm text-center leading-relaxed">We found a slight disconnect in the certification data flow.</p>
                <button onClick={() => refetch()} className="px-10 py-4 bg-brand-dark text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange transition-all">Reconnect System</button>
            </div>
        );
    }

    return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden font-nunito bg-[#FCFCFA]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[80px] animate-pulse" />
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[60px]" />
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[70px]" />
      </div>

      <div className="space-y-10 pb-20 pt-2">
        {/* Header Section */}
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">CERTIFICATIONS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              CREDENTIAL <span className="text-[#F97316]">DIRECTORY</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Professional assessments, digital credentialing, and certification management.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F172A] text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#F97316] transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> New Certification
          </button>
        </header>

        {/* KPI Section - Re-styled to match directory theme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {isLoading && !summary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[140px] bg-white rounded-[2rem] border border-slate-100 animate-pulse shadow-sm" />
            ))
          ) : (
            stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative group",
                  i === 0 && "bg-blue-50/40",
                  i === 1 && "bg-emerald-50/40",
                  i === 2 && "bg-amber-50/40",
                  i === 3 && "bg-blue-50/40"
                )}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("p-3 rounded-2xl transition-all duration-500", stat.bg, stat.color)}>
                    <stat.icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-4xl font-black text-[#0F172A] tracking-tighter font-outfit">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", stat.color.replace('text', 'bg'))} />
                    {stat.label === 'Total Inventory' ? 'Credential Assets' : stat.label === 'Live Tracks' ? 'Active Systems' : 'Performance Optimized'}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Unified Search & Filters - Re-styled to match directory theme */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search certifications, IDs, or levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] pl-16 pr-[500px] py-6 text-[15px] font-medium text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 focus:outline-none transition-all shadow-[0_10px_40px_rgba(0,0,0,0.02)]"
          />
          
          <div className="absolute inset-y-2 right-2 flex items-center gap-2">
            <div className="h-full w-px bg-slate-100 mx-2" />
            
            {/* Tabs Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-50/50 rounded-2xl mr-2">
              {(['All', 'Published', 'Draft', 'Archived'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab
                      ? "bg-[#0F172A] text-white shadow-lg"
                      : "text-slate-400 hover:text-[#0F172A] hover:bg-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.1em] hover:bg-amber-500 transition-all shadow-md group">
              <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> Export
            </button>
          </div>
        </div>
                {/* Modernized Certifications List */}
                <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-slate-100/80 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                    <div className="overflow-x-auto admin-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Credential Details</th>
                                    <th className="px-6 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Activity Metrics</th>
                                    <th className="px-6 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Score Threshold</th>
                                    <th className="px-6 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Status</th>
                                    <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-10 py-8"><div className="w-64 h-14 bg-slate-100 rounded-2xl" /></td>
                                            <td className="px-6 py-8"><div className="w-32 h-8 bg-slate-100 rounded-xl mx-auto" /></td>
                                            <td className="px-6 py-8"><div className="w-20 h-8 bg-slate-100 rounded-xl mx-auto" /></td>
                                            <td className="px-6 py-8"><div className="w-24 h-8 bg-slate-100 rounded-xl mx-auto" /></td>
                                            <td className="px-10 py-8"><div className="w-12 h-12 bg-slate-100 rounded-full ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : certifications.length > 0 ? (
                                    certifications.map((cert) => (
                                        <tr
                                            key={cert.id}
                                            className="hover:bg-amber-500/[0.02] transition-all duration-500 group cursor-default"
                                        >
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-6">
                                                    <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-slate-100 group-hover:border-amber-500/30 transition-all bg-slate-50 flex-shrink-0 shadow-sm">
                                                        <Image
                                                            src={cert.imageUrl || '/placeholder.png'}
                                                            alt={cert.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <p className="text-[17px] font-black text-[#0F172A] hover:text-amber-500 transition-colors cursor-pointer tracking-tight leading-tight uppercase italic">{cert.title}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[9px] font-black text-[#0F172A] bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-200">{cert.level}</span>
                                                            <span className="text-[11px] text-slate-400 font-bold tracking-widest uppercase italic">{cert.slug}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7 text-center">
                                                <div className="flex justify-center gap-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-all">
                                                    <div className="text-center">
                                                        <div className="text-[20px] font-black text-[#0F172A] font-outfit leading-none tracking-tighter">{cert.stats?.attempts || 0}</div>
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Attempts</div>
                                                    </div>
                                                    <div className="w-px h-8 bg-slate-200" />
                                                    <div className="text-center">
                                                        <div className="text-[20px] font-black text-[#0F172A] font-outfit leading-none tracking-tighter">{cert.stats?.enrollments || 0}</div>
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Enrolled</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7 text-center">
                                                <div className="inline-flex flex-col items-center px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100/50 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                                    <span className="text-[18px] font-black font-outfit group-hover:text-white text-blue-700 leading-none">{cert.passingScore}%</span>
                                                    <span className="text-[9px] font-black group-hover:text-white text-blue-400 uppercase tracking-widest mt-1">Passing</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                                                    cert.status === 'PUBLISHED' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white" : 
                                                    cert.status === 'DRAFT' ? "bg-amber-50 text-amber-600 border-amber-100/20 group-hover:bg-amber-500 group-hover:text-white" : "bg-red-50 text-red-600 border-red-100/50 group-hover:bg-red-600 group-hover:text-white"
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse group-hover:hidden", 
                                                        cert.status === 'PUBLISHED' ? "bg-emerald-500" : cert.status === 'DRAFT' ? "bg-amber-500" : "bg-red-500"
                                                    )} />
                                                    {cert.status === 'PUBLISHED' ? 'Live' : cert.status}
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        onClick={() => router.push(`/admin/certification-exams/${cert.id}/manage`)}
                                                        className="p-3.5 text-slate-400 hover:text-[#0F172A] hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {/* Handle Edit */}}
                                                        className="p-3.5 text-slate-400 hover:text-amber-500 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cert.id)}
                                                        className="p-3.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100 shadow-inner">
                                                <Award className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-[32px] font-black text-[#0F172A] tracking-tighter uppercase font-outfit mb-2 leading-none">Inventory Empty</h3>
                                            <p className="text-[16px] text-slate-400 mb-10 max-w-sm mx-auto font-medium leading-relaxed italic">No credentials found matching your system filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Footer Disclaimer */}
                <div className="flex items-center justify-center gap-3 text-premium-muted/60 text-[11px] font-black uppercase tracking-[0.2em] pt-8">
                    <AlertCircle className="w-4 h-4" />
                    Credential state transitions are logged for global audit compliance.
                </div>
            </div>
            
            <CertificationCreateModal 
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

