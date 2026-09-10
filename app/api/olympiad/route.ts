export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

// Helper to get IST date boundaries
function getISTDateBoundaries() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  
  const todayStart = new Date(istNow);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(istNow);
  todayEnd.setHours(23, 59, 59, 999);
  
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  
  return {
    todayStartUTC: new Date(todayStart.getTime() - istOffset),
    todayEndUTC: new Date(todayEnd.getTime() - istOffset),
    yesterdayStartUTC: new Date(yesterdayStart.getTime() - istOffset),
    tomorrowStartUTC: new Date(tomorrowStart.getTime() - istOffset),
  };
}

// Helper to calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

// GET handler for olympiad progress data
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('tt_session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, grade: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'student'; // student, teacher, admin
    
    // Student progress endpoint
    if (type === 'student') {
      return await getStudentProgress(user.id);
    }
    
    // Teacher/class overview endpoint
    if (type === 'teacher') {
      // Check if user is teacher
      if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Teacher access required' }, { status: 403 });
      }
      return await getTeacherOverview(user.id);
    }
    
    // Admin overview endpoint
    if (type === 'admin') {
      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }
      return await getAdminOverview();
    }
    
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    
  } catch (error) {
    console.error('[Olympiad API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch olympiad data' }, { status: 500 });
  }
}

// POST handler for updating progress
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('tt_session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await req.json();
    const { area, data } = body;
    
    // Validate required fields
    if (!area || !data) {
      return NextResponse.json({ error: 'Area and data are required' }, { status: 400 });
    }
    
    // Update progress based on area
    let result;
    switch (area) {
      case 'olympiadBadges':
        result = await updateOlympiadBadges(user.id, data);
        break;
      case 'aiCurriculum':
        result = await updateAICurriculumProgress(user.id, data);
        break;
      case 'csProgress':
        result = await updateCSProgress(user.id, data);
        break;
      case 'achievements':
        result = await updateAchievements(user.id, data);
        break;
      case 'leaderboard':
        // Leaderboard updates are typically handled by system, not direct user updates
        return NextResponse.json({ error: 'Leaderboard updates cannot be modified directly' }, { status: 400 });
      case 'skillPath':
        result = await updateSkillPath(user.id, data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid area specified' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    console.error('[Olympiad API POST] Error:', error);
    return NextResponse.json({ error: 'Failed to update olympiad data' }, { status: 500 });
  }
}

// Helper function to get student progress
async function getStudentProgress(userId: string) {
  // Fetch all relevant progress data for a student
  const [
    olympiadBadges,
    aiCurriculumProgress,
    csProgress,
    achievements,
    leaderboardPositions,
    upcomingOlympiads,
    skillPathNodes
  ] = await Promise.all([
    prisma.olympiadBadge.findMany({
      where: { userId, isActive: true },
      orderBy: { awardedAt: 'desc' }
    }),
    prisma.aICurriculumProgress.findMany({
      where: { userId },
      orderBy: { lastAccessed: 'desc' }
    }),
    prisma.cSProgress.findMany({
      where: { userId },
      orderBy: { lastAccessed: 'desc' }
    }),
    prisma.achievementCertificate.findMany({
      where: { userId, isActive: true },
      orderBy: { issueDate: 'desc' }
    }),
    prisma.leaderboardPosition.findMany({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.upcomingOlympiad.findMany({
      where: {
        status: { in: ['UPCOMING', 'REGISTRATION_OPEN'] },
        examDate: { gt: new Date() }
      },
      orderBy: { examDate: 'asc' },
      take: 10
    }),
    // Assuming we have a way to get skill path nodes for the user
    // This would depend on how skill paths are implemented in your system
    prisma.skillPathNode.findMany({
      where: { 
        // This would need to be adjusted based on your actual skill path implementation
        // For now, we'll get nodes that might be associated with the user through completions
        isCompleted: true
      },
      orderBy: { completedAt: 'desc' },
      take: 20
    })
  ]);
  
  return NextResponse.json({
    badges: olympiadBadges,
    aiCurriculum: aiCurriculumProgress,
    csProgress: csProgress,
    achievements: achievements,
    leaderboard: leaderboardPositions,
    upcomingEvents: upcomingOlympiads,
    skillPath: skillPathNodes
  });
}

// Helper function to get teacher/class overview
async function getTeacherOverview(teacherId: string) {
  // Get students taught by this teacher (this would depend on your implementation)
  // For now, we'll get overall statistics that a teacher might need
  const [
    totalStudents,
    studentsWithBadges,
    aiCurriculumCompletionRate,
    csProgressCompletionRate,
    recentAchievements,
    upcomingEvents
  ] = await Promise.all([
    // Count of active students (this would need to be filtered by teacher's classes in a real implementation)
    prisma.user.count({
      where: { role: 'STUDENT', status: 'ACTIVE' }
    }),
    // Count of students with at least one olympiad badge
    prisma.user.count({
      where: {
        role: 'STUDENT',
        status: 'ACTIVE',
        olympiadBadges: {
          some: { isActive: true }
        }
      }
    }),
    // AI curriculum completion rate
    prisma.aICurriculumProgress.aggregate({
      where: { isCompleted: true },
      _count: true
    }),
    // CS progress completion rate
    prisma.cSProgress.aggregate({
      where: { isCompleted: true },
      _count: true
    }),
    // Recent achievements
    prisma.achievementCertificate.findMany({
      where: { isActive: true },
      orderBy: { issueDate: 'desc' },
      take: 10
    }),
    // Upcoming olympiad events
    prisma.upcomingOlympiad.findMany({
      where: {
        status: { in: ['UPCOMING', 'REGISTRATION_OPEN'] },
        examDate: { gt: new Date() }
      },
      orderBy: { examDate: 'asc' },
      take: 5
    })
  ]);
  
  // Calculate completion rates (would need total counts for accurate percentages)
  const aiTotal = await prisma.aICurriculumProgress.count();
  const csTotal = await prisma.cSProgress.count();
  
  const aiCompletionRate = aiTotal > 0 
    ? Math.round((aiCurriculumCompletionRate._count || 0) / aiTotal * 100) 
    : 0;
    
  const csCompletionRate = csTotal > 0 
    ? Math.round((csProgressCompletionRate._count || 0) / csTotal * 100) 
    : 0;
  
  return NextResponse.json({
    overview: {
      totalStudents,
      studentsWithBadges,
      participationRate: totalStudents > 0 
        ? Math.round((studentsWithBadges / totalStudents) * 100) 
        : 0
    },
    aiCurriculum: {
      completionRate: aiCompletionRate,
      totalModules: aiTotal
    },
    csProgress: {
      completionRate: csCompletionRate,
      totalTopics: csTotal
    },
    recentAchievements,
    upcomingEvents
  });
}

// Helper function to get admin overview
async function getAdminOverview() {
  // Get school-wide olympiad statistics
  const [
    totalStudents,
    totalBadgesAwarded,
    aiCurriculumStats,
    csProgressStats,
    achievementStats,
    leaderboardStats,
    upcomingEvents,
    schoolStats
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
    prisma.olympiadBadge.count({ where: { isActive: true } }),
    prisma.aICurriculumProgress.aggregate({
      _avg: { progressPercent: true },
      _sum: { lessonsCompleted: true, timeSpentMinutes: true },
      _count: true
    }),
    prisma.cSProgress.aggregate({
      _avg: { progressPercent: true },
      _sum: { subtopicsCompleted: true, timeSpentMinutes: true },
      _count: true
    }),
    prisma.achievementCertificate.count({ where: { isActive: true } }),
    prisma.leaderboardPosition.aggregate({
      _avg: { score: true, points: true },
      _count: true
    }),
    prisma.upcomingOlympiad.findMany({
      where: {
        status: { in: ['UPCOMING', 'REGISTRATION_OPEN', 'ONGOING'] }
      },
      orderBy: { examDate: 'asc' }
    }),
    // School profile stats if available
    prisma.schoolProfile.aggregate({
      _sum: { totalStudents: true, totalTeachers: true },
      _count: true
    })
  ]);
  
  return NextResponse.json({
    overview: {
      totalStudents,
      totalBadgesAwarded,
      badgesPerStudent: totalStudents > 0 
        ? (totalBadgesAwarded / totalStudents).toFixed(2) 
        : 0
    },
    aiCurriculum: {
      averageProgress: aiCurriculumStats._avg.progressPercent || 0,
      totalLessonsCompleted: aiCurriculumStats._sum.lessonsCompleted || 0,
      totalTimeSpent: aiCurriculumStats._sum.timeSpentMinutes || 0,
      totalStudents: aiCurriculumStats._count || 0
    },
    csProgress: {
      averageProgress: csProgressStats._avg.progressPercent || 0,
      totalSubtopicsCompleted: csProgressStats._sum.subtopicsCompleted || 0,
      totalTimeSpent: csProgressStats._sum.timeSpentMinutes || 0,
      totalStudents: csProgressStats._count || 0
    },
    achievements: {
      totalCertificates: achievementStats
    },
    leaderboard: {
      averageScore: leaderboardStats._avg.score || 0,
      averagePoints: leaderboardStats._avg.points || 0,
      totalEntries: leaderboardStats._count || 0
    },
    upcomingEvents: upcomingEvents,
    schoolStats: {
      totalSchools: schoolStats._count || 0,
      totalStudents: schoolStats._sum.totalStudents || 0,
      totalTeachers: schoolStats._sum.totalTeachers || 0
    }
  });
}

// Helper functions for updating progress
async function updateOlympiadBadges(userId: string, data: any) {
  // Validate and update olympiad badges
  // This would typically involve creating new badge entries
  return await prisma.olympiadBadge.create({
    data: {
      userId,
      olympiadId: data.olympiadId,
      badgeName: data.badgeName,
      level: data.level,
      issuedBy: data.issuedBy,
      badgeImage: data.badgeImage,
      description: data.description,
      criteriaMet: data.criteriaMet ? JSON.stringify(data.criteriaMet) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
}

async function updateAICurriculumProgress(userId: string, data: any) {
  // Update AI curriculum progress
  const existing = await prisma.aICurriculumProgress.findFirst({
    where: { 
      userId,
      moduleId: data.moduleId,
      classLevel: data.classLevel
    }
  });
  
  if (existing) {
    return await prisma.aICurriculumProgress.update({
      where: { id: existing.id },
      data: {
        progressPercent: data.progressPercent,
        lessonsCompleted: data.lessonsCompleted,
        totalLessons: data.totalLessons,
        lastAccessed: new Date(),
        completedAt: data.isCompleted ? new Date() : null,
        isCompleted: data.isCompleted,
        certificateId: data.certificateId,
        score: data.score,
        timeSpentMinutes: data.timeSpentMinutes
      }
    });
  } else {
    return await prisma.aICurriculumProgress.create({
      data: {
        userId,
        classLevel: data.classLevel,
        moduleId: data.moduleId,
        moduleTitle: data.moduleTitle,
        progressPercent: data.progressPercent,
        lessonsCompleted: data.lessonsCompleted,
        totalLessons: data.totalLessons,
        lastAccessed: new Date(),
        completedAt: data.isCompleted ? new Date() : null,
        isCompleted: data.isCompleted,
        certificateId: data.certificateId,
        score: data.score,
        timeSpentMinutes: data.timeSpentMinutes
      }
    });
  }
}

async function updateCSProgress(userId: string, data: any) {
  // Update CS progress
  const existing = await prisma.cSProgress.findFirst({
    where: { 
      userId,
      topicId: data.topicId,
      classLevel: data.classLevel
    }
  });
  
  if (existing) {
    return await prisma.cSProgress.update({
      where: { id: existing.id },
      data: {
        progressPercent: data.progressPercent,
        subtopicsCompleted: data.subtopicsCompleted,
        totalSubtopics: data.totalSubtopics,
        lastAccessed: new Date(),
        completedAt: data.isCompleted ? new Date() : null,
        isCompleted: data.isCompleted,
        certificateId: data.certificateId,
        score: data.score,
        timeSpentMinutes: data.timeSpentMinutes,
        projectCompleted: data.projectCompleted,
        practicalScore: data.practicalScore
      }
    });
  } else {
    return await prisma.cSProgress.create({
      data: {
        userId,
        classLevel: data.classLevel,
        topicId: data.topicId,
        topicTitle: data.topicTitle,
        progressPercent: data.progressPercent,
        subtopicsCompleted: data.subtopicsCompleted,
        totalSubtopics: data.totalSubtopics,
        lastAccessed: new Date(),
        completedAt: data.isCompleted ? new Date() : null,
        isCompleted: data.isCompleted,
        certificateId: data.certificateId,
        score: data.score,
        timeSpentMinutes: data.timeSpentMinutes,
        projectCompleted: data.projectCompleted,
        practicalScore: data.practicalScore
      }
    });
  }
}

async function updateAchievements(userId: string, data: any) {
  // Update/create achievement certificates
  return await prisma.achievementCertificate.create({
    data: {
      userId,
      certificateTitle: data.certificateTitle,
      certificateType: data.certificateType,
      issuer: data.issuer,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      certificateId: data.certificateId,
      certificateUrl: data.certificateUrl,
      verificationCode: data.verificationCode,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      isVerified: data.isVerified !== undefined ? data.isVerified : true,
      isActive: data.isActive !== undefined ? data.isActive : true,
      awardedFor: data.awardedFor,
      recipientName: data.recipientName,
      recipientId: data.recipientId
    }
  });
}

async function updateSkillPath(userId: string, data: any) {
  // Update skill path progress
  // This would depend on how skill paths are implemented in your system
  // For now, we'll return a placeholder
  return { message: 'Skill path update functionality would be implemented based on your skill path structure' };
}

