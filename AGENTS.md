# Mandatory Applicant Approval Checklist

This checklist must be strictly followed every time an internship application is reviewed or approved.

---

## 1. Before Approving
- [ ] **Data Integrity Check:** Verify the applicant's record details (Full Name, Email, Course, Track/Domain, College Name).
- [ ] **Sanitize Garbled Fields:** If college name or email contains placeholder/garbage text, fix the database record before approving.

---

## 2. Immediately After Clicking "Approve"
- [ ] **Observe Row Update:** Watch the application row state update in the Mentor Dashboard.
- [ ] **Verify Visual Badge:**
  - **Green `✓ Offer Letter Sent` Badge:** Automation completed successfully.
  - **Red `⚠ Offer Failed (Not Sent)` Badge:** Click the **"Retry Send Offer"** button in the dashboard immediately.
  - **No Badge (Unchanged Status):** Treat as an unhandled failure, inspect logs, and use the dashboard Retry button or generic CLI utility.

---

## 3. Same-Day Delivery Verification
- [ ] **Resend Dashboard Inspection:** Log into `resend.com/emails` and query the applicant's email address.
- [ ] **Confirm Status:** Ensure email status is **Delivered** (not just "Sent", "Bounced", or missing).
- [ ] **Missing Email Handling:** If missing, click **"Retry Send Offer"** in the dashboard or run `npx tsx scripts/resend-offer-letter.ts --applicationId=<id>`. Do NOT write a per-person script.

---

## 4. Weekly Audit & Monitoring
- [ ] **Cross-Check Database vs Resend:** Verify that every applicant with status `OFFER_ACCEPTED` has a matching "Delivered" email log in Resend.
- [ ] **Audit Log Inspection:** Review `AuditLog` records for `OFFER_LETTER_AUTO_SEND_FAILED` actions.

---

## 5. Non-Negotiable Operational Rules
- **No Per-Person Scripts:** Never create `scripts/send-<name>-*.ts` scripts. Always use `processAndSendOfferLetter` or `scripts/resend-offer-letter.ts`.
- **Investigate Repeat Failures:** If an applicant fails offer letter generation more than once, inspect data encoding (e.g., special characters, missing degree fields) instead of bypassing the pipeline.
- **Golden Rule:** *"Approve"* is only complete once the **Green `✓ Offer Letter Sent`** badge is visible and confirmed.

---

## 6. Email & Content Formatting Rules
- **No Emails Without Explicit User Confirmation:** NEVER send broadcast or notification emails to users/interns without showing the exact content and getting explicit approval from the user first.
- **Clean HTML Formatting (No Raw Markdown Symbols):** Email templates must parse and convert markdown headers (`#`, `##`, `###`), bold (`**`), and italics (`*`) into clean HTML tags (`<h3>`, `<strong>`, `<em>`). Never allow raw `#` or `**` symbols to appear in rendered HTML emails.

---

## 7. Internship ID System — Source of Truth
- **Student ID ≠ Intern ID:** `Student ID` (`TT-STU-XXXXXX`) identifies a platform student only. `Permanent Intern ID` (`TTIXXXXXX`) identifies a registered intern and must match the ID in the intern's official offer letter. `Official Reference No.` (`TT-INT-2026-XXXX`) is the matching internship reference. Never auto-derive or convert between these systems.
- **The Offer Letter is the Primary Authority:** If an intern already has an offer letter, the ID written in that letter is the permanent source of truth. Never change it.
- **Authoritative 11 Active Intern Roster (IDs are PERMANENT — Never Renumber):**
  1. Ranjan Singh (`ranjansingh.w@gmail.com`) — `TTI000001` | `TT-INT-2026-0001` | Arka Jain University | Web Development | 1855 XP
  2. Jaanvi Nair (`nairjaanvi199@gmail.com`) — `TTI000026` | `TT-INT-2026-0026` | SIES College of Arts, Science and Commerce, Mumbai | Digital Marketing & Social Media | 1890 XP
  3. Nandini Katiyar (`nandinikatiyar5@gmail.com`) — `TTI000038` | `TT-INT-2026-0038` | PSIT College of Higher Education, Kanpur | Digital Marketing & Social Media | 1825 XP
  4. Pranshu Kumar Singh (`ps859521@gmail.com`) — `TTI000051` | `TT-INT-2026-0051` | Arka Jain University | Full Stack Web Development | 1815 XP
  5. Surjo Banerjee (`surjobanerjee207@gmail.com`) — `TTI000060` | `TT-INT-2026-0060` | Arka Jain University | Video Editing & Reels Production | 230 XP
  6. Keshav Kumar (`kumarkeshav10320@gmail.com`) — `TTI000062` | `TT-INT-2026-0062` | Arka Jain University | Creative Writing | 120 XP
  7. Keshav Ruhela (`keshavruhela25@gmail.com`) — `TTI000066` | `TT-INT-2026-0066` | IILM University, Greater Noida | Web Development | 120 XP
  8. Kumari Tejal (`kumaritejal535@gmail.com`) — `TTI000083` | `TT-INT-2026-0083` | Arka Jain University | Graphic Design | 1870 XP
  9. Aniket Dutta (`aniketdutta615@gmail.com`) — `TTI000086` | `TT-INT-2026-0086` | Arka Jain University | Content Creation | 1865 XP
  10. Nitin Sinha (`nitinsinha062@gmail.com`) — `TTI000128` | `TT-INT-2026-0128` | Arka Jain University | Web Development | 1830 XP
  11. Harsh Nayan (`harshnayan018@gmail.com`) — `TTI000150` | `TT-INT-2026-0150` | Arka Jain University | Software Development | 635 XP
  12. Arpit Jha (`arpitjha1647@gmail.com`) — `TTI000051` | `TT-INT-2026-0051` | IILM University, Greater Noida | Software Development | 0 XP
- **🔥 Vacant ID Reuse (Gap-Filling) Rule — NEW INTERNS ONLY:** When a new intern has no offer letter, assign the **LOWEST AVAILABLE VACANT** Permanent Intern ID from the historical pool (1 → max). Do NOT simply use `highest+1`. If the historical pool has gaps (vacancies from interns who left), fill from the lowest gap first.
  - Example: Active IDs are `TTI000002`, `TTI000005`, `TTI000006`, `TTI000008`. Vacant = 1, 3, 4, 7. New intern → `TTI000001` (lowest vacant).
- **Offer Letter Verification Workflow for New Interns:**
  1. Search offer-letter records for the person — if found, use exact ID from offer letter.
  2. Verify the ID is not already assigned to another active/historical intern.
  3. If genuinely new, assign the lowest vacant ID from the historical pool.
  4. Generate matching Reference No. from the same numeric suffix.
- **🚫 Prohibited Rules (Never Do These):**
  - ❌ Assign `#1 → TTI000001, #2 → TTI000002` based on roster position
  - ❌ Use `highest+1` without checking for vacancies first
  - ❌ Auto-convert `TT-STU-XXXXXX` → `TTI000XXX` (different systems)
  - ❌ Renumber or change IDs of existing interns (even if they leave)
  - ❌ Generate offer letters without explicit user confirmation
---

## 8. Microsoft Learn Content & Advertising Safety Guidelines
Version: 1.0 (Consolidated) | Applies To: Website, Mobile Apps, Course Pages, Blogs, Social Media Posts, Instagram Promotions, Posters & Banners, WhatsApp Marketing, Email Campaigns, AI Generated Content

### Purpose & Core Principle
> SARTHI may reference, recommend, and link to Microsoft Learn content, but must never imply ownership, partnership, endorsement, sponsorship, certification authority, or official affiliation with Microsoft unless explicitly authorized in writing.

### Compliance Rules

#### Rule 1: Microsoft Learn Content Must Remain Free
- ✅ **Allowed**: `Free Microsoft Learn Learning Path`, `Microsoft Learn Resource`, `Microsoft Learn Content`, `Supplementary Microsoft Learn Material`, `Bonus Microsoft Learn Resources`
- ❌ **Not Allowed**: Selling access to Microsoft Learn content, charging specifically for Microsoft Learn modules, putting Microsoft Learn content behind a SARTHI paywall, or repackaging Microsoft Learn content as a paid Microsoft product.

#### Rule 2: Always Redirect To Microsoft Learn
Users must access Microsoft Learn content directly from Microsoft's platform.
- ✅ **Approved Button Labels**: `Start on Microsoft Learn`, `Open on Microsoft Learn`, `View Learning Path`, `Launch Microsoft Learn`, `Access Learning Path`
- ❌ **Not Allowed**: Hosting Microsoft Learn modules locally, republishing Microsoft Learn lessons, copying Microsoft Learn content to SARTHI servers, or presenting Microsoft Learn content as SARTHI content.

#### Rule 3: Never Claim Partnership (Unless Authorized)
- ❌ **Do Not Use**: `Official Microsoft Partner`, `Powered by Microsoft`, `Sponsored by Microsoft`, `Endorsed by Microsoft`, `Approved by Microsoft`, `Microsoft Collaboration`, `Microsoft Authorized Training Provider`, `Microsoft Official Partner`, `In Partnership With Microsoft`
- ✅ **Allowed**: `Microsoft Learn Resource`, `Microsoft Learn Learning Path`, `Hosted on Microsoft Learn`, `Learn Through Microsoft Learn`, `Official Microsoft Learn Content`

#### Rule 4: Never Promise Microsoft Certification
- ✅ **Allowed**: `AZ-900 Preparation`, `Certification Preparation`, `Microsoft Exam Preparation`, `Helps Prepare For Microsoft Certification Exams`, `Covers Azure Fundamentals Topics`
- ❌ **Not Allowed**: `Microsoft Certification Included`, `Guaranteed Microsoft Certification`, `Get Microsoft Certified`, `Earn Microsoft Certification Through This Course`, `Microsoft Certificate Provided By SARTHI` (unless Microsoft itself awards the certification through an official examination process).

#### Rule 5: Course Ownership Must Be Clear
SARTHI courses must always be identified as SARTHI offerings.
- ✅ **Allowed**: `Python Mastery Program by SARTHI`, `Data Analytics Bootcamp by SARTHI`, `DevOps Career Program by SARTHI`
- ❌ **Avoid**: `Microsoft Python Course by SARTHI`, `Official Microsoft Training by SARTHI`, `Microsoft Azure Program by SARTHI`

#### Approved Course Names
- ✅ **Preferred**: `Cloud Fundamentals (Microsoft Learn)`, `Microsoft Learn: Cloud Fundamentals`, `Azure Fundamentals Learning Path`, `Cloud Fundamentals Learning Path on Microsoft Learn`, `Azure Fundamentals (Microsoft Learn)`
- ❌ **Avoid**: `Official Microsoft Azure Course`, `SARTHI Microsoft Course`, `Microsoft Azure Masterclass by SARTHI`, `Microsoft Certified Azure Program`

#### Approved Description Template
```
Cloud Fundamentals (Microsoft Learn)

Kickstart your cloud computing journey with Microsoft Azure through this free Microsoft Learn learning path.

Topics include:
- Cloud Concepts
- Azure Services
- Security & Governance
- Azure Architecture
- Cost Management
- AZ-900 Preparation

Content is hosted and maintained by Microsoft Learn.
When you click "Start Course", you will be redirected to Microsoft's official learning platform.
```

#### Paid Course Bundles
Example (Allowed):
```
Python Mastery Program - ₹999
Includes:
- Video Lessons, Projects, Assignments
- Community Access & Doubt Support
- SARTHI Certificate
- Bonus Microsoft Learn Resources
```
*Important*: Users pay for SARTHI's services and learning experience. Microsoft Learn resources must always remain free resources.

#### Strengthened Required Disclaimer (Place on all Microsoft Learn pages)
> *"Microsoft Learn content is owned, maintained, and provided by Microsoft. SARTHI is an independent learning platform and is not affiliated with, endorsed by, sponsored by, or officially associated with Microsoft. References to Microsoft Learn are made solely for educational and informational purposes. All learning content remains available on Microsoft's official platform and users may access it directly through Microsoft Learn."*

#### Logo & Trademark Usage Rule
- AI agents must not generate content claiming ownership of Microsoft trademarks.
- Microsoft logos, trademarks, and branding assets may only be displayed in accordance with Microsoft's published trademark and brand guidelines.
- If uncertainty exists regarding logo or branding usage, use text-only attribution (`"Microsoft Learn"`) instead of logos or endorsement-style branding.

#### AI Agent Validation Checklist (Before Publishing Microsoft Content)
- Check: No partnership claim | No sponsorship claim | No endorsement claim | No certification claim | No Microsoft ownership claim | User redirects to Microsoft platform | Microsoft Learn identified as provider | Text-only attribution used if logo usage is ambiguous | Strengthened disclaimer exists.
- *If any check fails: REJECT PUBLICATION.*

---

## 9. Certificate Template Creation & ID System Rules
- **Confirm ID Prefix & Numbering Format Upfront:** Jab bhi koi naya certificate template clone kiya jaye, naya design ya thumbnail add kiya jaye, usi samay user se confirm karein ki is template par kaun sa ID prefix aur format chadhega (e.g., `TT-BIA-YYYY-MM` for Best Intern Award, `TT-EX-YYYY-XXXX` for Exams, etc.).
- **Enforce a Single Canonical Format:** Har template category ka ek hi standard format hona chahiye. Kabhi bhi ad-hoc ya inconsistent format create na karein.
- **Full-Stack Uniformity:** Jo ID format template ke liye decide ho, wahi format Admin Dashboard, Certificate Studio, Database Metadata, aur Public `/verify/[id]` verification route par symmetrically sync aur render hona chahiye.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
