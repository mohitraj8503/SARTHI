import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MarketingSidebar from '@/components/marketing/MarketingSidebar';
import MarketingMobileHeader from '@/components/marketing/MarketingMobileHeader';
import { ToastProvider } from '@/components/ToastProvider';
import NetworkStatus from '@/components/student/NetworkStatus';
import LiveSessionWrapper from '@/components/layout/LiveSessionWrapper';
import { SocketInitializer } from '@/components/realtime/SocketInitializer';
import DashboardRecoveryGuard from '@/components/auth/DashboardRecoveryGuard';

export const dynamic = 'force-dynamic';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/marketing/dashboard');

  const role = (user.role as string)?.toUpperCase() || '';
  const isAuthorizedRole = ['MARKETING_PARTNER', 'MARKETING_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role);

  // Check if they have a MarketingPartner profile in the database
  const partnerProfile = await prisma.marketingPartner.findUnique({
    where: { userId: user.id }
  });

  if (!isAuthorizedRole && !partnerProfile) {
    redirect('/dashboard');
  }

  return (
    <ToastProvider>
      <div 
        className="relative min-h-screen bg-[#F8FAFC] selection:bg-emerald-100 selection:text-emerald-900 font-sans overflow-hidden text-left"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(248, 250, 252, 0.65), rgba(248, 250, 252, 0.65)), url('https://cdn.pixabay.com/photo/2018/01/23/03/39/handshake-3100563_1280.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="relative z-10 flex min-h-screen">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to main content
          </a>
          <SocketInitializer />
          <LiveSessionWrapper
            topHeader={<MarketingMobileHeader user={user} />}
            sidebar={<MarketingSidebar user={user} />}
            sidebarWidth="var(--sidebar-width)"
          >
            <main id="main-content" className="flex-1 w-full outline-none">
              <DashboardRecoveryGuard expectedRole={['MARKETING_PARTNER', 'MARKETING_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER']} routeName="Marketing Dashboard">
                {children}
              </DashboardRecoveryGuard>
            </main>
          </LiveSessionWrapper>
          <NetworkStatus />
        </div>
      </div>
    </ToastProvider>
  );
}
