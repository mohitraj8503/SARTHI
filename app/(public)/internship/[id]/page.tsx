import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InternshipDetailClient from './InternshipDetailClient';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InternshipDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const batch = await prisma.internshipBatch.findUnique({
    where: { id },
    include: {
      internship: true,
    },
  });

  if (!batch) {
    redirect('/internship');
  }

  const user = await getCurrentUser();

  return (
    <InternshipDetailClient 
      batch={JSON.parse(JSON.stringify(batch))} 
      isLoggedIn={!!user}
    />
  );
}
