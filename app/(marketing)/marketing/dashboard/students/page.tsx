'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  FileSpreadsheet,
  X,
  BookOpen,
  User,
  GraduationCap
} from 'lucide-react';

export default function MarketingStudentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [activeStudent, setActiveStudent] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/marketing/stats');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleExportCSV = () => {
    if (!data?.students) return;
    const headers = ['Student Name', 'Email', 'Phone', 'Course', 'Amount Paid', 'Commission', 'Progress', 'Date'];
    const rows = data.students.map((s: any) => [
      s.studentName,
      s.studentEmail,
      s.studentPhone,
      s.courseName,
      s.amountPaid,
      s.commissionEarned,
      `${s.progress}%`,
      new Date(s.purchaseDate).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `referred_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse text-left">
        <div className="h-10 w-48 bg-slate-200 rounded" />
        <div className="h-64 bg-white/50 backdrop-blur-md rounded-[24px]" />
      </div>
    );
  }

  const students = data?.students || [];

  // Filter logic
  const filteredStudents = students.filter((s: any) => {
    const matchSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || 
                        s.studentEmail.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === 'ALL' || s.courseName === courseFilter;
    return matchSearch && matchCourse;
  });

  const uniqueCourses = Array.from(new Set(students.map((s: any) => s.courseName)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left relative">
      
      {/* Header Title & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit">Referred Students</h1>
          <p className="text-slate-400 text-xs mt-1">List of all students who enrolled using your coupon code.</p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none cursor-pointer focus:border-emerald-500/50 font-semibold"
          >
            <option value="ALL">All Courses</option>
            {uniqueCourses.map((c: any) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[24px] shadow-xl overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-bold">No students found.</p>
            <p className="text-xs mt-1">Refine your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black bg-slate-50/40">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Course Enrolled</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s: any) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.studentName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-700">{s.courseName}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          Enrolled: {new Date(s.purchaseDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="font-bold text-slate-600">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">₹{s.amountPaid}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">₹{s.commissionEarned}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setActiveStudent(s)}
                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 tracking-wider uppercase flex items-center gap-0.5"
                      >
                        Profile <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Profile Modal */}
      {activeStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-md p-6 space-y-5 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" /> Student Profile
              </h3>
              <button onClick={() => setActiveStudent(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Information</p>
                <p className="text-sm font-bold text-slate-800">{activeStudent.studentName}</p>
                <p className="text-xs text-slate-500">{activeStudent.studentEmail}</p>
                <p className="text-xs text-slate-500">Phone: {activeStudent.studentPhone}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Course</p>
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> {activeStudent.courseName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeStudent.progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 shrink-0">{activeStudent.progress}% Complete</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Price</p>
                  <p className="text-sm font-bold text-slate-700">₹{activeStudent.amountPaid}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Earned Commission</p>
                  <p className="text-sm font-bold text-emerald-600">+₹{activeStudent.commissionEarned}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveStudent(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
