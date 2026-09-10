import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Authorize admin
    const admin = await requireAdmin('admin');
    
    // 2. Parse search & filter parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const filter = searchParams.get('filter') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 3. Formulate the query filters
    const where: any = { 
      role: 'STUDENT',
      status: { not: 'DELETED' }
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { enrollmentNumber: { contains: search } }
      ];
    }

    if (filter) {
      switch (filter.toLowerCase()) {
        case 'active': 
          where.status = 'ACTIVE'; 
          break;
        case 'pending': 
          where.status = 'PENDING'; 
          break;
        case 'inactive': 
          where.status = { in: ['INACTIVE', 'SUSPENDED', 'BANNED'] }; 
          break;
        default:
          if (filter.startsWith('course_')) {
            where.enrollments = { some: { courseId: filter.replace('course_', '') } };
          }
      }
    }

    // 4. Fetch ALL matching students
    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        image: true,
        avatar_url: true,
        enrollmentNumber: true,
        studentId: true,
        lastLogin: true,
        createdAt: true,
        enrollments: { 
          select: { 
            course: { select: { title: true } }
          } 
        }
      },
      orderBy: { [sortBy]: sortOrder }
    });

    // 5. Aggregate metrics
    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => s.status === 'ACTIVE').length;
    const pendingStudents = students.filter((s: any) => s.status === 'PENDING').length;
    const inactiveStudents = totalStudents - activeStudents - pendingStudents;

    // New registrations this month (registered since monthStart)
    const newThisMonth = students.filter((s: any) => s.createdAt >= monthStart).length;
    // New registrations last month
    const newLastMonth = students.filter((s: any) => s.createdAt >= lastMonthStart && s.createdAt < monthStart).length;

    // Growth rate calculation: (newThisMonth - newLastMonth) / Math.max(1, newLastMonth) * 100
    const growthRate = newLastMonth === 0 
      ? (newThisMonth > 0 ? 100 : 0) 
      : Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100);

    // Timeline registrations (Group by YYYY-MM-DD)
    const timelineMap: { [key: string]: number } = {};
    students.forEach((s: any) => {
      const dateStr = s.createdAt.toISOString().split('T')[0];
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    });

    const timelineData = Object.entries(timelineMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Find most active registration day
    let mostActiveDay = 'N/A';
    let maxDayCount = 0;
    Object.entries(timelineMap).forEach(([date, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        mostActiveDay = date;
      }
    });

    const activePercentage = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
    const pendingPercentage = totalStudents > 0 ? Math.round((pendingStudents / totalStudents) * 100) : 0;

    const transformedStudents = students.map((s: any) => ({
      id: s.id,
      name: s.name || 'Anonymous Learner',
      email: s.email,
      phone: s.phone || 'N/A',
      status: s.status,
      avatar: s.image || s.avatar_url || null,
      studentId: s.studentId || s.enrollmentNumber || 'N/A',
      createdAt: s.createdAt,
      courses: s.enrollments.map((e: any) => e.course.title)
    }));

    const executionTimeMs = Date.now() - startTime;

    return ApiResponse.success({
      adminName: admin.name || admin.email || 'Admin',
      summary: {
        totalStudents,
        activeStudents,
        pendingStudents,
        inactiveStudents,
        newThisMonth,
        activePercentage,
        pendingPercentage,
        growthRate,
        mostActiveDay: mostActiveDay !== 'N/A' ? new Date(mostActiveDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      },
      timeline: timelineData,
      students: transformedStudents,
      meta: {
        filter: filter || 'All',
        search: search || 'None',
        generatedAt: now.toISOString(),
        executionTimeMs
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
