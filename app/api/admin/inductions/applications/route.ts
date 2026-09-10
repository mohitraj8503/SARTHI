import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { getInductionApplications, updateApplicationStatus } from '@/lib/services/induction.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') || undefined;
    const programId = searchParams.get('programId') || undefined;

    const result = await getInductionApplications({ page, pageSize, status, programId });

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

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin('management');
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return ApiResponse.error("Application ID and status are required", "BAD_REQUEST", 400);
    }

    const application = await updateApplicationStatus(id, status);

    return ApiResponse.success(application, `Application status updated to ${status}`);
  } catch (error: any) {
    return handleApiError(error);
  }
}

