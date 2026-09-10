'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Award, ArrowLeft, Loader2, Download, Search, User } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface GradeRow {
  studentId: string;
  name: string;
  email: string;
  image?: string;
  quizScore: number;
  assignmentScore: number;
  attendanceScore: number;
  weightedTotal: number;
  letterGrade: string;
}

export default function CourseGradebookPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { addToast } = useToast();

  const [rows, setRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (courseId) fetchGradebook();
  }, [courseId]);

  const fetchGradebook = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/gradebook`);
      if (res.ok) {
        const json = await res.json();
        setRows(json.data?.gradebook || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">ACADEMIC RECORD</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                CONSOLIDATED <span className="text-amber-600">GRADEBOOK</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-2">
                Weighted calculation matrix: Quizzes (30%) + Assignments (40%) + Attendance (30%).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculating Gradebook Matrix...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 uppercase">No Grades Calculated</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">When active students submit assignments and attempt quizzes in this course, grades will automatically appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Quizzes (30%)</th>
                    <th className="py-4 px-6">Assignments (40%)</th>
                    <th className="py-4 px-6">Attendance (30%)</th>
                    <th className="py-4 px-6">Weighted Total</th>
                    <th className="py-4 px-6">Final Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
                  {filteredRows.map((row) => (
                    <tr key={row.studentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs border border-slate-200">
                            {row.name ? row.name.charAt(0) : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{row.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">{row.quizScore}%</td>
                      <td className="py-4 px-6 text-slate-700">{row.assignmentScore}%</td>
                      <td className="py-4 px-6 text-slate-700">{row.attendanceScore}%</td>
                      <td className="py-4 px-6 font-black text-slate-900">{row.weightedTotal}%</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            row.letterGrade.startsWith('A')
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.letterGrade === 'B'
                              ? 'bg-blue-100 text-blue-700'
                              : row.letterGrade === 'C'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {row.letterGrade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
