export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, excerpt, category, thumbnail, tags, slug, isDraft, saveAsDraft, isOfficial } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const baseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let generatedSlug = baseSlug;
    let exists = true;
    let counter = 0;
    while (exists) {
      const conflict = await prisma.blogPost.findUnique({
        where: { slug: generatedSlug },
        select: { id: true }
      });
      if (!conflict) {
        exists = false;
      } else {
        counter++;
        const randomPart = Math.random().toString(36).substring(2, 6);
        generatedSlug = `${baseSlug}-${randomPart}`;
        if (counter > 10) {
          generatedSlug = `${baseSlug}-${Date.now()}`;
          break;
        }
      }
    }

    const shouldPublish = !isDraft && !saveAsDraft;

    const blog = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        category: isOfficial ? `Official ${category}` : category,
        thumbnail,
        tags: tags ? tags.join(',') : '',
        slug: generatedSlug,
        authorId: user.id,
        status: shouldPublish ? 'published' : 'draft',
        publishedAt: shouldPublish ? new Date() : null,
        submittedAt: shouldPublish ? new Date() : null,
        adminNote: isOfficial ? 'SARTHI_OFFICIAL' : null,
      },
    });

    return NextResponse.json({ message: shouldPublish ? 'Blog post published successfully' : 'Draft saved successfully', blog });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

