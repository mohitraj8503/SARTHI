'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, MoreVertical,
    Calendar, Users, DollarSign, Clock,
    Loader2, AlertCircle, Sparkles, Download,
    CheckCircle, XCircle, Tag, BookOpen, Trash2, ChevronRight,
    IndianRupee
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';

interface Workshop {
    id: string;
    title: string;
    instructorName: string;
    date: string;
    duration: string;
    price: number;
    seats: number;
    seatsLeft: number;
    category: string;
    status: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'FULL' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    _count: { registrations: number };
}

export default function AdminWorkshopsPage() {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: workshops, isLoading, error } = useQuery({
        queryKey: ['admin-workshops'],
        queryFn: async () => {
            const res = await fetch('/api/admin/workshops');
            if (!res.ok) throw new Error('Failed to fetch workshops');
            const json = await res.json();
            return json.data || [];
        }
    });

    const deleteWorkshopMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/workshops?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Delete failed');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-workshops'] });
            addToast({ message: "Workshop deleted successfully", type: "success" });
        },
        onError: (error) => {
            addToast({ message: error.message, type: "error" });
        }
    });

    const filteredWorkshops = (Array.isArray(workshops) ? workshops : []).filter(w => 
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Active Curriculums', value: (Array.isArray(workshops) ? workshops : []).length, icon: BookOpen, color: 'blue' },
        { label: 'Inductee Registrations', value: (Array.isArray(workshops) ? workshops : []).reduce((acc: number, w: Workshop) => acc + (w._count?.registrations || 0), 0), icon: Users, color: 'green' },
        { label: 'Projected Revenue', value: `₹${(Array.isArray(workshops) ? workshops : []).reduce((acc: number, w: Workshop) => acc + ((w._count?.registrations || 0) * w.price), 0).toLocaleString()}`, icon: IndianRupee, color: 'gold' },
    ];

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
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-1 bg-amber-500 rounded-full" />
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Professional Inductions</span>
                        </div>
                        <h1 className="text-[40px] font-black text-[#0F172A] tracking-tighter uppercase leading-[0.9]">
                            Workshop <span className="text-amber-500">Terminal</span>
                        </h1>
                        <p className="text-[14px] font-medium text-slate-400 max-w-[550px] leading-relaxed">
                            Orchestrate high-intensity training cohorts, manage specialized tracks, and monitor recruitment telemetry.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-3 px-6 py-4 bg-white text-[#0F172A] border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group">
                            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" /> Export Data
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-[#0F172A] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-black/10 active:scale-95"
                        >
                            <Plus className="w-5 h-5 stroke-[3]" /> Orchestrate Track
                        </button>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{s.label}</p>
                                <h2 className="text-[32px] font-black text-[#0F172A] tracking-tighter leading-none">{s.value}</h2>
                            </div>
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                                s.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                    s.color === 'green' ? "bg-emerald-50 text-emerald-600" :
                                        "bg-amber-50 text-amber-500"
                            )}>
                                <s.icon className="w-7 h-7 stroke-[2]" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* List Table Container */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.3em]">Active Induction Tracks</h3>
                        </div>
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search tracks, instructors..."
                                className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-100 rounded-xl text-[13px] font-bold text-[#0F172A] outline-none focus:border-amber-200 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Track Metadata</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scheduling</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enrollment</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fee</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System State</th>
                                    <th className="px-10 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-10 py-10 h-24 bg-white" />
                                        </tr>
                                    ))
                                ) : filteredWorkshops?.length > 0 ? (
                                    filteredWorkshops.map((w: Workshop) => (
                                        <tr key={w.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[15px] font-black text-[#0F172A] group-hover:text-amber-600 transition-colors tracking-tight italic">{w.title}</span>
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-[9px] bg-[#0F172A]/5 px-2 py-0.5 rounded-lg text-[#0F172A] font-black uppercase tracking-widest border border-[#0F172A]/10">{w.category}</span>
                                                      <span className="text-[11px] text-slate-400 font-bold italic">by {w.instructorName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[14px] font-black text-[#0F172A]">{new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{w.duration}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center justify-between w-32">
                                                      <span className="text-[13px] font-black text-[#0F172A]">{w._count.registrations} <span className="text-slate-200">/</span> {w.seats}</span>
                                                      <span className="text-[10px] font-black text-emerald-500 uppercase">{Math.round((w._count.registrations / w.seats) * 100)}%</span>
                                                    </div>
                                                    <div className="w-32 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-1000" style={{ width: `${(w._count.registrations / w.seats) * 100}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-[18px] font-black text-[#0F172A] tracking-tighter italic">₹{w.price.toLocaleString()}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all",
                                                    w.status === 'PUBLISHED' || w.status === 'REGISTRATION_OPEN' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        w.status === 'DRAFT' ? "bg-slate-50 text-slate-300 border-slate-100" :
                                                            "bg-blue-50 text-blue-600 border-blue-100"
                                                )}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                    {w.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => {
                                                            if (confirm('Permanently decommission this track?')) {
                                                                deleteWorkshopMutation.mutate(w.id);
                                                            }
                                                        }}
                                                        disabled={deleteWorkshopMutation.isPending}
                                                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-transparent hover:border-red-100 active:scale-90"
                                                        title="Decommission Track"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
                                                    <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-200 flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-all shadow-sm active:scale-90">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                                <BookOpen className="w-10 h-10" />
                                              </div>
                                              <p className="text-[#0F172A] font-black text-[12px] uppercase tracking-[0.4em] italic">No induction tracks detected_</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Workshop Modal */}
                <AnimatePresence>
                    {isCreateModalOpen && (
                        <WorkshopCreateModal
                            onClose={() => setIsCreateModalOpen(false)}
                            onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['admin-workshops'] }); setIsCreateModalOpen(false); }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function WorkshopCreateModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const [form, setForm] = useState({
        title: '',
        description: '',
        instructorName: '',
        instructorId: '',
        date: '',
        duration: '2 Hours',
        price: 999,
        originalPrice: 1999,
        seats: 30,
        category: 'Development',
        tags: '',
        status: 'PUBLISHED'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/workshops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                    price: Number(form.price),
                    originalPrice: Number(form.originalPrice),
                    seats: Number(form.seats),
                })
            });

            if (!res.ok) throw new Error("Creation failed");

            addToast({ message: "Workshop and induction published successfully!", type: "success" });
            onSuccess();
        } catch (err: any) {
            addToast({ message: err.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
        >
            <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md animate-fade-in" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-white w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-100"
            >
                <div className="p-10 border-b border-slate-50 flex items-center justify-between relative overflow-hidden bg-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative">
                        <h2 id="modal-title" className="text-[28px] font-black text-[#0F172A] tracking-tight italic leading-none mb-2">Orchestrate Track</h2>
                        <p id="modal-description" className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">New Professional Induction Sequence</p>
                    </div>
                    <button onClick={onClose} className="relative p-3 bg-slate-50 rounded-2xl text-slate-300 hover:text-[#0F172A] transition-all active:scale-90">
                      <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto no-scrollbar bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Workshop Title *</label>
                            <input
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Fullstack Next.js 14 Deep Dive"
                                className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category</label>
                            <input
                                required
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Instructor Name</label>
                            <input
                                required
                                value={form.instructorName}
                                onChange={e => setForm({ ...form, instructorName: e.target.value })}
                                className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Proposed Date</label>
                            <input
                                required
                                type="datetime-local"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Duration</label>
                            <input
                                required
                                value={form.duration}
                                onChange={e => setForm({ ...form, duration: e.target.value })}
                                className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Price (₹)</label>
                            <input
                                required
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Total Capacity</label>
                            <input
                                required
                                type="number"
                                value={form.seats}
                                onChange={e => setForm({ ...form, seats: Number(e.target.value) })}
                                className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                            />
                        </div>
                    </div>
                </form>

                <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex gap-6">
                    <button onClick={onClose} className="flex-1 py-5 text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-[#0F172A] transition-all">Discard</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] py-5 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-500" />}
                        Publish & Orchestrate
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

