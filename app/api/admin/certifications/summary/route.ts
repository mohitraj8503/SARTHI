export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin('staff');

    const [total, published, draft, revenue] = await Promise.all([
      prisma.certification.count(),
      prisma.certification.count({ where: { status: 'PUBLISHED' } }),
      prisma.certification.count({ where: { status: 'DRAFT' } }),
      prisma.certificationPayment.aggregate({
        where: { 
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Mock revenue if payments table doesn't have itemType filter or similar
    // For now, let's just return what we have
    return ApiResponse.success({
      total,
      published,
      draft,
      revenue: revenue._sum.amount || 0
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

