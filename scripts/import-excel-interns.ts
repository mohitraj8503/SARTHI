import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { processAndSendOfferLetter } from '../lib/services/offer-letter-pipeline.service';

interface ExcelCandidate {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  degree?: string;
  college?: string;
  experience?: string;
  role?: string;
  company?: string;
}

async function main() {
  const excelPath = '/home/mohitraj8503/Downloads/SARTHI Marketing Interns.xlsx';
  
  if (!fs.existsSync(excelPath)) {
    console.error(`Excel file not found at ${excelPath}`);
    process.exit(1);
  }

  // Use python script to parse openpyxl data to clean JSON
  const pyParseScript = `
import openpyxl, json
wb = openpyxl.load_workbook('${excelPath}')
ws = wb['Applicants']
candidates = []
for row in ws.iter_rows(min_row=4, values_only=True):
    if row[1] and str(row[1]).strip():
        name = str(row[1]).strip()
        email = str(row[2]).strip().lower() if row[2] else ''
        phone = str(row[3]).strip() if row[3] else ''
        linkedin = str(row[4]).strip() if row[4] else ''
        location = str(row[5]).strip() if row[5] else ''
        exp = str(row[6]).strip() if row[6] is not None else ''
        role = str(row[7]).strip() if row[7] else ''
        company = str(row[8]).strip() if row[8] else ''
        degree = str(row[9]).strip() if row[9] else ''
        college = str(row[10]).strip() if row[10] else ''
        if email:
            candidates.append({
                'name': name,
                'email': email,
                'phone': phone,
                'linkedin': linkedin,
                'location': location,
                'experience': exp,
                'role': role,
                'company': company,
                'degree': degree,
                'college': college
            })
print(json.dumps(candidates))
`;

  console.log('Extracting candidate data from Excel sheet...');
  const jsonOutput = execSync(`python3 -c "${pyParseScript.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
  const candidates: ExcelCandidate[] = JSON.parse(jsonOutput);

  console.log(`Found ${candidates.length} candidates in Excel file.`);

  // Get default internship
  let internship = await prisma.internship.findFirst();
  if (!internship) {
    internship = await prisma.internship.create({
      data: {
        title: 'Software Development & Creator Internship',
        description: 'Master full-stack software development, technical content writing, and creator workflows.',
      },
    });
  }

  const targetDomain = 'Digital Marketing & Social Media Intern';
  let processedCount = 0;
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const cand of candidates) {
    processedCount++;
    console.log(`\n--- [${processedCount}/${candidates.length}] Processing: ${cand.name} (${cand.email}) ---`);

    try {
      // 1. Find or create User
      let user = await prisma.user.findUnique({
        where: { email: cand.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cand.email,
            name: cand.name,
            phone: cand.phone || null,
            college: cand.college || 'University',
            currentCourse: cand.degree || 'Marketing / Business Administration',
            location: cand.location || null,
            role: 'STUDENT',
            status: 'ACTIVE',
          },
        });
        console.log(`Created User record: ${user.id}`);
      } else {
        console.log(`Existing User record found: ${user.id}`);
      }

      // 2. Find or create InternshipApplication
      let app = await prisma.internshipApplication.findFirst({
        where: {
          OR: [
            { studentId: user.id },
            { email: cand.email },
          ],
        },
      });

      if (!app) {
        app = await prisma.internshipApplication.create({
          data: {
            studentId: user.id,
            internshipId: internship.id,
            name: cand.name,
            email: cand.email,
            college: cand.college || 'University',
            course: cand.degree || 'Marketing / Business Administration',
            semester: '1',
            linkedin: cand.linkedin || null,
            domain: targetDomain,
            statement: `Imported from Excel. Background: ${cand.role || 'N/A'} at ${cand.company || 'N/A'} (${cand.experience || 0} yrs exp)`,
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewedBy: 'pm.enthuse@gmail.com',
          },
        });
        console.log(`Created Application record: ${app.id}`);
      } else {
        console.log(`Existing Application record found: ${app.id} (Status: ${app.status}, OfferAcceptedAt: ${app.offerAcceptedAt})`);
      }

      // 3. Process and Send Offer Letter via Canonical Pipeline Service
      if (app.offerAcceptedAt) {
        console.log(`Offer letter already accepted/sent for ${cand.email} on ${app.offerAcceptedAt}. Skipping.`);
        skippedCount++;
      } else {
        const pipelineResult = await processAndSendOfferLetter({
          applicationId: app.id,
          actorUserId: 'excel-importer',
          actorUserEmail: 'admin@sarthi.in',
        });

        console.log(`Pipeline Result for ${cand.name}:`, pipelineResult);

        if (pipelineResult.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Pipeline failed for ${cand.name}: ${pipelineResult.error}`);
        }
      }
    } catch (candErr: any) {
      errorCount++;
      console.error(`Error processing candidate ${cand.name}:`, candErr.message || candErr);
    }
  }

  console.log('\n==================================================');
  console.log('IMPORT AND ACCEPTANCE PIPELINE SUMMARY:');
  console.log(`Total Candidates Processed: ${processedCount}`);
  console.log(`Successfully Accepted & Offered: ${successCount}`);
  console.log(`Skipped (Already Offered): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('==================================================');
}

main().catch((err) => {
  console.error('Fatal error during import execution:', err);
  process.exit(1);
});
