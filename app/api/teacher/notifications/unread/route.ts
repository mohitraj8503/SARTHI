import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: true, data: { count: 0 } });
    }

    const count = await prisma.notification.count({
      where: { 
        userId: session.userId,
        isRead: false 
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: { count } 
    });
  } catch (error: any) {
    console.error('Notifications count error:', error);
    return NextResponse.json({ 
      success: false, 
      data: { count: 0 } 
    });
  }
}

