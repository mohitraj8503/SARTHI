'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { Course, Lesson } from '@/lib/types';
import { Search, Filter, BookOpen, Video, FileText, HelpCircle, Eye } from 'lucide-react';

type LessonRow = Lesson & { courseId: string; courseTitle: string };

export default function TeacherLessonsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LessonRow[]>([]);
  const [courseFilter, setCourseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const all = storage.list<Course>('courses:', true);
    const mine = user?.role === 'admin' ? all : all.filter((c) => c.instructor.id === user?.id || c.instructor.name === user?.name);
    const flat: LessonRow[] = [];
    mine.forEach((c) => {
      (c.curriculum || []).forEach((section) => {
        (section.lessons || []).forEach((l) => flat.push({ ...l, courseId: c.id, courseTitle: c.title }));
      });
    });
    setRows(flat);
  }, [user]);

  const courses = useMemo(() => ['All', ...new Set(rows.map((r) => r.courseTitle))], [rows]);
  const filtered = useMemo(() => {
    let list = rows;
    if (courseFilter !== 'All') list = list.filter((r) => r.courseTitle === courseFilter);
    if (typeFilter !== 'All') list = list.filter((r) => r.type === typeFilter.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.courseTitle.toLowerCase().includes(q));
    }
    return list;
  }, [rows, courseFilter, typeFilter, search]);

  return (
    <AuthGuard requiredRole={['teacher', 'admin']} redirectTo="/teacher/login">
      <div className="space-y-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black text-white/90 tracking-tighter leading-none">
                Module <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Components</span>
              </h1>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-4">
                Granular management and orchestration of all educational assets.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-[3rem] p-2 shadow-2xl border border-white/5 flex flex-col md:flex-row gap-4 overflow-hidden backdrop-blur-md">
            <div className="flex-1 relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Query component title, course or module mapping..."
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-transparent border-none focus:ring-0 text-sm font-bold text-white placeholder:text-white/10"
              />
            </div>
            <div className="flex items-center gap-4 p-2">
              <Dropdown label={`Course: ${courseFilter}`} items={courses} onSelect={setCourseFilter} />
              <Dropdown label={`Type: ${typeFilter}`} items={['All', 'Video', 'Article', 'Quiz', 'Project']} onSelect={setTypeFilter} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] p-32 text-center backdrop-blur-sm">
              <BookOpen className="w-16 h-16 text-white/5 mx-auto mb-8" />
              <h3 className="text-2xl font-black text-white/90 mb-2 tracking-tight">No Components Found</h3>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                Try adjusting your filters or search query to find your educational assets.
              </p>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-10 py-8 text-left text-[10px] font-black text-white/30 uppercase tracking-[3px]">Lesson Asset</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-white/30 uppercase tracking-[3px]">Module Mapping</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-white/30 uppercase tracking-[3px]">Asset Type</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-white/30 uppercase tracking-[3px]">Duration</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-white/30 uppercase tracking-[3px]">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((l) => (
                      <tr key={l.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-10 py-8">
                          <div className="font-black text-white/90 text-lg tracking-tight group-hover:text-primary transition-colors">{l.title}</div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{l.courseTitle}</div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 w-fit">
                            {iconForType(l.type)} {l.type}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="text-sm font-black text-white/60">{l.duration_minutes}m</div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <a
                            href={l.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/5 hover:bg-primary text-white/60 hover:text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 inline-flex items-center gap-2 group/btn"
                          >
                            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            Inspect
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

function iconForType(type: Lesson['type']) {
  switch (type) {
    case 'video':
      return <Video className="w-4 h-4 text-brand-orange" />;
    case 'article':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'quiz':
      return <HelpCircle className="w-4 h-4 text-purple-500" />;
    default:
      return <BookOpen className="w-4 h-4 text-gray-500" />;
  }
}

function Dropdown({ label, items, onSelect }: { label: string; items: string[]; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${open ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
          }`}
      >
        <Filter className="w-4 h-4" />
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute mt-3 right-0 z-20 bg-background/95 border border-white/10 rounded-[2rem] shadow-2xl min-w-[220px] max-h-80 overflow-auto backdrop-blur-2xl p-2 animate-in fade-in zoom-in duration-200">
            {items.map((item) => (
              <button
                key={item}
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="w-full text-left px-6 py-4 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white rounded-xl transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


