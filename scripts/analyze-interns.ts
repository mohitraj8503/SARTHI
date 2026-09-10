import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.batchMember.findMany({
    include: {
      user: true,
      batch: {
        include: {
          assignments: {
            include: {
              recipients: true,
              submissions: {
                where: {
                  // we'll fetch all submissions for this batch's assignments
                }
              }
            }
          }
        }
      },
      submissions: {
        include: {
          assignment: true,
          versions: true,
        }
      },
      assignedRecipients: {
        include: {
          assignment: true,
        }
      }
    }
  });

  console.log(`Analyzing ${members.length} members...`);

  const now = new Date();

  const report = members.map(member => {
    // 1. Find all assignments that apply to this member:
    // Either the assignment has mode "BATCH" and belongs to the member's batch,
    // or the assignment has mode "INDIVIDUAL"/"MULTI" and the member is in recipients.
    const batchAssignments = member.batch.assignments.filter(a => a.mode === 'BATCH');
    const directAssignments = member.assignedRecipients.map(r => r.assignment);
    
    // Combine unique assignments
    const allAssignedMap = new Map<string, any>();
    batchAssignments.forEach(a => allAssignedMap.set(a.id, a));
    directAssignments.forEach(a => {
      if (a) allAssignedMap.set(a.id, a);
    });
    
    const allAssigned = Array.from(allAssignedMap.values());

    // 2. Check for overdue assignments
    // Overdue = deadline < now AND no submission with status like 'Approved', 'Resubmitted', 'Waiting for Review', etc.
    // Or if there is no submission at all, or if the submission status is 'Assigned' / 'Needs Changes' / 'Draft'
    const overdueAssignments = allAssigned.filter(assignment => {
      const deadlinePassed = new Date(assignment.deadline) < now;
      if (!deadlinePassed) return false;

      const submission = member.submissions.find(s => s.assignmentId === assignment.id);
      if (!submission) {
        return true; // No submission at all
      }
      
      // If submission status is not complete/active
      // Allowed active/completed statuses: 'Approved', 'Waiting for Review', 'Resubmitted', 'In Progress', 'Started'
      // If it's still 'Assigned' or 'Draft' or 'Needs Changes' (and they haven't resubmitted), it's overdue.
      const inactiveStatuses = ['Assigned', 'Draft', 'Needs Changes'];
      return inactiveStatuses.includes(submission.status);
    });

    const isActive = overdueAssignments.length === 0;

    // 3. Determine their domain / work type
    // Look at titles of assignments they have submitted or been assigned
    const workKeywords = allAssigned.map(a => (a.title + ' ' + a.description).toLowerCase());
    
    let domain = 'Software Development'; // default
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

    return {
      id: member.id,
      name: member.user.name || 'Unknown Intern',
      email: member.user.email,
      batchName: member.batch.name,
      batchId: member.batch.id,
      status: member.status,
      assignedCount: allAssigned.length,
      overdueCount: overdueAssignments.length,
      overdueTitles: overdueAssignments.map(a => a.title),
      isActive,
      domain
    };
  });

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
