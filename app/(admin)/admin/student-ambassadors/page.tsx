'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, FileText, CheckCircle, XCircle, Clock, ExternalLink, ArrowLeft, Search, GraduationCap, Link2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  collegeName: string;
  degreeProgram: string;
  gradMonth: string;
  gradYear: string;
  essayWelcome: string;
  linkedinUrl: string;
  githubUrl: string;
  blogUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  skills: string[];
  resumeName: string | null;
  resumeBase64: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function AdminAmbassadorsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student-ambassadors/applications');
      if (res.ok) {
        const result = await res.json();
        setApplications(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching ambassador applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoadingId(id);
      const res = await fetch('/api/student-ambassadors/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        const result = await res.json();
        // Update local state
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filters & Search
  const filteredApps = applications.filter((app) => {
    const matchesFilter = filter === 'ALL' || app.status === filter;
    const nameStr = `${app.firstName} ${app.lastName} ${app.collegeName} ${app.email}`.toLowerCase();
    const matchesSearch = nameStr.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-3 sm:p-6 md:p-10 bg-[#F8FAFC] min-h-screen text-slate-800">
      {/* Header Section */}
      <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">CAMPUS PARTNERS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
            STUDENT <span className="text-[#F97316]">AMBASSADORS</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
            Review and manage SARTHI Student Ambassador program candidates.
          </p>
        </div>
        
        {/* Statistics cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
          <div className="bg-white border border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total</span>
            <span className="text-base sm:text-lg font-bold text-slate-800">{applications.length}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center">
            <span className="block text-[10px] sm:text-xs font-bold text-amber-500 uppercase">Pending</span>
            <span className="text-base sm:text-lg font-bold text-amber-600">
              {applications.filter((a) => a.status === 'PENDING').length}
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center">
            <span className="block text-[10px] sm:text-xs font-bold text-emerald-500 uppercase">Approved</span>
            <span className="text-base sm:text-lg font-bold text-emerald-600">
              {applications.filter((a) => a.status === 'APPROVED').length}
            </span>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                filter === t
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, college, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 text-[#1A3C2E] animate-spin mb-3" />
          <span className="text-sm font-semibold text-slate-500">Loading Applications...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium">No ambassador applications found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (< 1024px) */}
          <div className="lg:hidden space-y-3">
            {filteredApps.map((app) => (
              <div 
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 cursor-pointer hover:border-amber-400 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{app.firstName} {app.lastName}</h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{app.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                    app.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : app.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {app.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                    {app.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                    {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div><span className="font-bold text-slate-400">College:</span> {app.collegeName}</div>
                  <div><span className="font-bold text-slate-400">Degree:</span> {app.degreeProgram}</div>
                  <div><span className="font-bold text-slate-400">Applied:</span> {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                  {app.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                        disabled={actionLoadingId === app.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        disabled={actionLoadingId === app.id}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    Details <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 1024px) */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Applicant</th>
                  <th className="p-4">College / University</th>
                  <th className="p-4">Degree</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredApps.map((app) => (
                  <tr 
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-slate-50/75 cursor-pointer transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-900">{app.firstName} {app.lastName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{app.email}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-650 max-w-[200px] truncate">{app.collegeName}</td>
                    <td className="p-4 text-slate-500">{app.degreeProgram}</td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {app.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                        {app.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-end items-center">
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                              disabled={actionLoadingId === app.id}
                              className="px-3 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                              disabled={actionLoadingId === app.id}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}

      {/* Side Drawer Modal for Details */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-full max-w-2xl h-screen shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Application Details</h3>
                    <p className="text-slate-400 text-xs mt-0.5">ID: {selectedApp.id}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedApp.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : selectedApp.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {selectedApp.status}
                </span>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 space-y-8 flex-grow overflow-y-auto text-left">
                {/* Profile Card Summary */}
                <div className="flex items-start gap-4 p-5 bg-[#FCFBF8] border border-slate-200 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-[#1A3C2E]/10 flex items-center justify-center text-[#1A3C2E] font-extrabold text-lg flex-shrink-0">
                    {selectedApp.firstName[0]}{selectedApp.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{selectedApp.firstName} {selectedApp.lastName}</h4>
                    <p className="text-slate-500 text-xs mt-1">{selectedApp.email} • {selectedApp.phone}</p>
                    <p className="text-slate-400 text-xs mt-1">DOB: {selectedApp.dob} • Gender: {selectedApp.gender}</p>
                  </div>
                </div>

                {/* Academic info */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <GraduationCap className="w-4 h-4 text-[#16A34A]" /> Academic Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-slate-400 font-semibold mb-1">College/University</span>
                      <span className="text-slate-800 font-bold">{selectedApp.collegeName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold mb-1">Degree Program</span>
                      <span className="text-slate-800 font-bold">{selectedApp.degreeProgram}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold mb-1">Graduation Expected</span>
                      <span className="text-slate-800 font-bold">{selectedApp.gradMonth} {selectedApp.gradYear}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold mb-1">Location</span>
                      <span className="text-slate-800 font-bold">{selectedApp.city}, {selectedApp.state}, {selectedApp.country}</span>
                    </div>
                  </div>
                </div>

                {/* Essay statement of purpose */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <FileText className="w-4 h-4 text-[#16A34A]" /> Statement of Purpose
                  </h4>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200 whitespace-pre-wrap">
                    {selectedApp.essayWelcome}
                  </p>
                </div>

                {/* Social links */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Link2 className="w-4 h-4 text-[#16A34A]" /> Profiles & Networks
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedApp.linkedinUrl && (
                      <a 
                        href={selectedApp.linkedinUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-[#16A34A] hover:underline flex items-center gap-1.5"
                      >
                        LinkedIn Profile <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedApp.githubUrl && (
                      <a 
                        href={selectedApp.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-[#16A34A] hover:underline flex items-center gap-1.5"
                      >
                        GitHub Profile <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedApp.blogUrl && (
                      <a 
                        href={selectedApp.blogUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-[#16A34A] hover:underline flex items-center gap-1.5"
                      >
                        Technical Blog <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedApp.portfolioUrl && (
                      <a 
                        href={selectedApp.portfolioUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-[#16A34A] hover:underline flex items-center gap-1.5"
                      >
                        Portfolio Website <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Technology Interests */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                    Technology Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.skills.map((s) => (
                      <span 
                        key={s} 
                        className="px-3 py-1 bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/15 text-[10px] font-bold rounded-lg uppercase tracking-wider"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resume download */}
                {selectedApp.resumeName && selectedApp.resumeBase64 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                      Resume Attachments
                    </h4>
                    <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#1A3C2E]/10 border border-[#1A3C2E]/20 rounded-lg flex items-center justify-center text-[#1A3C2E] font-extrabold text-xs">
                          PDF
                        </div>
                        <span className="text-xs font-semibold text-slate-700 max-w-[200px] truncate">{selectedApp.resumeName}</span>
                      </div>
                      <a
                        href={selectedApp.resumeBase64}
                        download={selectedApp.resumeName}
                        className="px-3 py-1.5 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              {selectedApp.status === 'PENDING' && (
                <div className="p-6 border-t border-slate-250 bg-slate-50 flex gap-4">
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'APPROVED')}
                    className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Approve Ambassador
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED')}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
