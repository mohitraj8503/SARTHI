'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  Send,
  X,
  Plus,
  Mail,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';

export interface Ticket {
  id: string;
  subject: string;
  user: { name: string; email: string };
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  createdAt: string;
  lastMessage: string;
}

interface SupportInboxProps {
  tickets?: Ticket[];
  loading?: boolean;
  onSelectTicket?: (ticket: Ticket) => void;
  onReply?: (ticketId: string, message: string) => void;
  onStatusChange?: (ticketId: string, status: Ticket['status']) => void;
}

export const demoTickets: Ticket[] = [
  { id: '1', subject: 'Payment Failed: Order #RP-9021', user: { name: 'Aryan Sharma', email: 'aryan@example.com' }, priority: 'high', status: 'open', category: 'Payments', createdAt: new Date().toISOString(), lastMessage: "I tried paying via UPI but the transaction stuck at processing." },
  { id: '2', subject: 'Course Access Issue', user: { name: 'Sneha Kapur', email: 'sneha@example.com' }, priority: 'medium', status: 'in_progress', category: 'LMS', createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), lastMessage: "Videos are not loading on my mobile app." },
  { id: '3', subject: 'Refund Request', user: { name: 'Rahul Varma', email: 'rahul@example.com' }, priority: 'low', status: 'resolved', category: 'Billing', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), lastMessage: "Thank you for the quick resolution." },
];

export function SupportInbox({ tickets = [], loading, onSelectTicket, onReply, onStatusChange }: SupportInboxProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const filteredTickets = tickets.length > 0 ? tickets.filter((ticket) => {
    if (filter !== 'all' && ticket.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(term) ||
        ticket.user.name.toLowerCase().includes(term)
      );
    }
    return true;
  }) : demoTickets;

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      high: { bg: 'bg-red-50', color: 'text-red-600', label: 'High' },
      medium: { bg: 'bg-amber-50', color: 'text-amber-600', label: 'Medium' },
      low: { bg: 'bg-blue-50', color: 'text-blue-600', label: 'Low' },
    };
    return styles[priority];
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const styles: Record<string, { bg: string; color: string; label: string; icon: any }> = {
      open: { bg: 'bg-red-500/10', color: 'text-red-600', label: 'Open', icon: AlertCircle },
      in_progress: { bg: 'bg-amber-500/10', color: 'text-amber-600', label: 'Processing', icon: Clock },
      resolved: { bg: 'bg-green-500/10', color: 'text-green-600', label: 'Fixed', icon: CheckCircle },
    };
    return styles[status] || styles['open'];
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-white border border-[#E2E8F4] rounded-[24px] overflow-hidden shadow-sm flex h-[700px]">
      {/* Sidebar List */}
      <div className={cn(
        "flex flex-col border-r border-[#F0F2F8] transition-all duration-500",
        selectedTicket ? "w-[380px]" : "w-full"
      )}>
        <div className="p-6 border-b border-[#F0F2F8]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-[#1C2B4A]">Support Inbox</h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-widest">{filteredTickets.length} Active</span>
          </div>
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8FAF] group-focus-within:text-[#1C2B4A] transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[13px] text-[#1C2B4A] focus:bg-white focus:border-[#1C2B4A] transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 mt-4">
            {['all', 'open', 'in_progress'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                  filter === t ? "bg-[#1C2B4A] text-white border-[#1C2B4A]" : "bg-white text-[#7A8FAF] border-[#F0F2F8] hover:border-[#7A8FAF]"
                )}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto admin-scrollbar">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#1C2B4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[12px] text-[#7A8FAF] font-bold uppercase tracking-widest">Hydrating Inbox...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-[#7A8FAF]">
              <CheckCircle className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-[13px] font-medium leading-relaxed italic">Inbox is clear.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={cn(
                  "w-full p-6 text-left border-b border-[#F0F2F8] transition-all",
                  selectedTicket?.id === ticket.id ? "bg-[#F8F9FC] border-l-4 border-l-[#1C2B4A]" : "hover:bg-[#F8F9FC]/50"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                    getPriorityBadge(ticket.priority).bg,
                    getPriorityBadge(ticket.priority).color,
                    "border-current/10"
                  )}>
                    {ticket.priority}
                  </span>
                  <span className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-wider">{formatTime(ticket.createdAt)}</span>
                </div>
                <h4 className="text-[14px] font-bold text-[#1C2B4A] line-clamp-1 mb-1">{ticket.subject}</h4>
                <p className="text-[12px] text-[#7A8FAF] line-clamp-2 leading-relaxed">{ticket.lastMessage}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <AnimatePresence mode="wait">
        {selectedTicket ? (
          <motion.div
            key={selectedTicket.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col bg-[#F8F9FC]"
          >
            {/* Detail Header */}
            <div className="p-6 bg-white border-b border-[#F0F2F8] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1C2B4A] text-white flex items-center justify-center font-bold text-[16px] border-2 border-white shadow-xl">
                  {selectedTicket.user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[#1C2B4A]">{selectedTicket.user.name}</h4>
                  <p className="text-[12px] text-[#7A8FAF] font-medium italic">{selectedTicket.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-[#E2E8F4] bg-white shadow-sm",
                  getStatusBadge(selectedTicket.status).color
                )}>
                  {(() => {
                    const Badge = getStatusBadge(selectedTicket.status).icon;
                    return <Badge size={14} />;
                  })()}
                  <span className="ml-1">{getStatusBadge(selectedTicket.status).label}</span>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-3 text-[#7A8FAF] hover:text-[#1C2B4A] transition-colors bg-white rounded-xl border border-[#E2E8F4]">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="flex-1 p-8 overflow-y-auto admin-scrollbar space-y-8">
              <div className="flex justify-center">
                <span className="px-4 py-1.5 bg-[#F0F2F8] rounded-full text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest border border-[#E2E8F4]">Ticket created on {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
              </div>

              {/* User Message */}
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className="p-6 bg-white rounded-[24px] rounded-tl-none border border-[#E2E8F4] shadow-sm">
                  <p className="text-[14px] text-[#1C2B4A] leading-relaxed font-medium">{selectedTicket.lastMessage}</p>
                </div>
                <span className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest ml-1">{formatTime(selectedTicket.createdAt)}</span>
              </div>

              {/* System Notice */}
              <div className="flex items-center gap-4 px-6 py-4 bg-white/50 border border-dashed border-[#E2E8F4] rounded-2xl">
                <AlertCircle size={14} className="text-amber-500" />
                <p className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-widest">Case category assigned to <span className="text-[#1C2B4A]">{selectedTicket.category}</span></p>
              </div>
            </div>

            {/* Reply Area */}
            <div className="p-6 bg-white border-t border-[#F0F2F8]">
              <div className="relative">
                <textarea
                  placeholder="Draft your response with professional clarity..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-6 pr-24 bg-[#F8F9FC] border border-[#E2E8F4] rounded-[24px] min-h-[120px] text-[14px] text-[#1C2B4A] outline-none focus:bg-white focus:border-[#1C2B4A] transition-all resize-none placeholder:text-[#A8B8D8] font-medium"
                />
                <button
                  onClick={() => {
                    if (!replyText.trim()) return;
                    onReply?.(selectedTicket.id, replyText);
                    setReplyText('');
                    if (addToast) addToast({ message: "Response deployed to user.", type: "success" });
                  }}
                  className="absolute bottom-4 right-4 p-4 bg-[#1C2B4A] text-[#E8B84B] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={24} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex gap-4">
                  <button className="text-[10px] font-bold text-[#7A8FAF] hover:text-[#1C2B4A] uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <Paperclip size={12} /> Attach Assets
                  </button>
                  <button className="text-[10px] font-bold text-[#7A8FAF] hover:text-[#1C2B4A] uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <Sparkles size={12} className="text-[#E8B84B]" /> Smart Template
                  </button>
                </div>
                <p className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest italic leading-none">Press CMD+Enter to Respond</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 lg:flex flex-col items-center justify-center p-12 text-center bg-[#F8F9FC] hidden">
            <div className="w-24 h-24 bg-white rounded-[40px] border border-[#E2E8F4] shadow-xl shadow-[#1C2B4A]/5 flex items-center justify-center text-[#A8B8D8] mb-8 relative">
              <Mail size={40} className="opacity-10" />
              <div className="absolute flex items-center justify-center">
                <Search size={24} className="text-[#1C2B4A] opacity-20" />
              </div>
            </div>
            <h4 className="text-[20px] font-bold text-[#1C2B4A] mb-2">Neutral Support State</h4>
            <p className="text-[14px] text-[#7A8FAF] max-w-sm italic font-medium leading-relaxed">Select a conversation from the sidebar to begin architectural resolution.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

