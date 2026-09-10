'use client';

import { useQuery } from '@tanstack/react-query';
import { Video, Calendar, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Recording {
  id: string;
  title: string;
  courseTitle: string;
  createdAt: string;
  uploadStatus: string;
  embedUrl: string;
}

export default function RecordingHistory() {
  const { data, isLoading } = useQuery<Recording[]>({
    queryKey: ['recording-history'],
    queryFn: () => fetch('/api/teacher/recordings/history')
      .then(res => res.json())
      .then(j => j.data || [])
      .catch(() => []),
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="animate-pulse h-40 bg-slate-50 rounded-[32px]" />;

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Recording History</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Automated sync status</p>
        </div>
        <Video className="w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        {data?.length === 0 ? (
          <div className="text-center py-10">
            <Video className="w-8 h-8 text-slate-100 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recordings yet</p>
          </div>
        ) : (
          data?.map((rec) => (
            <div key={rec.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 truncate max-w-[150px]">{rec.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{rec.courseTitle}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {rec.uploadStatus === 'ready' ? (
                  <div className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Synced</span>
                  </div>
                ) : rec.uploadStatus === 'processing' ? (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Processing</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Failed</span>
                  </div>
                )}
                
                <a 
                  href={rec.embedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-200"
                >
                  <ArrowUpRight className="w-4 h-4 text-slate-900" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-6 py-3 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all">
        View All Records
      </button>
    </div>
  );
}

