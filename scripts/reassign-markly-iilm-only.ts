import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reassignMarklyToIILMOnly() {
  console.log('🔄 Re-allocating Project Markly task on dashboard STRICTLY for IILM Web Dev & Software Dev interns without completion letters...');

  // 1. Get the assignment
  const assignment = await prisma.internshipAssignment.findFirst({
    where: {
      title: '🚀 Project Markly: AI Examination & Step-Wise Evaluation Platform'
    }
  });

  if (!assignment) {
    console.error('❌ Assignment not found!');
    return;
  }

  console.log(`📌 Assignment ID: ${assignment.id}`);

  // 2. Identify the exact 17 targeted IILM Web Dev & Software Dev interns
  const iilmApps = await prisma.internshipApplication.findMany({
    where: {
      college: { contains: 'IILM' },
      domain: { in: ['Web Development', 'Full Stack Web Development', 'Software Development'] },
      status: { in: ['APPROVED', 'OFFER_ACCEPTED'] }
    }
  });

  const issuedCerts = await prisma.issuedCertificate.findMany({});
  const issuedUserIds = new Set(issuedCerts.map(c => c.userId));

  const targetApps = iilmApps.filter(a => !issuedUserIds.has(a.studentId));
  const targetStudentIds = new Set(targetApps.map(a => a.studentId));
  const targetEmails = new Set(targetApps.map(a => a.email.toLowerCase()));

  console.log(`\nTargeted Intern Count: ${targetApps.length}`);
  for (const a of targetApps) {
    console.log(` - ${a.name} (${a.email}) | ${a.domain}`);
  }

  // 3. Get all batch members
  const allMembers = await prisma.batchMember.findMany({
    include: { user: true }
  });

  const targetMemberIds = new Set<string>();
  const nonTargetMemberIds = new Set<string>();

  for (const m of allMembers) {
    const isTarget = targetStudentIds.has(m.userId) || targetEmails.has(m.user.email.toLowerCase());
    if (isTarget) {
      targetMemberIds.add(m.id);
    } else {
      nonTargetMemberIds.add(m.id);
    }
  }

  console.log(`\nMatching Batch Members for Target Interns: ${targetMemberIds.size}`);
  console.log(`Non-Target Batch Members to Remove: ${nonTargetMemberIds.size}`);

  // 4. Remove recipients and submissions for NON-target members
  if (nonTargetMemberIds.size > 0) {
    const deletedRecipients = await prisma.internshipAssignmentRecipient.deleteMany({
      where: {
        assignmentId: assignment.id,
        memberId: { in: Array.from(nonTargetMemberIds) }
      }
    });

    const deletedSubmissions = await prisma.internshipSubmission.deleteMany({
      where: {
        assignmentId: assignment.id,
        memberId: { in: Array.from(nonTargetMemberIds) }
      }
    });

    console.log(`\n🧹 Removed ${deletedRecipients.count} non-target recipients.`);
    console.log(`🧹 Removed ${deletedSubmissions.count} non-target submissions.`);
  }

  // 5. Ensure recipient & submission exist for every target member
  for (const memberId of targetMemberIds) {
    await prisma.internshipAssignmentRecipient.upsert({
      where: {
        assignmentId_memberId: {
          assignmentId: assignment.id,
          memberId
        }
      },
      create: {
        assignmentId: assignment.id,
        memberId
      },
      update: {}
    });

    const existingSub = await prisma.internshipSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId
      }
    });

    if (!existingSub) {
      await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId,
          status: 'Assigned'
        }
      });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Project Markly task is NOW EXCLUSIVELY assigned to IILM Web Dev & Software Dev interns!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

reassignMarklyToIILMOnly()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
