import { prisma } from '../lib/prisma';
import { processAndSendOfferLetter } from '../lib/services/offer-letter-pipeline.service';

async function main() {
  // Find Keshav's application record
  const app = await prisma.internshipApplication.findFirst({
    where: {
      email: 'keshavruhela25@gmail.com'
    }
  });

  if (!app) {
    console.error(' Keshav Ruhela application record not found in DB!');
    process.exit(1);
  }

  console.log(`Found application ID: ${app.id} for Keshav Ruhela.`);

  // 1. Force update the record to mark it as approved and paid
  await prisma.internshipApplication.update({
    where: { id: app.id },
    data: {
      status: 'APPROVED',
      paymentStatus: 'paid'
    }
  });

  console.log('Application status set to APPROVED and paymentStatus set to paid.');

  // 2. Call pipeline service with customized dates
  const result = await processAndSendOfferLetter({
    applicationId: app.id,
    actorUserId: 'admin-manual',
    actorUserEmail: 'mohitraj8503@gmail.com',
    forceResend: true,
    dryRun: true,
    customOfferDate: '20-Jul-2026',
    customStartDate: '21-Jul-2026',
    customEndDate: '21-Aug-2026',
    customDuration: '1 Month'
  });

  console.log('Pipeline execution finished:', result);
}

main().catch((err) => {
  console.error('Error executing manual trigger script:', err);
});
