import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query = searchParams.get('query');

    const assets = await prisma.mediaAsset.findMany({
      where: {
        teacherId: teacher.id,
        fileType: type || undefined,
        title: query ? { contains: query } : undefined
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching media assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, fileType, storageProvider, fileId, fileSizeBytes, durationSeconds, thumbnailUrl, tags } = body;

    const asset = await prisma.mediaAsset.create({
      data: {
        teacherId: teacher.id,
        title,
        fileType,
        storageProvider,
        fileId,
        fileSizeBytes,
        durationSeconds,
        thumbnailUrl,
        tags: tags ? JSON.stringify(tags) : null
      }
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating media asset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

