import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { isIilmUniversity } from '@/lib/utils/iilm';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Internship Application Checkout | SARTHI',
  description: 'Complete your internship application checkout.',
};

export default async function InternshipCheckoutPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  const application = await prisma.internshipApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    notFound();
  }

  // Only applicants from IILM University are allowed to access the checkout page
  if (!isIilmUniversity(application.college)) {
    redirect('/dashboard/internship');
  }

  const trackSlug = application.trackSlug || 'ai-development';

  let config = await prisma.internshipTrackConfig.findUnique({
    where: { trackSlug },
  });

  if (!config) {
    config = {
      id: 'default',
      trackSlug,
      paymentRequired: true,
      paymentAmountInr: 2000,
      currency: 'INR',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Suspense fallback={<div className="text-slate-400 p-8 text-center">Loading checkout details...</div>}>
        <CheckoutClient application={application} config={config} />
      </Suspense>
    </div>
  );
}
