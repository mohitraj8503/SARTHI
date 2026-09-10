/**
 * Send Certificate Update email to Mohit Raj via SMTP (Nodemailer)
 * Run this script with:
 *   SMTP_USER="admin@sarthi.in" SMTP_PASS="your-smtp-password" node scripts/send-cert-update.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_TO = 'mohitraj8503@gmail.com';

async function main() {
  const user = process.env.SMTP_USER || 'admin@sarthi.in';
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465');

  if (!pass) {
    console.error('❌ Error: SMTP_PASS environment variable is required.');
    console.log('\nUsage example:');
    console.log('  SMTP_USER="admin@sarthi.in" SMTP_PASS="your-smtp-password" node scripts/send-cert-update.js');
    process.exit(1);
  }

  console.log(`📡 Connecting to SMTP Server (${host}:${port}) as ${user}...`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Updated Certificate Available</title>
</head>

<body style="margin:0;padding:0;background:#f8fbf8;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbf8;padding:50px 20px;">
<tr>
<td align="center">

<table width="680" cellpadding="0" cellspacing="0" style="
background:#ffffff;
border-radius:24px;
overflow:hidden;
box-shadow:0 20px 60px rgba(34,87,60,0.08);
">

<!-- Header -->
<tr>
<td style="
padding:55px 40px;
text-align:center;
background:linear-gradient(180deg,#ffffff,#f7fcf8);
border-bottom:1px solid #eef7f0;
">

<img src="https://sarthi-woad.vercel.app/sarthi-logo.png"
     alt="SARTHI"
     width="80"
     style="display:block;margin:0 auto 20px auto;">

<h1 style="
margin:0;
font-size:38px;
font-weight:700;
color:#1f2937;
letter-spacing:-1px;
">
SARTHI
</h1>

<p style="
margin:12px 0 0;
font-size:16px;
color:#64748b;
">
Empowering Future Innovators
</p>

</td>
</tr>

<!-- Main Content -->
<tr>
<td style="padding:70px 60px;">

<div style="
display:inline-block;
padding:8px 18px;
background:#eefbf2;
color:#2f855a;
border-radius:999px;
font-size:13px;
font-weight:600;
margin-bottom:30px;
">
CERTIFICATE UPDATE
</div>

<h2 style="
margin:0 0 24px;
font-size:40px;
line-height:1.2;
font-weight:700;
color:#1f2937;
letter-spacing:-1px;
">
Your Updated Certificate is Ready
</h2>

<p style="
margin:0 0 22px;
font-size:17px;
line-height:1.9;
color:#64748b;
">
Hello,
</p>

<p style="
margin:0 0 22px;
font-size:17px;
line-height:1.9;
color:#64748b;
">
We have an updated certificate available for you.
</p>

<p style="
margin:0 0 35px;
font-size:17px;
line-height:1.9;
color:#64748b;
">
Please log in to your dashboard and download the latest version from the
<strong style="color:#2f855a;">Achievements</strong>
section at your convenience.
</p>

<div style="
background:linear-gradient(135deg,#f8fcf9,#eefbf2);
border:1px solid #d8f3dc;
border-radius:18px;
padding:24px;
margin:35px 0;
">

<p style="
margin:0;
font-size:15px;
line-height:1.9;
color:#4b5563;
">
Thank you for being a part of the SARTHI community. We sincerely appreciate your dedication to learning, growth, and continuous improvement. Your achievements inspire us to keep building opportunities for future innovators.
</p>

</div>

<div style="text-align:center;margin:45px 0;">

<a href="https://sarthi-woad.vercel.app/dashboard"
style="
display:inline-block;
background:#57b26a;
color:#ffffff;
text-decoration:none;
padding:16px 38px;
border-radius:14px;
font-size:16px;
font-weight:600;
box-shadow:0 10px 25px rgba(87,178,106,0.20);
">
Access Dashboard
</a>

</div>

<p style="
margin-top:45px;
font-size:16px;
line-height:1.8;
color:#64748b;
">
Warm regards,
</p>

<p style="
margin-top:8px;
font-size:16px;
font-weight:700;
color:#1f2937;
">
SARTHI Team
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="
padding:35px;
text-align:center;
background:#fafdfb;
border-top:1px solid #eef7f0;
">

<p style="
margin:0 0 10px;
font-size:14px;
color:#64748b;
">
Building Skills. Creating Opportunities. Empowering Futures.
</p>

<p style="
margin:0;
font-size:13px;
color:#94a3b8;
">
© 2026 SARTHI. All Rights Reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;

  const mailOptions = {
    from: `"SARTHI" <${user}>`,
    to: EMAIL_TO,
    subject: '🎓 Your Updated Certificate is Ready for Download',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
  }
}

main();
