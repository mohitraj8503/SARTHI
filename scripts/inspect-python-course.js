const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({
    where: { id: "python-beginners-mr" },
    include: {
      modules: {
        include: {
          lessons: true
        }
      },
      lessons: {
        where: {
          moduleId: null
        }
      }
    }
  });
  console.log("Course details:", JSON.stringify(course, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
