import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

/**
 * Blog Draft Persistence API
 * Implements atomic upserts for content drafts to ensure zero data loss during long writing sessions.
 */
export async function PATCH(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const userId = await authenticateTeacher(request);
    const { content, lastModified, meta } = await request.json();
    const postId = params.slug;
    
    // Verify authorship
    const post = await prisma.blogPost.findUnique({
      where: { id: postId, authorId: userId }
    });
    
    if (!post) return API.forbidden('Unauthorized to edit this blog');

    // Atomic Draft Upsert
    const draft = await prisma.blogDraft.upsert({
      where: { postId },
      update: {
        content,
        lastModified: new Date(lastModified),
        meta,
        version: { increment: 1 }
      },
      create: {
        postId,
        content,
        title: post.title, // Default to post title
        lastModified: new Date(lastModified),
        meta,
        version: 1
      }
    });
    
    return API.ok({ 
      draftId: draft.id, 
      savedAt: draft.lastModified,
      version: draft.version 
    });
    
  } catch (error) {
    console.error('Draft Sync Error:', error);
    return API.server('Failed to persist draft');
  }
}
