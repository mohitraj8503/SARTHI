import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { getBrandedTemplate } from '../lib/email/templates/branded';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

const TO_EMAIL = 'siddiquisabiha411@gmail.com';

async function main() {
  const heading = 'Please Upload Your Profile Photo 📸';
  
  const body = `Dear Sabiha Siddiqui,

We hope this email finds you well.

To ensure your teacher profile is fully set up and looks professional on the SARTHI platform, could you please log in to your dashboard and upload your profile photo? 

You can upload your photo directly in the Teacher Dashboard profile settings. Let us know if you run into any issues.

Thank you for your contributions to SARTHI! 🚀`;

  const html = getBrandedTemplate({
    badge: 'Teacher Setup',
    heading,
    body,
    senderName: 'Team SARTHI',
  });

  console.log(`Sending setup request email to ${TO_EMAIL}...`);
  const { data, error } = await resend.emails.send({
    from: 'SARTHI <admin@sarthi.in>',
    to: [TO_EMAIL],
    subject: `Action Required: Please upload your profile photo on Teacher Dashboard 📸`,
    html,
  });

  if (error) {
    console.error('❌ Resend error:', error);
    process.exit(1);
  }

  console.log('✅ Email sent successfully!', data);
}

main().catch((err) => {
  console.error('Execution failed:', err);
});
