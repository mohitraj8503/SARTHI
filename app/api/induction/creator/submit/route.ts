import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = "force-dynamic";

const SUPPORTED_FORMATS = ['video/mp4', 'video/quicktime'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Please login to submit your work' }, { status: 401 });
    }

    // Verify onboarding status from DB
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { onboarded: true }
    });

    if (!user?.onboarded) {
      return NextResponse.json({ error: 'ONBOARDING_REQUIRED', message: 'Please complete your onboarding' }, { status: 403 });
    }

    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const domain = formData.get('domain') as string;
    const description = formData.get('description') as string;
    const videoFile = formData.get('video') as File;

    if (!fullName || !email || !domain || !description || !videoFile) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    // Validation
    if (!SUPPORTED_FORMATS.includes(videoFile.type)) {
      return NextResponse.json({ error: 'INVALID_FORMAT', message: 'Only MP4 and MOV are allowed' }, { status: 400 });
    }

    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'FILE_TOO_LARGE', message: 'Max file size is 10MB' }, { status: 400 });
    }

    // Save File Locally
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'induction');
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    const filename = `${Date.now()}-${videoFile.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    const videoUrl = `/uploads/induction/${filename}`;

    // Create DB Entry
    const submission = await prisma.creatorInductionSubmission.create({
      data: {
        userId: session.userId,
        fullName,
        email,
        domain,
        videoUrl,
        description,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      message: 'Submission received successfully'
    });

  } catch (error: any) {
    console.error('INDUCTION_SUBMISSION_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
