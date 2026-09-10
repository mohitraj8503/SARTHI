import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY || '');

interface SuspendedIntern {
  name: string;
  email: string;
}

const TARGET_INTERNS: SuspendedIntern[] = [
  {
    name: 'Ayush Singh',
    email: 'ayushsinghjsr6@gmail.com'
  },
  {
    name: 'Harsh Pathak',
    email: 'pathakharsh584@gmail.com'
  },
  {
    name: 'Harshita Kumari Singh',
    email: 'harshitakum041008@gmail.com'
  },
  {
    name: 'Kritika Mohanty',
    email: 'kritikamohanty2008@gmail.com'
  }
];

async function main() {
  console.log(`\n==================================================`);
  console.log(`🔴 INITIATING SERIOUS SUSPENSION NOTICE DISPATCH`);
  console.log(`==================================================\n`);

  let successCount = 0;
  let failCount = 0;

  for (const intern of TARGET_INTERNS) {
    const subject = `URGENT: Temporary Suspension of Web Development Internship - SARTHI`;
    const badge = `🔴 DISCIPLINARY NOTICE`;
    const heading = `Internship Suspension & Access Revocation`;

    const bodyMarkdown = `Dear **${intern.name}**,

This is a formal notice that your internship at **SARTHI** as a **Web Development Intern** has been suspended, effective immediately.

This disciplinary action has been taken due to a severe lack of progress, consistent non-responsiveness, and failure to meet the essential milestones and tasks assigned to the Web Development team.

**Effective immediately, you are required to comply with the following:**

1. **Cease All Development Work:** You must halt all coding, designing, and documentation activities on the SARTHI platforms and repositories immediately.
2. **Access Revocation:** Your access to the organization's developer tools, source code, staging environments, and team workspaces is being restricted.
3. **Submit a Formal Explanation:** You are required to submit a formal written explanation detailing the reasons for your lack of execution and performance issues within **24 hours** of receiving this notice.

Please note that failure to provide a satisfactory explanation within this 24-hour window will lead to the **permanent termination** of your internship. In the event of termination, you will not receive any Internship Certificate, Experience Letter, or Recommendation from SARTHI.

We expect a high standard of dedication and responsibility from our engineering interns, and your lack of performance has seriously impacted the team's release timelines.`;

    const highlightMarkdown = `⚠️ **CRITICAL ACTION REQUIRED:**\nSubmit your formal explanation directly to the Lead Mentor at **pm.enthuse@gmail.com** or contact Mohit Raj immediately. Your internship status will remain suspended pending a final review of your explanation.`;

    const html = getBrandedTemplate({
      badge,
      heading,
      body: bodyMarkdown,
      highlight: highlightMarkdown,
      action: {
        label: 'Submit Explanation via Email',
        url: 'mailto:pm.enthuse@gmail.com?subject=Explanation regarding Suspension - ' + intern.name
      },
      senderName: 'Mohit Raj\nLead Mentor, SARTHI'
    });

    console.log(`--------------------------------------------------`);
    console.log(`👤 Intern: ${intern.name}`);
    console.log(`📧 Target Email: ${intern.email}`);
    console.log(`📌 Subject: ${subject}`);

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI Internship <internship@sarthi.in>',
        to: [intern.email],
        reply_to: 'pm.enthuse@gmail.com',
        subject,
        html
      });

      if (error) {
        console.error(`❌ Error sending email to ${intern.email}:`, error);
        failCount++;
      } else {
        console.log(`✅ SUCCESS! Email delivered to ${intern.email} (Resend ID: ${data?.id})`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception sending to ${intern.email}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 DISPATCH COMPLETE: ${successCount} Sent | ${failCount} Failed`);
  console.log(`==================================================\n`);
}

main().catch(console.error);
