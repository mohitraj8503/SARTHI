'use client';

import { useState } from 'react';
import {
  Video, Users, Activity, Radio, RefreshCw, Search,
  Power, ExternalLink, Clock, MessageSquare,
  Shield, CheckCircle2, BookOpen, Trash2, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

export default function LiveMissionControl() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ALL' | 'RECORDINGS'>('ACTIVE');

  // Fetch Live Classes list
  const { data: liveClassesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-live-classes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/live');
      if (!res.ok) throw new Error('Failed to fetch live classes');
      const data = await res.json();
      return data.data?.liveClasses || [];
    },
    refetchInterval: 10000 // Poll every 10 seconds
  });

  // Fetch Analytics Rollups
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-live-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/live?mode=analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      return data.data;
    }
  });

  // Force End Class Mutation
  const endClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const res = await fetch(`/api/teacher/live/${classId}/end`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to end class');
      return res.json();
    },
    onSuccess: () => {
      addToast({ message: 'Live class terminated successfully.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-live-classes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-live-analytics'] });
    },
    onError: () => {
      addToast({ message: 'Failed to terminate class.', type: 'error' });
    }
  });

  // Delete Recording Mutation
  const deleteRecordingMutation = useMutation({
    mutationFn: async ({ recordingId, deleteFromYoutube }: { recordingId: string; deleteFromYoutube: boolean }) => {
      const res = await fetch(`/api/admin/live?recordingId=${recordingId}&deleteFromYoutube=${deleteFromYoutube}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete recording');
      return res.json();
    },
    onSuccess: () => {
      addToast({ message: 'Recording deleted successfully.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-live-classes'] });
    },
    onError: () => {
      addToast({ message: 'Failed to delete recording.', type: 'error' });
    }
  });

  const liveClasses = liveClassesData || [];

  // Filter based on search term and active view tab
  const filteredClasses = liveClasses.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ACTIVE') return c.status === 'LIVE';
    if (activeTab === 'RECORDINGS') return !!c.recording;
    return true; // ALL tab
  });

  const activeSessionsCount = liveClasses.filter((c: any) => c.status === 'LIVE').length;
  const activeStudentsCount = liveClasses
    .filter((c: any) => c.status === 'LIVE')
    .reduce((acc: number, c: any) => acc + (c.attendances?.filter((a: any) => !a.leftAt).length || 0), 0);

  return (
    <div className="px-4 md:px-10 pt-6 pb-20 space-y-8 max-w-[1600px] w-full mx-auto">
      {/* Header Section */}
      <header className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">LIVE OPERATIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[0.95]">
            MISSION <span className="text-[#F97316]">CONTROL</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs sm:text-sm mt-2 font-sans not-italic">
            YouTube Live Classrooms &amp; Recording Node Monitor.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-initial xl:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by instructor or course..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-slate-100 w-full shadow-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-slate-400 hover:text-slate-700 shrink-0"
          >
            <RefreshCw className={cn("w-4.5 h-4.5", isLoading && "animate-spin")} />
          </button>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Channels</p>
            <h3 className="text-2xl font-black text-slate-950">{activeSessionsCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Concurrent Students</p>
            <h3 className="text-2xl font-black text-slate-950">{activeStudentsCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Watch Duration</p>
            <h3 className="text-2xl font-black text-slate-950">
              {analyticsData?.avgWatchDurationMinutes || 0} min
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Classes Scheduled</p>
            <h3 className="text-2xl font-black text-slate-950">{analyticsData?.totalClasses || 0}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200 overflow-x-auto no-scrollbar mx-4 sm:mx-0">
        {[
          { id: 'ACTIVE', label: `Active Broadcasts (${activeSessionsCount})` },
          { id: 'RECORDINGS', label: 'Archived Recordings' },
          { id: 'ALL', label: 'All Scheduled Classes' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm font-black"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Session Cards List */}
      {filteredClasses.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 mx-4 sm:mx-0">
          <Video className="w-12 h-12 text-slate-350 mx-auto mb-4" />
          <h3 className="text-base font-black text-slate-700 uppercase tracking-wide">No classes found</h3>
          <p className="text-xs text-slate-450 mt-1 font-medium">Select a different tab or refine your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-4 sm:px-0">
          {filteredClasses.map((item: any) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                {/* Header Banner */}
                <div className="h-28 bg-slate-900 flex flex-col justify-between p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      {item.course?.title || 'Unknown Course'}
                    </span>
                    {item.status === 'LIVE' ? (
                      <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white" />
                        Live
                      </span>
                    ) : item.status === 'ENDED' ? (
                      <span className="bg-slate-700 text-slate-300 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                        Ended
                      </span>
                    ) : (
                      <span className="bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>
                  <h3 className="text-white text-sm font-black tracking-tight leading-tight line-clamp-2 relative z-10">
                    {item.title}
                  </h3>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-400">Instructor</span>
                    <span className="font-semibold text-slate-900">{item.teacher?.name || 'Tutor'}</span>
                  </div>

                  {item.scheduledAt && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-400">Scheduled Time</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(item.scheduledAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {item.status === 'LIVE' && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-xs text-rose-700">
                      <span className="font-bold uppercase tracking-wider">Live Students</span>
                      <span className="font-black text-rose-800">
                        {item.attendances?.filter((a: any) => !a.leftAt).length || 0}
                      </span>
                    </div>
                  )}

                  {item.recording && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2 text-xs text-blue-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider">Video Recording</span>
                        <span className="font-bold text-blue-900">Processed</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span>Duration: {item.recording.durationSeconds ? `${Math.round(item.recording.durationSeconds / 60)} min` : 'Unknown'}</span>
                        <a 
                          href={`https://youtube.com/watch?v=${item.recording.youtubeVideoId}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="font-bold uppercase text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Watch on YouTube <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-50 flex gap-2">
                {item.status === 'LIVE' && (
                  <>
                    <a
                      href={`/live/${item.id}`} // student preview link
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-800 h-10 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Monitor Stream
                    </a>
                    <button
                      onClick={() => {
                        endClassMutation.mutate(item.id);
                      }}
                      className="p-2.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all"
                      title="Force Terminate"
                    >
                      <Power className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}

                {item.recording && (
                  <button
                    onClick={() => {
                      deleteRecordingMutation.mutate({ recordingId: item.recording.id, deleteFromYoutube: false });
                    }}
                    className="w-full bg-red-50/50 hover:bg-red-50 border border-red-100 hover:border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 h-10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Recording
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
