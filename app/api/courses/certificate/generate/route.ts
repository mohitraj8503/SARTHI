export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CertificateGenerator } from '@/lib/certificate-generator';
import { generateCredentialId, generateCertificateHash } from '@/lib/certificates';

export async function POST(req: Request) {
  try {
    const { courseId, tier = 'free' } = await req.json();

    // Validate tier
    const validTiers = ['free', 'premium', 'pro'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ message: 'Invalid tier' }, { status: 400 });
    }

    // Use centralized auth — previously used wrong cookie key
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    // Verify enrollment and completion
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: { user: true, course: true },
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Not enrolled in this course' }, { status: 403 });
    }

    if (enrollment.progressPercentage < 100) {
      return NextResponse.json(
        { message: 'Course not completed yet', progress: enrollment.progressPercentage },
        { status: 400 }
      );
    }

    // Check payment if not free
    if (tier !== 'free') {
      const payment = await prisma.paymentIntent.findFirst({
        where: {
          userId,
          courseId,
          tier,
          status: 'completed'
        }
      });
      if (!payment) {
        return NextResponse.json({ message: 'Payment required for this tier' }, { status: 402 });
      }
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: { userId, courseId },
    });

    if (existingCert) {
      // If user wants to upgrade tier, update it
      if (tier !== 'free' && existingCert.tier !== tier) {
        const upgraded = await prisma.certificate.update({
          where: { id: existingCert.id },
          data: { 
            tier,
            certificateUrl: `/api/courses/certificate/download?courseId=${courseId}&tier=${tier}`
          }
        });
        return NextResponse.json({ ...upgraded, upgraded: true });
      }
      return NextResponse.json(existingCert);
    }

    // Generate unique permanent credential ID: TT-{YEAR}-{8_RANDOM_CHARS}
    const certificateId = generateCredentialId();
    const certificateNumber = certificateId; // Keep backward compatibility in DB columns

    // Generate verification token for multi-channel verification
    const verificationToken = CertificateGenerator.generateVerificationToken(certificateId);

    // Generate security hash
    const issueDate = new Date();
    const certificateHash = generateCertificateHash(
      enrollment.user.name || 'Student',
      enrollment.course.title,
      issueDate,
      certificateId
    );

    // Get tier pricing info
    const pricing = CertificateGenerator.getTierPrice(tier);
    const features = CertificateGenerator.getTierFeatures(tier);

    // Create certificate record
    const certificate = await prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: {
        userId,
        courseId,
        certificateNumber,
        certificateId, // New format ID
        certificateHash,
        certificateUrl: `/certificates/${certificateId}`,
        tier,
        verificationToken,
        status: 'VALID',
        issuedAt: issueDate,
        metadata: JSON.stringify({
          generatedAt: new Date().toISOString(),
          completionPercentage: 100,
          hash: Buffer.from(`${userId}-${courseId}-${Date.now()}`).toString('base64'),
          studentName: enrollment.user.name || '',
          courseName: enrollment.course.title,
          tier,
          tierPrice: pricing.amount,
          features,
        }),
      },
    });

    // Update enrollment to mark as completed if not already
    if (enrollment.status !== 'completed') {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'completed', completedAt: enrollment.completedAt || new Date() }
      });
    }

    // Send certificate email (non-blocking)
    try {
      const { sendEmail } = await import('@/lib/email');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
      
      const tierBadge = tier !== 'free' ? `\n🌟 Certificate Tier: ${tier.toUpperCase()}` : '';
      const priceInfo = tier !== 'free' ? `\n💰 Price: ₹${pricing.amount}` : '';
      
      await sendEmail({
        to: enrollment.user.email,
        subject: `🎓 Your Certificate is Ready — ${enrollment.course.title}${tier !== 'free' ? ' 🌟' : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e8f0fe; border-radius: 12px;">
            <h2 style="color: #1a3c2e;">Congratulations, ${enrollment.user.name || 'Student'}! 🎉</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              You have successfully completed <strong>${enrollment.course.title}</strong>. Your certificate is now ready!
            </p>
            <div style="background: #f7fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="color: #4a5568; margin: 4px 0;"><strong>Certificate ID:</strong> <code style="font-family: monospace; background: #edf2f7; padding: 2px 6px; border-radius: 4px;">${certificateId}</code></p>
              <p style="color: #4a5568; margin: 4px 0;"><strong>Verification:</strong> <a href="${baseUrl}/verify/${certificateId}">${baseUrl}/verify/${certificateId}</a></p>
              ${tier !== 'free' ? `<p style="color: #6B46C1; margin: 4px 0;"><strong>🌟 Tier:</strong> ${tier.toUpperCase()} - ${features.slice(1).join(', ')}</p>` : ''}
            </div>
            <div style="margin: 24px 0;">
              <a href="${baseUrl}/dashboard/certificates" style="background: #1a3c2e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Certificate
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">Keep learning — check out more courses on SARTHI!</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('[Certificate] Email failed:', emailErr);
    }

    return NextResponse.json({
      ...certificate,
      pricing,
      features
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
