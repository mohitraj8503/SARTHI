import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { PaginationSchema, SupportTicketUpdateSchema } from "@/lib/admin/validators/schemas";
import { auditAdminAction } from "@/lib/admin/audit-logs";

export const dynamic = 'force-dynamic';

/**
 * GET: List Support Tickets
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, search, status, sortBy, sortOrder } = query;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { description: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } }
      ];
    }

    const [total, tickets] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({
        where,
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          assignedTo: { select: { name: true, email: true } },
          _count: { select: { messages: true } }
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return ApiResponse.success(tickets, undefined, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH: Update Ticket (Status, Priority, Assignee)
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('Ticket ID required', 'BAD_REQUEST', 400);

    const body = await req.json();
    const validated = SupportTicketUpdateSchema.parse(body);

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: validated.status,
        priority: validated.priority,
        assignedToId: validated.assignedTo,
      }
    });

    await auditAdminAction(admin, 'support_ticket_update', 'SUPPORT_TICKET', id, ticket.subject, validated);

    return ApiResponse.success(ticket, 'Ticket updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Reply to Ticket
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { ticketId, message, isInternal } = body;

    if (!ticketId || !message) return ApiResponse.error('Ticket ID and message required', 'BAD_REQUEST', 400);

    const reply = await prisma.ticketMessage.create({
      data: {
        ticketId,
        userId: admin.id,
        message,
        isInternal: !!isInternal
      }
    });

    // Auto-update ticket status if it was OPEN
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (ticket && ticket.status === 'OPEN' && !isInternal) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return ApiResponse.success(reply, 'Reply sent');
  } catch (error) {
    return handleApiError(error);
  }
}

