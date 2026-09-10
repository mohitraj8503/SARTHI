import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const interns = [
  {
    name: 'Om Prabhat',
    email: 'omprabhat2106@gmail.com',
    domain: 'Software Development',
    college: 'IILM UNIVERSITY',
    course: 'B.TECH (Sem 3)'
  },
  {
    name: 'Om Prabhat',
    email: 'omprabhat21@gmail.com',
    domain: 'Software Development',
    college: 'IILM UNIVERSITY',
    course: 'B.TECH (Sem 3)'
  }
];

async function sendReminders() {
  console.log(`🚀 Starting to send branded reminders using Resend API to ${interns.length} interns...`);

  for (const intern of interns) {
    const bodyMarkdown = `Dear **${intern.name}**,

Your application for the **SARTHI Internship (${intern.domain})** is pending. Please don't miss the great opportunity to work with us!

Please complete the payment as soon as possible to start with your internship journey with **Artificial Intelligence and Machine Learning**.

You'll receive your internship offer letter after the payment procedure is completed.

### Application Details:
* **Domain:** ${intern.domain}
* **College:** ${intern.college}
* **Course:** ${intern.course}`;

    const htmlContent = getBrandedTemplate({
      badge: 'APPLICATION PENDING',
      heading: 'Action Required: Complete Your Internship Enrollment',
      body: bodyMarkdown,
      highlight: '⚠️ **Important:** Please complete the payment procedure to confirm your slot and receive your official internship offer letter.',
      action: {
        label: 'Complete Application / Payment →',
        url: 'https://sarthi-woad.vercel.app/dashboard'
      },
      senderName: 'SARTHI Team'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [intern.email],
        subject: 'Action Required: Your application for SARTHI Internship is pending',
        html: htmlContent
      });

      if (error) {
        console.error(`❌ Resend failed for ${intern.email}:`, error);
      } else {
        console.log(`✅ Branded reminder email sent to ${intern.name} (${intern.email}) | ID: ${data?.id}`);
      }
    } catch (err: any) {
      console.error(`❌ Exception sending to ${intern.email}:`, err.message);
    }
  }
}

sendReminders()
  .catch(console.error);
