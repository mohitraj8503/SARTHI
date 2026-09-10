'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Upload, Youtube, Link as LinkIcon, Cloud, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

import { useRef } from 'react';
import { FileVideo } from 'lucide-react';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoUploadModal({ isOpen, onClose }: VideoUploadModalProps) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'link' | 'youtube' | 'direct'>('link');
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    url: ''
  });

  const { data: coursesData } = useQuery({
    queryKey: ['teacher-courses-simple'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/courses');
      if (!res.ok) return [];
      const data = await res.json();
      return data.courses || [];
    },
    enabled: isOpen
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (uploadType === 'direct') {
        if (!selectedFile) throw new Error('Please select a video file.');
        const uploadFormData = new FormData();
        uploadFormData.append('video', selectedFile);
        uploadFormData.append('title', data.title);
        uploadFormData.append('courseId', data.courseId);
        
        const res = await fetch('/api/teacher/videos/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to upload video');
        }
        return res.json();
      } else {
        const res = await fetch('/api/teacher/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to upload video');
        }
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-recordings'] });
      addToast('Video asset added to vault successfully', 'success');
      onClose();
      setFormData({ title: '', courseId: '', url: '' });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      addToast(error.message, 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadType !== 'direct' && !formData.url) {
      addToast('Please provide a video source', 'error');
      return;
    }
    if (uploadType === 'direct' && !selectedFile) {
      addToast('Please select a video file to upload', 'error');
      return;
    }
    uploadMutation.mutate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1 w-3 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">New Asset</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Upload <span className="text-emerald-500">Video</span></h2>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8">
              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'link', icon: LinkIcon, label: 'Direct Link' },
                  { id: 'youtube', icon: Youtube, label: 'YouTube' },
                  { id: 'direct', icon: Upload, label: 'File Upload' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setUploadType(type.id as any)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      uploadType === type.id 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    )}
                  >
                    <type.icon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Introduction to Neural Networks"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {uploadType === 'youtube' ? 'YouTube URL' : uploadType === 'link' ? 'Direct Video URL' : 'Upload File'}
                  </label>
                  {uploadType === 'direct' ? (
                    <div className="space-y-4">
                      {selectedFile ? (
                        <div className="bg-slate-50 p-6 rounded-[24px] flex items-center justify-between border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                              <FileVideo className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 tracking-tight max-w-[280px] truncate">{selectedFile.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="p-3 text-slate-400 hover:text-red-505 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-32 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                        >
                          <Cloud className="w-8 h-8 text-slate-300 group-hover:text-emerald-500" />
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                            Drag & Drop or Click to Browse
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            if (!formData.title) {
                              setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <input
                      required
                      type="url"
                      placeholder={uploadType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://cdn.com/video.mp4'}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link to Course (Optional)</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  >
                    <option value="">No Course Link</option>
                    {coursesData?.map((course: any) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Confirm & Process
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
