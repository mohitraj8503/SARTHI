import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { templates } from '../lib/email';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const emailTemplate = templates.teacherAccountReady(
    'Rajat Choudhury',
    'rajatchoudhury5@gmail.com',
    'Rajat@TT2026!',
    'TT-FAC-0003',
    'setup_token_rajat_2026'
  );

  console.log('Sending Rajat credentials email via Resend...');

  const { data, error } = await resend.emails.send({
    from: 'SARTHI <admin@sarthi.in>',
    to: ['rajatchoudhury5@gmail.com'],
    cc: ['mohitraj8503@gmail.com'],
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  });

  if (error) {
    console.error('Failed to send email via Resend:', error);
  } else {
    console.log('✓ Email sent via Resend successfully! Resend ID:', data?.id);
  }
}

main();
