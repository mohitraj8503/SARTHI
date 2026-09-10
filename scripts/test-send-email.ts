import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const file1Path = '/home/mohitraj8503/Documents/SARTHI Bada Wala LetterHead.docx';
  const file2Path = '/home/mohitraj8503/Documents/SARTHI LetterHead.docx';

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

  console.log('Sending transactional email via primary provider...');

  const result = await sendTransactionalEmail({
    to: 'mukulonthenet@gmail.com',
    subject: subject,
    html: html,
    type: 'notification',
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

  console.log('Result:', result);
}

main();
