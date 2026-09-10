import { determinePlatformSegment } from "../lib/segment/classification";
import { EducationLevel, PlatformSegment } from "@prisma/client";
import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

async function runTests() {
  console.log("==================================================");
  console.log("   SARTHI: PRODUCTION HARDENING TEST SUITE ");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // --- 1. CLASSIFICATION ENGINE TESTS ---
  console.log("--- 1. Testing Education Classification ---");
  
  // Standard K-12 -> JUNIOR
  assert(determinePlatformSegment(EducationLevel.CLASS_6) === PlatformSegment.JUNIOR, "CLASS_6 -> JUNIOR");
  assert(determinePlatformSegment(EducationLevel.CLASS_7) === PlatformSegment.JUNIOR, "CLASS_7 -> JUNIOR");
  assert(determinePlatformSegment(EducationLevel.CLASS_8) === PlatformSegment.JUNIOR, "CLASS_8 -> JUNIOR");
  assert(determinePlatformSegment(EducationLevel.CLASS_9) === PlatformSegment.JUNIOR, "CLASS_9 -> JUNIOR");
  assert(determinePlatformSegment(EducationLevel.CLASS_10) === PlatformSegment.JUNIOR, "CLASS_10 -> JUNIOR");
  assert(determinePlatformSegment(EducationLevel.CLASS_11) === PlatformSegment.JUNIOR, "CLASS_11 -> JUNIOR");
  assert(determinePlatformSegment(EducationLevel.CLASS_12) === PlatformSegment.JUNIOR, "CLASS_12 -> JUNIOR");

  // Higher Ed -> MAIN
  assert(determinePlatformSegment(EducationLevel.GRADUATION) === PlatformSegment.MAIN, "GRADUATION -> MAIN");
  assert(determinePlatformSegment(EducationLevel.POST_GRADUATION) === PlatformSegment.MAIN, "POST_GRADUATION -> MAIN");
  assert(determinePlatformSegment(EducationLevel.WORKING_PROFESSIONAL) === PlatformSegment.MAIN, "WORKING_PROFESSIONAL -> MAIN");

  // OTHER / Ambiguous contextual handling
  assert(
    determinePlatformSegment(EducationLevel.OTHER, { collegeOrSchoolName: "Delhi Public School" }) === PlatformSegment.JUNIOR,
    "OTHER with school context -> JUNIOR"
  );
  assert(
    determinePlatformSegment(EducationLevel.OTHER, { collegeOrSchoolName: "IIT Delhi Engineering" }) === PlatformSegment.MAIN,
    "OTHER with college context -> MAIN"
  );
  assert(
    determinePlatformSegment(EducationLevel.OTHER, { collegeOrSchoolName: "Other" }) === PlatformSegment.PENDING,
    "OTHER with ambiguous context -> PENDING"
  );
  assert(
    determinePlatformSegment(null, {}) === PlatformSegment.PENDING,
    "null / empty education for new user -> PENDING"
  );

  // --- 2. AUTHORITATIVE PRESERVATION RULE TESTS ---
  console.log("\n--- 2. Testing Authoritative Preservation Rules ---");
  assert(
    determinePlatformSegment(null, { existingSegment: PlatformSegment.MAIN }) === PlatformSegment.MAIN,
    "Existing MAIN + null education -> REMAINS MAIN"
  );
  assert(
    determinePlatformSegment(EducationLevel.OTHER, { existingSegment: PlatformSegment.MAIN }) === PlatformSegment.MAIN,
    "Existing MAIN + OTHER -> REMAINS MAIN"
  );
  assert(
    determinePlatformSegment(null, { existingSegment: PlatformSegment.MAIN, collegeOrSchoolName: "DPS School" }) === PlatformSegment.MAIN,
    "Existing MAIN + school text -> REMAINS MAIN (No downgrade)"
  );
  assert(
    determinePlatformSegment(null, { existingSegment: PlatformSegment.JUNIOR }) === PlatformSegment.JUNIOR,
    "Existing JUNIOR -> REMAINS JUNIOR"
  );

  // --- 3. DATABASE STATE VERIFICATION ---
  console.log("\n--- 3. Testing Production Database State ---");
  const mainUserCount = await prisma.user.count({ where: { platformSegment: PlatformSegment.MAIN } });
  const totalUserCount = await prisma.user.count();
  assert(totalUserCount === 158, `Total users verified: ${totalUserCount} / 158`);
  assert(mainUserCount === 158, `All historical users retained in MAIN: ${mainUserCount} / 158`);

  // --- 4. BACKUP VERIFICATION ---
  console.log("\n--- 4. Testing Backup Snapshots ---");
  const backupDir = path.join(process.cwd(), "scripts", "backups");
  const backups = fs.existsSync(backupDir) ? fs.readdirSync(backupDir) : [];
  assert(backups.length > 0, `Backup file created in scripts/backups: ${backups[backups.length - 1]}`);

  // --- 5. ROUTING & REDIRECT CONFIGURATION VERIFICATION ---
  console.log("\n--- 5. Testing Canonical Routing & Redirects in next.config.js ---");
  const nextConfigContent = fs.readFileSync(path.join(process.cwd(), "next.config.js"), "utf-8");
  assert(nextConfigContent.includes("source: '/junior'"), "next.config.js redirects legacy /junior");
  assert(nextConfigContent.includes("destination: '/juniors'"), "next.config.js points to canonical /juniors");
  assert(nextConfigContent.includes("juniors.sarthi-woad.vercel.app"), "next.config.js redirects legacy subdomain");
  assert(fs.existsSync(path.join(process.cwd(), "app/(junior)/juniors/page.tsx")), "Native app/(junior)/juniors/page.tsx exists");
  assert(fs.existsSync(path.join(process.cwd(), "app/(public)/schools/page.tsx")), "Dedicated app/(public)/schools/page.tsx exists");

  // --- 6. SITEMAP & METADATA VERIFICATION ---
  console.log("\n--- 6. Testing Sitemap Canonical URLs ---");
  const sitemapContent = fs.readFileSync(path.join(process.cwd(), "app/sitemap.ts"), "utf-8");
  assert(sitemapContent.includes("${baseUrl}/juniors"), "Sitemap includes canonical /juniors");
  assert(sitemapContent.includes("${baseUrl}/schools"), "Sitemap includes /schools");
  assert(!sitemapContent.includes("${baseUrl}/junior'"), "Sitemap contains no singular /junior");

  console.log("\n==================================================");
  console.log(`TEST SUITE RESULTS: ${passed} / ${total} PASSED`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test Suite encountered error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
