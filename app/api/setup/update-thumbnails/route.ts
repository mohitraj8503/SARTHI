export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/core';

export async function GET() {
    try {
        await requireAdmin();
        console.log('[Setup] Updating course thumbnails...');

        // Map of course titles to new thumbnail paths
        const thumbnailUpdates = [
            { titleContains: 'Python', thumbnail: '/course-thumbnails/python-masterclass.png' },
            { titleContains: 'EXCEL', thumbnail: '/course-thumbnails/Advanceexcel.png' },
            { titleContains: 'GST', thumbnail: '/course-thumbnails/gst&it.png' },
        ];

        const results: Array<{
            course: string;
            thumbnail?: string;
            success: boolean;
            error?: string;
        }> = [];

        for (const update of thumbnailUpdates) {
            const course = await prisma.course.findFirst({ 
                where: { title: { contains: update.titleContains } } 
            });
            
            if (course) {
                const updated = await prisma.course.update({
                    where: { id: course.id },
                    data: { thumbnail: update.thumbnail }
                });
                results.push({ 
                    course: course.title, 
                    thumbnail: update.thumbnail,
                    success: true 
                });
                console.log(`[Setup] Updated thumbnail for: ${course.title} -> ${update.thumbnail}`);
            } else {
                results.push({ 
                    course: update.titleContains, 
                    success: false, 
                    error: 'Course not found' 
                });
            }
        }

        // Invalidate cache so updated thumbnails show immediately
        revalidateTag('courses');

        return NextResponse.json({
            success: true,
            message: 'Course thumbnails updated',
            results
        });

    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('[Setup] Error updating thumbnails:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

