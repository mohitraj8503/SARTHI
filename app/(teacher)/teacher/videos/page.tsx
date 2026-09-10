'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, 
  Search, 
  Upload, 
  Play, 
  Eye,
  Clock, 
  BarChart3, 
  MoreVertical,
  CloudUpload, 
  FileVideo,
  X, 
  Loader2, 
  CheckCircle, 
  Link as LinkIcon, 
  Trash2, 
  Copy,
  Plus,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import VideoVaultPlayer from '@/components/teacher/dashboard/VideoVaultPlayer';
import StatCard from '@/components/teacher/dashboard/StatCard';
import VideoUploadModal from '@/components/teacher/dashboard/VideoUploadModal';

interface VideoData {
  id: string;
  title: string;
  courseName: string;
  duration: string;
  viewCount: number;
  completionRate: number;
  status: 'published' | 'processing' | 'draft';
  youtubeUrl?: string;
  createdAt: string;
}

export default function TeacherVideosPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Videos');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Player State
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  const { data: videosData, isLoading } = useQuery({

    queryKey: ['teacher-recordings', user?.id],
    queryFn: async () => {
      const [videosRes, recordingsRes] = await Promise.all([
        fetch('/api/teacher/videos'),
        fetch('/api/teacher/recordings')
      ]);
      
      const videosData = await videosRes.json();
      const recordingsData = await recordingsRes.json();
      
      // Merge them
      const allVideos = [
        ...(videosData?.videos || []).map((v: any) => ({ ...v, type: 'course_video' })),
        ...(recordingsData?.recordings || []).map((r: any) => ({ ...r, type: 'cloud_recording', courseName: 'Cloud Vault' }))
      ];

      return {
        videos: allVideos,
        stats: recordingsData?.stats || videosData?.stats
      };
    }
  });

  const videos: VideoData[] = videosData?.videos || [];
  const statsData = videosData?.stats || { totalVideos: 0, totalWatchTime: '0h', avgCompletion: '0%' };

  const tabs = ['All Videos', 'Published', 'Processing', 'Draft'];

  const filteredVideos = useMemo(() => {
    const videos: VideoData[] = videosData?.videos || [];
    return videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All Videos' || v.status.toLowerCase() === activeTab.toLowerCase().replace(' videos', '');
      return matchesSearch && matchesTab;
    });
  }, [videosData?.videos, searchQuery, activeTab]);

  if (isLoading) return <VideosSkeleton />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Directory Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">VIDEO ASSETS</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                VIDEO <span className="text-orange-500">VAULT</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-3">Manage and optimize your media assets. Monitor playback analytics and delivery health.</p>
            </div>

            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Upload className="w-4.5 h-4.5" />
              Upload New Video
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="Total Library"
              value={statsData.totalVideos}
              change={5}
              icon={Video}
              color="emerald"
            />
            <StatCard 
              title="Total Playtime"
              value={statsData.totalWatchTime}
              change={18}
              icon={Clock}
              color="blue"
            />
            <StatCard 
              title="Avg Completion"
              value={statsData.avgCompletion}
              change={2}
              icon={BarChart3}
              color="amber"
            />
            <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center text-center border-dashed border-2">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Encoding Live</span>
               </div>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">All Nodes Healthy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-8 md:mt-10">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          <div className="flex-1 flex items-center gap-4 px-4 py-2 lg:py-0 border-b lg:border-b-0 border-slate-50">
            <Search className="w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by video title, course, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    activeTab === tab 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-100" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                </th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Video Asset</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Linked Course</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Analytics</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredVideos.map((video) => (
                <tr key={video.id} className="group hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-8 py-6 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                         <Play className="w-4 h-4 fill-current relative z-10" />
                         <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{video.title}</p>
                           <span className={cn(
                             "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                             (video as any).type === 'cloud_recording' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                           )}>
                             {(video as any).type === 'cloud_recording' ? 'Cloud' : 'Course'}
                           </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{video.duration} • {(video as any).storage === 'google_drive' ? 'Google Drive' : 'MP4'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-slate-500 tracking-tight">{video.courseName || 'Unlinked Asset'}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-6">
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{video.viewCount}</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Views</p>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{video.completionRate}%</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Avg Completion</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                      video.status === 'published' ? "bg-emerald-50 text-emerald-600" : 
                      video.status === 'processing' ? "bg-amber-50 text-amber-600" : 
                      "bg-slate-100 text-slate-500"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        video.status === 'published' ? "bg-emerald-500" : 
                        video.status === 'processing' ? "bg-amber-500" : 
                        "bg-slate-400"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{video.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => setSelectedVideo({ url: video.youtubeUrl || '', title: video.title })}
                         className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                       >
                         <Play className="w-4.5 h-4.5" />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                         <MoreHorizontal className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredVideos.length === 0 && (
            <div className="py-20 text-center">
              <FileVideo className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Vault is empty</h3>
              <p className="text-sm text-slate-500 font-medium mt-2">Upload your first video to start building your library.</p>
            </div>
          )}
        </div>
      </main>

      {/* Cinematic Player Overlay */}
      <VideoVaultPlayer 
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url || ''}
        title={selectedVideo?.title || ''}
      />

      {/* Upload Modal */}
      <VideoUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>

  );
}

function VideosSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 animate-pulse">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <div className="h-40 bg-white rounded-[32px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-[32px]" />)}
        </div>
        <div className="h-20 bg-white rounded-[24px]" />
        <div className="h-96 bg-white rounded-[32px]" />
      </div>
    </div>
  );
}

