import { getCurrentUser, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { ROLES, isAdministrativeRole } from '@/config/roles';

/**
 * Standardized Admin Authorization Utility
 * Throws an early response or error if user is not an admin.
 * Used at the start of all /api/admin/ routes.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || !isAdministrativeRole(user.role)) {
    console.warn(`[SECURITY] Unauthorized Admin Access Attempt by: ${user?.email || 'Anonymous'}`);
    throw new Error('UNAUTHORIZED_ADMIN_ACCESS');
  }

  return user;
}

/**
 * Standardized API Error Response for Admin Panel
 */
export function adminErrorResponse(error: any) {
  console.error('[ADMIN_API_ERROR]:', error);

  if (error.message === 'UNAUTHORIZED_ADMIN_ACCESS') {
    return NextResponse.json({ 
      success: false, 
      error: 'UNAUTHORIZED_ADMIN_ACCESS',
      message: 'You do not have administrative privileges to perform this action.'
    }, { status: 403 });
  }

  return NextResponse.json({ 
    success: false, 
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred in the administrative module.'
  }, { status: 500 });
}

/**
 * Helper to log admin actions (Implementation placeholder for Step 13)
 */
export async function logAdminAction(adminId: string, action: string, targetId?: string, metadata?: any) {
    // Placeholder for Step 13: Audit Logging implementation 
    console.info(`[ADMIN_AUDIT] Admin ${adminId} performed ${action} ${targetId ? `on ${targetId}` : ''}`, metadata);
}
