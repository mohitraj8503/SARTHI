import { Users, Activity, Plus, Search, Download, Filter, Eye, MoreHorizontal } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTeacherStudents } from '@/lib/teacher/student-data';
import StatCard from '@/components/teacher/dashboard/StatCard';
import StudentsDirectory from '@/components/teacher/students/StudentsDirectory';

export const dynamic = 'force-dynamic';

export default async function TeacherStudentsPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect('/login');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id }
  });

  if (!teacher) {
    redirect('/teacher/onboarding');
  }

  const { students } = await getTeacherStudents(teacher.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Directory Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="h-2 w-6 bg-emerald-500 rounded-full" />
                <span className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-[0.25em]">STUDENT MANAGEMENT</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95]">
                STUDENTS <span className="text-emerald-500">DIRECTORY</span>
              </h1>
              <p className="text-slate-600 font-bold text-sm sm:text-base lg:text-lg mt-2">Manage and monitor your learner ecosystem in real-time. Optimize student engagement through detailed analytics.</p>
            </div>

            <button className="bg-[#1B4332] text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-[#2D6A4F] transition-all shadow-xl shadow-emerald-900/10 active:scale-95">
              <Plus className="w-5 h-5 stroke-[3]" />
              Add New Student
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="Total Students"
              value={students.length}
              change={4}
              icon={Users}
              color="blue"
            />
            <StatCard 
              title="Active Now"
              value={students.filter(s => s.status === 'active').length}
              change={12}
              icon={Activity}
              color="emerald"
            />
            <StatCard 
              title="New Onboard"
              value={Math.round(students.length * 0.1)}
              change={2}
              icon={Plus}
              color="amber"
            />
            <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center text-center border-dashed border-2">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Feed</span>
               </div>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">System Synced</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-8 md:mt-10">
        <StudentsDirectory initialStudents={students} />
      </main>
    </div>
  );
}
