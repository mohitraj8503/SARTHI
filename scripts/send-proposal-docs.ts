import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { getBrandedTemplate } from '../lib/email/templates/branded';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const file1Path = '/home/mohitraj8503/Documents/SARTHI Bada Wala LetterHead.docx';
  const file2Path = '/home/mohitraj8503/Documents/SARTHI LetterHead.docx';

  if (!fs.existsSync(file1Path)) {
    console.error(`File not found: ${file1Path}`);
    process.exit(1);
  }
  if (!fs.existsSync(file2Path)) {
    console.error(`File not found: ${file2Path}`);
    process.exit(1);
  }

  const file1Buffer = fs.readFileSync(file1Path);
  const file2Buffer = fs.readFileSync(file2Path);

  const subject = 'School Presentation Proposals & PPT Assignment';
  const bodyText = `Please find attached both the short 1-page proposal and the detailed 4-page partnership proposal for the school presentation.\n\nAlso, could someone please be assigned to work on the PowerPoint presentation? If anyone is unable to do it, please let me know and I will gladly take it on.`;

  const html = getBrandedTemplate({
    badge: 'SCHOOL PRESENTATION PROPOSALS',
    heading: subject,
    body: bodyText,
    senderName: 'Mohit Raj - SARTHI Team',
  });

  console.log('Sending branded email via Resend...');

  const { data, error } = await resend.emails.send({
    from: 'SARTHI <admin@sarthi.in>',
    to: ['mukulonthenet@gmail.com'],
    cc: ['mohitraj8503@gmail.com'],
    subject: subject,
    html: html,
    attachments: [
      {
        filename: 'SARTHI Bada Wala LetterHead.docx',
        content: file1Buffer,
      },
      {
        filename: 'SARTHI LetterHead.docx',
        content: file2Buffer,
      },
    ],
  });

  if (error) {
    console.error('Failed to send email:', error);
  } else {
    console.log('✓ Email sent successfully! ID:', data?.id);
  }
}

main();
