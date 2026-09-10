import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== FETCHING ALL REAL APPLICATION DATES FROM DB ===\n');

  const apps = await prisma.internshipApplication.findMany({
    orderBy: { submittedAt: 'asc' }
  });

  console.log(`Found ${apps.length} internship applications in DB.\n`);

  for (const app of apps) {
    const submitDate = app.submittedAt ? new Date(app.submittedAt) : null;
    const paidDate = app.paidAt ? new Date(app.paidAt) : null;
    const offerDate = app.offerAcceptedAt ? new Date(app.offerAcceptedAt) : null;

    // Best reference date: offerAcceptedAt > paidAt > submittedAt
    const refDate = offerDate || paidDate || submitDate;

    let startStr = 'N/A';
    let endStr = 'N/A';
    let issueStr = 'N/A';

    if (refDate) {
      const startObj = new Date(refDate);
      const endObj = new Date(refDate);
      endObj.setMonth(endObj.getMonth() + 1); // Exactly 1 month internship

      startStr = startObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      endStr = endObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      issueStr = endObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    console.log(`Name: ${app.name.padEnd(25)} | Email: ${app.email.padEnd(30)} | College: ${app.college || 'N/A'}`);
    console.log(`  SubmittedAt: ${app.submittedAt ? new Date(app.submittedAt).toISOString() : 'N/A'}`);
    console.log(`  Real Start:  ${startStr}`);
    console.log(`  Real End:    ${endStr}\n`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
