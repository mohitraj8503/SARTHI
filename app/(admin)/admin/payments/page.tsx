'use client';

import { useState, useMemo } from 'react';
import {
    Search,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    Calendar,
    ChevronDown,
    IndianRupee,
    CreditCard,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Payment {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
    };
    course: {
        title: string;
    };
}

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('This Month');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const limit = 10;

    // Calculate date range for API
    const getDateRange = () => {
        const now = new Date();
        const ranges: Record<string, { start: Date; end: Date }> = {
            'Today': { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() },
            'Yesterday': { start: new Date(now.setDate(now.getDate() - 1)), end: new Date(now.setHours(23, 59, 59, 999)) },
            'This Week': { start: new Date(now.setDate(now.getDate() - 7)), end: new Date() },
            'This Month': { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date() },
            'Last Month': { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0) },
            'This Year': { start: new Date(now.getFullYear(), 0, 1), end: new Date() },
        };
        return ranges[dateRange] || ranges['This Month'];
    };

    const { start: startDate, end: endDate } = getDateRange();

    const { data: paymentsData, isLoading } = useQuery({
        queryKey: ['admin-payments', statusFilter, page, sortBy, sortOrder, searchTerm, dateRange],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('status', statusFilter);
            params.set('page', page.toString());
            params.set('limit', limit.toString());
            params.set('sortBy', sortBy);
            params.set('sortOrder', sortOrder);
            if (searchTerm) params.set('search', searchTerm);
            params.set('startDate', startDate.toISOString());
            params.set('endDate', endDate.toISOString());
            
            const res = await fetch(`/api/admin/payments?${params.toString()}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch payments');
            return res.json();
        }
    });

    const payments: Payment[] = paymentsData?.data?.payments || [];
    const pagination = paymentsData?.meta || { page: 1, limit: 10, total: 0, totalPages: 0 };
    const stats = paymentsData?.data?.stats || { totalRevenue: 0, pendingAmount: 0, totalTransactions: 0 };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
        setPage(1);
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
        return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    const dateRanges = ['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'This Year'];
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'succeeded', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
    ];

    // Use stats from API instead of calculating locally
    const statsCards = [
        { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'gold' },
        { label: 'Pending Amount', value: `₹${(stats.pendingAmount || 0).toLocaleString()}`, icon: Clock, color: 'amber' },
        { label: 'Completed Transactions', value: (stats.totalTransactions || 0).toString(), icon: CheckCircle2, color: 'green' },
    ];

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'succeeded':
            case 'completed':
                return "bg-[#E8F5EE] text-[#1A7A4A] border-[#E8F5EE]";
            case 'pending':
            case 'pending_verification':
                return "bg-[#FDF6E3] text-[#B8860B] border-[#FDF6E3]";
            case 'failed':
                return "bg-[#FDECEA] text-[#C0392B] border-[#FDECEA]";
            case 'refunded':
                return "bg-[#F0F2F8] text-[#7A8299] border-[#F0F2F8]";
            default:
                return "bg-[#F0F2F8] text-[#7A8299] border-[#F0F2F8]";
        }
    };

    return (
        <div className="relative flex-1 w-full animate-fade-in overflow-hidden">
            {/* Background Atmosphere - Premium Decoration */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                {/* Top Right Header Bubble */}
                <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[80px] animate-pulse" />
                
                {/* Floating Blob Right */}
                <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[60px] animate-float" style={{ animationDuration: '8s' }} />
                
                {/* Bottom Left Bubble */}
                <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[70px] animate-float-delayed" style={{ animationDuration: '10s' }} />
            </div>

            <div className="space-y-10 pb-20 pt-2">
                {/* Page Heading */}
                <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
                    <div className="space-y-1.5 text-left relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
                            <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">FINANCIAL LEDGER</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
                            PAYMENTS <span className="text-[#F97316]">CENTER</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
                            Monitor transaction flow, manage refunds, and track global revenue.
                        </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-1 flex-shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Yield</span>
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">₹{(stats.totalRevenue || 0).toLocaleString()}</span>
                    </div>
                </header>
 
                {/* Top Action Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 sm:px-0">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 w-full">
                        {/* Search */}
                        <div className="relative group w-full lg:max-w-md">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search transactions by ID, name, or email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-4 py-4 text-[14px] font-medium text-[#0F172A] placeholder-slate-400 focus:border-amber-200 focus:outline-none transition-all shadow-sm"
                            />
                        </div>
 
                        {/* Filters */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-auto appearance-none bg-white border border-slate-100 rounded-xl pl-5 pr-10 py-3 text-[12px] font-bold text-[#0F172A] uppercase tracking-wider cursor-pointer focus:outline-none focus:border-amber-200 transition-all shadow-sm"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
 
                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={dateRange}
                                    onChange={(e) => {
                                        setDateRange(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-auto appearance-none bg-white border border-slate-100 rounded-xl pl-5 pr-10 py-3 text-[12px] font-bold text-[#0F172A] uppercase tracking-wider cursor-pointer focus:outline-none focus:border-amber-200 transition-all shadow-sm"
                                >
                                    {dateRanges.map((range) => (
                                        <option key={range} value={range}>
                                            {range}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
 
                    <button 
                    onClick={() => {
                        const headers = 'ID,Amount,Status,User,Course,Date\n';
                        const rows = payments.map(p => 
                        `"${p.id}","${p.amount}","${p.status}","${p.user?.name || p.user?.email}","${p.course?.title || 'Unknown'}","${new Date(p.createdAt).toLocaleDateString()}"`
                        ).join('\n') || '';
                        const csv = headers + rows;
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `payments-report-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#0F172A] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-[#0F172A]/10 active:scale-95"
                    >
                        <Download className="w-5 h-5" /> Export Ledger
                </button>
                </div>
 
                {/* Summary Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                    {statsCards.map((stat, i) => (
                        <div key={i} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <h2 className="text-2xl sm:text-[32px] font-black text-[#0F172A] tracking-tighter leading-none">{stat.value}</h2>
                            </div>
                            <div className={cn(
                                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                                stat.color === 'gold' ? "bg-amber-50 text-amber-500" :
                                    stat.color === 'amber' ? "bg-orange-50 text-orange-500" :
                                        "bg-emerald-50 text-emerald-500"
                            )}>
                                <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
                            </div>
                        </div>
                    ))}
                </div>
 
                {/* Transactions Table Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden mx-4 sm:mx-0">
                    <div className="overflow-x-auto admin-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th 
                                        className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-amber-500 transition-colors"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center gap-1">Transaction ID {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Course</th>
                                    <th 
                                        className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-amber-500 transition-colors"
                                        onClick={() => handleSort('amount')}
                                    >
                                        <div className="flex items-center gap-1">Amount {getSortIcon('amount')}</div>
                                    </th>
                                    <th 
                                        className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-amber-500 transition-colors"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <div className="flex items-center gap-1">Date {getSortIcon('createdAt')}</div>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-8 py-8 h-20 bg-white" />
                                        </tr>
                                    ))
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <CreditCard className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-bold text-[#0F172A]">No transactions found</h3>
                                                <p className="text-[14px] text-slate-400 max-w-sm">No payment data matches your current filter criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                                            <td className="px-8 py-6">
                                                <span className="text-[13px] font-mono font-black text-slate-300 group-hover:text-amber-600 transition-colors">
                                                    #{payment.id.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-black text-[#0F172A]">{payment.user.name || 'Anonymous Student'}</span>
                                                    <span className="text-[11px] font-bold text-slate-400">{payment.user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[14px] font-bold text-[#0F172A] line-clamp-1 max-w-[200px]">{payment.course.title}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[16px] font-black text-[#0F172A]">₹{payment.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-[#0F172A]">{new Date(payment.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-[11px] font-bold text-slate-400">{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    getStatusStyles(payment.status)
                                                )}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {payment.status === 'COMPLETED' || payment.status === 'succeeded' ? 'Completed' : 
                                                     payment.status === 'PENDING' || payment.status === 'pending_verification' ? 'Pending' : 
                                                     payment.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all active:scale-90">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
 
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 border-t border-slate-100 bg-slate-50/30">
                            <div className="text-[12px] font-bold text-slate-400">
                                Showing <span className="text-[#0F172A]">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-[#0F172A]">{pagination.total}</span>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-4 py-2 text-[12px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 rounded-xl hover:bg-amber-50 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Prev
                                </button>
                                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.totalPages <= 5) pageNum = i + 1;
                                        else if (pagination.page <= 3) pageNum = i + 1;
                                        else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                        else pageNum = pagination.page - 2 + i;
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={cn(
                                                    "w-10 h-10 text-[12px] font-black rounded-xl transition-all",
                                                    pagination.page === pageNum
                                                        ? "bg-[#0F172A] text-white shadow-lg shadow-[#0F172A]/10"
                                                        : "text-slate-400 bg-white hover:bg-slate-50 border border-slate-100"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="flex items-center gap-1 px-4 py-2 text-[12px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 rounded-xl hover:bg-amber-50 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
