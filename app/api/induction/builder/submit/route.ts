import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = "force-dynamic";

const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/quicktime'];
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

async function saveFile(file: File, subDir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'builder', subDir);
  
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {}

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);
  
  return `/uploads/builder/${subDir}/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Please login to submit your project' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Basic
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const domain = formData.get('domain') as string;
    
    // Core
    const projectTitle = formData.get('projectTitle') as string;
    const elevatorPitch = formData.get('elevatorPitch') as string;
    const problemStatement = formData.get('problemStatement') as string;
    const solutionOverview = formData.get('solutionOverview') as string;
    const targetUsers = formData.get('targetUsers') as string;
    
    // Technical
    const techStack = formData.get('techStack') as string;
    const architectureSummary = formData.get('architectureSummary') as string;
    const keyFeatures = formData.get('keyFeatures') as string;
    
    // Proof
    const githubRepo = formData.get('githubRepo') as string;
    const liveDemo = formData.get('liveDemo') as string;
    const videoFile = formData.get('videoFile') as File | null;
    const videoLink = formData.get('videoLink') as string;
    
    // Evidence
    const screenshot1 = formData.get('screenshot1') as File | null;
    const screenshot2 = formData.get('screenshot2') as File | null;
    const screenshot3 = formData.get('screenshot3') as File | null;
    const metrics = formData.get('metrics') as string;

    // Validation
    if (!fullName || !email || !domain || !projectTitle || !elevatorPitch || !githubRepo) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    let videoUrl = videoLink || '';
    if (videoFile && videoFile instanceof File) {
      if (!SUPPORTED_VIDEO_FORMATS.includes(videoFile.type)) {
        return NextResponse.json({ error: 'INVALID_VIDEO_FORMAT' }, { status: 400 });
      }
      if (videoFile.size > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: 'VIDEO_TOO_LARGE' }, { status: 400 });
      }
      videoUrl = await saveFile(videoFile, 'videos');
    }

    if (!videoUrl) {
      return NextResponse.json({ error: 'VIDEO_REQUIRED' }, { status: 400 });
    }

    let ss1 = '', ss2 = '', ss3 = '';
    if (screenshot1 && screenshot1 instanceof File) ss1 = await saveFile(screenshot1, 'screenshots');
    if (screenshot2 && screenshot2 instanceof File) ss2 = await saveFile(screenshot2, 'screenshots');
    if (screenshot3 && screenshot3 instanceof File) ss3 = await saveFile(screenshot3, 'screenshots');

    // Create DB Entry
    const submission = await prisma.builderInductionSubmission.create({
      data: {
        userId: session.userId,
        fullName,
        email,
        domain,
        projectTitle,
        elevatorPitch,
        problemStatement,
        solutionOverview,
        targetUsers,
        techStack,
        architectureSummary,
        keyFeatures,
        githubRepo,
        liveDemo,
        videoDemoUrl: videoUrl,
        screenshot1: ss1,
        screenshot2: ss2,
        screenshot3: ss3,
        metrics,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      message: 'Project submitted successfully for evaluation'
    });

  } catch (error: any) {
    console.error('BUILDER_SUBMISSION_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
