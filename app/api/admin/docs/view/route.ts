import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { verifyDocSignature } from '@/lib/teacher/docs';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';
import { prisma } from '@/lib/prisma';

/**
 * Secure Document Proxy
 * Verifies signature and admin permissions before serving sensitive files.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    const expires = searchParams.get('expires');
    const sig = searchParams.get('sig');

    if (!path || !expires || !sig) {
      return NextResponse.json({ error: 'Missing security parameters' }, { status: 400 });
    }

    // 1. Verify Signature
    const isValid = verifyDocSignature(path, parseInt(expires), sig);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired signature' }, { status: 403 });
    }

    // 2. Check Admin Session (Double Layer Security)
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
       // If no session, check if it's a valid public link (maybe teacher viewing own?)
       // For now, strict Admin only for /api/admin/docs
       return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    // 3. Audit Log
    await AuditLogger.log(
      AuditAction.TEACHER_DOCS_VIEWED,
      session.userId,
      'DOCUMENT',
      path,
      { ip: req.headers.get('x-forwarded-for') || 'unknown' }
    );

    // 4. Resolve file and serve
    // In production, this would fetch from S3/Storage and stream it
    // For now, we redirect to a secure signed URL from storage provider or serve from local
    
    // TEMPORARY: If it's a URL already (e.g. Google Drive), redirect
    if (path.startsWith('http')) {
      return NextResponse.redirect(path);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Access granted. File stream would start here in production.',
      url: path 
    });

  } catch (error) {
    console.error('[DOC_VIEW_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
