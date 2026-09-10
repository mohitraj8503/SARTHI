const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.certification.update({
    where: {
      slug: 'python-professional-developer'
    },
    data: {
      thumbnail: '/thumbnails/python-professional-developer.jpg'
    }
  });
  console.log('Successfully updated Python Professional Developer certification:');
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
