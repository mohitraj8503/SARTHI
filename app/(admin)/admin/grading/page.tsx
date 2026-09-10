'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  X,
  Save,
  ArrowRight,
  Code,
  BookOpen,
  Filter,
  User,
  Monitor,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

export default function GradingPage() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('0');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['admin-submissions', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/admin/grading?status=${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const json = await res.json();
      return json.data || [];
    }
  });

  const gradeMutation = useMutation({
    mutationFn: async (vars: any) => {
      const res = await fetch(`/api/admin/grading?id=${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: vars.grade,
          feedback: vars.feedback,
          passed: parseFloat(vars.grade) >= 40 // Default pass threshold
        })
      });
      if (!res.ok) throw new Error('Failed to grade submission');
      return res.json();
    },
    onSuccess: () => {
      addToast({ message: 'Submission successfully graded', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      setSelectedSubmission(null);
    }
  });

  const submissions = submissionsData || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in pb-12 h-[calc(100vh-140px)]">
      {/* Left Pane - Queue Sidebar (280px) */}
      <div className="w-full lg:w-[320px] flex flex-col bg-white rounded-[16px] border border-[#E2E8F4] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#F0F2F8] space-y-4">
          <h1 className="text-[24px] font-bold text-[#1C2B4A] tracking-tight">Grading Queue</h1>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8FAF]" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-lg text-[13px] focus:border-[#E8B84B] outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['PENDING', 'COMPLETED'].map(s => (
              <button
                key={s}
                onClick={() => setActiveTab(s)}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border transition-all",
                  activeTab === s ? "bg-[#1C2B4A] text-white border-[#1C2B4A]" : "text-[#7A8FAF] border-[#E2E8F4] hover:bg-[#F8F9FC]"
                )}>
                {s === 'PENDING' ? 'Queue' : 'Archive'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F8]">
          {isLoading ? (
            <div className="p-8 text-center text-[#7A8FAF] text-[12px] font-medium uppercase tracking-widest">Syncing Nodes...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-[#7A8FAF] text-[12px] font-medium uppercase tracking-widest">Queue Clear</div>
          ) : submissions.map((sub: any) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubmission(sub);
                setFeedback(sub.feedback || '');
                setGrade(sub.grade?.toString() || '0');
              }}
              className={cn(
                "w-full p-6 text-left hover:bg-[#F8F9FC] transition-all relative border-l-[4px]",
                selectedSubmission?.id === sub.id ? "bg-[#F8F9FC] border-l-[#E8B84B]" : "border-l-transparent"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#1C2B4A]/5 flex items-center justify-center text-[11px] font-bold text-[#1C2B4A]">
                  {sub.user.name?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#1C2B4A] line-clamp-1">{sub.user.name}</h4>
                  <p className="text-[10px] text-[#7A8FAF] font-bold uppercase tracking-widest">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-bold text-[#1C2B4A] line-clamp-1">{sub.lesson.title}</p>
                <p className="text-[10px] text-[#7A8FAF] font-medium">{sub.lesson.course.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Pane */}
      <div className="flex-1 bg-white rounded-[16px] border border-[#E2E8F4] flex flex-col shadow-sm overflow-hidden relative">
        {selectedSubmission ? (
          <>
            {/* Toolbar */}
            <div className="px-8 py-5 border-b border-[#F0F2F8] flex items-center justify-between bg-[#F8F9FC]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1C2B4A] text-white rounded-lg flex items-center justify-center font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1C2B4A]">{selectedSubmission.lesson}</h2>
                  <p className="text-[11px] text-[#7A8FAF] font-bold uppercase tracking-widest">Evaluating {selectedSubmission.student}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-widest">Grading Focus Active</span>
                <button className="p-2 text-[#7A8FAF] hover:text-[#1C2B4A]"><Monitor className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Grid Content Split */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Content */}
              <div className="flex-1 p-8 overflow-y-auto bg-slate-50 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3A6BC4]" /> Payload Content
                  </h3>
                  <div className="bg-[#1C2B4A] p-6 rounded-xl font-mono text-[13px] text-white/90 leading-relaxed shadow-lg">
                    <pre><code>{selectedSubmission.content || selectedSubmission.code || 'No submission content available.'}</code></pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A7A4A]" /> Feedback & Evaluation
                  </h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className={cn(
                      "w-full h-40 p-6 bg-white border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] focus:border-[#E8B84B] outline-none transition-all resize-none shadow-inner",
                      activeTab === 'COMPLETED' && "opacity-60 pointer-events-none"
                    )}
                    placeholder="Provide strategic feedback for the student..."
                  />
                </div>
              </div>

              {/* Right: Rubric Sidebar (300px) */}
              <div className="w-[300px] border-l border-[#F0F2F8] p-8 space-y-10 overflow-y-auto">
                <h3 className="text-[14px] font-bold text-[#1C2B4A] uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E8B84B]" /> Technical Audit
                </h3>

                {['Architecture', 'Logic', 'Documentation'].map(metric => {
                  const rubricScore = selectedSubmission.rubric?.[metric.toLowerCase()];
                  const displayScore = metric === 'Logic'
                    ? Math.floor(parseInt(grade) / 10)
                    : (rubricScore ?? '—');
                  const barWidth = metric === 'Logic'
                    ? `${grade}%`
                    : (rubricScore != null ? `${rubricScore * 10}%` : '0%');
                  return (
                  <div key={metric} className="space-y-4 text-left">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest">{metric}</label>
                      <span className="text-[18px] font-bold text-[#1C2B4A]">
                        {displayScore}
                        <span className="text-[12px] opacity-40">/10</span>
                      </span>
                    </div>
                    <div className="h-1 bg-[#F0F2F8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E8B84B] rounded-full shadow-[0_0_8px_rgba(232,184,75,0.3)] transition-all duration-500"
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>
                  );
                })}

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest">Final Score (%)</label>
                  <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    max="100"
                    min="0"
                    className={cn(
                      "w-full px-4 py-2 bg-white border border-[#E2E8F4] rounded-lg font-bold text-center text-[24px]",
                      activeTab === 'COMPLETED' && "opacity-60 pointer-events-none"
                    )}
                  />
                </div>

                <div className="pt-8 border-t border-[#F0F2F8] space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest">Composite Index</p>
                      <p className="text-[42px] font-bold text-[#1C2B4A] leading-none mt-2">{selectedSubmission.compositeScore ?? '—'}<span className="text-[14px] opacity-30">/30</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => gradeMutation.mutate({ id: selectedSubmission.id, grade, feedback })}
                    disabled={gradeMutation.isPending || activeTab === 'COMPLETED'}
                    className="w-full py-4 bg-[#E8B84B] text-white rounded-xl text-[12px] font-bold uppercase tracking-[2px] shadow-lg shadow-[#E8B84B]/20 hover:bg-[#D4A53B] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {gradeMutation.isPending ? "Syncing..." : "Archive Node"} <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="w-full py-3 border border-[#E2E8F4] text-[#7A8FAF] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-all"> Peer Review </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
            <div className="w-24 h-24 bg-[#F8F9FC] border-2 border-dashed border-[#E2E8F4] rounded-[32px] flex items-center justify-center text-[#7A8FAF] mb-8">
              <BookOpen className="w-10 h-10 opacity-30" />
            </div>
            <h2 className="text-[24px] font-bold text-[#1C2B4A]">Awaiting Deployment</h2>
            <p className="text-[14px] text-[#7A8FAF] mt-2 max-w-sm">Select an active sync node from the queue to commence immersive evaluation protocols.</p>
          </div>
        )}
      </div>
    </div>
  );
}

