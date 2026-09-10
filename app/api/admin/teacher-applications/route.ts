import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/get-user';

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const applications = await prisma.teacherApplication.findMany({
            where: {
                status: {
                    not: 'DRAFT'
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                education: true,
                documents: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Map relational data back to the UI's expected format if necessary,
        // or just send as-is and update UI.
        return NextResponse.json(applications);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

