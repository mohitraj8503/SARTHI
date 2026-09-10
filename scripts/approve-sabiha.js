/**
 * Approve Sabiha Siddiqui's teacher application
 * - Creates user account with temp password
 * - Tests credentials before sending
 * - Sends the full onboarding email
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

const prisma = new PrismaClient();

const APPLICATION_ID = 'cmpjsop2t00043yj0e4zqn8nv';
const EMAIL_TO = 'Siddiquisabiha411@gmail.com';
const EMAIL_TO_NORMALIZED = 'siddiquisabiha411@gmail.com';

// Generate a strong but readable temp password
function generateTempPassword() {
  const adj = ['Swift', 'Bright', 'Elite', 'Prime'];
  const noun = ['Mentor', 'Scholar', 'Expert', 'Guide'];
  const num = Math.floor(1000 + Math.random() * 9000);
  const sym = ['@', '#', '!', '*'][Math.floor(Math.random() * 4)];
  return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${num}${sym}`;
}

// Simple teacher ID generator (using current counter)
async function generateTeacherId() {
  const counter = await prisma.systemCounter.upsert({
    where: { id: 'TEACHER_SEQ' },
    update: { seq: { increment: 1 } },
    create: { id: 'TEACHER_SEQ', seq: 1 }
  });
  const seq = counter.seq;
  return `TT-TCH-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
}

async function main() {
  console.log('=== 🎓 SABIHA SIDDIQUI — TEACHER APPROVAL SCRIPT ===\n');

  // 1. Get the application
  const app = await prisma.teacherApplication.findUnique({
    where: { id: APPLICATION_ID },
    include: { education: true }
  });

  if (!app) {
    console.error('❌ Application not found!');
    return;
  }

  console.log(`📋 Application Found: ${app.fullName} (${app.email})`);
  console.log(`   Status: ${app.status}`);
  console.log(`   Headline: ${app.headline}\n`);

  // 2. Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email: EMAIL_TO_NORMALIZED } });
  if (existingUser) {
    console.log('⚠️  User already exists:', existingUser.id, '| Role:', existingUser.role);
    console.log('   Skipping account creation, will update...');
  }

  // 3. Generate credentials
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  const setupToken = crypto.randomBytes(32).toString('hex');
  const teacherId = await generateTeacherId();

  console.log('🔑 Credentials Generated:');
  console.log(`   Teacher ID  : ${teacherId}`);
  console.log(`   Email       : ${EMAIL_TO_NORMALIZED}`);
  console.log(`   Temp Pass   : ${tempPassword}`);
  console.log(`   Setup Token : ${setupToken.slice(0, 12)}...`);

  // 4. TEST: Verify password hash works before proceeding
  console.log('\n🧪 Testing credentials...');
  const testResult = await bcrypt.compare(tempPassword, hashedPassword);
  if (!testResult) {
    console.error('❌ CRITICAL: bcrypt test failed! Aborting.');
    return;
  }
  console.log('✅ bcrypt test PASSED — credentials are valid');

  // 5. Create/Update user account in a transaction
  console.log('\n🏗️  Creating/updating user account...');
  let userId;

  await prisma.$transaction(async (tx) => {
    let user;

    if (existingUser) {
      // Update existing user to instructor role
      user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'INSTRUCTOR',
          status: 'ACTIVE',
          password: hashedPassword,
          tempPassword: tempPassword,
          requiresPasswordChange: true,
          onboardingStatus: 'PENDING',
          passwordSetupToken: setupToken,
          passwordSetupExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          name: app.fullName,
          bio: app.bio,
          phone: app.phone,
        }
      });
    } else {
      // Create brand new user
      user = await tx.user.create({
        data: {
          email: EMAIL_TO_NORMALIZED,
          name: app.fullName,
          role: 'INSTRUCTOR',
          status: 'ACTIVE',
          password: hashedPassword,
          tempPassword: tempPassword,
          requiresPasswordChange: true,
          onboardingStatus: 'PENDING',
          passwordSetupToken: setupToken,
          passwordSetupExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          bio: app.bio,
          phone: app.phone,
          emailVerified: new Date(),
        }
      });
    }

    userId = user.id;
    console.log(`✅ User account ready: ${user.id} | ${user.email} | ${user.role}`);

    // Create Teacher record
    await tx.teacher.upsert({
      where: { userId: user.id },
      update: {
        status: 'verified',
        teacherId: teacherId,
        teacherEmail: EMAIL_TO_NORMALIZED,
        canCreateCourses: true,
        approvedAt: new Date(),
        title: app.headline || 'Instructor',
      },
      create: {
        userId: user.id,
        status: 'verified',
        teacherId: teacherId,
        teacherEmail: EMAIL_TO_NORMALIZED,
        canCreateCourses: true,
        approvedAt: new Date(),
        title: app.headline || 'Instructor',
      }
    });
    console.log(`✅ Teacher record created: ${teacherId}`);

    // Update application to APPROVED and link userId
    await tx.teacherApplication.update({
      where: { id: APPLICATION_ID },
      data: {
        status: 'APPROVED',
        userId: user.id,
        reviewedAt: new Date(),
        submittedAt: app.submittedAt || new Date(),
      }
    });
    console.log(`✅ Application APPROVED and linked to user`);
  });

  // 6. Verify login works — simulate auth query
  console.log('\n🔍 Final credential verification...');
  const savedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, password: true, role: true, status: true, tempPassword: true }
  });

  const finalTest = await bcrypt.compare(tempPassword, savedUser.password);
  if (!finalTest) {
    console.error('❌ CRITICAL: Saved password verification FAILED!');
    return;
  }
  console.log('✅ Login verification PASSED:');
  console.log(`   User ID   : ${savedUser.id}`);
  console.log(`   Email     : ${savedUser.email}`);
  console.log(`   Role      : ${savedUser.role}`);
  console.log(`   Status    : ${savedUser.status}`);
  console.log(`   Password  : ${tempPassword} ✓`);

  // 7. Send approval email
  console.log('\n📧 Sending approval email...');
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not found — skipping email send');
    console.log('\n📋 EMAIL THAT WOULD BE SENT:');
    console.log(`   To: ${EMAIL_TO_NORMALIZED}`);
    console.log(`   Subject: 🛡️ SECURE: Your SARTHI Institutional Access & Keys`);
    console.log(`   Faculty ID: ${teacherId}`);
    console.log(`   Email: ${EMAIL_TO_NORMALIZED}`);
    console.log(`   Password: ${tempPassword}`);
  } else {
    const resend = new Resend(RESEND_API_KEY);
    const setupUrl = `https://sarthi-woad.vercel.app/setup-account?token=${setupToken}`;

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
            <p class="greeting">Hello, ${app.fullName}! 👋</p>
            <p class="subtext">
              Congratulations! Your application to become an instructor at <strong>SARTHI</strong> has been 
              <strong style="color: #22C55E;">approved</strong>. Your account is set up and ready to go. 
              Please use the credentials below to log in for the first time.
            </p>

            <div class="cred-box">
              <div class="cred-row">
                <div class="cred-icon" style="background: #EFF6FF;">🪪</div>
                <div class="cred-text">
                  <p class="cred-label">Faculty ID</p>
                  <p class="cred-value">${teacherId}</p>
                </div>
              </div>
              <div class="cred-row">
                <div class="cred-icon" style="background: #F0FDF4;">📧</div>
                <div class="cred-text">
                  <p class="cred-label">Login Email</p>
                  <p class="cred-value">${EMAIL_TO_NORMALIZED}</p>
                </div>
              </div>
              <div class="cred-row">
                <div class="cred-icon" style="background: #FFFBEB;">🔑</div>
                <div class="cred-text">
                  <p class="cred-label">One-Time Password</p>
                  <div class="password-pill">${tempPassword}</div>
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
                <p class="step-text">Visit <strong>sarthi-woad.vercel.app/login</strong> and enter your email and the one-time password above</p>
              </div>
              <div class="step">
                <div class="step-num">2</div>
                <p class="step-text">Set a new permanent password immediately after logging in</p>
              </div>
              <div class="step">
                <div class="step-num">3</div>
                <p class="step-text">Complete your instructor profile and start creating your first course</p>
              </div>
            </div>

            <div class="warning-box">
              <p class="warning-title">🚨 Security Notice</p>
              <p class="warning-text">
                This one-time password expires in <strong>7 days</strong>. You will be required to set a 
                permanent password on first login. Do not share these credentials with anyone. 
                If you did not apply for this account, contact <a href="mailto:support@sarthi.in" style="color: #B45309;">support@sarthi.in</a> immediately.
              </p>
            </div>

            <p style="color: #94A3B8; font-size: 12px; text-align: center; font-style: italic;">
              Alternatively, complete your setup using the secure link:<br/>
              <a href="${setupUrl}" style="color: #2D6A4F; word-break: break-all; font-size: 11px;">${setupUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>SARTHI Faculty Network • Secure Onboarding System</p>
            <p style="margin-top: 6px;">© 2026 SARTHI. You are receiving this because you applied to be an instructor.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'SARTHI <noreply@sarthi-woad.vercel.app>',
      to: [EMAIL_TO_NORMALIZED],
      subject: '🎓 Welcome to SARTHI — Your Instructor Account is Ready',
      html: htmlContent,
      text: `Hello ${app.fullName},

Your instructor application at SARTHI has been APPROVED!

YOUR LOGIN CREDENTIALS
======================
Faculty ID     : ${teacherId}
Login Email    : ${EMAIL_TO_NORMALIZED}
One-Time Pass  : ${tempPassword}

LOGIN URL: https://sarthi-woad.vercel.app/login

IMPORTANT:
- Log in immediately and set a new permanent password
- This temporary password expires in 7 days
- Do NOT share these credentials with anyone

For setup via secure link: ${setupUrl}

Welcome to the SARTHI Faculty!
— SARTHI Admin Team`
    });

    if (error) {
      console.error('❌ Email send failed:', error);
    } else {
      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${data?.id}`);
      console.log(`   Sent to   : ${EMAIL_TO_NORMALIZED}`);
    }
  }

  // 8. Final summary
  console.log('\n' + '='.repeat(55));
  console.log('🎉 APPROVAL COMPLETE — SUMMARY');
  console.log('='.repeat(55));
  console.log(`  Name       : ${app.fullName}`);
  console.log(`  Email      : ${EMAIL_TO_NORMALIZED}`);
  console.log(`  Faculty ID : ${teacherId}`);
  console.log(`  Password   : ${tempPassword}`);
  console.log(`  Role       : INSTRUCTOR`);
  console.log(`  Status     : ACTIVE`);
  console.log(`  App Status : APPROVED`);
  console.log('='.repeat(55));
}

main().catch(console.error).finally(() => prisma.$disconnect());
