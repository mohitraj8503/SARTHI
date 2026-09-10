export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { seedTeachers } from '@/lib/seedTeachers';
import { requireAdmin } from '@/lib/admin/core';

export async function GET() {
    try {
        await requireAdmin();
        console.log('[Setup] Seeding teachers...');

        const teachers = await seedTeachers();

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${teachers.length} teachers`,
            teachers: teachers.map(t => ({ name: t.name, email: t.email, company: t.company }))
        });

    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('[Setup] Error seeding teachers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

