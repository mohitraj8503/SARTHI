import { prisma } from '../lib/prisma';

async function main() {
  const userId = 'cmp9eaqu600008iuvgyokhpxw';
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { teacher: true }
  });

  if (!user) {
    console.log('User Mohit Raj (Teacher) not found');
    return;
  }

  console.log('User found:', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    teacherTableId: user.teacher?.id
  });

  const teacherTableId = user.teacher?.id;

  // Query 1: Courses matching user.id as instructorId
  const coursesByInstructor = await prisma.course.findMany({
    where: { instructorId: user.id }
  });
  console.log(`\nCourses where instructorId = user.id (${coursesByInstructor.length}):`);
  coursesByInstructor.forEach(c => {
    console.log(`- ID: ${c.id}, Title: ${c.title}, Price: ${c.price}, instructorId: ${c.instructorId}, teacherId: ${c.teacherId}, status: ${c.status}`);
  });

  // Query 2: Courses matching teacherTableId
  if (teacherTableId) {
    const coursesByTeacher = await prisma.course.findMany({
      where: { teacherId: teacherTableId }
    });
    console.log(`\nCourses where teacherId = teacher.id (${coursesByTeacher.length}):`);
    coursesByTeacher.forEach(c => {
      console.log(`- ID: ${c.id}, Title: ${c.title}, Price: ${c.price}, instructorId: ${c.instructorId}, teacherId: ${c.teacherId}, status: ${c.status}`);
    });
  }

  // Check enrollments and transactions for all courses matching instructorId
  const courseIds = coursesByInstructor.map(c => c.id);
  const enrollmentsCount = await prisma.enrollment.count({
    where: { courseId: { in: courseIds }, status: 'active' }
  });
  console.log(`\nActive enrollments count for these courses: ${enrollmentsCount}`);

  const transactions = await prisma.transaction.findMany({
    where: { courseId: { in: courseIds }, status: { in: ['succeeded', 'SUCCESS'] } }
  });
  console.log(`Succeeded/SUCCESS transactions count: ${transactions.length}`);
  transactions.forEach(t => {
    console.log(`- Txn ID: ${t.id}, Course ID: ${t.courseId}, Amount: ${t.amount}, Status: ${t.status}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
