import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Detailed Day 9 Task Assignments according to the prompt
const DAY9_TASKS = {
  GRAPHIC_DESIGN: {
    title: '📅 Day 9 Task – Graphic Design: Design Educational Creatives',
    category: 'Graphic Design',
    description: `### 📅 DAY 9 TASK – Learn • Create • Teach 🚀

Hello Team,

At **SARTHI**, we believe the best way to master a skill is to **learn it and teach it to others**.
Design educational creatives explaining a design concept.

#### Topic Options (Choose any one):
• Principles of Graphic Design
• Color Theory
• Typography Basics
• Branding Fundamentals
• UI/UX Design Basics
• Canva vs Figma
• Social Media Design Tips

#### 📦 Key Deliverables Required:
• 1 Educational Poster
• 1 Instagram Carousel (5 Slides)
• 1 Instagram Story
• Editable Source File`,
    difficulty: 'Intermediate',
    estimatedTime: '3 Hours',
    xpReward: 500
  },
  CREATOR_WRITER: {
    title: '📅 Day 9 Task – Creator & Writer: Write an Educational Blog',
    category: 'Creator & Creative Writer',
    description: `### 📅 DAY 9 TASK – Learn • Create • Teach 🚀

Hello Team,

At **SARTHI**, we believe the best way to master a skill is to **learn it and teach it to others**.
Write an educational blog.

#### Topic Options (Choose any one):
• Introduction to Python
• Why Every Student Should Learn Python
• How Python is Used in AI
• Data Analysis with Python
• Future of Artificial Intelligence
• How to Start Coding
• Career Opportunities in Tech
• Importance of Digital Skills

#### 📦 Key Deliverables Required:
• 1 SEO Blog (800–1200 words)
• 1 LinkedIn Post
• 1 Instagram Caption`,
    difficulty: 'Intermediate',
    estimatedTime: '3 Hours',
    xpReward: 500
  },
  DIGITAL_MARKETING: {
    title: '📅 Day 9 Task – Digital Marketing: Create Educational Social Content',
    category: 'Digital Marketing & Social Media',
    description: `### 📅 DAY 9 TASK – Learn • Create • Teach 🚀

Hello Team,

At **SARTHI**, we believe the best way to master a skill is to **learn it and teach it to others**.
Create educational content that teaches students something valuable.

#### Topic Options (Choose any one):
• Personal Branding
• LinkedIn Profile Optimization
• Instagram Growth Tips
• Digital Marketing Basics
• SEO Fundamentals
• Content Marketing
• Social Media Strategy
• Email Marketing Basics

#### 📦 Key Deliverables Required:
• 1 Educational LinkedIn Post
• 1 Instagram Post or Reel
• 1 Story
• Promotion Screenshots`,
    difficulty: 'Intermediate',
    estimatedTime: '3 Hours',
    xpReward: 500
  },
  WEB_DEV: {
    title: '📅 Day 9 Task – Web Development: MSME Portal Backend Project',
    category: 'Web Development',
    description: `### 📅 DAY 9 TASK – Learn • Create • Teach 🚀

Hello Team,

At **SARTHI**, we believe the best way to master a skill is to **learn it and teach it to others**.

#### 📦 Key Deliverables Required:
• Continue working on your assigned **MSME Portal Backend Project** and share your daily progress in the team group.`,
    difficulty: 'Intermediate',
    estimatedTime: '4 Hours',
    xpReward: 500
  },
  SOFTWARE_DEV: {
    title: '📅 Day 9 Task – Software Development: Progress Update',
    category: 'Software Development',
    description: `### 📅 DAY 9 TASK – Learn • Create • Teach 🚀

Hello Team,

At **SARTHI**, we believe the best way to master a skill is to **learn it and teach it to others**.

#### 📦 Key Deliverables Required:
• Continue developing your assigned software project and submit today's progress update with screenshots or a demo.`,
    difficulty: 'Intermediate',
    estimatedTime: '4 Hours',
    xpReward: 500
  },
  RESEARCH_DEV: {
    title: '📅 Day 9 Task – Research & Development: Research Report',
    category: 'Research & Development',
    description: `### 📅 DAY 9 TASK – Learn • Create • Teach 🚀

Hello Team,

At **SARTHI**, we believe the best way to master a skill is to **learn it and teach it to others**.
Research and prepare a report.

#### Topic Options (Choose any one):
• Emerging AI Technologies
• Future of Education Technology
• Government Skill Development Programs
• Latest AI Industry Trends
• Startup Ecosystem in India

#### 📦 Key Deliverables Required:
• 2–3 Page Research Report
• Key Findings
• References`,
    difficulty: 'Intermediate',
    estimatedTime: '4 Hours',
    xpReward: 500
  }
};

// Maps emails to specific tasks based on domains
const EMAIL_TASK_MAPPING: Record<string, keyof typeof DAY9_TASKS> = {
  // Graphic Design
  'kumaritejal535@gmail.com': 'GRAPHIC_DESIGN',

  // Creator & Creative Writer
  'ps859521@gmail.com': 'CREATOR_WRITER', // Pranshu Kumar Singh
  'kumarkeshav10320@gmail.com': 'CREATOR_WRITER', // Keshav Kumar
  'harshhn018@gmail.com': 'CREATOR_WRITER', // Harsh Nayan (Content Creation)
  'ayushrajputttt3@gmail.com': 'CREATOR_WRITER', // Ayush Rajput (Content Creation)
  'aniketdutta615@gmail.com': 'CREATOR_WRITER', // Aniket Dutta (Content Creation)
  'prateeksinghparmar54@gmail.com': 'CREATOR_WRITER', // Prateek Singh Parmar
  'amitabhbacchantesting@gmail.com': 'CREATOR_WRITER', // Amitabh Bacchan

  // Digital Marketing & Social Media
  'srinivasdeo02@gmail.com': 'DIGITAL_MARKETING', // srinivas singh deo
  'ranjansinghgy@gmail.com': 'DIGITAL_MARKETING', // Ranjan Singh
  'ashekalishah99@gmail.com': 'DIGITAL_MARKETING', // Ashek Ali Shah
  'viveksharma8364@gmail.com': 'DIGITAL_MARKETING', // Vivek Sharma
  'nairjaanvi199@gmail.com': 'DIGITAL_MARKETING', // jaanvi nair
  'divyadoc56@gmail.com': 'DIGITAL_MARKETING', // Divya
  'ubaleharsh21@gmail.com': 'DIGITAL_MARKETING', // Harsh Ubale
  'kasimrasoolfusion@gmail.com': 'DIGITAL_MARKETING', // Kasim Rasool
  'vxnverse7@gmail.com': 'DIGITAL_MARKETING', // VIGNESHWARAN B
  'zaidsiddiqui4733@gmail.com': 'DIGITAL_MARKETING', // Mohd Zaid
  'nandinikatiyar5@gmail.com': 'DIGITAL_MARKETING', // Nandini Katiyar
  '85ritesh@gmail.com': 'DIGITAL_MARKETING', // Ritesh Kumar

  // Web Dev
  'ntnsinha0623@gmail.com': 'WEB_DEV', // Nitin Sinha
  'nitinsinha062@gmail.com': 'WEB_DEV', // Nitin Sinha

  // Software Dev
  'omprabhat2106@gmail.com': 'SOFTWARE_DEV', // Om Prabhat

  // Research & Development
  'mohitraj8503@gmail.com': 'RESEARCH_DEV' // Mohit Raj
};

async function main() {
  console.log(`\n==================================================`);
  console.log(`🚀 DAY 9 TASK ALLOCATION & DATABASE SYNC STARTING`);
  console.log(`==================================================\n`);

  // 1. Fetch active batch
  const batch = await prisma.internshipBatch.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!batch) {
    throw new Error('No active internship batch found!');
  }
  console.log(`📍 Found Active Batch: "${batch.name}" (ID: ${batch.id})`);

  // Deadline: Today (August 7, 2026) at 9:00 PM IST
  const deadlineDate = new Date('2026-08-07T21:00:00+05:30');
  console.log(`⏰ Assignment Deadline Set To: ${deadlineDate.toString()}`);

  // 2. Fetch all members in this active batch
  const members = await prisma.batchMember.findMany({
    where: { batchId: batch.id },
    include: { user: true }
  });

  console.log(`👥 Active batch members count: ${members.length}`);

  let createdAssignmentsCount = 0;
  let assignedRecipientsCount = 0;
  let submissionsCreatedCount = 0;

  for (const member of members) {
    const email = member.user.email.toLowerCase().trim();
    const mappedTaskKey = EMAIL_TASK_MAPPING[email];

    if (!mappedTaskKey) {
      console.warn(`⚠️ Warning: No task mapping found for intern ${member.user.name} <${email}>`);
      continue;
    }

    const taskSpec = DAY9_TASKS[mappedTaskKey];

    // Check or create the assignment for the batch
    let assignment = await prisma.internshipAssignment.findFirst({
      where: {
        batchId: batch.id,
        title: taskSpec.title,
      },
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
        },
      });
      createdAssignmentsCount++;
      console.log(`✨ Created Assignment: "${taskSpec.title}"`);
    }

    // Check or create recipient connection
    let recipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: member.id,
      },
    });

    if (!recipient) {
      recipient = await prisma.internshipAssignmentRecipient.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id,
        },
      });
      assignedRecipientsCount++;
    }

    // Check or create submission entry in Assigned status
    let submission = await prisma.internshipSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: member.id,
      },
    });

    if (!submission) {
      submission = await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id,
          status: 'Assigned',
        },
      });
      submissionsCreatedCount++;
    }

    console.log(`✅ Success: Assigned "${taskSpec.title}" to ${member.user.name} (${email})`);
  }

  console.log(`\n==================================================`);
  console.log(`🎉 DAY 9 TASK SYNC SUMMARY:`);
  console.log(`- Created Assignments: ${createdAssignmentsCount}`);
  console.log(`- Assigned Recipients: ${assignedRecipientsCount}`);
  console.log(`- Submissions Initialized: ${submissionsCreatedCount}`);
  console.log(`==================================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error executing sync script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
