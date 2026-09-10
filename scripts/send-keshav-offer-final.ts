import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';
import fs from 'fs';
import path from 'path';

async function sendKeshavOfferLetter() {
  const internName = 'Keshav Ruhela';
  const internTrack = 'Full Stack Development';
  const internDuration = '1 Month';
  const internStart = '21-Jul-2026';
  const internEnd = '21-Aug-2026';
  const referenceNo = 'TT-INT-2026-0066';

  const pdfPath = path.join(process.cwd(), 'output', 'Keshav Ruhela_Offer_Letter.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);

  const html = getBrandedTemplate({
    badge: 'OFFER LETTER ISSUED',
    heading: 'Welcome to SARTHI — Your Official Internship Letter',
    body: `Dear **${internName}**,

We are thrilled to officially welcome you to **SARTHI Pvt. Ltd.**!

Your application has been carefully reviewed and **approved** by our mentor selection board. Please find your official Internship Offer Letter attached to this email.

**Internship Details:**
• **Reference No.:** ${referenceNo}
• **Track:** ${internTrack}
• **Duration:** ${internDuration} (${internStart} – ${internEnd})
• **Reporting To:** Mohit Raj — Mentor
• **Working Days:** Monday – Saturday
• **Daily Hours:** Maximum 2 Hours Per Day
• **Stipend:** Unpaid (Skill Development Internship)

**Next Steps:**
1. Download and review your attached Offer Letter PDF carefully.
2. Log in to your SARTHI intern dashboard to access your workspace.
3. Connect with your assigned mentor and begin your internship journey on your joining date.

We look forward to working with you and supporting your growth as a professional. Welcome aboard!`,
    highlight: '🎉 **Your official offer letter is attached to this email.** Please keep it safely for your records and future reference.',
    action: {
      label: 'ACCESS INTERN DASHBOARD',
      url: 'https://sarthi-woad.vercel.app/dashboard/internship',
    },
    senderName: 'Mohit Raj & SARTHI Team',
  });

  console.log(`\n📤 Sending offer letter to ${internName} <keshavruhela25@gmail.com>...`);
  const result = await sendTransactionalEmail({
    to: 'keshavruhela25@gmail.com',
    subject: `Welcome to SARTHI — Keshav Ruhela's Official Internship Letter`,
    html,
    type: 'application',
    attachments: [
      {
        filename: 'Keshav_Ruhela_Offer_Letter.pdf',
        content: pdfBuffer,
      },
    ],
    provider: 'resend',
  });

  console.log('✅ Dispatch Result:', result);
}

sendKeshavOfferLetter().catch((err) => {
  console.error('❌ Error sending offer letter:', err);
  process.exit(1);
});
