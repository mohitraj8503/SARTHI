import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { PaginationSchema } from "@/lib/admin/validators/schemas";
import { auditAdminAction } from "@/lib/admin/audit-logs";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const SeminarSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  speakerName: z.string().min(2),
  speakerBio: z.string().min(10),
  speakerImage: z.string().url().optional().or(z.literal("")),
  date: z.coerce.date(),
  duration: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  maxAttendees: z.coerce.number().min(1),
  category: z.string().min(2),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  tags: z.string().optional(),
  youtubeStreamUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
});

const SeminarActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    data: SeminarSchema
  }),
  z.object({
    action: z.literal("approve-request"),
    requestId: z.string(),
    data: SeminarSchema
  }),
  z.object({
    action: z.literal("reject-request"),
    requestId: z.string(),
    adminRemarks: z.string().optional()
  }),
  z.object({
    action: z.literal("edit"),
    id: z.string(),
    data: SeminarSchema.partial()
  })
]);

/**
 * GET: List Seminars OR Seminar Requests
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'list-requests') {
      const requests = await prisma.seminarRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          teacher: { select: { name: true, image: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return ApiResponse.success(requests);
    }

    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, search, sortBy, sortOrder } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { speakerName: { contains: search } }
      ];
    }

    const [total, seminars] = await Promise.all([
      prisma.seminar.count({ where }),
      prisma.seminar.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { [sortBy || 'date']: sortOrder || 'desc' },
        include: {
          _count: { select: { registrations: true } }
        }
      })
    ]);

    return ApiResponse.success(seminars, undefined, {
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
 * POST: Unified Seminar Actions
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = SeminarActionSchema.parse(body);

    switch (parsed.action) {
      case "create": {
        const seminar = await prisma.seminar.create({
          data: {
            ...parsed.data,
            instructor: { connect: { id: admin.id } }
          }
        });
        await auditAdminAction(admin, 'seminar_create', 'SEMINAR', seminar.id, seminar.title);
        return ApiResponse.success(seminar, 'Seminar created successfully');
      }

      case "approve-request": {
        const { requestId, data } = parsed;
        const request = await prisma.seminarRequest.findUnique({ where: { id: requestId } });
        if (!request) return ApiResponse.error("Request not found", "NOT_FOUND", 404);

        const seminar = await prisma.seminar.create({
          data: {
            ...data,
            instructor: { connect: { id: request.teacherId } }
          }
        });

        await prisma.seminarRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' }
        });

        await auditAdminAction(admin, 'seminar_approve', 'SEMINAR', seminar.id, seminar.title, { requestId });
        return ApiResponse.success(seminar, 'Request approved and seminar scheduled');
      }

      case "reject-request": {
        const { requestId, adminRemarks } = parsed;
        await prisma.seminarRequest.update({
          where: { id: requestId },
          data: { status: 'REJECTED', adminRemarks }
        });
        await auditAdminAction(admin, 'seminar_reject', 'SEMINAR_REQUEST', requestId, '', { adminRemarks });
        return ApiResponse.success(null, 'Request rejected');
      }

      case "edit": {
        const { id, data } = parsed;
        const seminar = await prisma.seminar.update({
          where: { id },
          data
        });
        await auditAdminAction(admin, 'seminar_edit', 'SEMINAR', id, seminar.title, data);
        return ApiResponse.success(seminar, 'Seminar updated successfully');
      }

      default:
        return ApiResponse.error("Unsupported action", "BAD_REQUEST", 400);
    }
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * DELETE: Delete Seminar
 */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('Seminar ID required', 'BAD_REQUEST', 400);

    const regCount = await prisma.seminarRegistration.count({ where: { seminarId: id } });
    if (regCount > 0) return ApiResponse.error(`Found ${regCount} registrations. Cannot delete.`, 'CONFLICT', 409);

    const seminar = await prisma.seminar.delete({ where: { id } });
    await auditAdminAction(admin, 'seminar_delete', 'SEMINAR', id, seminar.title);
    return ApiResponse.success(null, 'Seminar deleted successfully');
  } catch (error: any) {
    return handleApiError(error);
  }
}

