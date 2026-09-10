import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { templates } from '@/lib/email';
import { Resend } from 'resend';

// Initialize Resend with the key provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'admin@sarthi-woad.vercel.app';

export async function POST(req: Request) {
  try {
    const { testMode } = await req.json();

    const candidates = [
      { name: 'Candidate A', verificationId: 'TT-PY-PRO-2026-000007', certificationName: 'Python Professional Developer Certification' },
      { name: 'Candidate B', verificationId: 'TT-PY-PRO-2026-000008', certificationName: 'Python Professional Developer Certification' },
      { name: 'Candidate C', verificationId: 'TT-PY-PRO-2026-000004', certificationName: 'Python Professional Developer Certification' }
    ];

    const results = [];

    for (const candidate of candidates) {
      if (testMode && candidate.name !== 'Candidate A') {
        continue; // Only process Candidate A for test mode
      }

      // Verify certificate record exists
      const cert = await prisma.issuedCertificate.findUnique({
        where: { verificationId: candidate.verificationId },
        include: { user: true }
      });

      if (!cert) {
        return NextResponse.json({ error: `Certificate not found for ${candidate.name}` }, { status: 404 });
      }

      if (!cert.user || !cert.user.email) {
        return NextResponse.json({ error: `User email not found for ${candidate.name}` }, { status: 404 });
      }

      const recipientEmail = testMode ? 'mohitraj8503@gmail.com' : cert.user.email;
      const verificationUrl = `https://sarthi-woad.vercel.app/verify/${candidate.verificationId}`;

      // Generate HTML from template
      const emailContent = templates.credentialClaim(
        candidate.name,
        candidate.verificationId,
        verificationUrl,
        candidate.certificationName
      );

      // Send email via Resend
      const emailResponse = await resend.emails.send({
        from: `SARTHI <${EMAIL_FROM}>`,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      let status = 'SENT';
      if (emailResponse.error) {
        console.error(`Failed to send email to ${recipientEmail}:`, emailResponse.error);
        status = 'FAILED';
      }

      // Log delivery attempt in database
      await prisma.emailLog.create({
        data: {
          email: recipientEmail,
          subject: emailContent.subject,
          status: status,
          sentAt: new Date(),
          metadata: JSON.stringify({
            certificateId: candidate.verificationId,
            resendId: emailResponse.data?.id || null,
            testMode
          })
        }
      });

      results.push({
        recipient: recipientEmail,
        certificateId: candidate.verificationId,
        timestamp: new Date().toISOString(),
        deliveryStatus: status
      });
    }

    return NextResponse.json({ success: true, logs: results });
  } catch (error: any) {
    console.error('Send claim emails error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
