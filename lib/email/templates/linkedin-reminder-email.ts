/**
 * Branded LinkedIn Reminder Email Template for SARTHI
 * Encourages interns to add their LinkedIn profile URL to boost their leaderboard standing.
 */

export interface LinkedInReminderEmailOptions {
  recipientName: string;
  profileUrl?: string;
}

export function getLinkedInReminderEmailHtml(opts: LinkedInReminderEmailOptions): string {
  const {
    recipientName,
    profileUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/internship` 
      : 'https://sarthi-woad.vercel.app/dashboard/internship',
  } = opts;

  const firstName = recipientName ? recipientName.trim().split(' ')[0] : 'Scholar';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Add your LinkedIn to boost your SARTHI rank 🚀</title>
</head>
<body style="margin:0;padding:0;background:#F8FAF9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAF9;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="100%" maxWidth="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:24px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.03);">
        
        <!-- Header Banner -->
        <tr>
          <td style="background:linear-gradient(135deg, #0A2540 0%, #0077B5 100%);padding:36px 32px;text-align:left;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;padding:6px 14px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:20px;color:#FFFFFF;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">
                    🚀 LEADERBOARD & RANKINGS
                  </span>
                  <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">
                    Add Your LinkedIn to Boost Your Rank
                  </h1>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td style="padding:32px;color:#334155;">
            
            <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#0F172A;">
              Hi ${firstName}, 👋
            </p>

            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
              We noticed that your <strong>LinkedIn profile link</strong> is currently missing from your SARTHI Internship Portal.
            </p>

            <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-left:4px solid #0077B5;border-radius:16px;padding:20px;margin:24px 0;">
              <h3 style="margin:0 0 8px;font-size:14px;font-weight:800;color:#0369A1;text-transform:uppercase;letter-spacing:0.5px;">
                💡 Why Add Your LinkedIn ID?
              </h3>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#0C4A6E;">
                Your LinkedIn profile plays a key role in evaluating profile completeness, cohort rankings, and official certificate verification. Adding it takes <strong>less than 60 seconds</strong> and directly boosts your visibility on the Live Leaderboard!
              </p>
            </div>

            <!-- Steps Box -->
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:20px;margin:24px 0;">
              <h4 style="margin:0 0 12px;font-size:13px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:1px;">
                Quick Steps to Add It:
              </h4>
              <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#475569;">
                <li style="margin-bottom:6px;">Copy your public LinkedIn profile URL (e.g. <code>linkedin.com/in/yourname</code>).</li>
                <li style="margin-bottom:6px;">Click the button below to open your Student Portal profile settings.</li>
                <li>Paste your link and save!</li>
              </ol>
            </div>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 16px;">
              <tr>
                <td align="center">
                  <a href="${profileUrl}" target="_blank" style="display:inline-block;padding:16px 36px;background:#0077B5;color:#FFFFFF;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none;border-radius:16px;box-shadow:0 10px 25px rgba(0,119,181,0.25);">
                    Add Your LinkedIn ID →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748B;text-align:center;">
              If you have already updated your profile, thank you! Your rank updates automatically during daily syncs.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:800;color:#0F172A;letter-spacing:1px;text-transform:uppercase;">
              SARTHI Academic & Mentorship Cell
            </p>
            <p style="margin:0;font-size:11px;color:#94A3B8;">
              Empowering Scholars with Build-in-Public Engineering & Career Excellence
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
