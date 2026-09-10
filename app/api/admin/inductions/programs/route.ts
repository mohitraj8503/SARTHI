import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { getInductionPrograms } from '@/lib/services/induction.service';
import { z } from 'zod';

const programSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  category: z.string().optional(),
  duration: z.coerce.number().optional(),
  level: z.string().optional(),
  seats: z.coerce.number().default(0),
  thumbnail: z.string().optional(),
  startDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || undefined;

    const result = await getInductionPrograms({ page, pageSize, search });

    return ApiResponse.success(result.items, undefined, {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize)
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin('management');
    const body = await request.json();
    const data = programSchema.parse(body);

    const program = await prisma.inductionProgram.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
      }
    });

    return ApiResponse.success(program, "Induction program created successfully");
  } catch (error: any) {
    return handleApiError(error);
  }
}

