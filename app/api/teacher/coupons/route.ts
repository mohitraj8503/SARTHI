import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!teacher) {
      return API.notFound('Teacher profile not found');
    }

    const coupons = await prisma.coupon.findMany({
      where: { teacherId: teacher.id },
      include: {
        course: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return API.ok({ coupons });
  } catch (error: any) {
    console.error('[Coupons GET] Error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!teacher) {
      return API.notFound('Teacher profile not found');
    }

    const data = await request.json();
    const { code, discountType, discountValue, maxUses, expiresAt, courseId } = data;

    if (!code || !discountType || !discountValue) {
      return API.badRequest("Required fields: 'code', 'discountType', and 'discountValue'.");
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        teacherId: teacher.id,
        courseId: courseId === 'all' || !courseId ? null : courseId
      }
    });

    return API.created(coupon, "Coupon generated successfully.");
  } catch (error: any) {
    console.error('[Coupons POST] Error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    if (error.code === 'P2002') {
      return API.badRequest('Coupon code already exists');
    }
    return API.server('Internal Server Error');
  }
}

