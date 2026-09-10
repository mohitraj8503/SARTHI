export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/admin/roles';
import CertificateStudioClient from '@/components/admin/CertificateStudioClient';

export const metadata = {
  title: 'Certificate Studio - Design & View Certificates | SARTHI',
  description: 'Interactive Certificate Studio to design custom certificates or browse existing issued credentials.',
};

export default async function PublicCertificateStudioPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/certificate-studio');
  }

  const role = (user.role as string)?.toUpperCase() || '';
  if (!ADMIN_ROLES.includes(role)) {
    redirect('/dashboard');
  }

  return <CertificateStudioClient />;
}
