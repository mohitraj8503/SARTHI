import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Day 11 Task Specifications
const DAY11_TASKS = {
  DIGITAL_MARKETING: {
    title: '📅 Day 11 Task — Internship Journey Face Video',
    category: 'Digital Marketing & Social Media',
    description: `### 📅 DAY 11 TASK — Internship Journey Face Video 🚀

Hello Team,

Today's task is exclusively for the **Digital Marketing & Social Media** Interns.

Your goal is to create a genuine, engaging face-to-camera video sharing your experience as a SARTHI intern.

#### 🎥 Video Language:
Hindi, English, or Hinglish

*Note: The video must be a face video. Voice-over, slideshow, AI avatar, or faceless video will not be accepted.*

#### 🗣️ What to Talk About:
• Why you joined SARTHI
• What you have worked on so far
• What you have learned
• Your experience with the internship
• How the team and work environment have been
• One thing you genuinely liked
• One skill you improved
• Why other students should consider joining SARTHI

Keep it natural. Do not read a heavily scripted advertisement.

#### ⏱️ Duration:
30–60 seconds

#### 📲 Publishing:
• Upload the video on your Instagram account.
• Mention/tag SARTHI in the post.
• Use relevant internship and skill-development hashtags.

#### 📦 Deliverables & Submission Required:
• Instagram Reel link
• Screenshot of the published Reel
• Brief note about what you learned from creating it

#### ⚠️ Important:
This is a personal-branding and marketing task. Your video should feel authentic, confident, and professional. Do not make false claims or exaggerate your internship experience. Speak from your actual experience.

⏰ **Deadline: Today • 9:00 PM IST**`,
    difficulty: 'Intermediate',
    estimatedTime: '3 Hours',
    xpReward: 500
  },

  GRAPHIC_DESIGN: {
    title: '📅 Day 11 Task — Graphic Design: Brand Visual Identity & Ad Creatives',
    category: 'Graphic Design',
    description: `### 📅 DAY 11 TASK — Graphic Design 🚀

Hello Team,

Today's task is to design a high-converting promotional creative kit for SARTHI's upcoming flagship programs and workshops.

#### 🎨 Deliverables Required:
• 1 Premium Instagram Carousel (3–5 Slides) explaining SARTHI Programs
• 1 Ad Banner (1080x1080) for Social Media Marketing
• Editable Source File (Figma / Canva / PSD)

⏰ **Deadline: Today • 9:00 PM IST**`,
    difficulty: 'Intermediate',
    estimatedTime: '3 Hours',
    xpReward: 500
  },

  CREATOR_WRITER: {
    title: '📅 Day 11 Task — Creator & Writer: Brand Narrative & Copywriting',
    category: 'Creator & Creative Writer',
    description: `### 📅 DAY 11 TASK — Creator & Creative Writer 🚀

Hello Team,

Today's task is to write engaging brand narrative stories and social copies showcasing real student growth at SARTHI.

#### ✍️ Deliverables Required:
• 1 Student Success Story Blog / Narrative (600–800 words)
• 3 High-converting LinkedIn & Social Media Captions
• Markdown or Google Docs link

⏰ **Deadline: Today • 9:00 PM IST**`,
    difficulty: 'Intermediate',
    estimatedTime: '3 Hours',
    xpReward: 500
  },

  RESEARCH_DEV: {
    title: '📅 Day 11 Task — Research & Development: AI & Tech Trends Analysis',
    category: 'Research & Development',
    description: `### 📅 DAY 11 TASK — Research & Development 🚀

Hello Team,

Today's task is to conduct research and compile a concise report on emerging AI tools and tech trends transforming student learning in 2026.

#### 📊 Deliverables Required:
• 2-Page Research Analysis Report
• Key findings summary & sources

⏰ **Deadline: Today • 9:00 PM IST**`,
    difficulty: 'Intermediate',
    estimatedTime: '3 Hours',
    xpReward: 500
  }
};

// Intern List & Track Assignment (Web Devs & Software Devs Excluded)
const INTERN_LIST = [
  // Digital Marketing & Social Media
  { name: 'Ashek Ali Shah', email: 'ashekalishah99@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Divya', email: 'divyadoc56@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Srinivas Singh Deo', email: 'srinivasdeo02@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Ranjan Singh', email: 'ranjansinghgy@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Vivek Sharma', email: 'viveksharma8364@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Jaanvi Nair', email: 'nairjaanvi199@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Harsh Ubale', email: 'ubaleharsh21@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Kasim Rasool', email: 'kasimrasoolfusion@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Vigneshwaran B', email: 'vxnverse7@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Mohd Zaid', email: 'zaidsiddiqui4733@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Nandini Katiyar', email: 'nandinikatiyar5@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },
  { name: 'Ritesh Kumar', email: '85ritesh@gmail.com', taskKey: 'DIGITAL_MARKETING' as const, domain: 'Digital Marketing & Social Media' },

  // Graphic Design
  { name: 'Kumari Tejal', email: 'kumaritejal535@gmail.com', taskKey: 'GRAPHIC_DESIGN' as const, domain: 'Graphic Design' },

  // Creator & Creative Writer
  { name: 'Pranshu Kumar Singh', email: 'ps859521@gmail.com', taskKey: 'CREATOR_WRITER' as const, domain: 'Creator & Creative Writer' },
  { name: 'Keshav Kumar', email: 'kumarkeshav10320@gmail.com', taskKey: 'CREATOR_WRITER' as const, domain: 'Creator & Creative Writer' },
  { name: 'Harsh Nayan', email: 'harshhn018@gmail.com', taskKey: 'CREATOR_WRITER' as const, domain: 'Creator & Creative Writer' },
  { name: 'Ayush Rajput', email: 'ayushrajputttt3@gmail.com', taskKey: 'CREATOR_WRITER' as const, domain: 'Creator & Creative Writer' },
  { name: 'Aniket Dutta', email: 'aniketdutta615@gmail.com', taskKey: 'CREATOR_WRITER' as const, domain: 'Creator & Creative Writer' },
  { name: 'Prateek Singh Parmar', email: 'prateeksinghparmar54@gmail.com', taskKey: 'CREATOR_WRITER' as const, domain: 'Creator & Creative Writer' },
  { name: 'Amitabh Bacchan', email: 'amitabhbacchantesting@gmail.com', taskKey: 'CREATOR_WRITER' as const, domain: 'Creator & Creative Writer' },

  // Research & Development
  { name: 'Mohit Raj', email: 'mohitraj8503@gmail.com', taskKey: 'RESEARCH_DEV' as const, domain: 'Research & Development' }
];

async function main() {
  console.log(`\n==================================================`);
  console.log(`🚀 DAY 11 TASK ASSIGNMENT (MYSQL DATABASE SYNC)`);
  console.log(`==================================================\n`);

  // 1. Ensure Internship parent record exists
  let internship = await prisma.internship.findFirst();
  if (!internship) {
    internship = await prisma.internship.create({
      data: {
        title: 'SARTHI National Internship Program 2026',
        description: 'Industry-level internship program for future engineers and leaders.',
      }
    });
  }

  // 2. Ensure Active Batch exists
  let batch = await prisma.internshipBatch.findFirst({ where: { status: 'ACTIVE' } });
  if (!batch) {
    batch = await prisma.internshipBatch.create({
      data: {
        internshipId: internship.id,
        name: 'Batch 2026 Alpha',
        mentorName: 'Mohit Raj',
        mentorTitle: 'DevOps & AI Educator',
        mentorEmail: 'mohit.raj@sarthi-woad.vercel.app',
        status: 'ACTIVE',
      }
    });
  }
  console.log(`📍 Active Batch ID: ${batch.id} ("${batch.name}")`);

  // Deadline: Today (August 10, 2026) at 9:00 PM IST
  const deadlineDate = new Date('2026-08-10T21:00:00+05:30');

  let assignedCount = 0;

  for (const intern of INTERN_LIST) {
    const email = intern.email.toLowerCase().trim();

    // Ensure User exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: intern.name,
          role: 'STUDENT',
        }
      });
    }

    // Ensure InternshipApplication exists
    const existingApp = await prisma.internshipApplication.findFirst({ where: { email } });
    if (existingApp) {
      await prisma.internshipApplication.update({
        where: { id: existingApp.id },
        data: { status: 'OFFER_ACCEPTED', domain: intern.domain }
      });
    } else {
      await prisma.internshipApplication.create({
        data: {
          name: intern.name,
          email,
          domain: intern.domain,
          status: 'OFFER_ACCEPTED',
          studentId: user.id,
          internshipId: internship.id,
        }
      });
    }

    // Ensure BatchMember exists
    let member = await prisma.batchMember.findUnique({
      where: { userId_batchId: { userId: user.id, batchId: batch.id } }
    });

    if (!member) {
      member = await prisma.batchMember.create({
        data: {
          userId: user.id,
          batchId: batch.id,
          status: 'ACTIVE',
        }
      });
    }

    const taskSpec = DAY11_TASKS[intern.taskKey];

    // Ensure Assignment exists
    let assignment = await prisma.internshipAssignment.findFirst({
      where: { batchId: batch.id, title: taskSpec.title }
    });

    if (!assignment) {
      assignment = await prisma.internshipAssignment.create({
        data: {
          batchId: batch.id,
          title: taskSpec.title,
          description: taskSpec.description,
          category: taskSpec.category,
          difficulty: taskSpec.difficulty,
          estimatedTime: taskSpec.estimatedTime,
          xpReward: taskSpec.xpReward,
          deadline: deadlineDate,
          mode: 'INDIVIDUAL',
          status: 'active',
        }
      });
    }

    // Ensure Recipient connection exists
    let recipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: { assignmentId: assignment.id, memberId: member.id }
    });
    if (!recipient) {
      await prisma.internshipAssignmentRecipient.create({
        data: { assignmentId: assignment.id, memberId: member.id }
      });
    }

    // Ensure Submission initial row in 'Assigned' status exists
    let submission = await prisma.internshipSubmission.findFirst({
      where: { assignmentId: assignment.id, memberId: member.id }
    });
    if (!submission) {
      await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id,
          status: 'Assigned',
        }
      });
    }

    assignedCount++;
    console.log(`✅ Assigned Day 11 Task to ${intern.name} <${email}> (${intern.domain})`);
  }

  console.log(`\n🎉 Total Interns Assigned in MySQL: ${assignedCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error executing task assignment script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
