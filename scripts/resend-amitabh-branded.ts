import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';
import fs from 'fs';
import path from 'path';

async function resendAmitabhBranded() {
  const targetEmail = 'makabhosdaag@gmail.com';
  const targetName = 'Amitabh Bacchan';
  const targetTrack = 'Video Editing & Reels Production';
  const targetCollege = 'DO';

  const pdfPath = path.join(process.cwd(), 'output', 'Amitabh_Bacchan_Offer_Letter.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);

  const html = getBrandedTemplate({
    badge: 'APPLICATION APPROVED',
    heading: 'Congratulations — Your Application Has Been Approved!',
    body: `Dear **${targetName}**,

We are pleased to inform you that your application for the **${targetTrack} Internship** at **SARTHI** has been officially **APPROVED** by our mentor selection board!

**Applicant Overview:**
• **College:** ${targetCollege}
• **Program:** WEOFIH (Sem 1)
• **Selected Track:** ${targetTrack}
• **Status:** Approved & Evaluated

You have been shortlisted to join our upcoming Cohort 2026. Your official offer letter PDF is attached to this email.

**What to do next:**
1. Log in to your personal SARTHI student portal.
2. Access your dedicated intern workspace.
3. Begin working on live campaigns & client projects alongside your assigned mentor from Day One.`,
    highlight: '🎉 **Selection Confirmed:** Your profile has passed all evaluation rounds. Log in to your dashboard to claim your seat on the team.',
    action: {
      label: 'ACCESS INTERN DASHBOARD',
      url: 'https://sarthi-woad.vercel.app/dashboard/internship',
    },
    senderName: 'Mohit Raj & SARTHI Team',
  });

  console.log(`🚀 Dispatching branded email + PDF attachment to ${targetEmail}...`);
  const result = await sendTransactionalEmail({
    to: targetEmail,
    subject: 'Application Approved — Welcome to SARTHI Internship!',
    html,
    type: 'application',
    attachments: [
      {
        filename: 'Amitabh_Bacchan_Offer_Letter.pdf',
        content: pdfBuffer,
      },
    ],
    provider: 'resend',
  });

  console.log('🎉 SUCCESS! Dispatch Result:', result);
}

resendAmitabhBranded();
