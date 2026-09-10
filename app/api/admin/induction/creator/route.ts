import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    const submissions = await prisma.creatorInductionSubmission.findMany({
      orderBy: { appliedAt: 'desc' },
      include: { user: true }
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !['SELECTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    const submission = await prisma.creatorInductionSubmission.update({
      where: { id },
      data: { status }
    });

    // Handle Selection Workflow
    if (status === 'SELECTED') {
      const { sendTransactionalEmail } = await import('@/lib/email/send');
      
      await sendTransactionalEmail({
        to: submission.email,
        subject: "🎉 You're Selected – SARTHI Creator Programme",
        type: 'application',
        userId: submission.userId,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1b4332; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Congratulations!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; font-weight: bold; color: #1b4332; margin-top: 0;">You've been selected for the SARTHI Creator Programme.</p>
              
              <p>We evaluated your submission and were impressed by your creativity and potential. Welcome to our elite creator track!</p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 24px; border-radius: 8px; margin: 24px 0;">
                <h2 style="font-size: 16px; margin-top: 0; color: #166534;">Next Steps: Join the Community</h2>
                <p style="margin-bottom: 20px;">Join our private high-signal creator group on WhatsApp to connect with mentors and fellow creators:</p>
                <a href="https://chat.whatsapp.com/GToupUP8Zn7DGj1VKBrDOc" style="display: inline-block; background-color: #25d366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Join WhatsApp Group</a>
              </div>
              
              <p>In this group, you'll receive further instructions about your first artifacts and the roadmap for earning your <strong>Internship Badge</strong> and <strong>Personalized Certificate</strong>.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px; border-top: 1px solid #e5e7eb; pt: 16px;">
                Remember: This is a performance-based program. Consistent contribution is required to maintain your spot.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
              &copy; 2026 SARTHI. All rights reserved.
            </div>
          </div>
        `
      });

      console.log(`[CREATOR_PROGRAM] Selection email sent to ${submission.email}`);
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('ADMIN_CREATOR_PATCH_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
