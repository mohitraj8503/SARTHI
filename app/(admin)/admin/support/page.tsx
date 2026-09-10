'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Star,
  Send,
  User,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  SearchX,
  Eye,
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

export default function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState<'TICKETS' | 'KB' | 'FEEDBACK'>('TICKETS');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: supportData, isLoading } = useQuery({
    queryKey: ['admin-support', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/admin/support?status=${activeTab === 'TICKETS' ? 'all' : activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch support data');
      const json = await res.json();
      return json.data || [];
    }
  });

  const replyMutation = useMutation({
    mutationFn: async (vars: any) => {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: vars.ticketId,
          message: vars.message,
          isInternal: vars.isInternal
        })
      });
      if (!res.ok) throw new Error('Failed to send reply');
      return res.json();
    },
    onSuccess: () => {
      addToast({ message: 'Reply sent successfully', type: 'success' });
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    }
  });

  const tabs = [
    { id: 'TICKETS', label: 'Support Tickets', icon: MessageSquare },
    { id: 'KB', label: 'Knowledge Base', icon: FileText },
    { id: 'FEEDBACK', label: 'User Feedback', icon: Star },
  ];

  const tickets = activeTab === 'TICKETS' ? supportData || [] : [];

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
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 px-4 sm:px-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-1 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Communication Hub</span>
            </div>
            <h1 className="text-3xl sm:text-[40px] font-black text-[#0F172A] tracking-tighter uppercase leading-[0.9]">
              Support <span className="text-amber-500">Center</span>
            </h1>
            <p className="text-[14px] font-medium text-slate-400 max-w-[550px] leading-relaxed">
              Manage student inquiries, refine knowledge base assets, and analyze community feedback through a unified interface.
            </p>
          </div>
 
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm mt-2 overflow-x-auto w-full lg:w-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 lg:flex-none px-6 py-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap flex items-center justify-center gap-2",
                  activeTab === tab.id
                    ? "bg-[#0F172A] text-white shadow-lg shadow-black/10"
                    : "text-slate-400 hover:text-[#0F172A]"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-amber-500" : "text-slate-300")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'TICKETS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-320px)] lg:min-h-[650px] px-4 sm:px-0">
            {/* Ticket List Sidebar */}
            <div className={cn(
              "lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-[500px] lg:h-auto",
              selectedTicket ? "hidden lg:flex" : "flex"
            )}>
              <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-[#0F172A] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search incoming tickets..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-[13px] font-medium focus:border-amber-200 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                {isLoading ? (
                  <div className="p-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Syncing Inbox...</div>
                ) : tickets.length === 0 ? (
                  <div className="p-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Inbox Empty</div>
                ) : tickets.map((ticket: any) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "w-full p-8 text-left hover:bg-slate-50/50 transition-all relative border-l-[4px]",
                      selectedTicket?.id === ticket.id ? "bg-slate-50/50 border-l-amber-500" : "border-l-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-[0.15em]",
                        ticket.priority === 'URGENT' ? "bg-red-50 text-red-500" :
                          ticket.priority === 'HIGH' ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"
                      )}>
                        {ticket.priority || 'LOW'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-[15px] font-black text-[#0F172A] mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">{ticket.subject}</h4>
                    <p className="text-[12px] text-slate-400 font-bold">{ticket.user.name}</p>
                  </button>
                ))}
              </div>
            </div>
 
            {/* Ticket Conversation View */}
            <div className={cn(
              "lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden h-[600px] lg:h-auto",
              !selectedTicket ? "hidden lg:flex" : "flex"
            )}>
              {selectedTicket ? (
                <>
                  <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between bg-white relative z-10 gap-4">
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={() => setSelectedTicket(null)}
                        className="lg:hidden p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-all shrink-0"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center text-[18px] sm:text-[20px] font-black shadow-lg shadow-black/5 shrink-0">
                        {selectedTicket.user.name[0]}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-[20px] font-black text-[#0F172A] tracking-tight line-clamp-1">{selectedTicket.subject}</h3>
                        <p className="text-[10px] sm:text-[12px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{selectedTicket.user.name} • #{selectedTicket.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-100 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0F172A] hover:bg-slate-50 transition-all">Assign</button>
                      <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0F172A] text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-md shadow-black/5 active:scale-95">Resolve</button>
                    </div>
                  </div>
                  <div className="flex-1 p-6 sm:p-10 bg-slate-50/30 overflow-y-auto space-y-8 no-scrollbar">
                    <div className="flex justify-start">
                      <div className="bg-white p-6 sm:p-8 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm max-w-[85%] relative group">
                        <div className="absolute -left-2 top-0 w-2 h-2 bg-white" />
                        <p className="text-[14px] sm:text-[15px] text-[#0F172A] leading-relaxed font-medium">
                          {selectedTicket.description || selectedTicket.message || 'No message content available.'}
                        </p>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-6 block">
                          {selectedTicket.user?.name || 'User'} • {new Date(selectedTicket.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {selectedTicket.messages?.filter((m: any) => !m.isInternal).map((msg: any) => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-sm max-w-[85%] relative ${
                          msg.isAdmin 
                            ? 'bg-[#0F172A] text-white rounded-tr-none border-[#0F172A]' 
                            : 'bg-white rounded-tl-none border-slate-100 text-[#0F172A]'
                        }`}>
                          <p className={`text-[14px] sm:text-[15px] leading-relaxed font-medium ${msg.isAdmin ? 'text-white' : 'text-[#0F172A]'}`}>
                            {msg.content || msg.message}
                          </p>
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-6 block ${msg.isAdmin ? 'text-amber-500/60' : 'text-slate-300'}`}>
                            {msg.author?.name || (msg.isAdmin ? 'Support' : selectedTicket.user?.name)} • {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 sm:p-8 border-t border-slate-50 bg-white">
                    <div className="flex gap-4">
                      <div className="flex-1 relative group">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Compose your reply for the ecosystem..."
                          className="w-full px-6 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-medium text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all resize-none h-[120px]"
                        />
                      </div>
                      <button 
                        onClick={() => replyMutation.mutate({ ticketId: selectedTicket.id, message: replyMessage })}
                        disabled={replyMutation.isPending || !replyMessage.trim()}
                        className="self-end p-5 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        <Send className="w-6 h-6 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                    <MessageSquare className="w-12 h-12" />
                  </div>
                  <h3 className="text-[24px] font-black text-[#0F172A] tracking-tight uppercase">Select a Transmission</h3>
                  <p className="text-[14px] text-slate-400 mt-3 max-w-sm font-medium">Choose a support request from the ledger to view the conversation and assist the community.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'KB' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-black text-[#0F172A] uppercase tracking-tight">Knowledge Assets</h2>
              <button 
                onClick={() => addToast({ message: 'Article creation feature under development', type: 'info' })}
                className="px-8 py-4 bg-[#0F172A] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center gap-3 shadow-lg shadow-black/5 active:scale-95"
              >
                <Plus className="w-5 h-5" /> New Asset
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'How to Enroll in a Course', category: 'Getting Started', views: 245 },
                { title: 'Payment & Billing FAQ', category: 'Payments', views: 189 },
                { title: 'How to Access Certificates', category: 'Certificates', views: 156 },
                { title: 'Technical Requirements', category: 'Getting Started', views: 134 },
                { title: 'Refund Policy Explained', category: 'Payments', views: 98 },
                { title: 'Contact Support Guide', category: 'Support', views: 87 },
              ].map((article, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-black/5 hover:-translate-y-[6px] transition-all duration-500 cursor-pointer group">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{article.category}</span>
                  <h4 className="text-[18px] font-black text-[#0F172A] mt-4 mb-6 group-hover:text-amber-600 transition-colors leading-tight italic">{article.title}</h4>
                  <div className="flex items-center gap-2 text-[12px] font-bold text-slate-300">
                    <Eye className="w-4 h-4" />
                    <span>{article.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'FEEDBACK' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-in">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
                <div className="flex items-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("w-4 h-4", s <= 4 ? "text-amber-500 fill-amber-500" : "text-slate-100")} />)}
                </div>
                <p className="text-[16px] italic text-[#0F172A] leading-relaxed font-medium mb-10">&quot;The platform interface is incredibly smooth. I love the new dark mode and the course content is excellent.&quot;</p>
                <div className="flex items-center gap-4 pt-8 border-t border-slate-50 mt-auto">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black">AK</div>
                  <div>
                    <p className="text-[15px] font-black text-[#0F172A]">Ankit Kumar</p>
                    <p className="text-[11px] text-slate-300 font-black uppercase tracking-widest">Student Practitioner</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

