export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { cacheData } from '@/lib/redis';

// Helper to generate human-readable description from activity type
function generateDescription(type: string, data: any): string {
    switch (type) {
        case 'student_registered':
            return `${data.studentName || 'A student'} registered on the platform`;
        case 'teacher_registered':
            return `${data.teacherName || 'An instructor'} joined as teacher`;
        case 'enrollment':
            return `${data.studentName || 'Student'} enrolled in "${data.courseName || 'a course'}"`;
        case 'payment':
            return `Payment of ₹${data.amount || 0} received from ${data.studentName || 'a student'}`;
        case 'course_created':
            return `${data.teacherName || 'Teacher'} created a new course: "${data.courseName || ''}"`;
        case 'course_published':
            return `${data.teacherName || 'Teacher'} published "${data.courseName || 'a course'}"`;
        case 'completion':
            return `${data.studentName || 'Student'} completed "${data.courseName || 'a course'}"`;
        case 'certificate_issued':
            return `Certificate issued to ${data.studentName || 'student'} for "${data.courseName || 'a course'}"`;
        case 'review_added':
            return `${data.studentName || 'Student'} left a ${data.rating || 0}-star review`;
        default:
            return data.description || `Activity: ${type}`;
    }
}

// GET /api/admin/dashboard/activity-feed - Returns recent activity feed
export async function GET(req: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

        const activities = await cacheData(`admin:dashboard:activity-feed:${limit}`, async () => {
            const logs = await prisma.activityLog.findMany({
                take: limit,
                orderBy: { timestamp: 'desc' }
            });

            return logs.map(activity => {
                let metadata = {};
                try {
                    if (activity.metadata) {
                        metadata = typeof activity.metadata === 'string'
                            ? JSON.parse(activity.metadata)
                            : activity.metadata;
                    }
                } catch (e) {
                    // Ignore parsing errors
                }

                return {
                    id: activity.id,
                    type: activity.type,
                    description: (activity as any).description || generateDescription(activity.type, metadata),
                    actorName: activity.actorName,
                    targetName: activity.targetName,
                    timestamp: activity.timestamp.toISOString(),
                    userId: activity.userId
                };
            });
        }, 10); // Cache for 10 seconds

        return ApiResponse.success(activities);
    } catch (error: any) {
        return handleApiError(error);
    }
}

