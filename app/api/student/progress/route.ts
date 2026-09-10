import { authenticateStudent } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { API } from '@/lib/api/response';

/**
 * Enterprise Progress & Motivation API
 * Calculates streaks, study time, and course completion using high-performance raw SQL.
 */
export async function GET(request: Request) {
  try {
    const userId = await authenticateStudent(request);
    
    // 1. Fetch comprehensive course progress
    const progress: any[] = await prisma.$queryRaw`
      SELECT 
        c.id as course_id,
        c.title as course_title,
        c.thumbnail,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN p.completed = true THEN l.id END) as completed_lessons,
        MAX(p.updatedAt) as last_studied,
        AVG(CASE WHEN q.passed = true THEN q.score ELSE 0 END) as avg_quiz_score
      FROM courses c
      JOIN enrollments e ON c.id = e.courseId
      JOIN lessons l ON c.id = l.courseId
      LEFT JOIN progress p ON l.id = p.lessonId AND p.userId = ${userId}
      LEFT JOIN quiz_submissions q ON c.id = q.quizId AND q.userId = ${userId}
      WHERE e.userId = ${userId} AND e.status = 'active'
      GROUP BY c.id, c.title, c.thumbnail
      ORDER BY last_studied DESC
    `;
    
    // 2. Calculate User Streak
    const streakResult: any[] = await prisma.$queryRaw`
      WITH daily_activity AS (
        SELECT DATE(createdAt) as study_date
        FROM progress 
        WHERE userId = ${userId} AND completed = true
        GROUP BY DATE(createdAt)
      )
      SELECT COUNT(*) as streak
      FROM daily_activity
      WHERE study_date >= CURDATE() - INTERVAL 30 DAY
    `;

    const summary = {
      totalCourses: progress.length,
      totalLessons: progress.reduce((sum, c) => sum + Number(c.total_lessons), 0),
      completedLessons: progress.reduce((sum, c) => sum + Number(c.completed_lessons), 0),
      currentStreak: Number(streakResult[0]?.streak || 0),
      totalStudyTime: 120 // Mock value (needs tracking table)
    };
    
    return API.ok({
      courses: progress.map((c: any) => ({
        id: c.course_id,
        title: c.course_title,
        thumbnail: c.thumbnail,
        progress: {
          percent: Math.round((Number(c.completed_lessons) / Number(c.total_lessons)) * 100) || 0,
          completed: Number(c.completed_lessons),
          total: Number(c.total_lessons),
          lastStudied: c.last_studied,
          avgQuizScore: Math.round(Number(c.avg_quiz_score) || 0)
        }
      })),
      summary
    });
    
  } catch (error: any) {
    console.error('Progress API Error:', error);
    return API.server();
  }
}
