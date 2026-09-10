import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const day5TaskTitle = '📅 DAY 5 TASK – Bring 10 Students to Our AI Seminar 🎯';

const day5MarkdownDescription = `### 📅 DAY 5 TASK – Bring 10 Students to Our AI Seminar

**Overview:**
Today is your biggest challenge yet. A digital marketer is judged by their ability to influence people, build trust, and drive real participation.

🎯 **Seminar to Promote:**
**AI Tools Every Student Must Master in 2026**
🌐 https://sarthi-woad.vercel.app/seminars/ai-tools-every-student-must-master-2026

---

### 🚀 Your Mission
Bring at least **10 students** who successfully register for this seminar through your promotion.

**This task tests your:**
- Marketing Skills
- Communication Skills
- Networking Ability
- Creativity & Content Strategy

---

### 📢 Promote Everywhere
Share the seminar across:
- 💼 LinkedIn
- 📸 Instagram
- 📱 WhatsApp Status & Groups
- ✈ Telegram Groups
- 🎓 College Groups & Discord Communities
- 🤝 Friends & Personal Network

---

### 🎨 What You Can Create
- Promotional Poster
- Instagram Reel or Story Series
- Carousel Post / LinkedIn Post
- Short Promotional Video / Creative Advertisement

---

### 📝 Why Students Should Join:
- Learn the most useful AI tools for 2026
- Improve productivity using AI
- Gain practical knowledge for projects and internships
- Build future-ready skills & learn from industry experts

---

### 📤 Submission Requirements
Submit in both the **Internship Workspace** and **Interns Group**:
1. LinkedIn Post Link
2. Instagram Post / Reel Link
3. Poster or Reel File / Link
4. Screenshots of your promotions
5. Number of students you convinced to register

🏆 **Bonus Challenge:** The intern who brings the highest number of successful seminar registrations will receive **Special Recognition** from SARTHI.

⏰ **Deadline:** Tomorrow • 2:00 PM IST (02 August 2026)`;

const prateekTaskTitle = '✍️ SPECIAL TASK – Write a Comprehensive Blog Post on AI Tools Seminar 2026 📝';

const prateekTaskDescription = `### ✍️ SPECIAL TASK – Write a Comprehensive Blog Post on AI Tools Seminar 2026

**Overview:**
Create and publish a well-researched, engaging blog post on SARTHI showcasing our upcoming flagship seminar: **AI Tools Every Student Must Master in 2026**.

🌐 **Seminar Link:** https://sarthi-woad.vercel.app/seminars/ai-tools-every-student-must-master-2026

---

### 📝 Key Content Highlights to Cover:
1. **Introduction:** Why AI literacy is mandatory for students in 2026.
2. **Top AI Tools Covered:** Productive AI tools for research, coding, writing, and design.
3. **Seminar Value Proposition:** Practical industry insights, live demonstrations, and skill acceleration.
4. **Call to Action (CTA):** Clear invitation and link encouraging readers to register for the seminar immediately.

---

### 📤 Submission Requirements:
- Published Blog Draft / Link on SARTHI Blog Portal
- Deadline: Tomorrow • 2:00 PM IST (02 August 2026)`;

async function main() {
  const batch = await prisma.internshipBatch.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      members: {
        include: {
          user: true,
        }
      }
    }
  });

  if (!batch) {
    console.error('No active batch found');
    return;
  }

  const deadlineDate = new Date('2026-08-02T14:00:00+05:30');

  // Get all Digital Marketing Applications
  const dmApps = await prisma.internshipApplication.findMany({
    where: {
      OR: [
        { domain: { contains: 'Digital Marketing' } },
        { trackSlug: { contains: 'digital-marketing' } },
      ]
    }
  });
  const dmEmails = new Set(dmApps.map(a => a.email.toLowerCase()));

  // 1. Create Day 5 Assignment in DB
  let day5Assignment = await prisma.internshipAssignment.findFirst({
    where: { batchId: batch.id, title: day5TaskTitle }
  });

  if (!day5Assignment) {
    day5Assignment = await prisma.internshipAssignment.create({
      data: {
        batchId: batch.id,
        title: day5TaskTitle,
        description: day5MarkdownDescription,
        category: 'Digital Marketing',
        difficulty: 'Hard',
        estimatedTime: '4 Hours',
        xpReward: 500,
        deadline: deadlineDate,
        mode: 'INDIVIDUAL'
      }
    });
    console.log('✅ Created Day 5 DB Assignment ID:', day5Assignment.id);
  }

  // 2. Create Prateek Blog Writing Assignment in DB
  let prateekAssignment = await prisma.internshipAssignment.findFirst({
    where: { batchId: batch.id, title: prateekTaskTitle }
  });

  if (!prateekAssignment) {
    prateekAssignment = await prisma.internshipAssignment.create({
      data: {
        batchId: batch.id,
        title: prateekTaskTitle,
        description: prateekTaskDescription,
        category: 'Content Writing',
        difficulty: 'Medium',
        estimatedTime: '3 Hours',
        xpReward: 450,
        deadline: deadlineDate,
        mode: 'INDIVIDUAL'
      }
    });
    console.log('✅ Created Prateek DB Assignment ID:', prateekAssignment.id);
  }

  // Filter Digital Marketing Members
  const dmMembers = batch.members.filter(m => {
    const email = (m.user?.email || '').toLowerCase();
    const course = (m.user?.currentCourse || '').toLowerCase();
    return dmEmails.has(email) || course.includes('digital') || course.includes('marketing');
  });

  console.log(`Assigning Day 5 Task to ${dmMembers.length} Digital Marketing Interns...`);

  for (const m of dmMembers) {
    const existingRecipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: { assignmentId: day5Assignment.id, memberId: m.id }
    });
    if (!existingRecipient) {
      await prisma.internshipAssignmentRecipient.create({
        data: { assignmentId: day5Assignment.id, memberId: m.id }
      });
    }

    const existingSubmission = await prisma.internshipSubmission.findFirst({
      where: { assignmentId: day5Assignment.id, memberId: m.id }
    });
    if (!existingSubmission) {
      await prisma.internshipSubmission.create({
        data: { assignmentId: day5Assignment.id, memberId: m.id, status: 'Assigned' }
      });
    }
    console.log(`  - Assigned Day 5 to: ${m.user.name} (${m.user.email})`);
  }

  // Find Prateek Member
  const prateekMember = batch.members.find(m =>
    (m.user.name || '').toLowerCase().includes('prateek') ||
    (m.user.email || '').toLowerCase().includes('prateek')
  );

  if (prateekMember) {
    const existingRecipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: { assignmentId: prateekAssignment.id, memberId: prateekMember.id }
    });
    if (!existingRecipient) {
      await prisma.internshipAssignmentRecipient.create({
        data: { assignmentId: prateekAssignment.id, memberId: prateekMember.id }
      });
    }

    const existingSubmission = await prisma.internshipSubmission.findFirst({
      where: { assignmentId: prateekAssignment.id, memberId: prateekMember.id }
    });
    if (!existingSubmission) {
      await prisma.internshipSubmission.create({
        data: { assignmentId: prateekAssignment.id, memberId: prateekMember.id, status: 'Assigned' }
      });
    }
    console.log(`\n✅ Assigned Blog Writing Task to Prateek: ${prateekMember.user.name} (${prateekMember.user.email})`);
  } else {
    console.log('\n⚠️ Prateek Member not found in active batch members list');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
