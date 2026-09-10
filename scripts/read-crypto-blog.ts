import { prisma } from '../lib/prisma';

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'the-beginner-s-guide-to-cryptocurrency-from-mysterious-origins-to-everyday-power' }
  });
  if (post) {
    console.log('--- TITLE ---');
    console.log(post.title);
    console.log('--- EXCERPT ---');
    console.log(post.excerpt);
    console.log('--- METADATA ---');
    console.log('metaTitle:', post.metaTitle);
    console.log('metaDescription:', post.metaDescription);
    console.log('--- CONTENT ---');
    console.log(post.content);
  } else {
    console.log('Post not found');
  }
}

main().catch(console.error);
