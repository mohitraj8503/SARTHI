import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { PaginationSchema } from '@/lib/admin/validators/schemas';
import { getPayments, updatePaymentStatus } from '@/lib/services/payment.service';
import { auditAdminAction } from '@/lib/admin/audit-logs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    
    // 1. Strict Pagination & Filter Parsing
    const query = PaginationSchema.parse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('limit') || searchParams.get('pageSize'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    // 2. Fetch via Service Layer (Business Logic Encapsulated)
    const result = await getPayments(query);

    return ApiResponse.success({
      payments: result.payments,
      stats: result.stats
    }, undefined, result.pagination);

  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin('management');
    const body = await request.json();
    const { id, status, remark } = body;

    if (!id || !status) {
      return ApiResponse.error('Payment ID and status are required', 'BAD_REQUEST', 400);
    }

    const updatedPayment = await updatePaymentStatus(id, status);

    await auditAdminAction(
      admin,
      status === 'refunded' ? 'REFUND_PAYMENT' : 'UPDATE_PAYMENT_STATUS',
      'TRANSACTION',
      id,
      id,
      { status, remark }
    );

    return ApiResponse.success(updatedPayment, `Payment status updated to ${status}`);

  } catch (error: any) {
    return handleApiError(error);
  }
}

