import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug: postId } = params;

    // Check if already bookmarked
    const existing = await prisma.blogBookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId
        }
      }
    });

    if (existing) {
      // Toggle off
      await prisma.blogBookmark.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      // Toggle on
      await prisma.blogBookmark.create({
        data: {
          userId: user.id,
          postId
        }
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('[BLOG_BOOKMARK_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ bookmarked: false });
    }

    const { slug: postId } = params;

    const bookmark = await prisma.blogBookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId
        }
      }
    });

    return NextResponse.json({ bookmarked: !!bookmark });
  } catch (error) {
    return NextResponse.json({ bookmarked: false });
  }
}
