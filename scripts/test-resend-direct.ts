import * as fs from 'fs';

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  const file1Buffer = fs.readFileSync('/home/mohitraj8503/Documents/SARTHI Bada Wala LetterHead.docx');
  const file2Buffer = fs.readFileSync('/home/mohitraj8503/Documents/SARTHI LetterHead.docx');

  const payload = {
    from: 'SARTHI <admin@sarthi.in>',
    to: ['mukulonthenet@gmail.com'],
    cc: ['mohitraj8503@gmail.com'],
    subject: 'School Presentation Proposals & PPT Assignment',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; font-size: 14px; line-height: 1.6;">
        <p>Please find attached both the short 1-page proposal and the detailed 4-page partnership proposal for the school presentation.</p>
        <p>Also, could someone please be assigned to work on the PowerPoint presentation? If anyone is unable to do it, please let me know and I will gladly take it on.</p>
        <br>
        <p>Warm regards,</p>
        <p><strong>Mohit Raj - SARTHI Team</strong></p>
      </div>
    `,
    attachments: [
      {
        filename: 'SARTHI Bada Wala LetterHead.docx',
        content: file1Buffer.toString('base64'),
      },
      {
        filename: 'SARTHI LetterHead.docx',
        content: file2Buffer.toString('base64'),
      },
    ],
  };

  console.log('Sending direct HTTP POST to https://api.resend.com/emails with from admin@sarthi.in...');

  let res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = await res.json();
  console.log('Response with from admin@sarthi.in:', data);

  if (!res.ok && data.name === 'invalid_from_address') {
    console.log('Retrying with from onboarding@resend.dev...');
    payload.from = 'SARTHI <onboarding@resend.dev>';
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    data = await res.json();
    console.log('Response with onboarding@resend.dev:', data);
  }
}

testResend();
