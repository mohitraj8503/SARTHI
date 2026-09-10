'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    User,
    Calendar,
    BookOpen,
    Activity,
    BarChart3,
    Edit,
    ExternalLink,
    Shield,
    IndianRupee,
    Users,
    Briefcase,
    Star,
    Plus,
    Lock,
    Globe,
    CheckCircle2,
    ShieldCheck,
    Phone,
    RotateCcw,
    Linkedin,
    FileText,
    GraduationCap,
    TrendingUp,
    MapPin,
    Building2,
    Clock,
    AlertCircle,
    MessageSquare,
    Ban,
    LockOpen,
    Info,
    Download,
    Eye,
    Check,
    X,
    Settings,
    CreditCard,
    DollarSign,
    RefreshCw,
    UserCheck,
    Send,
    EyeOff
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Cell,
    Pie,
    CartesianGrid
} from 'recharts';

// THEME SYSTEM
const THEME = {
    bg: '#f6f8fb',
    mainText: '#0f172a',
    secondaryText: '#64748b',
    accentBlue: '#2563eb',
    accentNavy: '#0f172a',
    successGreen: '#22c55e',
    border: 'rgba(15,23,42,0.08)',
    card: 'white'
};

export default function TeacherDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const teacherId = params.id as string;

    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'analytics' | 'revenue' | 'payouts' | 'activity' | 'settings'>('overview');
    const [analyticsRange, setAnalyticsRange] = useState<string>('30');
    
    // Core query for basic details & summary stats
    const { data: teacher, isLoading, error } = useQuery<any>({
        queryKey: ['admin-teacher', teacherId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/teachers/${teacherId}?tab=overview`);
            if (!res.ok) throw new Error('Failed to fetch teacher');
            const json = await res.json();
            return json.data;
        },
        enabled: !!teacherId,
    });

    // Tab-specific details query
    const { data: tabData, isLoading: isTabLoading, refetch: refetchTab } = useQuery<any>({
        queryKey: ['admin-teacher-tab', teacherId, activeTab, analyticsRange],
        queryFn: async () => {
            const res = await fetch(`/api/admin/teachers/${teacherId}?tab=${activeTab}&range=${analyticsRange}`);
            if (!res.ok) throw new Error('Failed to fetch tab data');
            const json = await res.json();
            return json.data;
        },
        enabled: !!teacherId && activeTab !== 'overview', // overview is handled by primary query
    });

    // Unified Status mutation (Approve, Suspend, Verify states)
    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            const res = await fetch(`/api/admin/teachers/${teacherId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: (data) => {
            addToast({ type: 'success', title: 'Status Synchronized', message: 'Verification status updated successfully.' });
            queryClient.invalidateQueries({ queryKey: ['admin-teacher', teacherId] });
            refetchTab();
        },
        onError: (err: any) => {
            addToast({ type: 'error', title: 'Error', message: err.message });
        }
    });

    // Update permissions mutation
    const updatePermissionsMutation = useMutation({
        mutationFn: async (permissions: any) => {
            const res = await fetch(`/api/admin/teachers/${teacherId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(permissions),
            });
            if (!res.ok) throw new Error('Failed to update permissions');
            return res.json();
        },
        onSuccess: () => {
            addToast({ type: 'success', title: 'Permissions Synced', message: 'Faculty credentials updated.' });
            queryClient.invalidateQueries({ queryKey: ['admin-teacher', teacherId] });
            refetchTab();
        },
        onError: (err: any) => {
            addToast({ type: 'error', title: 'Error', message: err.message });
        }
    });

    // Reset Credentials mutation
    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/admin/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset-password', teacherId }),
            });
            if (!res.ok) throw new Error('Failed to reset credentials');
            return res.json();
        },
        onSuccess: (data) => {
            addToast({ type: 'success', title: 'Security Synchronized', message: `Temporary password: ${data.data.tempPassword}` });
            queryClient.invalidateQueries({ queryKey: ['admin-teacher', teacherId] });
        },
        onError: (err: any) => {
            addToast({ type: 'error', title: 'Error', message: err.message });
        }
    });

    // Impersonate / Login as Faculty
    const impersonateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: teacherId }),
            });
            if (!res.ok) throw new Error('Impersonation protocol failed');
            return res.json();
        },
        onSuccess: () => {
            addToast({ type: 'success', title: 'Impersonation Activated', message: 'Redirecting to Faculty workspace...' });
            router.push('/dashboard');
        },
        onError: (err: any) => {
            addToast({ type: 'error', title: 'Error', message: err.message });
        }
    });

    // Approve payout account details
    const payoutApprovalMutation = useMutation({
        mutationFn: async (status: 'approved' | 'rejected') => {
            const res = await fetch(`/api/admin/teachers/${teacherId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payoutDetailsStatus: status }),
            });
            if (!res.ok) throw new Error('Failed to update payout approval status');
            return res.json();
        },
        onSuccess: () => {
            addToast({ type: 'success', title: 'Payout Method Approved', message: 'Details verified.' });
            queryClient.invalidateQueries({ queryKey: ['admin-teacher', teacherId] });
            refetchTab();
        },
        onError: (err: any) => {
            addToast({ type: 'error', title: 'Error', message: err.message });
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#f6f8fb]">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="mt-6 text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing Faculty Node</p>
            </div>
        );
    }

    if (error || !teacher) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-3xl border border-[rgba(15,23,42,0.08)] text-center shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-2xl font-black text-[#0f172a] mb-3">Faculty Record Unreachable</h2>
                <p className="text-slate-400 mb-10 leading-relaxed font-medium">The requested instructor profile is either undergoing deep archival or has been moved to a different sector.</p>
                <button 
                    onClick={() => router.push('/admin/teachers')} 
                    className="px-10 py-5 bg-[#0f172a] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    // Helper for rendering verification states
    const statusMap: { [key: string]: { label: string; bg: string; text: string; border: string } } = {
        pending: { label: 'Pending Verification', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        primary_verified: { label: 'Primary Verified', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
        secondary_required: { label: 'Secondary Verification Required', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
        verified: { label: 'Fully Verified', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        suspended: { label: 'Suspended', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
        inactive: { label: 'Inactive / Suspended', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' }
    };

    const currentStatus = statusMap[teacher.status] || statusMap.pending;

    // Zero-state values checks
    const stats = teacher.summary || {
        totalCourses: 0,
        totalStudents: 0,
        grossRevenue: 0,
        netRevenue: 0,
        averageRating: 0,
        activeEnrollments: 0,
        completionRate: 0,
        retentionRate: 0
    };

    const expertiseList = teacher.teacherInfo?.expertise?.split(',') 
        || (teacher.application?.skills ? (typeof teacher.application.skills === 'string' ? JSON.parse(teacher.application.skills) : teacher.application.skills) : [])
        || [];

    return (
        <div className="min-h-screen bg-[#f6f8fb] pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* HERO SECTION */}
            <div className="max-w-[1600px] mx-auto px-8 pt-10 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/admin/teachers')}
                            className="w-12 h-12 flex items-center justify-center bg-white hover:bg-slate-50 rounded-2xl transition-all border border-[rgba(15,23,42,0.08)] shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-[#0f172a] transition-colors" />
                        </button>
                        
                        <div className="flex items-center gap-6">
                            <div className="relative w-20 h-20 shrink-0">
                                <div className="absolute inset-0 bg-blue-600 rounded-[28px] rotate-6 opacity-5" />
                                <div className="w-20 h-20 rounded-[28px] bg-white border border-[rgba(15,23,42,0.08)] flex items-center justify-center font-black text-blue-600 text-2xl relative overflow-hidden shadow-sm">
                                    {teacher.image || teacher.application?.profilePhotoUrl ? (
                                        <img src={teacher.image || teacher.application?.profilePhotoUrl || ''} alt={teacher.name || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span>{teacher.name?.[0] || 'F'}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">{teacher.name || teacher.application?.fullName || 'Faculty Member'}</h1>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        currentStatus.bg, currentStatus.text, currentStatus.border
                                    )}>
                                        {currentStatus.label}
                                    </div>
                                    <div className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-slate-200">
                                        {teacher.role}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{teacher.teacherInfo?.title || teacher.application?.headline || 'Lead Instructor'}</span>
                                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{teacher.teacherInfo?.teacherId || 'FAC-NODE-SECURE'}</span>
                                    {teacher.application?.linkedinUrl && (
                                        <a href={teacher.application.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-0.5 bg-white hover:bg-slate-50 text-[#0077B5] rounded-lg transition-all border border-[rgba(15,23,42,0.08)] text-[10px] font-bold">
                                            <Linkedin className="w-3 h-3" /> LinkedIn
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC VERIFICATION ACTIONS */}
                    <div className="flex items-center gap-3 flex-wrap bg-white p-3 rounded-2xl border border-[rgba(15,23,42,0.08)] shadow-sm">
                        {teacher.status === 'verified' ? (
                            <div className="flex items-center gap-2 text-emerald-600 px-4 text-xs font-black uppercase tracking-wider">
                                <ShieldCheck className="w-5 h-5" />
                                <span>Faculty Successfully Verified</span>
                            </div>
                        ) : (
                            <>
                                {teacher.status === 'pending' && (
                                    <button 
                                        onClick={() => updateStatusMutation.mutate('primary_verified')}
                                        className="h-10 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                    >
                                        Primary Verify
                                    </button>
                                )}
                                {teacher.status === 'primary_verified' && (
                                    <>
                                        <button 
                                            onClick={() => updateStatusMutation.mutate('secondary_required')}
                                            className="h-10 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                        >
                                            Req Secondary Verify
                                        </button>
                                        <button 
                                            onClick={() => updateStatusMutation.mutate('verified')}
                                            className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                                        >
                                            Fully Verify
                                        </button>
                                    </>
                                )}
                                {teacher.status === 'secondary_required' && (
                                    <button 
                                        onClick={() => updateStatusMutation.mutate('verified')}
                                        className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                                    >
                                        Approve Secondary & Verify
                                    </button>
                                )}
                                {(teacher.status === 'suspended' || teacher.status === 'inactive') && (
                                    <button 
                                        onClick={() => updateStatusMutation.mutate('verified')}
                                        className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                                    >
                                        Re-Activate / Verify
                                    </button>
                                )}
                                {teacher.status !== 'suspended' && teacher.status !== 'inactive' && (
                                    <button 
                                        onClick={() => updateStatusMutation.mutate('suspended')}
                                        className="h-10 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                    >
                                        Suspend
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* STATS SECTION */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    <StatCard icon={BookOpen} label="Courses" value={stats.totalCourses} color="blue" />
                    <StatCard 
                        icon={Users} 
                        label="Students" 
                        value={stats.totalStudents === 0 ? 'No learners enrolled yet' : stats.totalStudents} 
                        color="green" 
                    />
                    <StatCard 
                        icon={IndianRupee} 
                        label="Revenue" 
                        value={stats.grossRevenue === 0 ? 'No transactions recorded' : `₹${(stats.grossRevenue / 1000).toFixed(1)}k`} 
                        color="amber" 
                    />
                    <StatCard 
                        icon={Star} 
                        label="Rating" 
                        value={stats.averageRating === 0 ? 'No ratings received yet' : stats.averageRating.toFixed(1)} 
                        color="blue" 
                    />
                    <StatCard 
                        icon={Calendar} 
                        label="Join Date" 
                        value={new Date(teacher.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} 
                        color="green" 
                    />
                    <StatCard 
                        icon={TrendingUp} 
                        label="Completion" 
                        value={stats.totalStudents === 0 ? 'No learners enrolled yet' : `${stats.completionRate.toFixed(1)}%`} 
                        color="amber" 
                    />
                </div>

                {/* TABS SECTION */}
                <div className="flex gap-1 bg-white p-1 rounded-[1.8rem] border border-[rgba(15,23,42,0.08)] shadow-sm overflow-x-auto no-scrollbar">
                    {(['overview', 'courses', 'students', 'analytics', 'revenue', 'payouts', 'activity', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap min-w-fit rounded-[1.3rem]",
                                activeTab === tab ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-400 hover:text-[#0f172a] hover:bg-slate-50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ADMIN ACTIONS BAR / SUPERPOWERS */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Shield className="w-4 h-4" />
                        </div>
                        <h4 className="text-[12px] font-black uppercase text-[#0f172a] tracking-wider">Admin Control Sector</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={() => impersonateMutation.mutate()}
                            disabled={impersonateMutation.isPending}
                            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
                        >
                            <UserCheck className="w-3.5 h-3.5" /> Impersonate
                        </button>
                        <button 
                            onClick={() => resetPasswordMutation.mutate()}
                            disabled={resetPasswordMutation.isPending}
                            className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-[#0f172a] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Pass
                        </button>
                        <button 
                            onClick={() => {
                                const rate = prompt("Enter custom commission rate (%):", teacher.teacherInfo?.commissionRate || 70);
                                if (rate) updatePermissionsMutation.mutate({ commissionRate: rate });
                            }}
                            className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-[#0f172a] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Commission: {teacher.teacherInfo?.commissionRate ?? 70}%
                        </button>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className="pb-20">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Academic Dossier */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white rounded-[24px] p-8 border border-[rgba(15,23,42,0.08)] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-black text-[#0f172a] tracking-tight uppercase italic">Professional Dossier</h3>
                                                <div className="h-1 w-10 bg-blue-600 rounded-full" />
                                            </div>
                                        </div>                                        <div className="space-y-8">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Biography</label>
                                                <p className="text-[#0f172a] font-medium leading-relaxed bg-slate-50 p-6 rounded-[18px] border border-slate-100/50 italic text-sm">
                                                    &quot;{teacher.bio || "No biography details connected."}&quot;
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InfoItem icon={Mail} label="Email Address" value={teacher.email} />
                                                <InfoItem icon={Phone} label="Phone Number" value={teacher.phone || 'Not Provided'} />
                                                <InfoItem icon={GraduationCap} label="Expertise" value={teacher.roleTitle || expertiseList.slice(0, 3).join(', ') || 'General Faculty'} />
                                                <InfoItem icon={Calendar} label="Joined Date" value={new Date(teacher.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })} />
                                                <InfoItem icon={Building2} label="Institution" value={teacher.company || 'SARTHI Faculty'} />
                                                <InfoItem icon={Activity} label="Status" value={currentStatus.label} />
                                            </div>

                                            {teacher.preferredSubjects && teacher.preferredSubjects.length > 0 && (
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preferred Subjects</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {teacher.preferredSubjects.map((sub: string, index: number) => (
                                                            <span key={index} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase rounded-lg border border-emerald-100/50 tracking-wider">
                                                                {sub}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {teacher.toolsMastery && (
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tools Mastery</label>
                                                    <p className="text-xs text-slate-600 font-bold bg-slate-50 p-4 rounded-xl border border-slate-100/50 leading-relaxed">
                                                        {teacher.toolsMastery}
                                                    </p>
                                                </div>
                                            )}

                                            {teacher.availability && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Availability Days</label>
                                                        <p className="text-xs text-[#0f172a] font-bold">{teacher.availability.availableDays?.join(', ') || 'Not Configured'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Preferred Slots</label>
                                                        <p className="text-xs text-[#0f172a] font-bold">{teacher.availability.preferredTimeSlots?.join(', ') || 'Not Configured'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Timezone</label>
                                                        <p className="text-xs text-[#0f172a] font-bold">{teacher.availability.timezone || 'Not Specified'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location Mode</label>
                                                        <p className="text-xs text-[#0f172a] font-bold">{teacher.availability.remoteOfflineAvailability || 'Not Specified'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {teacher.portfolioLinks && (
                                                <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-6">
                                                    {teacher.portfolioLinks.githubUrl && (
                                                        <a href={teacher.portfolioLinks.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-black text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-colors">
                                                            <ExternalLink className="w-3.5 h-3.5" /> GitHub Profile
                                                        </a>
                                                    )}
                                                    {teacher.portfolioLinks.personalWebsite && (
                                                        <a href={teacher.portfolioLinks.personalWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-black text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-colors">
                                                            <ExternalLink className="w-3.5 h-3.5" /> Personal Website
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                                        <h3 className="text-[12px] font-black text-[#0f172a] uppercase tracking-widest mb-6">Recent Activity Logs</h3>
                                        {teacher.recentActivity && teacher.recentActivity.length > 0 ? (
                                            <div className="divide-y divide-slate-50">
                                                {teacher.recentActivity.map((log: any) => (
                                                    <div key={log.id} className="py-4 flex justify-between items-center text-sm">
                                                        <div>
                                                            <p className="font-bold text-[#0f172a] uppercase text-xs">{log.action.replace(/_/g, ' ')}</p>
                                                            <p className="text-slate-400 text-xs mt-1">{log.details || 'System event triggered.'}</p>
                                                        </div>
                                                        <span className="text-slate-400 font-mono text-[10px]">{new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-slate-300 uppercase text-[10px] font-black tracking-wider">No recent activity</div>
                                        )}
                                    </div>
                                </div>

                                {/* Health Score Column */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)] text-center">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Faculty Health Index</h3>
                                        
                                        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
                                            <div className="absolute inset-0 rounded-full border-8 border-blue-600" style={{ clipPath: `polygon(50% 50%, -50% -50%, ${teacher.healthScore * 3.6}% -50%)`, transform: 'rotate(-90deg)' }} />
                                            <div className="z-10">
                                                <span className="text-4xl font-black text-[#0f172a]">{teacher.healthScore}</span>
                                                <span className="text-slate-400 text-xs font-bold block">/ 100</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 text-left border-t border-slate-50 pt-6">
                                            <HealthMetricRow label="Profile Completion" score={teacher.healthBreakdown?.profile} max={20} />
                                            <HealthMetricRow label="Course Activity" score={teacher.healthBreakdown?.courseActivity} max={20} />
                                            <HealthMetricRow label="Student Engagement" score={teacher.healthBreakdown?.engagement} max={20} />
                                            <HealthMetricRow label="Attendance Rate" score={teacher.healthBreakdown?.attendance} max={20} />
                                            <HealthMetricRow label="Student Ratings" score={teacher.healthBreakdown?.rating} max={20} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'courses' && (
                            <motion.div key="courses" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] border border-[rgba(15,23,42,0.08)] p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-[#0f172a] tracking-tight uppercase italic leading-none">Curriculums</h3>
                                </div>

                                {isTabLoading ? (
                                    <div className="py-20 text-center font-black uppercase text-slate-300 tracking-wider text-[11px] animate-pulse">Accessing Trajectories...</div>
                                ) : tabData && tabData.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {tabData.map((course: any) => (
                                            <div key={course.id} className="flex flex-col bg-slate-50/50 rounded-[20px] border border-slate-100 p-6 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                        course.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                                    )}>
                                                        {course.isPublished ? 'Live' : 'Draft'}
                                                    </span>
                                                    <div className="flex gap-1.5">
                                                        <button 
                                                            onClick={() => addToast({ type: 'info', title: 'Route Synced', message: `Previewing ${course.title}` })}
                                                            className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => addToast({ type: 'info', title: 'Edit Mode', message: `Editing ${course.title}` })}
                                                            className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="text-md font-black text-[#0f172a] mb-6 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">{course.title}</h4>
                                                
                                                <div className="space-y-3 mb-6 text-xs border-t border-b border-slate-100/70 py-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Enrolled Students:</span>
                                                        <span className="font-bold text-[#0f172a]">{course.enrolledStudentsCount}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Completion %:</span>
                                                        <span className="font-bold text-[#0f172a]">{course.completionPercentage.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Gross Revenue:</span>
                                                        <span className="font-bold text-[#0f172a]">₹{course.revenueGenerated.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-xs font-black text-[#0f172a]">{course.averageRating.toFixed(1)}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Engagement: {course.engagementScore}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 border-2 border-dashed border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-center bg-slate-50/20">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                            <BookOpen className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-black text-[#0f172a] uppercase">No courses created</h3>
                                        <p className="text-slate-400 text-xs font-medium mt-2 max-w-sm">Deploy courses to start enrollment flow.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'students' && (
                            <motion.div key="students" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-[#0f172a] uppercase italic">Learners Directory</h3>
                                </div>

                                {isTabLoading ? (
                                    <div className="py-20 text-center font-black uppercase text-slate-300 tracking-wider text-[11px] animate-pulse">Syncing Learners...</div>
                                ) : tabData && tabData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Trajectory</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Date</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {tabData.map((student: any) => (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-500 text-xs">
                                                                {student.image ? <img src={student.image} alt={student.name} /> : student.name?.[0] || 'S'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-[#0f172a] text-sm">{student.name || 'Anonymous Learner'}</p>
                                                                <p className="text-slate-400 text-xs">{student.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-semibold text-[#0f172a]">{student.course}</td>
                                                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(student.enrollmentDate).toLocaleDateString('en-IN')}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="w-24 bg-slate-100 rounded-full h-2 relative overflow-hidden">
                                                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${student.progress}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 mt-1 block">{student.progress}% Complete</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-[#0f172a]">{student.attendance.toFixed(1)}%</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                                student.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400"
                                                            )}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-20 border-2 border-dashed border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-center bg-slate-50/20">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                            <Users className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-black text-[#0f172a] uppercase">No students have enrolled yet</h3>
                                        <p className="text-slate-400 text-xs font-medium mt-2 max-w-sm">Share course links to start onboarding student enrollment.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div key="analytics" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex justify-between items-center">
                                    <h3 className="text-lg font-black text-[#0f172a] uppercase italic">Analytics Sandbox</h3>
                                    <div className="flex gap-2">
                                        {['7', '30', '90', '365'].map(range => (
                                            <button 
                                                key={range} 
                                                onClick={() => setAnalyticsRange(range)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                    analyticsRange === range ? "bg-[#0f172a] text-white" : "bg-slate-50 text-slate-400 hover:text-[#0f172a]"
                                                )}
                                            >
                                                {range} Days
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isTabLoading ? (
                                    <div className="py-20 text-center font-black uppercase text-slate-300 tracking-wider text-[11px] animate-pulse">Calculating Vectors...</div>
                                ) : tabData && tabData.growthTrend && tabData.growthTrend.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Growth Trend */}
                                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-6">Student Growth Trend</h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={tabData.growthTrend}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.05)" />
                                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={0.1} fill="#2563eb" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Enrollment Trend */}
                                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-6">Cumulative Enrollments</h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={tabData.enrollmentTrend}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.05)" />
                                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                        <Tooltip />
                                                        <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Progress buckets */}
                                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-6">Drop-off / Progress Distribution</h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={tabData.progressBuckets}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.05)" />
                                                        <XAxis dataKey="bucket" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                        <Tooltip />
                                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Top Courses */}
                                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-6">Performance by Course</h4>
                                            <div className="space-y-4">
                                                {tabData.topCourses.map((c: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-xs font-bold text-[#0f172a] truncate max-w-xs">{c.title}</span>
                                                        <div className="flex gap-4 text-xs font-black">
                                                            <span className="text-slate-400">{c.enrollments} Students</span>
                                                            <span className="text-emerald-600">₹{c.revenue.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 border bg-white border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-center shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                            <BarChart3 className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-black text-[#0f172a] uppercase">No analytics available yet</h3>
                                        <p className="text-slate-400 text-xs font-medium mt-2 max-w-sm px-8">Analytics will appear after students start engaging with courses.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'revenue' && (
                            <motion.div key="revenue" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {isTabLoading ? (
                                    <div className="py-20 text-center font-black uppercase text-slate-300 tracking-wider text-[11px] animate-pulse">Summing Ledgers...</div>
                                ) : tabData && tabData.summary && tabData.transactions && tabData.transactions.length > 0 ? (
                                    <>
                                        {/* Revenue metrics cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                            <BalanceCard label="Gross Revenue" value={`₹${tabData.summary.grossRevenue.toLocaleString()}`} icon={IndianRupee} color="blue" />
                                            <BalanceCard label="Net Instructor Share" value={`₹${tabData.summary.netRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
                                            <BalanceCard label="Overhead Platform Fees" value={`₹${tabData.summary.platformFees.toLocaleString()}`} icon={CreditCard} color="amber" />
                                            <BalanceCard 
                                                label="Monthly Growth" 
                                                value={tabData.summary.growthPeriodExists ? `${tabData.summary.growthPercentage}%` : 'No historical data'} 
                                                icon={TrendingUp} 
                                                color={tabData.summary.growthPercentage >= 0 ? 'green' : 'red'} 
                                            />
                                        </div>

                                        {/* Transactions table */}
                                        <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm">
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-6">Transactions Records</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse min-w-[700px]">
                                                    <thead>
                                                        <tr className="bg-slate-50 border-b border-slate-100">
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Purchased</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {tabData.transactions.map((tx: any) => (
                                                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{tx.invoiceNumber}</td>
                                                                <td className="px-6 py-4 text-xs font-semibold text-[#0f172a]">{tx.studentName || tx.studentEmail}</td>
                                                                <td className="px-6 py-4 text-xs text-slate-500">{tx.courseTitle}</td>
                                                                <td className="px-6 py-4 text-xs font-bold text-[#0f172a]">₹{tx.amount.toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">{tx.status}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-20 border bg-white border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-center shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                            <IndianRupee className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-black text-[#0f172a] uppercase">No transactions recorded</h3>
                                        <p className="text-slate-400 text-xs font-medium mt-2 max-w-sm">No transaction events exist yet for this faculty node.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'payouts' && (
                            <motion.div key="payouts" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {isTabLoading ? (
                                    <div className="py-20 text-center font-black uppercase text-slate-300 tracking-wider text-[11px] animate-pulse">Interrogating Balances...</div>
                                ) : tabData ? (
                                    <>
                                        {/* Payout Connection States */}
                                        {tabData.detailsStatus === 'none' && (
                                            <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm text-center max-w-lg mx-auto">
                                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <CreditCard className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-black text-[#0f172a] uppercase">Connect payout account</h3>
                                                <p className="text-slate-400 text-xs mt-2 mb-8">Payout options must be configured by faculty to receive balances.</p>
                                                
                                                {/* Simulated onboarding forms */}
                                                <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                    <h4 className="text-[10px] font-black uppercase text-slate-400">Configure UPI ID</h4>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="example@upi" 
                                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                                            id="upiInput"
                                                        />
                                                        <button 
                                                            onClick={() => {
                                                                const upi = (document.getElementById('upiInput') as HTMLInputElement)?.value;
                                                                if (upi) {
                                                                    updatePermissionsMutation.mutate({ 
                                                                        payoutMethodType: 'UPI', 
                                                                        payoutDetails: { upi },
                                                                        payoutDetailsStatus: 'pending'
                                                                    });
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-lg"
                                                        >
                                                            Submit UPI
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {tabData.detailsStatus === 'pending' && (
                                            <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm text-center max-w-lg mx-auto">
                                                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                                    <Clock className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-black text-[#0f172a] uppercase">Payout Pending Verification</h3>
                                                <p className="text-slate-400 text-xs mt-2 mb-6">The submitted details require administrative clearance.</p>
                                                
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8 text-sm">
                                                    <p className="font-bold text-[#0f172a] uppercase text-[10px] text-slate-400 mb-2">Submitted Payout Node</p>
                                                    <pre className="font-mono text-xs text-slate-600">{JSON.stringify(tabData.details, null, 2)}</pre>
                                                </div>

                                                <div className="flex gap-3 justify-center">
                                                    <button 
                                                        onClick={() => payoutApprovalMutation.mutate('approved')}
                                                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                                    >
                                                        Approve Connection
                                                    </button>
                                                    <button 
                                                        onClick={() => payoutApprovalMutation.mutate('rejected')}
                                                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                                    >
                                                        Reject Connection
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {tabData.detailsStatus === 'approved' && (
                                            <>
                                                {/* Balance Cards */}
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                                                    <BalanceCard label="Available Balance" value={`₹${tabData.metrics.availableBalance.toLocaleString()}`} icon={DollarSign} color="blue" />
                                                    <BalanceCard label="Pending Balance" value={`₹${tabData.metrics.pendingBalance.toLocaleString()}`} icon={Clock} color="amber" />
                                                    <BalanceCard label="Lifetime Earnings" value={`₹${tabData.metrics.lifetimeEarnings.toLocaleString()}`} icon={IndianRupee} color="green" />
                                                    <BalanceCard label="Total Withdrawals" value={`₹${tabData.metrics.totalWithdrawals.toLocaleString()}`} icon={CreditCard} color="blue" />
                                                    <BalanceCard 
                                                        label="Last Payout Date" 
                                                        value={tabData.metrics.lastPayoutDate ? new Date(tabData.metrics.lastPayoutDate).toLocaleDateString('en-IN') : 'No payout recorded'} 
                                                        icon={Calendar} 
                                                        color="amber" 
                                                    />
                                                </div>

                                                {/* Withdrawals list */}
                                                <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm">
                                                    <h4 className="text-xs font-black uppercase text-slate-400 mb-6">Withdrawal History</h4>
                                                    {tabData.payouts && tabData.payouts.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left border-collapse min-w-[600px]">
                                                                <thead>
                                                                    <tr className="bg-slate-50 border-b border-slate-100">
                                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Method</th>
                                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {tabData.payouts.map((po: any) => (
                                                                        <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                                                                            <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{po.transactionId}</td>
                                                                            <td className="px-6 py-4 text-xs font-bold text-[#0f172a]">₹{po.amount.toLocaleString()}</td>
                                                                            <td className="px-6 py-4 text-xs text-slate-500 uppercase">{po.method}</td>
                                                                            <td className="px-6 py-4 text-xs text-slate-400">{new Date(po.date).toLocaleDateString('en-IN')}</td>
                                                                            <td className="px-6 py-4 text-right">
                                                                                <span className={cn(
                                                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                                                                    po.status === 'processed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                                                                )}>{po.status}</span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 text-slate-300 uppercase text-[10px] font-black tracking-wider">No successful payouts in registry</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : null}
                            </motion.div>
                        )}

                        {activeTab === 'activity' && (
                            <motion.div key="activity" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.04)] p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-[#0f172a] uppercase italic">Audit Trail Log</h3>
                                </div>

                                {isTabLoading ? (
                                    <div className="py-20 text-center font-black uppercase text-slate-300 tracking-wider text-[11px] animate-pulse">Unlocking Security Registers...</div>
                                ) : tabData && tabData.logs && tabData.logs.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {tabData.logs.map((log: any) => (
                                            <div key={log.id} className="py-4 flex justify-between items-center text-sm hover:bg-slate-50/20 px-2 rounded-xl transition-all">
                                                <div>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-wider">{log.action}</span>
                                                    <p className="text-slate-600 text-xs mt-2">{log.details || 'General event audit signature.'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-slate-400 font-mono text-[10px] block">{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">Actor: {log.adminId || 'SYSTEM'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 border-2 border-dashed border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-center bg-slate-50/20">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                            <Activity className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-black text-[#0f172a] uppercase">No recent activity</h3>
                                        <p className="text-slate-400 text-xs font-medium mt-2 max-w-sm">No activity recorded for this faculty sector yet.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Profile settings */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm">
                                        <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-widest mb-6">Faculty Settings Profile</h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const nameVal = (document.getElementById('set_name') as HTMLInputElement)?.value;
                                            const bioVal = (document.getElementById('set_bio') as HTMLTextAreaElement)?.value;
                                            const compVal = (document.getElementById('set_company') as HTMLInputElement)?.value;
                                            updatePermissionsMutation.mutate({ name: nameVal, bio: bioVal, company: compVal });
                                        }} className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <div>
                                                <label className="block mb-2">Display Name</label>
                                                <input 
                                                    type="text" 
                                                    id="set_name" 
                                                    defaultValue={teacher.name || ''} 
                                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-normal text-[#0f172a] lowercase first-letter:uppercase"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-2">Company / Institution</label>
                                                <input 
                                                    type="text" 
                                                    id="set_company" 
                                                    defaultValue={teacher.company || ''} 
                                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-normal text-[#0f172a]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-2">Biography Dossier</label>
                                                <textarea 
                                                    id="set_bio" 
                                                    rows={4}
                                                    defaultValue={teacher.bio || ''} 
                                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-normal text-[#0f172a]"
                                                />
                                            </div>
                                            <button 
                                                type="submit"
                                                className="px-6 py-3 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-blue-600 transition-all"
                                            >
                                                Synchronize Profile
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Sessions & Security config */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-widest mb-6">Device Sessions</h3>
                                        {isTabLoading ? (
                                            <p className="animate-pulse">Loading sessions...</p>
                                        ) : tabData && tabData.sessions && tabData.sessions.length > 0 ? (
                                            <div className="space-y-4">
                                                {tabData.sessions.map((s: any) => (
                                                    <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="flex justify-between items-center text-[#0f172a] font-bold">
                                                            <span>{s.ipAddress}</span>
                                                            <span className="text-[9px] text-slate-300 font-bold">{new Date(s.lastActivity).toLocaleDateString('en-IN')}</span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-400 mt-1 font-semibold normal-case">{s.city}, {s.state}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-300">No active sessions found.</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// REDESIGNED HELPER COMPONENTS

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: 'blue' | 'green' | 'amber' }) {
    return (
        <div className="bg-white p-5 rounded-[20px] border border-[rgba(15,23,42,0.06)] shadow-sm group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className={cn(
                "absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300",
                color === 'blue' ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                color === 'green' ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
                "bg-gradient-to-br from-amber-500 to-orange-600"
            )} />
            
            <div className="relative flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                        color === 'blue' ? "bg-blue-50 text-blue-600" :
                        color === 'green' ? "bg-emerald-50 text-emerald-600" :
                        "bg-amber-50 text-amber-600"
                    )}>
                        <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                </div>
                
                <h2 className="text-[20px] font-black text-[#0f172a] leading-none tracking-tight">
                    {value}
                </h2>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50/50 border border-slate-100 rounded-xl transition-all group">
            <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-xs font-bold truncate text-[#0f172a]">{value}</p>
            </div>
        </div>
    );
}

function BalanceCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: 'blue' | 'green' | 'amber' | 'red' }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                color === 'blue' ? "bg-blue-50 text-blue-600" :
                color === 'green' ? "bg-emerald-50 text-emerald-600" :
                color === 'amber' ? "bg-amber-50 text-amber-600" :
                "bg-rose-50 text-rose-600"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-lg font-black text-[#0f172a]">{value}</p>
            </div>
        </div>
    );
}

function HealthMetricRow({ label, score, max }: { label: string; score: number | undefined; max: number }) {
    const s = score ?? 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-wide">
                <span>{label}</span>
                <span>{s} / {max}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 relative overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(s / max) * 100}%` }} />
            </div>
        </div>
    );
}
