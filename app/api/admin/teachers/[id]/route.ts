export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * GET: Teacher Detail Context-Driven API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: teacherId } = await params;
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'overview';
    const dateRange = searchParams.get('range') || '30'; // 7, 30, 90, 365, custom

    // First fetch core teacher user account details
    let teacherUser = await prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        teacher: {
          include: {
            payouts: { orderBy: { createdAt: 'desc' } }
          }
        },
        _count: { select: { courses: true } }
      }
    });

    if (!teacherUser) {
      // Fallback check: is it an applicant profile?
      if (teacherId.startsWith('app_')) {
        const appId = teacherId.replace('app_', '');
        const app = await prisma.teacherApplication.findUnique({
          where: { id: appId },
          include: { education: true, documents: true }
        });
        if (app) {
          return ApiResponse.success({
            id: `app_${app.id}`,
            name: app.fullName,
            email: app.email,
            role: 'APPLICANT',
            status: app.status.toLowerCase(),
            createdAt: app.submittedAt || app.createdAt,
            teacherInfo: null,
            application: app,
            coursesCount: 0
          });
        }
      }
      return ApiResponse.error('Teacher not found', 'NOT_FOUND', 404);
    }

    const appRecord = await prisma.teacherApplication.findFirst({
      where: {
        OR: [
          { userId: teacherId },
          { email: teacherUser.email }
        ]
      }
    });

    const teacherProfile = teacherUser.teacher;
    const courses = await prisma.course.findMany({
      where: { instructorId: teacherId }
    });
    const courseIds = courses.map(c => c.id);

    // Dynamic Context Switching based on ?tab=
    switch (tab) {
      case 'overview': {
        // Compute real summary statistics from database
        const totalCourses = courses.length;

        // Total unique students enrolled
        const enrollments = await prisma.enrollment.findMany({
          where: { courseId: { in: courseIds } },
          select: { userId: true, status: true, progressPercentage: true, liveAttendanceRate: true }
        });
        const uniqueStudentIds = new Set(enrollments.map(e => e.userId));
        const totalStudents = uniqueStudentIds.size;

        // Gross Revenue from transactions
        const transactions = await prisma.transaction.findMany({
          where: { courseId: { in: courseIds }, status: 'success' },
          select: { amount: true }
        });
        const grossRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

        // Average Rating
        const ratings = courses.map(c => c.rating);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

        // Active Enrollments
        const activeEnrollments = enrollments.filter(e => e.status === 'active').length;

        // Completion Rate
        const completedEnrollments = enrollments.filter(e => e.status === 'completed' || e.progressPercentage === 100).length;
        const completionRate = enrollments.length > 0 ? (completedEnrollments / enrollments.length) * 100 : 0;

        // Retention Rate (Active students in past 30 days / total students)
        let retentionRate = 0;
        if (totalStudents > 0) {
          const activeRecentCount = await prisma.user.count({
            where: {
              id: { in: Array.from(uniqueStudentIds) },
              lastActive: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          });
          retentionRate = (activeRecentCount / totalStudents) * 100;
        }

        // Calculate dynamic Health Score (0 - 100)
        let profileScore = 0;
        if (teacherUser.name) profileScore += 4;
        if (teacherUser.bio) profileScore += 4;
        if (teacherUser.phone) profileScore += 4;
        if (teacherUser.image || teacherUser.avatar_url) profileScore += 4;
        if (teacherUser.company) profileScore += 4; // Max 20

        const courseActivityScore = Math.min(20, (totalCourses * 5) + (courses.filter(c => c.isPublished).length * 5)); // Max 20

        const avgProgress = enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length : 0;
        const engagementScore = Math.min(20, (avgProgress / 100) * 20); // Max 20

        const avgAttendance = enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + (e.liveAttendanceRate ?? 0), 0) / enrollments.length : 0;
        const attendanceScore = Math.min(20, (avgAttendance / 100) * 20); // Max 20

        const ratingScore = Math.min(20, averageRating * 4); // Max 20 (5.0 rating = 20 pts)
        const healthScore = Math.round(profileScore + courseActivityScore + engagementScore + attendanceScore + ratingScore);

        const healthBreakdown = {
          profile: profileScore,
          courseActivity: courseActivityScore,
          engagement: parseFloat(engagementScore.toFixed(1)),
          attendance: parseFloat(attendanceScore.toFixed(1)),
          rating: parseFloat(ratingScore.toFixed(1))
        };

        // Recent Audit logs targetting this teacher
        const auditLogs = await prisma.adminAuditLog.findMany({
          where: {
            OR: [
              { targetId: teacherId, targetType: 'TEACHER' },
              { targetId: teacherId, targetType: 'USER' },
              { adminId: teacherId }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        let currentRole = 'Instructor';
        let currentCompany = teacherUser.company || '';
        let toolsMastery = '';
        let availabilityObj = null;
        let preferredSubjectsList: string[] = [];
        let portfolioLinksObj = null;

        if (appRecord) {
          if (appRecord.expertise) {
            try {
              const expObj = JSON.parse(appRecord.expertise);
              currentRole = expObj.currentRole || currentRole;
              currentCompany = expObj.currentCompany || currentCompany;
              toolsMastery = expObj.toolsMastery || '';
            } catch (e) {
              // fallback
            }
          }
          if (appRecord.availability) {
            try {
              availabilityObj = JSON.parse(appRecord.availability);
            } catch (e) {}
          }
          if (appRecord.preferredSubjects) {
            try {
              preferredSubjectsList = JSON.parse(appRecord.preferredSubjects);
            } catch (e) {}
          }
          if (appRecord.portfolioLinks) {
            try {
              portfolioLinksObj = JSON.parse(appRecord.portfolioLinks);
            } catch (e) {}
          }
        }

        return ApiResponse.success({
          id: teacherUser.id,
          name: teacherUser.name,
          email: teacherUser.email,
          image: teacherUser.image,
          avatar_url: teacherUser.avatar_url,
          role: teacherUser.role,
          bio: teacherUser.bio || appRecord?.bio || teacherProfile?.bio || null,
          company: currentCompany || 'SARTHI Faculty',
          phone: teacherUser.phone || appRecord?.phone || null,
          roleTitle: currentRole,
          toolsMastery,
          availability: availabilityObj,
          preferredSubjects: preferredSubjectsList,
          portfolioLinks: portfolioLinksObj,
          status: teacherProfile?.status || 'pending',
          onboardingStatus: teacherUser.onboardingStatus,
          requiresPasswordChange: teacherUser.requiresPasswordChange,
          tempPassword: teacherUser.tempPassword,
          createdAt: teacherUser.createdAt,
          summary: {
            totalCourses,
            totalStudents,
            grossRevenue,
            netRevenue: teacherProfile?.totalEarnings || (grossRevenue * 0.7),
            averageRating,
            activeEnrollments,
            completionRate,
            retentionRate
          },
          healthScore,
          healthBreakdown,
          recentActivity: auditLogs
        });
      }

      case 'courses': {
        const coursesWithPerformance = await Promise.all(courses.map(async (course) => {
          const enrolls = await prisma.enrollment.findMany({
            where: { courseId: course.id },
            select: { status: true, progressPercentage: true }
          });
          const totalE = enrolls.length;
          const completedE = enrolls.filter(e => e.status === 'completed' || e.progressPercentage === 100).length;
          const completionPercentage = totalE > 0 ? (completedE / totalE) * 100 : 0;

          const txs = await prisma.transaction.aggregate({
            where: { courseId: course.id, status: 'success' },
            _sum: { amount: true }
          });

          const avgProgress = totalE > 0 ? enrolls.reduce((sum, e) => sum + e.progressPercentage, 0) / totalE : 0;

          return {
            id: course.id,
            title: course.title,
            isPublished: course.isPublished,
            enrolledStudentsCount: totalE,
            completionPercentage,
            revenueGenerated: txs._sum.amount ?? 0,
            averageRating: course.rating,
            lastUpdated: course.updatedAt,
            engagementScore: Math.round(avgProgress)
          };
        }));

        return ApiResponse.success(coursesWithPerformance);
      }

      case 'students': {
        const studentEnrollments = await prisma.enrollment.findMany({
          where: { courseId: { in: courseIds } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                avatar_url: true,
                status: true,
                lastActive: true
              }
            },
            course: {
              select: {
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        const studentsList = studentEnrollments.map(e => ({
          id: e.user.id,
          name: e.user.name,
          email: e.user.email,
          image: e.user.image || e.user.avatar_url,
          course: e.course.title,
          enrollmentDate: e.createdAt,
          progress: e.progressPercentage,
          attendance: e.liveAttendanceRate ?? 0,
          lastActive: e.lastAccessedAt || e.user.lastActive,
          status: e.status
        }));

        return ApiResponse.success(studentsList);
      }

      case 'analytics': {
        // Temporal Trend Generation (Dynamic aggregation based on dates)
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch logs and records in date range
        const enrollments = await prisma.enrollment.findMany({
          where: { courseId: { in: courseIds }, createdAt: { gte: startDate } },
          orderBy: { createdAt: 'asc' }
        });

        // 1. Student Growth Trend & Enrollment Trend
        const growthTrend: { date: string; count: number }[] = [];
        const enrollmentTrend: { date: string; total: number }[] = [];
        let runningTotal = await prisma.enrollment.count({
          where: { courseId: { in: courseIds }, createdAt: { lt: startDate } }
        });

        // Generate date maps
        const dateMap: { [key: string]: number } = {};
        for (let i = 0; i <= days; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          dateMap[dateStr] = 0;
        }

        enrollments.forEach(e => {
          const dateStr = new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          if (dateMap[dateStr] !== undefined) {
            dateMap[dateStr]++;
          }
        });

        Object.keys(dateMap).forEach(date => {
          growthTrend.push({ date, count: dateMap[date] });
          runningTotal += dateMap[date];
          enrollmentTrend.push({ date, total: runningTotal });
        });

        // 2. Ratings Trend
        const ratingTrend = courses.length > 0 ? courses.map(c => ({
          course: c.title,
          rating: c.rating
        })) : [];

        // 3. Drop-off Analysis (Progress Buckets)
        const progressBuckets = [
          { bucket: '0-20%', count: 0 },
          { bucket: '21-40%', count: 0 },
          { bucket: '41-60%', count: 0 },
          { bucket: '61-80%', count: 0 },
          { bucket: '81-100%', count: 0 }
        ];

        const allEnrollments = await prisma.enrollment.findMany({
          where: { courseId: { in: courseIds } },
          select: { progressPercentage: true }
        });

        allEnrollments.forEach(e => {
          const p = e.progressPercentage;
          if (p <= 20) progressBuckets[0].count++;
          else if (p <= 40) progressBuckets[1].count++;
          else if (p <= 60) progressBuckets[2].count++;
          else if (p <= 80) progressBuckets[3].count++;
          else progressBuckets[4].count++;
        });

        // 4. Top Performing Course
        const coursePerformance = await Promise.all(courses.map(async (c) => {
          const count = await prisma.enrollment.count({ where: { courseId: c.id } });
          const rev = await prisma.transaction.aggregate({
            where: { courseId: c.id, status: 'success' },
            _sum: { amount: true }
          });
          return {
            title: c.title,
            enrollments: count,
            revenue: rev._sum.amount ?? 0
          };
        }));

        coursePerformance.sort((a, b) => b.revenue - a.revenue);

        // 5. Most Active Students
        const activeStudents = await prisma.enrollment.findMany({
          where: { courseId: { in: courseIds } },
          include: {
            user: { select: { name: true, email: true, lastActive: true } }
          },
          orderBy: { lastAccessedAt: 'desc' },
          take: 5
        });

        const formattedActiveStudents = activeStudents.map(s => ({
          name: s.user.name,
          email: s.user.email,
          progress: s.progressPercentage,
          lastActive: s.lastAccessedAt || s.user.lastActive
        }));

        return ApiResponse.success({
          growthTrend,
          enrollmentTrend,
          ratingTrend,
          progressBuckets,
          topCourses: coursePerformance,
          mostActiveStudents: formattedActiveStudents
        });
      }

      case 'revenue': {
        const transactions = await prisma.transaction.findMany({
          where: { courseId: { in: courseIds }, status: 'success' },
          include: {
            user: { select: { name: true, email: true } },
            course: { select: { title: true, category: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        const grossRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
        const commissionRate = teacherProfile?.commissionRate ?? 70;
        const netRevenue = (grossRevenue * commissionRate) / 100;
        const platformFees = grossRevenue - netRevenue;

        // Group by course
        const revenueByCourseMap: { [key: string]: number } = {};
        transactions.forEach(t => {
          const title = t.course.title;
          revenueByCourseMap[title] = (revenueByCourseMap[title] || 0) + t.amount;
        });
        const revenueByCourse = Object.keys(revenueByCourseMap).map(title => ({
          title,
          revenue: revenueByCourseMap[title]
        }));

        // Growth Percentage (comparing current month vs last month)
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisMonthRevenue = transactions
          .filter(t => new Date(t.createdAt) >= thisMonthStart)
          .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthRevenue = transactions
          .filter(t => new Date(t.createdAt) >= lastMonthStart && new Date(t.createdAt) < thisMonthStart)
          .reduce((sum, t) => sum + t.amount, 0);

        let growthPercentage = 0;
        let growthPeriodExists = false;
        if (lastMonthRevenue > 0) {
          growthPercentage = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
          growthPeriodExists = true;
        }

        const formattedTransactions = transactions.map(t => ({
          id: t.id,
          invoiceNumber: t.invoiceNumber || 'INV-TEMP',
          studentName: t.user.name,
          studentEmail: t.user.email,
          courseTitle: t.course.title,
          amount: t.amount,
          date: t.createdAt,
          status: t.status
        }));

        return ApiResponse.success({
          summary: {
            grossRevenue,
            netRevenue,
            platformFees,
            refunds: 0, // Mock or fetch refunded transaction details if status exists
            growthPercentage: parseFloat(growthPercentage.toFixed(1)),
            growthPeriodExists
          },
          revenueByCourse,
          transactions: formattedTransactions
        });
      }

      case 'payouts': {
        const availableBalance = (teacherProfile?.totalEarnings ?? 0) - (teacherProfile?.totalPayouts ?? 0);
        // Pending balance (earnings in last 14 days)
        const clearDate = new Date();
        clearDate.setDate(clearDate.getDate() - 14);
        const pendingEarnings = await prisma.teacherEarning.aggregate({
          where: { teacherId: teacherProfile?.id, status: 'pending', createdAt: { gte: clearDate } },
          _sum: { teacherShare: true }
        });

        // Payout history
        const payoutHistory = teacherProfile?.payouts.map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.createdAt,
          method: p.method,
          transactionId: p.transactionId || 'PENDING',
          status: p.status
        })) || [];

        const lastPayout = payoutHistory.find(p => p.status === 'processed');

        let payoutDetailsObj = null;
        if (teacherProfile?.payoutDetails) {
          try {
            payoutDetailsObj = JSON.parse(teacherProfile.payoutDetails);
          } catch (e) {
            payoutDetailsObj = teacherProfile.payoutDetails;
          }
        }

        return ApiResponse.success({
          connected: teacherProfile?.payoutMethodConnected || false,
          methodType: teacherProfile?.payoutMethodType || null,
          details: payoutDetailsObj,
          detailsStatus: teacherProfile?.payoutDetailsStatus || 'none',
          metrics: {
            availableBalance: availableBalance > 0 ? availableBalance : 0,
            pendingBalance: pendingEarnings._sum.teacherShare ?? 0,
            lifetimeEarnings: teacherProfile?.totalEarnings ?? 0,
            totalWithdrawals: teacherProfile?.totalPayouts ?? 0,
            lastPayoutDate: lastPayout ? lastPayout.date : null
          },
          payouts: payoutHistory
        });
      }

      case 'settings': {
        // Fetch sessions
        const sessions = await prisma.userSession.findMany({
          where: { userId: teacherId },
          orderBy: { lastActivity: 'desc' },
          take: 5
        });

        return ApiResponse.success({
          mfaEnabled: teacherUser.twoFactorEnabled,
          authProvider: teacherUser.authProvider || 'credentials',
          permissions: {
            canCreateCourses: teacherProfile?.canCreateCourses || false,
            canGrade: teacherProfile?.canGrade || false,
            canMessageStudents: teacherProfile?.canMessageStudents || false,
            commissionRate: teacherProfile?.commissionRate || 70
          },
          sessions: sessions.map(s => ({
            id: s.id,
            ipAddress: s.ipAddress || 'Unknown IP',
            city: s.city || 'Unknown Location',
            state: s.state || 'Unknown State',
            lastActivity: s.lastActivity
          }))
        });
      }

      default:
        return ApiResponse.error("Unsupported tab context", "BAD_REQUEST", 400);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH: Update Teacher & Verification Logic
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: teacherId } = await params;
    const body = await request.json();
    const { 
      name, role, status, bio, company,
      // Permissions updates
      canCreateCourses, canGrade, canMessageStudents, commissionRate,
      // Payout details update
      payoutMethodType, payoutDetails, payoutDetailsStatus
    } = body;

    const teacherToUpdate = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacher: true }
    });

    if (role && (role === 'INSTRUCTOR' || role === 'TEACHER')) {
      if (teacherToUpdate?.enrollmentNumber?.startsWith('TT-STU')) {
        return ApiResponse.error("STRICT_ROLE_POLICY: Cannot promote a student account (TT-STU) to instructor role.", "FORBIDDEN", 403);
      }
    }

    // Build the Teacher update data dynamically
    const teacherUpdateData: any = {};
    if (status !== undefined) teacherUpdateData.status = status;
    if (canCreateCourses !== undefined) teacherUpdateData.canCreateCourses = canCreateCourses;
    if (canGrade !== undefined) teacherUpdateData.canGrade = canGrade;
    if (canMessageStudents !== undefined) teacherUpdateData.canMessageStudents = canMessageStudents;
    if (commissionRate !== undefined) teacherUpdateData.commissionRate = parseFloat(commissionRate);

    // Payout fields update
    if (payoutMethodType !== undefined) {
      teacherUpdateData.payoutMethodType = payoutMethodType;
      teacherUpdateData.payoutMethodConnected = true;
    }
    if (payoutDetails !== undefined) {
      teacherUpdateData.payoutDetails = typeof payoutDetails === 'string' ? payoutDetails : JSON.stringify(payoutDetails);
    }
    if (payoutDetailsStatus !== undefined) {
      teacherUpdateData.payoutDetailsStatus = payoutDetailsStatus;
      if (payoutDetailsStatus === 'approved') {
        teacherUpdateData.payoutMethodConnected = true;
      } else if (payoutDetailsStatus === 'rejected') {
        teacherUpdateData.payoutMethodConnected = false;
      }
    }

    // Perform User & Teacher updates in transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: teacherId },
        data: {
          name,
          role,
          bio,
          company
        }
      });

      if (teacherToUpdate?.teacher) {
        await tx.teacher.update({
          where: { userId: teacherId },
          data: teacherUpdateData
        });
      } else if (Object.keys(teacherUpdateData).length > 0) {
        // If teacher profile does not exist yet, create one
        await tx.teacher.create({
          data: {
            userId: teacherId,
            title: 'Instructor',
            status: status || 'pending',
            ...teacherUpdateData
          }
        });
      }

      return user;
    });

    await auditAdminAction(
      admin,
      'teacher_update',
      'USER',
      teacherId,
      updatedUser.name ?? undefined,
      body
    );

    return ApiResponse.success(updatedUser, 'Teacher configuration updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE: Delete Teacher
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: teacherId } = await params;

    // Check if teacher has courses
    const coursesCount = await prisma.course.count({ where: { instructorId: teacherId } });
    if (coursesCount > 0) {
      return ApiResponse.error(`Cannot delete teacher with ${coursesCount} active courses. Reassign them first.`, 'CONFLICT', 409);
    }

    const teacher = await prisma.user.delete({ where: { id: teacherId } });

    await auditAdminAction(
      admin,
      'teacher_delete',
      'USER',
      teacherId,
      teacher.name ?? undefined
    );

    return ApiResponse.success(null, 'Teacher deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
