import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config();

const prisma = new PrismaClient();

const PDF_PATH = '/home/mohitraj8503/Downloads/Python Masterclass Certificate of Completion.pdf';

// Define team campaign assignments based on team domain
const campaignTaskTemplates = {
  'Creator Team (Reel Creators)': {
    title: '🎥 Certificate Campaign: Create 5 High-Impact Promotional Reels',
    description: `As part of the SARTHI Certificate Promotion Campaign, your objective is to create 5 engaging short-form videos (15-45s) for Instagram Reels, YouTube Shorts, and Facebook Reels promoting SARTHI Professional Certificates.
    
Key Requirements:
1. Feature the official Certificate Template (attached in this email) as the primary visual reference.
2. Use modern transitions, crisp edits, dynamic captions, and trending audio.
3. Choose from ideas: Why certificates matter, Resume boost, Skill vs Degree, Student success stories, Get hired with verified proof.
4. Include a clear CTA at the end directing viewers to enroll at sarthi-woad.vercel.app.`,
    deliverableTarget: '5 Reels per week',
    difficulty: 'Hard',
    xpReward: 500,
    estimatedTime: '8 Hours'
  },
  'Design Team (Kajal)': {
    title: '🎨 Certificate Campaign: Design 10 Premium Promotional Creatives',
    description: `As part of the SARTHI Certificate Promotion Campaign, your task is to design high-quality visual marketing assets showcasing SARTHI Certificates.
    
Key Requirements:
1. The Certificate Template must remain the hero element in all designs.
2. Deliverables: Instagram Posts, Carousel Posts, Story Templates, WhatsApp Posters, LinkedIn Banners, Facebook Posts, and Website/Email Header Banners.
3. Themes: Certificate of Completion, Industry Ready Skills, Verified Learning, Professional Recognition, Upgrade Your Resume, Earn While Learning.
4. Maintain consistent SARTHI branding and high-aesthetic dark/light design guidelines.`,
    deliverableTarget: '10 Creatives per week',
    difficulty: 'Hard',
    xpReward: 500,
    estimatedTime: '8 Hours'
  },
  'Blog Writers': {
    title: '✍️ Certificate Campaign: Write 2 SEO-Optimized Articles on Certification Value',
    description: `As part of the SARTHI Certificate Promotion Campaign, write 2 unique, high-ranking SEO blogs focused on the career value and credibility of professional certificates.
    
Key Requirements:
1. Word count: 800–1500 words per blog. SEO-optimized, human-readable, with clear H1/H2 headings.
2. Topics (Choose non-repetitive topics): Why Professional Certificates Matter in 2026, How Certificates Improve Your Resume, Do Recruiters Value Certificates?, Certificates vs College Degree, Skill Validation for Freshers.
3. Include CTA to SARTHI Certificate Program naturally within the content.`,
    deliverableTarget: '2 SEO Blogs per week',
    difficulty: 'Hard',
    xpReward: 500,
    estimatedTime: '8 Hours'
  },
  'Social Media Team': {
    title: '📱 Certificate Campaign: Create Daily Social Media Posts & Captions',
    description: `As part of the SARTHI Certificate Promotion Campaign, build daily engagement focused on SARTHI Professional Certificates across all platforms.
    
Key Requirements:
1. Formulate daily posts for Instagram, LinkedIn, Facebook, X (Twitter), Threads, and Community channels.
2. Highlight certificate credibility, skill verification, career growth, and learner trust.
3. Showcase the official certificate visual in post graphics.
4. Include clear CTAs driving course enrollments.`,
    deliverableTarget: '1 Post Daily',
    difficulty: 'Hard',
    xpReward: 500,
    estimatedTime: '6 Hours'
  },
  'Content Writers': {
    title: '💬 Certificate Campaign: Draft 5 Promotional Copy Packages & Web Headlines',
    description: `As part of the SARTHI Certificate Promotion Campaign, draft high-converting copy across multiple user touchpoints.
    
Key Requirements:
1. Draft short promotional ad copy, landing page conversion copy, course certificate descriptions, website hero headlines, and CTA buttons.
2. Draft email newsletter copy highlighting certified student outcomes.
3. Maintain premium, convincing, and concise messaging.`,
    deliverableTarget: '5 Copy Packages per week',
    difficulty: 'Hard',
    xpReward: 500,
    estimatedTime: '6 Hours'
  },
  'Email Marketing Team': {
    title: '📧 Certificate Campaign: Launch 2 High-Converting Email Campaigns',
    description: `As part of the SARTHI Certificate Promotion Campaign, design and execute email marketing campaigns promoting verified certificates.
    
Key Requirements:
1. Always attach the official certificate PDF (attached in this email) to outgoing campaign emails.
2. Craft copy encouraging learners to complete active courses, claim certificates, share on LinkedIn, and build their resume.
3. Include trackable CTA links to sarthi-woad.vercel.app.`,
    deliverableTarget: '2 Email Campaigns per week',
    difficulty: 'Hard',
    xpReward: 500,
    estimatedTime: '6 Hours'
  }
};

function buildPersonalizedEmailHtml(internName: string, teamName: string, taskTitle: string, taskDescription: string, deliverableTarget: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SARTHI Certificate Promotion Campaign - Assignment</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
<tr><td align="center">

<table width="660" cellpadding="0" cellspacing="0" style="
  background:#ffffff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,0.08);
  max-width:100%;
">

<!-- Header -->
<tr><td style="
  padding:40px 35px;
  text-align:center;
  background:linear-gradient(135deg,#06122e 0%,#0f2d5c 100%);
">
  <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">
    SARTHI
  </h1>
  <p style="margin:8px 0 0;font-size:13px;color:#d4a017;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
    Personalized Task Assignment: Certificate Promotion Campaign
  </p>
</td></tr>

<!-- Body -->
<tr><td style="padding:40px 40px 30px;">
  <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
    Hi <strong>${internName}</strong> 👋,
  </p>
  <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.7;">
    You have been assigned your personalized task for the company-wide <strong>SARTHI Certificate Promotion Campaign</strong>. Please review your assigned domain role, deliverable targets, and instructions below.
  </p>

  <!-- Assigned Task Card -->
  <div style="
    background:linear-gradient(135deg,#f8fafc,#eff6ff);
    border:1px solid #cbd5e1;
    border-left:5px solid #0f2d5c;
    border-radius:12px;
    padding:24px 28px;
    margin:0 0 28px;
  ">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;">Assigned Role / Team</p>
    <p style="margin:0 0 16px;font-size:17px;font-weight:800;color:#0f2d5c;">${teamName}</p>

    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;">Task Title</p>
    <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">${taskTitle}</p>

    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;">Deliverable Target</p>
    <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#2563eb;">${deliverableTarget}</p>

    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;">Deadline</p>
    <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600;">7 Days from Today (Sun, Aug 2, 2026)</p>
  </div>

  <!-- Detailed Task Description -->
  <div style="
    background:#ffffff;
    border:1px solid #e2e8f0;
    border-radius:10px;
    padding:20px;
    margin:0 0 28px;
  ">
    <h3 style="margin:0 0 12px;font-size:15px;color:#0f2d5c;font-weight:700;">Detailed Task Instructions:</h3>
    <div style="font-size:14px;color:#475569;line-height:1.7;white-space:pre-line;">
${taskDescription}
    </div>
  </div>

  <!-- Mandatory Attachment Notice -->
  <div style="
    background:#fefce8;
    border:1px solid #fef08a;
    border-left:5px solid #eab308;
    border-radius:10px;
    padding:18px 20px;
    margin:0 0 30px;
  ">
    <h4 style="margin:0 0 6px;font-size:14px;color:#854d0e;font-weight:700;">📎 Official Certificate Visual Attached</h4>
    <p style="margin:0;font-size:13px;color:#713f12;line-height:1.6;">
      Please find the official certificate template (<strong>Python Masterclass Certificate of Completion.pdf</strong>) attached to this email. Use this exact design as the visual reference in all your creative assets, posts, reels, articles, or email campaigns.
    </p>
  </div>

  <div style="text-align:center;margin:35px 0 15px;">
    <a href="https://sarthi-woad.vercel.app/dashboard" style="
      display:inline-block;
      background:linear-gradient(135deg,#0f2d5c,#1e4d8c);
      color:#ffffff;
      text-decoration:none;
      padding:14px 36px;
      border-radius:10px;
      font-size:15px;
      font-weight:700;
    ">
      View Assignment in Dashboard
    </a>
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="
  padding:24px 40px;
  text-align:center;
  background:#f8fafc;
  border-top:1px solid #e2e8f0;
">
  <p style="margin:0 0 4px;font-size:13px;color:#64748b;font-weight:600;">SARTHI Internship Management</p>
  <p style="margin:0;font-size:12px;color:#94a3b8;">Building Skills · Creating Opportunities · Empowering Futures</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// Map each intern email/name to their specific team domain
function classifyInternTeam(name: string, email: string): keyof typeof campaignTaskTemplates {
  const e = email.toLowerCase();
  const n = name.toLowerCase();

  if (n.includes('kajal')) return 'Design Team (Kajal)';
  if (e.includes('harsh') || n.includes('harsh')) return 'Creator Team (Reel Creators)';
  if (e.includes('keshav') || n.includes('keshav')) return 'Social Media Team';
  if (e.includes('pranshu') || n.includes('pranshu')) return 'Content Writers';
  if (e.includes('ayush') || n.includes('ayush')) return 'Email Marketing Team';
  if (e.includes('tejal') || n.includes('tejal')) return 'Design Team (Kajal)';
  if (e.includes('aniket') || n.includes('aniket')) return 'Blog Writers';
  if (e.includes('omprabhat') || n.includes('om prabhat')) return 'Creator Team (Reel Creators)';
  if (e.includes('srinivas') || n.includes('srinivas')) return 'Blog Writers';

  return 'Blog Writers'; // Default domain fallback
}

async function main() {
  console.log('🚀 Assigning personalized Certificate Campaign tasks to all interns...');

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF not found at ${PDF_PATH}`);
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(PDF_PATH);
  console.log(`✅ Loaded Certificate PDF (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

  const resend = new Resend(process.env.RESEND_API_KEY);

  const members = await prisma.batchMember.findMany({
    include: {
      user: true,
      batch: true
    }
  });

  console.log(`\nFound ${members.length} intern batch members.`);

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 7);

  for (const member of members) {
    const name = member.user.name || 'Intern';
    const email = member.user.email;
    const teamName = classifyInternTeam(name, email);
    const template = campaignTaskTemplates[teamName];

    console.log(`\n--------------------------------------------------`);
    console.log(`👤 Intern: ${name} (${email})`);
    console.log(`🏷️ Team: ${teamName}`);
    console.log(`📌 Task: ${template.title}`);

    // 1. Create or update InternshipAssignment record in Database
    let assignment = await prisma.internshipAssignment.findFirst({
      where: {
        batchId: member.batchId,
        title: template.title,
      }
    });

    if (!assignment) {
      assignment = await prisma.internshipAssignment.create({
        data: {
          batchId: member.batchId,
          title: template.title,
          description: template.description,
          difficulty: template.difficulty,
          estimatedTime: template.estimatedTime,
          xpReward: template.xpReward,
          deadline: deadlineDate,
          mode: 'INDIVIDUAL'
        }
      });
      console.log(`✅ Created Database Assignment (ID: ${assignment.id})`);
    } else {
      console.log(`ℹ️ Assignment already exists in database (ID: ${assignment.id})`);
    }

    // 2. Link Recipient
    const recipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: member.id
      }
    });

    if (!recipient) {
      await prisma.internshipAssignmentRecipient.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id
        }
      });
      console.log(`✅ Linked Intern Recipient record`);
    }

    // 3. Create initial Submission record (Status: Assigned)
    const submission = await prisma.internshipSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: member.id
      }
    });

    if (!submission) {
      await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id,
          status: 'Assigned'
        }
      });
      console.log(`✅ Initialized Internship Submission (Status: Assigned)`);
    }

    // 4. Send personalized assignment email with attached PDF
    console.log(`📧 Sending personalized assignment email to ${email}...`);
    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [email],
        subject: `🎯 Action Required: Your Task for SARTHI Certificate Promotion Campaign`,
        html: buildPersonalizedEmailHtml(name, teamName, template.title, template.description, template.deliverableTarget),
        attachments: [
          {
            filename: 'Python_Masterclass_Certificate_of_Completion.pdf',
            content: pdfBuffer.toString('base64'),
          }
        ]
      });

      if (error) {
        console.error(`❌ Resend error for ${email}:`, error);
      } else {
        console.log(`✅ Email delivered! Message ID: ${data.id}`);
      }
    } catch (emailErr: any) {
      console.error(`❌ Failed to send email to ${email}:`, emailErr.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 All intern tasks assigned in DB & notification emails dispatched!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
