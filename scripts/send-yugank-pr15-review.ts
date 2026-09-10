import 'dotenv/config';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { getBrandedTemplate } from '@/lib/email/templates/branded';

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY missing in .env');

  const resend = new Resend(apiKey);

  const recipientEmail = 'yugankjadon786@gmail.com';
  const recipientName = 'Yugank Jadon';
  const bccEmails = ['omprabhat21@gmail.com', 'omprabhat@gmail.com'];
  const subject = '🎉 PR #15 Review & Acceptance: Expanded Civic Guidance & Tracker Flow — SARTHI';

  console.log(`Sending PR Review & Acceptance email to: ${recipientName} <${recipientEmail}>...`);

  const html = getBrandedTemplate({
    badge: '💻 PR REVIEW & ACCEPTANCE',
    heading: 'PR #15 Accepted: Expanded Civic Catalog & Tracker Flow',
    body: `Dear **Yugank Jadon**,

We have completed the technical review of your Pull Request #15 (\`feat: expand citizen guidance catalog and backend tracking flow\`) on the **NyayaSetu** repository (https://github.com/mohitraj8503/Nyaya-Setu).

### ✅ Key Contributions Accepted & Merged:
1. **6 New High-Impact Civic Domains:** Successfully expanded the diagnostic taxonomy in \`data/problems.json\`, \`data/routes.json\`, and \`data/questions.json\` covering **RTI Online (\`rtionline.gov.in\`)**, **Municipal Civic Issues**, **EPF/EPFO Claims**, **Passport Seva Delays**, **Rail Madad (PNR/Railways)**, and **Pension Seva**.
2. **Grievance Tracker Lifecycle & Timeline APIs:** Added clean SQLite CRUD endpoints (\`GET /tracker/:id\` with calculated progress timeline and automated \`nextAction\` advice, \`PUT /tracker/:id\`, and \`DELETE /tracker/:id\`).
3. **Developer Postman Collection:** Added a comprehensive \`server/docs/nyayasetu.postman_collection.json\` with 400+ lines of documented API tests.
4. **Clean Test Execution:** All 9 automated regression tests passed cleanly (\`npm test\` 100% green).
5. **Official Recognition:** Your contributions have been merged into the \`main\` production branch, and your name is officially credited in **Team Sankalp** under \`README.md\`.

### ⚠️ Feedback & Upstream Sync Guidance:
• **Fork Sync Required:** When creating branches in active team environments, make sure to run \`git pull upstream main\` before pushing changes so that peer contributions (such as the new Chatbot widget) are not inadvertently overwritten in your PR diff.

Congratulations on delivering a high-quality, impactful engineering contribution!`,
    highlight: `🌟 **Official Project Roster:** You are now officially recognized as a core contributor in Team Sankalp on the NyayaSetu open-source repository.`,
    action: {
      label: 'View Main Repository & Contributor Roster',
      url: 'https://github.com/mohitraj8503/Nyaya-Setu'
    },
    senderName: 'SARTHI Mentorship Team'
  });

  const emailPayload: any = {
    from: 'SARTHI <noreply@sarthi-woad.vercel.app>',
    replyTo: 'pm.enthuse@gmail.com',
    to: recipientEmail,
    bcc: bccEmails,
    subject,
    html
  };

  const result = await resend.emails.send(emailPayload);

  console.log(`Result for ${recipientName}:`, result);

  await prisma.auditLog.create({
    data: {
      actorId: 'mohitraj8503',
      actorEmail: 'admin@sarthi.in',
      action: 'PR15_REVIEW_ACCEPTED_EMAIL_SENT',
      entityType: 'InternContribution',
      entityId: 'TT-INT-2026-0016',
      entityName: recipientName,
      newValues: JSON.stringify({
        recipientEmail,
        bccEmails,
        subject,
        commit: '9e48628',
        repo: 'https://github.com/mohitraj8503/Nyaya-Setu',
        sentAt: new Date()
      }),
      reason: `PR #15 Review & Acceptance notice delivered to ${recipientName} with Om Prabhat in BCC`
    }
  }).catch(e => console.warn('AuditLog warning:', e.message));

  console.log('\nPR #15 Review & Acceptance email successfully sent to Yugank Jadon!');
  await prisma.$disconnect();
}

main().catch(console.error);
