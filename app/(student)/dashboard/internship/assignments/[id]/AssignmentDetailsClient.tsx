'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, ArrowLeft, CheckCircle2, AlertCircle, Github, 
  Globe, FolderKanban, MessageSquare, Send, Award, Clock,
  Palette, Rocket, FileText, Check, ShieldAlert, RotateCcw, Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ContentRenderer } from '@/components/common/ContentRenderer';
import { cn } from '@/lib/utils';

interface ClientProps {
  assignment: any;
  memberId: string;
  initialSubmission: any;
  studentDomain: string;
}

// Helper to convert full uppercase titles into clean Title Case while preserving intentional emojis
function toTitleCase(str: string): string {
  if (!str) return '';
  // If it's already mixed case, keep it
  if (str !== str.toUpperCase()) return str;

  return str
    .toLowerCase()
    .replace(/(^|\s|-|\()([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    .replace(/\bSeo\b/gi, 'SEO')
    .replace(/\bAi\b/gi, 'AI')
    .replace(/\bXp\b/gi, 'XP')
    .replace(/\bApi\b/gi, 'API')
    .replace(/\bUi\b/gi, 'UI')
    .replace(/\bUx\b/gi, 'UX');
}

// Helper to format raw description text into proper Markdown if numbers exist as plain text
function preprocessMarkdownList(text: string): string {
  if (!text) return '';
  let formatted = text.replace(/\\n/g, '\n');
  
  // Format numbered lists if they appear sequentially on single lines without breaks
  formatted = formatted.replace(/(\n|^)(\d+[\.\)])\s*/g, '\n\n$2 ');
  // Ensure Key Requirements heading has breathing room
  formatted = formatted.replace(/(Key Requirements|Requirements|Deliverables):/gi, '\n\n### $1\n');

  return formatted;
}

export default function AssignmentDetailsClient({ assignment, memberId, initialSubmission, studentDomain }: ClientProps) {
  const router = useRouter();
  
  // Submission Form State
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [comments, setComments] = useState('');

  // Interactive Checkbox Toggles State for dynamic smooth expanding input boxes (LinkedIn, GitHub, Live, and Comments enabled by default)
  const [activeFields, setActiveFields] = useState<Record<string, boolean>>({
    linkedin: true,
    github: true,
    live: true,
    drive: false,
    comments: true,
  });

  const toggleField = (fieldKey: string) => {
    setActiveFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };
  
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submission, setSubmission] = useState(initialSubmission);

  // Discussion State
  const [discussions, setDiscussions] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`/api/internship/discussion?assignmentId=${assignment.id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setDiscussions(data);
        }
      } catch (err) {
        console.error('Discussion fetch failed:', err);
      }
    };
    fetchDiscussions();
  }, [assignment.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      const res = await fetch('/api/internship/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          assignmentId: assignment.id,
          githubUrl,
          liveUrl,
          driveLink,
          comments,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmission(data);
        setSubmitSuccess(true);
        setGithubUrl('');
        setLiveUrl('');
        setDriveLink('');
        setComments('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Color-code difficulty badge
  const diffUpper = (assignment.difficulty || '').toUpperCase();
  let diffBadgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
  if (diffUpper.includes('EASY')) {
    diffBadgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (diffUpper.includes('MEDIUM') || diffUpper.includes('INTERMEDIATE')) {
    diffBadgeBg = 'bg-amber-50 text-amber-900 border-amber-200';
  } else if (diffUpper.includes('HARD') || diffUpper.includes('ADVANCED')) {
    diffBadgeBg = 'bg-rose-50 text-rose-900 border-rose-200';
  }

  const currentVersionNumber = (submission?.versions?.length || 0) + 1;
  const buttonLabel = submission ? `SUBMIT VERSION ${currentVersionNumber}` : 'SUBMIT VERSION 1';

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 md:px-4 md:py-6 space-y-5">
      {/* Back button */}
      <Link 
        href="/dashboard/internship" 
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1B4332] hover:text-[#2D6A4F] transition-all group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Active Board
      </Link>

      <div className="space-y-6">
        {/* Horizontal Submit Solution Card (Positioned ABOVE Task Details) */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#1B4332]">
              Submit Solution
            </h3>

            {/* Shared Dashboard Workflow Status Badge */}
            {submission && (() => {
              const status = submission.status;
              let badgeBg = 'bg-slate-50 border-slate-200 text-slate-700';
              let statusLabel = 'NOT STARTED';
              let IconComp = Clock;

              if (status === 'Approved') {
                badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                statusLabel = 'APPROVED ✅';
                IconComp = CheckCircle2;
              } else if (status === 'Needs Changes') {
                badgeBg = 'bg-amber-50 border-amber-200 text-amber-900';
                statusLabel = 'NEEDS REVISION ⚠️';
                IconComp = ShieldAlert;
              } else if (status === 'Rejected') {
                badgeBg = 'bg-rose-50 border-rose-200 text-rose-900';
                statusLabel = 'REVISION REQUESTED ❌';
                IconComp = AlertCircle;
              } else if (status === 'Submitted' || status === 'Waiting for Review' || status === 'Resubmitted') {
                badgeBg = 'bg-indigo-50 border-indigo-200 text-indigo-800';
                statusLabel = 'AWAITING REVIEW ⏳';
                IconComp = RotateCcw;
              }

              return (
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${badgeBg}`}>
                  <IconComp className="w-4 h-4" />
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status:</span>
                    <span className="text-xs font-black uppercase">{statusLabel}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Public mentor feedback */}
          {submission?.feedbacks && submission.feedbacks.length > 0 && (
            <div className={cn(
              "p-4 border rounded-2xl space-y-2",
              submission.status === 'Approved' ? 'bg-emerald-50/50 border-emerald-200' :
              submission.status === 'Needs Changes' ? 'bg-amber-50/70 border-amber-200' :
              submission.status === 'Rejected' ? 'bg-rose-50/70 border-rose-200' :
              'bg-slate-50 border-slate-200'
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">
                  💬 Mentor Feedback
                </span>
                {(submission.feedbacks[0]?.rating ?? 0) > 0 && (
                  <span className="text-[10px] font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                    ⭐ {submission.feedbacks[0].rating}/5
                  </span>
                )}
              </div>
              {submission.feedbacks[0]?.publicFeedback ? (
                <p className="text-xs text-slate-700 font-normal leading-relaxed bg-white/90 p-3 rounded-xl border border-slate-150">
                  &quot;{submission.feedbacks[0].publicFeedback}&quot;
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">No detailed written feedback provided.</p>
              )}
            </div>
          )}

          {submission?.status === 'Approved' ? (
            <p className="text-xs text-emerald-800 font-black uppercase text-center py-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
              Assignment approved. XP credited!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Checkbox Selector Bar */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Select Deliverables To Include (Tick to Expand):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'linkedin', label: 'LinkedIn Post URL (Mandatory)', icon: Linkedin },
                    { key: 'github', label: 'GitHub Repository', icon: Github },
                    { key: 'live', label: 'Live Demo URL', icon: Globe },
                    { key: 'drive', label: 'Google Drive Link', icon: FolderKanban },
                    { key: 'comments', label: 'Comments / Notes', icon: MessageSquare },
                  ].map((field) => {
                    const isChecked = !!activeFields[field.key];
                    const IconComp = field.icon;
                    return (
                      <button
                        key={field.key}
                        type="button"
                        onClick={() => toggleField(field.key)}
                        className={cn(
                          "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer select-none active:scale-[0.97]",
                          isChecked 
                            ? "bg-[#1B4332] text-white border-[#1B4332] shadow-xs" 
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                          isChecked ? "bg-emerald-400 border-emerald-400 text-[#1B4332]" : "border-slate-300 bg-slate-50"
                        )}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <IconComp className={cn("w-3.5 h-3.5", isChecked ? "text-white" : "text-slate-400")} />
                        <span>{field.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Smooth Animated Inputs Grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {activeFields.linkedin && (
                    <motion.div
                      key="field-linkedin"
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block flex items-center gap-1.5">
                        <Linkedin className="w-3 h-3 text-sky-600" />
                        LinkedIn Post URL (Mandatory)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Linkedin className="h-4 w-4 text-sky-600" />
                        </div>
                        <input 
                          type="url" 
                          placeholder="https://linkedin.com/posts/..." 
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1B4332] transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeFields.github && (
                    <motion.div
                      key="field-github"
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block flex items-center gap-1.5">
                        <Github className="w-3 h-3 text-slate-800" />
                        GitHub Repository Link
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Github className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                          type="url" 
                          placeholder="https://github.com/..." 
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1B4332] transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeFields.live && (
                    <motion.div
                      key="field-live"
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-emerald-600" />
                        Live Demo / Website Link
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Globe className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                          type="url" 
                          placeholder="https://..." 
                          value={liveUrl}
                          onChange={(e) => setLiveUrl(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1B4332] transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeFields.drive && (
                    <motion.div
                      key="field-drive"
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block flex items-center gap-1.5">
                        <FolderKanban className="w-3 h-3 text-amber-600" />
                        Google Drive Link
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <FolderKanban className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                          type="url" 
                          placeholder="https://drive.google.com/..." 
                          value={driveLink}
                          onChange={(e) => setDriveLink(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1B4332] transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeFields.comments && (
                    <motion.div
                      key="field-comments"
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="space-y-1.5 col-span-full overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-purple-600" />
                        Comments / Notes
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3.5 pointer-events-none">
                          <MessageSquare className="h-4 w-4 text-slate-400" />
                        </div>
                        <textarea 
                          placeholder="Describe your adjustments, progress, or work notes..." 
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1B4332] transition-all h-28 resize-y"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-extrabold rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>{submitting ? 'Submitting...' : buttonLabel}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {submitSuccess && (
                <p className="text-emerald-700 text-xs font-black uppercase text-center mt-2">
                  Submitted Version Successfully!
                </p>
              )}
            </form>
          )}

          {/* Submission History List inline */}
          {submission?.versions && submission.versions.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Submission History ({submission.versions.length})
              </h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {submission.versions.map((ver: any) => (
                  <div key={ver.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 uppercase">Version {ver.versionNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(ver.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    {ver.comments && <p className="text-slate-600 font-normal italic text-[11px] truncate">{`"${ver.comments}"`}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Task Card Below */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
          {/* Top Standardized Badge Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              {assignment.category}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border ${diffBadgeBg}`}>
              {assignment.difficulty}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {assignment.xpReward} XP
            </span>
          </div>

          {/* Readable Title (Title Case) */}
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-snug">
            {toTitleCase(assignment.title)}
          </h1>

          {/* Properly formatted Description & Requirements */}
          <div className="prose max-w-none text-slate-600 font-normal text-xs md:text-sm leading-relaxed border-t border-slate-100 pt-5 space-y-4">
            <ContentRenderer content={preprocessMarkdownList(assignment.description)} />
          </div>
        </div>
      </div>
    </div>
  );
}
