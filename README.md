<div align="center">
  <img src="./public/images/sarthi-logo.png" alt="SARTHI IMD Logo" width="440" style="margin-bottom: 20px;" />

  # 🛰️ SARTHI (सारथी)
  ### *Centralized Learning Management & Meteorological Competency Development Platform*
  **Ministry of Earth Sciences (MoES) • India Meteorological Department (IMD)**

  <p align="center">
    <strong>🏆 Smart India Hackathon (SIH 2026) Finalist Project</strong><br />
    <strong>Team: Catalytic Coders (Team ID: 126479) • ARKA JAIN University, Jharkhand</strong>
  </p>

  <p align="center">
    <a href="https://sarthi.techtomorrow.in" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Platform-SARTHI%20IMD%20Portal-00C853?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Platform" />
    </a>
    <a href="https://sarthi.techtomorrow.in/login" target="_blank">
      <img src="https://img.shields.io/badge/1--Click%20Demo-Evaluator%20Logins-1A3C2E?style=for-the-badge&logo=auth0&logoColor=white" alt="1-Click Demo Login" />
    </a>
  </p>

  [![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
  [![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC%20Stream-FF5722?style=flat-square&logo=webrtc)](https://livekit.io/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)

  <p align="center">
    <a href="#-executive-summary">Executive Summary</a> •
    <a href="#-problem-statement--ministry-mandate">Problem Statement</a> •
    <a href="#-system-architecture--flowcharts">System Flowcharts</a> •
    <a href="#-three-tier-workspace-architecture">Workspaces</a> •
    <a href="#-live-evaluator-credentials">Evaluator Logins</a> •
    <a href="#-key-technical-innovations">Innovations</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-team-catalytic-coders">The Team</a>
  </p>
</div>

---

## 📌 Executive Summary

**SARTHI** (*Skill Assessment, Readiness & Training Hub for India*) is an enterprise-grade digital capacity building and meteorological competency tracking platform designed specifically for the **India Meteorological Department (IMD)**, under the **Ministry of Earth Sciences (MoES)**, Government of India.

Engineered by **Team Catalytic Coders** (ARKA JAIN University, Jharkhand) for **Smart India Hackathon (SIH 2026)**, SARTHI unifies technical training, live radar/satellite simulation workshops, automated competency assessments, and cryptographic certificate verification across all **6 Regional Meteorological Centres (RMCs)**, specialised divisions, and observational field stations nationwide.

---

## 🎯 Problem Statement & Ministry Mandate

```
Ministry Mandate : Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
SIH Problem Area : Centralized Capacity Building, Technical Training & Competency Verification
Target Audience  : Meteorologists, Radar Engineers, NWP Forecasters, Scientific Staff & Cadres
```

| Operational Challenge | Traditional Bottleneck | SARTHI Enterprise Innovation |
| :--- | :--- | :--- |
| **Fragmented Training** | Dispersed training modules across regional centers with zero synchronized progress tracking. | **Unified National LMS** with role-based curricula, automated progression, and divisional matrices. |
| **Competency Verification Gap** | Paper-based certificates vulnerable to duplication without verifiable skill proof. | **Cryptographic QR Verification** with instant online verification hash engine at `/verify/[id]`. |
| **Mission-Critical Field Training** | High barrier to live radar data simulation, numerical modeling, and Python scripting drills. | **Integrated Monaco Code Sandbox**, live WebRTC classrooms, and interactive radar/NWP workshops. |
| **Remote Station Accessibility** | Low or intermittent internet connectivity at coastal radar towers and remote observatories. | **Progressive Web App (PWA)** with offline caching, mobile responsiveness, and ultra-low-latency streaming. |

---

## ⚡ Quick Evaluator Demo Logins

For judges and evaluators reviewing the platform live, 1-click auto-fill buttons are integrated directly into the [SARTHI Login Interface](https://sarthi.techtomorrow.in/login):

| Role Workspace | Evaluator Demo Email | Demo Password | Core Access Scope |
| :--- | :--- | :--- | :--- |
| 🎓 **Student / Trainee** | `student.demo@imd.gov.in` | `StudentDemo@123` | Course learning, interactive quizzes, certificate claims, code sandbox, XP ranks |
| 👨‍🏫 **Faculty Trainer** | `trainer.demo@imd.gov.in` | `TrainerDemo@123` | Course builder, live lecture broadcasting (LiveKit/Jitsi), assignment grading, analytics |
| 🛡️ **IMD Super Admin** | `admin.demo@imd.gov.in` | `AdminDemo@123` | Divisional telemetry, certificate studio, system audit logs, manager access control |

---

## 📊 System Architecture & Flowcharts

### 1. Unified End-to-End System Flow

```mermaid
flowchart TD
    subgraph ClientLayer["🌐 Client & Device Layer (PWA)"]
        A1["Desktop Browser"]
        A2["Mobile / Tablet PWA"]
        A3["Remote Observatory Kiosk"]
    end

    subgraph SecurityGateway["🔒 Edge & Security Layer"]
        B1["Next.js 16 Edge Middleware"]
        B2["RBAC Session Guard & JWT"]
        B3["In-Memory / Redis Rate Limiter"]
    end

    subgraph CoreEngine["⚡ Application Core (App Router)"]
        C1["🎓 Trainee Portal\n(Modules, Quiz, Monaco Sandbox)"]
        C2["👨‍🏫 Trainer Studio\n(Course Builder, LiveKit Stream)"]
        C3["🛡️ Admin Console\n(National Telemetry, Certificate Studio)"]
    end

    subgraph ServiceMesh["🛰️ Microservices & Integrations"]
        D1["LiveKit / Jitsi WebRTC Stream"]
        D2["Gemini & OpenRouter AI Cascade"]
        D3["Crypto PDF & QR Engine"]
        D4["Resend Email Dispatcher"]
    end

    subgraph DatabaseLayer["💾 Resilient Data Layer"]
        E1["Prisma ORM 5.22"]
        E2[("MySQL 8.0 Primary Database")]
        E3["Connection Pool & Resilient Fallback"]
    end

    ClientLayer --> SecurityGateway
    SecurityGateway --> CoreEngine
    CoreEngine <--> ServiceMesh
    CoreEngine <--> DatabaseLayer
    DatabaseLayer <--> E2
```

---

### 2. User Authentication & Role-Based Access Control (RBAC) Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Trainee / Trainer / Admin
    participant Frontend as Next.js 16 Client
    participant AuthAPI as /api/auth/login
    participant DB as MySQL (Prisma)
    participant Session as JWT & Cookie Session
    participant Dashboard as Role Dashboard

    User->>Frontend: Select 1-Click Demo or Enter Credentials
    Frontend->>AuthAPI: POST { email, password }
    AuthAPI->>DB: Query User & Verify Argon2/Bcrypt Hash
    alt Invalid Credentials
        DB-->>AuthAPI: User Not Found / Hash Mismatch
        AuthAPI-->>Frontend: 401 Unauthorized + Error Toast
    else Valid Credentials
        DB-->>AuthAPI: User Object (Role, Onboarded, Permissions)
        AuthAPI->>Session: Generate Signed JWT + Secure HTTP-Only Cookie
        AuthAPI-->>Frontend: 200 OK + User Session Data
        alt Role == STUDENT
            Frontend->>Dashboard: Redirect -> /dashboard (Trainee Portal)
        else Role == TEACHER
            Frontend->>Dashboard: Redirect -> /teacher/dashboard (Trainer Studio)
        else Role == ADMIN
            Frontend->>Dashboard: Redirect -> /admin/dashboard (IMD Console)
        end
    end
```

---

### 3. Live WebRTC Meteorological Training Classroom Flow

```mermaid
flowchart LR
    subgraph Instructor["👨‍🏫 IMD Faculty Trainer"]
        T1["Initiate Live Class"] --> T2["Select Doppler / NWP Stream"]
        T2 --> T3["LiveKit Room Token Generator"]
    end

    subgraph StreamEngine["⚡ WebRTC Video Mesh (LiveKit)"]
        S1["Selective Forwarding Unit (SFU)"]
        S2["Sub-second Audio/Video Broadcast"]
        S3["Screen Share & Simulation Feeds"]
    end

    subgraph Students["🎓 Meteorological Cadres & Trainees"]
        ST1["Join Waiting Room"] --> ST2["WebRTC Room Handshake"]
        ST2 --> ST3["Interactive Dual-Way Video/Audio"]
        ST3 --> ST4["Real-time Q&A & Code Collaboration"]
    end

    T3 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> ST2
```

---

### 4. Automated Certificate Issuance & QR Verification Pipeline

```mermaid
flowchart TD
    A["Trainee Completes Training Module / Assessment"] --> B{"Score >= 80% Benchmark?"}
    B -- No --> C["Provide Instant Feedback & Retry Module"]
    B -- Yes --> D["Trigger Automated Certificate Pipeline"]
    
    subgraph CertGeneration["📜 Certificate Studio Engine"]
        D --> E1["Generate Unique Hash ID (TT-INT-2026-XXXX)"]
        E1 --> E2["Compute Tamper-Proof QR Code"]
        E2 --> E3["Render High-DPI Vector Certificate"]
    end

    CertGeneration --> F["Store Certificate Record in MySQL DB"]
    F --> G["Dispatch Email Notification via Resend"]
    F --> H["Instant LinkedIn Badge & PDF Download"]

    subgraph Verification["🔍 Public Verification Engine"]
        I["Official / Employer Scans QR Code"] --> J["Directs to /verify/[id]"]
        J --> K["Validate Cryptographic Hash in Database"]
        K --> L["Display Verified IMD Credential Details"]
    end

    E2 -.-> I
```

---

### 5. AI Meteorological Cascade Assistant Architecture

```mermaid
flowchart TD
    UserQuery["User Asks Weather / System Query"] --> InputSanitization["Sanitize & Format Context"]
    InputSanitization --> PrimaryAI{"Primary: Google Gemini 1.5 Pro"}

    PrimaryAI -- Success --> AIResponse["Stream Real-time Formatted Markdown / Code"]
    PrimaryAI -- Timeout / RateLimit --> FallbackAI{"Fallback: OpenRouter AI Mesh"}
    
    FallbackAI -- Success --> AIResponse
    FallbackAI -- Error --> CacheResponse["Return Institutional FAQ Cache"]

    AIResponse --> UI["Render Interactive Chat in Trainee / Trainer Workspace"]
```

---

## 🏛️ Three-Tier Workspace Architecture

```
                                  ┌────────────────────────────────┐
                                  │      SARTHI UNIFIED CORE       │
                                  │   (Next.js 16 + MySQL + ORM)   │
                                  └──────────────┬─────────────────┘
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  ▼                              ▼                              ▼
      ┌───────────────────────┐      ┌───────────────────────┐      ┌───────────────────────┐
      │   🎓 STUDENT PORTAL   │      │  👨‍🏫 TEACHER STUDIO   │      │   🛡️ ADMIN CONSOLE   │
      ├───────────────────────┤      ├───────────────────────┤      ├───────────────────────┤
      │ • Role-based Tracks   │      │ • Drag & Drop Builder │      │ • National Telemetry  │
      │ • Interactive Quizzes │      │ • LiveKit Broadcasting│      │ • Certificate Studio  │
      │ • Monaco Code Sandbox │      │ • Question Bank Pool  │      │ • Audit Log Security  │
      │ • QR-Verified Certs   │      │ • Submission Grading  │      │ • Role Access Control │
      │ • Real-time XP & Rank │      │ • Student Engagement  │      │ • Financial Analytics │
      └───────────────────────┘      └───────────────────────┘      └───────────────────────┘
```

---

## ✨ Key Features & Technological Innovations

### 1. 🎓 Trainee & Officer Learning Experience
* **Adaptive Learning Paths:** Standardized curricula covering Numerical Weather Prediction (NWP), Satellite Meteorology, Doppler Weather Radar (DWR) operations, and Disaster Early Warning Protocols.
* **In-Browser Developer Sandbox:** Embedded **Monaco Code Editor** with real-time compilation for meteorological scripting in Python and Python for scientific computation.
* **Gamified XP & Milestone System:** Real-time experience points (XP), streak counters, divisional leaderboards, and interactive module passes.
* **Verifiable Digital Credentials:** Instantly generated certificates and Letters of Recommendation with unique QR verification hashes (viewable at `/verify/[id]`).

### 2. 👨‍🏫 Faculty & Trainer Command Studio
* **Visual Drag-and-Drop Curriculum Builder:** Organize modules, video lessons, attachments, and assignments with real-time auto-saving.
* **Low-Latency Live Class Broadcasting:** Dual-engine WebRTC architecture powered by **LiveKit** and **Jitsi SDK** for live sessions with screen sharing, participant hand-raising, and waiting rooms.
* **Automated Assessment & Question Banks:** Multi-type assessment engine supporting single-choice, multiple-choice, coding questions, and instant grading telemetry.

### 3. 🛡️ IMD Super Admin & Ministerial Operations
* **Divisional Competency Tracking:** Live metrics on departmental readiness across all regional meteorological centers.
* **Certificate Studio Client:** Dynamic certificate templating engine with customizable seals, reference numbers (`TT-INT-2026-XXXX`), and instant issuance workflows.
* **Audit & Security Logging:** Comprehensive event tracking for role escalations, auto-send pipelines, and authentication anomalies.

---

## 🛠️ Technical Stack

```
Frontend Architecture    : Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
Animation & Styling      : Framer Motion, Lucide React, Custom CSS Variables
Backend & API Gateway    : Next.js Server Components, Server Actions, RESTful Edge APIs
Database & ORM Layer     : MySQL 8.0, Prisma ORM 5.22 with Resilient Connection Pooling
Real-Time & WebRTC       : LiveKit SDK, Socket.io, Jitsi Meet React SDK
Editor & Compilers       : Monaco Editor, TipTap Rich Text Suite
Authentication & Sec     : Encrypted Session Tokens, Argon2 / Bcrypt, Account Lockout Security
AI Integration           : Gemini 1.5 Pro & OpenRouter Meteorological Cascade Assistant
Deployment Target        : Hostinger Cloud VM & Vercel Edge Network
```

---

## 🚀 Getting Started & Local Development

### 📋 Prerequisites
* **Node.js**: `>= 20.9.0` (LTS recommended)
* **Package Manager**: `npm` or `pnpm`
* **Database**: MySQL 8.0+ instance (Local or Cloud like Aiven / PlanetScale)

### 💻 Step-by-Step Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/mohitraj8503/SARTHI.git
   cd SARTHI
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/sarthi_db"

   # Authentication & Security
   JWT_SECRET="your-super-secret-jwt-key"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # AI Assistance (Optional)
   GEMINI_API_KEY="your-gemini-api-key"
   OPENROUTER_API_KEY="your-openrouter-api-key"
   ```

4. **Synchronize Database Schemas:**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push Schema to Database
   npm run db:push

   # (Optional) Seed Demo Credentials (student, trainer, admin)
   npm run seed:demo
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Smart India Hackathon 2026 — Team Catalytic Coders

| Member | Role & Track | Institution | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Mohit Raj** | **Team Leader & Lead Architect** | ARKA JAIN University, Jharkhand | System architecture, Next.js 16 full-stack engineering, cloud infrastructure & database design |
| **Krish Rishikesh** | **Core Systems & Backend Engineer** | ARKA JAIN University, Jharkhand | Backend APIs, authentication security, session management, and microservice integration |
| **Ranjan Singh** | **Frontend & UI Architecture** | ARKA JAIN University, Jharkhand | UI design systems, responsive component engineering, and interactive LMS workflows |
| **Nisha Chand** | **Research & Competency Docs** | ARKA JAIN University, Jharkhand | IMD domain requirements, competency matrices, curriculum mapping, and technical documentation |
| **Trisha Singh** | **UI/UX & Meteorological Course Design** | ARKA JAIN University, Jharkhand | Design prototypes, user experience flow, meteorological interface design, and asset creation |
| **Janvi Sinha** | **QA & Data Verification Engineer** | ARKA JAIN University, Jharkhand | Quality assurance, automated validation pipelines, cross-browser testing, and data integrity |

---

## 📜 License & Governance

Developed as an open-source technical prototype for the **Smart India Hackathon 2026** under the problem statement issued for the **India Meteorological Department (IMD), Ministry of Earth Sciences (MoES)**.

<div align="center">
  <sub>Built with ❤️ and dedication by <strong>Team Catalytic Coders (ARKA JAIN University, Jharkhand)</strong> for Smart India Hackathon 2026.</sub>
</div>
