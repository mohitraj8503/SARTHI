import { Metadata } from 'next';
import { getCertifications } from '@/lib/services/certification.service';
import CertificationsMain from './CertificationsMain';

export const metadata: Metadata = {
  title: 'Professional Certifications | SARTHI',
  description: 'Elevate your professional profile with industry-recognized certifications.',
};

export default async function CertificationsPage() {
  const result = await getCertifications({
    isAdmin: false,
    page: 1,
    pageSize: 12
  });

  const certifications = result.success ? result.data.items : [];

  return <CertificationsMain initialData={certifications} />;
}

