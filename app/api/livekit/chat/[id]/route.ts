import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers or admins can delete messages
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    });

    if (!teacher && session.role !== 'TEACHER' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only teachers can moderate chat' }, { status: 403 });
    }

    const messageId = params.id;
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Soft delete
    const message = await prisma.liveSessionMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, content: '' } // Clear content for privacy
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Error deleting chat message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
