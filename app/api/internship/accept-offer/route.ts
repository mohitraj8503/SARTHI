import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { acceptInternshipOffer } from '@/lib/services/internship.service';
import { prisma } from '@/lib/prisma';
import { generateOfferLetterPdfForUser } from '../../pdf/offer-letter/route';
import { getBrandedTemplate } from '@/lib/email/templates/branded';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    const member = await acceptInternshipOffer(user.id, applicationId);

    // Call unified offer letter pipeline
    const { processAndSendOfferLetter } = await import('@/lib/services/offer-letter-pipeline.service');
    const pipelineResult = await processAndSendOfferLetter({
      applicationId,
      actorUserId: user.id,
      actorUserEmail: user.email || 'student@sarthi-woad.vercel.app',
      forceResend: true,
    });

    return NextResponse.json({
      success: pipelineResult.success,
      member,
      offerLetterStatus: pipelineResult.status,
      error: pipelineResult.error || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Offer acceptance failed' }, { status: 500 });
  }
}
