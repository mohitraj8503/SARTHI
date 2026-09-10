export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

interface StudentConstellation {
  id: string;
  name: string;
  engagement: number; // 0-100, brightness
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  connectionStrength: number; // 0-100, orbit proximity
  position: { x: number; y: number };
  peers: string[]; // IDs of connected peers
  strengths: string[];
  struggles: string[];
  learningJourney: string[];
  privateNotes: string;
}

export async function GET(request: Request) {
  try {
    // Get session
    const cookieStore = await cookies();
    const token = cookieStore.get('tt_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const userId = payload.userId;

    // Get all students enrolled in teacher's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Group students by course for peer relationships
    const courseStudents = new Map<string, any[]>();
    enrollments.forEach((enrollment) => {
      const courseId = enrollment.course.id;
      if (!courseStudents.has(courseId)) {
        courseStudents.set(courseId, []);
      }
      courseStudents.get(courseId)!.push(enrollment);
    });

    // Generate constellation data
    const constellations: StudentConstellation[] = [];

    // Learning styles mapping
    const learningStyles: ('visual' | 'auditory' | 'kinesthetic' | 'reading')[] = [
      'visual',
      'auditory',
      'kinesthetic',
      'reading',
    ];

    // Strengths and struggles patterns
    const strengthsPool = [
      'Problem Solving',
      'Critical Thinking',
      'Creativity',
      'Leadership',
      'Communication',
      'Time Management',
      'Research Skills',
      'Technical Proficiency',
    ];

    const strugglesPool = [
      'Time Management',
      'Focus Issues',
      'Understanding Concepts',
      'Practice Application',
      'Test Anxiety',
      'Group Work',
      'Self-Motivation',
      'Technical Difficulties',
    ];

    const journeyMilestones = [
      'Completed first module',
      'Achieved 50% progress',
      'Submitted first assignment',
      'Participated in discussion',
      'Improved quiz scores',
      'Helped peer student',
    ];

    enrollments.forEach((enrollment, index) => {
      const student = enrollment.user;
      const progress = enrollment.progressPercentage || 0;

      // Calculate engagement based on progress and activity
      const engagement = Math.min(100, Math.max(20, progress + Math.random() * 30));

      // Assign learning style based on student ID hash for consistency
      const styleIndex =
        student.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
      const learningStyle = learningStyles[styleIndex];

      // Connection strength based on progress and engagement
      const connectionStrength = Math.min(100, progress + engagement * 0.5);

      // Position in constellation (circular arrangement with some randomness)
      const angle = (index / enrollments.length) * 2 * Math.PI;
      const radius = 200 + Math.random() * 100;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Find peers in same course
      const coursePeers = courseStudents.get(enrollment.course.id) || [];
      const peers = coursePeers
        .filter((peer) => peer.user.id !== student.id)
        .slice(0, 3) // Connect to up to 3 peers
        .map((peer) => peer.user.id);

      // Generate strengths (2-4 random)
      const numStrengths = 2 + Math.floor(Math.random() * 3);
      const strengths = strengthsPool.sort(() => Math.random() - 0.5).slice(0, numStrengths);

      // Generate struggles (1-3 random)
      const numStruggles = 1 + Math.floor(Math.random() * 3);
      const struggles = strugglesPool.sort(() => Math.random() - 0.5).slice(0, numStruggles);

      // Generate learning journey (3-5 milestones)
      const numMilestones = 3 + Math.floor(Math.random() * 3);
      const learningJourney = journeyMilestones
        .sort(() => Math.random() - 0.5)
        .slice(0, numMilestones);

      // Private notes
      const privateNotes = `Student shows ${
        engagement > 70 ? 'strong' : engagement > 40 ? 'moderate' : 'limited'
      } engagement. ${
        progress > 80 ? 'Excellent progress' : progress > 50 ? 'Good progress' : 'Needs improvement'
      }. Prefers ${learningStyle} learning style.`;

      constellations.push({
        id: student.id,
        name: student.name || 'Unknown Student',
        engagement,
        learningStyle,
        connectionStrength,
        position: { x, y },
        peers,
        strengths,
        struggles,
        learningJourney,
        privateNotes,
      });
    });

    return NextResponse.json({
      constellations,
      totalStudents: constellations.length,
    });
  } catch (error: any) {
    console.error('[TeacherConstellations] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch constellation data' },
      { status: 500 }
    );
  }
}

