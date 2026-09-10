'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Mail, Send, Loader2, Users, Check, X, Plus,
  Search, Globe, Inbox, Sparkles, ChevronDown,
  FileText, GraduationCap, Bell, Award, AtSign, Zap,
  Clipboard, UserPlus, Trash2, Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import StatCard from '@/components/teacher/dashboard/StatCard';
import { generateSchoolProposalHtml } from '@/lib/email/templates/school-proposal';

/* ─── Types ─────────────────────────────────────────────── */
interface StudentInfo {
  id: string;
  student: { id: string; name: string | null; email: string };
  course: { title: string };
}
interface EmailPortalClientProps { students: StudentInfo[]; }
type TargetType = 'my_students' | 'all_platform' | 'custom';
type MainTab = 'Compose' | 'Recipients';

/* ─── Templates ─────────────────────────────────────────── */
interface EmailTemplate {
  id: string; icon: React.ElementType; name: string; badge: string;
  subject: string; body: string; highlight?: string; actionLabel?: string; actionUrl?: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'school_proposal',
    icon: Building2,
    name: 'School Proposal',
    badge: 'SCHOOL PARTNERSHIP PROPOSAL',
    subject: "Preparing Students for Tomorrow's Digital World — SARTHI Partnership Proposal",
    body: `Respected Principal,

Dear Sir/Madam,

Warm greetings from Team SARTHI.

We appreciate your commitment to delivering progressive educational pathways, student-centric academic growth, and nurturing critical skills in every student.

Why This Matters:
AI is rapidly reshaping careers across all industries. Schools that introduce students to coding, computational thinking, and digital creativity today are helping them build the confidence and skills they will need for tomorrow's opportunities.

With this mission, we present SARTHI Juniors—a comprehensive Made-in-India technology education platform designed to help schools introduce structured AI, Coding, Digital Literacy, and emerging technologies through an engaging, project-based learning ecosystem.

Key Program Highlights:
• Target Segments: Classes I–XII
• Broad Curriculum: 6 Core Technology Tracks
• Implementation: Online + On-Campus Dedicated Support

Core Learning Tracks:
• 🧠 AI Literacy: Concepts of machine learning, logic flows, and prompt design.
• 💻 Coding: Foundational programming, block-based and syntax logic.
• 🌐 Web Development: Building structures, websites, and responsive layouts.
• 📱 App Development: Constructing interactive mobile application mockups & tools.
• 🎯 Real Projects: Applying digital techniques to solve tangible real-life challenges.
• 🏆 Digital Portfolio & Certificates: Earning verified credentials and compiling creative work portfolios.

Benefits for Your School Community:

For Students:
✔ Interactive AI literacy, coding pathways, and logic modules.
✔ Real-world website, software, and application projects.
✔ Cumulative digital portfolio and certificates to showcase achievements.

For Teachers:
✔ Comprehensive ready-made curriculum with detailed lesson plans.
✔ Interactive progress tracking dashboard with auto-evaluations.
✔ Significantly reduced preparation workloads with continuous support.

For School Leadership:
✔ Future-ready tech ecosystem to complement existing academic systems.
✔ Coding competitions, AI bootcamps, and digital workshops on campus.
✔ Dedicated implementation, onboarding, and technical support from Team SARTHI.

Flexible Engagement Models:
1. 🟢 Integrated School Program: Blended directly into school computer classes with full curriculum & dashboard support.
2. 🔵 After-School Enrichment: Optional program after school hours, fully managed online with zero operational effort to the school.

Simple Implementation Timeline:
Step 1: Discovery Meeting ➔ Step 2: School Registration ➔ Step 3: Platform Setup ➔ Step 4: Learning Begins

We would be honored to schedule a 15-Minute School Presentation or virtual demonstration for your esteemed institution.`,
    highlight: 'SARTHI — Structured AI, Coding & Technology Education that complements your existing academic excellence.',
    actionLabel: 'Contact Us',
    actionUrl: 'https://sarthi-woad.vercel.app/contact',
  },
  {
    id: 'certificate', icon: Award, name: 'Certificate Update', badge: 'CERTIFICATE UPDATE',
    subject: 'Your Updated Certificate is Ready',
    body: `Hello,\n\nWe have an updated certificate available for you.\n\nPlease log in to your dashboard and download the latest version from the Achievements section at your convenience.`,
    highlight: 'Thank you for being a part of the SARTHI community. We sincerely appreciate your dedication to learning, growth, and continuous improvement.',
    actionLabel: 'Access Dashboard', actionUrl: 'https://sarthi-woad.vercel.app/dashboard',
  },
  {
    id: 'announcement', icon: Bell, name: 'General Announcement', badge: 'ANNOUNCEMENT',
    subject: 'Important Update from SARTHI',
    body: `Hello,\n\nWe have an important update to share with you.\n\nPlease take a moment to read through this message carefully.`,
    highlight: 'We appreciate your continued support and engagement with the SARTHI platform.',
    actionLabel: 'Visit Dashboard', actionUrl: 'https://sarthi-woad.vercel.app/dashboard',
  },
  {
    id: 'course', icon: GraduationCap, name: 'New Course Launch', badge: 'NEW COURSE',
    subject: 'A New Course is Live — Enroll Now!',
    body: `Hello,\n\nWe're thrilled to announce a brand new course is now available on SARTHI.\n\nLog in to your dashboard and explore the new content now.`,
    highlight: 'This course is part of our commitment to bringing you world-class, industry-relevant education that transforms careers.',
    actionLabel: 'Browse Courses', actionUrl: 'https://sarthi-woad.vercel.app/courses',
  },
  { id: 'custom', icon: FileText, name: 'Custom Message', badge: '', subject: '', body: '', highlight: '', actionLabel: '', actionUrl: '' },
];

/* ─── Preview HTML ───────────────────────────────────────── */
function generatePreviewHtml(o: { badge: string; heading: string; body: string; highlight: string; actionLabel: string; actionUrl: string; }): string {
  let parsedBody = o.body || '';
  parsedBody = parsedBody.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  parsedBody = parsedBody.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  const lines = o.body
    ? parsedBody
        .split(/\r?\n\s*\r?\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => {
          const htmlContent = p.replace(/\r?\n/g, '<br />');
          return `<p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#4b5563;">${htmlContent}</p>`;
        })
        .join('')
    : `<p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#cbd5e1;font-style:italic;">Your message will appear here…</p>`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f8fbf8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(34,87,60,0.10);">
<tr><td style="padding:36px 30px;text-align:center;background:linear-gradient(180deg,#fff,#f7fcf8);border-bottom:1px solid #eef7f0;">
<img src="https://sarthi-woad.vercel.app/sarthi-logo.png" alt="SARTHI" width="60" style="display:block;margin:0 auto 12px;">
<h1 style="margin:0;font-size:26px;font-weight:700;color:#1f2937;">SARTHI</h1>
<p style="margin:6px 0 0;font-size:13px;color:#64748b;">Empowering Future Innovators</p>
</td></tr>
<tr><td style="padding:44px 40px 36px;">
${o.badge ? `<div style="display:inline-block;padding:6px 14px;background:#eefbf2;color:#2f855a;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:20px;letter-spacing:0.05em;text-transform:uppercase;">${o.badge}</div>` : ''}
<h2 style="margin:0 0 18px;font-size:${o.heading ? '28' : '22'}px;line-height:1.2;font-weight:700;color:${o.heading ? '#1f2937' : '#cbd5e1'};">${o.heading || 'Your email subject will appear here…'}</h2>
${lines}
${o.highlight ? `<div style="background:linear-gradient(135deg,#f8fcf9,#eefbf2);border:1px solid #d8f3dc;border-radius:14px;padding:20px;margin:24px 0;"><p style="margin:0;font-size:14px;line-height:1.9;color:#4b5563;">${o.highlight}</p></div>` : ''}
${o.actionLabel ? `<div style="text-align:center;margin:32px 0;"><a href="${o.actionUrl || '#'}" style="display:inline-block;background:#57b26a;color:#fff;text-decoration:none;padding:13px 30px;border-radius:12px;font-size:15px;font-weight:600;">${o.actionLabel}</a></div>` : ''}
<p style="margin-top:32px;font-size:15px;line-height:1.8;color:#64748b;">Warm regards,</p>
<p style="margin-top:6px;font-size:15px;font-weight:700;color:#1f2937;">SARTHI Team</p>
</td></tr>
<tr><td style="padding:24px;text-align:center;background:#fafdfb;border-top:1px solid #eef7f0;">
<p style="margin:0 0 6px;font-size:13px;color:#64748b;">Building Skills. Creating Opportunities. Empowering Futures.</p>
<p style="margin:0;font-size:12px;color:#94a3b8;">© 2026 SARTHI. All Rights Reserved.</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

/* ─── Audience Card ─────────────────────────────────────── */
function AudienceCard({ icon: Icon, title, subtitle, count, color, active, onClick }: {
  icon: React.ElementType; title: string; subtitle: string;
  count: string | number; color: 'orange' | 'emerald' | 'blue';
  active: boolean; onClick: () => void;
}) {
  const c = {
    orange: { ring: 'ring-orange-400 border-orange-300', icon: 'bg-orange-50 border-orange-100 text-orange-600', check: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    emerald: { ring: 'ring-emerald-400 border-emerald-300', icon: 'bg-emerald-50 border-emerald-100 text-emerald-600', check: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    blue: { ring: 'ring-blue-400 border-blue-300', icon: 'bg-blue-50 border-blue-100 text-blue-600', check: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  }[color];

  return (
    <button type="button" onClick={onClick}
      className={cn("relative flex flex-col gap-3 p-4 rounded-2xl border-2 text-left w-full transition-all duration-200 hover:shadow-md",
        active ? `${c.ring} ring-2 bg-white shadow-lg` : "border-slate-150 bg-white hover:border-slate-300"
      )}>
      {active && (
        <div className={cn("absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center", c.check)}>
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center", c.icon)}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-tight">{subtitle}</p>
      </div>
      <span className={cn("text-[11px] font-black px-2.5 py-1 rounded-full self-start", c.badge)}>
        {count} recipients
      </span>
    </button>
  );
}

/* ─── Custom Recipients Popup ───────────────────────────── */
function CustomRecipientsModal({
  open, onClose, students, selectedEmails, customEmails,
  onToggleStudent, onSetCustomEmails,
}: {
  open: boolean; onClose: () => void;
  students: StudentInfo[]; selectedEmails: string[];
  customEmails: string[]; onToggleStudent: (email: string) => void;
  onSetCustomEmails: (emails: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [tab, setTab] = useState<'students' | 'bulk'>('students');
  const backdropRef = useRef<HTMLDivElement>(null);

  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>();
    return students.filter(s => { if (seen.has(s.student.email)) return false; seen.add(s.student.email); return true; });
  }, [students]);

  const filtered = useMemo(() =>
    uniqueStudents.filter(s =>
      (s.student.name || '').toLowerCase().includes(search.toLowerCase()) ||
      s.student.email.toLowerCase().includes(search.toLowerCase())
    ), [uniqueStudents, search]);

  const parseBulkEmails = () => {
    const parsed = bulkInput
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    const newOnes = parsed.filter(e => !customEmails.includes(e));
    if (newOnes.length === 0) { toast.error('No new valid emails found'); return; }
    onSetCustomEmails([...customEmails, ...newOnes]);
    setBulkInput('');
    toast.success(`Added ${newOnes.length} email(s)`);
  };

  const totalSelected = selectedEmails.length + customEmails.length;

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-[28px] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-4 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">CUSTOM RECIPIENTS</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Select Recipients
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full">
              {totalSelected} selected
            </span>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X className="w-4.5 h-4.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 px-8 pt-5 pb-0">
          {([
            { id: 'students', label: 'From Students', icon: Users },
            { id: 'bulk', label: 'Paste / Bulk Add', icon: Clipboard },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                tab === t.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              )}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">

          {/* Students Tab */}
          {tab === 'students' && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by name or email…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 outline-none focus:border-blue-400 transition-all" />
              </div>

              {uniqueStudents.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No students enrolled yet</p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <button
                    onClick={() => {
                      const allEmails = uniqueStudents.map(s => s.student.email);
                      const allSelected = allEmails.every(e => selectedEmails.includes(e));
                      allEmails.forEach(email => {
                        if (allSelected ? selectedEmails.includes(email) : !selectedEmails.includes(email)) {
                          onToggleStudent(email);
                        }
                      });
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all mb-3"
                  >
                    <span className="text-slate-700">Select All Students ({uniqueStudents.length})</span>
                    <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                      uniqueStudents.every(s => selectedEmails.includes(s.student.email))
                        ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300"
                    )}>
                      {uniqueStudents.every(s => selectedEmails.includes(s.student.email)) && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {filtered.map(s => {
                    const checked = selectedEmails.includes(s.student.email);
                    return (
                      <div key={s.id} onClick={() => onToggleStudent(s.student.email)}
                        className={cn("flex items-center gap-4 px-4 py-3.5 rounded-xl border cursor-pointer transition-all",
                          checked ? "bg-blue-50/60 border-blue-100" : "bg-white border-slate-100 hover:bg-slate-50"
                        )}>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-black text-blue-600 shrink-0">
                          {(s.student.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{s.student.name || 'Anonymous'}</p>
                          <p className="text-[11px] text-slate-400 font-bold truncate">{s.student.email}</p>
                        </div>
                        <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                          checked ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300"
                        )}>
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && search && (
                    <p className="text-center py-8 text-sm font-bold text-slate-400">No results for &quot;{search}&quot;</p>
                  )}
                </>
              )}
            </>
          )}

          {/* Bulk Tab */}
          {tab === 'bulk' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Paste Emails (one per line, or comma/semicolon separated)
                </label>
                <textarea
                  rows={8}
                  placeholder={`example1@gmail.com\nexample2@yahoo.com\nor: a@b.com, c@d.com, e@f.com`}
                  value={bulkInput}
                  onChange={e => setBulkInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl p-4 text-sm font-mono text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none"
                />
                <button onClick={parseBulkEmails}
                  className="mt-3 w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                  <UserPlus className="w-4 h-4" />
                  Parse & Add Emails
                </button>
              </div>

              {/* Current custom emails */}
              {customEmails.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Added Custom Emails ({customEmails.length})
                    </label>
                    <button onClick={() => onSetCustomEmails([])}
                      className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors">
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {customEmails.map(email => (
                      <span key={email} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700 px-3 py-1.5 rounded-full">
                        {email}
                        <button onClick={() => onSetCustomEmails(customEmails.filter(e => e !== email))}
                          className="hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400">
            {selectedEmails.length} student(s) + {customEmails.length} external = <span className="text-slate-700 font-black">{totalSelected} total</span>
          </p>
          <button onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
            <Check className="w-4 h-4" />
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function EmailPortalClient({ students }: EmailPortalClientProps) {
  const [activeTab, setActiveTab] = useState<MainTab>('Compose');
  const [targetType, setTargetType] = useState<TargetType>('my_students');
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>([]);
  const [customEmails, setCustomEmails] = useState<string[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [badge, setBadge] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [schoolName, setSchoolName] = useState('Valley View School');
  const [principalName, setPrincipalName] = useState('');

  const [sending, setSending] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [platformCount, setPlatformCount] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch('/api/teacher/students/email')
      .then(r => r.json())
      .then(d => { if (d?.data?.count) setPlatformCount(d.data.count); })
      .catch(() => {});
  }, []);

  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>();
    return students.filter(s => { if (seen.has(s.student.email)) return false; seen.add(s.student.email); return true; });
  }, [students]);

  const filteredStudents = useMemo(() =>
    uniqueStudents.filter(s =>
      (s.student.name || '').toLowerCase().includes(directorySearch.toLowerCase()) ||
      s.student.email.toLowerCase().includes(directorySearch.toLowerCase())
    ), [uniqueStudents, directorySearch]);

  const customRecipientCount = selectedStudentEmails.length + customEmails.length;

  const displayCount = targetType === 'all_platform'
    ? (platformCount != null ? platformCount.toLocaleString() : '…')
    : targetType === 'my_students'
      ? String(uniqueStudents.length)
      : String(customRecipientCount);

  const applyTemplate = useCallback((tpl: EmailTemplate) => {
    setSelectedTemplate(tpl.id);
    setBadge(tpl.badge);
    if (tpl.id === 'school_proposal') {
      const sName = schoolName.trim() || 'Valley View School';
      setSubject(`Preparing ${sName} Students for Tomorrow's Digital World — ${sName} Partnership Proposal`);
    } else {
      setSubject(tpl.subject);
    }
    setMessage(tpl.body);
    setHighlight(tpl.highlight || ''); setActionLabel(tpl.actionLabel || ''); setActionUrl(tpl.actionUrl || '');
    if (tpl.id !== 'custom') setShowAdvanced(true);
    setTemplateDropdownOpen(false);
  }, [schoolName]);

  const handleToggleStudent = useCallback((email: string) => {
    setSelectedStudentEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  }, []);

  const handleSend = async () => {
    if (!subject.trim()) { toast.error('Please add an email subject'); return; }
    if (!message.trim()) { toast.error('Please write a message'); return; }
    if (targetType === 'custom' && customRecipientCount === 0) {
      toast.error('Click the Custom card to select recipients'); return;
    }

    setSending(true);
    const countLabel = targetType === 'all_platform'
      ? `all ${platformCount ?? ''} platform students`
      : `${displayCount} recipient(s)`;
    const loadingToast = toast.loading(`Dispatching to ${countLabel}…`);

    try {
      const payload: Record<string, any> = {
        subject: subject.trim(), message: message.trim(),
        badge: badge.trim() || undefined,
        highlight: highlight.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        schoolName: schoolName.trim() || undefined,
        principalName: principalName.trim() || undefined,
        targetType,
      };

      if (targetType === 'my_students') {
        payload.emails = Array.from(new Set(uniqueStudents.map(s => s.student.email)));
      } else if (targetType === 'custom') {
        payload.emails = Array.from(new Set([...selectedStudentEmails, ...customEmails]));
      }

      const res = await fetch('/api/teacher/students/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('[Email] API response:', data);

      if (res.ok) {
        toast.success(data.message || `Successfully dispatched!`, { id: loadingToast, duration: 5000 });
        setSubject(''); setMessage(''); setBadge(''); setHighlight('');
        setActionLabel(''); setActionUrl('');
        setSelectedStudentEmails([]); setCustomEmails([]);
        setSelectedTemplate('custom');
      } else {
        toast.error(data.error || `Failed (${res.status})`, { id: loadingToast });
      }
    } catch (err) {
      console.error('[Email] Send error:', err);
      toast.error('Network error — check console', { id: loadingToast });
    } finally {
      setSending(false);
    }
  };

  const previewHtml = useMemo(() => {
    if (selectedTemplate === 'school_proposal' || badge === 'SCHOOL PARTNERSHIP PROPOSAL' || badge === 'SCHOOL PROPOSAL') {
      return generateSchoolProposalHtml({
        schoolName: schoolName.trim() || 'School Name',
        principalName: principalName.trim() || undefined,
      });
    }
    return generatePreviewHtml({
      badge, heading: subject, body: message, highlight, actionLabel, actionUrl,
    });
  }, [selectedTemplate, badge, subject, message, highlight, actionLabel, actionUrl, schoolName, principalName]);

  const currentTemplate = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate) || EMAIL_TEMPLATES[EMAIL_TEMPLATES.length - 1];

  return (
    <>
      {/* Custom Modal */}
      <CustomRecipientsModal
        open={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        students={students}
        selectedEmails={selectedStudentEmails}
        customEmails={customEmails}
        onToggleStudent={handleToggleStudent}
        onSetCustomEmails={setCustomEmails}
      />

      <div className="min-h-screen bg-[#F8FAFC] pb-20">

        {/* ─── Header ─────────────────────────────────────── */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1 w-4 bg-orange-500 rounded-full" />
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">COMMUNITY COMMUNICATION</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  EMAIL <span className="text-orange-500">PORTAL</span>
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-3">
                  Dispatch branded announcements to your learners or every SARTHI student.
                </p>
              </div>
              <button onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                  : <><Send className="w-4 h-4" />Send Email ({displayCount})</>}
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard title="My Students" value={uniqueStudents.length} change={4} icon={Users} color="blue" />
              <StatCard title="Platform Users" value={platformCount ?? '…'} icon={Globe} color="emerald" />
              <StatCard title="Custom Selected" value={customRecipientCount} icon={AtSign} color="amber" />
              <StatCard title="Ready to Send" value={displayCount} icon={Inbox} color="rose" />
            </div>
          </div>
        </header>

        {/* ─── Main ───────────────────────────────────────── */}
        <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-8 md:mt-10">

          {/* Tab switcher */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex bg-white rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-100">
              {(['Compose', 'Recipients'] as MainTab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn("px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── COMPOSE ── */}
          {activeTab === 'Compose' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

              {/* Left: Form — 5 cols */}
              <div className="xl:col-span-5 space-y-5">

                {/* Audience Selector */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Who are you emailing?</p>
                  <div className="grid grid-cols-3 gap-3">
                    <AudienceCard
                      icon={Users} color="orange" title="My Students" subtitle="Your enrolled learners"
                      count={uniqueStudents.length} active={targetType === 'my_students'}
                      onClick={() => setTargetType('my_students')}
                    />
                    <AudienceCard
                      icon={Globe} color="emerald" title="All SARTHI" subtitle="Entire platform"
                      count={platformCount != null ? platformCount.toLocaleString() : '…'}
                      active={targetType === 'all_platform'}
                      onClick={() => setTargetType('all_platform')}
                    />
                    <AudienceCard
                      icon={AtSign} color="blue" title="Custom" subtitle="Click to select"
                      count={customRecipientCount} active={targetType === 'custom'}
                      onClick={() => {
                        setTargetType('custom');
                        setShowCustomModal(true);
                      }}
                    />
                  </div>

                  {/* Custom selected summary */}
                  {targetType === 'custom' && customRecipientCount > 0 && (
                    <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <span className="text-xs font-black text-blue-700">
                        {selectedStudentEmails.length} student(s) + {customEmails.length} external selected
                      </span>
                      <button onClick={() => setShowCustomModal(true)}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">
                        Edit →
                      </button>
                    </div>
                  )}

                  {targetType === 'custom' && customRecipientCount === 0 && (
                    <button onClick={() => setShowCustomModal(true)}
                      className="mt-3 w-full border-2 border-dashed border-blue-200 rounded-xl py-3 text-xs font-black text-blue-500 hover:border-blue-400 hover:text-blue-700 transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Click to Add Recipients
                    </button>
                  )}

                  {targetType === 'all_platform' && (
                    <div className="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-bold text-emerald-700">
                        This will email <span className="font-black">{platformCount?.toLocaleString() ?? '…'} active students</span> across the entire platform. Use responsibly.
                      </p>
                    </div>
                  )}
                </div>

                {/* Template + Compose Form */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)] space-y-4">
                  {/* Template Picker */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Template</p>
                    <div className="relative">
                      <button type="button" onClick={() => setTemplateDropdownOpen(p => !p)}
                        className="w-full flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 hover:border-slate-400 transition-all">
                        <span className="flex items-center gap-2">
                          <currentTemplate.icon className="w-4 h-4 text-orange-500" />
                          {currentTemplate.name}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", templateDropdownOpen && "rotate-180")} />
                      </button>
                      {templateDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                          {EMAIL_TEMPLATES.map(tpl => (
                            <button key={tpl.id} type="button" onClick={() => applyTemplate(tpl)}
                              className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-slate-50",
                                selectedTemplate === tpl.id && "bg-orange-50")}>
                              <tpl.icon className={cn("w-4 h-4", selectedTemplate === tpl.id ? "text-orange-500" : "text-slate-400")} />
                              <div className="flex-1">
                                <p className="text-xs font-black text-slate-800">{tpl.name}</p>
                                {tpl.badge && <p className="text-[10px] text-slate-400 uppercase tracking-wider">{tpl.badge}</p>}
                              </div>
                              {selectedTemplate === tpl.id && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedTemplate === 'school_proposal' || badge.includes('SCHOOL')) && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#174F3A]" />
                        <span className="text-[11px] font-black text-[#174F3A] uppercase tracking-wider">School Personalization</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Target School Name *</label>
                        <input type="text" placeholder="e.g. Valley View School, Open Minds Bhagalpur School…"
                          value={schoolName} onChange={e => {
                            const val = e.target.value;
                            setSchoolName(val);
                            if (val.trim()) {
                              setSubject(`Preparing ${val.trim()} Students for Tomorrow's Digital World — ${val.trim()} Partnership Proposal`);
                            }
                          }}
                          className="w-full bg-white border border-emerald-300 focus:border-emerald-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Principal / Leader Name (Optional)</label>
                        <input type="text" placeholder="e.g. Dr. A. K. Sharma…"
                          value={principalName} onChange={e => setPrincipalName(e.target.value)}
                          className="w-full bg-white border border-emerald-300 focus:border-emerald-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Badge Pill (optional)</label>
                    <input type="text" placeholder="e.g. CERTIFICATE UPDATE…"
                      value={badge} onChange={e => setBadge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-slate-900 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Subject / Heading *</label>
                    <input type="text" required placeholder="Enter email heading…"
                      value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-slate-900 focus:bg-white rounded-xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Message Body *</label>
                    <textarea required rows={8} placeholder="Write your message here…"
                      value={message} onChange={e => setMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 focus:border-slate-900 focus:bg-white rounded-xl p-5 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none" />
                  </div>

                  <button type="button" onClick={() => setShowAdvanced(p => !p)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced (highlight box + CTA button)
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Highlight Box (optional)</label>
                        <textarea rows={3} placeholder="Green callout box text…"
                          value={highlight} onChange={e => setHighlight(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/80 focus:border-slate-900 focus:bg-white rounded-xl p-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Button Label</label>
                          <input type="text" placeholder="e.g. Access Dashboard"
                            value={actionLabel} onChange={e => setActionLabel(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/80 focus:border-slate-900 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Button URL</label>
                          <input type="url" placeholder="https://sarthi-woad.vercel.app/…"
                            value={actionUrl} onChange={e => setActionUrl(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/80 focus:border-slate-900 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button type="button" onClick={handleSend}
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                  {sending
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Sending Broadcast…</>
                    : <><Send className="w-4 h-4" />Send Email to {displayCount} {targetType === 'all_platform' ? 'Students' : 'Recipient(s)'}</>}
                </button>
              </div>

              {/* Right: Live Preview — 7 cols */}
              <div className="xl:col-span-7">
                <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]" style={{ height: '720px' }}>
                  <iframe srcDoc={previewHtml} className="w-full h-full border-0" sandbox="allow-same-origin" title="Email Preview" />
                </div>
              </div>
            </div>
          )}

          {/* ── RECIPIENTS TAB ── */}
          {activeTab === 'Recipients' && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="relative min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search student directory…"
                    value={directorySearch} onChange={e => setDirectorySearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-[0_2px_10px_rgba(15,23,42,0.02)]" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredStudents.length} of {uniqueStudents.length} students</p>
              </div>

              {uniqueStudents.length > 0 ? (
                filteredStudents.map(s => {
                  const checked = selectedStudentEmails.includes(s.student.email);
                  return (
                    <div key={s.id} onClick={() => { setTargetType('custom'); handleToggleStudent(s.student.email); }}
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)] flex items-center gap-6 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] cursor-pointer transition-all">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-sm font-black text-orange-600 shrink-0">
                        {(s.student.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-black text-slate-900">{s.student.name || 'Anonymous'}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-xs font-bold text-slate-400">{s.student.email}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{s.course.title}</span>
                        </div>
                      </div>
                      <div className={cn("w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                        checked ? "bg-orange-500 border-orange-500 text-white" : "border-slate-200 bg-white")}>
                        {checked && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-3xl p-24 text-center border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
                  <Mail className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-slate-900">No students yet</h3>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mt-3">Students will appear once enrolled in your courses.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
