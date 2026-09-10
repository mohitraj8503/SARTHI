'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Award,
    Search,
    Filter,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    ExternalLink,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCertificatesPage() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/certificates?page=${page}&pageSize=10&search=${searchTerm}`);
            const json = await res.json();
            if (res.ok) {
                setCertificates(json.data || []);
                setTotalPages(json.meta?.totalPages || 1);
                setTotalCount(json.meta?.total || 0);
            }
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    return (
        <div className="space-y-8 p-6 lg:p-10 min-h-screen bg-[#F8FAFC] text-slate-900">
            {/* Header Section */}
            <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
                <div className="space-y-1.5 text-left relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
                        <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">VERIFIED CREDENTIALS</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
                        CREDENTIAL <span className="text-[#F97316]">REGISTRY</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
                        Global repository of issued technical certifications and verify records.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="/admin/certificates/studio"
                        className="px-6 py-3.5 bg-[#0F172A] hover:bg-[#F97316] text-white rounded-xl font-black uppercase tracking-wider text-xs flex items-center gap-2.5 transition-all shadow-md active:scale-95"
                    >
                        <Sparkles className="w-4 h-4 fill-white" />
                        Certificate Studio
                    </a>
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-2.5 text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Verified</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{totalCount.toLocaleString()}</p>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by student name, email, or certificate ID..."
                        className="w-full pl-16 pr-6 py-5 bg-white/[0.03] border border-white/10 rounded-[2rem] text-lg font-bold focus:border-primary focus:bg-white/[0.05] transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 transition-all">
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Main Table Container */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Certification</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-8"><div className="h-4 bg-white/5 rounded-full w-full" /></td>
                                        </tr>
                                    ))
                                ) : certificates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <Award className="w-16 h-16 text-white/10 mx-auto mb-4" />
                                            <p className="text-white/40 font-bold">No certifications found in registry</p>
                                        </td>
                                    </tr>
                                ) : (
                                    certificates.map((cert) => (
                                        <motion.tr
                                            key={cert.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 overflow-hidden border border-primary/20">
                                                        {cert.user.image ? (
                                                            <Image src={cert.user.image} alt={cert.user.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-black text-primary">
                                                                {cert.user.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{cert.user.name}</p>
                                                        <p className="text-xs text-white/40">{cert.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-white/80">{cert.course.title}</p>
                                                <p className="text-[10px] font-black text-primary uppercase mt-1">Certified Master</p>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-xs text-white/30 tracking-wider">
                                                {cert.certificateNumber}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{cert.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-white/60">
                                                    {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                 <div className="flex items-center justify-end gap-2">
                                                     <a
                                                         href={cert.pdfUrl || cert.imageUrl || `/verify/${cert.certificateNumber}`}
                                                         target="_blank"
                                                         className="p-3 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl transition-all border border-white/5"
                                                         title="View Certificate Artifact"
                                                     >
                                                         <Eye className="w-4 h-4" />
                                                     </a>
                                                     <button 
                                                         onClick={() => window.open(cert.pdfUrl || cert.imageUrl || `/verify/${cert.certificateNumber}`, '_blank')}
                                                         className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                                                         title="Download PDF"
                                                     >
                                                         <Download className="w-4 h-4" />
                                                     </button>
                                                     <button
                                                         onClick={async () => {
                                                             try {
                                                                 const res = await fetch('/api/admin/certificates/regenerate', {
                                                                     method: 'POST',
                                                                     headers: { 'Content-Type': 'application/json' },
                                                                     body: JSON.stringify({ certificateId: cert.certificateNumber || cert.id })
                                                                 });
                                                                 if (res.ok) fetchCertificates();
                                                             } catch (e) { console.error(e); }
                                                         }}
                                                         className="p-3 bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 rounded-xl transition-all border border-white/5"
                                                         title="Regenerate Certificate Artifacts"
                                                     >
                                                         <Sparkles className="w-4 h-4" />
                                                     </button>
                                                 </div>
                                             </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 pt-10">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-5 bg-white/5 border border-white/10 rounded-2xl disabled:opacity-20 hover:bg-white/10 transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-3">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-14 h-14 rounded-2xl font-black transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="p-5 bg-white/5 border border-white/10 rounded-2xl disabled:opacity-20 hover:bg-white/10 transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}

