export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const blog = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar_url: true, image: true, role: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const formattedBlog = {
      ...blog,
      author: {
        id: blog.author.id,
        name: blog.author.name || 'SARTHI Admin',
        email: blog.author.email,
        avatar: blog.author.avatar_url || blog.author.image || '/sarthi-logo.png',
        role: blog.author.role,
      },
    };

    return NextResponse.json(formattedBlog);
  } catch (error) {
    console.error('Error fetching admin blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const existingBlog = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (force) {
      await prisma.blogPost.delete({ where: { id } });
      return NextResponse.json({ message: 'Blog post permanently purged successfully' });
    } else {
      await prisma.blogPost.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return NextResponse.json({ message: 'Blog post moved to trash' });
    }
  } catch (error) {
    console.error('Error deleting admin blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title, content, excerpt, category, thumbnail, tags, slug, status,
      action, coverAlt, coverCaption, coverCredit, seoTitle, focusKeyword,
      canonicalUrl, ogTitle, ogDescription, ogImage, robotsIndex, robotsFollow, scheduledAt
    } = body;

    // Handle restore action from trash
    if (action === 'restore') {
      const restored = await prisma.blogPost.update({
        where: { id },
        data: { deletedAt: null }
      });
      return NextResponse.json({ message: 'Blog post restored successfully', blog: restored });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.join(',') : tags;
    if (status !== undefined) updateData.status = status;
    if (coverAlt !== undefined) updateData.coverAlt = coverAlt;
    if (coverCaption !== undefined) updateData.coverCaption = coverCaption;
    if (coverCredit !== undefined) updateData.coverCredit = coverCredit;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (focusKeyword !== undefined) updateData.focusKeyword = focusKeyword;
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;
    if (ogTitle !== undefined) updateData.ogTitle = ogTitle;
    if (ogDescription !== undefined) updateData.ogDescription = ogDescription;
    if (ogImage !== undefined) updateData.ogImage = ogImage;
    if (robotsIndex !== undefined) updateData.robotsIndex = Boolean(robotsIndex);
    if (robotsFollow !== undefined) updateData.robotsFollow = Boolean(robotsFollow);
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    if (slug !== undefined) {
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
      updateData.slug = generatedSlug;
    }

    if (status === 'published' && !existingBlog.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    // Create a revision snapshot if content or title changed
    if (content !== undefined || title !== undefined) {
      try {
        await prisma.blogRevision.create({
          data: {
            blogId: blog.id,
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt,
            createdById: user.id
          }
        });
      } catch (revError) {
        console.error('Revision save error:', revError);
      }
    }

    return NextResponse.json({ message: 'Blog post updated successfully', blog });
  } catch (error) {
    console.error('Error updating admin blog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
