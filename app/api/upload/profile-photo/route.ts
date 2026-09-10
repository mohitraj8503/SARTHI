export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { uploadProfilePhoto as uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Please log in' }, { status: 401 });
    }
    const userId = session.userId;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file', message: 'Select an image' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid type', message: 'JPG/PNG/WebP only' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Too large', message: 'Max 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalUrl = '';

    if (isCloudinaryConfigured()) {
      const uploadResult = await uploadToCloudinary(buffer, userId, file.type);
      if (uploadResult.success && uploadResult.url) {
        finalUrl = uploadResult.url;
      }
    } else {
      // Local File System Driver (Avoids DB bloat)
      const fileExtension = file.type.split('/')[1] || 'jpg';
      const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;
      const relativePath = `/uploads/profile-photos/${fileName}`;
      const absolutePath = join(process.cwd(), 'public', relativePath);
      
      await writeFile(absolutePath, buffer);
      finalUrl = relativePath;
    }

    if (!finalUrl) {
      return NextResponse.json({ error: 'Upload failed', message: 'Storage not available' }, { status: 500 });
    }

    // Update user record if DB is up
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          image: finalUrl,
          avatar_url: finalUrl
        },
      });
    } catch (e) {
      console.warn('DB Update failed, but file saved locally:', finalUrl);
      // We still return success because the file is saved and we can handle it in the UI/session
    }

    return NextResponse.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      url: finalUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

