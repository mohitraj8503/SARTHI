/**
 * Send onboarding email to Sabiha Siddiqui via SMTP (Nodemailer)
 * Run this script with:
 *   SMTP_USER="your-email@gmail.com" SMTP_PASS="your-app-password" node scripts/send-onboarding-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_TO = 'siddiquisabiha411@gmail.com';
const TEMP_PASSWORD = 'EliteExpert9696@';
const TEACHER_ID = 'TT-TCH-2026-0001';

async function main() {
  const user = process.env.SMTP_USER || 'admin@sarthi.in';
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465');

  if (!pass) {
    console.error('❌ Error: SMTP_PASS environment variable is required.');
    console.log('\nUsage example:');
    console.log('  SMTP_USER="admin@sarthi.in" SMTP_PASS="your-smtp-password" node scripts/send-onboarding-email.js');
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

  const setupUrl = 'https://sarthi-woad.vercel.app/login';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Plus Jakarta Sans', Arial, sans-serif; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.08); border: 1px solid #E2E8F0; }
        .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 56px 40px; text-align: center; }
        .badge { background: linear-gradient(135deg, #F59E0B, #D97706); color: #0F172A; display: inline-block; padding: 8px 20px; border-radius: 100px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
        .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #94A3B8; font-size: 15px; margin: 0; font-weight: 500; }
        .content { padding: 44px 40px; }
        .greeting { color: #0F172A; font-size: 18px; font-weight: 700; margin: 0 0 12px; }
        .subtext { color: #64748B; font-size: 15px; line-height: 1.7; margin: 0 0 36px; }
        .cred-box { background: #F8FAFC; border-radius: 24px; padding: 36px; border: 1px solid #E2E8F0; margin: 0 0 36px; }
        .cred-row { display: flex; align-items: flex-start; gap: 16px; padding: 16px 0; border-bottom: 1px solid #F1F5F9; }
        .cred-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cred-row:first-child { padding-top: 0; }
        .cred-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .cred-text { flex: 1; }
        .cred-label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 4px; }
        .cred-value { font-size: 16px; font-weight: 800; color: #0F172A; font-family: 'Courier New', monospace; margin: 0; word-break: break-all; }
        .password-pill { display: inline-block; background: linear-gradient(135deg, #1B4332, #2D6A4F); color: #ffffff; padding: 10px 20px; border-radius: 12px; font-size: 18px; font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 1px; }
        .btn-wrap { text-align: center; margin: 8px 0 36px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0F172A, #1E293B); color: #ffffff !important; padding: 18px 48px; border-radius: 100px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; box-shadow: 0 8px 24px rgba(15,23,42,0.3); }
        .warning-box { background: #FFFBEB; border-radius: 20px; padding: 24px; border: 1px solid #FDE68A; margin-bottom: 36px; }
        .warning-title { color: #92400E; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; }
        .warning-text { color: #B45309; font-size: 13px; line-height: 1.7; margin: 0; font-weight: 500; }
        .steps-box { background: #F0FDF4; border-radius: 20px; padding: 24px; border: 1px solid #BBF7D0; margin-bottom: 36px; }
        .steps-title { color: #166534; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px; }
        .step { display: flex; gap: 12px; margin-bottom: 12px; }
        .step:last-child { margin-bottom: 0; }
        .step-num { width: 24px; height: 24px; background: #22C55E; color: #fff; border-radius: 50%; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .step-text { color: #166534; font-size: 13px; line-height: 1.6; font-weight: 500; padding-top: 2px; }
        .footer { background: #F8FAFC; padding: 32px 40px; text-align: center; border-top: 1px solid #F1F5F9; }
        .footer p { color: #94A3B8; font-size: 12px; line-height: 1.6; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">🎓 Faculty Onboarding</div>
          <h1>Welcome to SARTHI!</h1>
          <p>Your instructor account is ready</p>
        </div>
        <div class="content">
          <p class="greeting">Hello Sabiha Siddiqui! 👋</p>
          <p class="subtext">
            This is the ID and password specially generated for you to access the SARTHI Faculty Network. 
            Once you log in, you can continue to edit your profile, upload details, and setup your courses.
          </p>

          <div class="cred-box">
            <div class="cred-row">
              <div class="cred-icon" style="background: #EFF6FF;">🪪</div>
              <div class="cred-text">
                <p class="cred-label">Faculty ID</p>
                <p class="cred-value">${TEACHER_ID}</p>
              </div>
            </div>
            <div class="cred-row">
              <div class="cred-icon" style="background: #F0FDF4;">📧</div>
              <div class="cred-text">
                <p class="cred-label">Login Email</p>
                <p class="cred-value">${EMAIL_TO}</p>
              </div>
            </div>
            <div class="cred-row">
              <div class="cred-icon" style="background: #FFFBEB;">🔑</div>
              <div class="cred-text">
                <p class="cred-label">One-Time Password</p>
                <div class="password-pill">${TEMP_PASSWORD}</div>
              </div>
            </div>
          </div>

          <div class="btn-wrap">
            <a href="https://sarthi-woad.vercel.app/login" class="btn">Login to Teacher Dashboard →</a>
          </div>

          <div class="steps-box">
            <p class="steps-title">✅ What to do next</p>
            <div class="step">
              <div class="step-num">1</div>
              <p class="step-text">Visit <strong>sarthi-woad.vercel.app/login</strong> and enter your email and the one-time password above.</p>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <p class="step-text">Set a new permanent password immediately after logging in.</p>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <p class="step-text">Complete your instructor profile, add biography details, and configure your course settings.</p>
            </div>
          </div>

          <div class="warning-box">
            <p class="warning-title">🚨 Security Notice</p>
            <p class="warning-text">
              This one-time password expires in <strong>7 days</strong>. You will be required to set a 
              permanent password on first login. Do not share these credentials with anyone.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>SARTHI Faculty Network • Secure Onboarding System</p>
          <p style="margin-top: 6px;">© 2026 SARTHI. You are receiving this because you applied to be an instructor.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"SARTHI Faculty Network" <${user}>`,
    to: EMAIL_TO,
    subject: '🎓 Welcome to SARTHI — Your Instructor Account is Ready',
    text: `Hello Sabiha Siddiqui,

This is the ID and password specially generated for you to access the SARTHI Faculty Network. Once you log in, you can continue to edit your profile, upload details, and setup your courses.

YOUR LOGIN CREDENTIALS
======================
Faculty ID     : ${TEACHER_ID}
Login Email    : ${EMAIL_TO}
One-Time Pass  : ${TEMP_PASSWORD}

LOGIN URL: https://sarthi-woad.vercel.app/login

Next Steps:
1. Log in immediately and set a new permanent password.
2. Complete your instructor profile and add details to it.

Welcome to the SARTHI Faculty!
— SARTHI Admin Team`,
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
