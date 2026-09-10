export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { getCertifications } from '@/lib/services/certification.service';
import CertificationsMain from '@/app/(public)/certification-exams/CertificationsMain';

export const metadata: Metadata = {
  title: 'Certifications | Dashboard',
  description: 'Manage and earn industry-recognized certifications.',
};

export default async function DashboardCertificationsPage() {
  const certifications = await getCertifications();

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <CertificationsMain initialData={certifications} layout="dashboard" />
    </div>
  );
}

