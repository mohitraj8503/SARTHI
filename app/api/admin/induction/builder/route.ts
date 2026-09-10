import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    const { id, status, score, scores, notes, isIndustrySelected } = await request.json();
    
    if (!id || !['SELECTED', 'ELITE', 'IMPROVE', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    const submission = await prisma.builderInductionSubmission.update({
      where: { id },
      data: { 
        status,
        score,
        scoreProblemClarity: scores.problemClarity,
        scoreInnovation: scores.innovation,
        scoreTechnicalDepth: scores.technicalDepth,
        scoreExecution: scores.execution,
        scoreDemoClarity: scores.demoClarity,
        scoreImpact: scores.impact,
        reviewerNotes: notes,
        isIndustrySelected: !!isIndustrySelected
      }
    });

    // Handle Communication & Certification
    const { sendTransactionalEmail } = await import('@/lib/email/send');
    
    let emailSubject = "";
    let emailHtml = "";

    if (status === 'ELITE' || status === 'SELECTED') {
      // Create Certificate
      try {
        const verificationId = `TT-BLD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const certId = 'builder-induction';
        await prisma.certification.upsert({
          where: { id: certId },
          update: {},
          create: {
            id: certId,
            title: 'Builder Induction Track',
            slug: 'builder-induction',
            description: 'Advanced technical project induction',
            status: 'PUBLISHED'
          }
        });

        await prisma.issuedCertificate.create({
          data: {
            userId: submission.userId,
            certificationId: certId,
            verificationId,
            score,
            status: 'VALID',
            certificateUrl: `/certificates/${verificationId}`
          }
        });
      } catch (e) {
        console.error("Certificate creation failed", e);
      }
      
      emailSubject = `You're Selected - SARTHI Builder Track (${status})`;
      emailHtml = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #1b4332; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Congratulations!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 18px; font-weight: bold; color: #1b4332; margin-top: 0;">Your project "${submission.projectTitle}" has been selected.</p>
            
            <p>Our evaluation team reviewed your submission and were impressed by your technical depth and execution. You scored <strong>${score}/100</strong>.</p>
            
            ${status === 'ELITE' ? `
              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <h2 style="font-size: 16px; margin-top: 0; color: #92400e;">Elite Tier Recognition</h2>
                <p style="color: #92400e; margin-bottom: 0; font-size: 14px;">As an Elite Builder, you'll be featured on our platform and considered for direct mentor sessions and support track opportunities.</p>
              </div>
            ` : ''}

            ${submission.isIndustrySelected ? `
              <div style="background-color: #1b4332; border: 2px solid #fbbf24; padding: 24px; border-radius: 12px; margin: 24px 0; color: #ffffff;">
                <h2 style="font-size: 18px; margin-top: 0; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px;">Industry Project Selected</h2>
                <p style="margin-bottom: 0; font-size: 14px;"><strong>Outstanding Achievement!</strong> You have been specifically shortlisted for the <strong>Industry Opportunity Track</strong>. This means you are now eligible to work on real industry automation projects with SARTHI and our partners. Our team will reach out to you via this email for the next steps.</p>
              </div>
            ` : ''}

            <p><strong>Outcome:</strong> Your Internship Badge and Personalized Certificate (${status} tier) will be issued shortly. Keep an eye on your dashboard.</p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              Technical excellence is just the beginning. We look forward to seeing you build more with SARTHI.
            </p>
          </div>
          <div style="background-color: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
            &copy; 2026 SARTHI. All rights reserved.
          </div>
        </div>
      `;
    } else if (status === 'IMPROVE') {
      emailSubject = "Feedback on your SARTHI Submission";
      emailHtml = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4b5563; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Evaluation Feedback</h1>
          </div>
          <div style="padding: 32px;">
            <p>Thank you for submitting "${submission.projectTitle}". Your current score is <strong>${score}/100</strong>.</p>
            <p>Our reviewers believe your project has potential but needs improvement in certain areas before we can issue a certificate.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin-top: 0; font-weight: bold;">Reviewer Notes:</p>
              <p style="margin-bottom: 0; white-space: pre-line;">${notes || 'No specific notes provided.'}</p>
            </div>
            
            <p>You can resubmit your project after addressing the feedback above. We'd love to see your improved version!</p>
          </div>
        </div>
      `;
    }

    if (emailHtml && emailSubject) {
      await sendTransactionalEmail({
        to: submission.email,
        subject: emailSubject,
        type: 'application',
        userId: submission.userId,
        html: emailHtml
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('ADMIN_BUILDER_PATCH_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
