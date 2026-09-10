import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { sanitizeObject } from '@/lib/utils/sanitization';

const draftSchema = z.object({
  postId: z.string().optional(),
  title: z.string().min(1),
  content: z.string(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = draftSchema.parse(body);
    const sanitizedData = sanitizeObject(validatedData);

    // If we have a postId, we update/create a draft for it
    // If not, we might be in "new blog" mode, so we just save content to a temporary "UserDraft" or similar
    // For now, let's assume the user starts a draft which creates a BlogPost with status 'draft'
    
    let postId = sanitizedData.postId;
    if (!postId) {
      const baseSlug = sanitizedData.slug || (sanitizedData.title ? sanitizedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `draft-${Date.now()}`);
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

      // Create a new BlogPost as a placeholder for the draft
      const newPost = await prisma.blogPost.create({
        data: {
          title: sanitizedData.title,
          slug: generatedSlug,
          content: sanitizedData.content,
          excerpt: sanitizedData.excerpt || '',
          category: sanitizedData.category || 'Uncategorized',
          authorId: session.userId,
          status: 'draft',
        },
      });
      postId = newPost.id;
    } else {
      // Update existing post
      await prisma.blogPost.update({
        where: { id: postId, authorId: session.userId },
        data: {
          title: sanitizedData.title,
          content: sanitizedData.content,
          excerpt: sanitizedData.excerpt,
          category: sanitizedData.category,
          updatedAt: new Date(),
        },
      });
    }

    // Save a versioned draft
    const latestDraft = await prisma.blogDraft.findFirst({
      where: { postId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestDraft?.version || 0) + 1;

    await prisma.blogDraft.create({
      data: {
        postId,
        content: sanitizedData.content,
        title: sanitizedData.title,
        excerpt: sanitizedData.excerpt,
        version: nextVersion,
      },
    });

    return NextResponse.json({ success: true, postId, version: nextVersion });
  } catch (error: any) {
    console.error('❌ Draft Save Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save draft' }, { status: 500 });
  }
}
