const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const blogs = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        authorId: true,
        status: true
      }
    });
    console.log("=== RAW BLOGS ===");
    console.log(JSON.stringify(blogs, null, 2));

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    console.log("=== ALL USERS ===");
    console.log(JSON.stringify(users, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
