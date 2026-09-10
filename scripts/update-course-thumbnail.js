const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating Course thumbnail in database...");
  const updatedCourse = await prisma.course.update({
    where: { id: 'course_advanced_excel_2024' },
    data: {
      thumbnail: '/course-thumbnails/advance-excel.png'
    }
  });
  console.log("Updated course thumbnail for:", updatedCourse.title, "to:", updatedCourse.thumbnail);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
