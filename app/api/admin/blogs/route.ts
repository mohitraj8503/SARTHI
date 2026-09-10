export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, adminErrorResponse, logAdminAction } from '@/lib/admin/requireAdmin';
import { z } from 'zod';

const querySchema = z.object({
  status: z.enum(['all', 'draft', 'pending_review', 'published', 'rejected', 'revision_requested', 'archived', 'trash']).optional().default('all'),
  source: z.enum(['all', 'official', 'community']).optional().default('all'),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('10'),
});

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'INVALID_QUERY_PARAMS',
        message: 'Request contains malformed parameters.' 
      }, { status: 400 });
    }

    const { status, source, page: pageStr, limit: limitStr } = parsed.data;
    const page = parseInt(pageStr);
    const limit = parseInt(limitStr) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status === 'trash') {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
      if (status && status !== 'all') {
        where.status = status;
      }
    }

    if (source === 'official') {
      where.author = { role: { in: ['ADMIN', 'SUPERADMIN', 'GOD_ADMIN'] } };
    } else if (source === 'community') {
      where.author = { role: { notIn: ['ADMIN', 'SUPERADMIN', 'GOD_ADMIN'] } };
    }

    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: { 
              name: true, email: true, avatar_url: true, image: true, role: true,
              blogTrustScore: true, blogStrikes: true, isBlogTrusted: true
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    await logAdminAction(admin.id, 'FETCH_BLOG_POSTS', undefined, { status, page });

    const normalizedBlogs = blogs.map(blog => {
      const authorObj = blog.author || {
        name: 'SARTHI Admin',
        email: 'admin@sarthi.in',
        avatar_url: '/sarthi-logo.png',
        image: '/sarthi-logo.png',
        role: 'ADMIN',
        blogTrustScore: 100,
        blogStrikes: 0,
        isBlogTrusted: true,
      };
      return {
        ...blog,
        tags: blog.tags ? blog.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        author: {
          name: authorObj.name || 'SARTHI Admin',
          email: authorObj.email || 'admin@sarthi.in',
          avatar: authorObj.avatar_url || authorObj.image || '/sarthi-logo.png',
          role: authorObj.role || 'STUDENT',
          trustScore: authorObj.blogTrustScore ?? 100,
          strikes: authorObj.blogStrikes ?? 0,
          isTrusted: authorObj.isBlogTrusted ?? true,
        },
      };
    });

    const pagination = {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      blogs: normalizedBlogs,
      pagination,
      data: {
        blogs: normalizedBlogs,
        pagination,
      }
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

