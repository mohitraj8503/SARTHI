import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTeacherStudents } from '@/lib/teacher/student-data';
import EmailPortalClient from './EmailPortalClient';

export const dynamic = 'force-dynamic';

export default async function TeacherEmailPortalPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect('/login');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true }
  });

  if (!teacher) {
    redirect('/teacher/onboarding');
  }

  const { students } = await getTeacherStudents(teacher.id);

  // Map to essential data structure for the client component
  const studentList = students.map(s => ({
    id: s.id,
    student: {
      id: s.student.id,
      name: s.student.name,
      email: s.student.email,
    },
    course: {
      title: s.course.title
    }
  }));

  return <EmailPortalClient students={studentList} />;
}
