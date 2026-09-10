import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

function resolveExcelDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Excel date serial number to JS Date
    const date = new Date((val - 25569) * 86400 * 1000);
    // Adjust timezone offset to get correct UTC/IST date matching what was displayed
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + tzOffset);
  }
  if (typeof val === 'string') {
    const clean = val.trim();
    if (!clean) return null;
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

// Convert Excel status to database InternshipSubmission status
function mapExcelStatus(excelStatus: string): string {
  const status = (excelStatus || '').trim().toLowerCase();
  switch (status) {
    case 'not started':
    case 'not_started':
      return 'Assigned';
    case 'not submitted':
    case 'not_submitted':
      return 'Assigned';
    case 'in progress':
    case 'in_progress':
      return 'In Progress';
    case 'submitted':
      return 'Waiting for Review';
    case 'under review':
    case 'under_review':
      return 'Waiting for Review';
    case 'verified':
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Assigned'; // fallback
  }
}

async function main() {
  const excelPath = 'C:\\Users\\mohit\\Downloads\\SARTHI.xlsx';
  console.log(`Loading Excel plan from ${excelPath}...`);

  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['Daily Intern Actions'];
  if (!sheet) {
    console.error("Sheet 'Daily Intern Actions' not found!");
    process.exit(1);
  }

  const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  console.log(`Found ${rows.length} rows in the Excel sheet.`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let missingInternCount = 0;
  let invalidDateCount = 0;

  const missingInternIds = new Set<string>();

  // Fetch July 2026 Batch or create if not exists
  let batch = await prisma.internshipBatch.findFirst({
    where: { name: { contains: 'July 2026' } }
  });

  if (!batch) {
    const internship = await prisma.internship.findFirst() || await prisma.internship.create({
      data: {
        title: "Software Development & Creator Internship",
        description: "Master full-stack software development, technical content writing, and creator workflows.",
      }
    });
    batch = await prisma.internshipBatch.create({
      data: {
        internshipId: internship.id,
        name: "July 2026 Batch",
        mentorName: "Mukul Pandey",
        mentorEmail: "pm.enthuse@gmail.com"
      }
    });
  }

  // Pre-load all batch members in memory to optimize lookups
  console.log("Caching BatchMembers...");
  const members = await prisma.batchMember.findMany({
    include: { user: true }
  });
  const memberMap = new Map<string, typeof members[0]>();
  for (const m of members) {
    if (m.permanentInternId) {
      memberMap.set(m.permanentInternId, m);
    }
  }

  // Pre-load existing assignments
  console.log("Caching existing assignments...");
  const existingAssignments = await prisma.internshipAssignment.findMany();
  const assignmentMap = new Map<string, typeof existingAssignments[0]>();
  for (const a of existingAssignments) {
    if (a.memberId && a.scheduledDate) {
      const key = `${a.memberId}_${a.scheduledDate.toISOString().split('T')[0]}`;
      assignmentMap.set(key, a);
    }
  }

  // Pre-load existing recipients
  console.log("Caching recipients...");
  const existingRecipients = await prisma.internshipAssignmentRecipient.findMany();
  const recipientSet = new Set<string>();
  for (const r of existingRecipients) {
    recipientSet.add(`${r.assignmentId}_${r.memberId}`);
  }

  // Pre-load existing submissions
  console.log("Caching submissions...");
  const existingSubmissions = await prisma.internshipSubmission.findMany();
  const submissionMap = new Map<string, typeof existingSubmissions[0]>();
  for (const s of existingSubmissions) {
    submissionMap.set(`${s.assignmentId}_${s.memberId}`, s);
  }

  console.log("Processing records concurrently in batches...");
  const batchSize = 30;
  for (let idx = 0; idx < rows.length; idx += batchSize) {
    const chunk = rows.slice(idx, idx + batchSize);
    console.log(`Processing batch ${idx / batchSize + 1} of ${Math.ceil(rows.length / batchSize)}...`);
    
    await Promise.all(chunk.map(async (row, chunkIdx) => {
      const internId = row['Intern ID'];
      const rawDate = row['Date'];

      if (!internId) {
        skippedCount++;
        return;
      }

      const scheduledDate = resolveExcelDate(rawDate);
      if (!scheduledDate) {
        console.warn(`Invalid date format: ${rawDate}`);
        invalidDateCount++;
        skippedCount++;
        return;
      }

      const startOfDayUTC = new Date(Date.UTC(
        scheduledDate.getFullYear(),
        scheduledDate.getMonth(),
        scheduledDate.getDate()
      ));

      const member = memberMap.get(internId);
      if (!member) {
        missingInternIds.add(internId);
        missingInternCount++;
        skippedCount++;
        return;
      }

      const deadline = new Date(startOfDayUTC.getTime() + (18.5 * 60 * 60 * 1000));
      const releaseAt = new Date(startOfDayUTC.getTime() + (4.5 * 60 * 60 * 1000));
      const isFuture = startOfDayUTC.getTime() > Date.now();
      const assignmentStatus = isFuture ? 'scheduled' : 'active';

      const title = row['What to Promote'] || row['Campaign'] || 'Daily Assignment';
      const description = row['How to Promote / Exact Action'] || '';

      const assignmentKey = `${member.id}_${startOfDayUTC.toISOString().split('T')[0]}`;
      let assignment = assignmentMap.get(assignmentKey);

      const assignmentData = {
        batchId: member.batchId,
        title,
        description,
        category: 'Daily Assignment',
        difficulty: 'Intermediate',
        estimatedTime: '2 Hours',
        xpReward: 100,
        deadline,
        releaseAt,
        status: assignmentStatus,
        mode: 'INDIVIDUAL',
        dayNumber: row['Day'] ? Number(row['Day']) : null,
        scheduledDate: startOfDayUTC,
        week: row['Week'] ? String(row['Week']) : null,
        designation: row['Designation'] ? String(row['Designation']) : null,
        campaign: row['Campaign'] ? String(row['Campaign']) : null,
        phase: row['Phase'] ? String(row['Phase']) : null,
        assetDeliverable: row['Asset / Deliverable'] ? String(row['Asset / Deliverable']) : null,
        channel: row['Channel'] ? String(row['Channel']) : null,
        cta: row['CTA'] ? String(row['CTA']) : null,
        kpi: row['KPI'] ? String(row['KPI']) : null,
        submissionEvidence: row['Submission Evidence'] ? String(row['Submission Evidence']) : null,
        memberId: member.id
      };

      if (assignment) {
        assignment = await prisma.internshipAssignment.update({
          where: { id: assignment.id },
          data: assignmentData
        });
        updatedCount++;
      } else {
        assignment = await prisma.internshipAssignment.create({
          data: assignmentData
        });
        insertedCount++;
      }

      // Link Recipient
      const recipientKey = `${assignment.id}_${member.id}`;
      if (!recipientSet.has(recipientKey)) {
        await prisma.internshipAssignmentRecipient.create({
          data: {
            assignmentId: assignment.id,
            memberId: member.id
          }
        });
        recipientSet.add(recipientKey);
      }

      // Sync Submission
      const submissionKey = `${assignment.id}_${member.id}`;
      const submission = submissionMap.get(submissionKey);

      const subStatus = mapExcelStatus(row['Status'] || 'Not Started');
      const submissionTime = resolveExcelDate(row['Submission Time']);
      const liveDemoLink = row['Live Demo / Project Link'] || row['Open Link ↗'] || row['Open Demo'] || null;

      const submissionData = {
        memberId: member.id,
        assignmentId: assignment.id,
        status: subStatus,
        liveDemoProjectLink: liveDemoLink ? String(liveDemoLink) : null,
        linkType: row['Link Type'] ? String(row['Link Type']) : null,
        demoProjectStatus: row['Demo / Project Status'] ? String(row['Demo / Project Status']) : null,
        reviewerFeedback: row['Reviewer Feedback'] ? String(row['Reviewer Feedback']) : null,
        notes: row['Notes'] ? String(row['Notes']) : null,
        submissionTime,
        mentorFeedback: row['Mentor Feedback'] ? String(row['Mentor Feedback']) : null
      };

      if (submission) {
        await prisma.internshipSubmission.update({
          where: { id: submission.id },
          data: submissionData
        });
      } else {
        await prisma.internshipSubmission.create({
          data: submissionData
        });
      }
    }));
  }

  console.log("\n=== Seeding Summary ===");
  console.log(`Excel rows processed: ${rows.length}`);
  console.log(`Inserted assignments: ${insertedCount}`);
  console.log(`Updated assignments: ${updatedCount}`);
  console.log(`Skipped rows: ${skippedCount}`);
  console.log(`Invalid dates: ${invalidDateCount}`);
  console.log(`Missing interns: ${missingInternCount}`);
  if (missingInternIds.size > 0) {
    console.log(`Missing Intern IDs in DB:`, Array.from(missingInternIds));
  }
}

main()
  .catch(err => {
    console.error("Critical seeder error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
