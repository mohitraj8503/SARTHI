import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    where: { 
      title: { 
        in: [
          'Power BI Mastery — From Data to Decisions',
          'Data Analytics with Excel',
          'Become an AI Engineer — Python to Machine Learning',
          'Earn Big with ChatGPT — AI Mastery in 30 Days',
          'Python Masterclass'
        ]
      }
    },
    select: {
      id: true,
      title: true,
      price: true,
      originalPrice: true,
      instructor: { select: { name: true, email: true } },
      teacher: { select: { user: { select: { name: true, email: true } } } }
    }
  });
  console.log("Found courses:");
  console.table(courses.map(c => ({
    title: c.title,
    price: c.price,
    instructorName: c.instructor?.name,
    teacherName: c.teacher?.user?.name
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
