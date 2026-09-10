'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, Award, ShieldCheck, CheckCircle2, AlertCircle, 
  Plus, Users, ClipboardList, CheckSquare, Star, Minus, Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateXpReward } from '@/lib/services/internship.service';

interface ClientProps {
  initialSubmissions: any[];
  assignments: any[];
  stats: {
    totalInterns: number;
    pendingCount: number;
    approvedCount: number;
    totalXp: number;
  };
  interns?: any[];
}

export default function AdminInternshipsClient({ initialSubmissions, assignments, stats, interns = [] }: ClientProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  
  // Assignment form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Daily Assignment');
  const [newDifficulty, setNewDifficulty] = useState('Intermediate');
  const [newEstTime, setNewEstTime] = useState('2 Hours');
  const [newDeadline, setNewDeadline] = useState('');
  const [assignmentMode, setAssignmentMode] = useState<'INDIVIDUAL' | 'BATCH'>('INDIVIDUAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Manual XP Action state
  const [manualMemberId, setManualMemberId] = useState('');
  const [manualAmount, setManualAmount] = useState(50);
  const [manualDesc, setManualDesc] = useState('Outstanding Work');
  const [isBonus, setIsBonus] = useState(true);
  const [adjustingXp, setAdjustingXp] = useState(false);
  const [xpAdjustSuccess, setXpAdjustSuccess] = useState(false);

  // Review state
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [publicFeedback, setPublicFeedback] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [grading, setGrading] = useState(false);

  const calculatedXp = calculateXpReward(newCategory, newDifficulty);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/internship/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          difficulty: newDifficulty,
          estimatedTime: newEstTime,
          xpReward: calculatedXp,
          deadline: newDeadline,
          mode: assignmentMode,
          memberIds: selectedInternIds,
        }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewDesc('');
        setNewDeadline('');
        setSelectedInternIds([]);
        setSearchTerm('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleManualXp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustingXp(true);
    setXpAdjustSuccess(false);
    const amount = isBonus ? Math.abs(manualAmount) : -Math.abs(manualAmount);
    try {
      const res = await fetch('/api/admin/internship/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: manualMemberId,
          amount,
          description: manualDesc,
        }),
      });
      if (res.ok) {
        setXpAdjustSuccess(true);
        setManualMemberId('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdjustingXp(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string, status: string) => {
    setGrading(true);
    try {
      const res = await fetch('/api/admin/internship/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          status,
          rating,
          publicFeedback,
          privateNotes,
        }),
      });
      if (res.ok) {
        setActiveReviewId(null);
        setPublicFeedback('');
        setPrivateNotes('');
        setRating(5);
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto p-4 md:p-8">
      {/* Header Section */}
      <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">INTERNSHIP OPERATIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
            INTERNSHIP <span className="text-[#F97316]">CONSOLE</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
            Review assignment submissions, distribute XP, and manage active interns.
          </p>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Active Interns", val: stats.totalInterns, icon: Users, color: 'text-[#1B4332] bg-emerald-50 border-emerald-100' },
          { label: "Pending Submissions", val: stats.pendingCount, icon: ClipboardList, color: 'text-amber-500 bg-amber-50 border-amber-100' },
          { label: "Approved Tasks", val: stats.approvedCount, icon: CheckSquare, color: 'text-[#40916C] bg-emerald-50 border-emerald-100' },
          { label: "XP Distributed", val: `${stats.totalXp} XP`, icon: Zap, color: 'text-purple-500 bg-purple-50 border-purple-100' },
        ].map((s, i) => (
          <div key={i} className="p-6 bg-white border border-[#E5E7EB] rounded-[2rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] flex flex-col justify-between items-start gap-4">
            <div className={`p-3 rounded-2xl ${s.color} border`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</span>
              <h3 className="text-xl md:text-2xl font-black text-[#1F2937] leading-none mt-1">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Submissions queue with JIRA flow */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#1B4332] border-b border-[#E5E7EB] pb-4">
            Review Board Queue ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-[#E5E7EB] p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 uppercase">Review queue is clear!</h3>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub: any) => (
                <div 
                  key={sub.id}
                  className="bg-white rounded-[2.5rem] border border-[#E5E7EB] p-6 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Intern details</span>
                      <h4 className="text-sm font-bold text-gray-800 uppercase leading-none mt-1">
                        {sub.member.user.name || 'Anonymous User'}
                      </h4>
                      <p className="text-[10px] text-gray-400">{sub.member.user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#40916C] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                        {sub.assignment.category}
                      </span>
                      <h4 className="text-xs font-bold text-gray-800 uppercase mt-2">{sub.assignment.title}</h4>
                    </div>
                  </div>

                  {/* Multiple Submission Versions compare logs */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Version Comparison history</span>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {sub.versions.map((ver: any) => (
                        <div key={ver.id} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl text-xs space-y-2">
                          <div className="flex justify-between font-bold">
                            <span className="text-[#1B4332]">Version V{ver.versionNumber}</span>
                            <span className="text-gray-400">{new Date(ver.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                          {ver.githubUrl && <p><strong>Git:</strong> <a href={ver.githubUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">{ver.githubUrl}</a></p>}
                          {ver.liveUrl && <p><strong>Live:</strong> <a href={ver.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">{ver.liveUrl}</a></p>}
                          {ver.comments && <p className="text-gray-500 italic">&quot;{ver.comments}&quot;</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Box grading */}
                  {activeReviewId === sub.id ? (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                      <h4 className="text-xs font-black text-[#1B4332] uppercase tracking-widest">Grading & Custom Feedback</h4>
                      
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Rating (1-5 Stars)</label>
                            <select 
                              value={rating} 
                              onChange={(e) => setRating(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                            >
                              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Public Feedback (Visible to Intern)</label>
                            <input 
                              type="text" 
                              placeholder="Great design and modular structure..."
                              value={publicFeedback}
                              onChange={(e) => setPublicFeedback(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Private Notes (Admin Only - Hide from Intern)</label>
                          <input 
                            type="text" 
                            placeholder="Exceptional developer, candidate for PPO lead role..."
                            value={privateNotes}
                            onChange={(e) => setPrivateNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          disabled={grading}
                          onClick={() => handleGradeSubmission(sub.id, 'Approved')}
                          className="flex-1 py-3 bg-[#1B4332] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#2D6A4F] transition-all"
                        >
                          Approve (Grant XP)
                        </button>
                        <button
                          disabled={grading}
                          onClick={() => handleGradeSubmission(sub.id, 'Needs Changes')}
                          className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all"
                        >
                          Request Changes
                        </button>
                        <button
                          disabled={grading}
                          onClick={() => handleGradeSubmission(sub.id, 'Rejected')}
                          className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
                        >
                          Reject Task
                        </button>
                        <button
                          onClick={() => setActiveReviewId(null)}
                          className="px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveReviewId(sub.id);
                        setRating(5);
                      }}
                      className="w-full py-4 border border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332]/5 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all text-center"
                    >
                      Review & Grade Deliverables
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar form operations */}
        <div className="lg:col-span-4 space-y-6">
          {/* Create Assignment */}
          <div className="bg-white rounded-[2.5rem] border border-[#E5E7EB] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#1B4332] border-b border-gray-100 pb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#40916C]" />
              Publish Assignment
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Category</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  {['Daily Assignment', 'Weekly Challenge', 'Mini Project', 'Major Project', 'Research Task', 'Bug Fix', 'Documentation', 'Presentation', 'Code Review'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Difficulty</label>
                <select 
                  value={newDifficulty} 
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  {['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'].map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold text-purple-700 flex items-center justify-between">
                <span>Calculated Reward:</span>
                <span>{calculatedXp} XP</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Assignment Title</label>
                <input 
                  type="text" 
                  placeholder="Task title..." 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#40916C]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Description</label>
                <textarea 
                  placeholder="Details..." 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#40916C] h-24 resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Estimated Time</label>
                <input 
                  type="text" 
                  value={newEstTime}
                  onChange={(e) => setNewEstTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Assignment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignmentMode('INDIVIDUAL')}
                    className={`py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${assignmentMode === 'INDIVIDUAL' ? 'bg-[#1B4332] border-[#1B4332] text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    👤 Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentMode('BATCH')}
                    className={`py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${assignmentMode === 'BATCH' ? 'bg-[#1B4332] border-[#1B4332] text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    👥 Batch-wide
                  </button>
                </div>
              </div>

              {assignmentMode === 'INDIVIDUAL' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Target Interns</label>
                  <input 
                    type="text"
                    placeholder="🔍 Search Intern by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#40916C]"
                  />
                  
                  <div className="max-h-56 overflow-y-auto border border-gray-150 rounded-xl p-2 bg-gray-50 space-y-1.5">
                    {interns
                      .filter((intern: any) => 
                        intern.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        intern.user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((intern: any) => {
                        const isSelected = selectedInternIds.includes(intern.id);
                        const avatar = intern.user.avatar_url || intern.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(intern.user.name)}`;
                        const app = intern.user.internshipApplications?.[0];
                        const domain = app?.preferredField || app?.domain || app?.course || "Software Development";
                        const trackSuffix = app?.internshipTrack ? ` (${app.internshipTrack === 'experienced' ? 'Experienced' : 'Learning'})` : '';
                        
                        return (
                          <div 
                            key={intern.id}
                            type="button"
                            onClick={() => {
                              setSelectedInternIds(prev => 
                                prev.includes(intern.id) 
                                  ? prev.filter(id => id !== intern.id) 
                                  : [...prev, intern.id]
                              );
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-white border-[#40916C] shadow-sm' : 'border-transparent hover:bg-white/50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={avatar} alt={intern.user.name} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                              <div className="text-left">
                                <p className="text-xs font-bold text-gray-800 leading-tight">{intern.user.name}</p>
                                <p className="text-[9px] font-semibold text-gray-400 mt-0.5 uppercase tracking-tight">{domain}{trackSuffix}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Lvl {intern.currentLevel}</span>
                                <span className="text-[9px] font-extrabold text-[#40916C]">{intern.currentXp} XP</span>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-[#1B4332] border-[#1B4332] text-white' : 'border-gray-300'}`}>
                                {isSelected && <span className="text-[9px] font-bold">✓</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Deadline (Date & Time)</label>
                <input 
                  type="datetime-local" 
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-4 bg-[#1B4332] text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-lg"
              >
                {creating ? 'Creating...' : 'Publish Assignment'}
              </button>
            </form>
          </div>

          {/* XP Adjustments Panel */}
          <div className="bg-white rounded-[2.5rem] border border-[#E5E7EB] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#1B4332] border-b border-gray-100 pb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#40916C]" />
              XP Adjustments Console
            </h3>

            <form onSubmit={handleManualXp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Member/Enrollment ID</label>
                <input 
                  type="text" 
                  placeholder="Batch Member ID..." 
                  value={manualMemberId}
                  onChange={(e) => setManualMemberId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#40916C]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Type</label>
                  <select 
                    value={isBonus ? 'Bonus' : 'Penalty'} 
                    onChange={(e) => setIsBonus(e.target.value === 'Bonus')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="Bonus">Reward Bonus</option>
                    <option value="Penalty">Deduct Penalty</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">XP Points</label>
                  <input 
                    type="number" 
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Reason</label>
                <select 
                  value={manualDesc} 
                  onChange={(e) => setManualDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  {isBonus ? (
                    ['Outstanding Work', 'Hackathon Winner', 'Helping Team', 'Bug Discovery'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))
                  ) : (
                    ['Late Submission', 'Copied Work', 'Missed Meeting', 'Absent', 'Policy Violation'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={adjustingXp}
                className="w-full py-4 bg-[#1B4332] text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-lg"
              >
                {adjustingXp ? 'Processing...' : isBonus ? 'Apply Reward' : 'Apply Penalty'}
              </button>
              {xpAdjustSuccess && (
                <p className="text-emerald-600 text-xs font-black uppercase text-center mt-2">
                  XP Adjustment Logged!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
