import { PrismaClient } from '@prisma/client';
import { sendTransactionalEmail } from '../lib/email/send';

const prisma = new PrismaClient();

const hardJobs = {
  'Software Development': {
    title: 'Implement a Scalable Multi-Tenant Notification Queue with Redis and Postgres',
    description: 'Develop a robust, production-grade notification dispatching system. Key requirements:\n1. Support multi-tenant isolation.\n2. Implement retries with exponential backoff.\n3. Graceful handling of API rate limits of downstream providers.\n4. Expose metrics via Prometheus/JSON endpoints.\n5. Include unit/integration tests with high coverage.',
    estimatedTime: '8 Hours',
    xpReward: 500
  },
  'UI/UX Design': {
    title: 'Design the Complete SARTHI Mobile App UI/UX Design System',
    description: 'Develop a highly polished, interactive UI/UX design prototype and component style guide in Figma. Key requirements:\n1. Design all key screens (Auth, Dashboard, Live Meetings, Assignment Submission, Leaderboard).\n2. Establish complete typography, color systems (supporting Sleek Dark & Vibrant Light modes), and spacing systems.\n3. Include micro-interactions and transitions.',
    estimatedTime: '8 Hours',
    xpReward: 500
  },
  'Content & SEO Writing': {
    title: 'Write a 5000-word Exhaustive Research Paper on AI Integration in Modern E-Learning',
    description: 'Produce an in-depth, authoritative research paper on how Generative AI is reshaping curriculum delivery and personalized assessment. Key requirements:\n1. Thorough SEO keyword optimization targeting high-value search intent.\n2. Integrate data/case studies of online learning platforms.\n3. Format with clean H1/H2 structure, citations, and metadata.',
    estimatedTime: '8 Hours',
    xpReward: 500
  },
  'Video Production & Editing': {
    title: 'Produce a High-Production-Value Video Tour of SARTHI Platform Features',
    description: 'Plan, script, record, and edit a high-converting, premium feature walk-through video of the SARTHI platform. Key requirements:\n1. Smooth transitions, zoom-ins, and dynamic callouts for key interactive elements.\n2. Incorporate matching ambient background music and professional voiceover.\n3. Deliver in optimized formats for both YouTube and social media reels.',
    estimatedTime: '8 Hours',
    xpReward: 500
  },
  'Marketing & Growth Strategy': {
    title: 'Formulate and Launch a 30-Day Growth Hacking Campaign for SARTHI Juniors',
    description: 'Design an end-to-end strategic growth plan to acquire school partnerships. Key requirements:\n1. Draft high-converting cold email sequences and LinkedIn outreach strategies.\n2. Define clear lead magnets (e.g. free school seminars, custom curriculum audits).\n3. Outline tracking metrics, conversion funnel, and referral mechanisms.',
    estimatedTime: '8 Hours',
    xpReward: 500
  }
};

async function main() {
  const members = await prisma.batchMember.findMany({
    include: {
      user: true,
      batch: {
        include: {
          assignments: {
            include: {
              recipients: true,
              submissions: true
            }
          }
        }
      },
      submissions: {
        include: {
          assignment: true
        }
      },
      assignedRecipients: {
        include: {
          assignment: true
        }
      }
    }
  });

  const now = new Date();
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 7); // 7 days from now

  console.log(`Processing ${members.length} members...`);

  for (const member of members) {
    // 1. Determine all assignments
    const batchAssignments = member.batch.assignments.filter(a => a.mode === 'BATCH');
    const directAssignments = member.assignedRecipients.map(r => r.assignment);
    
    const allAssignedMap = new Map<string, any>();
    batchAssignments.forEach(a => allAssignedMap.set(a.id, a));
    directAssignments.forEach(a => {
      if (a) allAssignedMap.set(a.id, a);
    });
    
    const allAssigned = Array.from(allAssignedMap.values());

    // 2. Check overdue count
    const overdueAssignments = allAssigned.filter(assignment => {
      const deadlinePassed = new Date(assignment.deadline) < now;
      if (!deadlinePassed) return false;

      const submission = member.submissions.find(s => s.assignmentId === assignment.id);
      if (!submission) return true;
      
      const inactiveStatuses = ['Assigned', 'Draft', 'Needs Changes'];
      return inactiveStatuses.includes(submission.status);
    });

    const overdueCount = overdueAssignments.length;
    const isInactive = overdueCount >= 2;

    // 3. Classify Domain
    const workKeywords = allAssigned.map(a => (a.title + ' ' + a.description).toLowerCase());
    let domain: keyof typeof hardJobs = 'Software Development';
    let devCount = 0;
    let designCount = 0;
    let contentCount = 0;
    let videoCount = 0;
    let marketingCount = 0;

    workKeywords.forEach(text => {
      if (text.includes('code') || text.includes('software') || text.includes('backend') || text.includes('database') || text.includes('frontend') || text.includes('next.js') || text.includes('bug') || text.includes('qa') || text.includes('api') || text.includes('llm') || text.includes('system architecture')) devCount++;
      if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('thumbnail') || text.includes('branding') || text.includes('poster') || text.includes('mockup')) designCount++;
      if (text.includes('blog') || text.includes('write') || text.includes('seo') || text.includes('content') || text.includes('article') || text.includes('thesis') || text.includes('research')) contentCount++;
      if (text.includes('video') || text.includes('reel') || text.includes('short') || text.includes('edit') || text.includes('youtube')) videoCount++;
      if (text.includes('marketing') || text.includes('growth') || text.includes('hack') || text.includes('promoting') || text.includes('social media') || text.includes('converting')) marketingCount++;
    });

    const max = Math.max(devCount, designCount, contentCount, videoCount, marketingCount);
    if (max > 0) {
      if (max === devCount) domain = 'Software Development';
      else if (max === designCount) domain = 'UI/UX Design';
      else if (max === contentCount) domain = 'Content & SEO Writing';
      else if (max === videoCount) domain = 'Video Production & Editing';
      else if (max === marketingCount) domain = 'Marketing & Growth Strategy';
    }

    const jobTemplate = hardJobs[domain];

    console.log(`\n--------------------------------------------------`);
    console.log(`Intern: ${member.user.name || 'Unknown'} (${member.user.email})`);
    console.log(`Domain: ${domain}`);
    console.log(`Overdue Assignments: ${overdueCount}`);

    // Create the Hard Job for this Intern if it doesn't already exist
    const existingRecipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: {
        memberId: member.id,
        assignment: {
          title: jobTemplate.title,
          difficulty: 'Hard'
        }
      }
    });

    if (existingRecipient) {
      console.log(`- Hard Job already exists: "${jobTemplate.title}"`);
    } else {
      const createdAssignment = await prisma.internshipAssignment.create({
        data: {
          batchId: member.batchId,
          title: jobTemplate.title,
          description: jobTemplate.description,
          difficulty: 'Hard',
          estimatedTime: jobTemplate.estimatedTime,
          xpReward: jobTemplate.xpReward,
          deadline: deadlineDate,
          mode: 'INDIVIDUAL'
        }
      });

      // Link Recipient
      await prisma.internshipAssignmentRecipient.create({
        data: {
          assignmentId: createdAssignment.id,
          memberId: member.id
        }
      });

      // Also create empty submission record for the recipient (so they see it as Assigned)
      await prisma.internshipSubmission.create({
        data: {
          memberId: member.id,
          assignmentId: createdAssignment.id,
          status: 'Assigned'
        }
      });

      console.log(`- Created Hard Job: "${jobTemplate.title}" (ID: ${createdAssignment.id})`);
    }

    // If Inactive, Send Warn/Suspension Email
    if (isInactive) {
      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>URGENT: Internship Suspension Warning</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #0b0f19;
            color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #111827;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border: 1px solid #1f2937;
          }
          .email-header {
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            padding: 30px 20px;
            text-align: center;
            border-bottom: 1px solid #1f2937;
          }
          .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .email-body {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 20px;
          }
          .message-text {
            font-size: 15px;
            line-height: 1.6;
            color: #d1d5db;
            margin-bottom: 25px;
          }
          .alert-box {
            background-color: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
          }
          .alert-title {
            color: #f87171;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .overdue-list {
            margin: 0;
            padding-left: 20px;
            color: #fca5a5;
            font-size: 14px;
            line-height: 1.5;
          }
          .overdue-list li {
            margin-bottom: 8px;
          }
          .action-btn-container {
            text-align: center;
            margin: 35px 0 20px 0;
          }
          .action-btn {
            background-color: #ef4444;
            color: #ffffff !important;
            padding: 12px 30px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            transition: background-color 0.2s;
          }
          .action-btn:hover {
            background-color: #dc2626;
          }
          .email-footer {
            background-color: #0f172a;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #1f2937;
          }
          .email-footer a {
            color: #3b82f6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>SUSPENSION WARNING</h1>
          </div>
          <div class="email-body">
            <p class="greeting">Hello ${member.user.name || 'Intern'},</p>
            
            <p class="message-text">
              We have noticed a period of inactivity and missed deadlines on your end. Your internship dashboard indicates that you have failed to submit completed assignments on time.
            </p>

            <div class="alert-box">
              <h3 class="alert-title">CRITICAL STATUS: Active Warnings</h3>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #d1d5db;">
                You have <strong>${overdueCount}</strong> overdue assignments:
              </p>
              <ul class="overdue-list">
                ${overdueAssignments.map(a => `<li>${a.title}</li>`).join('')}
              </ul>
            </div>

            <p class="message-text" style="color: #ef4444; font-weight: 600;">
              IMPORTANT: Please submit your pending assignments immediately. Failure to update your progress or submit these assignments within the next 24 hours will lead to the immediate suspension of your internship at SARTHI.
            </p>

            <div class="action-btn-container">
              <a href="https://sarthi-woad.vercel.app/dashboard/internship/assignments" class="action-btn">Go to Internship Dashboard</a>
            </div>
          </div>
          <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} SARTHI. All rights reserved.</p>
            <p>If you have any queries, reply directly to this email or contact your mentor.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      try {
        console.log(`- Sending suspension warning email to: ${member.user.email}`);
        await sendTransactionalEmail({
          to: member.user.email,
          subject: 'URGENT: Internship Suspension Warning - Action Required',
          html: emailHtml,
          type: 'notification',
          userId: member.userId,
          provider: 'resend'
        });
        console.log(`- Email sent successfully!`);
      } catch (err: any) {
        console.error(`- Failed to send email to ${member.user.email}:`, err.message);
      }
    }
  }

  console.log(`\nAll operations completed successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
