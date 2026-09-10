import { prisma } from '../lib/prisma';
import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';

interface Allocation {
  name: string;
  email: string;
  internId: string;
  title: string;
  module: string;
  description: string;
}

const allocations: Allocation[] = [
  {
    name: "Nitin Sinha",
    email: "nitinsinha062@gmail.com",
    internId: "TTI000128",
    title: "SARTHI — Admin Dashboard Development & API Wiring",
    module: "Admin Dashboard (src/app/admin)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Build and wire the complete /admin dashboard routes (src/app/admin/page.jsx, users, courses, analytics). Create backend API routes (src/app/api/admin/*) for user approvals, course monitoring, active user metrics, and audit logs."
  },
  {
    name: "Yash Sahu",
    email: "yashsahu028@gmail.com",
    internId: "TTI000057",
    title: "SARTHI — Teacher Dashboard & Studio Development",
    module: "Teacher Dashboard (src/app/trainer)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Complete and wire the Teacher Dashboard (src/app/trainer/*). Connect frontend forms to teacher-dashboard.service.ts and src/app/api/teacher/*. Implement live session scheduling, quiz builder, assignment grading UI, and attendance management."
  },
  {
    name: "Pranshu Kumar Singh",
    email: "ps859521@gmail.com",
    internId: "TTI000051",
    title: "SARTHI — Student Quiz & Assessment Engine",
    module: "Quiz Engine (/dashboard/quiz)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Connect /dashboard/quiz and /dashboard/quiz/[id] to live /api/student/quizzes. Build timed quiz launcher, live score calculation, answer feedback, and auto-awarding XP upon completion."
  },
  {
    name: "Ranjan Singh",
    email: "ranjansingh.w@gmail.com",
    internId: "TTI000001",
    title: "SARTHI — Student Progress Analytics & Skill Breakdown",
    module: "Progress Analytics (/dashboard/progress)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Connect /dashboard/progress to /api/student/progress. Build XP level progress cards, radar skill chart, learning streak graph, and downloadable performance summary."
  },
  {
    name: "Harsh Nayan",
    email: "harshnayan018@gmail.com",
    internId: "TTI000150",
    title: "SARTHI — Certificate Generation & Verification Engine",
    module: "Certificates Engine (/dashboard/certificates)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Wire /dashboard/certificates to /api/student/certificates. Build automated certificate PDF renderer, unique QR verification link generator, and instant certificate download."
  },
  {
    name: "Japkirat Singh",
    email: "japkiratsingh2007@gmail.com",
    internId: "TTI000002",
    title: "SARTHI — Peer Discussion & Messaging Forum",
    module: "Messaging Forum (/dashboard/messages)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Wire /dashboard/messages to backend messaging APIs. Implement channel selector, code block formatting, instant messaging, and unread counter badge."
  },
  {
    name: "Ayush Jha",
    email: "ayushjhaayush2006@gmail.com",
    internId: "TTI000013",
    title: "SARTHI — Recorded Lecture Catchup Library",
    module: "Recording Library (/api/student/recordings)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Build recording library section under /dashboard/live. Display past lecture recordings, playback speed controls, and timestamp bookmarking."
  },
  {
    name: "Ishan Dwivedi",
    email: "ishan.25scs1003000467@iilm.edu",
    internId: "TTI000017",
    title: "SARTHI — Mobile Responsive Shell & Drawer Navigation",
    module: "Mobile Shell Polish (StudentShell.jsx)",
    description: "Fork https://github.com/mohitraj8503/SARTHI. Audit all dashboard pages on mobile screens (375px - 768px). Fix mobile drawer toggle, overlay backdrop, table scrollbars, and touch button targets."
  }
];

async function main() {
  console.log("=== REMOVING ADITYA SINGH SARTHI RECORDS ===");
  const adityaMember = await prisma.batchMember.findFirst({
    where: { user: { email: "adityasin473@gmail.com" } }
  });

  if (adityaMember) {
    await prisma.internshipAssignmentRecipient.deleteMany({
      where: {
        memberId: adityaMember.id,
        assignment: { idempotencyKey: { startsWith: "SARTHI_ALLOC_" } }
      }
    });

    await prisma.internshipSubmission.deleteMany({
      where: {
        memberId: adityaMember.id,
        assignment: { idempotencyKey: { startsWith: "SARTHI_ALLOC_" } }
      }
    });

    await prisma.internshipAssignment.deleteMany({
      where: {
        memberId: adityaMember.id,
        idempotencyKey: { startsWith: "SARTHI_ALLOC_" }
      }
    });
    console.log("✅ Successfully removed all SARTHI records for Aditya Singh.");
  }

  console.log(`\n🚀 Executing SARTHI Project Allocations for ${allocations.length} Active Interns...`);
  const deadline = new Date("2026-09-09T23:59:59.000Z");

  for (const item of allocations) {
    console.log(`\n--- Processing ${item.name} (${item.internId} | ${item.email}) ---`);
    
    // Find BatchMember record
    const member = await prisma.batchMember.findFirst({
      where: {
        OR: [
          { permanentInternId: item.internId },
          { user: { email: item.email.toLowerCase() } }
        ]
      },
      include: { user: true }
    });

    if (!member) {
      console.log(`⚠️ Member not found for ${item.name}, skipping DB assignment record creation.`);
      continue;
    }

    const idempotencyKey = `SARTHI_ALLOC_20260907_${member.id}_${item.title.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Upsert InternshipAssignment
    const assignment = await prisma.internshipAssignment.upsert({
      where: { idempotencyKey },
      create: {
        batchId: member.batchId,
        title: item.title,
        description: item.description,
        category: "SARTHI Project Development",
        difficulty: "HARD",
        estimatedTime: "12 Hours",
        xpReward: 300,
        deadline,
        scheduledDate: new Date("2026-09-07T00:00:00.000Z"),
        dayNumber: 27,
        week: "Week 4",
        designation: "Software & Web Development Intern",
        campaign: "SARTHI Platform Feature Build",
        phase: "Production Release",
        assetDeliverable: "GitHub Pull Request to mohitraj8503/SARTHI:main + Live Demo Link",
        channel: "GitHub + Student Dashboard",
        cta: "Fork & Submit PR",
        kpi: "Functional Feature Code + Passing API",
        submissionEvidence: "Pull Request URL + Live Demo Link",
        idempotencyKey
      },
      update: {
        title: item.title,
        description: item.description,
        deadline
      }
    });

    // Clean up old assignments for this member if title changed
    await prisma.internshipAssignmentRecipient.deleteMany({
      where: {
        memberId: member.id,
        assignment: {
          idempotencyKey: { startsWith: "SARTHI_ALLOC_" },
          id: { not: assignment.id }
        }
      }
    });

    await prisma.internshipSubmission.deleteMany({
      where: {
        memberId: member.id,
        assignment: {
          idempotencyKey: { startsWith: "SARTHI_ALLOC_" },
          id: { not: assignment.id }
        }
      }
    });

    await prisma.internshipAssignment.deleteMany({
      where: {
        memberId: member.id,
        idempotencyKey: { startsWith: "SARTHI_ALLOC_" },
        id: { not: assignment.id }
      }
    });

    // Ensure recipient entry
    const recipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: { assignmentId: assignment.id, memberId: member.id }
    });
    if (!recipient) {
      await prisma.internshipAssignmentRecipient.create({
        data: { assignmentId: assignment.id, memberId: member.id }
      });
    }

    // Ensure submission entry
    const submission = await prisma.internshipSubmission.findFirst({
      where: { assignmentId: assignment.id, memberId: member.id }
    });
    if (!submission) {
      await prisma.internshipSubmission.create({
        data: { assignmentId: assignment.id, memberId: member.id, status: "Assigned" }
      });
    }

    // Build email with branded.ts template
    const htmlBody = getBrandedTemplate({
      badge: "MANDATORY INTERNSHIP ALLOCATION",
      heading: item.title,
      body: `Dear **${item.name}** (${item.internId}),

You have been assigned a mandatory feature allocation on the official SARTHI platform project **SARTHI** (https://github.com/mohitraj8503/SARTHI).

### Assigned Module: ${item.module}
${item.description}

### Mandatory Action Steps:
1. Fork the official repository: https://github.com/mohitraj8503/SARTHI
2. Implement your assigned module, wire frontend components to live backend API routes, and verify locally.
3. Submit a Pull Request to mohitraj8503/SARTHI:main AND submit your PR link on your Student Dashboard.

**🚨 HARD DEADLINE: 9 SEPTEMBER 2026 (11:59 PM IST)**
Failure to submit your assigned feature by 9 September 2026 will result in immediate suspension of your internship program.`,
      action: {
        label: "Open SARTHI Repository",
        url: "https://github.com/mohitraj8503/SARTHI"
      }
    });

    const emailResult = await sendTransactionalEmail({
      to: item.email,
      subject: `🚨 MANDATORY ALLOCATION: ${item.title} (Deadline: 9 Sept 2026)`,
      html: htmlBody,
      type: "TRANSACTIONAL",
      provider: "resend"
    });

    console.log(`✅ ${item.name}: Email Sent (${emailResult.success ? "Success" : "Failed"}) | Assignment ID: ${assignment.id}`);
  }

  console.log("\n🎉 ALL 8 SARTHI ALLOCATIONS & BRANDED EMAILS EXECUTED SUCCESSFULLY!");
}

main().catch(console.error);
