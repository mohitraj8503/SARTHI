const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.certification.update({
    where: {
      slug: 'fullstack-mastery'
    },
    data: {
      thumbnail: '/thumbnails/fullstack-mastery.jpg'
    }
  });
  console.log('Successfully updated Full Stack Web Mastery certification:');
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
