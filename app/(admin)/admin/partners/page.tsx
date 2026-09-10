'use client';

import React, { useEffect, useState } from 'react';
import { 
    Building2, 
    MapPin, 
    Users2, 
    CheckCircle2, 
    XCircle, 
    Eye, 
    Search,
    Loader2,
    Check,
    X,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function PartnersAdminPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/partner-requests');
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, status: string) => {
        setIsUpdating(id);
        try {
            const res = await fetch('/api/admin/partner-requests', {
                method: 'PATCH',
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                toast.success(`Request ${status} successfully`);
                fetchRequests();
                if (selectedRequest?.id === id) setSelectedRequest(null);
            } else {
                toast.error("Update failed");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#fbfbf9] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1A3C2E] font-outfit italic tracking-tight">
                        Partnership_Management
                    </h1>
                    <p className="text-[#1A3C2E]/50 text-sm font-medium mt-1">Review and manage institutional collaboration requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                        <input 
                            type="text" 
                            placeholder="Search requests..."
                            className="bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#10B981]/30 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-black/5 rounded-2xl hover:bg-black/5 transition-all shadow-sm">
                        <Filter className="w-4 h-4 text-[#1A3C2E]/60" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="lg:col-span-2 space-y-4">
                        {requests.map((req) => (
                            <motion.div 
                                layoutId={req.id}
                                key={req.id}
                                onClick={() => setSelectedRequest(req)}
                                className={cn(
                                    "bg-white p-6 rounded-[2rem] border transition-all cursor-pointer group hover:shadow-xl hover:shadow-black/5",
                                    selectedRequest?.id === req.id ? "border-[#10B981] ring-4 ring-[#10B981]/5" : "border-black/5"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Building2 className="w-6 h-6 text-[#1A3C2E]/40" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#1A3C2E] group-hover:text-[#10B981] transition-colors">{req.organization}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] font-black uppercase tracking-widest text-[#1A3C2E]/40">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {req.district}, {req.state}
                                                </span>
                                                <span className="w-1 h-1 bg-black/10 rounded-full" />
                                                <span>{req.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            req.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                            req.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                            "bg-red-100 text-red-700"
                                        )}>
                                            {req.status}
                                        </span>
                                        <span className="text-[10px] font-medium text-black/20">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Detail Panel */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {selectedRequest ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-2xl sticky top-8"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-[#1A3C2E] font-outfit italic">Request_Details</h2>
                                        <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-black/5 rounded-full">
                                            <X className="w-5 h-5 text-black/20" />
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30 block mb-4">Lead Information</label>
                                            <div className="space-y-4">
                                                <DetailRow label="Contact Person" value={selectedRequest.name} />
                                                <DetailRow label="Email" value={selectedRequest.email} />
                                                <DetailRow label="Phone" value={selectedRequest.phone} />
                                                <DetailRow label="Org Type" value={selectedRequest.type} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30 block mb-4">Impact Profile</label>
                                            <div className="space-y-4">
                                                <DetailRow label="Location" value={`${selectedRequest.district}, ${selectedRequest.state}`} />
                                                <DetailRow label="Area Type" value={selectedRequest.areaType} />
                                                <DetailRow label="Target Capacity" value={selectedRequest.students} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30 block mb-4">Infrastructure</label>
                                            <div className="flex flex-wrap gap-2">
                                                {JSON.parse(selectedRequest.infra).map((i: string) => (
                                                    <span key={i} className="px-3 py-1.5 bg-black/[0.03] border border-black/5 rounded-xl text-[11px] font-bold text-[#1A3C2E]/60">
                                                        {i}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30 block mb-4">Intent Statement</label>
                                            <p className="text-sm text-[#1A3C2E]/70 leading-relaxed bg-[#f8f8f6] p-5 rounded-2xl border border-black/5 font-medium italic">
                                                &quot;{selectedRequest.intent}&quot;
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {selectedRequest.status === 'pending' && (
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <button 
                                                    disabled={isUpdating === selectedRequest.id}
                                                    onClick={() => handleAction(selectedRequest.id, 'rejected')}
                                                    className="w-full py-4 rounded-full border border-red-100 text-red-500 font-bold text-xs hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                                <button 
                                                    disabled={isUpdating === selectedRequest.id}
                                                    onClick={() => handleAction(selectedRequest.id, 'approved')}
                                                    className="w-full py-4 rounded-full bg-[#10B981] text-white font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#10B981]/20 flex items-center justify-center gap-2"
                                                >
                                                    {isUpdating === selectedRequest.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Approve
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-[500px] border-2 border-dashed border-black/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-black/[0.02] rounded-full flex items-center justify-center mb-4">
                                        <Eye className="w-8 h-8 text-black/10" />
                                    </div>
                                    <h3 className="text-lg font-bold text-black/20">Select a request to view details</h3>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value }: any) {
    return (
        <div className="flex items-center justify-between border-b border-black/[0.03] pb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#1A3C2E]/30">{label}</span>
            <span className="text-sm font-bold text-[#1A3C2E]">{value}</span>
        </div>
    );
}
