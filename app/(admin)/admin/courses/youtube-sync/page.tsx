'use client';

import Image from 'next/image';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Youtube,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function YouTubeSyncPage() {
  const { addToast } = useToast();
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);

  // 1. Fetch Admin Playlists
  const {
    data: playlists,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-youtube-playlists'],
    queryFn: async () => {
      const res = await fetch('/api/admin/youtube/playlists'); // I need to create this simple GET
      if (!res.ok) throw new Error('Failed to fetch playlists');
      return res.json();
    },
  });

  // 2. Sync Mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncAll: selectedPlaylists.length === 0,
          playlistIds: selectedPlaylists,
        }),
      });
      if (!res.ok) throw new Error('Sync failed');
      return res.json();
    },
    onSuccess: (data) => {
      addToast({ message: `Successfully synced ${data.synced.length} courses!`, type: 'success' });
    },
    onError: (error: any) => {
      addToast({ message: error.message, type: 'error' });
    },
  });

  const togglePlaylist = (id: string) => {
    setSelectedPlaylists((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-red-600">
              <Youtube className="w-8 h-8" />
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                YouTube Sync Center
              </h1>
            </div>
            <p className="text-gray-500 font-medium">
              Automatic course creation from Mohak Raj&apos;s playlists.
            </p>
          </div>
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="px-10 py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-orange transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl"
          >
            {syncMutation.isPending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {selectedPlaylists.length > 0
              ? `Sync Selected (${selectedPlaylists.length})`
              : 'Sync All Playlists'}
          </button>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists?.items?.map((playlist: any) => (
            <div
              key={playlist.id}
              onClick={() => togglePlaylist(playlist.id)}
              className={`relative bg-white rounded-3xl overflow-hidden border-2 transition-all cursor-pointer group ${selectedPlaylists.includes(playlist.id)
                ? 'border-brand-orange ring-4 ring-orange-50'
                : 'border-gray-100 hover:border-gray-200'
                }`}
            >
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={playlist?.snippet?.thumbnails?.high?.url || ''}
                  alt={playlist?.snippet?.title || 'Video Thumbnail'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/70 text-white text-[10px] font-bold rounded-full">
                  {playlist?.contentDetails?.itemCount || 0} Videos
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="font-black text-gray-900 line-clamp-2 leading-tight">
                  {playlist?.snippet?.title || 'Untitled Playlist'}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 font-medium">
                  {playlist?.snippet?.description || 'No description available'}
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                  <a
                    href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] uppercase font-black tracking-widest text-brand-deep-knowledge-blue flex items-center gap-1 hover:underline"
                  >
                    View on YT <ExternalLink className="w-2 h-2" />
                  </a>
                  {selectedPlaylists.includes(playlist.id) && (
                    <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isError && (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center gap-4 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <p className="font-bold">
              Error loading playlists. Please ensure your YouTube channel is connected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

