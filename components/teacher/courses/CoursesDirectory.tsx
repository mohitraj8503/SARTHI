'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Edit, 
  Eye, 
  Users, 
  IndianRupee, 
  MoreHorizontal, 
  Download, 
  Filter, 
  BookOpen,
  Copy, 
  Share2, 
  Archive, 
  Trash2, 
  BarChart3, 
  X,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';

interface Course {
  id: string;
  title: string;
  category: string;
  status: string;
  price: number;
  thumbnail: string | null;
  slug: string;
  studentsEnrolled: number;
  totalRevenue: number;
  totalVideos: number;
  createdAt: string;
}

interface CoursesDirectoryProps {
  initialCourses: Course[];
}

export default function CoursesDirectory({ initialCourses }: CoursesDirectoryProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [displaySearch, setDisplaySearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  // Dropdown & Modal State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalType, setModalType] = useState<'analytics' | 'share' | 'delete' | null>(null);
  
  // Coupon Builder State
  const [discountPercent, setDiscountPercent] = useState('15');
  const [couponCode, setCouponCode] = useState('WELCOME15');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplaySearch(value);
    debouncedSearch(value);
  };

  const tabs = ['All', 'Published', 'Draft', 'Archived'];

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.slug?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || c.status.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [courses, searchQuery, activeTab]);

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredCourses.map(c => c.id)));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  // Actions
  const handleDuplicate = (course: Course) => {
    const duplicated: Course = {
      ...course,
      id: `dup-${Date.now()}`,
      title: `${course.title} (Copy)`,
      slug: `${course.slug}-copy`,
      studentsEnrolled: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString()
    };
    setCourses(prev => [duplicated, ...prev]);
    setActiveDropdownId(null);
  };

  const handleArchive = (courseId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const nextStatus = c.status === 'archived' ? 'draft' : 'archived';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
    setActiveDropdownId(null);
  };

  const handleDelete = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setModalType(null);
    setSelectedCourse(null);
  };

  const triggerModal = (course: Course, type: 'analytics' | 'share' | 'delete') => {
    setSelectedCourse(course);
    setModalType(type);
    setActiveDropdownId(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4 px-4 w-full">
          <Search className="w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search by title, category, or course ID..." 
            value={displaySearch}
            onChange={handleSearchChange}
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 w-full"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 justify-end w-full xl:w-auto">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  activeTab === tab 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-100" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block" />
          
          <button className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 transition-colors">
            <Filter className="w-4 h-4" />
            All Content
          </button>

          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-visible">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedCourses.size === filteredCourses.length && filteredCourses.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                  />
                </th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Course</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Stats</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="group hover:bg-[#F8FAFC] transition-colors relative">
                  <td className="px-8 py-6">
                    <input 
                      type="checkbox" 
                      checked={selectedCourses.has(course.id)}
                      onChange={() => handleSelectCourse(course.id)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                    />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative">
                        {course.thumbnail ? (
                          <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <Link href={`/teacher/courses/${course.id}`}>
                          <p className="text-sm font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 hover:text-emerald-600 transition-colors cursor-pointer">{course.title}</p>
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                             {course.slug || 'no-slug'}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-slate-500 tracking-tight">{course.category || 'General'}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-6">
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{course.studentsEnrolled || 0}</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</p>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{(course.price || 0).toLocaleString()}</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                      course.status === 'published' ? "bg-emerald-50 text-emerald-600" : 
                      course.status === 'draft' ? "bg-amber-50 text-amber-600" : 
                      "bg-slate-100 text-slate-500"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        course.status === 'published' ? "bg-emerald-500" : 
                        course.status === 'draft' ? "bg-amber-500" : 
                        "bg-slate-400"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{course.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                       <Link 
                        href={`/courses/${course.slug}`} 
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="View Course as Student"
                        target="_blank"
                       >
                         <Eye className="w-4.5 h-4.5" />
                       </Link>
                       <Link 
                        href={`/teacher/courses/${course.id}`} 
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Edit Course Content"
                       >
                         <Edit className="w-4.5 h-4.5" />
                       </Link>
                       
                       {/* Dropdown Container */}
                       <div className="relative inline-block text-left">
                         <button 
                           onClick={() => setActiveDropdownId(activeDropdownId === course.id ? null : course.id)}
                           className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                         >
                           <MoreHorizontal className="w-5 h-5" />
                         </button>

                         {activeDropdownId === course.id && (
                           <>
                             {/* Overlay to close */}
                             <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                             
                             <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl z-20 py-2.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                               <Link href={`/teacher/courses/${course.id}`} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                 <Edit className="w-4 h-4 text-slate-400" />
                                 Edit Course
                               </Link>
                               <Link href={`/courses/${course.slug}`} target="_blank" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                 <Eye className="w-4 h-4 text-slate-400" />
                                 View as Student
                               </Link>
                               <button 
                                 onClick={() => triggerModal(course, 'analytics')}
                                 className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                               >
                                 <BarChart3 className="w-4 h-4 text-slate-400" />
                                 Course Analytics
                               </button>
                               <button 
                                 onClick={() => handleDuplicate(course)}
                                 className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                               >
                                 <Copy className="w-4 h-4 text-slate-400" />
                                 Duplicate Course
                               </button>
                               <button 
                                 onClick={() => triggerModal(course, 'share')}
                                 className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                               >
                                 <Share2 className="w-4 h-4 text-slate-400" />
                                 Share / Promote
                               </button>
                               <button 
                                 onClick={() => handleArchive(course.id)}
                                 className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                               >
                                 <Archive className="w-4 h-4 text-slate-400" />
                                 {course.status === 'archived' ? 'Restore Course' : 'Archive Course'}
                               </button>
                               <div className="h-px bg-slate-100 my-1.5" />
                               <button 
                                 onClick={() => triggerModal(course, 'delete')}
                                 className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-650 hover:bg-red-50 transition-colors text-left"
                               >
                                 <Trash2 className="w-4 h-4 text-red-500" />
                                 Delete Course
                               </button>
                             </div>
                           </>
                         )}
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCourses.length === 0 && (
            <div className="py-20 text-center">
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">No courses found</h3>
              <p className="text-sm text-slate-500 font-medium mt-2">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* 1. ANALYTICS MODAL */}
      {modalType === 'analytics' && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => { setModalType(null); setSelectedCourse(null); }} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-650 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedCourse.title}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Performance Insights</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Enrolled</span>
                <span className="text-2xl font-black text-slate-800">{selectedCourse.studentsEnrolled}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Views</span>
                <span className="text-2xl font-black text-slate-800">{(selectedCourse.studentsEnrolled * 12.5).toFixed(0)}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Revenue</span>
                <span className="text-lg font-black text-emerald-600">₹{selectedCourse.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => { setModalType(null); setSelectedCourse(null); }} className="w-full py-4 bg-[#1B4332] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2D6A4F] transition-all">
              Close Panel
            </button>
          </div>
        </div>
      )}

      {/* 2. SHARE & PROMOTE MODAL */}
      {modalType === 'share' && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => { setModalType(null); setSelectedCourse(null); }} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-650 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Share & Promote</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generate campaigns</p>
              </div>
            </div>
            <div className="space-y-5 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`https://sarthi-woad.vercel.app/courses/${selectedCourse.slug}`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:outline-none"
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(`https://sarthi-woad.vercel.app/courses/${selectedCourse.slug}`)}
                    className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Discount Percent</label>
                  <input 
                    type="number" 
                    value={discountPercent}
                    onChange={(e) => {
                      setDiscountPercent(e.target.value);
                      setCouponCode(`OFF${e.target.value}`);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Coupon Code</label>
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-emerald-700"
                  />
                </div>
              </div>
            </div>
            <button onClick={() => { setModalType(null); setSelectedCourse(null); }} className="w-full py-4 bg-[#1B4332] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2D6A4F] transition-all">
              Save Campaign Link
            </button>
          </div>
        </div>
      )}

      {/* 3. DELETE MODAL */}
      {modalType === 'delete' && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => { setModalType(null); setSelectedCourse(null); }} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-650 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Delete Course?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Are you absolutely sure you want to delete **{selectedCourse.title}**? This will remove all materials, student analytics, and database records permanently.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setModalType(null); setSelectedCourse(null); }}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(selectedCourse.id)}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Delete Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
