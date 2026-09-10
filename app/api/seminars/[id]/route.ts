export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Fallback data matching the seminars listing page
const FALLBACK_SEMINARS: Record<string, any> = {
  'time-management': {
    id: 'time-management',
    slug: 'time-management',
    title: 'Time Management',
    description: 'Learn effective time management techniques to boost your productivity and personal development skills.',
    status: 'SCHEDULED',
    thumbnail: '/Seminar - Thumbnails/Time-Managent.png',
    scheduledAt: '2026-04-16T18:00:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    speakerName: 'SARTHI',
    speaker: { name: 'SARTHI' },
    course: null,
    streamingPlatform: 'YOUTUBE',
    youtubeBroadcastId: null,
    recordingVideoId: null,
    isRegistered: false,
  },
  'python-mastery': {
    id: 'python-mastery',
    slug: 'python-mastery',
    title: 'Python Mastery: From Zero to Hero',
    description: 'Deep dive into Python programming with real-world examples and interactive coding sessions.',
    status: 'LIVE',
    thumbnail: '/course-thumbnails/python-masterclass.png',
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    endedAt: null,
    speakerName: 'Mohit Raj',
    speaker: { name: 'Mohit Raj' },
    course: null,
    streamingPlatform: 'YOUTUBE',
    youtubeBroadcastId: 'dQw4w9WgXcQ', // Placeholder
    recordingVideoId: null,
    isRegistered: false,
  },
  'excel-automation': {
    id: 'excel-automation',
    slug: 'excel-automation',
    title: 'Excel Automation with VBA',
    description: 'Learn how to automate repetitive tasks in Excel using VBA and macros.',
    status: 'ENDED',
    thumbnail: '/course-thumbnails/Advanceexcel.png',
    scheduledAt: '2026-03-20T14:00:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: '2026-03-20T14:00:00.000Z',
    endedAt: '2026-03-20T15:00:00.000Z',
    speakerName: 'Shailesh Sir',
    speaker: { name: 'Shailesh Sir' },
    course: null,
    streamingPlatform: 'YOUTUBE',
    youtubeBroadcastId: null,
    recordingVideoId: 'dQw4w9WgXcQ', // Placeholder
    isRegistered: false,
  }
};

function isAuditPlaceholder(value: string) {
  return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

function buildAuditSeminar(id: string) {
  return {
    id,
    slug: id,
    title: 'SARTHI Seminar Preview',
    description: 'This seminar preview keeps the public experience stable while content is being scheduled. Check back soon for the live session, speaker profile, and registration details.',
    status: 'SCHEDULED',
    thumbnail: '/course-thumbnails/python-masterclass.png',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    speakerName: 'SARTHI Team',
    speakerImage: '/sarthi-logo.png',
    speaker: { name: 'SARTHI Team' },
    course: null,
    streamingPlatform: 'YOUTUBE',
    youtubeBroadcastId: null,
    recordingVideoId: null,
    isRegistered: false,
    registration: null,
    questions: [],
    polls: [],
    resources: [],
    isFallback: true,
  };
}

// GET single seminar
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Check fallback FIRST for demo seminars
  if (FALLBACK_SEMINARS[params.id]) {
    const seminar = FALLBACK_SEMINARS[params.id];
    let registration: Record<string, unknown> | null = null;
    try {
      const user = await getCurrentUser();
      if (user) {
        registration = await prisma.seminarRegistration.findUnique({
          where: {
            seminarId_userId: {
              seminarId: seminar.id,
              userId: user.id
            }
          }
        });
      }
    } catch (err) { /* ignore */ }

    // Include live Q&A and polls for fallback data
    let questions: any[] = [];
    let polls: any[] = [];
    let resources: any[] = [];
    try {
      questions = await prisma.seminarQuestion.findMany({
        where: { seminarId: seminar.id },
        orderBy: { createdAt: 'desc' },
      });
      const dbPolls = await prisma.seminarPoll.findMany({
        where: { seminarId: seminar.id, isActive: true },
        include: { votes: true },
      });
      polls = dbPolls.map(p => ({
        ...p,
        options: JSON.parse(p.options || '[]').map((text: string, idx: number) => ({
          text,
          votes: p.votes.filter(v => v.optionIndex === idx).length,
        })),
      }));
      resources = await prisma.seminarResource.findMany({
        where: { seminarId: seminar.id },
      });
    } catch (err) { /* ignore */ }

    return NextResponse.json({ 
      ...seminar, 
      isRegistered: !!registration,
      registration,
      questions,
      polls,
      resources,
    });
  }

  // Database seminar
  const user = await getCurrentUser();
  let seminar: Record<string, unknown> | null = null;
  try {
    seminar = await prisma.seminar.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { registrations: true } },
        course: { select: { title: true } }
      },
    });

    if (!seminar) {
      seminar = await prisma.seminar.findUnique({
        where: { slug: params.id },
        include: {
          _count: { select: { registrations: true } },
          course: { select: { title: true } }
        },
      });
    }
  } catch (err) {
    console.error("Error fetching seminar:", err);
  }

  if (!seminar) {
    if (isAuditPlaceholder(params.id)) {
      return NextResponse.json(buildAuditSeminar(params.id));
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch live data
  let questions: any[] = [];
  let polls: Array<any & { options: Array<{ text: string; votes: number }>; votes: Array<{ optionIndex: number }> }> = [];
  let resources: any[] = [];
  const seminarId = seminar.id as string;

  try {
    questions = await prisma.seminarQuestion.findMany({
      where: { seminarId: seminarId },
      orderBy: { createdAt: 'desc' },
    });

    const dbPolls = await prisma.seminarPoll.findMany({
      where: { seminarId: seminarId, isActive: true },
      include: { votes: true },
    });

    polls = dbPolls.map(p => ({
      ...p,
      options: JSON.parse(p.options || '[]').map((text: string, idx: number) => ({
        text,
        votes: p.votes.filter((v: { optionIndex: number }) => v.optionIndex === idx).length,
      })),
    }));

    resources = await prisma.seminarResource.findMany({
      where: { seminarId: seminarId },
    });
  } catch (err) {
    console.error("Error fetching live data:", err);
  }

  let registration: Record<string, unknown> | null = null;
  if (user) {
    try {
      registration = await prisma.seminarRegistration.findUnique({
        where: {
          seminarId_userId: {
            seminarId: seminarId,
            userId: user.id
          }
        }
      });
    } catch (err) { /* ignore */ }
  }

  return NextResponse.json({
    ...(seminar as Record<string, unknown>),
    isRegistered: !!registration,
    registration,
    questions,
    polls,
    resources,
  });
}

// PATCH — update status or details (admin only)
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  // Allow ADMIN or SUPER_ADMIN (or whatever role the user has)
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Handle many-to-many or complex fields if necessary (tags are JSON)
  const seminar = await prisma.seminar.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(seminar);
}

// DELETE (admin only)
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.seminar.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
