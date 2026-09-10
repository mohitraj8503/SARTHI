import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import { ToastProvider } from '@/components/ToastProvider';
import LiveSessionWrapper from '@/components/layout/LiveSessionWrapper';
import { MentorThemeProvider } from '@/components/mentor/MentorThemeContext';
import { SocketInitializer } from '@/components/realtime/SocketInitializer';
import DashboardRecoveryGuard from '@/components/auth/DashboardRecoveryGuard';

export const dynamic = 'force-dynamic';

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/mentor/dashboard');
  
  const role = (user.role as string)?.toUpperCase() || '';
  const isAuthorized = ['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role);
  if (!isAuthorized) redirect('/dashboard');

  const isApproved = user.status === 'ACTIVE' || user.status === 'APPROVED' || user.status === 'verified';
  if (!isApproved && role !== 'ADMIN') {
    redirect('/login?error=account_pending&message=Your mentor account is awaiting approval.');
  }

  return (
    <ToastProvider>
      <MentorThemeProvider>
        {/* 
          ROOT FIX: globals.css sets html { zoom: 0.85 } globally.
          Reset to 1 for the mentor workspace so compositor layers
          render at integer pixel coordinates — no seam.
        */}
        <style>{`
          html:has(#mentor-workspace) {
            zoom: 1 !important;
            min-height: 100vh !important;
          }
        `}</style>

        {/* Background in a fixed layer — outside zoom context */}
        <div
          id="mentor-workspace"
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            backgroundImage: "linear-gradient(to bottom, rgba(248, 250, 252, 0.72), rgba(248, 250, 252, 0.72)), url('/images/mentor-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
          }}
        />

        {/* Content wrapper */}
        <div
          className="relative selection:bg-emerald-100 selection:text-emerald-900 font-sans"
          style={{ minHeight: '100vh', position: 'relative', zIndex: 1, backgroundColor: 'transparent' }}
        >
          <div className="flex w-full min-h-screen">
            <SocketInitializer />
            <LiveSessionWrapper
              sidebar={<MentorSidebar />}
              sidebarWidth="259px"
            >
              <div className="flex-1 w-full p-6 lg:p-10">
                <DashboardRecoveryGuard expectedRole={['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER']} routeName="Mentor Dashboard">
                  {children}
                </DashboardRecoveryGuard>
              </div>
            </LiveSessionWrapper>
          </div>
        </div>
      </MentorThemeProvider>
    </ToastProvider>
  );
}

