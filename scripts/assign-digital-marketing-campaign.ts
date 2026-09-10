import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

function buildDigitalMarketingEmailHtml(internName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Individual Campaign Assignment - Digital Marketing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; max-width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 35px 35px 30px; background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #FBBF24; letter-spacing: 1px;">SARTHI</h2>
              <p style="margin: 6px 0 0; font-size: 13px; color: #a5b4fc; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Individual Campaign Sprint: Digital Marketing</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 35px 25px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #1e293b; line-height: 1.6;">Hi <strong>${internName}</strong> 👋,</p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #334155; line-height: 1.7;">
                You have been assigned an <strong>Individual Growth & Digital Marketing Campaign Task</strong> on your SARTHI Intern Dashboard. Please review your deliverables and execute your campaign strategy below.
              </p>

              <!-- Task Overview Card -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; border-left: 4px solid #6366f1; margin-bottom: 25px;">
                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b;">Task Title</p>
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 800; color: #0f172a;">📢 Individual Growth Campaign: SARTHI Professional Certificate Drive</p>
                
                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b;">Reward & Reward Points</p>
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #16a34a;">+500 XP | Category: Individual Campaign | Difficulty: Hard</p>
              </div>

              <!-- Key Deliverables -->
              <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">🎯 Individual Campaign Deliverables:</h3>
              <ol style="margin: 0 0 25px; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.8;">
                <li><strong>5 High-Converting Social Copy Packages:</strong> Draft and publish 5 promotional posts across LinkedIn, Instagram, WhatsApp groups, and Facebook highlighting SARTHI Professional Certificates.</li>
                <li><strong>1 Carousel / Story Graphics Package:</strong> Design or curate a 3-5 slide carousel focusing on Resume Verification, Industry-Recognized Credentials, and Skill vs College Degree.</li>
                <li><strong>Lead Generation & Outreach:</strong> Target college students, job seekers, and freshers to drive traffic to <a href="https://sarthi-woad.vercel.app/pricing" style="color: #2563eb; text-decoration: none;">sarthi-woad.vercel.app</a>.</li>
                <li><strong>Proof of Work Submission:</strong> Submit post links, screenshots, engagement analytics, and lead metrics directly on your intern dashboard.</li>
              </ol>

              <!-- Guidelines -->
              <div style="background-color: #faf8f3; border: 1px solid #dedad0; padding: 15px 18px; border-radius: 10px; font-size: 13px; color: #1c1c1e; margin-bottom: 25px;">
                <strong>💡 Campaign Focus Tip:</strong> Emphasize that SARTHI certificates provide verified proof of project mastery, helping students stand out in resume screening.
              </div>

              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="https://sarthi-woad.vercel.app/dashboard/internship" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">View Task in Intern Dashboard</a>
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

async function main() {
  console.log('🚀 Assigning Individual Campaign Task to Digital Marketing & Social Media Interns...');

  const batch = await prisma.internshipBatch.findFirst({});
  if (!batch) {
    console.error('❌ No active batch found!');
    return;
  }

  const title = '📢 Individual Growth Campaign: SARTHI Professional Certificate Drive';
  const description = `# 📢 Individual Growth Campaign: SARTHI Professional Certificate Drive

**Role Focus:** Digital Marketing & Social Media Interns (Individual Execution)  
**Reward:** +500 XP  
**Category:** Individual Campaign  
**Difficulty:** Hard  
**Deadline:** 7 Days from Today  

---

## 📌 Campaign Objective
Drive organic visibility, engagement, and student enrollment for SARTHI Professional Certificates and Industry Courses across your personal and university social channels (LinkedIn, Instagram, WhatsApp, Facebook).

---

## 📋 Weekly Deliverables
1. **5 High-Converting Copy Packages**: Write and publish 5 original promotional posts highlighting certificate credibility, resume boost, and skill verification.
2. **1 Carousel / Creative Package**: Create or curate a 3–5 slide visual carousel on Instagram / LinkedIn explaining why verified certificates matter in 2026.
3. **Organic Outreach**: Share campaign materials with college student groups and freshers with clear call-to-action to https://sarthi-woad.vercel.app.
4. **Submission**: Upload your post links, screenshots, and lead metrics on the dashboard under this assignment.`;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);

  // 1. Create or Update Assignment in DB
  let assignment = await prisma.internshipAssignment.findFirst({
    where: { batchId: batch.id, title }
  });

  if (!assignment) {
    assignment = await prisma.internshipAssignment.create({
      data: {
        batchId: batch.id,
        title,
        description,
        category: 'Individual Campaign',
        difficulty: 'Hard',
        estimatedTime: '10 Hours',
        xpReward: 500,
        deadline,
        mode: 'INDIVIDUAL',
        status: 'active'
      }
    });
    console.log(`✅ Created Assignment in DB: ${assignment.id}`);
  } else {
    assignment = await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: { description, deadline, status: 'active' }
    });
    console.log(`✅ Updated Assignment in DB: ${assignment.id}`);
  }

  // 2. Find Digital Marketing Interns in batch members
  const dmApps = await prisma.internshipApplication.findMany({
    where: {
      OR: [
        { domain: { contains: 'Digital Marketing' } },
        { domain: { contains: 'Social Media' } },
        { domain: { contains: 'Marketing' } }
      ]
    }
  });

  const targetEmails = new Set(dmApps.map(a => a.email.toLowerCase()));

  // Ensure core roster DM interns (Jaanvi Nair & Nandini Katiyar) are included
  targetEmails.add('nairjaanvi199@gmail.com');
  targetEmails.add('nandinikatiyar5@gmail.com');

  const members = await prisma.batchMember.findMany({
    include: { user: true }
  });

  const targetMembers = members.filter(m => targetEmails.has(m.user.email.toLowerCase()));

  console.log(`\nFound ${targetMembers.length} Digital Marketing batch members:`);
  for (const tm of targetMembers) {
    console.log(` - ${tm.user.name} (${tm.user.email})`);
  }

  // 3. Assign on Dashboard
  for (const m of targetMembers) {
    await prisma.internshipAssignmentRecipient.upsert({
      where: {
        assignmentId_memberId: {
          assignmentId: assignment.id,
          memberId: m.id
        }
      },
      create: {
        assignmentId: assignment.id,
        memberId: m.id
      },
      update: {}
    });

    const existingSub = await prisma.internshipSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: m.id
      }
    });

    if (!existingSub) {
      await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId: m.id,
          status: 'Assigned'
        }
      });
    }

    console.log(` ✓ Task live on dashboard for: ${m.user.name} (${m.user.email})`);
  }

  // 4. Send Notification Emails
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    console.log('\n📧 Sending notification emails to Digital Marketing interns...');
    for (const m of targetMembers) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'SARTHI <admin@sarthi.in>',
          to: [m.user.email],
          subject: `📢 Individual Campaign Task Assigned: Digital Marketing Certificate Drive`,
          html: buildDigitalMarketingEmailHtml(m.user.name || 'Intern')
        });

        if (error) {
          console.error(` ❌ Email failed for ${m.user.email}:`, error);
        } else {
          console.log(` ✅ Email sent to ${m.user.name} (${m.user.email}) | Resend ID: ${data?.id}`);
        }
      } catch (e: any) {
        console.error(` ❌ Email error for ${m.user.email}:`, e.message);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Digital Marketing Individual Campaign Task Allocated & Sent!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
