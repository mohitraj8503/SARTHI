import { prisma } from '../lib/prisma';

async function main() {
  const tracks = [
    { trackSlug: 'content-writing', paymentRequired: true, paymentAmountInr: 2000 },
    { trackSlug: 'digital-marketing', paymentRequired: true, paymentAmountInr: 2000 },
    { trackSlug: 'graphic-design', paymentRequired: true, paymentAmountInr: 2000 },
    { trackSlug: 'video-editing', paymentRequired: true, paymentAmountInr: 2000 },
    { trackSlug: 'advertising', paymentRequired: true, paymentAmountInr: 2000 },
    { trackSlug: 'ai-development', paymentRequired: true, paymentAmountInr: 2000 },
  ];

  console.log('Seeding InternshipTrackConfig default rows...');

  for (const track of tracks) {
    const existing = await prisma.internshipTrackConfig.findUnique({
      where: { trackSlug: track.trackSlug },
    });

    if (!existing) {
      await prisma.internshipTrackConfig.create({
        data: track,
      });
      console.log(`Created config for track: ${track.trackSlug}`);
    } else {
      console.log(`Track config already exists: ${track.trackSlug}`);
    }
  }

  console.log('Finished seeding InternshipTrackConfig rows.');
}

main()
  .catch((err) => {
    console.error('Error seeding track configs:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
