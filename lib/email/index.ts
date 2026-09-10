import { queueEmail } from './queue';
import { getBaseTemplate } from './templates/base';
import { getBrandedTemplate } from './templates/branded';
import { emailEnv } from '../env/email';

// Transactional Templates
export const templates = {
  welcome: (name: string) => ({
    type: 'notification' as const,
    subject: 'Welcome to SARTHI!',
    html: getBaseTemplate(
        `<p>Hi ${name},</p><p>We're thrilled to have you join our world-class faculty. Your journey to transforming technical education starts here.</p>`,
        'Welcome to SARTHI',
        { label: 'Go to Dashboard', url: `${emailEnv.APP_URL}/dashboard` }
    ),
  }),

  passwordReset: (url: string) => ({
    type: 'password-reset' as const,
    subject: '🔐 Secure action required: Reset your password',
    html: getBaseTemplate(
        `<p>We received a request to reset your password for your SARTHI account. If you didn't make this request, you can safely ignore this email.</p>
         <p style="font-size: 13px; color: #94a3b8; font-style: italic;">This link is valid for 1 hour for security purposes.</p>`,
        'Password Reset',
        { label: 'Reset My Password', url }
    ),
  }),

  receipt: (userName: string, courseName: string, amount: number, transactionId: string, date: string) => ({
    type: 'receipt' as const,
    subject: `Payment Receipt: ${courseName}`,
    html: getBaseTemplate(
        `<p>Hi ${userName},</p>
         <p>Thank you for your investment in learning. Your purchase of <strong>${courseName}</strong> has been processed successfully.</p>
         <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0; color: #64748b; font-size: 13px;">Amount Paid</td>
                    <td style="padding: 12px 0; color: #1a3c2e; font-size: 16px; font-weight: 800; text-align: right;">₹${amount}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0; color: #64748b; font-size: 13px;">Transaction ID</td>
                    <td style="padding: 12px 0; color: #1a3c2e; font-size: 13px; font-family: monospace; text-align: right;">${transactionId}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #64748b; font-size: 13px;">Date</td>
                    <td style="padding: 12px 0; color: #1a3c2e; font-size: 13px; text-align: right;">${date}</td>
                </tr>
            </table>
        </div>`,
        'Payment Receipt',
        { label: 'Access Your Course', url: `${emailEnv.APP_URL}/dashboard` }
    ),
  }),

  invitation: (name: string, url: string) => ({
    type: 'notification' as const,
    subject: 'Welcome to SARTHI! Set up your account',
    html: getBaseTemplate(
        `<p>Hi ${name},</p>
         <p>An administrator has created an account for you on the SARTHI platform. To get started and set your password, please use the secure link below.</p>
         <p style="font-size: 12px; color: #94a3b8; font-style: italic;">This link will expire in 7 days for security purposes.</p>`,
        'Invitation to Join',
        { label: 'Set My Password', url }
    ),
  }),

  enrollmentConfirmed: (name: string, courseName: string, enrollmentCode: string, learnUrl: string, invoiceId: string) => ({
    type: 'enrollment' as const,
    subject: `🎉 You're enrolled in ${courseName}!`,
    html: getBaseTemplate(
        `<p>Hi ${name},</p>
         <p>Welcome to <strong>${courseName}</strong>! Your learning journey starts now. We're thrilled to have you as a student.</p>
         <div style="background: #f8fdf9; border: 1px solid #d1fae5; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <p style="color: #1B4332; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px;">Enrollment Details</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Course</td>
                <td style="color: #1a3c2e; font-size: 14px; font-weight: 700; text-align: right;">${courseName}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Enrollment Code</td>
                <td style="color: #1a3c2e; font-size: 14px; font-weight: 700; text-align: right; font-family: monospace;">${enrollmentCode}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Invoice</td>
                <td style="color: #1a3c2e; font-size: 14px; font-weight: 700; text-align: right; font-family: monospace;">${invoiceId}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Access</td>
                <td style="color: #22c55e; font-size: 14px; font-weight: 700; text-align: right;">Lifetime ♾️</td>
              </tr>
            </table>
          </div>`,
        'Enrollment Confirmed',
        { label: 'Start Learning Now', url: learnUrl }
    ),
  }),

  blogWriterApproval: (name: string) => ({
    type: 'notification' as const,
    subject: '🎉 Congratulations! You are now a SARTHI Blog Writer',
    html: getBaseTemplate(
        `<p>Hi ${name},</p>
         <p>Your application for the Blog Writer Induction Programme has been <strong>approved</strong>. You can now start drafting your first post and submitting it for review.</p>
         <div style="margin: 32px 0; padding: 24px; background: rgba(27, 67, 50, 0.05); border-radius: 16px; border-left: 4px solid #1B4332;">
            <h3 style="color: #1B4332; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What's Next?</h3>
            <ul style="color: #475569; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                <li>Log in to your dashboard</li>
                <li>Go to the "My Blogs" section</li>
                <li>Submit your first draft for review</li>
            </ul>
        </div>`,
        'Welcome to the Team',
        { label: 'Go to Dashboard', url: `${emailEnv.APP_URL}/dashboard` }
    ),
  }),

  blogPostStatus: (title: string, status: string, adminNote?: string) => ({
    type: 'notification' as const,
    subject: `Update on your blog: ${title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 24px; padding: 48px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 24px;">Blog Status Update</h2>
        <p style="font-size: 16px; color: rgba(255,255,255,0.7);">Your post "<strong>${title}</strong>" has been updated to: <span style="color: #D4A017; font-weight: bold; text-transform: uppercase;">${status.replace('_', ' ')}</span></p>
        ${adminNote ? `
        <div style="margin: 32px 0; padding: 24px; background: rgba(255,165,0,0.05); border-left: 4px solid #D4A017; border-radius: 4px;">
            <p style="font-size: 12px; font-weight: 900; color: #D4A017; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Admin Feedback</p>
            <p style="color: rgba(255,255,255,0.6); margin-bottom: 0; line-height: 1.6;">${adminNote}</p>
        </div>
        ` : ''}
        <a href="https://sarthi-woad.vercel.app/dashboard" style="display: inline-block; background: rgba(255,255,255,0.1); color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">View in Dashboard</a>
      </div>
    `,
  }),

  certificateDelivery: (name: string, courseName: string, certificateId: string) => ({
    type: 'certificate' as const,
    subject: `🎓 Your Certificate for ${courseName} is here!`,
    html: `
      <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #fffaf0; border: 8px double #d4a017; padding: 60px 40px; text-align: center; color: #1a3c2e;">
        <div style="margin-bottom: 40px; opacity: 0.1; font-size: 80px; position: absolute; top: 20px; left: 50%; transform: translateX(-50%); pointer-events: none;">
           SARTHI
        </div>

        <h3 style="text-transform: uppercase; letter-spacing: 4px; font-weight: 300; margin-bottom: 10px;">Certificate of Completion</h3>
        <hr style="width: 100px; border: 0; border-top: 2px solid #d4a017; margin: 0 auto 40px;">

        <p style="font-style: italic; font-size: 18px; margin-bottom: 20px;">This certifies that</p>
        <h1 style="font-size: 42px; font-weight: 900; color: #1a3c2e; margin: 0 0 20px;">${name}</h1>

        <p style="font-style: italic; font-size: 18px; margin-bottom: 40px;">has successfully completed all requirements for the professional course</p>

        <h2 style="font-size: 28px; font-weight: 800; color: #2d6a4f; margin-bottom: 50px;">${courseName}</h2>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; padding: 0 20px;">
          <div style="text-align: left;">
            <p style="font-size: 12px; margin: 0;">Date Issued</p>
            <p style="font-size: 14px; font-weight: bold; border-top: 1px solid #1a3c2e; padding-top: 5px;">${new Date().toLocaleDateString()}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; margin: 0;">Certificate ID</p>
            <p style="font-size: 14px; font-weight: bold; font-family: monospace; border-top: 1px solid #1a3c2e; padding-top: 5px;">${certificateId}</p>
          </div>
        </div>

        <div style="margin-top: 60px;">
            <p style="font-size: 13px; color: #718096;">Verified by SARTHI Academic Board</p>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #718096; font-size: 12px; font-family: sans-serif;">
         <p>A PDF version of this certificate is attached to this email.</p>
      </div>
    `,
  }),

  credentialClaim: (name: string, licenseId: string, verificationUrl: string, certificationName: string) => ({
    type: 'notification' as const,
    subject: `Action Required: Claim your ${certificationName} Credential`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #E2E8F0; }
          .header { background-color: #0F172A; padding: 60px 40px; text-align: center; background-image: radial-gradient(circle at top right, #1E293B, #0F172A); }
          .logo-badge { background-color: #10B981; color: #ffffff; display: inline-block; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { color: #94A3B8; font-size: 16px; margin-top: 12px; font-weight: 500; }
          .content { padding: 40px; }
          .credential-box { background-color: #F8FAFC; border-radius: 24px; padding: 32px; border: 1px solid #EDF2F7; margin: 32px 0; }
          .cred-item { margin-bottom: 20px; }
          .cred-item:last-child { margin-bottom: 0; }
          .cred-label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
          .cred-value { font-size: 16px; font-weight: 800; color: #0F172A; font-family: monospace; }
          .action-button { display: inline-block; background-color: #0F172A; color: #ffffff !important; padding: 20px 40px; border-radius: 16px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; margin-top: 24px; box-shadow: 0 10px 20px rgba(15,23,42,0.2); }
          .footer { background-color: #F8FAFC; padding: 40px; text-align: center; border-top: 1px solid #F1F5F9; }
          .footer p { color: #94A3B8; font-size: 12px; line-height: 1.6; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-badge">Professional Credential</div>
            <h1>Certification Unlocked</h1>
            <p>Your official license is ready to be claimed</p>
          </div>
          <div class="content">
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">Hello <strong>${name}</strong>,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 12px;">Congratulations on achieving your <strong>${certificationName}</strong>. Your professional credential has been verified and is ready for activation.</p>
            
            <div class="credential-box">
              <div class="cred-item">
                <div class="cred-label">Candidate Name</div>
                <div class="cred-value">${name}</div>
              </div>
              <div class="cred-item">
                <div class="cred-label">Certification ID</div>
                <div class="cred-value">${licenseId}</div>
              </div>
              <div class="cred-item">
                <div class="cred-label">Status</div>
                <div style="background: #1B4332; color: #ffffff; padding: 4px 12px; border-radius: 8px; font-size: 14px; display: inline-block; margin-top: 4px; font-weight: bold;">Ready for Activation</div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="action-button">Claim Your Credential</a>
            </div>

            <p style="color: #94A3B8; font-size: 13px; text-align: center; margin-top: 24px; font-style: italic;">
              Alternatively, you can copy and paste this link to verify:<br/>
              <a href="${verificationUrl}" style="color: #1B4332;">${verificationUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>SARTHI Academic Board • Professional Certification</p>
            <p style="margin-top: 8px;">Automated Credential Dispatch</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  verification: (url: string) => ({
    type: 'verification' as const,
    subject: '🛡️ Action Required: Verify your SARTHI identity',
    html: getBaseTemplate(
        `<p>Welcome to the SARTHI ecosystem. To ensure the security of your account and enable your learning dashboard, please confirm your email address below:</p>
         <div style="background: #f8fafc; border-radius: 16px; padding: 20px; text-align: center; border: 1px dashed #e2e8f0; margin-top: 24px;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              If the button above does not work, copy and paste this link: <br/>
              <a href="${url}" style="color: #2d6a4f; word-break: break-all;">${url}</a>
            </p>
          </div>`,
        'Verify Identity',
        { label: 'Confirm My Identity', url }
    ),
  }),

  teacherApplicationReceived: (name: string) => ({
    type: 'application' as const,
    subject: 'Application Received: Become a Teacher at SARTHI',
    html: getBaseTemplate(
        `<p>Hi ${name},</p>
         <p>Thank you for applying to become a teacher at <strong>SARTHI</strong>! We have received your application and our team is currently reviewing your credentials.</p>
         <div style="margin: 30px 0; padding: 24px; background: rgba(27, 67, 50, 0.05); border-radius: 16px; border-left: 4px solid #1B4332;">
          <h3 style="color: #1B4332; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What happens next?</h3>
          <ul style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px;">
            <li>Our academic board will review your experience and documents.</li>
            <li>This usually takes 2-3 business days.</li>
            <li>You'll receive an email as soon as a decision is made.</li>
          </ul>
        </div>
        <p style="color: #64748b; font-size: 14px;">In the meantime, you can track your application status on your dashboard.</p>`,
        'Application Received',
        { label: 'View Dashboard', url: `${emailEnv.APP_URL}/dashboard` }
    ),
  }),

  teacherApproved: (name: string, email: string) => ({
    type: 'application' as const,
    subject: 'SARTHI Instructor Access Approved',
    html: getBrandedTemplate({
      badge: 'INSTRUCTOR ACCESS APPROVED',
      heading: 'Your Instructor Account is Ready',
      body: `Hello <strong>${name}</strong>,<br/><br/>Your instructor account has been approved successfully.<br/><br/>You can now access the <strong>SARTHI Teacher Dashboard</strong>.<br/><br/><div style="background: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #e2e8f0; margin: 25px 0; text-align: left;"><div style="margin: 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Login Email</div><div style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: monospace;">${email}</div></div><br/>If you registered using Google Sign-In, simply sign in with Google using the same email.`,
      action: {
        label: 'Enter Teacher Dashboard',
        url: `${emailEnv.APP_URL}/teacher/dashboard`
      },
      senderName: 'SARTHI Academic Directorate & Operations Team'
    }),
  }),

  teacherAccountReady: (name: string, officialEmail: string, tempPassword: string, facultyId: string, setupToken: string) => ({
    type: 'application' as const,
    subject: '🛡️ SECURE: Your SARTHI Institutional Access & Keys',
    html: getBrandedTemplate({
      badge: 'FACULTY APPOINTMENT CONFIRMED',
      heading: 'Welcome to SARTHI Faculty Network',
      body: `Hello <strong>${name}</strong>,<br/><br/>We are pleased to inform you that your application as an Instructor & Faculty Member at SARTHI has been officially approved.<br/><br/>Your institutional faculty workspace and course creation privileges are now fully active. You have been granted access to our mission control instructor portal.<br/><br/><strong>Your Institutional Access Credentials:</strong><div style="background: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #e2e8f0; margin: 25px 0; text-align: left;"><div style="margin-bottom: 15px;"><div style="margin: 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Professional ID</div><div style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: monospace;">${facultyId}</div></div><div style="margin-bottom: 15px;"><div style="margin: 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Official Faculty Email</div><div style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: monospace;">${officialEmail}</div></div><div style="margin-bottom: 0;"><div style="margin: 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Temporary Access Password</div><div style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #2f855a; font-family: monospace; background: #eefbf2; display: inline-block; padding: 4px 12px; border-radius: 8px;">${tempPassword}</div></div></div>`,
      highlight: `<strong>Getting Started:</strong><br/>1. Navigate to the SARTHI Login Portal.<br/>2. Sign in using your registered email and temporary access key above.<br/>3. Access your Instructor Dashboard to design curriculum, launch live classes, and manage students.<br/><br/><em>Security Requirement: For security compliance, please change your temporary password upon your first successful login under your Account Settings.</em>`,
      action: {
        label: 'Log In to Faculty Portal',
        url: 'https://sarthi-woad.vercel.app/login'
      },
      senderName: 'SARTHI Academic Directorate & Operations Team'
    })
  }),

  teacherRejected: (name: string, reason: string) => ({
    type: 'application' as const,
    subject: 'Update regarding your Teacher Application',
    html: getBaseTemplate(
        `<p>Hi ${name},</p>
         <p>Thank you for your patience while we reviewed your application. Unfortunately, we cannot proceed with your teacher profile at this time.</p>
         <div style="margin: 24px 0; padding: 20px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 12px;">
           <p style="color: #991b1b; font-weight: 800; font-size: 12px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Reason for Decision</p>
           <p style="color: #b91c1c; font-size: 14px; margin-bottom: 0; line-height: 1.6;">${reason}</p>
         </div>
         <p style="color: #64748b; font-size: 14px;">You are welcome to re-apply once the requirements above are met.</p>`,
        'Application Update',
        { label: 'Contact Support', url: `mailto:support@sarthi.in` }
    ),
  }),

  teacherChangesRequested: (name: string, notes: string) => ({
    type: 'application' as const,
    subject: 'Revision requested for your Teacher Application',
    html: getBaseTemplate(
        `<p>Hi ${name},</p>
         <p>Our team has reviewed your application to join the SARTHI Faculty Network. We need a few updates or clarifications before we can approve your profile.</p>
         <div style="margin: 24px 0; padding: 20px; background: #fefcbf; border-left: 4px solid #ecc94b; border-radius: 12px;">
           <p style="color: #744210; font-weight: 800; font-size: 12px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Feedback from Reviewer</p>
           <p style="color: #744210; font-size: 14px; margin-bottom: 0; line-height: 1.6;">${notes}</p>
         </div>
         <p style="color: #64748b; font-size: 14px;">Please sign in and click "Revise Application" to update your details and resubmit.</p>`,
        'Revision Requested',
        { label: 'Revise Application', url: `${emailEnv.APP_URL}/teach/apply/status` }
    ),
  }),

  teacherSuspended: (name: string) => ({
    type: 'application' as const,
    subject: 'Important notification regarding your Instructor Account',
    html: getBaseTemplate(
        `<p>Hi ${name},</p>
         <p>Please be notified that your instructor status at SARTHI has been suspended by an administrator.</p>
         <p>While suspended, you will not be able to access the instructor dashboard, schedule classes, or publish courses.</p>
         <p style="color: #64748b; font-size: 14px;">If you believe this is in error, or wish to appeal this decision, please contact admin support.</p>`,
        'Account Suspended',
        { label: 'Contact Support', url: `mailto:support@sarthi.in` }
    ),
  }),
};

/**
 * Global entry point for sending emails. 
 * Decides whether to send immediately or queue based on configuration.
 */
export async function sendEmail(payload: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  type?: any;
  attachments?: any[];
}) {
    // For transactional safety, we use the queue by default
    return queueEmail({
        ...payload,
        type: payload.type || 'notification'
    });
}

export async function sendSeminarConfirmationEmail({
  email,
  userName = "Attendee",
  seminarTitle,
  startTime,
  joinLink,
}: {
  email: string;
  userName?: string;
  seminarTitle: string;
  startTime: string | Date | null;
  joinLink: string | null;
}) {
  const formattedTime = startTime ? new Date(startTime).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short'
  }) : 'To Be Announced';

  const html = getBrandedTemplate({
    badge: 'SEMINAR REGISTRATION CONFIRMED',
    heading: `Registration Confirmed: ${seminarTitle}`,
    body: `Hi **${userName}**,

Thanks for registering for **${seminarTitle}**! 🚀

Your seat has been successfully reserved. Your official payment receipt and tax invoice will be shared with you shortly.

We look forward to seeing you at the live masterclass!`,
    highlight: `📅 **Session Time**: ${formattedTime}\n\n📍 **Access Details**: Click the button below to join the live session or access it anytime from your student dashboard.`,
    action: {
      label: 'Join Live Seminar',
      url: joinLink || `${emailEnv.APP_URL}/dashboard`
    },
    senderName: 'SARTHI Masterclass Team'
  });

  return sendEmail({
    to: email,
    type: 'notification',
    subject: `Registration Confirmed: ${seminarTitle} | SARTHI`,
    html,
  });
}

// Verification Email Sender
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${emailEnv.APP_URL}/verify?token=${token}`;
  const { subject, html, type } = templates.verification(verificationUrl);
  return sendEmail({ to: email, subject, html, type });
}
