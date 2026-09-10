import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, ApiResponse } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin('staff'); // Allow all staff to log access
    const { path, userAgent, timestamp } = await request.json();

    // Log admin access for security monitoring
    await auditAdminAction(
      admin,
      'ADMIN_ACCESS',
      'SYSTEM',
      'admin-panel',
      `Admin Panel Access: ${path}`,
      {
        path,
        userAgent,
        timestamp,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      }
    );

    return ApiResponse.success({ logged: true });
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Admin access audit failed:', error);
    return NextResponse.json({ logged: false });
  }
}

