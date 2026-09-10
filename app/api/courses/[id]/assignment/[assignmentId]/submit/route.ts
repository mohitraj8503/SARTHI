export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId, assignmentId } = params;
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ message: 'No files uploaded' }, { status: 400 });
    }

    // Handle single or multiple files
    const fileUrls: string[] = [];
    const uploadDir = join(process.cwd(), 'public/uploads/assignments', user.id);

    // Create directory
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure unique filename
      const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const path = join(uploadDir, filename);

      await writeFile(path, buffer);
      fileUrls.push(`/uploads/assignments/${user.id}/${filename}`);
    }

    // Record Submission
    // We update if already exists (re-submission) or create new
    const submission = await prisma.submission.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: assignmentId,
        }
      },
      update: {
        fileUrl: fileUrls.join(','),
        status: 'SUBMITTED',
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId: assignmentId,
        fileUrl: fileUrls.join(','),
        status: 'SUBMITTED',
      },
    });

    // Mark Lesson Progress as Completed
    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          course: {
            OR: [{ id: courseId }, { slug: courseId }]
          }
        }
      });

      if (enrollment) {
        await prisma.progress.upsert({
          where: {
            enrollmentId_lessonId: {
              enrollmentId: enrollment.id,
              lessonId: assignmentId
            }
          },
          update: {
            completed: true,
            completedAt: new Date(),
            lastPosition: 1, // Full progress for assignment
          },
          create: {
            userId: user.id,
            enrollmentId: enrollment.id,
            lessonId: assignmentId,
            completed: true,
            completedAt: new Date(),
          }
        });

        // Trigger course progress recalculation (similar to progress update API)
        const totalLessons = await prisma.lesson.count({
          where: { courseId: enrollment.courseId, isPublished: true }
        });
        const completedLessons = await prisma.progress.count({
          where: { enrollmentId: enrollment.id, completed: true }
        });
        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { progressPercentage }
        });
      }
    } catch (progressError) {
      console.error('[Progress Update Error]:', progressError);
    }

    return NextResponse.json({ 
      success: true, 
      submission 
    });
  } catch (error) {
    console.error('Assignment submit error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
