import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/get-user';
import { uploadTeacherDoc, isCloudinaryConfigured } from '@/lib/cloudinary';
import { validateFileSignature } from '@/lib/utils/file-security';

import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    // Allow guest uploads for teacher applications
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'document';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'video/mp4',
      'video/quicktime'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Max size 50MB for video, 5MB for others
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Max size is ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // CRITICAL: Validate File Signature (Magic Numbers)
    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json({ error: 'File content mismatch. Spoofing detected.' }, { status: 400 });
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      console.warn('⚠️ Cloudinary not configured. Falling back to Base64 (MySQL) storage for:', file.type);
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      return NextResponse.json({ url: base64 });
    }

    // Use user ID or email as identifier
    const guestEmail = formData.get('email') as string;
    const identifier = user?.id || (guestEmail || 'guest').replace(/[^a-zA-Z0-9]/g, '_');

    const result = await uploadTeacherDoc(
      buffer, 
      `${identifier}_${type}`, 
      'teacher-applications'
    );

    if (!result.success || !result.url) {
      console.error('[UPLOAD_TEACHER_DOC_FAILURE]', result.error);
      return NextResponse.json({ error: result.error || 'Upload failed' }, { status: 500 });
    }

    // Double check Cloudinary URL safety
    if (!result.url.startsWith('https://res.cloudinary.com')) {
      return NextResponse.json({ error: 'Malicious URL detected' }, { status: 403 });
    }

    // Audit Logging
    await logAudit({
        actorId: user?.id || 'GUEST',
        actorEmail: user?.email || guestEmail || 'guest@sarthi-woad.vercel.app',
        action: 'teacher_doc_upload',
        entityType: 'TEACHER_DOCUMENT',
        entityId: result.url,
        entityName: `${type}_${file.name}`,
        changes: { type, fileSize: file.size, isGuest: !user }
    });

    return NextResponse.json({ url: result.url });

  } catch (error) {
    console.error('[UPLOAD_TEACHER_DOC]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

