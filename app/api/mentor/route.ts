import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getCurrentUser } from '@/lib/auth';
import { 
  createAssignmentAction, 
  reviewSubmissionAction, 
  manageAttendanceAction,
  adjustXpAction,
  awardBadgeAction,
  deleteAssignmentAction,
  bulkReviewAction,
  manageApplicationAction,
  suspendInternAction
} from '@/lib/services/mentor.service';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getBaseTemplate } from '@/lib/email/templates/base';
import { prisma } from '@/lib/prisma';

import { 
  canManageMember,
  canReviewSubmission,
  canManageAssignment,
  canAccessDiscussion
} from '@/lib/auth/internshipAuthorization';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (user.role as string)?.toUpperCase() || '';
    const isAuthorized = ['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'create-assignment': {
        if (!(await canManageMember(user, payload.memberId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const assignment = await createAssignmentAction(payload);
        return NextResponse.json({ success: true, data: assignment });
      }

      case 'review-submission': {
        if (!(await canReviewSubmission(user, payload.submissionId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const feedback = await reviewSubmissionAction(payload);
        return NextResponse.json({ success: true, data: feedback });
      }

      case 'manage-attendance': {
        if (!(await canManageMember(user, payload.memberId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const attendance = await manageAttendanceAction(payload);
        return NextResponse.json({ success: true, data: attendance });
      }

      case 'adjust-xp': {
        if (!(await canManageMember(user, payload.memberId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const xp = await adjustXpAction(payload);
        return NextResponse.json({ success: true, data: xp });
      }

      case 'award-badge': {
        if (!(await canManageMember(user, payload.memberId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const badge = await awardBadgeAction(payload);
        return NextResponse.json({ success: true, data: badge });
      }

      case 'delete-assignment': {
        if (!(await canManageAssignment(user, payload.assignmentId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const deleted = await deleteAssignmentAction(payload);
        return NextResponse.json({ success: true, data: deleted });
      }

      case 'get-internship-fee': {
        const configs = await prisma.internshipTrackConfig.findMany({ orderBy: { updatedAt: 'desc' } });
        const currentAmount = configs[0]?.paymentAmountInr ?? 0;
        const paymentRequired = configs[0]?.paymentRequired ?? (currentAmount > 0);
        return NextResponse.json({
          success: true,
          amount: currentAmount,
          paymentRequired,
        });
      }

      case 'update-internship-fee': {
        const rawAmount = Number(payload?.amount);
        const targetAmount = Math.min(Math.max(0, isNaN(rawAmount) ? 0 : rawAmount), 5000);
        const paymentRequired = targetAmount > 0;

        await prisma.internshipTrackConfig.updateMany({
          data: {
            paymentAmountInr: targetAmount,
            paymentRequired,
          },
        });

        const defaultTracks = [
          'ai-development',
          'web-development',
          'software-development',
          'content-writing',
          'digital-marketing',
          'graphic-design',
          'video-editing',
          'advertising',
          'data-science'
        ];

        for (const trackSlug of defaultTracks) {
          await prisma.internshipTrackConfig.upsert({
            where: { trackSlug },
            update: {
              paymentAmountInr: targetAmount,
              paymentRequired,
            },
            create: {
              trackSlug,
              paymentAmountInr: targetAmount,
              paymentRequired,
              currency: 'INR',
            },
          });
        }

        await prisma.auditLog.create({
          data: {
            actorId: user.id || 'mentor',
            actorEmail: user.email || 'mentor@sarthi.in',
            action: 'INTERNSHIP_FEE_UPDATED',
            entityType: 'InternshipTrackConfig',
            entityId: 'all-tracks',
            entityName: 'Internship Application Fee Bar',
            newValues: JSON.stringify({ amount: targetAmount, paymentRequired }),
            reason: `Mentor updated real-time internship application fee to ₹${targetAmount} (${paymentRequired ? 'Razorpay Active' : 'FREE Mode'})`,
          },
        });

        return NextResponse.json({
          success: true,
          amount: targetAmount,
          paymentRequired,
          message: `Updated internship apply fee to ₹${targetAmount}`,
        });
      }

      case 'send-offer-letter': {
        const { recipientEmail, recipientName, college, degree, city, refNo, position, joiningDate, startDate, endDate, mentor, acceptanceDeadline } = payload;
        
        const targetEmail = recipientEmail || 'pm.enthuse@gmail.com';
        const targetName = recipientName || 'Kunal Ranjan';
        const targetPosition = position || 'Software Development';
        const targetRef = refNo || 'TT-INT-2026-0007';
        const deadlineDate = acceptanceDeadline || '08-Jul-2026';

        // Build Payload for python automation script
        const internData = {
          name: targetName,
          degree: degree || 'Computer Science',
          college: college || 'Arka Jain University',
          city: city || 'Jamshedpur, Jharkhand',
          position: targetPosition,
          reference_no: targetRef,
          offer_date: payload.offerDate || '05-Jul-2026',
          start_date: startDate || joiningDate || '06-Jul-2026',
          end_date: endDate || '06-Sept-2026',
          joining_date: joiningDate || startDate || '06-Jul-2026',
          mentor: mentor || 'Mohit Raj',
          acceptance_deadline: deadlineDate
        };

        const outputDir = path.join(process.cwd(), 'output');
        const scriptPath = path.join(process.cwd(), 'scripts', 'generate_offer_letter.py');
        const templatePath = path.join(process.cwd(), 'Mohit_Raj_Offer_Letter_Editable.docx');

        let attachments: any[] = [];
        const safeName = targetName.replace(/\s+/g, '_');
        const generatedPdfPath = path.join(outputDir, `${safeName}_Offer_Letter.pdf`);

        try {
          // Execute python script to generate pixel-faithful PDF
          const { execFileSync } = await import('child_process');
          execFileSync('python3', [
            scriptPath,
            '--data', JSON.stringify(internData),
            '--template', templatePath,
            '--outdir', outputDir
          ], { cwd: process.cwd() });

          if (fs.existsSync(generatedPdfPath)) {
            const pdfBuffer = fs.readFileSync(generatedPdfPath);
            attachments.push({
              filename: `${safeName}_Offer_Letter.pdf`,
              content: pdfBuffer,
              path: generatedPdfPath,
            });
          }
        } catch (pyErr: any) {
          console.warn('[OFFER_LETTER_API] Python script execution error, attempting fallback attachment:', pyErr.message);
          const fallbackPdf = path.join(process.cwd(), 'public', 'docs', 'Mohit_Raj_Offer_Letter_Editable.pdf');
          if (fs.existsSync(fallbackPdf)) {
            attachments.push({
              filename: `${safeName}_Offer_Letter.pdf`,
              content: fs.readFileSync(fallbackPdf),
              path: fallbackPdf,
            });
          }
        }

        // Approved Email Body Template (Spec Step 7)
        const offerEmailHtml = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; line-height: 1.6;">
            <div style="background: #1B4332; padding: 32px 24px; text-align: center;">
              <p style="color: #40916C; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px;">INTERNSHIP OFFER</p>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0;">Internship Offer Letter</h1>
            </div>
            
            <div style="padding: 32px 24px; font-size: 15px; color: #334155;">
              <p style="margin-top: 0;">Dear <strong>${targetName}</strong>,</p>
              
              <p>We are pleased to offer you the position of <strong>${targetPosition}</strong> at SARTHI Pvt. Ltd. Please find your official offer letter attached to this email.</p>
              
              <p>Kindly review, sign, and return the scanned copy to us on or before <strong>${deadlineDate}</strong> to confirm your acceptance.</p>
              
              <p>We look forward to welcoming you to the SARTHI team!</p>
              
              <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 13px; color: #64748b;">
                <p style="margin: 0; font-weight: 700; color: #0f172a;">Warm regards,</p>
                <p style="margin: 2px 0; font-weight: 800; color: #1B4332;">SARTHI Team</p>
                <p style="margin: 0; font-size: 12px; color: #64748b; font-style: italic;">Building Skills. Creating Opportunities. Empowering Futures.</p>
              </div>
            </div>

            <div style="background: #F8FAF9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              © 2026 SARTHI. All Rights Reserved.
            </div>
          </div>
        `;

        const resendResult = await sendTransactionalEmail({
          to: targetEmail,
          subject: 'SARTHI — Internship Offer Letter',
          html: offerEmailHtml,
          type: 'notification',
          attachments,
          provider: 'resend',
        });

        return NextResponse.json({
          success: true,
          message: `Official Offer Letter generated & emailed to ${targetEmail} via Resend API!`,
          data: resendResult,
          generatedPdf: `${safeName}_Offer_Letter.pdf`
        });
      }

      case 'bulk-review': {
        const results = await bulkReviewAction(payload);
        return NextResponse.json({ success: true, data: results });
      }

      case 'manage-application': {
        const app = await manageApplicationAction({
          ...payload,
          reviewerEmail: user.email || '',
        });

        const isAcceptedStatus = payload.status === 'OFFER_ACCEPTED' || payload.status === 'APPROVED';

        if (isAcceptedStatus) {
          try {
            const { processAndSendOfferLetter } = await import('@/lib/services/offer-letter-pipeline.service');
            const pipelineResult = await processAndSendOfferLetter({
              applicationId: app.id,
              actorUserId: user.id || 'mentor',
              actorUserEmail: user.email || 'mentor@sarthi.in',
              forceResend: true,
            });

            return NextResponse.json({
              success: true,
              data: app,
              autoOfferLetterStatus: pipelineResult.status,
              autoOfferLetterError: pipelineResult.error || null,
            });
          } catch (pipelineErr: any) {
            console.error('[MENTOR_API] Offer letter pipeline error:', pipelineErr);
            return NextResponse.json({
              success: true,
              data: app,
              autoOfferLetterStatus: 'FAILED',
              autoOfferLetterError: pipelineErr?.message || 'Offer letter PDF generation or send failed',
            });
          }
        } else if (payload.status === 'REJECTED') {
          try {
            const reason = payload.rejectionReason || 'Information provided did not meet our current requirements.';
            await sendTransactionalEmail({
              to: app.email,
              subject: 'Update regarding your Internship Application',
              html: getBaseTemplate(
                `<p>Hi ${app.name},</p>
                 <p>Thank you for your patience while we reviewed your application for the SARTHI Student Internship Program. Unfortunately, we cannot proceed with your application at this time.</p>
                 <div style="margin: 24px 0; padding: 20px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 12px;">
                   <p style="color: #991b1b; font-weight: 800; font-size: 12px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Reason for Decision</p>
                   <p style="color: #b91c1c; font-size: 14px; margin-bottom: 0; line-height: 1.6;">${reason}</p>
                 </div>
                 <p style="color: #64748b; font-size: 14px;">We encourage you to continue learning, working on your projects, and applying for future cohorts.</p>`,
                'Application Update',
                { label: 'Contact Support', url: `mailto:support@sarthi.in` }
              ),
              type: 'application'
            });
          } catch (emailErr) {
            console.error('Failed to send rejection email:', emailErr);
          }
        }
        return NextResponse.json({ success: true, data: app });
      }

      case 'resend-offer-letter': {
        const { applicationId } = payload;
        try {
          const { processAndSendOfferLetter } = await import('@/lib/services/offer-letter-pipeline.service');
          const pipelineResult = await processAndSendOfferLetter({
            applicationId,
            actorUserId: user.id || 'mentor',
            actorUserEmail: user.email || 'mentor@sarthi.in',
            forceResend: true,
          });

          return NextResponse.json({
            success: pipelineResult.success,
            status: pipelineResult.status,
            referenceNumber: pipelineResult.referenceNumber,
            error: pipelineResult.error || null,
          });
        } catch (resendErr: any) {
          console.error('[MENTOR_API] Resend offer letter failed:', resendErr);
          return NextResponse.json({
            success: false,
            status: 'FAILED',
            error: resendErr?.message || 'Resend offer letter failed',
          }, { status: 500 });
        }
      }

      case 'impersonate-intern': {
        const { userId } = payload;

        // Authorization Check: Admins can impersonate anyone, Mentors only their own assigned interns
        if (!['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(role)) {
          const isAssigned = await prisma.batchMember.findFirst({
            where: {
              userId: userId,
              batch: {
                mentorEmail: user.email
              }
            }
          });
          if (!isAssigned) {
            return NextResponse.json({ error: 'You are not authorized to impersonate this intern' }, { status: 403 });
          }
        }

        const targetUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, role: true, avatar_url: true, image: true }
        });

        if (!targetUser) {
          return NextResponse.json({ error: 'Target intern user record not found' }, { status: 404 });
        }

        // Backup current session to allow exiting impersonation
        const currentToken = req.cookies.get('tt_session')?.value;
        const isProd = process.env.NODE_ENV === 'production';
        if (currentToken) {
          const c = await import('next/headers').then(m => m.cookies());
          c.set('tt_mentor_backup_session', currentToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            ...(isProd ? { domain: '.sarthi-woad.vercel.app' } : {}),
          });
        }

        const { createSession } = await import('@/lib/auth/session');
        const session = await createSession(targetUser.id, targetUser.role || 'STUDENT', targetUser.email, targetUser.name || 'Student');

        const { signJWT, setAuthCookie } = await import('@/lib/auth/jwt');
        const token = await signJWT({
          userId: targetUser.id,
          role: targetUser.role || 'STUDENT',
          sessionId: session.id,
          email: targetUser.email,
          name: targetUser.name || 'Student',
          avatar_url: targetUser.avatar_url || targetUser.image || undefined,
          impersonatorId: user.id,
        });

        await setAuthCookie(token);

        // Audit Log entry for Impersonation
        await prisma.auditLog.create({
          data: {
            actorId: user.id || 'mentor',
            actorEmail: user.email || 'mentor@sarthi.in',
            action: 'MENTOR_IMPERSONATE_STUDENT',
            entityType: 'User',
            entityId: targetUser.id,
            entityName: targetUser.name || targetUser.email,
            reason: `Mentor ${user.email} initiated dashboard impersonation of student ${targetUser.email}`,
          }
        });

        return NextResponse.json({
          success: true,
          targetUser,
          redirectUrl: '/dashboard'
        });
      }

      case 'suspend-intern': {
        const { memberId, reason } = payload;
        if (!(await canManageMember(user, memberId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const updated = await suspendInternAction({
          memberId,
          reason,
          actorEmail: user.email || 'mentor@sarthi.in',
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case 'recommend-certificate': {
        const { memberId, certUrl, lorUrl } = payload;
        if (!(await canManageMember(user, memberId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const cert = await prisma.internshipCertificate.create({
          data: {
            memberId,
            certUrl,
            lorUrl,
            reportUrl: '/reports/performance-summary.pdf',
          }
        });
        return NextResponse.json({ success: true, data: cert });
      }

      case 'create-discussion': {
        const { assignmentId, message } = payload;
        if (!(await canAccessDiscussion(user, assignmentId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const disc = await prisma.internshipDiscussion.create({
          data: {
            assignmentId,
            userId: user.id,
            userName: user.name || 'Mentor',
            message,
          }
        });
        return NextResponse.json({ success: true, data: disc });
      }

      case 'resolve-discussion': {
        const { discussionId } = payload;
        const disc = await prisma.internshipDiscussion.findUnique({
          where: { id: discussionId }
        });
        if (!disc || !(await canAccessDiscussion(user, disc.assignmentId))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await prisma.internshipDiscussion.delete({
          where: { id: discussionId }
        });
        return NextResponse.json({ success: true });
      }

      case 'send-direct-message': {
        const { recipientId, subject, body } = payload;
        // Verify recipient belongs to mentor's supervised cohort
        const recipientMember = await prisma.batchMember.findFirst({
          where: { userId: recipientId }
        });
        if (!recipientMember || !(await canManageMember(user, recipientMember.id))) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const msg = await prisma.inboxMessage.create({
          data: {
            senderId: user.id,
            recipientId,
            subject,
            body,
          }
        });
        return NextResponse.json({ success: true, data: msg });
      }

      default:
        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[MENTOR_API_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
