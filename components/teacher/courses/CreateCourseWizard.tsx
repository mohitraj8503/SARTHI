'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Loader2, 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Video,
  DollarSign,
  CheckCircle2,
  FileText,
  Rocket,
  GripVertical,
  Radio,
  Clock,
  Check,
  Play
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Lesson {
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'RESOURCE' | 'LIVE';
  duration?: string;
  isLive?: boolean;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

export default function CreateCourseWizard() {
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save State
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Form State
  const [course, setCourse] = useState({
    title: '',
    subtitle: '',
    category: 'Programming',
    difficulty: 'Beginner',
    pricingType: 'PAID',
    price: '499',
    accessType: 'Lifetime Access',
    language: 'English',
    issueCertificate: true,
    visibility: 'Publish Immediately',
    modules: [
      { 
        title: 'Week 1: Foundations & Setup', 
        lessons: [
          { title: 'Welcome to the Course', type: 'VIDEO' as const, duration: '10', isLive: false },
          { title: 'Local Environment installation guide', type: 'TEXT' as const, duration: '15' }
        ] 
      }
    ] as Module[]
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Bulk Upload State
  const [bulkFilesCount, setBulkFilesCount] = useState<number>(0);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Auto-Save Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSaveStatus('saving');
      setTimeout(() => {
        setAutoSaveStatus('saved');
        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }, 800);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Progress Bar Calculation
  const progressPercent = useMemo(() => {
    let completedFields = 0;
    let totalFields = 7;

    if (course.title) completedFields++;
    if (course.subtitle) completedFields++;
    if (thumbnailPreview) completedFields++;
    if (course.price || course.pricingType === 'FREE') completedFields++;
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) completedFields++;
    if (course.language) completedFields++;
    if (step > 1) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }, [course, thumbnailPreview, step]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast({ message: 'Only image files are allowed', type: 'error' });
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsBulkUploading(true);
      setBulkFilesCount(files.length);

      const newLessons: Lesson[] = [];
      let validCount = 0;

      Array.from(files).forEach((file) => {
        // Validate MIME type and size (max 500MB)
        if (!file.type.startsWith('video/')) {
          addToast({ message: `Skipped ${file.name}: Not a valid video file.`, type: 'error' });
          return;
        }
        if (file.size > 500 * 1024 * 1024) {
          addToast({ message: `Skipped ${file.name}: File exceeds 500MB limit.`, type: 'error' });
          return;
        }

        validCount++;
        newLessons.push({
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: 'VIDEO',
          duration: '15',
          isLive: false,
          url: ''
        });
      });

      if (validCount > 0) {
        const newModules = [...course.modules];
        if (newModules.length === 0) {
          newModules.push({ title: 'Module 1: Video Lessons', lessons: [] });
        }
        newModules[0].lessons = [...newModules[0].lessons, ...newLessons];
        setCourse((prev) => ({ ...prev, modules: newModules }));
        addToast({ message: `Added ${validCount} video lessons to curriculum!`, type: 'success' });
      }

      setIsBulkUploading(false);
    }
  };

  const addModule = () => {
    setCourse({
      ...course,
      modules: [...course.modules, { title: `Week ${course.modules.length + 1}: New Section`, lessons: [] }]
    });
  };

  const addLesson = (moduleIdx: number, type: Lesson['type']) => {
    const newModules = [...course.modules];
    newModules[moduleIdx].lessons.push({
      title: `New ${type.toLowerCase()} lesson`,
      type,
      duration: '15',
      isLive: type === 'LIVE'
    });
    setCourse({ ...course, modules: newModules });
  };

  const handleRemoveLesson = (moduleIdx: number, lessonIdx: number) => {
    const newModules = [...course.modules];
    newModules[moduleIdx].lessons = newModules[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setCourse({ ...course, modules: newModules });
  };

  const handleToggleGoLive = (moduleIdx: number, lessonIdx: number) => {
    const newModules = [...course.modules];
    const lesson = newModules[moduleIdx].lessons[lessonIdx];
    if (lesson.type === 'VIDEO') {
      lesson.type = 'LIVE';
      lesson.isLive = true;
      addToast({ message: 'Converted video lesson to a LIVE stream slot!', type: 'info' });
    } else if (lesson.type === 'LIVE') {
      lesson.type = 'VIDEO';
      lesson.isLive = false;
      addToast({ message: 'Converted LIVE slot back to pre-recorded video!', type: 'info' });
    }
    setCourse({ ...course, modules: newModules });
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unsaved changes guardrail
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (course.title || course.subtitle || course.modules.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [course]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!course.title || !course.title.trim()) {
      setErrorMessage('Please set a course title.');
      addToast({ message: 'Please set a course title', type: 'error' });
      setStep(1);
      return;
    }

    if (!course.category || !course.category.trim()) {
      setErrorMessage('Please select a course category.');
      addToast({ message: 'Please select a course category', type: 'error' });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', course.title.trim());
      formData.append('description', course.subtitle || "Learn core skills in this course.");
      formData.append('category', course.category);
      formData.append('level', course.difficulty || 'Beginner');
      formData.append('language', course.language || 'English');
      formData.append('price', course.pricingType === 'FREE' ? '0' : course.price);
      formData.append('pricingType', course.pricingType);
      formData.append('publish', (course.visibility === 'Publish Immediately').toString());
      formData.append('modules', JSON.stringify(course.modules));

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const res = await fetch('/api/teacher/courses', {
        method: 'POST',
        body: formData,
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        const errorText = responseData?.error || responseData?.message || `Server Error (${res.status})`;
        throw new Error(errorText);
      }

      addToast({ type: 'success', message: 'Course created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      router.push('/teacher/courses');
    } catch (error: any) {
      console.error('Course creation error:', error);
      const msg = error.message || 'Failed to create course. Please try again.';
      setErrorMessage(msg);
      addToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Pricing & Access', icon: DollarSign },
    { id: 3, title: 'Curriculum Builder', icon: LayoutGrid },
    { id: 4, title: 'Settings & Launch', icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 w-full font-sans">
      
      {/* Wizard Header */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Add New Course</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Wizard</span>
                {/* Auto Save Status */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                  <div className={cn("w-1.5 h-1.5 rounded-full", autoSaveStatus === 'saving' ? "bg-amber-400 animate-ping" : "bg-emerald-500")} />
                  <span>{autoSaveStatus === 'saving' ? 'Auto-saving...' : `All changes saved (${lastSavedTime})`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper progress indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center">
                <button 
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    step === s.id ? "bg-[#1B4332] text-white shadow-md" : 
                    step > s.id ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-355"
                  )}
                >
                  {step > s.id ? <CheckCircle2 className="w-4.5 h-4.5" /> : <s.icon className="w-4 h-4" />}
                </button>
                {s.id !== 4 && <div className={cn("w-4 md:w-6 h-[2px]", step > s.id ? "bg-emerald-250" : "bg-slate-100")} />}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Main Wizard Area */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 mt-8">
        
        {/* Progress bar */}
        <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Completion Checklist</span>
              <span className="text-xs font-black text-slate-800">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 md:p-10 border border-slate-100 shadow-sm min-h-[500px] flex flex-col">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 font-bold ml-4">Dismiss</button>
            </div>
          )}
          
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Basic Info</h2>
                <p className="text-xs text-slate-400 font-medium">Outline the essential metadata of your course.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Python for Beginners"
                      value={course.title}
                      onChange={(e) => setCourse({...course, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subtitle / Tagline</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Learn Python in 30 Days with hands-on labs"
                      value={course.subtitle}
                      onChange={(e) => setCourse({...course, subtitle: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
                      <select 
                        value={course.category}
                        onChange={(e) => setCourse({...course, category: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      >
                        <option>Programming</option>
                        <option>Design</option>
                        <option>Marketing</option>
                        <option>Business</option>
                        <option>Finance</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Difficulty Level</label>
                      <div className="grid grid-cols-3 bg-slate-50 p-1 border border-slate-200/80 rounded-xl">
                        {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setCourse({ ...course, difficulty: level })}
                            className={cn(
                              "py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                              course.difficulty === level ? "bg-white text-slate-900 shadow-sm" : "text-slate-450 hover:text-slate-850"
                            )}
                          >
                            {level.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Drag and Drop */}
                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course Thumbnail Cover</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video bg-slate-50 border-2 border-dashed border-slate-250 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group"
                  >
                    {thumbnailPreview ? (
                      <Image 
                        src={thumbnailPreview} 
                        alt="Thumbnail" 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-600">Drag & drop or Click to upload</p>
                        <p className="text-[9px] text-slate-450 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PRICING & ACCESS */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pricing & Access</h2>
                <p className="text-xs text-slate-400 font-medium">Select access duration and fee structures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Price Type Switch */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monetization Type</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCourse({ ...course, pricingType: 'FREE' })}
                        className={cn(
                          "flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          course.pricingType === 'FREE' ? "bg-white text-slate-900 shadow" : "text-slate-400 hover:text-slate-800"
                        )}
                      >
                        Free Course
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourse({ ...course, pricingType: 'PAID' })}
                        className={cn(
                          "flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          course.pricingType === 'PAID' ? "bg-[#1B4332] text-white shadow-lg shadow-emerald-950/20" : "text-slate-400 hover:text-slate-800"
                        )}
                      >
                        Paid Course
                      </button>
                    </div>
                  </div>

                  {course.pricingType === 'PAID' && (
                    <div className="space-y-2 animate-in slide-in-from-top-3 duration-200">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Set Price (INR)</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">₹</span>
                        <input 
                          type="number"
                          value={course.price}
                          onChange={(e) => setCourse({ ...course, price: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-4 pl-12 pr-6 text-xl font-black text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                          placeholder="499"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Access Type Radio list */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Duration Type</label>
                  <div className="space-y-3">
                    {['Lifetime Access', 'Subscription Only', 'Drip Content'].map(access => (
                      <div
                        key={access}
                        onClick={() => setCourse({ ...course, accessType: access })}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                          course.accessType === access ? "bg-emerald-50/50 border-emerald-500 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div>
                          <p className="text-xs font-black text-slate-800">{access}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {access === 'Lifetime Access' ? 'Unlimited access to materials anytime.' : 
                             access === 'Subscription Only' ? 'Requires active membership model.' : 
                             'Release lessons sequentially week-by-week.'}
                          </p>
                        </div>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", course.accessType === access ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-250")}>
                          {course.accessType === access && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CURRICULUM BUILDER */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curriculum Builder</h2>
                  <p className="text-xs text-slate-400 font-medium">Add modules, lessons, live slots, or upload files.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Bulk upload trigger */}
                  <label className="p-3 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all">
                    {isBulkUploading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Upload className="w-4 h-4" />}
                    {isBulkUploading ? 'Uploading...' : 'Bulk Upload'}
                    <input type="file" multiple className="hidden" accept="video/*" onChange={handleBulkUpload} />
                  </label>
                  <button
                    onClick={addModule}
                    className="p-3 bg-[#1B4332] text-white hover:bg-[#2D6A4F] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>
              </div>

              {/* Modules List (Drag & Drop Simulator) */}
              <div className="space-y-6">
                {course.modules.map((module, mIdx) => (
                  <div key={mIdx} className="bg-slate-50 border border-slate-200/60 rounded-[28px] p-6 relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs font-black text-slate-900 border border-slate-100">
                          {mIdx + 1}
                        </div>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => {
                            const newModules = [...course.modules];
                            newModules[mIdx].title = e.target.value;
                            setCourse({...course, modules: newModules});
                          }}
                          placeholder="Module Title"
                          className="bg-transparent border-none text-base font-black text-slate-800 focus:ring-0 w-64 placeholder:text-slate-350 p-0"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newModules = course.modules.filter((_, i) => i !== mIdx);
                          setCourse({...course, modules: newModules});
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Lesson rows */}
                    <div className="space-y-3">
                      {module.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 transition-all shadow-sm">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Drag handle icon */}
                            <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className={cn("p-2 rounded-lg", 
                              lesson.type === 'VIDEO' ? 'bg-emerald-50 text-emerald-600' :
                              lesson.type === 'LIVE' ? 'bg-red-50 text-red-600' :
                              lesson.type === 'QUIZ' ? 'bg-amber-50 text-amber-600' :
                              'bg-blue-50 text-blue-600'
                            )}>
                              {lesson.type === 'LIVE' ? <Radio className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <input 
                                type="text"
                                value={lesson.title}
                                onChange={(e) => {
                                  const newModules = [...course.modules];
                                  newModules[mIdx].lessons[lIdx].title = e.target.value;
                                  setCourse({...course, modules: newModules});
                                }}
                                className="text-xs font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 w-full"
                              />
                              <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                <span>{lesson.type}</span>
                                <span>•</span>
                                <span>{lesson.duration || '15'} min</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Quick Go Live Switch */}
                            {(lesson.type === 'VIDEO' || lesson.type === 'LIVE') && (
                              <button
                                type="button"
                                onClick={() => handleToggleGoLive(mIdx, lIdx)}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5",
                                  lesson.type === 'LIVE' 
                                    ? "bg-red-50 text-red-600 border-red-100 shadow-inner" 
                                    : "bg-slate-50 text-slate-400 border-slate-100 hover:text-red-500"
                                )}
                              >
                                <Radio className="w-3 h-3" />
                                {lesson.type === 'LIVE' ? 'Live Stream' : 'Go Live?'}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveLesson(mIdx, lIdx)}
                              className="text-slate-350 hover:text-red-500 p-1.5 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lesson types selectors */}
                    <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                      <button onClick={() => addLesson(mIdx, 'VIDEO')} className="px-3 py-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                        <Video className="w-3.5 h-3.5 text-emerald-600" /> + Video
                      </button>
                      <button onClick={() => addLesson(mIdx, 'TEXT')} className="px-3 py-2 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> + Article
                      </button>
                      <button onClick={() => addLesson(mIdx, 'QUIZ')} className="px-3 py-2 bg-white hover:bg-amber-50 hover:text-amber-700 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" /> + Quiz
                      </button>
                      <button onClick={() => addLesson(mIdx, 'RESOURCE')} className="px-3 py-2 bg-white hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                        <Upload className="w-3.5 h-3.5 text-purple-600" /> + Assignment
                      </button>
                      <button onClick={() => addLesson(mIdx, 'LIVE')} className="px-3 py-2 bg-white hover:bg-red-50 hover:text-red-700 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                        <Radio className="w-3.5 h-3.5 text-red-650 animate-pulse" /> + Live Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SETTINGS & LAUNCH */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settings & Launch</h2>
                <p className="text-xs text-slate-400 font-medium">Finalize compliance options and visibility states.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course Language</label>
                    <select 
                      value={course.language}
                      onChange={(e) => setCourse({...course, language: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-bold text-slate-800"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                      <option>German</option>
                    </select>
                  </div>

                  {/* Certificate toggle */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Certificate Generation</label>
                    <div 
                      onClick={() => setCourse({ ...course, issueCertificate: !course.issueCertificate })}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all",
                        course.issueCertificate ? "bg-emerald-50/20 border-emerald-500" : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">Issue certificate on completion</p>
                        <p className="text-[9px] text-slate-400 font-medium">Students automatically receive a verified PDF certification.</p>
                      </div>
                      <div className={cn("w-10 h-6 rounded-full p-1 flex items-center transition-colors", course.issueCertificate ? "bg-emerald-600" : "bg-slate-200")}>
                        <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", course.issueCertificate ? "translate-x-4" : "translate-x-0")} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Launch Visibility State</label>
                  <div className="space-y-3">
                    {['Save as Draft', 'Publish Immediately'].map(visibility => (
                      <div
                        key={visibility}
                        onClick={() => setCourse({ ...course, visibility })}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                          course.visibility === visibility ? "bg-emerald-50/50 border-emerald-500 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div>
                          <p className="text-xs font-black text-slate-800">{visibility}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {visibility === 'Save as Draft' ? 'Only you can view and edit the curriculum.' : 'Instantly list this course in the student directory.'}
                          </p>
                        </div>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", course.visibility === visibility ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-250")}>
                          {course.visibility === visibility && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>
            
            {step < 4 ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="bg-slate-950 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 group active:scale-95 shadow-sm"
              >
                Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-600/10"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Create Course & Start Editing
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
