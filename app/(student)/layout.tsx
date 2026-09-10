import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentMobileHeader from '@/components/student/StudentMobileHeader';
import { ToastProvider } from '@/components/ToastProvider';
import NetworkStatus from '@/components/student/NetworkStatus';
import LiveSessionWrapper from '@/components/layout/LiveSessionWrapper';
import { LiveClassBanner } from '@/components/student/LiveClassBanner';
import { SocketInitializer } from '@/components/realtime/SocketInitializer';
import Image from 'next/image';
import ExitImpersonationButton from '@/components/student/ExitImpersonationButton';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/dashboard');

  const role = (user.role as string)?.toUpperCase() || '';
  if (['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(role)) redirect('/admin/dashboard');
  if (['TEACHER', 'INSTRUCTOR'].includes(role)) redirect('/teacher/dashboard');
  if (role === 'MENTOR') redirect('/mentor/dashboard');
  if (['ASSOCIATE', 'MARKETING_PARTNER'].includes(role)) redirect('/marketing/dashboard');
  if (!['STUDENT', 'USER'].includes(role)) redirect('/login');

  // Forced Onboarding Check (Bypassed automatically for internship candidates & batch members)
  if (user.onboarded === false) {
    const hasInternshipApp = await prisma.internshipApplication.findFirst({
      where: {
        OR: [
          { studentId: user.id },
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    });
    const hasBatchMember = await prisma.batchMember.findFirst({
      where: { userId: user.id }
    });

    if (hasInternshipApp || hasBatchMember) {
      await prisma.user.update({
        where: { id: user.id },
        data: { onboarded: true, onboardingStatus: 'COMPLETED' }
      }).catch(() => {});
    } else {
      redirect('/onboarding');
    }
  }

  // Permanent Suspension Check
  if (user.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] border border-rose-200 shadow-2xl max-w-md w-full p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
            🛑
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-rose-900 uppercase tracking-wide">ACCOUNT PERMANENTLY SUSPENDED</h1>
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 py-1 px-3 rounded-full inline-block">
              Disqualification Enforced
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Your student access and internship standing at <strong>SARTHI</strong> have been permanently suspended due to non-compliance with program policies.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Suspension Record Impact:</p>
            <p className="text-slate-600">❌ Workspace & Dashboard access revoked</p>
            <p className="text-slate-600">❌ Certificate & LOR eligibility forfeited</p>
            <p className="text-slate-600">❌ Attendance & XP progress locked</p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <a 
              href="mailto:mohitraj8503@gmail.com" 
              className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Contact Support Board
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex flex-1 w-full bg-[#FDFCFB] min-h-screen">
        <SocketInitializer />
        {user.impersonatorId && (
          <div className="fixed top-0 left-0 right-0 z-[150] bg-amber-100 border-b border-amber-300 px-4 py-2 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 shadow-sm">
            <span className="text-amber-900 font-bold text-xs md:text-sm tracking-wide">
              👁️ <span className="uppercase">Viewing as {user.name}</span> — Actions taken here will affect the student's account.
            </span>
            <ExitImpersonationButton />
          </div>
        )}
        <LiveClassBanner />
        <LiveSessionWrapper
          topHeader={<StudentMobileHeader user={user} />}
          sidebar={<StudentSidebar user={user} />}
          sidebarWidth="280px"
        >
          {children}
        </LiveSessionWrapper>
        <NetworkStatus />
      </div>
    </ToastProvider>
  );
}
