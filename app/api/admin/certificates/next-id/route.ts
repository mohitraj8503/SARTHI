import { NextRequest } from 'next/server';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { generateSequentialCredentialId } from '@/lib/certificates';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/certificates/next-id?courseName=Advance+Excel
 * Returns the next sequential Certificate ID for the given course.
 * Format: TT-EX-2026-0003 (sequential, not random)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin('staff');
    const { searchParams } = new URL(request.url);
    const courseName = searchParams.get('courseName') || '';
    const nextId = await generateSequentialCredentialId(courseName);
    return ApiResponse.success({ credentialId: nextId });
  } catch (error) {
    return handleApiError(error);
  }
}
