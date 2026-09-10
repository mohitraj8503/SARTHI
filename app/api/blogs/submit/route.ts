export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function canAccessWriterDashboard(user: any) {
  if (!user) return false;
  const role = user.role?.toUpperCase?.() || '';
  
  // Admins always have access
  if (['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(role)) return true;
  
  // Others must be approved
  return user.blogAccessStatus === 'approved';
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canAccessWriterDashboard(user)) {
      return NextResponse.json({ error: 'Unauthorized. Only approved blog writers can submit posts.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, excerpt, category, thumbnail, tags, slug, saveAsDraft, metaTitle, metaDescription, scheduledAt } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields: title, content, category' }, { status: 400 });
    }

    const baseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let generatedSlug = baseSlug;
    let exists = true;
    let counter = 0;
    
    // Check for duplicate slug (only for new posts)
    if (!id) {
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
    }

    // Determine Status
    let status = saveAsDraft ? 'draft' : 'pending_review';
    let publishedAt = null;
    let approvedAt = null;

    // Trusted Author Logic
    if (!saveAsDraft && user.isBlogTrusted) {
      status = 'published';
      publishedAt = new Date();
      approvedAt = new Date();
    }

    const blogData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 150).replace(/<[^>]*>/g, '') + '...',
      category,
      thumbnail,
      tags: tags ? (Array.isArray(tags) ? tags.join(',') : tags) : '',
      slug: generatedSlug,
      status,
      submittedAt: saveAsDraft ? null : new Date(),
      publishedAt,
      approvedAt,
      writtenAt: new Date(),
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    };

    let blog;
    if (id) {
      // Update existing
      blog = await prisma.blogPost.update({
        where: { id, authorId: user.id },
        data: blogData,
      });
    } else {
      // Create new
      blog = await prisma.blogPost.create({
        data: {
          ...blogData,
          authorId: user.id,
        },
      });
    }

    return NextResponse.json({ 
      message: status === 'published' ? 'Blog published instantly!' : 
               saveAsDraft ? 'Draft saved successfully' : 'Blog submitted for review', 
      blog,
      status
    });
  } catch (error) {
    console.error('Error submitting blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!canAccessWriterDashboard(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      authorId: user.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const blogs = await prisma.blogPost.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        status: true,
        views: true,
        likes: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        submittedAt: true,
        thumbnail: true,
        tags: true,
      },
    });

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Error fetching writer blogs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

