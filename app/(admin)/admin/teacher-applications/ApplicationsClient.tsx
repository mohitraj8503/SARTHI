'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  Eye,
  FileText,
  Mail,
  User as UserIcon,
  SearchX,
  Maximize2,
  X,
  Video,
  Info,
  GraduationCap,
  Lock,
  Shield,
  Briefcase,
  BookOpen,
  Play,
  Calendar,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface TeacherApplication {
  id: string;
  fullName: string;
  email: string;
  status: string;
  submittedAt: string | null;
  updatedAt: string;
  profilePhotoUrl?: string;
  bio?: string;
  yearsOfExperience?: number;
  expertise?: string; // JSON string
  portfolioLinks?: string; // JSON string
  preferredSubjects?: string; // JSON string
  teachingPhilosophy?: string;
  availability?: string;
  rejectionReason?: string;
  adminNotes?: string;
  headline?: string;
  skills?: string;
  preferredLevel?: string;
  pricing?: string;
  demoVideoUrl?: string;
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    graduationYear: number;
  }>;
  documents: Array<{
    type: string;
    fileUrl: string;
    fileName?: string;
  }>;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<TeacherApplication | null>(null);
  
  // Custom Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'APPROVE' | 'REJECT' | 'CHANGES_REQUESTED' | 'SUSPENDED' | 'UNDER_REVIEW';
    appId: string;
    appName: string;
  } | null>(null);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  // Fetch Applications
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/teacher-applications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        toast.error('Invalid response format');
      }
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Review Submission API handler
  const handleReviewAction = async (id: string, status: string, notes = '') => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/teacher-applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          adminNotes: notes, 
          rejectionReason: notes 
        })
      });
      
      const resData = await res.json();
      if (res.ok) {
        toast.success(`Application updated to ${status.toLowerCase().replace('_', ' ')} successfully`);
        setSelectedApp(null);
        setConfirmModal(null);
        setNotesInput('');
        fetchApplications();
      } else {
        toast.error(resData.error || 'Review submission failed');
      }
    } catch (error) {
      toast.error('An error occurred during review execution');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Safe JSON Parsing Helpers
  const parsePortfolio = (linksStr: string | null | undefined) => {
    if (!linksStr) return { githubUrl: '', personalWebsite: '' };
    try {
      const parsed = JSON.parse(linksStr);
      return {
        githubUrl: parsed.githubUrl || '',
        personalWebsite: parsed.personalWebsite || ''
      };
    } catch {
      return { githubUrl: '', personalWebsite: '' };
    }
  };

  const parseAvailability = (availStr: string | null | undefined) => {
    const fallback = { 
      availableDays: [], 
      preferredTimeSlots: [], 
      timezone: 'UTC', 
      remoteOfflineAvailability: 'Remote & Offline', 
      travelAvailability: false,
      weekendAvailability: false,
      preferredPaymentMethod: 'Bank Transfer',
      bankDetails: '',
      hourlyRate: 0,
      workshopPricing: 0
    };
    if (!availStr) return fallback;
    try {
      return { ...fallback, ...JSON.parse(availStr) };
    } catch {
      return fallback;
    }
  };

  const parseSkills = (skillsStr: string | null | undefined): string[] => {
    if (!skillsStr) return [];
    try {
      const parsed = JSON.parse(skillsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    }
  };

  const parseSubjects = (subjStr: string | null | undefined): string[] => {
    if (!subjStr) return [];
    try {
      const parsed = JSON.parse(subjStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Status visual attributes
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED': 
        return { 
          bg: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20', 
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
        };
      case 'REJECTED': 
        return { 
          bg: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20', 
          icon: <XCircle className="w-3.5 h-3.5" />,
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]'
        };
      case 'PENDING': 
        return { 
          bg: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20', 
          icon: <Clock className="w-3.5 h-3.5" />,
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]'
        };
      case 'UNDER_REVIEW': 
        return { 
          bg: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20', 
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
        };
      case 'CHANGES_REQUESTED': 
        return { 
          bg: 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20', 
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          glow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]'
        };
      case 'SUSPENDED': 
        return { 
          bg: 'bg-[#6B7280]/20 text-[#9CA3AF] border-[#6B7280]/30', 
          icon: <Lock className="w-3.5 h-3.5" />,
          glow: ''
        };
      default: 
        return { 
          bg: 'bg-white/5 text-white/60 border-white/10', 
          icon: <Info className="w-3.5 h-3.5" />,
          glow: ''
        };
    }
  };

  const formatSubmittedAt = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Not submitted';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'TBD';
    }
  };

  // Filter application dataset
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          app.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics for cards
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    changesRequested: applications.filter(a => a.status === 'CHANGES_REQUESTED').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
    suspended: applications.filter(a => a.status === 'SUSPENDED').length,
  };

  return (
    <div className="min-h-screen bg-[#030712] text-[#F9FAFB] p-6 md:p-12 font-sans overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
        
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">FACULTY HIRING</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              TEACHER <span className="text-[#F97316]">APPLICATIONS</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Verify credentials, review demo sessions, and issue faculty credentials.
            </p>
          </div>

          <button 
            onClick={fetchApplications} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F172A] text-white text-xs font-black uppercase tracking-wider hover:bg-[#F97316] transition-all shadow-md active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /> Refresh Data
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4 px-4 sm:px-0">
          {[
            { label: 'Total', count: stats.total, color: 'text-white border-white/5' },
            { label: 'Pending', count: stats.pending, color: 'text-amber-400 border-amber-500/10' },
            { label: 'Under Review', count: stats.underReview, color: 'text-blue-400 border-blue-500/10' },
            { label: 'Changes Req.', count: stats.changesRequested, color: 'text-pink-400 border-pink-500/10' },
            { label: 'Approved', count: stats.approved, color: 'text-emerald-400 border-emerald-500/10' },
            { label: 'Rejected', count: stats.rejected, color: 'text-rose-400 border-rose-500/10' },
            { label: 'Suspended', count: stats.suspended, color: 'text-gray-400 border-gray-500/10' },
          ].map((card, idx) => (
            <div 
              key={idx} 
              className={cn(
                "p-5 rounded-2xl bg-[#0B0F19]/80 border backdrop-blur-md shadow-lg flex flex-col justify-between h-[105px] transition-all hover:translate-y-[-2px] hover:border-white/10 group cursor-pointer",
                card.color
              )}
              onClick={() => {
                if (card.label === 'Total') setStatusFilter('All');
                else if (card.label === 'Changes Req.') setStatusFilter('Changes_Requested');
                else setStatusFilter(card.label.replace(' ', '_'));
              }}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors">{card.label}</span>
              <span className="text-3xl font-black">{card.count}</span>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0B0F19]/80 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col lg:flex-row gap-5 mx-4 sm:mx-0">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by candidate name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#030712] border border-white/5 rounded-2xl pl-16 pr-4 py-4 text-[15px] font-medium text-white placeholder-gray-500 focus:border-emerald-500/30 focus:outline-none transition-all"
            />
          </div>

          {/* Status filter selection tabs */}
          <div className="flex items-center overflow-x-auto no-scrollbar max-w-full">
            <div className="flex bg-[#030712] p-1.5 rounded-2xl border border-white/5 whitespace-nowrap">
              {['All', 'Pending', 'Under Review', 'Changes Requested', 'Approved', 'Rejected', 'Suspended'].map((status) => {
                const isSelected = statusFilter.toLowerCase().replace('_', ' ') === status.toLowerCase();
                return (
                  <button
                    key={status}
                    onClick={() => {
                      if (status === 'Changes Requested') setStatusFilter('Changes_Requested');
                      else setStatusFilter(status);
                    }}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      isSelected 
                        ? "bg-white/10 text-white border border-white/10 shadow-lg" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-[#0B0F19]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden mx-4 sm:mx-0">
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-[#030712]/50 border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Applicant</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Experience</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Submission Time</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Status Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-10 h-24 bg-[#090D1A]/20" />
                    </tr>
                  ))
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <SearchX className="w-12 h-12 text-gray-600" />
                        <p className="text-[13px] font-black uppercase tracking-widest text-gray-400">No applications found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const statusConfig = getStatusConfig(app.status);
                    return (
                      <tr 
                        key={app.id} 
                        className="group hover:bg-white/[0.01] transition-all cursor-pointer"
                        onClick={() => setSelectedApp(app)}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                              {app.profilePhotoUrl ? (
                                 
                                <img src={app.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                 
                                <img src="/sarthi-logo.png" alt="SARTHI" className="w-full h-full object-contain p-2 bg-[#10B981]/5" />
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-black text-white">{app.fullName}</p>
                              <p className="text-[11px] font-bold text-gray-500">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[14px] font-black text-white">{app.yearsOfExperience || 0} Years</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[13px] font-bold text-gray-400">
                            {formatSubmittedAt(app.submittedAt)}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all",
                            statusConfig.bg,
                            statusConfig.glow
                          )}>
                            {statusConfig.icon}
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => setSelectedApp(app)}
                              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all shadow-sm"
                            >
                              <Eye className="w-5 h-5" />
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
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/70 backdrop-blur-md" onClick={() => setSelectedApp(null)} />
          <div className="relative bg-[#090D1A] w-full max-w-6xl rounded-[2rem] sm:rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#0B1020] px-6 sm:px-12 py-6 sm:py-8 border-b border-white/5 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-4 sm:gap-6">
                  {selectedApp.profilePhotoUrl && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white/10 shrink-0">
                       { }
                       <img src={selectedApp.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black tracking-tight flex flex-wrap items-center gap-2">
                      {selectedApp.fullName}
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        getStatusConfig(selectedApp.status).bg
                      )}>
                        {selectedApp.status.replace('_', ' ')}
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1 line-clamp-1">{selectedApp.email}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedApp(null)} className="p-2.5 sm:p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white">
                 <X className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>
            </div>
 
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 sm:py-10 no-scrollbar space-y-10 sm:space-y-12 bg-[#060A14]">
               
               {/* Reviewer Feedback / Rejection Info */}
               {selectedApp.adminNotes && (
                 <div className="p-6 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-2">
                   <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
                     <AlertTriangle className="w-3.5 h-3.5" /> Revision Feedback
                   </h4>
                   <p className="text-sm font-medium text-pink-200/90 leading-relaxed italic">&quot;{selectedApp.adminNotes}&quot;</p>
                 </div>
               )}
               {selectedApp.rejectionReason && (
                 <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                   <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                     <XCircle className="w-3.5 h-3.5" /> Rejection Decision
                   </h4>
                   <p className="text-sm font-medium text-rose-200/90 leading-relaxed italic">&quot;{selectedApp.rejectionReason}&quot;</p>
                 </div>
               )}
 
               {/* Headline, Bio, Skills */}
               <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div>
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> Professional Headline
                        </h4>
                        <p className="text-xl sm:text-2xl font-black text-white">{selectedApp.headline || 'No headline provided'}</p>
                    </div>
                    <div className="shrink-0">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Industry Experience</h4>
                        <p className="text-lg sm:text-xl font-black text-white">{selectedApp.yearsOfExperience || 0} Years</p>
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Short Bio</h4>
                    <div className="p-6 md:p-8 bg-[#090D19] rounded-[2rem] border border-white/5 text-[15px] sm:text-[16px] font-medium text-gray-300 leading-relaxed italic">
                        &quot;{selectedApp.bio || 'No bio provided.'}&quot;
                    </div>
                  </div>
 
                  {/* Skills tags */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Key Skillsets</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseSkills(selectedApp.skills).map((skill: string, i: number) => (
                          <span key={i} className="px-4 py-2 bg-emerald-500/5 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">{skill}</span>
                      ))}
                    </div>
                  </div>
               </div>
 
               {/* Teaching Details & Session preferences */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <BookOpen className="w-4 h-4" /> Course Mapping & Subject Matter
                    </h4>
                    <div className="space-y-4">
                        <div className="p-6 bg-[#090D19] rounded-3xl border border-white/5">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Preferred Subjects</span>
                            <div className="flex flex-wrap gap-2">
                              {parseSubjects(selectedApp.preferredSubjects).map((sub: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs font-bold">{sub}</span>
                              ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-[#090D19] rounded-3xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Target Level</span>
                                <span className="text-sm font-bold text-gray-200">{selectedApp.preferredLevel || 'Intermediate'}</span>
                            </div>
                            <div className="p-6 bg-[#090D19] rounded-3xl border border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Expected Payrate</span>
                                <span className="text-sm font-bold text-emerald-400">₹{selectedApp.pricing || '0'}/hr</span>
                            </div>
                        </div>
                    </div>
                  </div>
 
                  {/* Demo Video Section */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <Video className="w-4 h-4" /> Demo Session / Tech Auditing
                    </h4>
                    {selectedApp.demoVideoUrl ? (
                        <div className="aspect-video rounded-[2rem] bg-[#030712] border border-white/10 overflow-hidden relative group shadow-2xl">
                            <iframe 
                                className="w-full h-full border-none"
                                src={selectedApp.demoVideoUrl.includes('youtube.com') || selectedApp.demoVideoUrl.includes('youtu.be')
                                  ? `https://www.youtube.com/embed/${selectedApp.demoVideoUrl.split('v=')[1] || selectedApp.demoVideoUrl.split('/').pop()}`
                                  : selectedApp.demoVideoUrl}
                                title="Teacher Demo Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="aspect-video rounded-[2rem] bg-white/[0.01] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 opacity-50">
                            <Play className="w-8 h-8 text-gray-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">No Demo Video Link Provided</span>
                        </div>
                    )}
                  </div>
               </div>

               {/* Availability Block */}
               {(() => {
                 const avail = parseAvailability(selectedApp.availability);
                 return (
                   <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                       <Calendar className="w-4 h-4" /> Availability & Operations Settings
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="p-6 bg-[#090D19] rounded-3xl border border-white/5 space-y-2">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Available Slots</span>
                         <p className="text-sm font-bold text-gray-200">{avail.availableDays?.join(', ') || 'None selected'}</p>
                         <p className="text-xs text-gray-400">{avail.preferredTimeSlots?.join(' • ') || 'No timeslots'}</p>
                       </div>
                       <div className="p-6 bg-[#090D19] rounded-3xl border border-white/5 space-y-1">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Timezone & Mode</span>
                         <p className="text-sm font-bold text-gray-200">{avail.timezone}</p>
                         <p className="text-xs text-gray-400">{avail.remoteOfflineAvailability}</p>
                       </div>
                       <div className="p-6 bg-[#090D19] rounded-3xl border border-white/5 space-y-1">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">NDAs & Payout ID</span>
                         <p className="text-sm font-bold text-gray-200">{avail.agreedToNDA ? 'Signed and Agreed NDA ✓' : 'NDA Pending'}</p>
                         <p className="text-xs text-gray-400">Payout: {avail.bankDetails || 'N/A'}</p>
                       </div>
                     </div>
                   </div>
                 );
               })()}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Academic Background */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <GraduationCap className="w-4 h-4" /> Academic Background
                    </h4>
                    <div className="space-y-4">
                      {selectedApp.education && selectedApp.education.length > 0 ? (
                        selectedApp.education.map((edu, idx) => (
                          <div key={idx} className="p-6 bg-[#090D19] border border-white/5 rounded-3xl shadow-sm">
                             <p className="text-[14px] font-black text-white mb-1">{edu.degree}</p>
                             <p className="text-[12px] font-bold text-gray-400">{edu.institution}</p>
                             <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">{edu.fieldOfStudy} • Class of {edu.graduationYear}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">No academic items listed.</p>
                      )}
                    </div>
                  </div>

                  {/* Verification Documents */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                      <FileText className="w-4 h-4" /> Credentials & Verification docs
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedApp.documents && selectedApp.documents.length > 0 ? (
                        selectedApp.documents.map((doc, idx) => (
                          <a 
                            key={idx} 
                            href={doc.fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-5 bg-[#090D19] border border-white/5 rounded-3xl flex items-center justify-between hover:border-emerald-500/30 transition-all group shadow-sm"
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                  {doc.type === 'INTRO_VIDEO' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <span className="text-[12px] font-black text-white uppercase tracking-widest">{doc.type}</span>
                             </div>
                             <Maximize2 className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                          </a>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">No credentials uploaded.</p>
                      )}
                    </div>
                  </div>
               </div>

               {/* Teaching Philosophy */}
               {selectedApp.teachingPhilosophy && (
                 <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                     <Shield className="w-3.5 h-3.5" /> Philosophy on Teaching
                   </h4>
                   <div className="p-6 md:p-8 bg-[#090D19] border border-white/5 rounded-[2rem] text-[15px] font-medium text-gray-300 leading-relaxed">
                     {selectedApp.teachingPhilosophy}
                   </div>
                 </div>
               )}
            </div>
 
            {/* Decision Footer panel */}
            <div className="p-6 sm:p-8 bg-[#0B1020] border-t border-white/5 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-500 w-full sm:w-auto">Quick Actions:</span>
                
                {/* 1. Mark Under Review */}
                {selectedApp.status !== 'UNDER_REVIEW' && selectedApp.status !== 'APPROVED' && selectedApp.status !== 'SUSPENDED' && (
                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      type: 'UNDER_REVIEW',
                      appId: selectedApp.id,
                      appName: selectedApp.fullName
                    })}
                    className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-center"
                  >
                    Mark Reviewing
                  </button>
                )}
 
                {/* 2. Suspend Account */}
                {selectedApp.status === 'APPROVED' && (
                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      type: 'SUSPENDED',
                      appId: selectedApp.id,
                      appName: selectedApp.fullName
                    })}
                    className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:bg-gray-500/20 hover:text-red-400 hover:border-red-500/30 transition-all text-center"
                  >
                    Suspend Instructor
                  </button>
                )}
              </div>
 
              {/* Core review actions */}
              {['PENDING', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'REJECTED', 'SUSPENDED'].includes(selectedApp.status) && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Approve */}
                  {selectedApp.status !== 'APPROVED' && (
                    <button 
                      onClick={() => setConfirmModal({
                        isOpen: true,
                        type: 'APPROVE',
                        appId: selectedApp.id,
                        appName: selectedApp.fullName
                      })}
                      className="w-full sm:w-auto px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-[#030712] rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Create Account
                    </button>
                  )}
 
                  {/* Request Revision */}
                  {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'CHANGES_REQUESTED' && (
                    <button 
                      onClick={() => setConfirmModal({
                        isOpen: true,
                        type: 'CHANGES_REQUESTED',
                        appId: selectedApp.id,
                        appName: selectedApp.fullName
                      })}
                      className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5 text-pink-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center"
                    >
                      Request Revisions
                    </button>
                  )}
 
                  {/* Reject */}
                  {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'REJECTED' && (
                    <button 
                      onClick={() => setConfirmModal({
                        isOpen: true,
                        type: 'REJECT',
                        appId: selectedApp.id,
                        appName: selectedApp.fullName
                      })}
                      className="w-full sm:w-auto px-5 py-3 bg-transparent border border-white/5 text-gray-400 hover:text-red-500 hover:border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center"
                    >
                      Reject Application
                    </button>
                  )}
                </div>
              )}
            </div>
 
          </div>
        </div>
      )}

      {/* Confirmation Portal Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { if(!isActionLoading) setConfirmModal(null); }} />
          <div className="relative bg-[#0D1224] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-150 space-y-6">
            
            {/* Title / Header */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Confirm System Review</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                You are changing <strong className="text-white">{confirmModal.appName}</strong>&apos;s instructor application status to 
                <strong className="text-white bg-white/5 px-2 py-0.5 rounded ml-1 uppercase">{confirmModal.type.replace('_', ' ')}</strong>.
              </p>
            </div>

            {/* Input field for Notes/Reasoning */}
            {['REJECT', 'CHANGES_REQUESTED'].includes(confirmModal.type) && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                  {confirmModal.type === 'REJECT' ? 'Rejection Reason (Emailed to applicant)' : 'Revision Notes (Emailed to applicant)'}
                </label>
                <textarea 
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder={confirmModal.type === 'REJECT' 
                    ? "Enter reason for rejection..." 
                    : "Enter details about what the applicant needs to fix (e.g. upload a valid identity proof, extend short bio)..."
                  }
                  className="w-full h-32 p-4 bg-[#05070F] border border-white/5 rounded-2xl text-[14px] text-white focus:border-emerald-500/30 focus:outline-none transition-all resize-none"
                />
              </div>
            )}

            {/* Actions buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setConfirmModal(null)}
                disabled={isActionLoading}
                className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleReviewAction(confirmModal.appId, confirmModal.type, notesInput)}
                disabled={isActionLoading || (['REJECT', 'CHANGES_REQUESTED'].includes(confirmModal.type) && !notesInput.trim())}
                className={cn(
                  "flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2",
                  confirmModal.type === 'APPROVE' && "bg-[#10B981] hover:bg-[#059669] text-[#030712]",
                  confirmModal.type === 'REJECT' && "bg-rose-600 hover:bg-rose-700 text-white",
                  confirmModal.type === 'CHANGES_REQUESTED' && "bg-pink-600 hover:bg-pink-700 text-white",
                  confirmModal.type === 'SUSPENDED' && "bg-gray-600 hover:bg-gray-700 text-white",
                  confirmModal.type === 'UNDER_REVIEW' && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {isActionLoading ? 'Saving...' : 'Confirm Action'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
