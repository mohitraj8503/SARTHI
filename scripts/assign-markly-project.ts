import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignMarklyTask() {
  console.log('🚀 Allocating Project Markly task to all intern dashboards...');

  const batch = await prisma.internshipBatch.findFirst({});
  if (!batch) {
    console.error('❌ No active internship batch found in database!');
    return;
  }

  const batchId = batch.id;
  console.log(`📌 Target Batch ID: ${batchId}`);

  const title = '🚀 Project Markly: AI Examination & Step-Wise Evaluation Platform';
  const description = `# 🎓 Markly — Intern Project Brief, Architecture & Weekly Tasks

**Project Name:** Markly (AI Teacher Test Paper Maker & Automatic Answer Checker)  
**Repository:** https://github.com/mohitraj8503/Markly  
**Live Preview:** https://markly.mohitraj8503.workers.dev/templates  
**Lead / Maintainer:** Mohit Raj (@mohitraj8503)  

---

## 📌 Executive Summary: What is Markly?

**Markly** is an AI-powered examination creation and automated evaluation operating system designed for schools, universities, coaching institutes, and independent educators.

### Core Promise:
> *"AI reads the paper, extracts step-wise process evidence, awards granular partial credit, and the teacher retains 100% final authority to verify or adjust."*

---

## 📋 Track Tasks

### Track 1: Frontend & UI/UX Engineers (Web Dev Interns)
1. **Template Customizer Canvas (\`src/app/templates/page.tsx\`)**:
   - Expand the live A4 preview with additional institutional header presets (CBSE, State Board, University Dual-Column format).
   - Add watermark and logo upload preview in header section.
2. **Review Workspace Zoom & Annotation Tools (\`src/app/grade/page.tsx\`)**:
   - Implement smooth pan/zoom on handwritten answer sheet crop.
   - Add interactive red pen pin-markers where teachers can click to pin audit notes.
3. **Question Bank Bulk Tagging (\`src/app/questions/page.tsx\`)**:
   - Add multi-select checkboxes to assemble questions into draft exam directly from bank.

### Track 2: Backend & Database Engineers (Software Dev Interns)
1. **PostgreSQL Production Migration (\`prisma/schema.postgresql.prisma\`)**:
   - Connect Supabase/Neon PostgreSQL instance via DATABASE_URL.
   - Write migration scripts for production multi-tenant constraints.
2. **Audit Trail Persistence & Export (\`src/app/api/evaluations/[id]/review/route.ts\`)**:
   - Implement CSV/PDF export endpoint for complete immutable AuditLog history.
3. **Batch Submissions Upload API**:
   - Endpoint \`POST /api/submissions/batch\` accepting multiple student PDF scans in a zip/payload.

### Track 3: AI Pipeline & Genkit Flow Engineers (AI/ML Interns)
1. **Equivalence & Alternative Method Tolerance (\`src/ai/flows/evaluate-marking-steps.ts\`)**:
   - Enhance prompt to credit valid alternative mathematical proofs or equivalent algorithmic notations.
2. **Handwriting Legibility Confidence Scoring**:
   - Refine OCR extraction confidence so smudged scans reliably trigger LOW_MANUAL_REVIEW routing gate.

---

## ⚡ Quick Setup
\`\`\`bash
git clone https://github.com/mohitraj8503/Markly.git
cd Markly
npm install
npx prisma db push && npx prisma generate
npx tsx prisma/seed.ts
npm run dev
\`\`\`

## ⚠️ Non-Negotiable Coding Rules
1. **ZERO Hardcoded Mock Data**: Every number, count, chart, and status must be fetched from the database.
2. **Stick to the 5-Token Physical Paper Palette**: (#FAF8F3, #1C1C1E, #26415C, #B23A2E, #5C7A5C).`;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);

  // 1. Create or Update Assignment in Database
  let assignment = await prisma.internshipAssignment.findFirst({
    where: { batchId, title }
  });

  if (!assignment) {
    assignment = await prisma.internshipAssignment.create({
      data: {
        batchId,
        title,
        description,
        category: 'Core Project Sprint',
        difficulty: 'Hard',
        estimatedTime: '15 Hours',
        xpReward: 500,
        deadline,
        mode: 'MULTI',
        status: 'active'
      }
    });
    console.log(`✅ Created Database Assignment (ID: ${assignment.id})`);
  } else {
    assignment = await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: { description, deadline, status: 'active' }
    });
    console.log(`✅ Updated Database Assignment (ID: ${assignment.id})`);
  }

  // 2. Fetch all members of batch
  const members = await prisma.batchMember.findMany({
    where: { batchId },
    include: { user: true }
  });

  console.log(`\nFound ${members.length} intern members in batch.`);

  for (const m of members) {
    // Link Recipient
    await prisma.internshipAssignmentRecipient.upsert({
      where: {
        assignmentId_memberId: {
          assignmentId: assignment.id,
          memberId: m.id
        }
      },
      create: {
        assignmentId: assignment.id,
        memberId: m.id
      },
      update: {}
    });

    // Create Initial Submission record (Status: Assigned)
    const existingSub = await prisma.internshipSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: m.id
      }
    });

    if (!existingSub) {
      await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId: m.id,
          status: 'Assigned'
        }
      });
    }

    console.log(`  ✓ Task live on dashboard for: ${m.user.name || m.user.email} (${m.user.email})`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Project Markly task allocated live to ALL intern dashboards!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

assignMarklyTask()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
