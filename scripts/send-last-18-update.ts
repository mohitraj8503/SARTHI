import { sendTransactionalEmail } from '../lib/email/send';

const RECIPIENTS = [
  'ubaleharsh21@gmail.com',
  'sonampandit65@gmail.com',
  'smrutisneha66@gmail.com',
  'kanhapandit123@gmail.com',
  'shivamnischal79@gmail.com',
  'sajanmani08@gmail.com',
  'vivekkumar1610@gmail.com',
  'singhvaibhav1204@gmail.com',
  'thealpharaj@gmail.com',
  'priyankaashwani90@gmail.com',
  'patelkrina001@gmail.com',
  'rupamkumari0909@gmail.com',
  '1ayushsingh7@gmail.com',
  'pks527150@gmail.com',
  'shubhammohapatra021@gmail.com',
  'ashokpatel6277@gmail.com',
  'aditya29092003@gmail.com',
  'farhanahmed1001@gmail.com'
];

const subject = '🚀 Your Application is Under Review | SARTHI Internship';

function getEmailHtml(recipientEmail: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update</title>
</head>
<body style="margin:0; padding:0; background-color:#0B130E; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#E2E8F0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0B130E; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#121D16; border:1px solid #1B3324; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1B4332 0%, #081C15 100%); padding:36px 32px; text-align:center; border-bottom: 1px solid #2D6A4F;">
              <div style="display:inline-block; background-color:rgba(82, 183, 136, 0.15); border:1px solid #52B788; color:#74C69D; font-size:10px; font-weight:900; letter-spacing:2.5px; text-transform:uppercase; padding:6px 16px; border-radius:100px; margin-bottom:16px;">
                APPLICATION UPDATE
              </div>
              <h1 style="color:#FFFFFF; font-size:26px; font-weight:800; margin:0; letter-spacing:-0.5px; line-height:1.2;">
                Your Application is Under Personal Review
              </h1>
              <p style="color:#B7E4C7; font-size:13px; margin:8px 0 0 0; font-weight:500;">
                SARTHI Internship Cohort 2026
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="font-size:16px; color:#F1F5F9; font-weight:600; margin-top:0; margin-bottom:20px;">
                👋 Hello,
              </p>

              <p style="font-size:14px; color:#CBD5E1; line-height:1.7; margin-bottom:18px;">
                Thank you for applying to the <strong>SARTHI Internship Program</strong>.
              </p>

              <p style="font-size:14px; color:#CBD5E1; line-height:1.7; margin-bottom:24px;">
                We are currently reviewing applications for the upcoming <strong>2026 Cohort</strong>. Our lead mentors are personally reviewing every single submission to curate a team of passionate creators, Marketers, Advertisers, Content Writers, and Engineers ready to ship real work.
              </p>

              <!-- Personal Review Highlight Callout -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#162A1F; border-left:4px solid #52B788; padding:18px 20px; border-radius:0 14px 14px 0;">
                    <p style="margin:0; font-size:13px; color:#D8F3DC; font-weight:600; line-height:1.5;">
                      🚀 <strong>100% Personal Review:</strong> Every application is reviewed directly by our founders and mentors — no automated filters, keyword matchers, or bots.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Steps List -->
              <div style="background-color:#0E1711; border:1px solid #1B3324; border-radius:16px; padding:24px; margin-bottom:28px;">
                <p style="margin-top:0; margin-bottom:16px; font-size:14px; font-weight:800; color:#52B788; letter-spacing:0.5px; text-transform:uppercase;">
                  📋 What’s Next in the Process?
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="24" valign="top" style="font-size:14px; padding-bottom:12px;">•</td>
                    <td style="font-size:13px; color:#E2E8F0; line-height:1.5; padding-bottom:12px;">
                      <strong>Review Stage:</strong> Your profile & submission statement are actively being evaluated.
                    </td>
                  </tr>
                  <tr>
                    <td width="24" valign="top" style="font-size:14px; padding-bottom:12px;">•</td>
                    <td style="font-size:13px; color:#E2E8F0; line-height:1.5; padding-bottom:12px;">
                      <strong>Shortlisting:</strong> Shortlisted candidates will be contacted via email/call within the next few days.
                    </td>
                  </tr>
                  <tr>
                    <td width="24" valign="top" style="font-size:14px;">•</td>
                    <td style="font-size:13px; color:#E2E8F0; line-height:1.5;">
                      <strong>Day One Live Projects:</strong> Selected interns will be paired with mentors and begin working on active campaigns & client projects right away.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size:13px; color:#94A3B8; line-height:1.6; margin-bottom:28px;">
                While our team reviews your file, feel free to explore the internship portal to learn more about our tracks, policies, and project opportunities.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="https://sarthi-woad.vercel.app/internship" target="_blank" style="display:inline-block; background-color:#52B788; color:#081C15; font-size:14px; font-weight:900; text-decoration:none; padding:16px 36px; border-radius:12px; letter-spacing:0.5px; text-transform:uppercase; box-shadow:0 10px 20px -5px rgba(82, 183, 136, 0.4);">
                      Explore Internship Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; color:#CBD5E1; margin:0; line-height:1.6;">
                Thank you for choosing SARTHI.<br/>
                We look forward to connecting with you soon!
              </p>
            </td>
          </tr>

          <!-- Footer Signature -->
          <tr>
            <td style="background-color:#0B130E; padding:24px 32px; border-top:1px solid #1B3324; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:13px; font-weight:800; color:#52B788;">
                — Team SARTHI
              </p>
              <p style="margin:0; font-size:11px; color:#64748B;">
                SARTHI Pvt. Ltd. • Building Skills. Creating Opportunities. Empowering Futures.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendBatchEmails() {
  console.log(`🚀 Dispatching Application Update email to ${RECIPIENTS.length} applicants via Resend API...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const email of RECIPIENTS) {
    try {
      const html = getEmailHtml(email);
      const res = await sendTransactionalEmail({
        to: email,
        subject,
        html,
        type: 'application',
        provider: 'resend',
      });

      if (res.success !== false) {
        successCount++;
        console.log(`✅ [${successCount}/${RECIPIENTS.length}] Successfully sent to ${email}`);
      } else {
        failCount++;
        console.error(`❌ Failed sending to ${email}:`, res.error);
      }
    } catch (err: any) {
      failCount++;
      console.error(`💥 Exception sending to ${email}:`, err.message || err);
    }
  }

  console.log(`\n🎉 Dispatch Finished! Successfully delivered: ${successCount}/${RECIPIENTS.length} emails. Failures: ${failCount}`);
}

sendBatchEmails();
