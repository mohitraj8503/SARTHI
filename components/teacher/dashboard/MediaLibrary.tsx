'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Upload, FileText, Video, Image as ImageIcon, Music, MoreVertical, Trash2, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function MediaLibrary() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: assets, isLoading } = useQuery({
    queryKey: ['media-assets', filter, search],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/media?type=${filter === 'all' ? '' : filter}&query=${search}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-rose-500" />;
      case 'audio': return <Music className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Content <span className="text-emerald-500">Vault</span></h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Centralized Media Management</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
          <Upload className="w-4 h-4" />
          Bulk Upload
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900" />
          <input 
            type="text" 
            placeholder="Search your library..." 
            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wider focus:ring-2 focus:ring-slate-900"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="video">Videos</option>
          <option value="image">Images</option>
          <option value="pdf">Documents</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-50 rounded-3xl animate-pulse" />
          ))
        ) : assets?.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Upload className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-bold">Your vault is empty</p>
          </div>
        ) : (
          assets?.map((asset: any) => (
            <div key={asset.id} className="group bg-slate-50 rounded-[32px] p-2 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div className="aspect-video rounded-[24px] bg-slate-200 mb-4 overflow-hidden relative">
                {asset.thumbnailUrl ? (
                  <Image 
                    src={asset.thumbnailUrl} 
                    alt={asset.title || "Media asset"} 
                    width={320}
                    height={180}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    unoptimized={asset.thumbnailUrl.startsWith('http')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getIcon(asset.fileType)}
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {asset.fileType}
                </div>
              </div>
              <div className="px-3 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-black text-slate-900 truncate pr-4">{asset.title}</p>
                  <button className="text-slate-300 hover:text-slate-900">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  <span>{format(new Date(asset.createdAt), 'MMM d, yyyy')}</span>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">Used in {asset.usageCount} courses</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

