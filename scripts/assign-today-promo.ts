import { PrismaClient } from '@prisma/client';
import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const taskTitle = "Mandatory: Independence Day & Data Science Course Promo";
const taskDescription = `Happy Independence Day! 🇮🇳 
Today is a special and mandatory promotion task for all interns (highly mandatory for Digital Marketing interns, and other tracks must also participate).

You are required to upload both SARTHI promotional creative banners to your social media stories (e.g. WhatsApp, Instagram, LinkedIn, Facebook, etc.):
1. SARTHI's 80th Independence Day wishes creative.
2. SARTHI's Data Science Course ₹1,999 (50% Off) special price drop offer.

Promotion Guidelines:
- Upload BOTH creatives to your WhatsApp Status, Instagram Story, or LinkedIn Story.
- If posting on Instagram or LinkedIn, make sure to tag SARTHI official handles.
- Add a positive, encouraging caption: e.g. "Celebrating India's 80th Independence Day with SARTHI! 🇮🇳 Also, checkout their amazing Data Science course drop. Join us today!"

Submission & Verification:
- Take screenshots of your posted stories/status.
- Submit the screenshot proof along with live links (if posted on public profiles) or upload them to Google Drive and submit the shared link here.`;

function buildEmailHtml(internName: string): string {
  const bodyHtml = `
<p style="margin:0 0 20px;font-size:16px;color:#1f2937;font-weight:700;">Good morning, ${internName} 👋</p>

<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
  Happy 80th Independence Day! Today, we have a unified and mandatory promotion task for all SARTHI interns.
</p>

<!-- CAMPAIGN CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:20px;margin-bottom:24px;">
  <tr>
    <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #E2E8F0;">
      <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1px;">SPECIAL CAMPAIGN — INDEPENDENCE DAY</span>
      <h2 style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0F172A;">${taskTitle}</h2>
    </td>
  </tr>
</table>

<!-- ACTIONS & GUIDELINES -->
<div style="margin-bottom:24px;">
  <p style="font-size:12px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Story Campaign Instructions</p>
  <div style="background:#FFFFFF;border-left:4px solid #1B4332;padding:12px 16px;border-radius:4px;font-size:14px;color:#334155;line-height:1.6;">
    1. Download the two promo assets attached to this email (or retrieve them from your student dashboard).<br />
    2. Upload them both to your WhatsApp Status, Instagram Story, or LinkedIn Story.<br />
    3. Tag SARTHI official handles if posting on public networks.<br />
    4. Submit screenshots of your stories/status on your dashboard.
  </div>
</div>

<!-- DETAILS -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;border-radius:12px;padding:16px;margin-bottom:24px;font-size:13px;color:#334155;line-height:1.5;">
  <tr>
    <td style="padding-bottom:10px;font-weight:700;width:30%;">Deliverable:</td>
    <td style="padding-bottom:10px;">WhatsApp/Instagram Stories (Dual banner)</td>
  </tr>
  <tr>
    <td style="padding-bottom:10px;font-weight:700;">Channel:</td>
    <td style="padding-bottom:10px;">Social Status / Stories</td>
  </tr>
  <tr>
    <td style="padding-bottom:10px;font-weight:700;">Success Measure:</td>
    <td style="padding-bottom:10px;">Both stories active for 24 Hours</td>
  </tr>
  <tr>
    <td style="font-weight:700;">Evidence Required:</td>
    <td>Screenshots of posted stories showing views or timestamp</td>
  </tr>
</table>
  `;

  return getBrandedTemplate({
    badge: "MANDATORY TODAY'S TASK",
    heading: taskTitle,
    body: bodyHtml,
    action: {
      label: 'Open Intern Dashboard',
      url: 'https://sarthi-woad.vercel.app/dashboard/internship',
    },
    senderName: 'SARTHI Admin Team'
  });
}

async function main() {
  console.log("Resolving date for 2026-08-15...");
  const targetDate = new Date(Date.UTC(2026, 7, 15)); // August 15, 2026

  const activeMembers = await prisma.batchMember.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true }
  });

  console.log(`Found ${activeMembers.length} active interns. Updating/creating assignments...`);

  // Path to assets for attachments
  const assetDir = path.join(__dirname, '..', 'public', 'assets', 'promo');
  const img1Path = path.join(assetDir, 'independence-day-2026.jpg');
  const img2Path = path.join(assetDir, 'data-science-discount.png');

  const attachments: any[] = [];
  if (fs.existsSync(img1Path)) {
    attachments.push({
      filename: 'Independence_Day_TT_Wishes.jpg',
      content: fs.readFileSync(img1Path),
      path: img1Path
    });
  }
  if (fs.existsSync(img2Path)) {
    attachments.push({
      filename: 'Data_Science_Course_Promo.png',
      content: fs.readFileSync(img2Path),
      path: img2Path
    });
  }

  console.log(`Attachment count verified: ${attachments.length}`);

  let updatedCount = 0;
  let sentEmailCount = 0;

  for (const member of activeMembers) {
    // 1. Upsert today's assignment
    const existing = await prisma.internshipAssignment.findFirst({
      where: {
        memberId: member.id,
        scheduledDate: targetDate
      }
    });

    const deadline = new Date(targetDate.getTime() + (18.5 * 60 * 60 * 1000));
    const releaseAt = new Date(targetDate.getTime() + (4.5 * 60 * 60 * 1000));

    const assignmentData = {
      batchId: member.batchId,
      title: taskTitle,
      description: taskDescription,
      category: 'Daily Assignment',
      difficulty: 'Intermediate',
      estimatedTime: '1 Hour',
      xpReward: 100,
      deadline,
      releaseAt,
      status: 'active',
      mode: 'INDIVIDUAL',
      dayNumber: existing?.dayNumber || 3,
      scheduledDate: targetDate,
      week: 'Week 1',
      designation: member.role || 'Scholar Intern',
      campaign: 'Independence Day Special',
      phase: 'Awareness',
      assetDeliverable: 'WhatsApp/Instagram Story Promo',
      channel: 'Social Status/Stories',
      cta: 'View Details',
      kpi: 'Story upload screenshots',
      submissionEvidence: 'Story status screenshots',
      memberId: member.id
    };

    let assignmentId = '';
    if (existing) {
      const updated = await prisma.internshipAssignment.update({
        where: { id: existing.id },
        data: assignmentData
      });
      assignmentId = updated.id;
    } else {
      const created = await prisma.internshipAssignment.create({
        data: assignmentData
      });
      assignmentId = created.id;
    }
    updatedCount++;

    // Ensure recipient entry exists
    const recipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: { assignmentId, memberId: member.id }
    });
    if (!recipient) {
      await prisma.internshipAssignmentRecipient.create({
        data: { assignmentId, memberId: member.id }
      });
    }

    // 2. Clear previous email logs for today
    await prisma.emailLog.deleteMany({
      where: {
        userId: member.userId,
        type: 'DAILY_TASK',
        subject: { contains: `Day` }
      }
    });
  }

  console.log(`Assignments upserted. Starting parallel email dispatch...`);

  // Send emails in chunks of 4 to stay well within connection pool limit (5)
  const chunkSize = 4;
  for (let idx = 0; idx < activeMembers.length; idx += chunkSize) {
    const chunk = activeMembers.slice(idx, idx + chunkSize);
    console.log(`Sending email batch ${idx / chunkSize + 1} of ${Math.ceil(activeMembers.length / chunkSize)}...`);
    
    await Promise.all(chunk.map(async (member) => {
      if (member.user && member.user.email) {
        try {
          const html = buildEmailHtml(member.user.name || 'Scholar');
          await sendTransactionalEmail({
            to: member.user.email,
            subject: `SARTHI Daily Task — ${taskTitle}`,
            html,
            type: 'daily_task',
            attachments,
            userId: member.userId,
            provider: 'resend'
          });
          sentEmailCount++;
        } catch (err: any) {
          console.error(`Failed to send email to ${member.user.email}:`, err.message);
        }
      }
    }));
  }

  console.log(`\n=== Done ===`);
  console.log(`Assignments upserted: ${updatedCount}`);
  console.log(`Emails dispatched: ${sentEmailCount}`);
}

main().finally(() => prisma.$disconnect());
