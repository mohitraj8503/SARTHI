'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, MoreHorizontal, Users, Mail, Send, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface StudentData {
  id: string;
  student: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  course: {
    id: string;
    title: string;
  };
  progress: number;
  status: 'active' | 'completed' | 'struggling';
  lastActive: string;
  joinedAt: string;
}

interface StudentsDirectoryProps {
  initialStudents: StudentData[];
}

export default function StudentsDirectory({ initialStudents }: StudentsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Ecosystem');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const filters = ['All Ecosystem', 'Active', 'Completed', 'Struggling'];

  const filteredStudents = useMemo(() => {
    return initialStudents.filter(s => {
      const matchesSearch = (s.student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All Ecosystem' || s.status.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [initialStudents, searchQuery, activeTab]);

  const allFilteredEmails = useMemo(() => filteredStudents.map(s => s.student.email), [filteredStudents]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(allFilteredEmails);
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectOne = (email: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails(prev => [...prev, email]);
    } else {
      setSelectedEmails(prev => prev.filter(e => e !== email));
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a subject and a message.');
      return;
    }

    setSending(true);
    const loadingToast = toast.loading('Sending emails...');
    try {
      const response = await fetch('/api/teacher/students/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: selectedEmails,
          subject: subject.trim(),
          message: message.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Successfully sent emails to ${selectedEmails.length} students!`, { id: loadingToast });
        setSubject('');
        setMessage('');
        setSelectedEmails([]);
        setIsModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to send emails.', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.', { id: loadingToast });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4 px-4">
          <Search className="w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search by name, email, or professional ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 w-full"
          />
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {selectedEmails.length > 0 && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
            >
              <Mail className="w-4 h-4" />
              Email ({selectedEmails.length})
            </button>
          )}

          <div className="relative group">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-6 py-2.5 pr-10 text-[11px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              {filters.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-8 py-6 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={filteredStudents.length > 0 && selectedEmails.length === filteredStudents.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                />
              </th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="group hover:bg-[#F8FAFC] transition-colors">
                <td className="px-8 py-6 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedEmails.includes(s.student.email)}
                    onChange={(e) => handleSelectOne(s.student.email, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                  />
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm",
                      "bg-emerald-500"
                    )}>
                      {s.student.name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{s.student.name || 'Anonymous'}</p>
                      <div className="mt-1 flex items-center gap-2">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                           {s.student.id.slice(-8).toUpperCase()}
                         </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-xs font-bold text-slate-500 tracking-tight">{s.student.email}</span>
                </td>
                <td className="px-6 py-6">
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-900 tracking-tight">
                       {new Date(s.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                     </p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registration Date</p>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    s.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                    s.status === 'completed' ? "bg-blue-50 text-blue-600" : 
                    "bg-amber-50 text-amber-600"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", 
                      s.status === 'active' ? "bg-emerald-500" : 
                      s.status === 'completed' ? "bg-blue-500" : 
                      "bg-amber-500"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{s.status}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                     <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                       <Eye className="w-4.5 h-4.5" />
                     </button>
                     <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                       <MoreHorizontal className="w-5 h-5" />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="py-20 text-center">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No students found</h3>
            <p className="text-sm text-slate-500 font-medium mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Glassmorphic Email Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-scale-up">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-3.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]">ANNOUNCEMENT DISPATCH</span>
                </div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">EMAIL BROADCAST</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
              {/* Recipients Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex items-start gap-3">
                <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Recipients</h4>
                  <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">
                    This message will be dispatched to <span className="text-emerald-600 font-black">{selectedEmails.length} selected students</span> via the transactional queue.
                  </p>
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter email subject header..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Message Body</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Type your markdown or plain text communication here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full flex-1 min-h-[200px] bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl p-5 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  disabled={sending}
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={sending}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
