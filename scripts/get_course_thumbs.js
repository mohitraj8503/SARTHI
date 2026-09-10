const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const courses = await prisma.course.findMany({
    select: { title: true, thumbnail: true }
  });
  console.log(courses.filter(c => c.title.includes('GST') || c.title.includes('Excel')));
  prisma.$disconnect();
}

run();
