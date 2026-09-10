import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.blogPost.findFirst({
    where: { slug: 'the-future-of-artificial-intelligence-in-software-development-2026-guide' },
    select: {
      title: true,
      category: true,
    }
  });

  console.log(post);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
