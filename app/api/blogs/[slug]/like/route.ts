import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { slug: id } = params;
    
    // Parse body to determine if like or unlike
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'like';

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        likes: action === 'unlike' ? { decrement: 1 } : { increment: 1 }
      }
    });

    return NextResponse.json({ likes: blog.likes });
  } catch (error) {
    console.error('[BLOG_LIKE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
