export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
    let lessonId = "";
    let data: any = {};
    const contentTypeHeader = req.headers.get("content-type") || "";

    if (contentTypeHeader.includes("multipart/form-data")) {
      const formData = await req.formData();
      lessonId = formData.get('lessonId') as string;
      
      if (formData.has('title')) data.title = formData.get('title') as string;
      if (formData.has('description')) data.description = formData.get('description') as string;
      if (formData.has('contentType')) data.contentType = formData.get('contentType') as string;
      if (formData.has('duration')) data.duration = formData.get('duration') ? Number(formData.get('duration')) : null;
      if (formData.has('isPublished')) data.isPublished = formData.get('isPublished') === 'true';
      if (formData.has('isFreePreview')) data.isFreePreview = formData.get('isFreePreview') === 'true';
      if (formData.has('moduleId')) data.moduleId = (formData.get('moduleId') as string) || null;
      if (formData.has('videoUrl')) data.videoUrl = formData.get('videoUrl') as string;
      if (formData.has('scheduledAt')) {
        const sched = formData.get('scheduledAt') as string;
        data.scheduledAt = sched ? new Date(sched) : null;
      }
      if (formData.has('type')) data.type = formData.get('type') as any;

      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        const filePath = await saveFile(file, 'resources');
        data.videoUrl = filePath;
      }
    } else {
      const body = await req.json();
      lessonId = body.lessonId;
      
      const fields = [
        'title', 'description', 'contentType', 'duration', 
        'isPublished', 'isFreePreview', 'moduleId', 'videoUrl', 
        'scheduledAt', 'type', 'orderNumber', 'position', 'content'
      ];
      
      fields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === 'scheduledAt') {
            data[field] = body[field] ? new Date(body[field]) : null;
          } else {
            data[field] = body[field];
          }
        }
      });
    }

    if (!lessonId) {
      return NextResponse.json({ message: 'Missing lessonId' }, { status: 400 });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
