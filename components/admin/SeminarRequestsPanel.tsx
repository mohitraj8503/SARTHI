'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Clock, Eye,
    MoreVertical, ArrowRight, User, Calendar,
    MessageSquare, Tag, Loader2, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface SeminarRequest {
    id: string;
    title: string;
    topic: string;
    description: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SCHEDULED';
    proposedAt: string;
    proposedDuration: string;
    targetAudience: string;
    teacher: { name: string; image?: string; email: string };
    createdAt: string;
    speakerName?: string;
}

export function SeminarRequestsPanel() {
    const [requests, setRequests] = useState<SeminarRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<SeminarRequest | null>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/seminars?action=list-requests');
            const json = await res.json();
            setRequests(json.data || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        const remarks = prompt("Reason for rejection:");
        if (remarks === null) return;

        try {
            const res = await fetch('/api/admin/seminars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject-request', requestId: id, adminRemarks: remarks })
            });
            if (!res.ok) throw new Error("Failed to reject");
            addToast({ message: "Request rejected", type: "success" });
            fetchRequests();
        } catch (err: any) {
            addToast({ message: err.message, type: "error" });
        }
    };

    const handleApprove = (req: SeminarRequest) => {
        setSelectedRequest(req);
        setIsApproveModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#1C2B4A] mx-auto mb-4" />
                    <p className="text-[#7A8FAF] font-medium">Fetching teacher proposals...</p>
                </div>
            ) : requests.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-[#E2E8F4] rounded-[24px] p-6 hover:border-[#1C2B4A] hover:shadow-xl hover:shadow-[#1C2B4A]/5 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            req.status === 'PENDING' ? "bg-yellow-50 text-yellow-600" :
                                                req.status === 'APPROVED' ? "bg-green-50 text-green-600" :
                                                    req.status === 'REJECTED' ? "bg-red-50 text-red-600" :
                                                        "bg-blue-50 text-blue-600"
                                        )}>
                                            {req.status}
                                        </span>
                                        <span className="text-[11px] font-bold text-[#A8B8D8] uppercase tracking-wider">{req.topic}</span>
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#1C2B4A] mb-2">{req.title}</h3>
                                    <p className="text-[13px] text-[#7A8FAF] line-clamp-2 mb-6">{req.description}</p>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#A8B8D8]" />
                                            <div>
                                                <p className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest">Teacher</p>
                                                <p className="text-[12px] font-bold text-[#1C2B4A]">{req.teacher.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#A8B8D8]" />
                                            <div>
                                                <p className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest">Proposed</p>
                                                <p className="text-[12px] font-bold text-[#1C2B4A]">{new Date(req.proposedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[#A8B8D8]" />
                                            <div>
                                                <p className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest">Duration</p>
                                                <p className="text-[12px] font-bold text-[#1C2B4A]">{req.proposedDuration}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-[#A8B8D8]" />
                                            <div>
                                                <p className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest">Audience</p>
                                                <p className="text-[12px] font-bold text-[#1C2B4A]">{req.targetAudience}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row lg:flex-col justify-center gap-3">
                                    {req.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(req)}
                                                className="px-6 py-2.5 bg-[#1C2B4A] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#2C3E5F] transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                className="px-6 py-2.5 bg-white text-red-500 border border-red-100 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button className="p-3 bg-white border border-[#E2E8F4] rounded-xl text-[#7A8FAF] hover:text-[#1C2B4A] hover:border-[#1C2B4A] transition-all">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-[32px] border border-dashed border-[#E2E8F4]">
                    <MessageSquare className="w-12 h-12 text-[#A8B8D8] mx-auto mb-4 opacity-40" />
                    <h3 className="text-[18px] font-bold text-[#1C2B4A]">No Pending Requests</h3>
                    <p className="text-[14px] text-[#7A8FAF] mt-2 font-medium">Teachers haven&apos;t submitted any seminar proposals recently.</p>
                </div>
            )}

            {/* Approval Modal */}
            <AnimatePresence>
                {isApproveModalOpen && selectedRequest && (
                    <ApprovalModal
                        request={selectedRequest}
                        onClose={() => setIsApproveModalOpen(false)}
                        onSuccess={() => { fetchRequests(); setIsApproveModalOpen(false); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ApprovalModal({ request, onClose, onSuccess }: { request: SeminarRequest, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const [form, setForm] = useState({
        title: request.title,
        description: request.description,
        scheduledAt: request.proposedAt.split('.')[0], // format for datetime-local
        speakerName: request.speakerName || request.teacher.name,
        teacherId: (request as any).teacherId,
        tags: '',
        category: request.topic,
        level: 'BEGINNER' as const,
        price: 0,
        maxAttendees: 100,
        duration: parseInt(request.proposedDuration) || 60,
    });

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/seminars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve-request',
                    requestId: request.id,
                    data: {
                        ...form,
                        date: new Date(form.scheduledAt),
                        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
                    }
                })
            });

            if (!res.ok) throw new Error("Approval failed");

            addToast({ message: "Seminar approved and scheduled!", type: "success" });
            onSuccess();
        } catch (err: any) {
            addToast({ message: err.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1C2B4A]/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl"
            >
                <div className="p-8 border-b border-[#F0F2F8] flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1C2B4A]">Approve & Schedule</h2>
                        <p className="text-[13px] text-[#7A8FAF] font-medium mt-1 uppercase tracking-widest">Finalizing Seminar Details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-[#7A8FAF] hover:text-red-500 rounded-xl transition-all">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleConfirm} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-[#A8B8D8] uppercase tracking-widest ml-1">Event Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-5 py-3.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] font-bold text-[#1C2B4A] focus:border-[#1C2B4A] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#A8B8D8] uppercase tracking-widest ml-1">Assigned Speaker</label>
                            <input
                                type="text"
                                value={form.speakerName}
                                onChange={e => setForm({ ...form, speakerName: e.target.value })}
                                className="w-full px-5 py-3.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] font-bold text-[#1C2B4A] focus:border-[#1C2B4A] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#A8B8D8] uppercase tracking-widest ml-1">Official Start Time</label>
                            <input
                                type="datetime-local"
                                value={form.scheduledAt}
                                onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                                className="w-full px-5 py-3.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] font-bold text-[#1C2B4A] focus:border-[#1C2B4A] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-[#A8B8D8] uppercase tracking-widest ml-1">Public Description</label>
                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full px-5 py-3.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[13px] font-medium text-[#1C2B4A] focus:border-[#1C2B4A] outline-none transition-all resize-none leading-relaxed"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-[#A8B8D8] uppercase tracking-widest ml-1 text-blue-500">YouTube Configuration</label>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <p className="text-[12px] text-blue-700 font-medium">
                                    Final approval will automatically create a private broadcast on the Official SARTHI YouTube Channel.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-[#7A8FAF] font-bold uppercase tracking-widest text-[11px] hover:text-[#1C2B4A] transition-all">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-[#1C2B4A] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#2C3E5F] shadow-xl shadow-[#1C2B4A]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                            Process Approval & Go Official
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

