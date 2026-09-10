import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CourseLearningClientPage from './CourseLearningClientPage';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const user = await getCurrentUser();
  const { slug } = await params;
  
  if (!user) {
    redirect(`/auth/login?redirect=${encodeURIComponent(`/courses/${slug}/learn`)}`);
  }

  // Let's resolve the course and check if it exists
  const course = await prisma.course.findFirst({
    where: { slug }
  });

  if (!course) {
    redirect('/dashboard/courses');
  }

  return <CourseLearningClientPage slug={slug} user={user} />;
}
