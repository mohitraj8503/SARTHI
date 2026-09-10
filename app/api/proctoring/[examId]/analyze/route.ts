import { NextRequest, NextResponse } from 'next/server';
import { aiProctoringService } from '@/lib/ai-proctoring';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, props: { params: Promise<{ examId: string }> }) {
  const params = await props.params;
  try {
    const { frame, timestamp } = await req.json();
    const examId = params.examId;
    
    // Simulate getting context
    const context = {
      timestamp,
      examId
    };

    // Send to AI service
    const analysis = await aiProctoringService.analyze({
      image: frame,
      examId: examId,
      context
    });
    
    // Flag suspicious patterns in DB
    if (analysis.riskLevel !== 'low') {
      // Note: This requires a ProctoringAlert model in the DB
      try {
        await prisma.activityLog.create({
          data: {
            type: 'PROCTORING_ALERT',
            action: 'SUSPICIOUS_ACTIVITY',
            severity: analysis.riskLevel === 'high' ? 'error' : 'warn',
            actorName: 'AI Proctor',
            targetId: examId,
            targetType: 'EXAM',
            metadata: JSON.stringify(analysis)
          }
        });
      } catch (e) {
        console.warn('Could not log proctoring alert to ActivityLog');
      }
    }
    
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Proctoring API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
