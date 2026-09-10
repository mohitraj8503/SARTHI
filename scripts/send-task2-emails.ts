import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

function buildTaskEmailHtml(internName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SARTHI Mandatory Task Assignment</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">

<table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);max-width:100%;border:1px solid #e2e8f0;">

<!-- Header -->
<tr><td style="padding:36px 32px;text-align:center;background:linear-gradient(135deg,#06122e 0%,#0f2d5c 100%);">
  <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">
    SARTHI
  </h1>
  <p style="margin:8px 0 0;font-size:13px;color:#38bdf8;letter-spacing:1px;text-transform:uppercase;font-weight:700;">
    Mandatory Internship Task Assignment
  </p>
</td></tr>

<!-- Body -->
<tr><td style="padding:36px;">
  <p style="margin:0 0 16px;font-size:16px;color:#1e293b;line-height:1.6;">
    Hi <strong>${internName}</strong> 👋,
  </p>
  <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
    A new mandatory task has been assigned to your SARTHI Internship Dashboard.
  </p>

  <!-- Task Box -->
  <div style="background:#f1f5f9;border-left:4px solid #0284c7;border-radius:8px;padding:20px;margin-bottom:24px;">
    <h2 style="margin:0 0 10px;font-size:17px;color:#0f172a;">📢 Task 2 – Promote SARTHI on LinkedIn & Instagram</h2>
    <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Category:</strong> Mandatory Task</p>
    <p style="margin:0 0 8px;font-size:14px;color:#475569;"><strong>Reward:</strong> 300 XP</p>
    <p style="margin:0;font-size:14px;color:#475569;"><strong>Deadline:</strong> 5 Days from today</p>
  </div>

  <h3 style="margin:0 0 12px;font-size:15px;color:#0f172a;">What You Need to Do:</h3>
  <ol style="margin:0 0 20px;padding-left:20px;color:#334155;font-size:14px;line-height:1.7;">
    <li>Visit <a href="https://sarthi-woad.vercel.app" style="color:#0284c7;text-decoration:none;font-weight:600;">sarthi-woad.vercel.app</a> and select a program/course to promote.</li>
    <li>Design an original, minimal, and aesthetic promotional poster.</li>
    <li>Publish the poster on your <strong>LinkedIn Profile</strong> and <strong>Instagram Account</strong>.</li>
    <li>Tag <strong>@SARTHI</strong> (LinkedIn) and <strong>@sarthi-woad.vercel.app</strong> (Instagram).</li>
    <li>Submit your LinkedIn Post Link, Instagram Post Link, Canva/Figma Link, and Final Poster on your dashboard.</li>
  </ol>

  <div style="text-align:center;margin-top:30px;">
    <a href="https://sarthi-woad.vercel.app/dashboard" style="background:#0284c7;color:#ffffff;padding:14px 28px;text-decoration:none;font-weight:700;border-radius:8px;display:inline-block;font-size:15px;">
      Go to Internship Dashboard & Submit Task →
    </a>
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#64748b;">
  <p style="margin:0;">SARTHI Internship Program • <a href="https://sarthi-woad.vercel.app" style="color:#0284c7;text-decoration:none;">sarthi-woad.vercel.app</a></p>
</td></tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}

async function sendTaskEmails() {
  const activeMembers = await prisma.batchMember.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true }
  });

  console.log(`Sending Task 2 notification emails to ${activeMembers.length} active interns...`);

  let successCount = 0;
  let failCount = 0;

  for (const member of activeMembers) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [member.user.email],
        subject: `📢 New Task Assigned: Task 2 – Promote SARTHI on LinkedIn & Instagram`,
        html: buildTaskEmailHtml(member.user.name || 'Intern')
      });

      if (error) {
        console.error(`❌ Resend failed for ${member.user.email}:`, error);
        failCount++;
      } else {
        console.log(`✅ Email delivered to ${member.user.name} (${member.user.email}) | ID: ${data?.id}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception sending to ${member.user.email}:`, err.message);
      failCount++;
    }
  }

  console.log(`\nFinished! Sent: ${successCount}, Failed: ${failCount}`);
}

sendTaskEmails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
