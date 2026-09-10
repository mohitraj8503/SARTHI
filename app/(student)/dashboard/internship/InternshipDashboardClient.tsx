'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Award, ShieldCheck, CheckCircle2, AlertCircle, Clock,
  ArrowRight, UserCheck, Calendar, Trophy, Flame, Eye, ClipboardList,
  MessageSquare, User, Activity, FileText, CheckSquare, Sparkles, BookOpen, Star, AlertTriangle, ChevronDown, Mail, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import InternshipApplicationForm from '@/components/internship/InternshipApplicationForm';
import ApplicationStatusView from '@/components/internship/ApplicationStatusView';
import DashboardRecoveryGuard from '@/components/auth/DashboardRecoveryGuard';
import { cn } from '@/lib/utils';

interface ClientProps {
  initialEnrollment: any;
  initialApplication: any;
  applicationNumber: number;
  leaderboard: any[];
  settings: any;
  calculatedData: {
    currentWeekString: string;
    nextDeadlineString: string;
    activityList: any[];
    weeklyGoals: any[];
  };
  initialIsArkaJainRejected?: boolean;
  initialNotices?: any[];
  todayAssignment?: any;
}

// Helper to convert full uppercase titles into clean Title Case while preserving intentional acronyms and emojis
function toTitleCase(str: string): string {
  if (!str) return '';
  if (str !== str.toUpperCase()) return str;

  const acronyms = new Set(['SEO', 'AI', 'XP', 'API', 'UI', 'UX', 'LLM', 'R&D', 'PDF', 'PNG', 'CTA', 'ID', 'URL']);
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (!word) return '';
      const upperWord = word.toUpperCase().replace(/[^A-Z]/g, '');
      if (acronyms.has(upperWord)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export default function InternshipDashboardClient({
  initialEnrollment,
  initialApplication,
  applicationNumber,
  leaderboard,
  settings,
  calculatedData,
  initialIsArkaJainRejected = false,
  initialNotices = [],
  todayAssignment
}: ClientProps) {
  const router = useRouter();
  const [member, setMember] = useState(initialEnrollment);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(todayAssignment?.id || null);
  const [notices, setNotices] = useState<any[]>(initialNotices);
  const [expandedCompletedBoard, setExpandedCompletedBoard] = useState(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [application, setApplication] = useState(initialApplication);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(false);
  const [arkaJainRejected, setArkaJainRejected] = useState(
    initialIsArkaJainRejected ||
    (typeof window !== 'undefined' && localStorage.getItem('tt_internship_rejected_arkajain') === 'true')
  );

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCollege, setFormCollege] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formSemester, setFormSemester] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formDomain, setFormDomain] = useState('');
  const [formStatement, setFormStatement] = useState('');

  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');
  const [showXpModal, setShowXpModal] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return member?.checkIns?.some((c: any) => c.checkInDate === today) || false;
  });

  const [generatingCert, setGeneratingCert] = useState(false);
  const [deliverableStatusFilter, setDeliverableStatusFilter] = useState('ALL');

  const handleGenerateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await fetch('/api/internship/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json();
      if (res.ok) {
        window.open(data.certUrl, '_blank');
      } else {
        alert(data.error || 'Failed to generate certificate.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleCheckIn = async () => {
    setLoadingCheckIn(true);
    setCheckInError('');
    try {
      const res = await fetch('/api/internship/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCheckedInToday(true);
        setMember((prev: any) => ({
          ...prev,
          currentXp: data.newXp,
          currentLevel: data.level,
          xpTransactions: [
            { id: Math.random().toString(), amount: settings.checkInXp, description: `+${settings.checkInXp} Check-in`, createdAt: new Date().toISOString() },
            ...prev.xpTransactions
          ]
        }));
        router.refresh();
      } else {
        setCheckInError(data.error || 'Check-in failed');
      }
    } catch (err) {
      setCheckInError('Network error occurred.');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingApp(true);
    try {
      const res = await fetch('/api/internship/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          college: formCollege,
          course: formCourse,
          semester: formSemester,
          github: formGithub,
          linkedin: formLinkedin,
          domain: formDomain,
          statement: formStatement,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.rejected) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('tt_internship_rejected_arkajain', 'true');
          }
          setArkaJainRejected(true);
          setShowApplicationForm(false);
        } else {
          setApplication(data.application);
          setShowApplicationForm(false);
        }
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleAcceptOffer = async () => {
    setAcceptingOffer(true);
    try {
      const res = await fetch('/api/internship/accept-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMember(data.member);
        router.refresh();
      } else {
        alert(data.error || 'Failed to accept offer');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptingOffer(false);
    }
  };

  const attendanceRecord = member?.attendances?.[0] || { streak: 0, daysActive: 0, consistency: 0, totalSubmitted: 0 };
  const approvedSubmissions = member?.submissions?.filter((s: any) => s.status === 'Approved') || [];
  const completedAssignmentsCount = approvedSubmissions.length;

  const assignedAssignmentsList = member?.batch?.assignments || [];
  const totalAssignmentsCount = assignedAssignmentsList.length;

  // Real Assignment Completion Percentage Calculation
  const assignmentVal = totalAssignmentsCount > 0
    ? Math.round((completedAssignmentsCount / totalAssignmentsCount) * 100)
    : 0;

  // Real Attendance Percentage Calculation: daysActive vs total program days passed since joinedAt (min 1 day)
  const daysSinceJoined = member?.joinedAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const actualActiveDays = Math.max(attendanceRecord.daysActive || 0, member?.checkIns?.length || 0);

  // Real Attendance Percentage
  const attendanceVal = Math.min(100, Math.round((actualActiveDays / daysSinceJoined) * 100));

  const maxLeaderboardXp = Math.max(...(leaderboard || []).map((item: any) => item.currentXp || 1), 1720);
  const getPointers = (xp: number) => Math.min(10, Number(((xp / maxLeaderboardXp) * 10).toFixed(1)));

  const currentXp = member?.currentXp || 0;
  const xpNeeded = settings.requiredXp || 2000;
  const xpPercent = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  const eligibility = {
    attendance: attendanceVal >= settings.requiredAttendance,
    assignments: assignmentVal >= settings.requiredAssignments,
    xp: currentXp >= xpNeeded,
    mentorApproval: completedAssignmentsCount > 0,
  };

  const isEligibleForCertificate = eligibility.attendance && eligibility.assignments && eligibility.xp && eligibility.mentorApproval;

  // Gamification progress details dynamically parsed
  const thresholds = settings.levelThresholds.split(',').map(Number);
  const nextThreshold = thresholds.find((t: number) => t > (member?.currentXp || 0)) || ((member?.currentLevel || 1) * 500);
  const xpRemaining = nextThreshold - (member?.currentXp || 0);

  // STATE 0: Arka Jain Rejection Page (Full Screen)
  if (arkaJainRejected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-zinc-950 via-red-950/20 to-zinc-950 p-4 md:p-6 font-sans">
        <div className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl border border-red-950/30 rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-900/10 rounded-full blur-2xl pointer-events-none" />

          {/* Animated Warning Icon Container */}
          <div className="w-20 h-20 bg-red-950/40 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse mb-8">
            🫏
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
              🚫 Applications Closed for Your University
            </h2>
            <p className="text-red-500 font-extrabold uppercase tracking-wider text-sm leading-relaxed">
              We are sorry, we don't keep donkeys in our student internship program. Your college / university caliber does not match SARTHI standards.
            </p>
            <div className="h-[1px] bg-red-950/50 w-full my-4" />
            <div className="space-y-3 text-zinc-400 text-sm font-medium leading-relaxed">
              <p>
                At this time, SARTHI is not accepting internship applications from students of Arka Jain University for upcoming internship batches.
              </p>
              <p>
                This decision has been made based on our current internship policies and previous program experience.
              </p>
              <p>
                We appreciate your interest and wish you success in your professional journey.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/"
              className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/20 transition-all text-center flex items-center justify-center gap-2 font-outfit"
            >
              Return to Homepage
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:support@sarthi.in"
              className="flex-1 px-8 py-4 bg-zinc-800/80 hover:bg-zinc-800 active:scale-95 text-zinc-300 text-xs font-black uppercase tracking-widest rounded-2xl border border-zinc-700/50 transition-all text-center font-outfit"
            >
              Contact Support
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-red-950/20 w-full">
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.22em]">
              SARTHI Internship Program
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STATE 6: Completed Internship Dashboard
  if (member && member.status === 'Completed') {
    return (
      <div className="space-y-10 max-w-[1600px] mx-auto p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2.5rem] p-10 border border-white/10 shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
          <div className="w-20 h-20 bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-500/10">🏆</div>
          <div className="space-y-3">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Internship Completed</span>
            <h2 className="text-3xl sm:text-4.5xl font-black italic uppercase tracking-tight text-white leading-none">CONGRATULATIONS!</h2>
            <p className="text-sm text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
              You have successfully completed all internship requirements for the Software Development & Creator Internship. Your graduation credentials are ready for download.
            </p>
          </div>
          <div className="h-[1px] bg-white/10 w-full" />
          <div className="grid sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto text-xs pt-2">
            <div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Intern Name</span>
              <p className="font-bold text-gray-200 uppercase">{member.user?.name}</p>
            </div>
            <div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Reference Number</span>
              <p className="font-bold text-gray-200 uppercase">{member.referenceNumber}</p>
            </div>
            <div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Batch Parameters</span>
              <p className="font-bold text-gray-200 uppercase">{member.batch?.name || 'July 2026 Batch'}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button
              onClick={handleGenerateCertificate}
              disabled={generatingCert}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 transition-all font-outfit"
            >
              {generatingCert ? 'Generating...' : 'Download Certificate'}
            </button>
            <Link
              href="/dashboard/settings"
              className="px-8 py-4 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all font-outfit"
            >
              Performance Report
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STATE 7: Rejected
  if ((!member || member.status !== 'ACTIVE') && application && application.status === 'REJECTED') {
    return (
      <div className="space-y-10 max-w-[1600px] mx-auto p-4 md:p-8 font-sans">
        <div className="max-w-md mx-auto my-24 p-8 bg-white border border-gray-150 rounded-[2.5rem] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✕</div>
          <h2 className="text-xl font-black uppercase text-gray-800">Application Status</h2>
          <p className="text-[10px] text-rose-700 font-extrabold uppercase tracking-widest">Not Selected</p>
          <p className="text-xs text-gray-500 font-medium">Unfortunately your application was not selected for the current batch. You may apply again for future internship programs.</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all font-outfit">
            View Other Programs
          </Link>
        </div>
      </div>
    );
  }

  // STATE 3: Selected / Offer Letter Sent / Approved (Accept Offer or Auto-transition)
  if ((!member || member.status !== 'ACTIVE') && application && (application.status === 'SELECTED' || application.status === 'OFFER_SENT' || application.status === 'SHORTLISTED' || application.status === 'APPROVED' || application.status === 'OFFER_ACCEPTED' || !!application.offerAcceptedAt)) {
    return (
      <div className="space-y-10 max-w-[1600px] mx-auto p-4 md:p-8 font-sans">
        <div className="max-w-xl mx-auto my-20 p-10 bg-white border border-slate-200/80 rounded-[2.5rem] shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">🎉</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Congratulations!</h2>
            <p className="text-[10px] text-[#D4915C] font-extrabold uppercase tracking-widest">You have been selected</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              Your application for the Software Development & Creator Internship has been approved by the selection board.
            </p>
          </div>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-3 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium uppercase text-[9px] tracking-wider">Reference Number</span>
              <span className="font-extrabold text-slate-800 uppercase tracking-tight">
                {application.id ? `TT-INT-2026-${String(applicationNumber).padStart(4, '0')}` : 'TT-INT-2026-0001'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium uppercase text-[9px] tracking-wider">Offer Letter Status</span>
              <span className="font-bold text-emerald-600 uppercase tracking-wider text-[9px]">Ready to Accept</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <button
              onClick={handleAcceptOffer}
              disabled={acceptingOffer}
              className="px-8 py-3.5 bg-[#1B4332] hover:bg-[#113b2b] active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#1B4332]/10 transition-all font-outfit"
            >
              {acceptingOffer ? 'Creating Workspace...' : 'Accept Internship & Open Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STATE 2: Application Existing (Under Review or Offer Accepted)
  if ((!member || member.status !== 'ACTIVE') && application) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 font-sans">
        <ApplicationStatusView application={application} />
      </div>
    );
  }

  // STATE 1: Shared Application Form
  if (showApplicationForm) {
    return (
      <div className="min-h-[calc(100vh-80px)] p-4 md:p-6 font-sans flex items-start">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-5 gap-0 rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-slate-200 min-h-[80vh]">
            {/* Left sidebar — programme info */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden border-r border-slate-100">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-teal-100/40 blur-2xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #1B4332 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              <div className="relative z-10 space-y-8">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-[#1B4332] text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>

                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Accepting Applications
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                    Student<br />Internship<br />Programme
                  </h2>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    A hands-on, industry-grade internship designed to build real-world skills under expert mentorship.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Duration', val: '3 Months' },
                    { label: 'Mode', val: 'Remote' },
                    { label: 'Hours', val: 'Max 2/Day' },
                    { label: 'Mentor', val: 'Mohit Raj' },
                  ].map(item => (
                    <div key={item.label} className="px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                      <p className="text-slate-800 font-extrabold text-xs uppercase">{item.val}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">What you get</p>
                  {['Live Projects & Assignments', 'Verified Certificate', 'GitHub Portfolio', 'Letter of Recommendation', 'Industry Mentorship', 'Performance Report'].map(b => (
                    <div key={b} className="flex items-center gap-2.5 text-slate-600 text-xs font-medium">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-emerald-200 shrink-0">
                  <img src="/profile_pictures/mohit_raj.png" alt="Mohit Raj" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-slate-800 font-extrabold text-xs uppercase">Mohit Raj</p>
                  <p className="text-emerald-600 text-[9px] font-bold uppercase tracking-wider">Primary Supervisor</p>
                </div>
              </div>
            </div>

            {/* Right — Form Component */}
            <div className="lg:col-span-3 bg-white p-8 md:p-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-800 tracking-tight">Application Form</h3>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">Fill in your details to apply for the Student Internship Programme</p>
                </div>
                <button onClick={() => setShowApplicationForm(false)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <InternshipApplicationForm
                onSuccess={(appData) => {
                  setApplication(appData);
                  setShowApplicationForm(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If student has any application (regardless of status), don't show the landing/apply page
  // This prevents the "apply again" bug after submit or after mentor accepts
  if (!member || member.status !== 'ACTIVE') {
    // If they have an application that isn't matched above, show the submitted state
    if (application) {
      return (
        <div className="space-y-10 max-w-[1600px] mx-auto p-4 md:p-8 font-sans">
          <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl text-center space-y-8 relative overflow-hidden">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">📋</div>
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase text-slate-800">Application Submitted</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Your application is currently under review by our cohort admission team.
              </p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl grid grid-cols-2 gap-4 text-left text-xs">
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Reference</span>
                <p className="font-extrabold text-slate-800 uppercase tracking-tight">TT-INT-2026-{String(applicationNumber).padStart(4, '0')}</p>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Status</span>
                <p className="font-extrabold text-blue-600 uppercase tracking-wider text-[9px]">Under Review</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full min-h-[calc(100vh-80px)] lg:min-h-screen p-4 md:p-6 font-sans flex items-center justify-center">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.06)] border border-slate-200 min-h-[80vh] bg-white">
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
            {/* Very light dot texture */}
            <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #1B4332 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-emerald-50 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-teal-50/80 blur-[60px] pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-0 min-h-[80vh]">
              {/* Left: Programme info */}
              <div className="flex flex-col justify-between p-6 sm:p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-slate-100">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Open for Applications
                    </span>
                    <span className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">July 2026 Batch</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">SARTHI</p>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tight leading-[0.95]">
                        Student<br />
                        <span className="text-[#1B4332]">Internship</span><br />
                        Programme
                      </h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                      Build real-world skills, contribute to live projects, earn a verified certificate, and grow under expert mentorship — all from your own workspace.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: '📅', label: '3 Months', sub: 'Duration' },
                      { icon: '🌐', label: 'Remote', sub: 'Mode' },
                      { icon: '⏱', label: 'Max 2 Hrs', sub: 'Per Day' },
                      { icon: '👨‍💼', label: 'Mohit Raj', sub: 'Mentor' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-base">{s.icon}</span>
                        <div>
                          <p className="text-slate-800 font-extrabold text-xs uppercase leading-none">{s.label}</p>
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-10 space-y-4">
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-[#1B4332] hover:bg-[#0f2d21] text-white text-sm font-black uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all shadow-[0_16px_40px_rgba(27,67,50,0.25)]"
                  >
                    Apply for Internship
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-slate-300 text-[10px] font-semibold">Rolling admissions · Limited seats · No fees</p>
                </div>
              </div>

              {/* Right: Benefits & mentor */}
              <div className="flex flex-col justify-center p-6 sm:p-10 md:p-14 space-y-8">
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Programme Benefits</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '🚀', title: 'Live Projects', desc: 'Work on real products' },
                      { icon: '🏅', title: 'Certificate', desc: 'Verified on completion' },
                      { icon: '📂', title: 'GitHub Portfolio', desc: 'Showcase your work' },
                      { icon: '📊', title: 'Performance Report', desc: 'Detailed analytics' },
                      { icon: '✉️', title: 'Recommendation', desc: 'Letter on eligibility' },
                      { icon: '🧑‍🏫', title: 'Mentorship', desc: 'Industry expert guidance' },
                    ].map(b => (
                      <div key={b.title} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
                        <span className="text-xl shrink-0">{b.icon}</span>
                        <div>
                          <p className="text-slate-800 font-extrabold text-[11px] uppercase leading-tight">{b.title}</p>
                          <p className="text-slate-400 text-[10px] font-medium mt-0.5">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                  <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest">Who can apply?</p>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">
                    Any student enrolled in a college/university degree programme — no prior professional experience required. We select based on motivation, curiosity, and commitment to learn.
                  </p>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-emerald-200 shrink-0">
                    <img src="/profile_pictures/mohit_raj.png" alt="Mohit Raj" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-extrabold text-sm uppercase">Mohit Raj</p>
                    <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Primary Supervisor & Mentor</p>
                  </div>
                  <div className="ml-auto px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <DashboardRecoveryGuard routeName="Intern Workspace">
      <div className="space-y-10 max-w-[1600px] mx-auto p-4 md:p-8 font-sans">

      {/* Top Header with dynamic ID badge */}
      <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">SCHOLAR PORTAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
            INTERNSHIP <span className="text-emerald-500">WORKSPACE</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
            SARTHI Official Scholar Internship Portal
          </p>
        </div>

        {/* Premium Internship ID Badge */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl px-5 py-3.5 flex items-center gap-4 relative overflow-hidden shrink-0 z-10">
          <div className="space-y-1">
            <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest block">Internship ID</span>
            <p className="text-xs font-black uppercase tracking-wider leading-none text-slate-900">{member.referenceNumber || 'Generating...'}</p>
            <p className="text-[10px] font-extrabold text-slate-700 mt-1 uppercase leading-none">{member.user?.name || 'Intern'}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Permanent ID: {member.permanentInternId || 'Pending'}</p>
          </div>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[8px] font-black uppercase tracking-widest">
            {member.status}
          </div>
        </div>
      </header>

      {/* 1. Hero Workspace Welcome Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-[2.5rem] p-8 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Cohort
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {calculatedData.currentWeekString}
              </span>
            </div>
            <h2 className="text-2xl md:text-3.5xl font-black text-gray-900 uppercase tracking-tight leading-none">
              {application?.domain || member.batch.internship.title}
            </h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Welcome back to your workspace. Complete assignment deliverables, track your experience level-up, and build real-world products.
            </p>

            {/* Inline XP Competition & Leaderboard Widget */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase text-slate-800 tracking-wider">Cohort XP Competition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                    Your XP: {member.currentXp}
                  </span>
                  {leaderboard.length > 3 && (
                    <button
                      onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                      className="text-[10px] font-black uppercase text-emerald-800 hover:text-emerald-900 bg-white border border-slate-200 rounded-md px-2 py-0.5 flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
                    >
                      <span>{showAllLeaderboard ? 'Collapse' : 'Expand to View All'}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform", showAllLeaderboard && "rotate-180")} />
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const itemsToDisplay = showAllLeaderboard ? leaderboard : leaderboard.slice(0, 3);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5 max-h-[300px] overflow-y-auto pr-1">
                    {itemsToDisplay.map((item: any, idx: number) => {
                      const isUser = item.userId === member.userId;
                      return (
                        <div key={item.id} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${isUser ? 'bg-emerald-50 border-emerald-300 font-bold shadow-xs' : 'bg-white border-slate-200/70'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] font-black font-mono ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                              #{idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-800 uppercase truncate text-[11px]">
                              {item.user?.name?.split(' ')[0] || 'Scholar'} {isUser && '(You)'}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-[#1B4332] shrink-0 font-mono">{item.currentXp} XP</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100 text-xs">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Today&apos;s Focus</span>
              <p className="font-bold text-gray-800 uppercase">
                {member.batch.assignments.length > 0 ? 'Submit Active Tasks' : 'Await New Release'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Program Duration</span>
              <p className="font-bold text-gray-800 uppercase">{member.batch.duration || '3 Months'}</p>
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Next Deadline</span>
              <p className="font-bold text-rose-600 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {calculatedData.nextDeadlineString}
              </p>
            </div>
          </div>
        </div>


        {/* Dynamic Mentor Card */}
        <div className="lg:col-span-4 bg-white border border-gray-150 rounded-[2.5rem] p-8 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.02)] flex flex-col justify-between items-stretch relative overflow-hidden group">
          {/* Subtle gradient accent orb */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#1B4332]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Primary Supervisor</span>

            <div className="flex items-center gap-4">
              {member.batch.mentorName === "Mohit Raj" ? (
                <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#1B4332]/10 shadow-md bg-slate-100 flex items-center justify-center">
                  <img
                    src="/profile_pictures/mohit_raj.png"
                    alt="Mohit Raj"
                    className="object-cover w-full h-full"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1B4332] to-[#40916C] text-white flex items-center justify-center font-black uppercase text-base ring-4 ring-[#1B4332]/10 shadow-md">
                  {member.batch.mentorName.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight leading-none">{member.batch.mentorName}</h4>
                <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">Mentor</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-[10px] text-[#D4915C] italic font-black uppercase tracking-wider text-center">
              &quot;Build things that matter.&quot;
            </div>
          </div>

          {/* ── Dual Contact Options ── */}
          {(() => {
            const mentorEmail = member.batch?.mentorEmail || 'pm.enthuse@gmail.com';

            return (
              <div className="mt-5 relative z-10 space-y-2.5">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 text-center">Mentor Contact & Support</p>

                {/* ── Professional Mentor Email Option ── */}
                <a
                  href={`mailto:${mentorEmail}`}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group/email cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800 shrink-0 border border-emerald-100">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate group-hover/email:text-emerald-800 transition-colors">
                      {mentorEmail}
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    Email
                  </span>
                </a>

                {/* ── Official WhatsApp Group Option ── */}
                <a
                  href="https://chat.whatsapp.com/DUT7p9o4ib1Eqc6WD290wD"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Join Official WhatsApp Group"
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-[#1B4332] hover:bg-[#113325] text-white rounded-xl transition-all cursor-pointer border border-[#2D6A4F]/30 shadow-xs group/wa active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-white/10 rounded-lg text-white shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white truncate">
                      Join Cohort WhatsApp
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-200 uppercase tracking-wider shrink-0 bg-white/10 border border-white/15 px-2 py-0.5 rounded-md">
                    Group
                  </span>
                </a>
              </div>
            );
          })()}
        </div>
      </div>



      {/* Intelligent Dynamic Status Banner */}
      {(() => {
        const todayDay = new Date().getDay();
        const isWeekend = todayDay === 0 || todayDay === 6;
        const now = new Date();
        const activeAssignments = member.batch.assignments;
        const submissions = member.submissions;

        const overdueAssignments = activeAssignments.filter((a: any) => {
          const sub = submissions.find((s: any) => s.assignmentId === a.id);
          return new Date(a.deadline) < now && (!sub || (sub.status !== 'Approved' && sub.status !== 'Submitted' && sub.status !== 'Waiting for Review'));
        });

        const urgentAssignments = activeAssignments.filter((a: any) => {
          const sub = submissions.find((s: any) => s.assignmentId === a.id);
          const diffHours = (new Date(a.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
          return diffHours > 0 && diffHours <= 24 && (!sub || (sub.status !== 'Approved' && sub.status !== 'Submitted'));
        });

        const needsRevisionSub = submissions.find((s: any) => s.status === 'Needs Changes');
        const approvedSub = submissions.find((s: any) => s.status === 'Approved');

        let banner = {
          title: "Daily Bonus Claimed",
          desc: "Great job! Your attendance has been recorded and today's XP has been added to your profile.",
          cta: "View Progress",
          gradient: "from-emerald-600 to-teal-700",
          icon: "🎉",
          pulse: false,
          action: () => { }
        };

        if (isEligibleForCertificate) {
          banner = {
            title: "Congratulations! Your Certificate is Ready",
            desc: "You've successfully completed your internship requirements. Your certificate and evaluation letter are ready for download.",
            cta: "Download Certificate",
            gradient: "from-emerald-500 to-teal-600",
            icon: "🎓",
            pulse: true,
            action: handleGenerateCertificate
          };
        } else if (member.status === 'Completed') {
          banner = {
            title: "Internship Successfully Completed",
            desc: "Thank you for being part of SARTHI. We hope this experience helps you grow in your career.",
            cta: "View Final Report",
            gradient: "from-blue-600 to-amber-500",
            icon: "🏆",
            pulse: false,
            action: () => { }
          };
        } else if (overdueAssignments.length > 0) {
          const overdueTitle = toTitleCase(overdueAssignments[0].title);
          banner = {
            title: "Overdue Deliverable Action Required",
            desc: `"${overdueTitle}" has passed its scheduled deadline. Submit your work now to ensure mentor evaluation and earn your XP.`,
            cta: "View Overdue Deliverable →",
            gradient: "from-rose-900 via-rose-800 to-red-950",
            icon: "⚠️",
            pulse: true,
            action: () => {
              const activeBoard = document.getElementById('active-deliverables-board');
              if (activeBoard) {
                activeBoard.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 750, behavior: 'smooth' });
              }
            }
          };
        } else if (urgentAssignments.length > 0) {
          banner = {
            title: "Deadline Approaching",
            desc: `"${urgentAssignments[0].title}" is due in less than 24 hours. Submit on time to avoid XP penalties.`,
            cta: "Continue Assignment",
            gradient: "from-orange-500 to-red-600",
            icon: "⏰",
            pulse: true,
            action: () => router.push(`/dashboard/internship/assignments/${urgentAssignments[0].id}`)
          };
        } else if (needsRevisionSub) {
          const ass = activeAssignments.find((a: any) => a.id === needsRevisionSub.assignmentId);
          banner = {
            title: "Revision Requested",
            desc: `Your mentor requested changes for "${ass?.title || 'Assignment'}". Review the feedback and submit v2.`,
            cta: "Revise Submission",
            gradient: "from-amber-500 to-orange-600",
            icon: "🛠",
            pulse: false,
            action: () => router.push(`/dashboard/internship/assignments/${needsRevisionSub.assignmentId}`)
          };
        } else if (approvedSub) {
          const ass = activeAssignments.find((a: any) => a.id === approvedSub.assignmentId);
          const approvedTitle = ass?.title ? toTitleCase(ass.title) : 'Assignment';
          banner = {
            title: "Assignment Approved!",
            desc: `Congratulations! Your submission for "${approvedTitle}" has been approved and XP has been credited.`,
            gradient: "from-emerald-500 to-lime-600",
            icon: "🎉",
            pulse: false
          };
        } else if (!checkedInToday) {
          banner = {
            title: "Daily Check-in Available",
            desc: "Claim your daily attendance reward and earn +10 XP while maintaining your consistency streak.",
            cta: `Check In (+${settings.checkInXp} XP)`,
            gradient: "from-emerald-500 to-teal-500",
            icon: "✅",
            pulse: true,
            action: handleCheckIn
          };
        } else if (xpRemaining > 0 && xpRemaining < 100) {
          banner = {
            title: "You're Almost There!",
            desc: `Only ${xpRemaining} XP left to unlock Level ${member.currentLevel + 1}. Complete your next assignment to level up.`,
            cta: "Find Available Tasks",
            gradient: "from-purple-600 to-pink-500",
            icon: "⚡",
            pulse: false,
            action: () => { }
          };
        } else if (attendanceRecord.streak >= 7) {
          banner = {
            title: "Consistency Champion",
            desc: `Amazing! You're on a ${attendanceRecord.streak}-day streak. Keep checking in daily to earn bonus rewards.`,
            cta: "View Streak Status",
            gradient: "from-orange-500 to-red-500",
            icon: "🔥",
            pulse: false,
            action: () => { }
          };
        } else if (member.badges.length > 0) {
          const latestBadge = member.badges[member.badges.length - 1];
          banner = {
            title: "New Achievement Unlocked",
            desc: `You've earned the "${latestBadge.name}" badge. Keep building your achievement collection.`,
            cta: "View Achievements",
            gradient: "from-yellow-500 to-amber-600",
            icon: "🏅",
            pulse: false,
            action: () => { }
          };
        } else if (member.checkIns.length === 0 && submissions.length === 0) {
          banner = {
            title: "Welcome to Your Internship Journey!",
            desc: "You're officially part of SARTHI. Complete your first assignment and begin building your professional portfolio.",
            cta: "",
            gradient: "from-blue-500 to-cyan-500",
            icon: "👋",
            pulse: false,
            action: () => { }
          };
        } else if (isWeekend && overdueAssignments.length === 0) {
          banner = {
            title: "Recharge & Learn",
            desc: "You're caught up with your work. Use today to explore new technologies or refine your portfolio.",
            cta: "Explore Library",
            gradient: "from-teal-400 to-cyan-600",
            icon: "🌱",
            pulse: false,
            action: () => { }
          };
        } else if (activeAssignments.length === 0) {
          banner = {
            title: "You're All Caught Up!",
            desc: "Your mentor hasn't assigned any new work yet. New assignments will appear here automatically.",
            cta: "Refresh Console",
            gradient: "from-gray-500 to-slate-700",
            icon: "📭",
            pulse: false,
            action: () => router.refresh()
          };
        }

        // ── Special premium card for Daily Check-in ──
        if (!checkedInToday && banner.title === "Daily Check-in Available") {
          return (
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] border border-emerald-500/20 shadow-[0_24px_48px_rgba(6,78,59,0.35)]">
              {/* Dot-grid texture */}
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              {/* Glow orbs */}
              <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-8 w-40 h-40 rounded-full bg-teal-300/15 blur-2xl pointer-events-none" />
              {/* Subtle top line accent */}
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8">
                {/* Left: Icon + text */}
                <div className="flex items-center gap-5">
                  {/* Icon container */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.15)]">
                      <svg className="w-7 h-7 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {/* Green dot indicator */}
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#065f46] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  </div>

                  <div className="space-y-1.5">
                    {/* Status pill */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-[9px] font-black uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Available Now
                      </span>
                      {attendanceRecord.streak > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-400/15 border border-orange-400/20 text-orange-300 text-[9px] font-black uppercase tracking-widest">
                          🔥 {attendanceRecord.streak} Day Streak
                        </span>
                      )}
                    </div>
                    <h4 className="text-white font-black text-base sm:text-lg tracking-tight leading-tight">Daily Check-in</h4>
                    <p className="text-emerald-200/80 text-xs font-medium leading-relaxed max-w-md">
                      Claim your attendance reward and keep your consistency streak alive.
                    </p>
                  </div>
                </div>

                {/* Right: XP reward + CTA */}
                <div className="flex items-center gap-4 shrink-0 self-start md:self-center">
                  {/* XP reward display */}
                  <div className="text-center px-5 py-3 rounded-2xl bg-white/8 border border-white/10 backdrop-blur-sm">
                    <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-0.5">Reward</p>
                    <p className="text-white font-black text-xl leading-none">+{settings.checkInXp}</p>
                    <p className="text-emerald-300/80 text-[9px] font-bold uppercase tracking-wider">XP</p>
                  </div>
                  {/* CTA button */}
                  <button
                    onClick={handleCheckIn}
                    disabled={loadingCheckIn}
                    className="group flex items-center gap-2.5 px-7 py-4 bg-white hover:bg-emerald-50 active:scale-[0.97] text-emerald-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingCheckIn ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-emerald-800/30 border-t-emerald-800 animate-spin" />Claiming...</>
                    ) : (
                      <>Check In <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom error */}
              {checkInError && (
                <div className="relative z-10 px-8 pb-5 -mt-2">
                  <p className="text-red-300 text-[10px] font-semibold">{checkInError}</p>
                </div>
              )}
            </div>
          );
        }


        // ── General banner (all other states) ──
        return (
          <div className={`bg-gradient-to-r ${banner.gradient} text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden transition-all duration-500 border border-white/10 max-w-full`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="flex items-start md:items-center gap-5 relative z-10 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 shrink-0">
                {banner.icon}
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-extrabold uppercase tracking-widest text-[10px] sm:text-xs text-white/95">{banner.title}</h4>
                <p className="text-xs text-white/80 font-semibold leading-relaxed max-w-3xl font-outfit break-words">{banner.desc}</p>
              </div>
            </div>
            {banner.cta && (
              <button
                onClick={banner.action}
                className="shrink-0 px-8 py-4 bg-white hover:bg-white/90 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-black/5 self-start md:self-center font-outfit relative z-10"
              >
                {banner.cta}
              </button>
            )}
          </div>
        );
      })()}



      {/* 3. Microsoft Learn Style Cards (2 Cards) */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden space-y-4 hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-600" />
          <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 leading-tight uppercase">Completed Deliverables</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Track your approved assignments, submitted milestones, and verified task deliverables in your cohort.
            </p>
            <div className="pt-2 text-sm font-black text-blue-700 uppercase">
              {completedAssignmentsCount} Tasks Approved
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden space-y-4 hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-600" />
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 leading-tight uppercase">Total Experience & Level</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Earn XP rewards by completing tasks on time and advancing through scholar level ranks.
            </p>
            <div className="pt-2 text-sm font-black text-emerald-700 uppercase">
              {member.currentXp} XP • Level {member.currentLevel}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Dashboard Body - Full Width Deliverables Board */}
      <div className="w-full space-y-8">

        {/* Today's Task / Selected Focus Task Section */}
        {(() => {
          const assignedList = member?.batch?.assignments || [];
          const activeTask = assignedList.find((a: any) => a.id === selectedAssignmentId)
            || todayAssignment
            || assignedList[0];

          if (!activeTask) return null;

          return (
            <div className="bg-white text-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden">
              {/* Top glowing accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100/90 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200/80">
                    ⚡ {activeTask.id === todayAssignment?.id ? "Today's Assigned Task" : `Day ${activeTask.dayNumber || ''} Focus Task`}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 mt-3 font-outfit">
                    Day {activeTask.dayNumber} — {activeTask.campaign}
                  </h3>
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">
                    Phase: <span className="text-slate-900">{activeTask.phase}</span> | Role: <span className="text-slate-900">{activeTask.designation}</span>
                  </p>
                </div>
                <div className="text-left md:text-right bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black font-mono text-slate-500 block uppercase tracking-wider">
                    SCHEDULED DATE
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    {new Date(activeTask.scheduledDate || activeTask.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-8 space-y-6">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">What to Promote / Task</h4>
                    <p className="text-lg md:text-xl font-black text-slate-900 leading-snug">{activeTask.title}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">How to Promote / Exact Action</h4>
                    <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl">
                      <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                        {activeTask.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Asset / Deliverable</h5>
                      <p className="text-xs font-bold text-slate-900 mt-1">{activeTask.assetDeliverable || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-teal-900">Channel</h5>
                      <p className="text-xs font-bold text-slate-900 mt-1">{activeTask.channel || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-900">CTA</h5>
                      <p className="text-xs font-bold text-slate-900 mt-1">{activeTask.cta || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-purple-900">KPI</h5>
                      <p className="text-xs font-bold text-slate-900 mt-1">{activeTask.kpi || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1">Submission Evidence Requirement</h5>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">{activeTask.submissionEvidence || 'N/A'}</p>
                  </div>
                </div>

                {/* Right Col: Submission form */}
                <div className="md:col-span-4 bg-slate-50/90 border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Submit Your Work</h4>
                  {(() => {
                    const sub = member.submissions?.find((s: any) => s.assignmentId === activeTask.id);
                    const status = sub?.status || 'Assigned';
                    
                    if (status === 'Approved') {
                      return (
                        <div className="space-y-3 text-center py-4">
                          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                          <p className="text-xs font-black text-emerald-700 uppercase">TASK APPROVED 🎉</p>
                          <p className="text-[11px] text-slate-600 font-medium">Great job! Your submission was reviewed and verified.</p>
                          {sub?.mentorFeedback && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left mt-2">
                              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block mb-1">Mentor Feedback</span>
                              <p className="text-[11px] text-slate-800 italic font-medium">"{sub.mentorFeedback}"</p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isAwaiting = status === 'Waiting for Review' || status === 'Resubmitted';

                    return (
                      <TodaySubmissionForm 
                        memberId={member.id} 
                        assignmentId={activeTask.id} 
                        initialSubmission={sub}
                        isAwaiting={isAwaiting}
                        onSuccess={(updatedSub: any) => {
                          setMember((prev: any) => {
                            const updatedSubs = prev.submissions ? [...prev.submissions] : [];
                            const idx = updatedSubs.findIndex((s: any) => s.assignmentId === activeTask.id);
                            if (idx >= 0) {
                              updatedSubs[idx] = { ...updatedSubs[idx], ...updatedSub };
                            } else {
                              updatedSubs.push(updatedSub);
                            }
                            return { ...prev, submissions: updatedSubs };
                          });
                          router.refresh();
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Deliverables Board */}
        {(() => {
          const assignedAssignments = member.batch?.assignments || [];
          const pendingAssignments = assignedAssignments
            .filter((ass: any) => {
              const sub = member.submissions?.find((s: any) => s.assignmentId === ass.id);
              return !sub || sub.status !== 'Approved';
            })
            .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

          const completedAssignments = assignedAssignments
            .filter((ass: any) => {
              const sub = member.submissions?.find((s: any) => s.assignmentId === ass.id);
              return sub && sub.status === 'Approved';
            });

          const renderAssignmentCard = (ass: any) => {
            const submission = ass.submissions?.[0] || member.submissions?.find((s: any) => s.assignmentId === ass.id);
            const rawStatus = submission?.status || 'Assigned';
            const isOverdue = new Date(ass.deadline).getTime() < Date.now() && rawStatus !== 'Approved';

            let statusBadgeBg = 'bg-slate-50 text-slate-700 border-slate-200';
            let statusLabel = 'NOT STARTED';
            let borderAccent = 'border-l-2 border-l-slate-300';

            if (rawStatus === 'Approved') {
              statusBadgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              statusLabel = 'APPROVED ✅';
              borderAccent = 'border-l-2 border-l-emerald-500';
            } else if (rawStatus === 'Needs Changes') {
              statusBadgeBg = 'bg-amber-50 text-amber-900 border-amber-200';
              statusLabel = 'NEEDS REVISION ⚠️';
              borderAccent = 'border-l-2 border-l-amber-500';
            } else if (rawStatus === 'Rejected' || isOverdue) {
              statusBadgeBg = 'bg-rose-50 text-rose-900 border-rose-200';
              statusLabel = isOverdue ? 'OVERDUE 🔴' : 'REVISION REQUESTED ❌';
              borderAccent = 'border-l-2 border-l-rose-500';
            } else if (rawStatus === 'Submitted' || rawStatus === 'Waiting for Review' || rawStatus === 'Resubmitted') {
              statusBadgeBg = 'bg-indigo-50 text-indigo-800 border-indigo-200';
              statusLabel = 'AWAITING REVIEW ⏳';
              borderAccent = 'border-l-2 border-l-indigo-500';
            }

            let actionText = 'Continue Task →';
            if (rawStatus === 'Approved') actionText = 'Review Feedback →';
            else if (rawStatus === 'Needs Changes') actionText = 'Submit Version 2 →';
            else if (rawStatus === 'Rejected') actionText = 'Re-Submit →';
            else if (rawStatus === 'Assigned') actionText = 'Submit Solution →';

            return (
              <div key={ass.id} className={cn("p-5 bg-white border border-slate-200/80 rounded-2xl transition-all hover:shadow-md space-y-3", borderAccent)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border w-fit ${statusBadgeBg}`}>
                    {statusLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    DEADLINE: {new Date(ass.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">{toTitleCase(ass.title)}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase text-slate-400 mt-1">
                    <span>{ass.category}</span>
                    <span>•</span>
                    <span>{ass.difficulty}</span>
                    <span>•</span>
                    <span className="text-amber-800 font-black">{ass.xpReward} XP</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {ass.description ? ass.description.replace(/\\n/g, ' ').replace(/[#*`_~]/g, '').replace(/---/g, '').trim() : ''}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAssignmentId(ass.id);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Focus Task
                  </button>
                  <Link
                    href={`/dashboard/internship/assignments/${ass.id}`}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{actionText}</span>
                  </Link>
                </div>
              </div>
            );
          };

          const filteredPending = pendingAssignments.filter((ass: any) => {
            const sub = member.submissions?.find((s: any) => s.assignmentId === ass.id);
            const rawStatus = sub?.status || 'Assigned';
            const isOverdue = new Date(ass.deadline).getTime() < Date.now() && rawStatus !== 'Approved';

            if (deliverableStatusFilter === 'PENDING') return !isOverdue;
            if (deliverableStatusFilter === 'OVERDUE') return isOverdue;
            return true;
          });

          const showPending = deliverableStatusFilter !== 'COMPLETED';
          const showCompleted = deliverableStatusFilter === 'ALL' || deliverableStatusFilter === 'COMPLETED';

          return (
            <div id="active-deliverables-board" className="bg-white rounded-[2rem] border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6 scroll-mt-24">

              {/* Header with Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-[#1B4332]">
                    Active Deliverables Board
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Track your pending assignments, deadlines, and submission status
                  </p>
                </div>

                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={deliverableStatusFilter}
                    onChange={(e) => setDeliverableStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-700 focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="ALL">All Status ({assignedAssignments.length})</option>
                    <option value="PENDING">Pending Tasks ({pendingAssignments.length})</option>
                    <option value="COMPLETED">Done Tasks ({completedAssignments.length})</option>
                  </select>
                </div>
              </div>

              {/* Assignments List */}
              <div className="space-y-6">
                {/* Pending & Active Tasks (2 Cards Per Row) */}
                {showPending && (
                  filteredPending.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredPending.map(renderAssignmentCard)}
                    </div>
                  ) : (
                    <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center space-y-1">
                      <p className="text-xs font-black text-emerald-800 uppercase">🎉 All active tasks completed!</p>
                      <p className="text-[10px] text-emerald-600 font-medium">You are all caught up for this period.</p>
                    </div>
                  )
                )}

                {/* Completed Tasks */}
                {showCompleted && completedAssignments.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div
                      onClick={() => setExpandedCompletedBoard(!expandedCompletedBoard)}
                      className="flex items-center justify-between cursor-pointer select-none p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Completed Deliverables ({completedAssignments.length})
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                        {expandedCompletedBoard ? 'Hide Done' : 'Show Done'}
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expandedCompletedBoard && "rotate-180")} />
                      </span>
                    </div>

                    {expandedCompletedBoard && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        {completedAssignments.map(renderAssignmentCard)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  </DashboardRecoveryGuard>
  );
}

function TodaySubmissionForm({ memberId, assignmentId, initialSubmission, isAwaiting, onSuccess }: { memberId: string; assignmentId: string; initialSubmission: any; isAwaiting: boolean; onSuccess: (sub: any) => void }) {
  const [liveUrl, setLiveUrl] = useState(initialSubmission?.liveDemoProjectLink || '');
  const [comments, setComments] = useState(initialSubmission?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveUrl) return alert('Please enter your submission link/proof URL');
    setSubmitting(true);
    try {
      const res = await fetch('/api/internship/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          assignmentId,
          liveUrl,
          comments
        })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
      } else {
        alert(data.error || 'Failed to submit task');
      }
    } catch (err) {
      alert('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAwaiting) {
    return (
      <div className="space-y-3 text-center py-4">
        <Clock className="w-12 h-12 text-indigo-600 mx-auto animate-pulse" />
        <p className="text-xs font-black text-indigo-700 uppercase tracking-wider">AWAITING REVIEW ⏳</p>
        <p className="text-[11px] text-slate-600 font-medium">Your solution has been submitted. The mentor team is reviewing it.</p>
        <div className="text-left bg-white border border-slate-200 p-3 rounded-xl space-y-1 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Submitted Link:</span>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline break-all block font-semibold">{liveUrl}</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-slate-800">
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">Live Link / Proof Link</label>
        <input 
          type="url" 
          placeholder="https://example.com/your-submission"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 focus:outline-none placeholder-slate-400 font-medium shadow-xs"
          required
        />
      </div>
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">Comments / Notes</label>
        <textarea 
          rows={3}
          placeholder="Add any notes or context about your submission..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 focus:outline-none placeholder-slate-400 resize-none font-medium shadow-xs"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>{submitting ? 'Submitting...' : 'Submit Solution'}</span>
      </button>
    </form>
  );
}
