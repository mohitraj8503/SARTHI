import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/services/internship.service';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const isUserAdmin = await isAdmin();
    if (!user || !isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId, amount, description } = await req.json();
    if (!memberId || amount === undefined || !description) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Find member
    const member = await prisma.batchMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // 2. Create Transaction
    await prisma.xpTransaction.create({
      data: {
        memberId,
        amount,
        description,
      },
    });

    // 3. Update Member currentXp & level using settings thresholds
    const settings = await prisma.internshipSettings.findFirst() || { levelThresholds: "500,1200,2200" };
    const newXp = Math.max(0, member.currentXp + amount);
    const newLevel = calculateLevel(newXp, settings.levelThresholds);

    await prisma.batchMember.update({
      where: { id: memberId },
      data: {
        currentXp: newXp,
        currentLevel: newLevel,
      },
    });

    // Create Notification
    const isBonus = amount >= 0;
    await prisma.notification.create({
      data: {
        userId: member.userId,
        title: isBonus ? 'XP Reward Credited ⚡' : 'XP Penalty Deducted ⚠️',
        message: isBonus 
          ? `You received +${amount} XP bonus for "${description}".` 
          : `You were penalized ${amount} XP for "${description}".`,
        type: 'SYSTEM',
      },
    });

    return NextResponse.json({ success: true, newXp, newLevel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'XP transaction failed' }, { status: 500 });
  }
}
