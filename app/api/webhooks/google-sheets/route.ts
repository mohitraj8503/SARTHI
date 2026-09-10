import { NextRequest, NextResponse } from 'next/server';
import { syncStatusFromSheet } from '@/lib/services/google-sheets.service';
import { processAndSendOfferLetter } from '@/lib/services/offer-letter-pipeline.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, paymentStatus, applicationAccepted, offerLetterReceived, secret } = body;

    // Optional webhook secret check
    const expectedSecret = process.env.GOOGLE_SHEETS_SYNC_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized secret' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await syncStatusFromSheet({
      email,
      paymentStatus,
      applicationAccepted,
      offerLetterReceived
    });

    if (result.success && result.applicationId && (applicationAccepted?.toUpperCase() === 'YES' || paymentStatus?.toUpperCase() === 'YES')) {
      // Automatically trigger offer letter generation & dispatch if status changed to ACCEPTED!
      try {
        await processAndSendOfferLetter({
          applicationId: result.applicationId,
          actorUserId: 'google_sheets_sync',
          actorUserEmail: 'admin@sarthi.in',
          forceResend: false,
          dryRun: false
        });
      } catch (pipelineErr) {
        console.error('[GoogleSheetsWebhook] Pipeline error:', pipelineErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sheet edit synced successfully',
      details: result
    });
  } catch (err: any) {
    console.error('[GoogleSheetsWebhook] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    targetSheet: 'SARTHI - Team Sankalp',
    targetSheetId: '1dW9mq6x_-dUkgE6jJEJozGX1YBIJ4XvePArMMFjJwzk'
  });
}
