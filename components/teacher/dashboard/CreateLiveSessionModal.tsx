'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, BookOpen, Users, Lock, Unlock, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editSession?: any;
}

export default function CreateLiveSessionModal({ isOpen, onClose, onSuccess, editSession }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: editSession?.title || '',
    description: editSession?.description || '',
    date: editSession?.startTime ? new Date(editSession.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: editSession?.startTime ? new Date(editSession.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '10:00',
    durationMinutes: editSession?.durationMinutes || 60,
    privacy: editSession?.privacy || 'enrolled',
    courseId: editSession?.courseId || '',
    meetingPlatform: editSession?.meetingPlatform || 'livekit'
  });

  // Reset form when editSession changes
  useState(() => {
    if (editSession && isOpen) {
      setFormData({
        title: editSession.title || '',
        description: editSession.description || '',
        date: new Date(editSession.startTime).toISOString().split('T')[0],
        time: new Date(editSession.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: editSession.durationMinutes || 60,
        privacy: editSession.privacy || 'enrolled',
        courseId: editSession.courseId || '',
        meetingPlatform: editSession.meetingPlatform || 'livekit'
      });
    }
  });

  // Fetch courses on mount
  useState(() => {
    fetch('/api/teacher/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        else if (data.data && Array.isArray(data.data)) setCourses(data.data);
      })
      .catch(console.error);
  });

  // Keyboard Listeners
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        const form = document.querySelector('form');
        form?.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return addToast('Please enter a class title', 'error');

    const startTime = new Date(`${formData.date}T${formData.time}`);
    if (startTime < new Date() && !editSession) {
      return addToast('Cannot schedule sessions in the past', 'error');
    }

    setLoading(true);
    try {
      const url = editSession ? `/api/teacher/sessions/${editSession.id}` : '/api/teacher/sessions';
      const method = editSession ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startTime: startTime.toISOString(),
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to save session');

      addToast(editSession ? 'Session updated!' : 'Class scheduled successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{ willChange: 'transform, opacity' }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 id="modal-title" className="text-xl font-black text-slate-900 tracking-tight">
                  {editSession ? 'Edit Live Session' : 'Schedule Live Class'}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">SARTHI Meet</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 overflow-y-auto">
            {/* Title & Desc */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Advanced Physics Mechanics"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Course</label>
                  <select 
                    value={formData.courseId}
                    onChange={e => setFormData({...formData, courseId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all"
                  >
                    <option value="">No specific course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What will students learn in this session?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 outline-none transition-all resize-none h-24"
                />
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Date
                </label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Start Time
                  </label>
                  <input 
                    type="time" 
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Duration (min)</label>
                  <input 
                    type="number"
                    min={15}
                    max={300}
                    value={formData.durationMinutes}
                    onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Broadcast Platform</label>
              <div className="flex flex-wrap gap-3">
                {['livekit', 'google-meet', 'zoom', 'youtube'].map(platform => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setFormData({...formData, meetingPlatform: platform})}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      formData.meetingPlatform === platform 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {platform.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Access Control</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                  onClick={() => setFormData({...formData, privacy: 'public'})}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.privacy === 'public' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <Unlock className={`w-5 h-5 mb-2 ${formData.privacy === 'public' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className="text-sm font-black text-slate-900">Public</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Anyone with link can join</p>
                </div>
                
                <div 
                  onClick={() => setFormData({...formData, privacy: 'enrolled'})}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.privacy === 'enrolled' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <Users className={`w-5 h-5 mb-2 ${formData.privacy === 'enrolled' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <p className="text-sm font-black text-slate-900">Enrolled Only</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Must be course student</p>
                </div>

                <div 
                  onClick={() => setFormData({...formData, privacy: 'private'})}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.privacy === 'private' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <Lock className={`w-5 h-5 mb-2 ${formData.privacy === 'private' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <p className="text-sm font-black text-slate-900">Private</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Teacher approval required</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                End-to-End Encrypted via SARTHI Live
              </p>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  {editSession ? 'Update Session' : 'Schedule Class'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

