import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY || '');

export interface InternTaskInfo {
  name: string;
  role: string;
  email: string;
  taskTitle: string;
  deliverables: string[];
  submissionItems: string[];
}

export const INTERN_ROLE_TASKS: InternTaskInfo[] = [
  {
    name: 'Kumari Tejal',
    email: 'kumaritejal535@gmail.com',
    role: 'Graphic Design Intern',
    taskTitle: 'Create a complete promotional design kit for the SARTHI Certification Exams',
    deliverables: [
      '1 Premium Instagram Post',
      '1 LinkedIn Banner',
      '1 Instagram Story',
      '1 Promotional Poster (A4)',
      '1 YouTube Thumbnail',
      '1 Mobile Banner (1080×1920)',
      'Editable Source File (Figma/Canva/PSD)'
    ],
    submissionItems: ['PNG Exports', 'Source File', 'Design Preview']
  },
  {
    name: 'Pranshu Kumar Singh',
    email: 'ps859521@gmail.com',
    role: 'Creator & Creative Writer',
    taskTitle: 'Write promotional content for the SARTHI Certification Exams',
    deliverables: [
      '1 SEO Blog (800–1000 words)',
      '1 LinkedIn Post',
      '1 Instagram Caption',
      '1 Email Promotion',
      '5 Notification Messages',
      '5 Call-to-Action Headlines'
    ],
    submissionItems: ['Markdown or Google Docs']
  },
  {
    name: 'Keshav Kumar',
    email: 'kumarkeshav10320@gmail.com',
    role: 'Creator & Creative Writer',
    taskTitle: 'Create promotional video content for the SARTHI Certification Exams',
    deliverables: [
      '1 Instagram Reel (20–45 seconds)',
      '1 YouTube Short',
      '1 Promotional Video',
      'Captions & Subtitles',
      'Thumbnail for the Reel'
    ],
    submissionItems: ['MP4 Video', 'Editable Project File']
  },
  {
    name: 'Prateek Singh Parmar',
    email: 'prateeksinghparmar54@gmail.com',
    role: 'Creator & Creative Writer',
    taskTitle: 'Write educational content promoting the value of certifications',
    deliverables: [
      '1 Technology Blog',
      '1 Student Awareness Article',
      '1 LinkedIn Article',
      '5 Social Media Captions',
      '5 Short Promotional Copies'
    ],
    submissionItems: ['Markdown or Google Docs']
  },
  {
    name: 'Ashek Ali Shah',
    email: 'ashekalishah99@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Promote the SARTHI Certification Exams',
    deliverables: [
      '1 LinkedIn Post',
      '1 Instagram Post/Reel',
      '1 WhatsApp Status',
      'Share in 5 Student Groups',
      'Excel Outreach Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Excel Outreach Report']
  },
  {
    name: 'Divya',
    email: 'divyadoc56@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Run a one-day social media campaign',
    deliverables: [
      '1 Instagram Carousel',
      '1 Story Series',
      '1 LinkedIn Post',
      'Promotion in College Groups',
      'Outreach Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Outreach Report']
  },
  {
    name: 'Ritesh Kumar',
    email: '85ritesh@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Promote the Certification Exams in your college and online communities',
    deliverables: [
      'LinkedIn Post',
      'WhatsApp Promotion',
      'Telegram Promotion',
      'Student Outreach Report',
      'Excel Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Excel Outreach Report']
  },
  {
    name: 'Harsh Ubale',
    email: 'ubaleharsh21@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Generate awareness for SARTHI Certifications',
    deliverables: [
      'Instagram Reel/Post',
      'LinkedIn Post',
      'WhatsApp Status',
      'Student Registrations (if any)',
      'Outreach Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Outreach Report']
  },
  {
    name: 'Vivek Sharma',
    email: 'viveksharma8364@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Create and publish promotional content',
    deliverables: [
      'LinkedIn Post',
      'Instagram Post',
      'Story',
      'Community Promotion',
      'Performance Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Performance Report']
  },
  {
    name: 'Jaanvi Nair',
    email: 'nairjaanvi199@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Plan and execute a one-day marketing campaign',
    deliverables: [
      'LinkedIn Post',
      'Instagram Reel',
      'Story Series',
      'Outreach Report',
      'Campaign Summary'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Outreach Report']
  },
  {
    name: 'Nandini Katiyar',
    email: 'nandinikatiyar5@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Promote the SARTHI Certification Portal within your student network',
    deliverables: [
      'Instagram Post',
      'WhatsApp Status',
      'College Group Promotion',
      'Outreach Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Outreach Report']
  },
  {
    name: 'Mohd Zaid',
    email: 'zaidsiddiqui4733@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Increase awareness of SARTHI Certifications',
    deliverables: [
      'LinkedIn Post',
      'Instagram Post',
      'Community Promotion',
      'Marketing Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Marketing Report']
  },
  {
    name: 'Kasim Rasool',
    email: 'kasimrasoolfusion@gmail.com',
    role: 'Digital Marketing & Social Media',
    taskTitle: 'Promote SARTHI Certification Exams through your network',
    deliverables: [
      'WhatsApp Status',
      'Student Group Promotion',
      'Instagram Post',
      'Outreach Report'
    ],
    submissionItems: ['Workspace / Team Group link', 'Screenshots of work', 'Outreach Report']
  }
];

export function generateInternEmailHtml(intern: InternTaskInfo): { subject: string; html: string } {
  const badge = `🚀 ONE-DAY ROLE TASK ALLOCATION`;
  const heading = `Task Assignment: ${intern.role}`;
  const subject = `📢 Mandatory Role-Based Task Assignment: ${intern.role} - SARTHI`;

  const bodyMarkdown = `Hi **${intern.name}** 👋,

Today, each intern has been assigned a **role-specific task** based on your internship domain (**${intern.role}**). Please complete your assigned work and submit it before the deadline.

### 📌 Assigned Task
**Role:** ${intern.role}
**Task:** ${intern.taskTitle}
**Deadline:** Today • 9:00 PM IST

### 📦 Key Deliverables Required
${intern.deliverables.map(d => `• ${d}`).join('\n')}

### 📤 Submission Instructions & Format
Submit your work in your Internship Workspace / Assigned Team Group.
Required submission items:
${intern.submissionItems.map(s => `• ${s}`).join('\n')}

---
**Important Instructions:**
• Your task status will be updated on your Internship Dashboard after review.
• A branded confirmation email will also be sent upon successful verification.
• Late submissions may not be evaluated. Eligible interns will receive a branded completion email once their submission has been reviewed.
• High-quality work may be considered for performance-based recognition.`;

  const highlightMarkdown = `⏰ **Deadline:** Today • 9:00 PM IST\nPlease complete and submit your assigned deliverables on time. High-quality submissions are considered for performance-based recognition!`;

  const html = getBrandedTemplate({
    badge,
    heading,
    body: bodyMarkdown,
    highlight: highlightMarkdown,
    action: {
      label: 'Open Internship Dashboard',
      url: 'https://sarthi-woad.vercel.app/dashboard'
    },
    senderName: 'Team SARTHI'
  });

  return { subject, html };
}

export async function runDispatch(execute: boolean = false) {
  console.log(`\n==================================================`);
  console.log(`📢 SARTHI INTERNSHIP TASK ALLOCATION DISPATCH`);
  console.log(`==================================================\n`);

  let successCount = 0;
  let failCount = 0;

  for (const intern of INTERN_ROLE_TASKS) {
    const { subject, html } = generateInternEmailHtml(intern);

    console.log(`--------------------------------------------------`);
    console.log(`👤 Intern: ${intern.name}`);
    console.log(`🏷️ Role: ${intern.role}`);
    console.log(`📧 Target Email: ${intern.email}`);
    console.log(`📌 Subject: ${subject}`);

    if (execute) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'SARTHI Internship <internship@sarthi.in>',
          to: [intern.email],
          subject,
          html
        });

        if (error) {
          console.error(`❌ Error sending email to ${intern.email}:`, error);
          failCount++;
        } else {
          console.log(`✅ SUCCESS! Email delivered to ${intern.email} (Resend ID: ${data?.id})`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`❌ Exception sending to ${intern.email}:`, err.message);
        failCount++;
      }
    } else {
      console.log(`ℹ️ [DRY RUN] Email generated cleanly matching branded.ts format.`);
    }
  }

  console.log(`\n==================================================`);
  if (execute) {
    console.log(`🎉 DISPATCH COMPLETE: ${successCount} Sent | ${failCount} Failed`);
  } else {
    console.log(`⚠️ DRY RUN COMPLETE. Pass --send to execute actual email dispatch.`);
  }
  console.log(`==================================================\n`);
}

export async function syncTasksToDatabase() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  console.log(`\n==================================================`);
  console.log(`💾 SYNCING ROLE-BASED TASKS TO DATABASE FOR DASHBOARD`);
  console.log(`==================================================\n`);

  try {
    let internship = await prisma.internship.findFirst();
    if (!internship) {
      internship = await prisma.internship.create({
        data: {
          title: 'Software Development & Creator Internship',
          description: 'Master full-stack software development, technical content writing, and creator workflows.',
        },
      });
    }

    let batch = await prisma.internshipBatch.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!batch) {
      batch = await prisma.internshipBatch.create({
        data: {
          internshipId: internship.id,
          name: 'August 2026 Batch',
          mentorName: 'Mohit Raj',
          mentorTitle: 'Mentor',
          mentorEmail: 'pm.enthuse@gmail.com',
          duration: '2 Months',
          status: 'ACTIVE',
        },
      });
    }

    const deadlineDate = new Date('2026-08-03T21:00:00+05:30');

    for (const intern of INTERN_ROLE_TASKS) {
      const email = intern.email.toLowerCase().trim();

      let user = await prisma.user.findFirst({
        where: { email: { equals: email } },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: intern.name,
            role: 'STUDENT',
            status: 'ACTIVE',
            onboarded: true,
          },
        });
        console.log(`  👤 Created User: ${intern.name} (${email})`);
      }

      let app = await prisma.internshipApplication.findFirst({
        where: { email: { equals: email } },
      });

      if (!app) {
        app = await prisma.internshipApplication.create({
          data: {
            email,
            name: intern.name,
            domain: intern.role,
            status: 'OFFER_ACCEPTED',
            studentId: user.id,
            internshipId: internship.id,
            offerAcceptedAt: new Date(),
          },
        });
        console.log(`  📝 Created Application for: ${intern.name}`);
      } else if (!app.studentId) {
        await prisma.internshipApplication.update({
          where: { id: app.id },
          data: { studentId: user.id },
        });
      }

      let member = await prisma.batchMember.findFirst({
        where: { userId: user.id, batchId: batch.id },
      });

      if (!member) {
        member = await prisma.batchMember.create({
          data: {
            userId: user.id,
            batchId: batch.id,
          },
        });
        console.log(`  🎓 Created BatchMember for: ${intern.name}`);
      }

      const descriptionMarkdown = `### 📌 Role-Based Task: ${intern.taskTitle}

**Role:** ${intern.role}
**Assigned To:** ${intern.name}

---

### 📦 Key Deliverables Required
${intern.deliverables.map(d => `• ${d}`).join('\n')}

---

### 📤 Submission Instructions & Format
Required submission items:
${intern.submissionItems.map(s => `• ${s}`).join('\n')}

---

**Important Instructions:**
• Submit your deliverables before the deadline.
• Work will be evaluated by your mentor upon submission.`;

      let assignment = await prisma.internshipAssignment.findFirst({
        where: {
          batchId: batch.id,
          title: intern.taskTitle,
        },
      });

      if (!assignment) {
        assignment = await prisma.internshipAssignment.create({
          data: {
            batchId: batch.id,
            title: intern.taskTitle,
            description: descriptionMarkdown,
            category: intern.role,
            difficulty: 'Intermediate',
            estimatedTime: '3 Hours',
            xpReward: 500,
            deadline: deadlineDate,
            mode: 'INDIVIDUAL',
            status: 'active',
          },
        });
        console.log(`  📋 Created Assignment: "${intern.taskTitle}"`);
      }

      let recipient = await prisma.internshipAssignmentRecipient.findFirst({
        where: {
          assignmentId: assignment.id,
          memberId: member.id,
        },
      });

      if (!recipient) {
        await prisma.internshipAssignmentRecipient.create({
          data: {
            assignmentId: assignment.id,
            memberId: member.id,
          },
        });
        console.log(`  🔗 Assigned recipient for: ${intern.name}`);
      }

      let submission = await prisma.internshipSubmission.findFirst({
        where: {
          assignmentId: assignment.id,
          memberId: member.id,
        },
      });

      if (!submission) {
        await prisma.internshipSubmission.create({
          data: {
            assignmentId: assignment.id,
            memberId: member.id,
            status: 'Assigned',
          },
        });
        console.log(`  📌 Created Submission entry for: ${intern.name}`);
      }

      console.log(`  ✅ TASK SYNC COMPLETE: ${intern.name} (${email}) -> Dashboard Ready!`);
    }

    console.log(`\n==================================================`);
    console.log(`🎉 ALL 13 ROLE TASKS SYNCED SUCCESSFULLY TO DATABASE!`);
    console.log(`==================================================\n`);

  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  const shouldExecute = process.argv.includes('--send') || process.argv.includes('--execute');
  const shouldSyncDb = process.argv.includes('--sync-db') || true; // Default sync to true when executed directly

  (async () => {
    if (shouldSyncDb) {
      await syncTasksToDatabase();
    }
    if (shouldExecute) {
      await runDispatch(true);
    }
  })().catch(console.error);
}

