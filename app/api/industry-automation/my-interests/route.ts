export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

// GET /api/industry-automation/my-interests - Get user's submitted interests
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ interests: [] });
    }
    const userId = session.userId;
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: any = {
      developerId: userId
    };
    
    if (status) {
      where.status = status;
    }
    
    const interests = await prisma.projectInterest.findMany({
      where,
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ interests });
    
  } catch (error) {
    console.error('Error fetching my interests:', error);
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
  }
}

