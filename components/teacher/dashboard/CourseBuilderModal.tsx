'use client';

import { useState } from 'react';
import { X, ChevronRight, Book, Layers, Image as ImageIcon, CreditCard, Send, Plus, GripVertical } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const steps = [
  { id: 'basic', label: 'Identity', icon: Book },
  { id: 'curriculum', label: 'Curriculum', icon: Layers },
  { id: 'pricing', label: 'Monetization', icon: CreditCard },
  { id: 'publish', label: 'Finalize', icon: Send },
];

export default function CourseBuilderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState('basic');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    modules: [
      { 
        title: 'Module 01: Introduction',
        lessons: [{ title: 'Getting Started', type: 'VIDEO' }]
      }
    ],
    thumbnail: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      onClose();
      // Optional: window.location.reload() or router.push
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

  // Prevent hydration mismatch
  if (typeof window === 'undefined') return null;

  const handlePublish = async () => {
    // Basic validation
    if (!formData.title.trim()) {
      alert('Please enter a course title');
      return;
    }

    mutation.mutate({
      ...formData,
      category: 'General',
      isPublished: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl h-[800px] rounded-[48px] overflow-hidden flex shadow-2xl relative animate-in fade-in zoom-in duration-300">
        
        {/* Left Sidebar: Steps */}
        <aside className="w-72 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
          <div className="mb-12">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Studio Builder</p>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Create Course</h2>
          </div>

          <div className="space-y-4 flex-1">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.id;
              return (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-white shadow-xl shadow-slate-200/50 scale-105 z-10' : 'opacity-60'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-50'}`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-black ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Step 0{idx + 1}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl text-white">
             <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Auto-save</p>
             <p className="text-xs font-bold">Draft saved just now</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all z-20">
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <main className="flex-1 p-16 overflow-y-auto">
            {currentStep === 'basic' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Start with the <span className="text-emerald-500">Essentials</span></h3>
                  <p className="text-slate-400 font-medium">Give your course a compelling identity.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Master React in 30 Days" 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      rows={4} 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the outcome for your students..." 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'curriculum' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Blueprint Your <span className="text-emerald-500">Knowledge</span></h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Structure your course with modules and lessons</p>
                  </div>
                </div>

                <div className="space-y-6">
                   {formData.modules.map((module: any, mIdx) => (
                     <div key={mIdx} className="p-8 bg-slate-50 rounded-[40px] border border-slate-200/50 space-y-6 relative group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                              0{mIdx + 1}
                           </div>
                           <input 
                             type="text"
                             value={module.title}
                             onChange={(e) => {
                               const newModules = [...formData.modules];
                               newModules[mIdx].title = e.target.value;
                               setFormData({ ...formData, modules: newModules });
                             }}
                             className="bg-transparent border-none p-0 text-sm font-black text-slate-900 uppercase tracking-widest focus:ring-0 w-full"
                           />
                        </div>

                        {/* Lessons within Module */}
                        <div className="pl-14 space-y-3">
                           {module.lessons?.map((lesson: any, lIdx: number) => (
                             <div key={lIdx} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group/lesson">
                               <GripVertical className="w-4 h-4 text-slate-200" />
                               <input 
                                 type="text"
                                 value={lesson.title}
                                 onChange={(e) => {
                                   const newModules = [...formData.modules];
                                   newModules[mIdx].lessons[lIdx].title = e.target.value;
                                   setFormData({ ...formData, modules: newModules });
                                 }}
                                 placeholder="Lesson title..."
                                 className="flex-1 bg-transparent border-none p-0 text-xs font-bold text-slate-600 focus:ring-0"
                               />
                               <select 
                                 value={lesson.type}
                                 onChange={(e) => {
                                   const newModules = [...formData.modules];
                                   newModules[mIdx].lessons[lIdx].type = e.target.value;
                                   setFormData({ ...formData, modules: newModules });
                                 }}
                                 className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1 focus:ring-0"
                               >
                                 <option value="VIDEO">Video</option>
                                 <option value="READING">Reading</option>
                                 <option value="ASSIGNMENT">Task</option>
                                 <option value="QUIZ">Quiz</option>
                               </select>

                               <button 
                                 onClick={() => {
                                   const roomName = `lesson-${Math.random().toString(36).slice(2, 6)}`;
                                   window.open(`/teacher/live/${roomName}?title=${encodeURIComponent(lesson.title)}&course=${encodeURIComponent(formData.title)}`, '_blank');
                                 }}
                                 className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all group/live"
                                 title="Go Live with this lesson"
                               >
                                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                               </button>
                             </div>
                           ))}
                           
                           <button 
                             onClick={() => {
                               const newModules = [...formData.modules];
                               if (!newModules[mIdx].lessons) newModules[mIdx].lessons = [];
                               newModules[mIdx].lessons.push({ title: 'New Lesson', type: 'VIDEO' });
                               setFormData({ ...formData, modules: newModules });
                             }}
                             className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors pt-2 ml-4"
                           >
                             <Plus className="w-3 h-3" /> Add Lesson
                           </button>
                        </div>
                     </div>
                   ))}
                   
                   <button 
                     onClick={() => setFormData({ ...formData, modules: [...formData.modules, { title: `Module 0${formData.modules.length + 1}: New Module`, lessons: [] }] })}
                     className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[32px] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2"
                   >
                     <Plus className="w-4 h-4" /> Add New Module
                   </button>
                </div>
              </div>
            )}

            {currentStep === 'pricing' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Set Your <span className="text-emerald-500">Price</span></h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                  />
                </div>
              </div>
            )}
          </main>

          <footer className="p-8 border-t border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur">
            <button 
              disabled={currentStep === 'basic'}
              onClick={() => setCurrentStep(steps[steps.findIndex(s => s.id === currentStep) - 1].id)}
              className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0"
            >
              Back
            </button>
            <button 
              onClick={() => {
                const nextIdx = steps.findIndex(s => s.id === currentStep) + 1;
                if (nextIdx < steps.length) {
                  setCurrentStep(steps[nextIdx].id);
                } else {
                  handlePublish();
                }
              }}
              disabled={mutation.isPending}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
            >
              {mutation.isPending ? 'Publishing...' : currentStep === 'publish' ? 'Launch Course' : 'Next Step'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
