import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

function buildMarklyEmailHtml(internName: string, domain: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Project Markly - Core Development Sprint</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; max-width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 35px 35px 30px; background: linear-gradient(135deg, #020617 0%, #0f172a 100%); text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #FBBF24; letter-spacing: 1px;">SARTHI</h2>
              <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Targeted Task Assignment: Project Markly</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 35px 25px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #1e293b; line-height: 1.6;">Hi <strong>${internName}</strong> 👋,</p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #334155; line-height: 1.7;">
                As a Web Development / Software Development Intern from <strong>IILM University</strong>, you have been assigned your core development sprint on <strong>Markly</strong> — SARTHI's flagship AI-powered examination creation & evaluation operating system.
              </p>

              <!-- Role & Track Card -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; border-left: 4px solid #FBBF24; margin-bottom: 25px;">
                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b;">Assigned Track / Domain</p>
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 800; color: #0f172a;">${domain}</p>
                
                <h4 style="margin: 10px 0 6px; font-size: 14px; color: #0f172a;">🔗 Key Resources:</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.8;">
                  <li><strong>GitHub Repository:</strong> <a href="https://github.com/mohitraj8503/Markly" style="color: #2563eb; text-decoration: none;">https://github.com/mohitraj8503/Markly</a></li>
                  <li><strong>Live Demo Preview:</strong> <a href="https://markly.mohitraj8503.workers.dev/templates" style="color: #2563eb; text-decoration: none;">https://markly.mohitraj8503.workers.dev/templates</a></li>
                  <li><strong>Full Task Brief & Setup:</strong> <a href="https://github.com/mohitraj8503/Markly/blob/main/INTERN_ONBOARDING_AND_WEEKLY_TASKS.md" style="color: #2563eb; text-decoration: none;">INTERN_ONBOARDING_AND_WEEKLY_TASKS.md</a></li>
                </ul>
              </div>

              <!-- About Markly -->
              <h3 style="margin: 0 0 10px; font-size: 16px; color: #0f172a;">💡 What is Markly About?</h3>
              <p style="margin: 0 0 15px; font-size: 14px; color: #475569; line-height: 1.7;">
                Traditional grading takes teachers 30–50 hours every exam cycle. Generic AI tools fail because they act as opaque "black boxes" that give arbitrary final marks without explaining intermediate credit.
              </p>
              <div style="background-color: #faf8f3; border: 1px solid #dedad0; padding: 15px 18px; border-radius: 10px; font-size: 13px; color: #1c1c1e; font-style: italic; margin-bottom: 25px;">
                "AI reads the paper, extracts step-wise process evidence, awards granular partial credit, and the teacher retains 100% final authority to verify or adjust."
              </div>

              <!-- Tasks Allocation -->
              <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">🎯 Your Track Deliverables:</h3>

              <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px; font-size: 14px; color: #1e293b;">Frontend & UI/UX Engineers (Web Dev Interns):</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                  <li>Enhance the live A4 Template Preview (CBSE, State Board, University formats) in <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">src/app/templates/page.tsx</code>.</li>
                  <li>Add pan/zoom and red-pen audit pin annotations on handwritten answer crops in <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">src/app/grade/page.tsx</code>.</li>
                  <li>Assemble question sets directly from Question Bank in <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">src/app/questions/page.tsx</code>.</li>
                </ul>
              </div>

              <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px; font-size: 14px; color: #1e293b;">Backend & Database Engineers (Software Dev Interns):</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                  <li>Set up PostgreSQL production connection and migrations from <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">prisma/schema.postgresql.prisma</code>.</li>
                  <li>Build Audit Trail PDF/CSV export for teacher score overrides in <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">src/app/api/evaluations/[id]/review/route.ts</code>.</li>
                  <li>Implement batch upload endpoint (<code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">POST /api/submissions/batch</code>) for multiple student PDF scans.</li>
                </ul>
              </div>

              <!-- Quick Setup -->
              <div style="background-color: #0f172a; color: #f8fafc; padding: 18px 20px; border-radius: 10px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 10px; font-size: 13px; color: #FBBF24; text-transform: uppercase; letter-spacing: 1px;">⚡ Quick Localhost Setup (2 Minutes):</h4>
                <pre style="margin: 0; font-family: monospace; font-size: 12px; line-height: 1.6; color: #38bdf8;">git clone https://github.com/mohitraj8503/Markly.git
cd Markly
npm install
npx prisma db push && npx prisma generate
npx tsx prisma/seed.ts
npm run dev</pre>
              </div>

              <!-- Rules -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 15px 18px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 8px; font-size: 13px; color: #991b1b; text-transform: uppercase;">⚠️ Non-Negotiable Rules:</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #7f1d1d; line-height: 1.6;">
                  <li><strong>ZERO hardcoded mock data</strong> — everything connects to the real Prisma database.</li>
                  <li>Follow the 5-token physical paper palette (<code style="background-color: #fee2e2; padding: 2px 4px; border-radius: 4px;">#FAF8F3</code>, <code style="background-color: #fee2e2; padding: 2px 4px; border-radius: 4px;">#1C1C1E</code>, <code style="background-color: #fee2e2; padding: 2px 4px; border-radius: 4px;">#26415C</code>, <code style="background-color: #fee2e2; padding: 2px 4px; border-radius: 4px;">#B23A2E</code>, <code style="background-color: #fee2e2; padding: 2px 4px; border-radius: 4px;">#5C7A5C</code>).</li>
                </ul>
              </div>

              <p style="margin: 0 0 20px; font-size: 14px; color: #334155; line-height: 1.6;">
                This assignment is live on your SARTHI Intern Dashboard. Please review your task, clone the repo, and reach out on the mentor group if you have any questions!
              </p>

              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="https://sarthi-woad.vercel.app/dashboard/internship" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">View Task in Intern Dashboard</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 35px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #334155;">Mohit Raj</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Lead Architect & Internship Mentor, SARTHI</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendTargetedEmails() {
  console.log('🔍 Filtering IILM Web Dev & Software Dev interns without completion letters...');

  const iilmApps = await prisma.internshipApplication.findMany({
    where: {
      college: { contains: 'IILM' },
      domain: { in: ['Web Development', 'Full Stack Web Development', 'Software Development'] },
      status: { in: ['APPROVED', 'OFFER_ACCEPTED'] }
    }
  });

  // Filter out any who already have issued certificates
  const issuedCerts = await prisma.issuedCertificate.findMany({});
  const issuedUserIds = new Set(issuedCerts.map(c => c.userId));

  const targetList = iilmApps.filter(a => !issuedUserIds.has(a.studentId));

  console.log(`\nFound ${targetList.length} targeted IILM interns for Project Markly email:`);
  for (const t of targetList) {
    console.log(` - ${t.name} (${t.email}) | ${t.domain} | College: ${t.college}`);
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY missing in environment!');
    return;
  }

  const resend = new Resend(resendApiKey);

  console.log('\n📧 Starting targeted email dispatch via Resend...');

  for (const target of targetList) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [target.email],
        subject: `🚀 Task Assignment: Project Markly (AI Examination & Step-Wise Evaluation Platform)`,
        html: buildMarklyEmailHtml(target.name, target.domain || 'Web Development')
      });

      if (error) {
        console.error(` ❌ Failed sending to ${target.email}:`, error);
      } else {
        console.log(` ✅ Sent to ${target.name} (${target.email}) | Resend ID: ${data?.id}`);
      }
    } catch (e: any) {
      console.error(` ❌ Error for ${target.email}:`, e.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Targeted Project Markly email dispatch completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

sendTargetedEmails()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
