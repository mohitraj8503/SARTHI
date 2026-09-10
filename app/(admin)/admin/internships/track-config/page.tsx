import { prisma } from '@/lib/prisma';
import TrackConfigClient from './TrackConfigClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Internship Track Payment Config | SARTHI Admin',
};

export default async function TrackConfigPage() {
  const configs = await prisma.internshipTrackConfig.findMany({
    orderBy: { trackSlug: 'asc' },
  });

  const applications = await prisma.internshipApplication.findMany({
    orderBy: { submittedAt: 'desc' },
    take: 50,
  });

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Internship Track & Payment Admin Center
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Dynamically configure payment gating, pricing, and audit manual payment overrides.
        </p>
      </div>

      <TrackConfigClient initialConfigs={configs} initialApplications={applications} />
    </div>
  );
}
