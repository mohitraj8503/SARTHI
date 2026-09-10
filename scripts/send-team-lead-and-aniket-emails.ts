import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY || '');

async function sendEmailToNitin() {
  const email = 'nitinsinha062@gmail.com';
  const subject = 'Disciplinary Action Update: Web Development Intern Suspensions';
  const badge = '📢 TEAM LEAD UPDATE';
  const heading = 'Web Development Intern Suspensions';

  const bodyMarkdown = `Hi **Nitin**,

This is to formally inform you that the following **Web Development Interns** have been placed under temporary suspension, effective immediately, due to a persistent lack of progress and non-performance:

1. **Ayush Singh** (${'ayushsinghjsr6@gmail.com'})
2. **Harsh Pathak** (${'pathakharsh584@gmail.com'})
3. **Harshita Kumari Singh** (${'harshitakum041008@gmail.com'})
4. **Kritika Mohanty** (${'kritikamohanty2008@gmail.com'})

**What the suspension notice contains & requires of them:**
* **Immediate Halt of Work:** They must stop all development and coding work immediately.
* **Access Revocation:** Their access to team repositories and workspaces is being restricted.
* **24-Hour Explanation Window:** They have been given 24 hours to submit a formal written explanation for their performance failure to **pm.enthuse@gmail.com**.
* **Termination Clause:** Failure to respond within 24 hours will result in permanent termination of their internship, without certificates or letters of recommendation.

Please ensure no further tasks are assigned to them pending final review, and adjust team coordination accordingly.`;

  const highlightMarkdown = `⚠️ **Note for Team Lead:** Please ensure that any active credentials or repository branches related to these interns are monitored to prevent unauthorized access.`;

  const html = getBrandedTemplate({
    badge,
    heading,
    body: bodyMarkdown,
    highlight: highlightMarkdown,
    senderName: 'Mohit Raj\nLead Mentor, SARTHI'
  });

  console.log(`Sending update email to Nitin Sinha (${email})...`);
  const { data, error } = await resend.emails.send({
    from: 'SARTHI Internship <internship@sarthi.in>',
    to: [email],
    reply_to: 'pm.enthuse@gmail.com',
    subject,
    html
  });

  if (error) {
    console.error(`❌ Failed to send email to Nitin:`, error);
  } else {
    console.log(`✅ Success! Sent email to Nitin Sinha (ID: ${data?.id})`);
  }
}

async function sendEmailToAniket() {
  const email = 'aniketdutta615@gmail.com';
  const subject = 'URGENT: Performance Warning & Compensation Gating - SARTHI';
  const badge = '⚠️ PERFORMANCE WARNING';
  const heading = 'Urgent Notice: Fulfill Deliverables to Receive Compensation';

  const bodyMarkdown = `Dear **Aniket Dutta**,

This is an official performance warning regarding your contribution at **SARTHI**.

Our project tracking indicates a critical deficit in your work contribution and task execution. We require all team members to actively engage and deliver on their responsibilities.

**Please be advised of the following:**
* You must resume work and actively complete your assigned deliverables immediately.
* **Failure to do so will result in you not receiving your salary/stipend**, alongside the immediate termination of your internship.

We expect a professional standard of work and consistency. Please contact the mentor immediately to align on your pending tasks.`;

  const highlightMarkdown = `⚠️ **CRITICAL:** Immediate work contribution is required to release your stipend. Continued inaction will lead to permanent internship termination and withholding of salary.`;

  const html = getBrandedTemplate({
    badge,
    heading,
    body: bodyMarkdown,
    highlight: highlightMarkdown,
    action: {
      label: 'Contact Mentor',
      url: 'mailto:pm.enthuse@gmail.com?subject=Task Alignment - Aniket Dutta'
    },
    senderName: 'Mohit Raj\nLead Mentor, SARTHI'
  });

  console.log(`Sending warning email to Aniket Dutta (${email})...`);
  const { data, error } = await resend.emails.send({
    from: 'SARTHI Internship <internship@sarthi.in>',
    to: [email],
    reply_to: 'pm.enthuse@gmail.com',
    subject,
    html
  });

  if (error) {
    console.error(`❌ Failed to send email to Aniket:`, error);
  } else {
    console.log(`✅ Success! Sent email to Aniket Dutta (ID: ${data?.id})`);
  }
}

async function main() {
  console.log(`\n==================================================`);
  console.log(`📢 DISPATCHING TEAM LEAD & PERFORMANCE WARNING EMAILS`);
  console.log(`==================================================\n`);

  await sendEmailToNitin();
  await sendEmailToAniket();

  console.log(`\n==================================================`);
  console.log(`🎉 DISPATCH COMPLETE!`);
  console.log(`==================================================\n`);
}

main().catch(console.error);
