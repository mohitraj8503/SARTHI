'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Loader2, 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Course {
  id: string;
  title: string;
}

export default function CreateAssignmentModal({ isOpen, onClose }: CreateAssignmentModalProps) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    totalQuestions: '10',
    dueAt: '',
    timeLimit: '60'
  });

  // Fetch teacher's courses for the dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['teacher-courses-simple'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/courses');
      if (!res.ok) return { courses: [] };
      return res.json();
    },
    enabled: isOpen
  });

  const courses: Course[] = coursesData?.courses || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.courseId) throw new Error('Please select a course');
      if (!formData.title) throw new Error('Assignment title is required');

      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to create assignment');

      addToast({
        type: 'success',
        title: 'Assignment Created',
        message: 'Your new assessment has been synthesized successfully.'
      });

      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        courseId: '',
        totalQuestions: '10',
        dueAt: '',
        timeLimit: '60'
      });
    } catch (err: any) {
      setError(err.message);
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">New Assessment</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure Evaluation Protocol</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form id="create-assignment-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info Group */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1 w-3 bg-orange-500 rounded-full" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">IDENTIFICATION</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Course</label>
                  <div className="relative">
                    <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                    <select 
                      value={formData.courseId}
                      onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all appearance-none"
                      required
                    >
                      <option value="" disabled>Select the curriculum node...</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assessment Title</label>
                  <div className="relative">
                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="e.g. Mid-term Performance Review"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Briefing / Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide specific instructions for the learners..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              {/* Parameters Group */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1 w-3 bg-blue-500 rounded-full" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">PARAMETERS</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Submission Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                      <input 
                        type="datetime-local" 
                        value={formData.dueAt}
                        onChange={(e) => setFormData({...formData, dueAt: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Time Limit (Mins)</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                      <input 
                        type="number" 
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                        min="5"
                        max="300"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm border border-slate-100">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Question Density</p>
                      <span className="text-xs font-black text-orange-600">{formData.totalQuestions} Questions</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({...formData, totalQuestions: e.target.value})}
                      className="w-full accent-orange-500 h-1.5 bg-white rounded-full appearance-none cursor-pointer border border-slate-100"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center gap-6 sticky bottom-0">
            <div className="flex items-center gap-3 text-slate-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest italic">Draft will be created automatically.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto md:ml-auto">
               <button 
                onClick={onClose}
                className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="create-assignment-form"
                disabled={loading}
                className="flex-1 md:flex-none bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Sync Assignment
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
