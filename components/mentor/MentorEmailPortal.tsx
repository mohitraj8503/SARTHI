'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Mail, Send, Loader2, Users, Check, X, Plus,
  Search, Globe, Inbox, Sparkles, ChevronDown,
  FileText, GraduationCap, Bell, Award, AtSign, Zap,
  UserPlus, Trash2, Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { generateSchoolProposalHtml } from '@/lib/email/templates/school-proposal';

/* ─── Types ─────────────────────────────────────────────── */
interface StudentInfo {
  id: string;
  student: { id: string; name: string | null; email: string };
  course: { title: string };
}
interface MentorEmailPortalProps { students: StudentInfo[]; isDark?: boolean; }
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
    actionLabel: 'Book a 15-Minute School Presentation',
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

/* ─── Local Stat Card ─────────────────────────────────────── */
function LocalStatCard({ title, value, icon: Icon, color }: {
  title: string; value: string | number; icon: React.ElementType;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
}) {
  const styles = {
    emerald: 'bg-[#174F3A]/5 border-[#174F3A]/10 text-[#174F3A]',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700'
  }[color];

  return (
    <div className={cn("p-5 rounded-2xl border bg-white shadow-sm flex items-center justify-between gap-4")}>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
      </div>
      <div className={cn("p-3 rounded-xl border", styles)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

/* ─── Audience Card ─────────────────────────────────────── */
function AudienceCard({ icon: Icon, title, subtitle, count, color, active, onClick }: {
  icon: React.ElementType; title: string; subtitle: string;
  count: string | number; color: 'orange' | 'emerald' | 'blue';
  active: boolean; onClick: () => void;
}) {
  const c = {
    orange: { ring: 'ring-[#174F3A] border-[#174F3A]/30', icon: 'bg-emerald-50 border-emerald-100 text-[#174F3A]', check: 'bg-[#174F3A]', badge: 'bg-emerald-50 text-[#174F3A]' },
    emerald: { ring: 'ring-emerald-400 border-emerald-300', icon: 'bg-emerald-50 border-emerald-100 text-emerald-600', check: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    blue: { ring: 'ring-blue-400 border-blue-300', icon: 'bg-blue-50 border-blue-100 text-blue-600', check: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  }[color];

  return (
    <button type="button" onClick={onClick}
      className={cn("relative flex flex-col gap-3 p-4 rounded-2xl border-2 text-left w-full transition-all duration-200 hover:shadow-md cursor-pointer",
        active ? `${c.ring} ring-2 bg-white shadow-lg` : "border-slate-150 bg-white hover:border-slate-300"
      )}>
      <div className="flex items-center justify-between">
        <div className={cn("p-2.5 rounded-xl border", c.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
          active ? `${c.check} border-transparent text-white` : "border-slate-200 bg-white"
        )}>
          {active && <Check className="w-3.5 h-3.5" />}
        </div>
      </div>
      <div>
        <p className="text-xs font-black text-slate-800">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</p>
      </div>
      <span className={cn("absolute bottom-4 right-4 px-2 py-0.5 rounded-full text-[9px] font-black font-mono", c.badge)}>
        {count}
      </span>
    </button>
  );
}

/* ─── Custom Recipients Modal ────────────────────────────── */
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

  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>();
    return students.filter(s => { if (seen.has(s.student.email)) return false; seen.add(s.student.email); return true; });
  }, [students]);

  const filtered = uniqueStudents.filter(s =>
    (s.student.name || '').toLowerCase().includes(search.toLowerCase()) ||
    s.student.email.toLowerCase().includes(search.toLowerCase())
  );

  const parseBulkEmails = () => {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const parsed = bulkInput.match(regex) || [];
    const newOnes = parsed.filter(e => !customEmails.includes(e));
    if (newOnes.length === 0) { toast.error('No new valid emails found'); return; }
    onSetCustomEmails([...customEmails, ...newOnes]);
    setBulkInput('');
    toast.success(`Added ${newOnes.length} email(s)`);
  };

  const totalSelected = selectedEmails.length + customEmails.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-slate-100 flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Select Custom Recipients</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Build a targeted cohort for your message</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
          {/* Left: Directory Selection */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intern Directory</label>
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
                className="text-[10px] font-black text-[#174F3A] hover:text-[#0c2a1f] uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {uniqueStudents.every(s => selectedEmails.includes(s.student.email)) ? (
                  <>Deselect All</>
                ) : (
                  <><Check className="w-3.5 h-3.5" /> Select All</>
                )}
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or email…"
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#174F3A] transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl p-2 bg-slate-50/50 space-y-1.5 max-h-[300px]">
              {filtered.map(s => {
                const checked = selectedEmails.includes(s.student.email);
                return (
                  <div key={s.id} onClick={() => onToggleStudent(s.student.email)}
                    className={cn("p-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all border",
                      checked ? "bg-emerald-50/30 border-[#174F3A]/20" : "bg-white border-transparent hover:border-slate-200"
                    )}>
                    <div>
                      <p className="font-bold text-xs text-slate-800">{s.student.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{s.student.email}</p>
                    </div>
                    <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                      checked ? "bg-[#174F3A] border-transparent text-white" : "border-slate-200 bg-white"
                    )}>
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-slate-400 font-medium">No matches found.</div>
              )}
            </div>
          </div>

          {/* Right: Paste Bulk & Custom List */}
          <div className="space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Paste Emails (one per line, or comma/semicolon separated)
              </label>
              <textarea 
                rows={4} 
                value={bulkInput} 
                onChange={e => setBulkInput(e.target.value)}
                placeholder="intern1@domain.com&#10;intern2@domain.com, intern3@domain.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#174F3A] transition-all resize-none"
              />
              <button 
                onClick={parseBulkEmails}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Parse & Add Emails
              </button>
            </div>

            {/* Current custom emails */}
            {customEmails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Added Custom Emails ({customEmails.length})
                  </label>
                  <button onClick={() => onSetCustomEmails([])}
                    className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {customEmails.map(email => (
                    <span key={email} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700 px-2.5 py-1 rounded-full">
                      {email}
                      <button onClick={() => onSetCustomEmails(customEmails.filter(e => e !== email))}
                        className="hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400">
            {selectedEmails.length} student(s) + {customEmails.length} external = <span className="text-slate-700 font-black">{totalSelected} total</span>
          </p>
          <button onClick={onClose}
            className="bg-[#174F3A] hover:bg-[#0c2a1f] text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function MentorEmailPortal({ students, isDark = false }: MentorEmailPortalProps) {
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
  const [attachments, setAttachments] = useState<{ filename: string, content: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: { filename: string; content: string }[] = [];
    let loadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64Content = result.split(',')[1];
        newAttachments.push({
          filename: file.name,
          content: base64Content,
        });
        loadedCount++;
        if (loadedCount === files.length) {
          setAttachments(prev => [...prev, ...newAttachments]);
          toast.success(`Added ${files.length} file(s) as attachments`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetch('/api/mentor/students/email')
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
        attachments,
      };

      if (targetType === 'my_students') {
        payload.emails = Array.from(new Set(uniqueStudents.map(s => s.student.email)));
      } else if (targetType === 'custom') {
        payload.emails = Array.from(new Set([...selectedStudentEmails, ...customEmails]));
      }

      const res = await fetch('/api/mentor/students/email', {
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
        setAttachments([]);
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
      <CustomRecipientsModal
        open={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        students={students}
        selectedEmails={selectedStudentEmails}
        customEmails={customEmails}
        onToggleStudent={handleToggleStudent}
        onSetCustomEmails={setCustomEmails}
      />

      <div className="space-y-6 pb-20 text-xs">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-150 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 bg-[#174F3A] rounded-full" />
              <span className="text-[10px] font-black text-[#174F3A] uppercase tracking-wider">COMMUNITY COMMUNICATION</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Email Broadcast Portal</h3>
            <p className="text-[10px] text-gray-400 mt-1">Dispatch branded announcements to your interns or every platform user.</p>
          </div>
          <button onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="bg-emerald-600 hover:bg-emerald-750 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-3 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {sending
              ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
              : <><Send className="w-4 h-4" />Send Email ({displayCount})</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LocalStatCard title="My Interns" value={uniqueStudents.length} icon={Users} color="blue" />
          <LocalStatCard title="Platform Users" value={platformCount ?? '…'} icon={Globe} color="emerald" />
          <LocalStatCard title="Custom Selected" value={customRecipientCount} icon={AtSign} color="amber" />
          <LocalStatCard title="Ready to Send" value={displayCount} icon={Inbox} color="rose" />
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/40 rounded-2xl p-1.5 border border-white/20 max-w-max">
          {(['Compose', 'Recipients'] as MainTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                activeTab === tab ? "bg-[#174F3A] text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── COMPOSE ── */}
        {activeTab === 'Compose' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left: Form — 5 cols */}
            <div className="xl:col-span-5 space-y-4">
              {/* Audience Selector */}
              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Who are you emailing?</p>
                <div className="grid grid-cols-3 gap-3">
                  <AudienceCard
                    icon={Users} color="orange" title="My Interns" subtitle="Enrolled batch learners"
                    count={uniqueStudents.length} active={targetType === 'my_students'}
                    onClick={() => setTargetType('my_students')}
                  />
                  <AudienceCard
                    icon={Globe} color="emerald" title="All Platform" subtitle="Entire platform"
                    count={platformCount != null ? platformCount.toLocaleString() : '…'}
                    active={targetType === 'all_platform'}
                    onClick={() => setTargetType('all_platform')}
                  />
                  <AudienceCard
                    icon={AtSign} color="blue" title="Custom" subtitle="Build recipient list"
                    count={customRecipientCount} active={targetType === 'custom'}
                    onClick={() => {
                      setTargetType('custom');
                      setShowCustomModal(true);
                    }}
                  />
                </div>

                {targetType === 'custom' && customRecipientCount > 0 && (
                  <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                    <span className="text-[10px] font-bold text-blue-700">
                      {selectedStudentEmails.length} student(s) + {customEmails.length} external selected
                    </span>
                    <button onClick={() => setShowCustomModal(true)}
                      className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider cursor-pointer border-none bg-transparent"
                    >
                      Edit →
                    </button>
                  </div>
                )}

                {targetType === 'custom' && customRecipientCount === 0 && (
                  <button onClick={() => setShowCustomModal(true)}
                    className="mt-3 w-full border-2 border-dashed border-blue-200 rounded-xl py-3 text-xs font-black text-blue-500 hover:border-blue-400 hover:text-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                  >
                    <Plus className="w-4 h-4" /> Click to Add Recipients
                  </button>
                )}

                {targetType === 'all_platform' && (
                  <div className="mt-3 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-[11px] font-bold text-emerald-700">
                      This will email <span className="font-black">{platformCount?.toLocaleString() ?? '…'} active students</span> across the entire platform. Use responsibly.
                    </p>
                  </div>
                )}
              </div>

              {/* Template + Compose Form */}
              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm space-y-4">
                {/* Template Picker */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Template</p>
                  <div className="relative">
                    <button type="button" onClick={() => setTemplateDropdownOpen(p => !p)}
                      className="w-full flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 hover:border-slate-450 transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <currentTemplate.icon className="w-4 h-4 text-[#174F3A]" />
                        {currentTemplate.name}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-slate-450 transition-transform", templateDropdownOpen && "rotate-180")} />
                    </button>
                    {templateDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                        {EMAIL_TEMPLATES.map(tpl => (
                          <button key={tpl.id} type="button" onClick={() => applyTemplate(tpl)}
                            className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-slate-50 cursor-pointer",
                              selectedTemplate === tpl.id && "bg-emerald-50/50"
                            )}>
                            <tpl.icon className={cn("w-4 h-4", selectedTemplate === tpl.id ? "text-[#174F3A]" : "text-slate-400")} />
                            <div className="flex-1">
                              <p className="text-xs font-black text-slate-800">{tpl.name}</p>
                              {tpl.badge && <p className="text-[9px] text-slate-400 uppercase tracking-wider">{tpl.badge}</p>}
                            </div>
                            {selectedTemplate === tpl.id && <Check className="w-4 h-4 text-[#174F3A] shrink-0" />}
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Badge Pill (optional)</label>
                  <input type="text" placeholder="e.g. CERTIFICATE UPDATE…"
                    value={badge} onChange={e => setBadge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subject / Heading *</label>
                  <input type="text" required placeholder="Enter email heading…"
                    value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Message Body *</label>
                  <textarea required rows={7} placeholder="Write your message here…"
                    value={message} onChange={e => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl p-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none" />
                </div>

                {/* File Attachment */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Attachments (Image, Word, PDF, etc.)</label>
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#174F3A] rounded-xl p-4 transition-all bg-slate-50 hover:bg-white cursor-pointer relative">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="text-center space-y-1 pointer-events-none">
                      <Plus className="w-4 h-4 mx-auto text-slate-400" />
                      <p className="text-[11px] font-bold text-slate-700">Choose files to attach</p>
                      <p className="text-[8px] text-gray-400 uppercase font-black">Click or drag here</p>
                    </div>
                  </div>
                  {attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Attached files ({attachments.length})</span>
                        <button type="button" onClick={() => setAttachments([])} className="text-[8px] font-black text-red-500 uppercase cursor-pointer border-none bg-transparent hover:text-red-700">Clear All</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {attachments.map((att, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 px-2.5 py-1 rounded-lg">
                            <span className="truncate max-w-[120px]">{att.filename}</span>
                            <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-500 cursor-pointer border-none bg-transparent ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button type="button" onClick={() => setShowAdvanced(p => !p)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-slate-650 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#174F3A]" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced (highlight box + CTA button)
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-3 border-t border-slate-100">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Highlight Box (optional)</label>
                      <textarea rows={3} placeholder="Callout box text…"
                        value={highlight} onChange={e => setHighlight(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl p-3.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Button Label</label>
                        <input type="text" placeholder="e.g. Access Dashboard"
                          value={actionLabel} onChange={e => setActionLabel(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Button URL</label>
                        <input type="url" placeholder="https://sarthi-woad.vercel.app/…"
                          value={actionUrl} onChange={e => setActionUrl(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button type="button" onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-750 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Sending Broadcast…</>
                  : <><Send className="w-4 h-4" />Send Email to {displayCount} {targetType === 'all_platform' ? 'Students' : 'Recipient(s)'}</>}
              </button>
            </div>

            {/* Right: Live Preview — 7 cols */}
            <div className="xl:col-span-7">
              <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '620px' }}>
                <iframe srcDoc={previewHtml} className="w-full h-full border-0" sandbox="allow-same-origin" title="Email Preview" />
              </div>
            </div>
          </div>
        )}

        {/* ── RECIPIENTS TAB ── */}
        {activeTab === 'Recipients' && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/40 p-4 rounded-2xl border border-white/20 shadow-sm">
              <div className="relative min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search student directory…"
                  value={directorySearch} onChange={e => setDirectorySearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#174F3A] transition-all" />
              </div>
              <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest">{filteredStudents.length} of {uniqueStudents.length} interns</p>
            </div>

            {uniqueStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudents.map(s => {
                  const checked = selectedStudentEmails.includes(s.student.email);
                  return (
                    <div key={s.id} onClick={() => { setTargetType('custom'); handleToggleStudent(s.student.email); }}
                      className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm flex items-center gap-4 hover:shadow-md cursor-pointer transition-all">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-black text-[#174F3A] shrink-0">
                        {(s.student.name || 'I').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-black text-slate-800 truncate">{s.student.name || 'Anonymous'}</h3>
                        <p className="text-[10px] text-slate-450 truncate mt-0.5">{s.student.email}</p>
                        <span className="inline-block text-[8px] font-black uppercase tracking-wider bg-slate-50 border border-slate-150 text-slate-500 px-2 py-0.5 rounded mt-1">{s.course.title}</span>
                      </div>
                      <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                        checked ? "bg-[#174F3A] border-transparent text-white" : "border-slate-200 bg-white"
                      )}>
                        {checked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-150 shadow-sm">
                <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-black text-slate-800">No active interns</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-2">Active interns in your batches will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
