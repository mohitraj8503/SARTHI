import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getBrandedTemplate } from '@/lib/email/templates/branded';
import { syncApplicationToSheet } from '@/lib/services/google-sheets.service';

export interface ProcessOfferLetterResult {
  success: boolean;
  status: 'SUCCESS' | 'SKIPPED_ALREADY_SENT' | 'FAILED';
  referenceNumber?: string;
  error?: string;
}

/**
 * Single Canonical Pipeline for Generating and Delivery of Internship Offer Letters.
 * Handles:
 * 1. Batch enrollment / workspace creation
 * 2. Offer letter PDF generation via Python script
 * 3. Welcome email dispatch via Resend API / Gmail API
 * 4. DB status update (`offerAcceptedAt`, `status: OFFER_ACCEPTED`)
 * 5. System AuditLog recording (`OFFER_LETTER_AUTO_SENT` / `OFFER_LETTER_AUTO_SEND_FAILED`)
 */
export async function processAndSendOfferLetter({
  applicationId,
  actorUserId = 'system',
  actorUserEmail = 'system@sarthi.in',
  forceResend = false,
  customOfferDate,
  customStartDate,
  customEndDate,
  customDeadline,
  customDuration,
  isInitialOffer = false,
  dryRun = false,
}: {
  applicationId: string;
  actorUserId?: string;
  actorUserEmail?: string;
  forceResend?: boolean;
  isInitialOffer?: boolean;
  dryRun?: boolean;
  customOfferDate?: string;
  customStartDate?: string;
  customEndDate?: string;
  customDeadline?: string;
  customDuration?: string;
}): Promise<ProcessOfferLetterResult> {
  try {
    const appRecord = await prisma.internshipApplication.findUnique({
      where: { id: applicationId },
    });

    if (!appRecord) {
      return { success: false, status: 'FAILED', error: 'Application record not found' };
    }

    // 1. Idempotency Guard: Prevent duplicate sends (unless forceResend is requested)
    if (appRecord.offerAcceptedAt && !forceResend) {
      console.log(`[OFFER_LETTER_PIPELINE] Offer letter already sent to ${appRecord.email} at ${appRecord.offerAcceptedAt}. Skipping.`);
      return { success: true, status: 'SKIPPED_ALREADY_SENT' };
    }

    // 2. Batch Member Enrollment + AUTHORITATIVE ID ALLOCATION
    // Rule: Backend allocates ID first → saves to DB → passes to Python.
    // Python NEVER generates its own ID. It only renders the PDF with the ID we supply.
    let member: any = null;
    let internIdAllocation: { permanentInternId: string; referenceNumber: string } | null = null;

    if (appRecord.studentId) {
      const { getOrCreateEnrollment, computeInternReferenceAndId } = await import('@/lib/services/internship.service');
      member = await getOrCreateEnrollment(appRecord.studentId);

      // Compute authoritative ID via gap-filling algorithm (NOT appCount, NOT highest+1)
      internIdAllocation = await computeInternReferenceAndId(appRecord.studentId);

      // Persist the allocated ID to BatchMember immediately (race-safe via DB unique constraint)
      if (member && internIdAllocation) {
        await prisma.batchMember.update({
          where: { id: member.id },
          data: {
            permanentInternId: internIdAllocation.permanentInternId,
            referenceNumber: internIdAllocation.referenceNumber,
            currentXp: 0,   // Initial XP is always 0 for new interns
          },
        }).catch((e: any) => {
          // If unique constraint fires (race condition) — re-fetch what was already committed
          console.warn('[OFFER_LETTER_PIPELINE] ID allocation race guard triggered:', e.message);
        });
        // Re-fetch to get committed values (handles race condition)
        member = await prisma.batchMember.findFirst({ where: { userId: appRecord.studentId } });
      }
    }

    // 3. Determine Reference Number & Intern ID — strictly from allocation, never derived from appCount
    const targetRef = member?.referenceNumber || internIdAllocation?.referenceNumber;
    const targetInternId = member?.permanentInternId || internIdAllocation?.permanentInternId;

    if (!targetRef || !targetInternId) {
      throw new Error('[OFFER_LETTER_PIPELINE] Could not determine a valid Permanent Intern ID or Reference Number. Cannot generate offer letter.');
    }

    const { isIilmUniversity } = await import('@/lib/utils/iilm');
    const isIilm = isIilmUniversity(appRecord.college);

    const now = new Date();
    const formatDateStr = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    let offerDate: string;
    let startDate: string;
    let endDate: string;
    let deadlineDate: string;

    const baseRegDateObj = appRecord.submittedAt ? new Date(appRecord.submittedAt) : now;

    if (isIilm && !customStartDate && !customOfferDate) {
      // For IILM University students: start date is 27-Jul-2026, end date is 27-Aug-2026
      const iilmStartDateObj = new Date(2026, 6, 27); // 27 July 2026
      const iilmEndDateObj = new Date(2026, 7, 27);   // 27 August 2026
      const iilmDeadlineObj = new Date(2026, 6, 30);  // 30 July 2026

      offerDate = customOfferDate || formatDateStr(iilmStartDateObj);
      startDate = customStartDate || formatDateStr(iilmStartDateObj);
      endDate = customEndDate || formatDateStr(iilmEndDateObj);
      deadlineDate = customDeadline || formatDateStr(iilmDeadlineObj);
    } else {
      const regStartDateObj = baseRegDateObj;
      const defaultDeadlineObj = new Date(regStartDateObj.getTime() + 3 * 24 * 60 * 60 * 1000);
      const defaultEndDateObj = new Date(regStartDateObj);
      defaultEndDateObj.setMonth(defaultEndDateObj.getMonth() + 1); // 1 Month Duration

      offerDate = customOfferDate || formatDateStr(regStartDateObj);
      startDate = customStartDate || offerDate;
      endDate = customEndDate || formatDateStr(defaultEndDateObj);
      deadlineDate = customDeadline || formatDateStr(defaultDeadlineObj);
    }

    // Dynamically resolve target track/position from applicant record
    // Prioritize domain and preferredField OVER internshipTrack ('experienced'/'learning' are meta tracks, not positions)
    const rawTrack = (appRecord.domain || appRecord.preferredField || (appRecord as any).trackSlug || appRecord.internshipTrack || '').trim();
    let targetPosition = 'Content Creation';

    const garbageWords = ['experienced', 'fresher', 'beginner', 'student', 'none', 'n/a', 'na', 'null', 'undefined'];

    if (rawTrack && !garbageWords.includes(rawTrack.toLowerCase())) {
      const lower = rawTrack.toLowerCase();
      if (lower.includes('web') || lower.includes('frontend') || lower.includes('backend') || lower.includes('html')) {
        targetPosition = 'Web Development';
      } else if (lower.includes('app') || lower.includes('flutter') || lower.includes('react native') || lower.includes('android') || lower.includes('ios')) {
        targetPosition = 'App Development';
      } else if (lower.includes('content') || lower.includes('creative') || lower.includes('video') || lower.includes('editing') || lower.includes('reels')) {
        targetPosition = 'Content Creation';
      } else if (lower.includes('software') || lower.includes('fullstack') || lower.includes('full-stack') || lower.includes('full stack')) {
        targetPosition = 'Software Development';
      } else if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('data science') || lower.includes('python')) {
        targetPosition = 'Artificial Intelligence & Machine Learning';
      } else if (lower.includes('digital marketing') || lower.includes('marketing') || lower.includes('social media') || lower.includes('seo')) {
        targetPosition = 'Digital Marketing & Social Media Strategy';
      } else if (lower.includes('excel') || lower.includes('data analytics') || lower.includes('power bi')) {
        targetPosition = 'Data Analytics & Advance Excel';
      } else {
        // Capitalize rawTrack nicely
        targetPosition = rawTrack.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    } else if (appRecord.course) {
      const cLower = appRecord.course.toLowerCase();
      if (cLower.includes('web')) targetPosition = 'Web Development';
      else if (cLower.includes('app')) targetPosition = 'App Development';
      else if (cLower.includes('python') || cLower.includes('ai')) targetPosition = 'Artificial Intelligence & Machine Learning';
    }

    // Format Title Case for Recipient Details (Name, College, Degree)
    const formatTitleCase = (str: string) => {
      if (!str) return '';
      return str.trim().split(/\s+/).map(w => {
        const u = w.toUpperCase();
        if (u === 'IILM') return 'IILM';
        if (u === 'BTECH' || u === 'B.TECH') return 'B.Tech';
        if (u === 'BCA') return 'BCA';
        if (u === 'MCA') return 'MCA';
        if (u === 'CSE') return 'Computer Science and Engineering';
        if (w.startsWith('(') || w.endsWith(')')) {
          const inner = w.replace(/[()]/g, '');
          const cased = inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase();
          return w.startsWith('(') ? `(${cased}` : `${cased})`;
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }).join(' ');
    };

    const rawCourse = appRecord.course ? formatTitleCase(appRecord.course) : 'B.Tech Computer Science and Engineering';
    const degreeField = appRecord.semester ? `${rawCourse} (Sem ${appRecord.semester})` : rawCourse;
    const applicantName = formatTitleCase(appRecord.name || 'Intern Candidate');
    let applicantCollege = formatTitleCase(appRecord.college || 'University');
    if (isIilm) {
      if (!applicantCollege.toLowerCase().includes('noida')) {
        applicantCollege = 'IILM University, Greater Noida';
      } else if (!applicantCollege.includes(',')) {
        applicantCollege = applicantCollege.replace(/Iilm University/i, 'IILM University,');
      }
    }
    const applicantCity = formatTitleCase(((appRecord as any).location || '').trim() || (isIilm ? 'Greater Noida, Uttar Pradesh' : 'Jamshedpur, Jharkhand'));

    const effectiveDuration = customDuration || '1 Month';
    const stipendText = isIilm 
      ? 'Performance-Based Paid Internship' 
      : 'Performance-Based Paid Internship (Skill Development)';

    const internData = {
      // CRITICAL: intern_id and reference_no are PRE-ALLOCATED by the backend.
      // Python MUST use these exact values for PDF rendering. Never compute IDs in Python.
      intern_id: targetInternId,
      reference_no: targetRef,
      name: applicantName,
      degree: degreeField,
      college: applicantCollege,
      city: applicantCity,
      position: targetPosition,
      stipend: stipendText,
      offer_date: offerDate,
      start_date: startDate,
      end_date: endDate,
      joining_date: startDate,
      duration: effectiveDuration,
      mentor: 'Mohit Raj',
      acceptance_deadline: deadlineDate,
    };

    // 4. File Paths & Python PDF Generation
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_offer_letter.py');
    let templatePath = path.join(process.cwd(), 'Mohit_Raj_Offer_Letter_Editable.docx');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'public', 'docs', 'Mohit_Raj_Offer_Letter_Editable.docx');
    }

    const cleanName = applicantName.replace(/\s+/g, ' ');
    const generatedPdfPath = path.join(outputDir, `${cleanName}_Offer_Letter.pdf`);

    let attachments: any[] = [];
    try {
      const { execFileSync } = require('child_process');
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      execFileSync(pythonCmd, [
        scriptPath,
        '--data', JSON.stringify(internData),
        '--template', templatePath,
        '--outdir', outputDir
      ], { cwd: process.cwd(), timeout: 90000 });

      if (fs.existsSync(generatedPdfPath)) {
        const pdfContent = fs.readFileSync(generatedPdfPath);
        if (pdfContent.length === 0) {
          throw new Error(`Generated PDF file is empty (0 bytes) at ${generatedPdfPath}`);
        }
        attachments.push({
          filename: `${cleanName}_Offer_Letter.pdf`,
          content: pdfContent,
          path: generatedPdfPath,
        });
        console.log(`[OFFER_LETTER_PIPELINE] Personalized offer letter PDF successfully generated (${pdfContent.length} bytes) and attached for ${applicantName}`);
      } else {
        throw new Error(`PDF generation finished but file was not found at expected path: ${generatedPdfPath}`);
      }
    } catch (pyErr: any) {
      console.error('[OFFER_LETTER_PIPELINE] Python offer letter generation failed:', pyErr.message || pyErr);
      throw new Error(`Failed to generate personalized offer letter PDF: ${pyErr.message || pyErr}`);
    }

    const isUpdate = forceResend && !isInitialOffer;

    // 5. Branded HTML Email Template (branded.ts)
    const emailSubject = isUpdate 
      ? `Updated Internship Letter — Welcome to SARTHI (${applicantName})`
      : `Welcome to SARTHI — ${applicantName}'s Official Internship Letter`;

    const offerEmailHtml = getBrandedTemplate({
      badge: isUpdate ? 'UPDATED OFFER LETTER' : 'OFFER LETTER ISSUED',
      heading: isUpdate ? 'Updated Offer Letter — Corrected Records' : `Welcome to SARTHI — Your Official Internship Letter`,
      body: `Dear **${applicantName}**,

We are thrilled to officially welcome you to **SARTHI Pvt. Ltd.**!

Your application has been carefully reviewed and approved by our mentor selection board. Please find your official Internship Offer Letter attached to this email.

**Internship Details:**
• **Reference No.:** ${targetRef}
• **Track:** ${targetPosition}
• **Duration:** ${effectiveDuration} (${startDate} – ${endDate})
• **Reporting To:** Mohit Raj — Mentor
• **Working Days:** Monday – Saturday
• **Daily Hours:** Maximum 2 Hours Per Day
• **Stipend:** ${stipendText}

**Next Steps:**
1. Download and review your attached Offer Letter PDF carefully.
2. Log in to your SARTHI intern dashboard to access your workspace.
3. Connect with your assigned mentor and begin your internship journey on your joining date.

We look forward to working with you and supporting your growth as a professional. Welcome aboard!`,
      highlight: `🎉 **Your official offer letter is attached to this email.** Please keep it safely for your records and future reference.`,
      action: {
        label: 'ACCESS INTERN DASHBOARD',
        url: 'https://sarthi-woad.vercel.app/dashboard/internship',
      },
      senderName: 'SARTHI Team',
    });

    // 6. Send Email via Resend / Gmail API (Skipped on dryRun)
    if (dryRun) {
      console.log(`[OFFER_LETTER_PIPELINE] [DRY RUN] PDF generated successfully. Skipping email dispatch and DB state updates.`);
      return {
        success: true,
        status: 'SUCCESS',
        referenceNumber: targetRef,
      };
    }

    const resendResult = await sendTransactionalEmail({
      to: appRecord.email,
      subject: emailSubject,
      html: offerEmailHtml,
      type: 'application',
      attachments,
      provider: 'resend',
    });

    if (resendResult.success !== false) {
      // 7. Update DB Record Status to OFFER_ACCEPTED & Stamp Timestamp
      await prisma.internshipApplication.update({
        where: { id: appRecord.id },
        data: { offerAcceptedAt: new Date(), status: 'OFFER_ACCEPTED' },
      });

      // Mark user as onboarded so they go directly to their student dashboard without onboarding form
      if (appRecord.studentId) {
        await prisma.user.update({
          where: { id: appRecord.studentId },
          data: { onboarded: true, onboardingStatus: 'COMPLETED' },
        }).catch((err) => console.warn('[OFFER_LETTER_PIPELINE] User onboarded update notice:', err.message));
      }

      // 8. Log Audit Log Event
      await prisma.auditLog.create({
        data: {
          actorId: actorUserId,
          actorEmail: actorUserEmail,
          action: forceResend ? 'OFFER_LETTER_RESENT' : 'OFFER_LETTER_AUTO_SENT',
          entityType: 'InternshipApplication',
          entityId: appRecord.id,
          entityName: appRecord.name,
          newValues: JSON.stringify({
            refNo: targetRef,
            recipientEmail: appRecord.email,
            status: 'OFFER_ACCEPTED',
            sentAt: new Date(),
            isResend: forceResend,
          }),
          reason: forceResend
            ? `Offer letter regenerated with updated profile data & resent via Resend API (Ref: ${targetRef})`
            : `Automated 1-month offer letter generated & emailed via Resend API on status transition to OFFER_ACCEPTED (Ref: ${targetRef})`,
        },
      });

      // Auto-sync candidate status to Google Sheet (Team Sankalp)
      syncApplicationToSheet(applicationId).catch((sheetErr) => {
        console.error('[GoogleSheetsSync] Background sync error:', sheetErr);
      });

      return {
        success: true,
        status: 'SUCCESS',
        referenceNumber: targetRef,
      };
    } else {
      throw new Error(typeof resendResult.error === 'string' ? resendResult.error : 'Resend API email dispatch failed');
    }
  } catch (err: any) {
    console.error('[OFFER_LETTER_PIPELINE] Failure in processAndSendOfferLetter:', err);

    // Audit Failure Entry
    try {
      await prisma.auditLog.create({
        data: {
          actorId: actorUserId,
          actorEmail: actorUserEmail,
          action: 'OFFER_LETTER_AUTO_SEND_FAILED',
          entityType: 'InternshipApplication',
          entityId: applicationId,
          newValues: JSON.stringify({ error: err.message || 'Unknown error' }),
          reason: `Automated offer letter generation/send failed: ${err.message || 'Unknown error'}`,
        },
      });
    } catch (auditErr) {
      console.warn('[AUDIT_LOG_ERROR]', auditErr);
    }

    return {
      success: false,
      status: 'FAILED',
      error: err.message || 'Offer letter generation/email delivery failed',
    };
  }
}
