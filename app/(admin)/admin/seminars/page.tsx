'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Video,
  Calendar,
  Users,
  Clock,
  Download,
  Filter,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Command,
  Loader2,
  AlertCircle,
  Radio,
  ChevronDown,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  PlayCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SeminarDetailsDrawer } from '@/components/admin/SeminarDetailsDrawer';
import { SeminarCreateModal } from '@/components/admin/SeminarCreateModal';
import { SeminarActionsMenu } from '@/components/admin/SeminarActionsMenu';
import { SeminarRequestsPanel } from '@/components/admin/SeminarRequestsPanel';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { useAdmin } from '@/lib/contexts/AdminContext';

interface Seminar {
  id: string;
  title: string;
  description?: string;
  isLive: boolean;
  date: string;
  duration: number;
  speakerName: string;
  _count: { registrations: number };
}

export default function AdminSeminarsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addToast } = useToast();

  const currentTab = searchParams.get('status') || 'Requests';
  const searchQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { setPrimaryAction } = useAdmin();

  const limit = 12;

  const handleExport = useCallback(() => {
    addToast({ message: 'Preparing your export...', type: 'success' });
    window.open(`/api/admin/seminars/export?q=${searchQuery}`, '_blank');
  }, [addToast, searchQuery]);

  useEffect(() => {
    setPrimaryAction({
      label: 'EXPORT DATA',
      onClick: handleExport,
      icon: Download
    });
    return () => setPrimaryAction(null);
  }, [handleExport, setPrimaryAction]);

  // Sync local search with URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (localSearch) params.set('q', localSearch);
      else params.delete('q');
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, router, pathname, searchParams]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-seminars', currentTab, searchQuery, page],
    queryFn: async () => {
      if (currentTab === 'Requests') return { items: [] };

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', page.toString());
      params.set('pageSize', '12');
      
      const res = await fetch(`/api/admin/seminars?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch seminars');
      const json = await res.json();
      return json.data || [];
    },
    enabled: currentTab !== 'Requests',
    staleTime: 5 * 60 * 1000
  });

  const seminars = Array.isArray(data) ? data : (data as any)?.items || [];

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', tab);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { label: 'Requests', icon: MessageSquare },
    { label: 'Scheduled', icon: Calendar },
    { label: 'Live Now', icon: Radio },
    { label: 'Replays', icon: PlayCircle }
  ];

  const { data: summary } = useQuery({
    queryKey: ['admin-seminars-summary'],
    queryFn: async () => {
      const res = await fetch('/api/admin/seminars/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      const json = await res.json();
      return json.data;
    }
  });

  return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden">
      {/* Background Atmosphere - Premium Decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top Right Header Bubble */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[80px] animate-pulse" />
        
        {/* Floating Blob Right */}
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[60px] animate-float" style={{ animationDuration: '8s' }} />
        
        {/* Bottom Left Bubble */}
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[70px] animate-float-delayed" style={{ animationDuration: '10s' }} />
      </div>

      <div className="space-y-10 pb-20">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
          <MetricCard icon={MessageSquare} label="Pending Requests" value={summary?.pendingRequests || 0} color="blue" />
          <MetricCard icon={Calendar} label="Upcoming" value={summary?.upcoming || 0} color="green" />
          <MetricCard icon={Users} label="Total Registrations" value={summary?.totalRegistrations || 0} color="gold" />
          <div className="bg-[#0F172A] p-8 rounded-[2rem] text-white relative overflow-hidden flex flex-col justify-between border border-[#0F172A] shadow-xl shadow-black/10 transition-all hover:shadow-2xl hover:-translate-y-1 duration-500 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/20 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live Monitor</span>
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <h4 className="text-[28px] font-black leading-tight uppercase tracking-tight">{summary?.live || 0} Sessions <span className="text-red-500">Live</span></h4>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 px-4 sm:px-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-1 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Broadcast Center</span>
            </div>
            <h1 className="text-3xl sm:text-[40px] font-black text-[#0F172A] tracking-tighter uppercase leading-[0.9]">
              Seminars <span className="text-amber-500">Inventory</span>
            </h1>
            <p className="text-[14px] font-medium text-slate-400 max-w-[550px] leading-relaxed">
              Orchestrate global broadcasts, manage speaking requests, and monitor real-time engagement telemetry.
            </p>
          </div>
 
          <div className="flex items-center gap-4 mt-2 w-full lg:w-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#0F172A] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[3]" /> New Broadcast
            </button>
          </div>
        </div>
 
        {/* Tabs Row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-[2rem] w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar mx-4 sm:mx-0">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.label)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all",
                currentTab === tab.label
                  ? "bg-[#0F172A] text-white shadow-xl shadow-black/10"
                  : "text-slate-400 hover:text-[#0F172A] hover:bg-slate-50"
              )}
            >
              <tab.icon className={cn("w-4 h-4", currentTab === tab.label ? "text-amber-500" : "text-slate-300")} />
              {tab.label}
            </button>
          ))}
        </div>
 
        <AnimatePresence mode="wait">
          {currentTab === 'Requests' ? (
            <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SeminarRequestsPanel />
            </motion.div>
          ) : (
            <motion.div key="normal-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div className="relative group max-w-2xl px-4 sm:px-0">
                <div className="relative w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search broadcasts by title, speaker, or meta-data..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[14px] font-medium text-[#0F172A] focus:border-amber-200 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
 
              {isLoading ? (
                <div className="py-32 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-6 opacity-50" />
                  <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Stream Archives...</p>
                </div>
              ) : seminars.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
                  {seminars.map((seminar: any) => (
                    <SeminarGridItem
                      key={seminar.id}
                      seminar={seminar}
                      onClick={() => { setSelectedSeminar(seminar); setIsDrawerOpen(true); }}
                      onManage={() => router.push(`/admin/seminars/${seminar.id}/manage`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                    <Video className="w-12 h-12" />
                  </div>
                  <h3 className="text-[24px] font-black text-[#0F172A] uppercase tracking-tight">No Broadcasts Detected</h3>
                  <p className="text-[14px] text-slate-400 mt-3 font-medium max-w-sm mx-auto">Initialize a new seminar broadcast to populate this archive sector.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SeminarDetailsDrawer
        seminar={selectedSeminar as any}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <SeminarCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    gold: "bg-amber-50 text-amber-500 border-amber-100",
  };
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", colorMap[color])}>
          <Icon className="w-7 h-7 stroke-[2]" />
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div>
        <h4 className="text-[32px] font-black text-[#0F172A] tracking-tighter leading-none">{value}</h4>
      </div>
    </div>
  );
}

function SeminarGridItem({ seminar, onClick, onManage }: { seminar: any, onClick: () => void, onManage: () => void }) {
  return (
    <motion.div
      layout
      className="bg-white border border-slate-100 rounded-[2.5rem] p-8 group hover:border-amber-200 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-8">
        <span className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
          seminar.isLive ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
            new Date(seminar.date) > new Date() ? "bg-blue-50 text-blue-600 border-blue-100" :
              "bg-slate-50 text-slate-400 border-slate-100"
        )}>
          {seminar.isLive ? 'Live Now' : new Date(seminar.date) > new Date() ? 'Scheduled' : 'Archive'}
        </span>
        <SeminarActionsMenu seminar={seminar} onViewDetails={onClick} />
      </div>

      <h3 className="text-[20px] font-black text-[#0F172A] leading-[1.2] mb-3 group-hover:text-amber-500 transition-colors line-clamp-2 uppercase tracking-tight italic">
        {seminar.title}
      </h3>
      <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">{seminar.speakerName}</p>

      <div className="flex items-center gap-8 mb-10 mt-8">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enrolled</p>
          <p className="text-[18px] font-black text-[#0F172A] tracking-tighter">{seminar._count?.registrations || 0}</p>
        </div>
        <div className="h-10 w-px bg-slate-50" />
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Broadcast Date</p>
          <p className="text-[15px] font-black text-[#0F172A] tracking-tighter">{new Date(seminar.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        <button onClick={onClick} className="flex-1 py-4 bg-slate-50 text-[#0F172A] border border-transparent rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">Details</button>
        <button onClick={onManage} className="flex-1 py-4 bg-[#0F172A] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-black/5 flex items-center justify-center gap-2 active:scale-95">
           {seminar.isLive ? <Radio className="w-4 h-4 animate-pulse" /> : <PlayCircle className="w-4 h-4" />}
           Manage
        </button>
      </div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50/50 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
    </motion.div>
  );
}

