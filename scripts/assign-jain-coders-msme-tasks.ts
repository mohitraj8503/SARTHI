import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const DRIVE_LINK = 'https://drive.google.com/file/d/1jgQtgl0z03SbcWwes-TiZkU0YPGtma5V/view?usp=sharing';
const TEAM_NAME = 'Jain Coders';

interface InternTaskAssignment {
  name: string;
  email: string;
  roleTitle: string;
  responsibilities: string[];
  deliverables: string[];
}

const internsTasks: InternTaskAssignment[] = [
  {
    name: 'Ayush Singh',
    email: 'ayushsinghjsr6@gmail.com',
    roleTitle: 'Backend Architecture & Authentication',
    responsibilities: [
      'Create complete project folder structure',
      'Configure Express.js server & Prisma ORM',
      'Create PostgreSQL/MySQL database connection & environment variables',
      'Implement JWT Authentication (Login API, Signup API, Forgot & Reset Password)',
      'Implement Role-based Authentication (Admin, Mentor, Student Middlewares)',
      'Set up API Validation, Global Error Handler, API Response Formatter, and Password Hashing (bcrypt)'
    ],
    deliverables: [
      'backend/ (config, middleware, routes, controllers, services, prisma, utils, validators, app.ts)'
    ]
  },
  {
    name: 'Harsh Pathak',
    email: 'pathakharsh584@gmail.com',
    roleTitle: 'Database Schema & Prisma',
    responsibilities: [
      'Create complete Prisma schema with required models: User, Student, Mentor, Admin, Internship, Task, TaskSubmission, Comment, Announcement, Attendance, Certificate, Badge, XPTransaction, Leaderboard, Notification, Discussion, ActivityLog, Settings, Files, Reports',
      'Implement Database Relations, Foreign Keys, and Constraints',
      'Configure Prisma Migrations & Seed Scripts with dummy data',
      'Write complete Database Documentation'
    ],
    deliverables: [
      'prisma/ (schema.prisma, seed.ts, migrations/)'
    ]
  },
  {
    name: 'Kritika Mohanty',
    email: 'kritikamohanty2008@gmail.com',
    roleTitle: 'Backend APIs & Business Logic',
    responsibilities: [
      'Create complete REST APIs across all modules (Authentication, Students, Mentors, Tasks, Comments, Submissions, Announcements, Attendance, Certificates, Badges, Leaderboard, Notifications, Dashboard, Reports, Profile, Settings)',
      'Implement full CRUD operations (GET, POST, PUT, PATCH, DELETE) for each module',
      'Implement Pagination, Search, Filtering, Sorting, and Input Validation',
      'Provide comprehensive API Documentation'
    ],
    deliverables: [
      'Complete RESTful API Suite & Module Controllers'
    ]
  },
  {
    name: 'Harshita Kumari Singh',
    email: 'harshitakum041008@gmail.com',
    roleTitle: 'Frontend Integration & Testing',
    responsibilities: [
      'Connect Next.js frontend with backend REST APIs and remove all static dummy data',
      'Set up Axios instance, Authentication Flow, and Protected Routes',
      'Connect Real Data to Dashboard, Task Module, Comments, Attendance, Notifications, Certificates, Leaderboard, and Reports',
      'Implement Loading States, Error Handling, Toast Messages, Bug Fixes, and Responsive Fixes',
      'Perform End-to-End Testing of all features'
    ],
    deliverables: [
      'Fully integrated & tested SARTHI MSME Portal Frontend'
    ]
  }
];

async function assignTasksAndSendBrandedEmails() {
  console.log(`🚀 Assigning MSME Portal tasks to Team "${TEAM_NAME}"...`);

  for (const intern of internsTasks) {
    console.log(`\n--------------------------------------------------`);
    console.log(`👤 Processing ${intern.name} (${intern.email})...`);

    // 1. Find DB user
    const dbUser = await prisma.user.findFirst({
      where: { email: intern.email }
    });

    if (!dbUser) {
      console.error(`⚠️ User record for ${intern.email} not found in database! Skipping DB assignment, proceeding with email.`);
    }

    // Prepare Markdown Body for branded template parser
    const markdownBody = `Hi **${intern.name}** 👋,

Welcome to **Team ${TEAM_NAME}** for the **SARTHI MSME Portal Backend & Integration Phase**!

The frontend UI is largely complete. Your team's objective is to build the complete backend architecture, define database schemas, write high-performance REST APIs, and integrate the frontend.

---

### 📌 Your Specific Role: ${intern.roleTitle}

**Key Responsibilities:**
${intern.responsibilities.map(r => `* ${r}`).join('\n')}

**Key Deliverables:**
${intern.deliverables.map(d => `* ${d}`).join('\n')}

---

### 📂 Shared Project Resources & Setup Code
You can download the full starting project materials, frontend structure, and assets from Google Drive:
👉 [Download MSME Portal Resources](${DRIVE_LINK})

---

### 👥 Team Overview (Team ${TEAM_NAME})
* **Ayush Singh:** Backend Architecture & Authentication
* **Harsh Pathak:** Database Schema & Prisma
* **Kritika Mohanty:** Backend APIs & Business Logic
* **Harshita Kumari Singh:** Frontend Integration & Testing

---

### ✅ Submission & Final Deliverables Requirements
* Push your code to your team's GitHub repository.
* Maintain clean git commits and document your code.
* Submit a short documentation file (Markdown/PDF) and a 3–5 minute demo video upon completion.`;

    const htmlContent = getBrandedTemplate({
      badge: `🚀 TEAM ${TEAM_NAME.toUpperCase()} — MSME PORTAL`,
      heading: `Task Assignment: ${intern.roleTitle}`,
      body: markdownBody,
      highlight: `📌 **Project Drive Resource Link:** [Access Project Files](${DRIVE_LINK})\n\n**Team Note:** Please coordinate closely with your team members (${TEAM_NAME}) in the Interns Group to ensure smooth end-to-end integration!`,
      action: {
        label: '📁 Open Project Resources (Google Drive) →',
        url: DRIVE_LINK
      },
      senderName: 'SARTHI Engineering Team'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [intern.email],
        subject: `🎯 Task Assignment (Team ${TEAM_NAME}): ${intern.roleTitle} - SARTHI MSME Portal`,
        html: htmlContent
      });

      if (error) {
        console.error(`❌ Resend email failed for ${intern.email}:`, error);
      } else {
        console.log(`✅ Branded Email delivered to ${intern.name} (${intern.email}) | Resend ID: ${data?.id}`);
      }
    } catch (err: any) {
      console.error(`❌ Exception sending email to ${intern.email}:`, err.message);
    }
  }

  console.log(`\n🎉 Task assignment and branded email dispatch complete for Team "${TEAM_NAME}"!`);
}

assignTasksAndSendBrandedEmails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
