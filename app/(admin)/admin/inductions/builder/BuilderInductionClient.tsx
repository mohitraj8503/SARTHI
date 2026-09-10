'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Video, User, Mail, 
  ExternalLink, Search, Filter, ArrowLeft, Play,
  Award, MessageSquare, AlertCircle, Github, Globe,
  BarChart3, Code2, Layout, Sliders, ChevronRight,
  ShieldCheck, Trophy, Sparkles, Briefcase,
  X as CloseIcon, Loader2 as SpinnerIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Submission {
  id: string;
  fullName: string;
  email: string;
  domain: string;
  projectTitle: string;
  elevatorPitch: string;
  problemStatement: string;
  solutionOverview: string;
  targetUsers: string;
  techStack: string;
  architectureSummary: string;
  keyFeatures: string;
  githubRepo: string;
  liveDemo?: string;
  videoDemoUrl: string;
  screenshot1?: string;
  screenshot2?: string;
  screenshot3?: string;
  metrics?: string;
  status: 'PENDING' | 'SELECTED' | 'ELITE' | 'IMPROVE' | 'REJECTED';
  score: number;
  scoreProblemClarity: number;
  scoreInnovation: number;
  scoreTechnicalDepth: number;
  scoreExecution: number;
  scoreDemoClarity: number;
  scoreImpact: number;
  reviewerNotes?: string;
  isIndustrySelected: boolean;
  appliedAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function BuilderInductionClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SELECTED' | 'ELITE' | 'IMPROVE' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');

  // Scoring State
  const [scores, setScores] = useState({
    problemClarity: 0,
    innovation: 0,
    technicalDepth: 0,
    execution: 0,
    demoClarity: 0,
    impact: 0,
    notes: '',
    isIndustrySelected: false
  });

  useEffect(() => {
    if (selectedSub) {
      setScores({
        problemClarity: selectedSub.scoreProblemClarity || 0,
        innovation: selectedSub.scoreInnovation || 0,
        technicalDepth: selectedSub.scoreTechnicalDepth || 0,
        execution: selectedSub.scoreExecution || 0,
        demoClarity: selectedSub.scoreDemoClarity || 0,
        impact: selectedSub.scoreImpact || 0,
        notes: selectedSub.reviewerNotes || '',
        isIndustrySelected: selectedSub.isIndustrySelected || false
      });
    }
  }, [selectedSub]);

  const totalScore = scores.problemClarity + scores.innovation + scores.technicalDepth + scores.execution + scores.demoClarity + scores.impact;

  const getRecommendedStatus = (score: number) => {
    if (score >= 80) return 'ELITE';
    if (score >= 65) return 'SELECTED';
    if (score >= 50) return 'IMPROVE';
    return 'REJECTED';
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesFilter = filter === 'ALL' || s.status === filter;
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         s.projectTitle.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdate = async (statusOverride?: string) => {
    if (!selectedSub) return;
    setIsUpdating(true);
    
    const finalStatus = statusOverride || getRecommendedStatus(totalScore);
    
    try {
      const res = await fetch('/api/admin/induction/builder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedSub.id, 
          status: finalStatus,
          score: totalScore,
          scores,
          notes: scores.notes,
          isIndustrySelected: scores.isIndustrySelected
        })
      });

      if (res.ok) {
        const updated = { 
          ...selectedSub, 
          status: finalStatus as any, 
          score: totalScore,
          reviewerNotes: scores.notes,
          isIndustrySelected: scores.isIndustrySelected,
          ...Object.fromEntries(Object.entries(scores).filter(([k]) => k !== 'isIndustrySelected' && k !== 'notes').map(([k, v]) => [`score${k.charAt(0).toUpperCase() + k.slice(1)}`, v]))
        };
        setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? updated : s));
        setSelectedSub(updated);
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin/inductions" className="flex items-center gap-2 text-gray-400 hover:text-[#1B4332] transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
          </Link>
          <h1 className="text-4xl font-black text-[#1B4332] tracking-tighter uppercase font-outfit">
            Builder <span className="text-emerald-600">Track</span>
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Reviewing production-grade project submissions.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all font-semibold text-sm w-[300px]"
            />
          </div>
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <option value="ALL">ALL_STATUS</option>
            <option value="PENDING">PENDING</option>
            <option value="ELITE">ELITE</option>
            <option value="SELECTED">SELECTED</option>
            <option value="IMPROVE">NEEDS_IMPROVEMENT</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Elite Builders', value: submissions.filter(s => s.status === 'ELITE').length, color: 'text-amber-500', bg: 'bg-amber-50', icon: Sparkles },
          { label: 'Selected', value: submissions.filter(s => s.status === 'SELECTED').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Pending', value: submissions.filter(s => s.status === 'PENDING').length, color: 'text-blue-500', bg: 'bg-blue-50', icon: Clock },
          { label: 'Improvement', value: submissions.filter(s => s.status === 'IMPROVE').length, color: 'text-orange-500', bg: 'bg-orange-50', icon: AlertCircle }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-2xl font-black text-[#1B4332] tracking-tighter font-outfit">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
            <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-50 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Builder & Project</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Domain</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub) => (
                <motion.tr 
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group border-b border-gray-50 hover:bg-gray-50/30 transition-all cursor-pointer"
                  onClick={() => setSelectedSub(sub)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                        {sub.fullName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#1B4332] text-sm tracking-tight">{sub.projectTitle}</div>
                        <div className="text-[11px] font-medium text-gray-400">by {sub.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {sub.domain}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "text-sm font-black",
                      sub.score >= 80 ? "text-amber-500" : sub.score >= 65 ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {sub.score || '--'}/100
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        sub.status === 'PENDING' ? "bg-blue-50 text-blue-600" : 
                        sub.status === 'ELITE' ? "bg-amber-50 text-amber-600" :
                        sub.status === 'SELECTED' ? "bg-emerald-50 text-emerald-600" : 
                        sub.status === 'IMPROVE' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                      )}>
                        {sub.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 rounded-xl bg-gray-100 text-gray-400 group-hover:bg-[#1B4332] group-hover:text-white transition-all">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <AlertCircle size={40} />
                      <p className="text-[10px] font-black uppercase tracking-widest">No submissions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Detailed Review Modal */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSub(null)} className="absolute inset-0 bg-[#1B4332]/60 backdrop-blur-md" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-6xl rounded-[3rem] shadow-3xl relative overflow-hidden flex flex-col max-h-[95vh]">
               {/* Modal Header */}
               <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black">
                        {selectedSub.fullName[0]}
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-[#1B4332] tracking-tighter uppercase">{selectedSub.projectTitle}</h2>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedSub.domain} Builder</span>
                           <span className="text-slate-300">•</span>
                           <span className="text-[11px] font-bold text-slate-400">{selectedSub.fullName} ({selectedSub.email})</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="px-6 py-3 bg-slate-50 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Score</p>
                        <p className={cn("text-xl font-black", totalScore >= 80 ? "text-amber-500" : "text-[#1B4332]")}>{totalScore}/100</p>
                     </div>
                     <button onClick={() => setSelectedSub(null)} className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                        <CloseIcon size={24} />
                     </button>
                  </div>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column: Proof & Description */}
                  <div className="lg:col-span-7 space-y-10">
                     {/* Video Demo */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Video size={12} /> Video Demo</h4>
                           <a href={selectedSub.videoDemoUrl} target="_blank" className="text-[10px] font-black text-emerald-600 hover:underline flex items-center gap-1">OPEN FULL <ExternalLink size={10} /></a>
                        </div>
                        <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                           {selectedSub.videoDemoUrl.includes('drive.google.com') ? (
                              <iframe src={selectedSub.videoDemoUrl.replace('/view', '/preview')} className="w-full h-full" allow="autoplay" />
                           ) : (
                              <video src={selectedSub.videoDemoUrl} controls className="w-full h-full object-contain" />
                           )}
                        </div>
                     </div>

                     {/* Project Core */}
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-slate-50 rounded-[2rem] space-y-3">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Elevator Pitch</h4>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed italic">&quot;{selectedSub.elevatorPitch}&quot;</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2rem] space-y-3">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Stack</h4>
                           <p className="text-sm font-black text-[#1B4332]">{selectedSub.techStack}</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout size={12} /> Solution Detail</h4>
                        <div className="space-y-4">
                           <div className="p-6 border border-slate-100 rounded-2xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Problem Statement</p>
                              <p className="text-sm font-medium text-slate-700">{selectedSub.problemStatement}</p>
                           </div>
                           <div className="p-6 border border-slate-100 rounded-2xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Architecture Summary</p>
                              <p className="text-sm font-medium text-slate-700">{selectedSub.architectureSummary}</p>
                           </div>
                        </div>
                     </div>

                     {/* Screenshots */}
                     {(selectedSub.screenshot1 || selectedSub.screenshot2 || selectedSub.screenshot3) && (
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence Screenshots</h4>
                           <div className="grid grid-cols-3 gap-4">
                              {[selectedSub.screenshot1, selectedSub.screenshot2, selectedSub.screenshot3].map((ss, i) => ss && (
                                 <div key={i} className="aspect-video bg-slate-100 rounded-xl overflow-hidden cursor-zoom-in group relative">
                                    { }
                                    <img src={ss} alt={`Project screenshot ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Right Column: Scoring & Review */}
                  <div className="lg:col-span-5 space-y-8">
                     <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl space-y-8">
                        <div className="flex items-center justify-between">
                           <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2"><Sliders size={20} className="text-emerald-400" /> Evaluation</h3>
                           <div className={cn(
                             "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             totalScore >= 80 ? "bg-amber-400 text-black" : "bg-emerald-500 text-white"
                           )}>
                              {getRecommendedStatus(totalScore)}
                           </div>
                        </div>

                        <div className="space-y-6">
                           {[
                             { id: 'problemClarity', label: 'Problem Clarity', max: 15 },
                             { id: 'innovation', label: 'Innovation', max: 20 },
                             { id: 'technicalDepth', label: 'Technical Depth', max: 25 },
                             { id: 'execution', label: 'Execution Quality', max: 20 },
                             { id: 'demoClarity', label: 'Demo Clarity', max: 10 },
                             { id: 'impact', label: 'Practical Impact', max: 10 }
                           ].map(param => (
                             <div key={param.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{param.label}</label>
                                   <span className="text-[10px] font-black text-emerald-400">{(scores as any)[param.id]}/{param.max}</span>
                                </div>
                                <input 
                                  type="range" min="0" max={param.max} 
                                  value={(scores as any)[param.id]}
                                  onChange={e => setScores(prev => ({...prev, [param.id]: parseInt(e.target.value)}))}
                                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                             </div>
                           ))}
                        </div>

                         <div className="space-y-3 pt-4 border-t border-white/10">
                            <div 
                               onClick={() => setScores({...scores, isIndustrySelected: !scores.isIndustrySelected})}
                               className={cn(
                                 "p-6 rounded-[2rem] border cursor-pointer transition-all flex items-center justify-between group/industry",
                                 scores.isIndustrySelected 
                                   ? "bg-amber-500/10 border-amber-500/40" 
                                   : "bg-white/5 border-white/10 hover:border-white/20"
                               )}
                            >
                               <div className="flex items-center gap-4">
                                  <div className={cn(
                                     "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                     scores.isIndustrySelected ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"
                                  )}>
                                     <Briefcase size={20} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-white">Industry Selected</p>
                                     <p className="text-[10px] text-white/40 font-medium">Eligible for real client projects & paid work.</p>
                                  </div>
                               </div>
                               <div className={cn(
                                  "w-12 h-6 rounded-full relative transition-colors border",
                                  scores.isIndustrySelected ? "bg-amber-500 border-amber-400" : "bg-slate-800 border-slate-700"
                               )}>
                                  <motion.div 
                                     animate={{ x: scores.isIndustrySelected ? 24 : 4 }}
                                     className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                  />
                               </div>
                            </div>
                         </div>

                         <div className="space-y-3 pt-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reviewer Notes</label>
                            <textarea 
                              value={scores.notes}
                              onChange={e => setScores({...scores, notes: e.target.value})}
                              placeholder="Add feedback for the builder..."
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-emerald-500 transition-all resize-none h-24"
                            />
                         </div>

                        <button 
                          disabled={isUpdating}
                          onClick={() => handleUpdate()}
                          className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/50 flex items-center justify-center gap-3 active:scale-95"
                        >
                           {isUpdating ? <SpinnerIcon className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> UPDATE_EVALUATION</>}
                        </button>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Builder Proof</h4>
                        <div className="space-y-3">
                           <a href={selectedSub.githubRepo} target="_blank" className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-600 transition-all group">
                              <div className="flex items-center gap-3">
                                 <Github size={20} className="text-slate-900" />
                                 <span className="text-xs font-black uppercase tracking-tight text-slate-900">GitHub Repository</span>
                              </div>
                              <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                           </a>
                           {selectedSub.liveDemo && (
                              <a href={selectedSub.liveDemo} target="_blank" className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-600 transition-all group">
                                 <div className="flex items-center gap-3">
                                    <Globe size={20} className="text-emerald-600" />
                                    <span className="text-xs font-black uppercase tracking-tight text-slate-900">Live Demo</span>
                                 </div>
                                 <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                              </a>
                           )}
                        </div>
                     </div>

                     {selectedSub.metrics && (
                        <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={12} /> Key Metrics</h4>
                           <p className="text-xs font-bold text-slate-600">{selectedSub.metrics}</p>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
