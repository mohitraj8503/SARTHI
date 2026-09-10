'use client';

import { useState, useEffect } from 'react';
import {
  Trophy, Search, Filter, Users, Download, Sparkles, RefreshCw,
  GraduationCap, ExternalLink, Mail, Phone, Calendar, CheckCircle2,
  FileSpreadsheet, X, Eye, Trash2, Check, Clock, AlertCircle, ArrowUpRight, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Registration {
  id: string;
  challengeId: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  portfolioUrl?: string;
  motivation?: string;
  status: string; // REGISTERED, APPROVED, SHORTLISTED, WINNER, REJECTED
  createdAt: string;
}

const CHALLENGE_MAP: Record<string, { name: string; category: string; badgeColor: string }> = {
  'ai-ideathon': {
    name: 'AI & Machine Learning Ideathon',
    category: 'Ideathons',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  'kids-coding-olympiad': {
    name: 'Kids National Coding Olympiad (Till 9-10 Class)',
    category: 'Olympiads',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  'coding-olympiad': {
    name: 'National Coding Olympiad',
    category: 'Olympiads',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
};

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  REGISTERED: { label: 'Registered', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  APPROVED: { label: 'Approved', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SHORTLISTED: { label: 'Shortlisted', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  WINNER: { label: '🏆 Winner', style: 'bg-purple-50 text-purple-700 border-purple-200' },
  REJECTED: { label: 'Rejected', style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function AdminChallengesPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState({ totalRegistrations: 0, aiIdeathonCount: 0, uniqueColleges: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Registration | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/challenges?challengeId=${selectedChallenge}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations || []);
        setStats(data.stats || { totalRegistrations: 0, aiIdeathonCount: 0, uniqueColleges: 0 });
      }
    } catch (err) {
      console.error('Failed to load challenge registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedChallenge]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedApplicant?.id === id) {
          setSelectedApplicant(prev => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/challenges?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
        if (selectedApplicant?.id === id) setSelectedApplicant(null);
      }
    } catch (err) {
      console.error('Failed to delete registration:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'College Name', 'Challenge', 'Status', 'Portfolio URL', 'Motivation', 'Registration Date'];
    const rows = registrations.map(r => [
      r.id,
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      `"${r.collegeName.replace(/"/g, '""')}"`,
      `"${CHALLENGE_MAP[r.challengeId]?.name || r.challengeId}"`,
      `"${r.status}"`,
      `"${(r.portfolioUrl || '').replace(/"/g, '""')}"`,
      `"${(r.motivation || '').replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString('en-IN')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `challenge_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1B4332]/10 text-[#1B4332] rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Trophy size={14} /> Admin Challenge Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Challenge Registrations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time control center for SARTHI AI Ideathon signups & candidate applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRegistrations}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
          <button
            onClick={exportToCSV}
            disabled={registrations.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2D6A4F] transition-all shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrations</span>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{stats.totalRegistrations}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> Active student registrations
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Ideathon Applicants</span>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{stats.aiIdeathonCount}</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">Flagship AI Innovation Challenge</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Universities Represented</span>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{stats.uniqueColleges}</div>
          <div className="text-xs text-amber-600 font-semibold mt-1">Colleges & Engineering Institutions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, college, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#1B4332] transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            className="w-full md:w-64 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#1B4332]"
          >
            <option value="all">All Challenges</option>
            <option value="ai-ideathon">AI & Machine Learning Ideathon</option>
            <option value="kids-coding-olympiad">Kids National Coding Olympiad</option>
            <option value="coding-olympiad">National Coding Olympiad</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Student Applicant</th>
                <th className="py-4 px-6">College / University</th>
                <th className="py-4 px-6">Challenge Name</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Loading registrations...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No challenge registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const challengeInfo = CHALLENGE_MAP[reg.challengeId] || {
                    name: reg.challengeId,
                    category: 'Event',
                    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
                  };
                  const statusInfo = STATUS_BADGES[reg.status] || STATUS_BADGES.REGISTERED;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 text-sm">{reg.fullName}</div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1">
                          <span className="flex items-center gap-1"><Mail size={11} /> {reg.email}</span>
                          <span className="flex items-center gap-1"><Phone size={11} /> {reg.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-700">
                        {reg.collegeName}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${challengeInfo.badgeColor}`}>
                          {challengeInfo.name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApplicant(reg)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Full Profile"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(reg.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Profile Drawer / Modal */}
      <AnimatePresence>
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Candidate Profile</span>
                  <h3 className="text-xl font-black mt-0.5">{selectedApplicant.fullName}</h3>
                </div>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Email Address</label>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedApplicant.email}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Phone Number</label>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedApplicant.phone}</div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">College / Institution</label>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedApplicant.collegeName}</div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Applied Challenge</label>
                  <div className="font-extrabold text-[#1B4332] text-sm mt-0.5">
                    {CHALLENGE_MAP[selectedApplicant.challengeId]?.name || selectedApplicant.challengeId}
                  </div>
                </div>

                {selectedApplicant.portfolioUrl && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Portfolio / GitHub Link</label>
                    <div>
                      <a
                        href={selectedApplicant.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold mt-0.5"
                      >
                        {selectedApplicant.portfolioUrl} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}

                {selectedApplicant.motivation && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Motivation / Vision</label>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 mt-1 leading-relaxed">
                      {selectedApplicant.motivation}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Update Candidate Status</label>
                  <div className="flex flex-wrap gap-2">
                    {['APPROVED', 'SHORTLISTED', 'WINNER', 'REJECTED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedApplicant.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                          selectedApplicant.status === st
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold uppercase text-xs hover:bg-slate-300 transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
