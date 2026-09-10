import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { BlogTrustService } from '@/lib/blogs/trust-service';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { action, adminNote, withStrike } = await request.json();

    let status = '';
    let publishedAt: Date | null = null;
    let approvedAt: Date | null = null;

    // Fetch blog to get authorId
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    switch (action) {
      case 'publish':
        status = 'published';
        publishedAt = new Date();
        approvedAt = new Date();
        // Reward Trust
        await BlogTrustService.onBlogApproved(existingBlog.authorId);
        break;
      case 'reject':
        status = 'rejected';
        // Penalize Trust
        await BlogTrustService.onBlogRejected(existingBlog.authorId, withStrike);
        break;
      case 'request_revision':
        status = 'revision_requested';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        status,
        adminNote,
        publishedAt,
        approvedAt,
      },
    });

    return NextResponse.json({
      message: `Blog ${status}.`,
      blog,
    });
  } catch (error) {
    console.error('Error updating blog status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
