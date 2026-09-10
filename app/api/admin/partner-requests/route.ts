import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTransactionalEmail } from '@/lib/email/send';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.partnerRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, adminNote } = await req.json();

    const request = await prisma.partnerRequest.update({
      where: { id },
      data: { status, adminNote }
    });

    // If approved, send success email
    if (status === 'approved') {
      await sendTransactionalEmail({
        to: request.email,
        subject: 'Your partnership request has been approved 🎉',
        type: 'application',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a3c2e;">
            <h2 style="color: #10b981;">Hi ${request.name},</h2>
            <p>We’re happy to inform you that your partnership request for <strong>${request.organization}</strong> has been <strong>approved</strong>.</p>
            <p>Our team will connect with you shortly to begin the onboarding process and discuss the next steps.</p>
            <br/>
            <div style="background: #f8f8f6; padding: 15px; border-radius: 8px;">
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Onboarding session scheduling</li>
                <li>Infrastructure verification</li>
                <li>Program curriculum setup</li>
              </ul>
            </div>
            <br/>
            <p>Welcome to <strong>SARTHI</strong> 🤝</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Team SARTHI</strong></p>
          </div>
        `
      });
    }

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
