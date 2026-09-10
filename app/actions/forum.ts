'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return { id: session.userId, role: session.role };
}

export async function getForumPost(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized', post: null };

  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true }
        },
        course: {
          select: { id: true, title: true }
        },
        comments: {
          where: { parentId: null },
          include: {
            author: {
              select: { id: true, name: true, image: true, role: true }
            },
            replies: {
              include: {
                author: {
                  select: { id: true, name: true, image: true, role: true }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return { post };
  } catch (error) {
    console.error('Failed to fetch forum post:', error);
    return { error: 'Failed to fetch post', post: null };
  }
}

export async function createForumComment(postId: string, content: string, parentId?: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId: user.id,
        content,
        parentId: parentId || null
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true }
        }
      }
    });

    return { comment };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return { error: 'Failed to create comment' };
  }
}

export async function getAllForumPosts(page = 1, limit = 20) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized', posts: [], total: 0 };

  try {
    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, image: true, role: true }
          },
          course: {
            select: { id: true, title: true }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.forumPost.count()
    ]);

    return { posts, total, page, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('Failed to fetch forum posts:', error);
    return { error: 'Failed to fetch posts', posts: [], total: 0 };
  }
}

