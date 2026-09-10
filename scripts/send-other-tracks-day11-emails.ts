import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || '');

const OTHER_TRACK_INTERNS = [
  // Graphic Design
  {
    name: 'Kumari Tejal',
    email: 'kumaritejal535@gmail.com',
    track: 'Graphic Design',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Graphic Design: Brand Visual Kit & Creatives 🎨',
    body: `Dear Tejal,

Today's Day 11 task for **Graphic Design** is to design a high-converting promotional creative kit for SARTHI's upcoming flagship programs and workshops.

### 🎨 Key Deliverables Required
- **1 Premium Instagram Carousel** (3–5 Slides) explaining SARTHI's practical skill programs.
- **1 Social Media Ad Banner** (1080x1080) optimized for LinkedIn & Instagram.
- **Editable Source File** (Figma / Canva / PSD link).

### 📤 Submission Requirements
Upload your design assets on your **SARTHI Student Dashboard**:
1. PNG / JPG Exports
2. Source file link (Figma / Canva)
3. Brief description of your design concept

⏰ **Deadline: Today • 9:00 PM IST**`
  },

  // Creator & Creative Writer
  {
    name: 'Pranshu Kumar Singh',
    email: 'ps859521@gmail.com',
    track: 'Creator & Creative Writer',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Creator & Writer: Brand Storytelling & Copywriting ✍️',
    body: `Dear Pranshu,

Today's Day 11 task for **Creator & Creative Writer** is to craft engaging brand narrative stories and high-converting social copies showcasing real student growth at SARTHI.

### ✍️ Key Deliverables Required
- **1 Student Success Story / Narrative Blog** (600–800 words) highlighting real skill growth.
- **3 High-Converting Social Media Captions** for LinkedIn & Instagram.
- **Markdown / Google Docs Link**.

### 📤 Submission Requirements
Submit your content via your **SARTHI Student Dashboard**:
1. Article / Blog link (Google Docs or Markdown)
2. Social media captions draft

⏰ **Deadline: Today • 9:00 PM IST**`
  },
  {
    name: 'Keshav Kumar',
    email: 'kumarkeshav10320@gmail.com',
    track: 'Creator & Creative Writer',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Creator & Writer: Brand Storytelling & Copywriting ✍️',
    body: `Dear Keshav,

Today's Day 11 task for **Creator & Creative Writer** is to craft engaging brand narrative stories and promotional scripts showcasing student learning at SARTHI.

### ✍️ Key Deliverables Required
- **1 Student Success Story / Script** (600–800 words) highlighting real skill growth.
- **3 High-Converting Social Media Captions** for LinkedIn & Instagram.
- **Markdown / Google Docs Link**.

### 📤 Submission Requirements
Submit your content via your **SARTHI Student Dashboard**:
1. Article / Blog link (Google Docs or Markdown)
2. Social media captions draft

⏰ **Deadline: Today • 9:00 PM IST**`
  },
  {
    name: 'Harsh Nayan',
    email: 'harshhn018@gmail.com',
    track: 'Creator & Creative Writer',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Creator & Writer: Brand Storytelling & Copywriting ✍️',
    body: `Dear Harsh,

Today's Day 11 task for **Creator & Creative Writer** is to craft engaging brand narrative stories and high-converting social copies showcasing real student growth at SARTHI.

### ✍️ Key Deliverables Required
- **1 Student Success Story / Narrative Blog** (600–800 words) highlighting real skill growth.
- **3 High-Converting Social Media Captions** for LinkedIn & Instagram.
- **Markdown / Google Docs Link**.

### 📤 Submission Requirements
Submit your content via your **SARTHI Student Dashboard**:
1. Article / Blog link (Google Docs or Markdown)
2. Social media captions draft

⏰ **Deadline: Today • 9:00 PM IST**`
  },
  {
    name: 'Ayush Rajput',
    email: 'ayushrajputttt3@gmail.com',
    track: 'Creator & Creative Writer',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Creator & Writer: Brand Storytelling & Copywriting ✍️',
    body: `Dear Ayush,

Today's Day 11 task for **Creator & Creative Writer** is to craft engaging brand narrative stories and high-converting social copies showcasing real student growth at SARTHI.

### ✍️ Key Deliverables Required
- **1 Student Success Story / Narrative Blog** (600–800 words) highlighting real skill growth.
- **3 High-Converting Social Media Captions** for LinkedIn & Instagram.
- **Markdown / Google Docs Link**.

### 📤 Submission Requirements
Submit your content via your **SARTHI Student Dashboard**:
1. Article / Blog link (Google Docs or Markdown)
2. Social media captions draft

⏰ **Deadline: Today • 9:00 PM IST**`
  },
  {
    name: 'Aniket Dutta',
    email: 'aniketdutta615@gmail.com',
    track: 'Creator & Creative Writer',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Creator & Writer: Brand Storytelling & Copywriting ✍️',
    body: `Dear Aniket,

Today's Day 11 task for **Creator & Creative Writer** is to craft engaging brand narrative stories and high-converting social copies showcasing real student growth at SARTHI.

### ✍️ Key Deliverables Required
- **1 Student Success Story / Narrative Blog** (600–800 words) highlighting real skill growth.
- **3 High-Converting Social Media Captions** for LinkedIn & Instagram.
- **Markdown / Google Docs Link**.

### 📤 Submission Requirements
Submit your content via your **SARTHI Student Dashboard**:
1. Article / Blog link (Google Docs or Markdown)
2. Social media captions draft

⏰ **Deadline: Today • 9:00 PM IST**`
  },
  {
    name: 'Prateek Singh Parmar',
    email: 'prateeksinghparmar54@gmail.com',
    track: 'Creator & Creative Writer',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Creator & Writer: Brand Storytelling & Copywriting ✍️',
    body: `Dear Prateek,

Today's Day 11 task for **Creator & Creative Writer** is to craft engaging brand narrative stories and high-converting social copies showcasing real student growth at SARTHI.

### ✍️ Key Deliverables Required
- **1 Student Success Story / Narrative Blog** (600–800 words) highlighting real skill growth.
- **3 High-Converting Social Media Captions** for LinkedIn & Instagram.
- **Markdown / Google Docs Link**.

### 📤 Submission Requirements
Submit your content via your **SARTHI Student Dashboard**:
1. Article / Blog link (Google Docs or Markdown)
2. Social media captions draft

⏰ **Deadline: Today • 9:00 PM IST**`
  },
  {
    name: 'Amitabh Bacchan',
    email: 'amitabhbacchantesting@gmail.com',
    track: 'Creator & Creative Writer',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Creator & Writer: Brand Storytelling & Copywriting ✍️',
    body: `Dear Amitabh,

Today's Day 11 task for **Creator & Creative Writer** is to craft engaging brand narrative stories and high-converting social copies showcasing real student growth at SARTHI.

### ✍️ Key Deliverables Required
- **1 Student Success Story / Narrative Blog** (600–800 words) highlighting real skill growth.
- **3 High-Converting Social Media Captions** for LinkedIn & Instagram.
- **Markdown / Google Docs Link**.

### 📤 Submission Requirements
Submit your content via your **SARTHI Student Dashboard**:
1. Article / Blog link (Google Docs or Markdown)
2. Social media captions draft

⏰ **Deadline: Today • 9:00 PM IST**`
  },

  // Research & Development
  {
    name: 'Mohit Raj',
    email: 'mohitraj8503@gmail.com',
    track: 'Research & Development',
    badge: 'INTERNSHIP TASK · DAY 11',
    subject: 'Day 11 Task — Research & Development: AI & Tech Trends Analysis 📊',
    body: `Dear Mohit,

Today's Day 11 task for **Research & Development** is to conduct market research and compile a concise analysis report on emerging AI tools and tech trends transforming student learning in 2026.

### 📊 Key Deliverables Required
- **2-Page Research Report** detailing top AI tools, use cases, and student adoption patterns.
- **Summary of Key Findings** and references.

### 📤 Submission Requirements
Submit your research report via your **SARTHI Student Dashboard**:
1. PDF / Document link of the Research Report
2. Brief summary note

⏰ **Deadline: Today • 9:00 PM IST**`
  }
];

async function main() {
  console.log(`\n==================================================`);
  console.log(`📧 SENDING DAY 11 BRANDED EMAILS TO GRAPHIC DESIGN, WRITING & R&D INTERNS`);
  console.log(`==================================================\n`);

  let sent = 0;
  let failed = 0;

  for (const intern of OTHER_TRACK_INTERNS) {
    const html = getBrandedTemplate({
      badge: intern.badge,
      heading: intern.subject,
      body: intern.body,
      action: {
        label: 'Open Student Dashboard',
        url: 'https://sarthi-woad.vercel.app/dashboard'
      },
      senderName: 'Team SARTHI'
    });

    try {
      await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: intern.email.trim().toLowerCase(),
        subject: intern.subject,
        html
      });
      console.log(`✅ Sent email to ${intern.name} (${intern.email}) [${intern.track}]`);
      sent++;
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ Failed for ${intern.name} (${intern.email}):`, err);
      failed++;
    }
  }

  console.log(`\n📊 Other Tracks Email Summary — Sent: ${sent}, Failed: ${failed}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
