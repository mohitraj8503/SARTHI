const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Emptying all blog posts, drafts, and bookmarks from the database...");
  
  const deleteDrafts = await prisma.blogDraft.deleteMany({});
  console.log("Deleted drafts:", deleteDrafts.count);
  
  const deleteBookmarks = await prisma.blogBookmark.deleteMany({});
  console.log("Deleted bookmarks:", deleteBookmarks.count);
  
  const deleteBlogs = await prisma.blogPost.deleteMany({});
  console.log("Deleted blog posts:", deleteBlogs.count);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
