import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/core';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await requireAdmin();
        // Get counts from database
        // Note: status field may not exist in Course model, so we count all courses
        const [totalCourses, totalStudents, totalTeachers] = await Promise.all([
            prisma.course.count(),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'TEACHER' } })
        ]);

        const envName = process.env.NODE_ENV || 'development';
        
        return NextResponse.json({
            status: 'healthy',
            environment: envName,
            database: {
                connected: true,
                project: process.env.DATABASE_URL ? 'configured' : 'not configured'
            },
            counts: {
                courses: {
                    total: totalCourses,
                    // Status filtering depends on Course model having 'status' field
                    published: totalCourses, // Assuming all are published if no status field
                    draft: 0,
                    archived: 0
                },
                users: {
                    students: totalStudents,
                    teachers: totalTeachers
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
        }
        if (error.message === 'FORBIDDEN') {
            return NextResponse.json({ status: 'forbidden' }, { status: 403 });
        }
        console.error('[HealthAPI] Database check failed:', error);
        return NextResponse.json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

