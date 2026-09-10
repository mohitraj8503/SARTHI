export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

/**
 * GET /api/admin/blogs/revisions?blogId=xxx
 * Action: Get version history for a blog post
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json({ error: 'blogId parameter is required' }, { status: 400 });
    }

    const revisions = await prisma.blogRevision.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({ success: true, revisions });
  } catch (error) {
    console.error('Error fetching blog revisions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/blogs/revisions
 * Action: Restore a specific revision to the active blog post
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { revisionId } = await request.json();

    if (!revisionId) {
      return NextResponse.json({ error: 'revisionId is required' }, { status: 400 });
    }

    const revision = await prisma.blogRevision.findUnique({
      where: { id: revisionId }
    });

    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    const updatedBlog = await prisma.blogPost.update({
      where: { id: revision.blogId },
      data: {
        title: revision.title,
        content: revision.content,
        excerpt: revision.excerpt || ''
      }
    });

    return NextResponse.json({ success: true, message: 'Revision restored successfully', blog: updatedBlog });
  } catch (error) {
    console.error('Error restoring blog revision:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
