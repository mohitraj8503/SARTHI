import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDashboardNotifications() {
  console.log('🚀 Creating in-app dashboard notifications for active interns...');

  const activeMembers = await prisma.batchMember.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true }
  });

  console.log(`Found ${activeMembers.length} active intern batch members.`);

  const notificationTitle = '🚨 Urgent: Assignment Deadline Updated';
  const notificationMessage = 'Deadline for Task 2 and Day 3 Task (Student Ambassador Program) has been updated to Today, 30th July at 7:00 PM IST. Please submit your work on the dashboard before 7:00 PM.';

  let count = 0;
  for (const member of activeMembers) {
    if (!member.user?.id) continue;

    await prisma.notification.create({
      data: {
        userId: member.user.id,
        title: notificationTitle,
        body: notificationMessage,
        message: notificationMessage,
        type: 'SYSTEM',
        priority: 'high',
        href: '/dashboard/internship',
      }
    });
    count++;
    console.log(`✅ Created Dashboard Notification for ${member.user.name} (${member.user.email})`);
  }

  console.log(`\n🎉 Successfully created ${count} dashboard notifications! (No emails sent)`);
}

createDashboardNotifications()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
