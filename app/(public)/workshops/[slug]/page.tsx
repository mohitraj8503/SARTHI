import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import WorkshopDetailClient from './WorkshopDetailClient';

export const dynamicParams = true;

export default async function WorkshopDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  const workshop = await prisma.workshop.findUnique({
    where: { slug }
  });

  if (!workshop) {
    return notFound();
  }

  const user = await getCurrentUser();
  const registration = user ? await prisma.workshopRegistration.findUnique({
    where: { workshopId_userId: { workshopId: workshop.id, userId: user.id } }
  }) : null;

  return (
    <WorkshopDetailClient 
      workshop={workshop} 
      isRegistered={!!registration} 
    />
  );
}
