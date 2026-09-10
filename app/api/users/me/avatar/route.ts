export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/jwt-verify';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const payload = await verifyAuthToken(request);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId as string;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 });
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });
    }

    // Convert to base64 data URL for database storage
    // This works everywhere (including Vercel) without needing cloud storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        image: dataUrl,
        avatar_url: dataUrl,
        avatar_version: { increment: 1 },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatar_url: true,
      },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: updatedUser.image,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

