import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { WorkshopSchema, PaginationSchema } from "@/lib/admin/validators/schemas";
import { auditAdminAction } from "@/lib/admin/audit-logs";

export const dynamic = 'force-dynamic';

/**
 * GET: List Workshops
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, search, sortBy, sortOrder } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [total, workshops] = await Promise.all([
      prisma.workshop.count({ where }),
      prisma.workshop.findMany({
        where,
        orderBy: { [sortBy || 'date']: sortOrder || 'desc' },
        include: {
          instructor: { select: { name: true, image: true } },
          _count: { select: { registrations: true } }
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return ApiResponse.success(workshops, undefined, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * POST: Create Workshop
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const validated = WorkshopSchema.parse(body);

    const slug = validated.title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

    const workshop = await prisma.workshop.create({
      data: {
        ...validated,
        slug,
        seatsLeft: validated.seats || 50,
      }
    });

    await auditAdminAction(admin, 'workshop_create', 'WORKSHOP', workshop.id, workshop.title);

    return ApiResponse.success(workshop, 'Workshop created successfully');
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * PATCH: Update Workshop
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('Workshop ID required', 'BAD_REQUEST', 400);

    const body = await req.json();
    const validated = WorkshopSchema.partial().parse(body);

    const workshop = await prisma.workshop.update({
      where: { id },
      data: {
        ...validated,
        tags: body.tags || undefined,
      }
    });

    await auditAdminAction(admin, 'workshop_update', 'WORKSHOP', id, workshop.title, validated);

    return ApiResponse.success(workshop, 'Workshop updated successfully');
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * DELETE: Delete Workshop
 */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('Workshop ID required', 'BAD_REQUEST', 400);

    // Check registrations
    const regCount = await prisma.workshopRegistration.count({ where: { workshopId: id } });
    if (regCount > 0) {
      return ApiResponse.error(`Found ${regCount} registrations. Cannot delete an active workshop.`, 'CONFLICT', 409);
    }

    const workshop = await prisma.workshop.delete({ where: { id } });

    await auditAdminAction(admin, 'workshop_delete', 'WORKSHOP', id, workshop.title);

    return ApiResponse.success(null, 'Workshop deleted successfully');
  } catch (error: any) {
    return handleApiError(error);
  }
}

