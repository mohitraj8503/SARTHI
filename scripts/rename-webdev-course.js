const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Certification
  const certUpdate = await prisma.certification.updateMany({
    where: {
      title: 'Full Stack Web Mastery'
    },
    data: {
      title: 'Full Stack Web Dev Mastery'
    }
  });
  console.log(`Updated ${certUpdate.count} certifications.`);

  // Update Course (if it exists)
  const courseUpdate = await prisma.course.updateMany({
    where: {
      title: 'Full Stack Web Mastery'
    },
    data: {
      title: 'Full Stack Web Dev Mastery'
    }
  });
  console.log(`Updated ${courseUpdate.count} courses.`);

  // Print current status
  const certs = await prisma.certification.findMany({
    where: {
      slug: 'fullstack-mastery'
    }
  });
  console.log('=== Certifications ===');
  for (const c of certs) {
    console.log(`- Title: ${c.title}, Slug: ${c.slug}`);
  }

  const courses = await prisma.course.findMany({
    where: {
      slug: 'fullstack-mastery'
    }
  });
  console.log('=== Courses ===');
  for (const c of courses) {
    console.log(`- Title: ${c.title}, Slug: ${c.slug}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
