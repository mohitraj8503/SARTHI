import { prisma } from '../lib/prisma';

async function main() {
  const batchId = 'cmr5vh9ze0002xhb424ocehpb'; // July 2026 Batch
  const memberIds = [
    'cmsxf3au9000n13s90ywgw4ih', // Keshav Ruhela
    'cmsg3rexe000d13xhytb0u49t', // Nitin Sinha
    'cmr9fui19000de5m4bhd4n0tw', // Om Prabhat
    'cmsxif9810009f2c6trpu29ux', // Ranjan Singh
  ];

  const title = 'NyayaSetu — India’s Citizen Action Guide';
  const description = `## Project Overview
NyayaSetu is a citizen-focused web platform designed to help people understand **where to go, what action to take, what documents may be required, and how to reach the appropriate official government service** for common problems.

The objective is not to create another government portal. NyayaSetu will act as an independent, easy-to-use guidance layer that directs citizens to the appropriate official sources.

### Team Assigned: Team Sankalp
• **Ranjan Singh**
• **Om Prabhat**
• **Nitin Sinha**
• **Keshav Ruhela**

---

### Technology Stack
For this internship MVP, use:
• HTML5
• CSS3
• JavaScript (ES6+)
• JSON / structured local data
• LocalStorage
• Git & GitHub

No backend or AI is required for the initial 7-day MVP.

---

### Core Features
The MVP should include:
• Citizen-friendly landing page
• Problem/category discovery
• Search and filtering
• Multi-step problem selection flow
• Appropriate authority/official portal recommendation
• Step-by-step action plan
• Required document/evidence checklist
• Complaint/draft generator
• Complaint/action tracker using LocalStorage
• Responsive mobile-first design
• Hindi + English ready architecture
• Official government links only
• Clear privacy and disclaimer messaging

---

### Important Government-Portal Rule
NyayaSetu must **not** present itself as a government website or official government representative.

Do **not**:
• Copy government branding or logos
• Collect government login credentials
• Collect OTPs, Aadhaar/PAN passwords or sensitive credentials
• Pretend to submit complaints on behalf of a government department
• Create fake government APIs
• Use unofficial or misleading government URLs
• Claim that NyayaSetu is an official Government of India service

When official information is required, always prefer the relevant **official government website/source**.

---

### 7-Day Development Target
• **Day 1:** Planning, research, UI structure and Git setup
• **Day 2:** Homepage, categories, problem database and search
• **Day 3:** Multi-step problem finder and validation
• **Day 4:** Recommendation/rules engine and authority mapping
• **Day 5:** Complaint draft generator and document checklist
• **Day 6:** Tracker, LocalStorage, responsive design and refinement
• **Day 7:** Testing, bug fixing, deployment and final documentation

---

### Expected Deliverables
By the end of the assignment, the team must submit:
1. Fully working responsive website
2. GitHub repository
3. Clean HTML/CSS/JavaScript source code
4. README.md with setup and project explanation
5. Government-source/reference documentation
6. Testing report
7. Screenshots of major pages
8. Final project presentation/demo
9. Final deployed website link
10. Short contribution report from every team member

---

### Development Standards
Please maintain:
• Clean and reusable code
• Meaningful variable/function names
• Responsive design
• Accessibility-friendly UI
• Proper Git commits
• No hard-coded duplicated logic where avoidable
• No copied code without understanding it
• Proper error and empty states
• Clear comments for important JavaScript logic

Most importantly, **build the project as a real product, not merely as a college assignment.**

Every major feature should answer one question:
> *“How does this make it easier for an Indian citizen to take the right action?”*

The complete project documentation, UI direction, architecture and 7-day implementation plan are provided along with this assignment.

### Final Goal
By Day 7, Team Sankalp should be able to demonstrate:
**Problem → Guidance → Official Source → Action Plan → Complaint Draft → Tracking**`;

  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days from today (25-Aug-2026)

  // Check if assignment already exists for this batch with this title
  let assignment = await prisma.internshipAssignment.findFirst({
    where: {
      batchId,
      title,
    },
  });

  if (!assignment) {
    assignment = await prisma.internshipAssignment.create({
      data: {
        batchId,
        title,
        description,
        category: 'Major Team Project',
        difficulty: 'Advanced',
        estimatedTime: '7 Days',
        xpReward: 500,
        deadline,
        mode: 'MULTI',
        status: 'active',
        recipients: {
          create: memberIds.map(mId => ({ memberId: mId })),
        },
      },
    });
    console.log(`✅ Assignment created successfully! ID: ${assignment.id}`);
  } else {
    // Update existing assignment
    assignment = await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: {
        description,
        deadline,
        status: 'active',
      },
    });
    console.log(`✅ Existing assignment updated! ID: ${assignment.id}`);

    // Ensure all recipients exist
    for (const mId of memberIds) {
      const existing = await prisma.internshipAssignmentRecipient.findFirst({
        where: { assignmentId: assignment.id, memberId: mId },
      });
      if (!existing) {
        await prisma.internshipAssignmentRecipient.create({
          data: { assignmentId: assignment.id, memberId: mId },
        });
      }
    }
  }

  console.log(`🎉 NyayaSetu project assignment successfully added to Intern Dashboards for:`);
  console.log(`   1. Keshav Ruhela`);
  console.log(`   2. Nitin Sinha`);
  console.log(`   3. Om Prabhat`);
  console.log(`   4. Ranjan Singh`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
