const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.certification.updateMany({
    where: {
      NOT: {
        slug: {
          in: ['fullstack-mastery', 'python-professional-developer']
        }
      }
    },
    data: {
      status: 'DRAFT'
    }
  });
  console.log(`Updated ${result.count} certifications to DRAFT status.`);

  const published = await prisma.certification.findMany({
    where: {
      status: 'PUBLISHED'
    }
  });
  console.log('=== Currently Published Certifications ===');
  for (const c of published) {
    console.log(`- Title: ${c.title}, Slug: ${c.slug}, Status: ${c.status}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
