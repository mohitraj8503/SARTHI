export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/core';

export async function GET() {
    try {
        await requireAdmin();
        console.log('[Setup] Enforcing course assignments...');

        // 1. Get Teachers
        const mohit = await prisma.user.findFirst({
            where: { email: { contains: 'mohit' } }
        });

        const jeremy = await prisma.user.findFirst({
            where: { name: 'Jeremy' }
        });

        const lucky = await prisma.user.findFirst({
            where: { name: 'Lucky' }
        });

        if (!mohit || !jeremy || !lucky) {
            return NextResponse.json({
                error: 'Teachers not found',
                mohit: !!mohit,
                jeremy: !!jeremy,
                lucky: !!lucky,
                message: 'Please run /api/setup/seed-teachers first'
            });
        }

        // 2. Assign Python to Mohit Raj
        const python = await prisma.course.findFirst({ where: { title: { contains: 'Python' } } });
        if (python) {
            await prisma.course.update({
                where: { id: python.id },
                data: { instructorId: mohit.id }
            });
        }

        // 3. Assign GST to Lucky
        const gst = await prisma.course.findFirst({ where: { title: { contains: 'GST' } } });
        if (gst) {
            await prisma.course.update({
                where: { id: gst.id },
                data: { instructorId: lucky.id }
            });
        }

        // 4. Assign Excel to Jeremy
        const excel = await prisma.course.findFirst({ where: { title: { contains: 'EXCEL' } } });
        if (excel) {
            await prisma.course.update({
                where: { id: excel.id },
                data: { instructorId: jeremy.id }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Assignments enforced: Python->Mohit Raj, GST->Lucky, Excel->Jeremy',
            assignments: [
                { course: 'Python for Beginners', teacher: 'Mohit Raj' },
                { course: 'GST & Income Tax Returns', teacher: 'Lucky' },
                { course: 'Advanced Excel', teacher: 'Jeremy' }
            ]
        });

    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

