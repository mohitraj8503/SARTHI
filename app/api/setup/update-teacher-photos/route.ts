export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/core';

// This is a one-time setup endpoint to update teacher photos
export async function GET() {
    try {
        await requireAdmin();
        console.log('[Setup] Updating teacher photos...');

        // Update Mohit Raj
        const mohit = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'mohit@sarthi.com' },
                    { email: 'mohitraj8503@sarthi.com' },
                    { name: { contains: 'Mohit' } }
                ]
            }
        });

        if (mohit) {
            await prisma.user.update({
                where: { id: mohit.id },
                data: { image: '/images/instructors/mohit-raj-real.jpg' }
            });
            console.log('✅ Updated Mohit Raj photo');
        }

        // Update Arindam Mondal
        const arindam = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'arindam@sarthi.com' },
                    { name: { contains: 'Arindam' } }
                ]
            }
        });

        if (arindam) {
            await prisma.user.update({
                where: { id: arindam.id },
                data: { image: 'https://ui-avatars.com/api/?name=Industry+Expert&background=007bff&color=fff' }
            });
            console.log('✅ Updated Industry Expert photo');
        }

        // Update Shailesh Sir
        const shailesh = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'shailesh@sarthi.com' },
                    { name: { contains: 'Shailesh' } }
                ]
            }
        });

        if (shailesh) {
            await prisma.user.update({
                where: { id: shailesh.id },
                data: { image: 'https://ui-avatars.com/api/?name=Industry+Expert&background=ffd700&color=000' }
            });
            console.log('✅ Updated Industry Expert photo');
        }

        return NextResponse.json({
            success: true,
            message: 'Teacher photos updated successfully',
            updated: {
                mohitRaj: !!mohit,
                arindamMondal: !!arindam,
                shaileshSir: !!shailesh
            }
        });

    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('[Setup] Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

