import { processAndSendOfferLetter } from '@/lib/services/offer-letter-pipeline.service';

async function main() {
  const args = process.argv.slice(2);
  const argAppId = args.find((a) => a.startsWith('--applicationId='))?.split('=')[1];
  const customOfferDate = args.find((a) => a.startsWith('--offerDate='))?.split('=')[1];
  const customStartDate = args.find((a) => a.startsWith('--startDate='))?.split('=')[1];
  const customEndDate = args.find((a) => a.startsWith('--endDate='))?.split('=')[1];
  const customDeadline = args.find((a) => a.startsWith('--deadline='))?.split('=')[1];
  const customDuration = args.find((a) => a.startsWith('--duration='))?.split('=')[1];
  const isInitialOffer = args.find((a) => a.startsWith('--isInitial='))?.split('=')[1] === 'true';

  if (!argAppId) {
    console.error('Usage: npx tsx scripts/resend-offer-letter.ts --applicationId=<application_id> [--offerDate=DD-MMM-YYYY] [--startDate=DD-MMM-YYYY] [--endDate=DD-MMM-YYYY] [--deadline=DD-MMM-YYYY] [--duration="X Month(s)"] [--isInitial=true]');
    process.exit(1);
  }

  console.log(`Processing offer letter resend for Application ID: ${argAppId}...`);

  const result = await processAndSendOfferLetter({
    applicationId: argAppId,
    actorUserId: 'cli-admin',
    actorUserEmail: 'admin@sarthi.in',
    forceResend: true,
    isInitialOffer,
    customOfferDate,
    customStartDate,
    customEndDate,
    customDeadline,
    customDuration,
  });

  console.log('Result:', JSON.stringify(result, null, 2));

  if (!result.success) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Execution error:', err);
  process.exit(1);
});
