import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';
import fs from 'fs';
import path from 'path';

const RECIPIENTS = [
  { name: 'Ranjan Singh', email: 'ranjansingh.w@gmail.com' },
  { name: 'Om Prabhat', email: 'omprabhat2106@gmail.com' },
  { name: 'Nitin Sinha', email: 'nitinsinha062@gmail.com' },
  { name: 'Keshav Ruhela', email: 'keshavruhela25@gmail.com' },
];

const PDF_PATH = 'C:\\Users\\mohit\\Downloads\\Nyaya Setu - SARTHI.pdf';
const DOCX_PATH = 'C:\\Users\\mohit\\Downloads\\Nyaya Setu - SARTHI.docx';

async function main() {
  const isConfirm = process.argv.includes('--confirm');

  console.log('----------------------------------------------------');
  console.log('📧 NYAYA SETU ASSIGNMENT EMAIL BROADCAST PREVIEW');
  console.log('----------------------------------------------------');

  if (!fs.existsSync(PDF_PATH) || !fs.existsSync(DOCX_PATH)) {
    console.error('❌ Error: Missing required attachment files in Downloads!');
    console.error('PDF Exists:', fs.existsSync(PDF_PATH));
    console.error('DOCX Exists:', fs.existsSync(DOCX_PATH));
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const docxBuffer = fs.readFileSync(DOCX_PATH);

  console.log(`✅ PDF Attachment Loaded: ${path.basename(PDF_PATH)} (${pdfBuffer.length} bytes)`);
  console.log(`✅ DOCX Attachment Loaded: ${path.basename(DOCX_PATH)} (${docxBuffer.length} bytes)`);
  console.log('\n📋 Target Recipients (Team Sankalp):');
  RECIPIENTS.forEach((r, i) => console.log(`   ${i + 1}. ${r.name} <${r.email}>`));

  const bodyContent = `Dear **Team Sankalp**,

I hope you are doing well.

You have been assigned your first major team project as part of the **SARTHI Web Development Internship**.

### Project: NyayaSetu — India’s Citizen Action Guide

NyayaSetu is a citizen-focused web platform designed to help people understand **where to go, what action to take, what documents may be required, and how to reach the appropriate official government service** for common problems.

The objective is not to create another government portal. NyayaSetu will act as an independent, easy-to-use guidance layer that directs citizens to the appropriate official sources.

### Technology Stack
For this internship MVP, use:
• HTML5
• CSS3
• JavaScript (ES6+)
• JSON / structured local data
• LocalStorage
• Git & GitHub

No backend or AI is required for the initial 7-day MVP.

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

### Important Government-Portal Rule
NyayaSetu must **not** present itself as a government website or official government representative.

Do not:
• Copy government branding or logos
• Collect government login credentials
• Collect OTPs, Aadhaar/PAN passwords or sensitive credentials
• Pretend to submit complaints on behalf of a government department
• Create fake government APIs
• Use unofficial or misleading government URLs
• Claim that NyayaSetu is an official Government of India service

When official information is required, always prefer the relevant **official government website/source**.

### 7-Day Development Target
• **Day 1:** Planning, research, UI structure and Git setup
• **Day 2:** Homepage, categories, problem database and search
• **Day 3:** Multi-step problem finder and validation
• **Day 4:** Recommendation/rules engine and authority mapping
• **Day 5:** Complaint draft generator and document checklist
• **Day 6:** Tracker, LocalStorage, responsive design and refinement
• **Day 7:** Testing, bug fixing, deployment and final documentation

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

Please go through the documentation carefully before beginning development.

### Final Goal
By Day 7, Team Sankalp should be able to demonstrate:
**Problem → Guidance → Official Source → Action Plan → Complaint Draft → Tracking**

The final product should look professional enough to be presented as a potential future startup/product, while remaining technically achievable within the internship timeline.

All team members are expected to contribute actively and maintain the project repository throughout development.`;

  const emailHtml = getBrandedTemplate({
    badge: 'NEW ASSIGNMENT DEPLOYED',
    heading: 'Project Assignment: NyayaSetu — India’s Citizen Action Guide',
    body: bodyContent,
    highlight: '📄 **Assignment Documents Attached:** Both PDF & DOCX versions of the NyayaSetu Architecture & Blueprint are attached to this email.',
    action: {
      label: 'ACCESS INTERN DASHBOARD',
      url: 'https://sarthi-woad.vercel.app/dashboard/internship',
    },
    senderName: 'Mohit Raj (Mentor — Web Development Internship) & SARTHI Team',
  });

  const attachments = [
    {
      filename: 'Nyaya Setu - SARTHI.pdf',
      content: pdfBuffer,
    },
    {
      filename: 'Nyaya Setu - SARTHI.docx',
      content: docxBuffer,
    },
  ];

  if (!isConfirm) {
    console.log('\n----------------------------------------------------');
    console.log('⚠️ DRY RUN MODE ACTIVE — Emails will NOT be sent until confirmed.');
    console.log('Run with --confirm flag to dispatch real emails.');
    console.log('----------------------------------------------------');
    return;
  }

  console.log('\n🚀 SENDING ASSIGNMENT EMAILS VIA RESEND API...');
  for (const recipient of RECIPIENTS) {
    try {
      const result = await sendTransactionalEmail({
        to: recipient.email,
        subject: `New Team Project Assignment: NyayaSetu — India’s Citizen Action Guide (${recipient.name})`,
        html: emailHtml,
        type: 'assignment',
        attachments,
        provider: 'resend',
      });
      console.log(`✅ Email successfully sent to ${recipient.name} <${recipient.email}> (ID: ${result.id || 'OK'})`);
    } catch (err: any) {
      console.error(`❌ Failed to send email to ${recipient.name} <${recipient.email}>:`, err.message || err);
    }
  }

  console.log('\n🎉 All assignment emails processed successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
