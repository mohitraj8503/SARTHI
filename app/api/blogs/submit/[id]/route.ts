export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function canAccessWriterDashboard(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return false;
  const role = user.role?.toUpperCase?.() || '';
  return [
    'ADMIN',
    'SUPER_ADMIN',
    'GOD_ADMIN',
    'BLOG_WRITER',
    'STUDENT',
    'USER',
  ].includes(role);
}

async function resolveWriterBlogId(userId: string, requestedId: string) {
  if (requestedId !== 'sample-id') return requestedId;

  const fallback = await prisma.blogPost.findFirst({
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  });

  return fallback?.id || requestedId;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!canAccessWriterDashboard(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = await resolveWriterBlogId(user.id, rawId);

    const blog = await prisma.blogPost.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!canAccessWriterDashboard(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = await resolveWriterBlogId(user.id, rawId);

    const existingBlog = await prisma.blogPost.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user.role?.toUpperCase?.() || '');
    const createdAtTime = new Date(existingBlog.createdAt).getTime();
    const nowTime = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const isWithin7Days = (nowTime - createdAtTime) <= sevenDaysInMs;

    if (!isAdmin) {
      if (!isWithin7Days) {
        return NextResponse.json({ error: 'Writers can only edit their blogs within 7 days of creation.' }, { status: 403 });
      }
    } else {
      // Admins bypass all edit limits
    }

    const { title, content, excerpt, category, thumbnail, tags, slug, saveAsDraft, resubmit } = await request.json();

    const baseSlug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : existingBlog.slug);
    let generatedSlug = baseSlug;
    let exists = true;
    let counter = 0;
    while (exists) {
      const conflict = await prisma.blogPost.findFirst({
        where: {
          slug: generatedSlug,
          NOT: { id }
        },
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

    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (category) updateData.category = category;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (tags) updateData.tags = tags.join(',');
    updateData.slug = generatedSlug;

    if (saveAsDraft) {
      updateData.status = 'draft';
      updateData.submittedAt = null;
    } else if (resubmit && existingBlog.status === 'rejected') {
      updateData.status = 'pending_review';
      updateData.submittedAt = new Date();
      updateData.adminNote = null;
    } else if (!saveAsDraft) {
      updateData.status = 'pending_review';
      if (!existingBlog.submittedAt) {
        updateData.submittedAt = new Date();
      }
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ 
      message: saveAsDraft ? 'Draft updated' : 'Blog post updated and submitted for review', 
      blog 
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!canAccessWriterDashboard(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = await resolveWriterBlogId(user.id, rawId);

    const existingBlog = await prisma.blogPost.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }


    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
