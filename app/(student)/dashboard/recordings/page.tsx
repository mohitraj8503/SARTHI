'use client';

import { useState, useEffect } from 'react';
import { PageHeader, StatCard, EmptyState } from '@/components/ui/DashboardUI';
import { PlayCircle, Clock, Calendar, Download, Film, ExternalLink, ChevronRight, Share2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StudentRecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    fetch('/api/student/recordings')
      .then(res => res.json())
      .then(data => {
        setRecordings(data.recordings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pb-32 text-white selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-8 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                 <Film className="text-indigo-400" size={20} />
               </div>
               <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Archive Terminal</span>
             </div>
             <h1 className="text-6xl font-black italic uppercase tracking-tighter font-outfit">Workshop_Vault</h1>
             <p className="text-white/30 max-w-xl text-sm font-medium leading-relaxed">
               Access high-fidelity technical deep-dives and production workshops synced directly from our neural network.
             </p>
          </div>

          <div className="flex gap-6">
            <StatCardMini label="Total Nodes" value={recordings.length} icon={<Film size={14}/>} />
            <StatCardMini label="Sync Status" value="Active" icon={<ActivityPulse />} />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6">
             <div className="w-16 h-16 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-white/20 text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning drive signatures</p>
          </div>
        ) : recordings.length === 0 ? (
          <EmptyState
            icon={<PlayCircle className="w-16 h-16 text-white/5" />}
            title="NO SIGNATURES FOUND"
            message="The archive is currently empty. Recordings will appear here after the live transmission is finalized."
            buttonText="Back to Schedule"
            buttonHref="/dashboard/live"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recordings.map((recording: any, idx: number) => (
              <RecordingCard 
                key={recording.id} 
                recording={recording} 
                index={idx} 
                onPlay={() => setSelectedVideo(recording)}
              />
            ))}
          </div>
        )}
      </div>

      {/* PRO VIDEO OVERLAY */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 lg:p-20"
          >
             <div className="absolute top-10 right-10 flex gap-4">
                <button 
                  onClick={() => window.open(selectedVideo.url, '_blank')}
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ExternalLink size={24} />
                </button>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center font-black hover:bg-slate-200 transition-all"
                >
                  ESC
                </button>
             </div>

             <div className="w-full max-w-6xl aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative group">
                <iframe 
                  src={selectedVideo.url.replace('/view', '/preview')}
                  className="w-full h-full border-none"
                  allow="autoplay"
                />
                <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
             </div>

             <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-xl">Now Playing</span>
                      <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{selectedVideo.courseName}</span>
                   </div>
                   <h2 className="text-4xl font-black italic uppercase tracking-tight font-outfit max-w-2xl leading-none">{selectedVideo.title}</h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Instructor_Link</p>
                   <p className="text-xl font-bold italic uppercase tracking-tighter text-indigo-400">{selectedVideo.instructor}</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordingCard({ recording, index, onPlay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", damping: 20 }}
      className="group bg-[#0d0d0f] rounded-[2.5rem] overflow-hidden border border-white/[0.03] hover:border-indigo-500/30 transition-all duration-700 hover:-translate-y-4 shadow-2xl relative"
    >
      <div className="relative aspect-video bg-[#050505] flex items-center justify-center overflow-hidden">
        <PlayCircle className="w-20 h-20 text-white/5 group-hover:text-indigo-500 transition-all duration-700 group-hover:scale-110 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-90" />
        
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0"
        >
          {/* Placeholder for real thumbnail if available */}
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/20 to-slate-900/20" />
        </motion.div>

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white z-10">
          <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black uppercase tracking-widest">
            <Clock className="w-4 h-4 text-indigo-400" />
            {Math.floor((recording.duration || 0) / 60)}m {recording.duration % 60}s
          </div>
        </div>
      </div>

      <div className="p-10 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] italic">{new Date(recording.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
             <Share2 className="text-white/10 hover:text-white transition-colors cursor-pointer" size={16} />
          </div>
          
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-[0.9] group-hover:text-indigo-400 transition-all duration-500 line-clamp-2 font-outfit">
            {recording.title}
          </h3>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
            <ActivityPulse size={10} />
            {recording.courseName}
          </p>
        </div>

        <button 
          onClick={onPlay}
          className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-[3px] text-[11px] shadow-2xl shadow-white/5 hover:bg-indigo-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-4 group/btn overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
          <span className="relative z-10 flex items-center gap-3">
             <PlayCircle className="w-5 h-5" />
             Watch_Session
          </span>
          <ChevronRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

function StatCardMini({ label, value, icon }: any) {
  return (
    <div className="px-6 py-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center gap-4">
       <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30">
          {icon}
       </div>
       <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{label}</span>
          <span className="text-lg font-black text-white tabular-nums leading-none mt-1">{value}</span>
       </div>
    </div>
  );
}

function ActivityPulse({ size = 12 }: { size?: number }) {
  return (
    <div className="flex items-center gap-0.5 h-3">
       <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-indigo-500 rounded-full" />
       <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-0.5 bg-indigo-500 rounded-full" />
       <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-0.5 bg-indigo-500 rounded-full" />
    </div>
  );
}
