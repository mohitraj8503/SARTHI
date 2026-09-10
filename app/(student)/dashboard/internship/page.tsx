import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateEnrollment, getLeaderboard, getSettings, getInternshipApplication } from '@/lib/services/internship.service';
import { prisma } from '@/lib/prisma';
import InternshipDashboardClient from './InternshipDashboardClient';


export const dynamic = 'force-dynamic';

export default async function InternshipDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/dashboard/internship');
  }

  if ((user as any).platformSegment !== 'MAIN') {
    redirect('/dashboard?restricted=internship');
  }

  let member = await getOrCreateEnrollment(user.id);
  const application = await getInternshipApplication(user.id);

  // If application is APPROVED, OFFER_ACCEPTED, ACCEPTED, accepted or paymentStatus === 'paid' but member enrollment wasn't active yet, force-create enrollment
  const isAcceptedOrPaid = application && (
    application.status === 'APPROVED' ||
    application.status === 'OFFER_ACCEPTED' ||
    application.status === 'ACCEPTED' ||
    application.status === 'accepted' ||
    application.paymentStatus === 'paid' ||
    !!application.offerAcceptedAt
  );
  if (!member && isAcceptedOrPaid) {
    const { createEnrollmentForStudent } = await import('@/lib/services/internship.service');
    member = await createEnrollmentForStudent(user.id);
  }

  if (member && member.batch) {
    member.batch.assignments = member.batch.assignments.filter((a: any) => 
      a.recipients.some((r: any) => r.memberId === member.id)
    );
  }
  const leaderboard = await getLeaderboard();
  const settings = await getSettings();

  // Compute sequential application number (for TT-INT-2026-0001 format)
  let applicationNumber = 1;
  if (application) {
    applicationNumber = await prisma.internshipApplication.count({
      where: { submittedAt: { lte: application.submittedAt } },
    });
  }

  // 2. Calculate dynamic timeline details
  let calculatedData = {
    currentWeekString: 'Week 1 of 8',
    nextDeadlineString: 'No upcoming deadlines',
    activityList: [] as any[],
    weeklyGoals: [] as any[],
  };

  if (member && member.batch) {
    const joinedDate = new Date(member.joinedAt);
    const diffWeeks = Math.max(1, Math.ceil((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    calculatedData.currentWeekString = `Week ${diffWeeks} of 8`;

    const nextAssignment = member.batch.assignments
      .filter((a: any) => new Date(a.deadline) > new Date())
      .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
    
    calculatedData.nextDeadlineString = nextAssignment 
      ? new Date(nextAssignment.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : 'No upcoming deadlines';

    const activityList = [
      ...member.xpTransactions.map((tx: any) => ({
        id: tx.id,
        time: tx.createdAt,
        timeLabel: new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        event: tx.description,
      })),
      ...member.submissions.map((sub: any) => ({
        id: sub.id,
        time: sub.updatedAt,
        timeLabel: new Date(sub.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        event: `Submission status: ${sub.status} for "${sub.assignment?.title || 'Assignment'}"`,
      })),
      ...member.badges.map((b: any) => ({
        id: b.id,
        time: b.unlockedAt,
        timeLabel: new Date(b.unlockedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        event: `Badge Awarded: ${b.name} - ${b.description}`,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    calculatedData.activityList = activityList.slice(0, 5);

    calculatedData.weeklyGoals = member.batch.assignments.map((a: any) => {
      const submission = member.submissions.find((s: any) => s.assignmentId === a.id);
      return {
        task: `Deliver ${a.title}`,
        done: submission?.status === 'Approved',
      };
    });
  }

  // 3. Query permanent blacklist database
  const emailToCheck = (user.email || '').toLowerCase().trim();
  const phoneToCheck = (user.phone || '').trim();
  const enrollmentToCheck = (user.enrollmentNumber || '').trim();

  // Flag to control Arka Jain University ban (Set to true to re-enable immediately)
  const ENABLE_ARKA_JAIN_RESTRICTION = false;

  const isBlacklisted = await prisma.rejectedApplicant.findFirst({
    where: {
      OR: [
        { email: emailToCheck },
        ...(phoneToCheck ? [{ phone: phoneToCheck }] : []),
        ...(enrollmentToCheck ? [{ enrollmentNumber: enrollmentToCheck }] : []),
      ],
    },
  });

  const isArkaJainBlacklist = isBlacklisted ? (isBlacklisted.reason || '').toLowerCase().includes('arka jain') : false;
  const activeBlacklisted = isBlacklisted && (ENABLE_ARKA_JAIN_RESTRICTION || !isArkaJainBlacklist);

  const collegeClean = (user.college || '').toLowerCase().trim();
  const courseLower = (user.currentCourse || '').toLowerCase().trim();

  const isArkaJain = ENABLE_ARKA_JAIN_RESTRICTION && (collegeClean === 'arka jain university');
  
  const isTechnical = 
    courseLower.includes('b.tech') || 
    courseLower.includes('btech') || 
    courseLower.includes('b tech') || 
    courseLower.includes('diploma');

  const isProfileRejected = isArkaJain && isTechnical;
  const isArkaJainRejected = !application && (!!activeBlacklisted || isProfileRejected);

  // Fetch announcements/notices for interns
  const notices = await prisma.internshipNotice.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Resolve today's date in Asia/Kolkata timezone (UTC+5:30)
  const now = new Date();
  const kolkataOffset = 5.5 * 60 * 60 * 1000;
  const kolkataTime = new Date(now.getTime() + kolkataOffset);
  const todayStartUTC = new Date(Date.UTC(
    kolkataTime.getUTCFullYear(),
    kolkataTime.getUTCMonth(),
    kolkataTime.getUTCDate()
  ));

  let todayAssignment = null;
  if (member && member.batch && member.batch.assignments && member.batch.assignments.length > 0) {
    todayAssignment = member.batch.assignments.find((a: any) => {
      if (!a.scheduledDate) return false;
      const scheduledDateObj = new Date(a.scheduledDate);
      return scheduledDateObj.getTime() === todayStartUTC.getTime();
    });

    if (!todayAssignment) {
      const sorted = [...member.batch.assignments].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      todayAssignment = sorted[0];
    }
  }

  return (
    <InternshipDashboardClient 
      initialEnrollment={member ? JSON.parse(JSON.stringify(member)) : null} 
      initialApplication={application ? JSON.parse(JSON.stringify(application)) : null}
      applicationNumber={applicationNumber}
      leaderboard={JSON.parse(JSON.stringify(leaderboard))} 
      settings={JSON.parse(JSON.stringify(settings))}
      calculatedData={calculatedData}
      initialIsArkaJainRejected={isArkaJainRejected}
      initialNotices={JSON.parse(JSON.stringify(notices))}
      todayAssignment={todayAssignment ? JSON.parse(JSON.stringify(todayAssignment)) : null}
    />
  );
}

