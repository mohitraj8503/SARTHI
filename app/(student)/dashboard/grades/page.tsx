// ATOOT KADI: DO NOT render certificate HTML/logic here — fetch and display certificate.htmlSnapshot only via getCertificateDisplayState. See ATOOT_KADI.md.
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Award, CheckCircle2, Clock, Trophy, 
    Download, Search, Filter, LayoutGrid, 
    Sparkles, FileText, Share2, Linkedin, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import CertificateActions from '@/components/certificate/CertificateActions';
import { getCertificateDisplayState } from '@/lib/certificate/getCertificateDisplayState';

function CertificatePreview({ htmlSnapshot, title }: { htmlSnapshot: string; title: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.35);

    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setScale(width / 1050);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={containerRef} className="w-full relative overflow-hidden aspect-[4/3] rounded-xl bg-slate-950">
            <iframe
                srcDoc={htmlSnapshot}
                title={title}
                sandbox="allow-same-origin allow-popups"
                className="absolute top-0 left-0 border-0 pointer-events-none origin-top-left"
                style={{
                    width: '1050px',
                    height: '787.5px',
                    transform: `scale(${scale})`,
                }}
            />
        </div>
    );
}

export default function GradesPage() {
    const [data, setData] = useState<any>({ credentials: [], stats: { verifiedCredentials: 0, milestonesCleared: 0, skillBadges: 0, status: 'CANDIDATE' } });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Credentials');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        async function loadCertificates() {
            try {
                const res = await fetch('/api/user/certificates');
                let formattedCreds: any[] = [];
                if (res.ok) {
                    const certs = await res.json();
                    
                    formattedCreds = certs.map((c: any) => ({
                        id: c.verificationId || c.certNumber || c.id,
                        title: c.certification?.title || c.course?.title || c.title || 'Professional Certification',
                        authority: 'SARTHI',
                        issueDate: new Date(c.issuedAt || c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                        score: c.score,
                        status: c.status || 'VERIFIED',
                        isExam: c.isExam || c.type === 'Certification Exam',
                        type: c.type || 'Professional Certification',
                        templateConfig: c.templateConfig || null,
                        userName: c.userName || c.user?.name || null,
                        metadata: c.metadata || null,
                        // These are deliberately carried through from the API.
                        // Previously this mapping dropped both fields, forcing
                        // every Studio certificate into the dark placeholder.
                        htmlSnapshot: c.htmlSnapshot || null,
                        imageUrl: c.imageUrl || null,
                        pdfUrl: c.pdfUrl || null,
                        issuedAt: c.issuedAt || c.createdAt
                    }));
                }

                // Load newly issued custom certificates from Studio
                try {
                    const localIssued = localStorage.getItem('tt_issued_certificates');
                    if (localIssued) {
                        const parsed = JSON.parse(localIssued);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            const localCreds = parsed.map((c: any) => ({
                                id: c.id || c.verificationId,
                                title: c.title || 'Professional Certification',
                                authority: c.authority || 'SARTHI',
                                issueDate: c.issueDate || 'Issued June 2026',
                                status: c.status || 'VERIFIED',
                                isExam: c.isExam || c.type === 'Certification Exam',
                                type: c.type || (c.isExam ? 'Certification Exam' : 'Professional Certification')
                            }));

                            const combined = [...localCreds, ...formattedCreds];
                            const map = new Map();
                            combined.forEach((item) => map.set(item.id, item));
                            formattedCreds = Array.from(map.values());
                        }
                    }
                } catch (localErr) {
                    console.error('Error loading local issued certs:', localErr);
                }

                // Several historic tables describe the same credential. Keep
                // the richest record (a Studio snapshot/image wins) so a
                // legacy userCertification row cannot produce a second card.
                const canonical = new Map<string, any>();
                for (const credential of formattedCreds) {
                    const key = credential.id;
                    const current = canonical.get(key);
                    if (!current || (!current.htmlSnapshot && credential.htmlSnapshot) || (!current.imageUrl && credential.imageUrl)) {
                        canonical.set(key, credential);
                    }
                }
                formattedCreds = Array.from(canonical.values());

                setData({
                    credentials: formattedCreds,
                    stats: {
                        verifiedCredentials: formattedCreds.length,
                        milestonesCleared: formattedCreds.length > 0 ? 4 : 0,
                        skillBadges: formattedCreds.length > 0 ? 6 : 0,
                        status: formattedCreds.length > 0 ? 'CERTIFIED' : 'CANDIDATE'
                    }
                });
            } catch (err) {
                console.error('Failed to load certificates', err);
            } finally {
                setLoading(false);
            }
        }
        loadCertificates();
    }, []);

    const filteredCredentials = (data.credentials || []).filter((cred: any) => {
        return cred.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleCopyLink = (id: string) => {
        const link = `https://sarthi-woad.vercel.app/certification-exams/verify/${id}`;
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDownload = (id: string) => {
        window.open(`/certificates/${id}`, '_blank');
    };

    const generateLinkedInUrl = (name: string, id: string) => {
        const baseUrl = 'https://www.linkedin.com/profile/add';
        const params = new URLSearchParams({
            startTask: 'CERTIFICATION_NAME',
            name: name,
            organizationName: 'SARTHI',
            issueYear: new Date().getFullYear().toString(),
            issueMonth: (new Date().getMonth() + 1).toString(),
            certId: id,
            certUrl: `https://sarthi-woad.vercel.app/certification-exams/verify/${id}`
        });
        return `${baseUrl}?${params.toString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen dashboard-container-glass flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-[#174F3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[#174F3A] font-black uppercase tracking-widest text-xs">Loading Credentials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-transparent p-3 sm:p-4 lg:p-10 pb-24 lg:pb-20 space-y-8 sm:space-y-12 min-h-screen">
            {/* Header Section */}
            <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight font-outfit italic uppercase flex items-center gap-4 justify-center md:justify-start">
                        Achievements
                        <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-2 hidden md:block" />
                    </h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">
                        Your industry-verified professional credentials
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search credentials..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-slate-100 shadow-sm"
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto space-y-12">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                    <StatsCard title="VERIFIED CREDENTIALS" value={data.stats?.verifiedCredentials || 0} icon={Trophy} color="#174F3A" />
                    <StatsCard title="MILESTONES CLEARED" value={`${data.stats?.milestonesCleared || 0} / 4`} icon={CheckCircle2} color="#22C55E" />
                    <StatsCard title="SKILL BADGES" value={data.stats?.skillBadges || 0} icon={Award} color="#F59E0B" />
                    <StatsCard title="STATUS" value={data.stats?.verifiedCredentials > 0 ? "CERTIFIED" : "CANDIDATE"} icon={Sparkles} color="#8B5CF6" />
                </div>

                {/* Filter Hub */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border-b border-slate-200/80 pb-6 sm:pb-8">
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar max-w-full shadow-sm">
                        {['All Credentials', 'Professional', 'Milestones'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeTab === tab 
                                        ? "bg-[#174F3A] text-white" 
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Grid */}
                <AnimatePresence mode="wait">
                    {filteredCredentials.length > 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-10"
                        >
                            {filteredCredentials.map((cred: any) => {
                                const displayState = getCertificateDisplayState(cred);
                                return (
                                <motion.div
                                    key={cred.id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white border border-slate-200/90 rounded-[2.5rem] p-7 flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300 group hover:border-emerald-500/30"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 text-left">
                                            <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest block">{cred.type}</span>
                                            <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                                                {cred.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-semibold">{cred.authority} • Issued {cred.issueDate}</p>
                                        </div>
                                        <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-wider shrink-0">
                                            {displayState.statusText}
                                        </span>
                                    </div>

                                    {/* Stored Certificate HTML Snapshot Display */}
                                    <div className="w-full relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 flex items-center justify-center p-2 group-hover:scale-[1.01] transition-transform duration-300">
                                        {displayState.canDisplaySnapshot ? (
                                            <CertificatePreview 
                                                htmlSnapshot={displayState.htmlSnapshot!} 
                                                title={cred.title}
                                            />
                                        ) : displayState.imageUrl ? (
                                            <img 
                                                src={displayState.imageUrl} 
                                                alt={cred.title} 
                                                className="w-full h-auto object-contain rounded-xl"
                                            />
                                        ) : (
                                            <div className="w-full aspect-[4/3] bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                                <Award className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
                                                <p className="font-extrabold text-sm text-slate-200">{cred.title}</p>
                                                <p className="text-xs text-slate-400 mt-1 font-mono">{cred.id}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                            <span>Verification ID: <code className="font-mono text-slate-800 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{cred.id}</code></span>
                                            {!cred.isExam && cred.type !== 'Certification Exam' && cred.score !== undefined && (
                                                <span className="text-emerald-600 font-bold">Score: {cred.score}%</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-2">
                                            <CertificateActions
                                                status={displayState.isValid ? 'VALID' : 'PENDING_PAYMENT'}
                                                certificateNumber={cred.id}
                                                courseTitle={cred.title}
                                                onPrintClick={() => cred.pdfUrl ? window.open(cred.pdfUrl, '_blank') : window.open(`/certification-exams/verify/${cred.id}`, '_blank')}
                                                onViewClick={() => window.open(`/certification-exams/verify/${cred.id}`, '_blank')}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-32 text-center space-y-6 max-w-4xl mx-auto w-full"
                        >
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-10 h-10 text-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase font-outfit">Your Credential Wallet is Empty</h3>
                                <p className="text-gray-400 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest leading-relaxed">Pass a certification gate to earn industry-verified credentials.</p>
                            </div>
                             <Link href="/certification-exams" className="px-8 py-3.5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#174F3A]/10 hover:scale-105 transition-all flex items-center gap-3">
                                 START ASSESSMENT <Award className="w-4 h-4" />
                             </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/80 rounded-[2rem] p-5 sm:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all shadow-sm"
            style={{ borderTop: `4px solid ${color}` }}
        >
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}10` }}>
                    <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{value}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{title}</p>
                </div>
            </div>
        </motion.div>
    );
}
