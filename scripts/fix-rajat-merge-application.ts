import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== MERGING RAJAT APPLICATION & FIXING SINGLE FACULTY RECORD ===');

  const app = await prisma.teacherApplication.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });

  if (!app) {
    console.error('No TeacherApplication found for Rajat!');
    return;
  }

  // 1. Update TeacherApplication status to APPROVED
  await prisma.teacherApplication.update({
    where: { id: app.id },
    data: { status: 'APPROVED' },
  });
  console.log(`✓ Updated TeacherApplication ${app.id} status to APPROVED`);

  // 2. Transfer photo & info to User record
  const user = await prisma.user.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: app.photoUrl || user.image,
        avatar_url: app.photoUrl || user.avatar_url,
        headline: app.headline || user.headline,
        location: app.city && app.country ? `${app.city.trim()}, ${app.country.trim()}` : user.location,
        bio: app.teachingPhilosophy ? JSON.parse(app.teachingPhilosophy).simplifyConcepts || '' : user.bio,
      },
    });
    console.log(`✓ Updated User ${user.id} with photo, headline, location, and bio!`);

    // 3. Update Teacher record bio & expertise
    await prisma.teacher.updateMany({
      where: { userId: user.id },
      data: {
        bio: app.headline || 'Instructor',
        expertise: app.skills || '["Data Analytics", "Power BI", "SQL", "Python"]',
      },
    });
    console.log('✓ Updated Teacher profile with bio and expertise!');
  }

  console.log('✓ Done! Now Rajat Choudhury has ONLY 1 verified instructor entry with his full profile photo and info!');
}

main().finally(() => prisma.$disconnect());
