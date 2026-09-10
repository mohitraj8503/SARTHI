export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { getSession } from '@/lib/auth/session';


async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);
  return `/uploads/${folder}/${filename}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const courseId = formData.get('courseId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const contentType = formData.get('contentType') as string;
    const dueDate = formData.get('dueDate') as string;
    const maxScore = formData.get('maxScore') as string;
    const isPublished = formData.get('isPublished') === 'true';
    const videoUrl = formData.get('videoUrl') as string;
    const duration = formData.get('duration') as string;
    const questionsStr = formData.get('questions') as string;
    const type = (formData.get('type') || 'VIDEO') as any;
    const scheduledAt = formData.get('scheduledAt') as string;

    
    // File handling for notes
    const file = formData.get('file') as File | null;

    if (!courseId || !title || !contentType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Get current max order number
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
    const orderNumber = (lastLesson?.orderNumber || 0) + 1;

    const isLive = contentType === 'live-session' || type === 'LIVE';

    // Create payload
    const payload: any = {
      courseId,
      title,
      description: description || null,
      contentType,
      isPublished,
      orderNumber,
      // Common fields
      dueDate: dueDate ? new Date(dueDate) : null,
      maxScore: maxScore ? Number(maxScore) : null,
      videoUrl: videoUrl || null,
      duration: duration ? Number(duration) : undefined,
      type: isLive ? 'LIVE' : type,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      liveRoomName: isLive ? `class-${Date.now()}-${nanoid(6)}` : null,
      liveStatus: isLive ? 'SCHEDULED' : 'NOT_STARTED',
    };

    if (contentType === 'quiz' && questionsStr) {
      // It's already stringified JSON
      payload.content = questionsStr;
    }

    if (contentType === 'note' && file) {
       const filePath = await saveFile(file, 'resources');
       payload.videoUrl = filePath; // Storing resource path in videoUrl as generic generic URL
       payload.duration = 10; // Default duration for note/reading
    }

    const lesson = await prisma.lesson.create({
      data: payload,
    });

    // Trigger Notifications for LIVE lessons
    if (type === 'LIVE' && lesson.scheduledAt) {
      const { onClassScheduled } = await import('@/lib/notifications/orchestrator');
      // Fire and forget to keep response fast
      onClassScheduled(lesson.id).catch(err => console.error('Failed to notify students:', err));
    }


    return NextResponse.json(lesson);

  } catch (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

