import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitInternshipApplication } from '@/lib/services/internship.service';
import { sendEmail } from '@/lib/email';
import { getBaseTemplate } from '@/lib/email/templates/base';
import { emailEnv } from '@/lib/env/email';
import { prisma } from '@/lib/prisma';
import { syncApplicationToSheet } from '@/lib/services/google-sheets.service';

import { internshipApplicationSchema } from '@/lib/validators/schemas';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const application = await prisma.internshipApplication.findFirst({
      where: { studentId: user.id },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      authenticated: true,
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((user as any).platformSegment !== 'MAIN') {
      return NextResponse.json({ error: 'Internship applications are open to college / university students only.' }, { status: 403 });
    }

    const data = await req.json();

    // 1. Zod input validation
    const validationResult = internshipApplicationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: firstError, details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate applications
    const duplicateApp = await prisma.internshipApplication.findFirst({
      where: {
        OR: [
          { studentId: user.id },
          { email: validationResult.data.email.toLowerCase().trim() }
        ]
      }
    });
    if (duplicateApp) {
      return NextResponse.json({ error: 'You have already submitted an application for this internship.' }, { status: 400 });
    }

    // 3. Application deadline verification (Set to September 30, 2026)
    const deadline = new Date('2026-09-30T23:59:59Z');
    if (new Date() > deadline) {
      return NextResponse.json({ error: 'The application deadline has passed. Submissions are closed.' }, { status: 400 });
    }

    // 4. Permanent Blacklist Check
    const emailToCheck = (data.email || user.email || '').toLowerCase().trim();
    const phoneToCheck = (data.phone || user.phone || '').trim();
    const enrollmentToCheck = (data.enrollmentNumber || user.enrollmentNumber || '').trim();

    const blacklistMatch = await prisma.rejectedApplicant.findFirst({
      where: {
        OR: [
          { email: emailToCheck },
          ...(phoneToCheck ? [{ phone: phoneToCheck }] : []),
          ...(enrollmentToCheck ? [{ enrollmentNumber: enrollmentToCheck }] : []),
        ],
      },
    });

    // Flag to control Arka Jain University ban (Set to true to re-enable immediately)
    const ENABLE_ARKA_JAIN_RESTRICTION = false;

    if (blacklistMatch) {
      const isArkaJainBlacklist = (blacklistMatch.reason || '').toLowerCase().includes('arka jain');
      if (ENABLE_ARKA_JAIN_RESTRICTION || !isArkaJainBlacklist) {
        if (data.college) {
          await prisma.user.update({
            where: { id: user.id },
            data: { college: data.college },
          });
        }
        return NextResponse.json({ success: false, rejected: true, reason: 'BLACKLISTED' });
      }
    }

    // 2. Eligibility evaluation (Arka Jain + Technical program categories: B.Tech and Diploma)
    const collegeClean = (data.college || '').toLowerCase().trim();
    const isArkaJain = ENABLE_ARKA_JAIN_RESTRICTION && (collegeClean === 'arka jain university');
    
    if (isArkaJain) {
      const courseLower = (data.course || '').toLowerCase().trim();
      const isTechnical = 
        courseLower.includes('b.tech') || 
        courseLower.includes('btech') || 
        courseLower.includes('b tech') || 
        courseLower.includes('diploma');

      if (isTechnical) {
        // Add to permanent blacklist
        await prisma.rejectedApplicant.create({
          data: {
            fullName: data.name || user.name || 'Arka Jain Technical Applicant',
            email: emailToCheck,
            phone: phoneToCheck || null,
            enrollmentNumber: enrollmentToCheck || null,
            university: data.college || 'Arka Jain University',
            course: data.course || 'B.Tech / Diploma',
            reason: 'Arka Jain University B.Tech/Diploma restriction policy.',
          },
        });

        // Update User college profile to persist the block
        await prisma.user.update({
          where: { id: user.id },
          data: { college: data.college || 'Arka Jain University' },
        });

        // Send harsh rejection email to the student immediately
        try {
          await sendEmail({
            to: emailToCheck,
            type: 'notification',
            subject: 'Internship Application Rejected | SARTHI',
            html: getBaseTemplate(
              `<p>Dear ${data.name || user.name || 'Applicant'},</p>
               <p>We have received your internship registration listing <strong>${data.college}</strong> and program <strong>${data.course}</strong>.</p>
               <p>We are sorry, we don't keep donkeys in our student internship program. Your college / university caliber does not match SARTHI standards.</p>
               <div style="background: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 16px; padding: 20px; margin: 24px 0;">
                 <p style="color: #C53030; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Application Status</p>
                 <p style="color: #9B2C2C; font-size: 15px; font-weight: 700; margin: 0;">Application Rejected (Disqualified)</p>
               </div>
               <p>As per our current policies, we are not accepting applications from students of Arka Jain University's B.Tech and Diploma programs.</p>`,
              'Application Rejected',
              { label: 'Return to Homepage', url: `${emailEnv.APP_URL || 'https://sarthi-woad.vercel.app'}` }
            )
          });
        } catch (emailErr) {
          console.error('Error sending rejection email:', emailErr);
        }

        return NextResponse.json({ success: false, rejected: true, reason: 'ARKA_JAIN_TECHNICAL_RESTRICTION' });
      }
    }

    if (data.college || data.location) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(data.college ? { college: data.college } : {}),
          ...(data.location ? { location: data.location } : {}),
        },
      }).catch(err => console.warn('User profile update error:', err));
    }

    const app = await submitInternshipApplication(user.id, data);

    // Auto-sync new applicant row to Google Sheet (Team Sankalp)
    syncApplicationToSheet(app.id).catch(err => console.error('[GoogleSheetsSync] New app sync error:', err));

    // 1. Send confirmation email to the student
    try {
      await sendEmail({
        to: app.email,
        type: 'notification',
        subject: 'Thank you for registering! | Spark Internship Program',
        html: getBaseTemplate(
          `<p>Dear ${app.name},</p>
           <p>Thank you for submitting your application for the SARTHI Student Internship Program.</p>
           <p>Our review team is currently evaluating your profile, education, and technical statements. We will get back to you with an update shortly.</p>
           <div style="background: #F8FAF9; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0;">
             <p style="color: #1B4332; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Application Status</p>
             <p style="color: #475569; font-size: 15px; font-weight: 700; margin: 0;">Under Review</p>
           </div>`,
          'Application Received',
          { label: 'View Application Status', url: `${emailEnv.APP_URL}/dashboard/internship` }
        )
      });
    } catch (emailErr) {
      console.error('Error sending confirmation email to student:', emailErr);
    }

    // 2. Send review notification email to Mentor (pm.enthuse@gmail.com) and Admin (admin@sarthi.in)
    try {
      await sendEmail({
        to: ['pm.enthuse@gmail.com', 'admin@sarthi.in'],
        type: 'notification',
        subject: `New Internship Application: ${app.name}`,
        html: getBaseTemplate(
          `<p>Hello Admin,</p>
           <p>A new student has registered and applied for the internship program. Please review their details below:</p>
           <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 32px 0;">
             <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
               <tr style="border-bottom: 1px solid #e2e8f0;">
                 <td style="padding: 10px 0; color: #64748b;">Full Name</td>
                 <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0f172a;">${app.name}</td>
               </tr>
               <tr style="border-bottom: 1px solid #e2e8f0;">
                 <td style="padding: 10px 0; color: #64748b;">Email Address</td>
                 <td style="padding: 10px 0; text-align: right; color: #0f172a;">${app.email}</td>
               </tr>
               <tr style="border-bottom: 1px solid #e2e8f0;">
                 <td style="padding: 10px 0; color: #64748b;">College / University</td>
                 <td style="padding: 10px 0; text-align: right; color: #0f172a;">${app.college}</td>
               </tr>
               <tr style="border-bottom: 1px solid #e2e8f0;">
                 <td style="padding: 10px 0; color: #64748b;">Course & Year</td>
                 <td style="padding: 10px 0; text-align: right; color: #0f172a;">${app.course} (Semester: ${app.semester})</td>
               </tr>
               <tr style="border-bottom: 1px solid #e2e8f0;">
                 <td style="padding: 10px 0; color: #64748b;">Location / City</td>
                 <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0f172a;">${(app as any).location || 'Not Specified'}</td>
               </tr>
               <tr>
                 <td style="padding: 10px 0; color: #64748b;">Statement of Purpose</td>
                 <td style="padding: 10px 0; text-align: right; color: #0f172a; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${app.statement || 'None'}</td>
               </tr>
             </table>
           </div>
           <p>Please review and manage this application via the Admin / Mentor Command Center.</p>`,
          'Review Application',
          { label: 'Review Application Details', url: `${emailEnv.APP_URL}/mentor/dashboard?tab=applications` }
        )
      });
    } catch (emailErr) {
      console.error('Error sending notification email to admin:', emailErr);
    }

    return NextResponse.json({ success: true, application: app });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}

