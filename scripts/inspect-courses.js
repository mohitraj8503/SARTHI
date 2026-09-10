const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        isPublished: true,
        publish_state: true,
        category: true
      }
    });
    console.log("=== ALL COURSES ===");
    console.log(JSON.stringify(courses, null, 2));

    const toUnpublish = courses.filter(c => {
      const title = c.title.toLowerCase();
      const category = (c.category || '').toLowerCase();
      return title.includes('jee') || title.includes('neet') || title.includes('gst') || category.includes('jee') || category.includes('neet') || category.includes('gst');
    });

    if (toUnpublish.length > 0) {
      console.log(`\n=== FOUND ${toUnpublish.length} COURSES TO UNPUBLISH ===`);
      console.log(JSON.stringify(toUnpublish, null, 2));

      const ids = toUnpublish.map(c => c.id);
      const updateResult = await prisma.course.updateMany({
        where: {
          id: { in: ids }
        },
        data: {
          isPublished: false,
          publish_state: 'draft'
        }
      });
      console.log("\nUpdate result:", updateResult);
    } else {
      console.log("\nNo JEE/NEET/GST courses found.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
