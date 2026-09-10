import { prisma } from '@/lib/prisma';

export async function getSettings() {
  let settings = await prisma.internshipSettings.findFirst();
  if (!settings) {
    settings = await prisma.internshipSettings.create({
      data: {
        checkInXp: 10,
        requiredAttendance: 80.0,
        requiredAssignments: 90.0,
        requiredXp: 2000,
        levelThresholds: "500,1200,2200",
      }
    });
  }
  return settings;
}

export function calculateLevel(xp: number, thresholdsStr: string): number {
  const thresholds = thresholdsStr.split(',').map(Number);
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) {
      level = i + 2;
    }
  }
  return level;
}

export async function computeInternReferenceAndId(userId: string) {
  // 1. Check if user or member already has an explicit stored TTI enrollmentNumber or BatchMember record
  const [user, member] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { studentId: true, enrollmentNumber: true },
    }),
    prisma.batchMember.findFirst({
      where: { userId },
      select: { permanentInternId: true, referenceNumber: true },
    }),
  ]);

  // Reuse existing permanent Intern ID if already assigned (e.g. Authoritative 11 Roster)
  if (member?.permanentInternId?.startsWith('TTI') && member?.referenceNumber?.startsWith('TT-INT')) {
    return {
      referenceNumber: member.referenceNumber,
      permanentInternId: member.permanentInternId,
    };
  }

  if (user?.enrollmentNumber?.startsWith('TTI')) {
    const numPart = user.enrollmentNumber.replace('TTI', '');
    const padNum = numPart.padStart(4, '0');
    return {
      referenceNumber: `TT-INT-2026-${padNum}`,
      permanentInternId: user.enrollmentNumber,
    };
  }

  // 2. For NEW interns with no existing offer-letter ID:
  //
  // AUTHORITATIVE GAP-FILLING ASSIGNMENT RULE (Source of Truth):
  //   - Collect ALL historically assigned TTI IDs from batch_members + users
  //   - The historical pool spans from 1 to max(all historical IDs)
  //   - Find the LOWEST numeric ID in [1..max] that is currently NOT assigned (vacancy)
  //   - If no vacancy exists, assign max+1
  //
  // STRICTLY PROHIBITED:
  //   ❌ Do NOT assign based on roster sort position (#1 → TTI000001)
  //   ❌ Do NOT use highest+1 without checking for vacancies first
  //   ❌ Do NOT auto-convert Student IDs (TT-STU-XXXXXX is NOT TTIXXXXXX)
  //   ❌ Do NOT change or renumber IDs of existing interns

  const existingMembers = await prisma.batchMember.findMany({
    where: { permanentInternId: { startsWith: 'TTI' } },
    select: { permanentInternId: true },
  });

  const existingUsers = await prisma.user.findMany({
    where: { enrollmentNumber: { startsWith: 'TTI' } },
    select: { enrollmentNumber: true },
  });

  const usedNumbers = new Set<number>();
  for (const m of existingMembers) {
    if (m.permanentInternId) {
      const parsed = parseInt(m.permanentInternId.replace('TTI', ''), 10);
      if (!isNaN(parsed) && parsed > 0) usedNumbers.add(parsed);
    }
  }
  for (const u of existingUsers) {
    if (u.enrollmentNumber) {
      const parsed = parseInt(u.enrollmentNumber.replace('TTI', ''), 10);
      if (!isNaN(parsed) && parsed > 0) usedNumbers.add(parsed);
    }
  }

  // Find the maximum historically assigned number
  const maxUsed = usedNumbers.size > 0 ? Math.max(...usedNumbers) : 0;

  // Find lowest vacant ID starting from 1 (gap-filling)
  let nextNum = 1;
  while (usedNumbers.has(nextNum) && nextNum <= maxUsed) {
    nextNum++;
  }
  // If no gap found within historical range, go to max+1
  if (nextNum > maxUsed) {
    nextNum = maxUsed + 1;
  }

  const padNum = String(nextNum).padStart(4, '0');
  const padInternId = String(nextNum).padStart(6, '0');
  const year = 2026;

  return {
    referenceNumber: `TT-INT-${year}-${padNum}`,
    permanentInternId: `TTI${padInternId}`,
  };
}

// Calculate XP reward dynamically based on category and difficulty matrix
export function calculateXpReward(category: string, difficulty: string): number {
  let base = 100;
  switch (difficulty) {
    case 'Beginner': base = 50; break;
    case 'Easy': base = 100; break;
    case 'Intermediate': base = 200; break;
    case 'Advanced': base = 350; break;
    case 'Expert': base = 500; break;
  }

  let multiplier = 1.0;
  switch (category) {
    case 'Daily Assignment': multiplier = 1.0; break;
    case 'Weekly Challenge': multiplier = 1.5; break;
    case 'Mini Project': multiplier = 2.0; break;
    case 'Major Project': multiplier = 3.0; break;
    case 'Research Task': multiplier = 1.5; break;
    case 'Bug Fix': multiplier = 1.2; break;
    case 'Documentation': multiplier = 0.8; break;
    case 'Presentation': multiplier = 1.2; break;
    case 'Code Review': multiplier = 1.2; break;
  }

  return Math.round(base * multiplier);
}

export async function getOrCreateEnrollment(userId: string) {
  // 1. Find if user is a member of any batch
  let member = await prisma.batchMember.findFirst({
    where: { userId },
    include: {
      batch: {
        include: {
          internship: true,
          assignments: {
            include: {
              recipients: true,
            },
          },
        },
      },
      submissions: {
        include: {
          assignment: true,
          versions: {
            orderBy: { versionNumber: 'desc' }
          },
          feedbacks: true,
        },
      },
      badges: true,
      checkIns: true,
      attendances: true,
      certificates: true,
      xpTransactions: {
        orderBy: { createdAt: 'desc' }
      },
    },
  });

  if (member) {
    if (!member.referenceNumber || !member.permanentInternId) {
      const { referenceNumber, permanentInternId } = await computeInternReferenceAndId(userId);
      try {
        member = await prisma.batchMember.update({
          where: { id: member.id },
          data: { referenceNumber, permanentInternId },
          include: {
            batch: {
              include: {
                internship: true,
                assignments: {
                  include: {
                    recipients: true,
                  },
                },
              },
            },
            submissions: {
              include: {
                assignment: true,
              },
            },
            badges: true,
            checkIns: true,
            attendances: true,
            certificates: true,
            xpTransactions: {
              orderBy: { createdAt: 'desc' }
            },
          },
        });
      } catch (err: any) {
        console.warn('Failed to update member reference numbers:', err);
      }
    }
    return member;
  }

  // If no member exists yet, check if student has a paid/accepted application
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  const app = await prisma.internshipApplication.findFirst({
    where: {
      OR: [
        { studentId: userId },
        ...(user?.email ? [{ email: user.email }] : [])
      ]
    },
    orderBy: { submittedAt: 'desc' }
  });

  const isAcceptedOrPaid = app && (
    app.status === 'APPROVED' ||
    app.status === 'OFFER_ACCEPTED' ||
    app.status === 'ACCEPTED' ||
    app.status === 'accepted' ||
    app.paymentStatus === 'paid' ||
    !!app.offerAcceptedAt
  );

  if (isAcceptedOrPaid) {
    return createEnrollmentForStudent(userId);
  }

  return null;
}

export async function createEnrollmentForStudent(userId: string) {
  let member = await prisma.batchMember.findFirst({
    where: { userId },
    include: {
      batch: {
        include: {
          internship: true,
          assignments: {
            include: {
              recipients: true,
            },
          },
        },
      },
      submissions: {
        include: {
          assignment: true,
          versions: {
            orderBy: { versionNumber: 'desc' }
          },
          feedbacks: true,
        },
      },
      badges: true,
      checkIns: true,
      attendances: true,
      certificates: true,
      xpTransactions: {
        orderBy: { createdAt: 'desc' }
      },
    },
  });

  if (member) {
    return member;
  }

  let internship = await prisma.internship.findFirst({
    include: { batches: true }
  });

  if (!internship) {
    internship = await prisma.internship.create({
      data: {
        title: "Software Development & Creator Internship",
        description: "Master full-stack software development, technical content writing, and creator workflows.",
      },
      include: { batches: true },
    });
  }

  let batch = await prisma.internshipBatch.findFirst({
    where: { internshipId: internship.id },
    include: { assignments: true },
  });

  if (!batch) {
    batch = await prisma.internshipBatch.create({
      data: {
        internshipId: internship.id,
        name: "July 2026 Batch",
        mentorName: "Mohit Raj",
        mentorTitle: "Mentor",
        mentorEmail: "pm.enthuse@gmail.com",
        duration: "2 Months",
        status: "ACTIVE",
      },
      include: { assignments: true },
    });

    await prisma.internshipBatch.create({
      data: {
        internshipId: internship.id,
        name: "August 2026 Batch",
        mentorName: "Mohit Raj",
        mentorTitle: "Mentor",
        mentorEmail: "pm.enthuse@gmail.com",
        duration: "2 Months",
        status: "ACTIVE",
      }
    });

    batch = await prisma.internshipBatch.findUnique({
      where: { id: batch.id },
      include: { assignments: true },
    }) || batch;
  }

  // Generate unique reference and intern IDs matching candidate offer letter & student ID
  const computedIds = await computeInternReferenceAndId(userId);
  let created = false;
  let attempts = 0;
  while (!created && attempts < 5) {
    attempts++;
    const referenceNumber = attempts === 1 ? computedIds.referenceNumber : `${computedIds.referenceNumber}-${Date.now().toString().slice(-4)}`;
    const permanentInternId = attempts === 1 ? computedIds.permanentInternId : `${computedIds.permanentInternId}${Date.now().toString().slice(-3)}`;

    try {
      member = await prisma.batchMember.create({
        data: {
          userId,
          batchId: batch.id,
          status: "ACTIVE",
          currentXp: 0,
          currentLevel: 1,
          referenceNumber,
          permanentInternId,
        },
        include: {
          batch: {
            include: {
              internship: true,
              assignments: {
                include: {
                  recipients: true,
                },
              },
            },
          },
          submissions: {
            include: {
              assignment: true,
              versions: {
                orderBy: { versionNumber: 'desc' }
              },
              feedbacks: true,
            },
          },
          badges: true,
          checkIns: true,
          attendances: true,
          certificates: true,
          xpTransactions: {
            orderBy: { createdAt: 'desc' }
          },
        },
      });
      created = true;
    } catch (err: any) {
      if (err.code === 'P2002' && attempts < 5) {
        // Unique constraint collision — retry with next sequence & random suffix
        continue;
      }
      throw err;
    }
  }

  await prisma.internshipAttendance.create({
    data: {
      memberId: member.id,
      daysActive: 0,
      totalSubmitted: 0,
      consistency: 0,
      streak: 0,
    }
  });

  return member;
}

export async function performCheckIn(memberId: string) {
  const checkInDate = new Date().toISOString().split('T')[0];

  const existing = await prisma.dailyCheckIn.findUnique({
    where: {
      memberId_checkInDate: {
        memberId,
        checkInDate,
      },
    },
  });

  if (existing) {
    throw new Error("Already checked in today.");
  }

  const settings = await getSettings();

  await prisma.dailyCheckIn.create({
    data: {
      memberId,
      checkInDate,
    },
  });

  // Credit XP Transaction
  await prisma.xpTransaction.create({
    data: {
      memberId,
      amount: settings.checkInXp,
      description: `+${settings.checkInXp} Check-in`,
    },
  });

  const member = await prisma.batchMember.findUnique({
    where: { id: memberId },
    include: { checkIns: true, attendances: true },
  });

  if (!member) throw new Error("Member not found");

  const newXp = member.currentXp + settings.checkInXp;
  const level = calculateLevel(newXp, settings.levelThresholds);

  await prisma.batchMember.update({
    where: { id: memberId },
    data: {
      currentXp: newXp,
      currentLevel: level,
    },
  });

  // Update attendance streaks
  if (member.attendances && member.attendances.length > 0) {
    const att = member.attendances[0];
    const newStreak = att.streak + 1;
    await prisma.internshipAttendance.update({
      where: { id: att.id },
      data: {
        daysActive: att.daysActive + 1,
        streak: newStreak,
        consistency: Math.round(((att.daysActive + 1) / (member.checkIns.length + 1)) * 100),
      },
    });
  }

  return { success: true, xpEarned: settings.checkInXp, newXp, level };
}

export async function submitVersionedAssignment(
  memberId: string, 
  assignmentId: string, 
  data: {
    githubUrl?: string;
    liveUrl?: string;
    driveLink?: string;
    comments?: string;
  }
) {
  // Find or create base submission
  let submission = await prisma.internshipSubmission.findFirst({
    where: { memberId, assignmentId },
    include: { versions: true }
  });

  if (!submission) {
    submission = await prisma.internshipSubmission.create({
      data: {
        memberId,
        assignmentId,
        status: "Waiting for Review",
      },
      include: { versions: true }
    });
  } else {
    const nextStatus = (submission.status === 'Needs Changes' || submission.status === 'Rejected') 
      ? 'Resubmitted' 
      : 'Waiting for Review';
      
    submission = await prisma.internshipSubmission.update({
      where: { id: submission.id },
      data: { status: nextStatus },
      include: { versions: true }
    });
  }

  const versionNumber = (submission.versions?.length || 0) + 1;

  // Append new version
  await prisma.submissionVersion.create({
    data: {
      submissionId: submission.id,
      versionNumber,
      ...data,
    },
  });

  // Update attendance counter
  const attendance = await prisma.internshipAttendance.findFirst({
    where: { memberId },
  });

  if (attendance) {
    await prisma.internshipAttendance.update({
      where: { id: attendance.id },
      data: {
        totalSubmitted: { increment: 1 },
      },
    });
  }

  return submission;
}

export async function getLeaderboard() {
  return prisma.batchMember.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          avatar_url: true,
        },
      },
      attendances: true,
    },
    orderBy: [
      { currentXp: 'desc' },
    ],
    take: 20,
  });
}

export async function getInternshipApplication(studentId: string) {
  const user = await prisma.user.findUnique({ where: { id: studentId }, select: { email: true } });
  const app = await prisma.internshipApplication.findFirst({
    where: {
      OR: [
        { studentId },
        ...(user?.email ? [{ email: user.email }] : [])
      ]
    },
    orderBy: { submittedAt: 'desc' },
  });

  if (app && (!app.studentId || app.studentId !== studentId)) {
    try {
      await prisma.internshipApplication.update({
        where: { id: app.id },
        data: { studentId },
      });
      app.studentId = studentId;
    } catch (e) {
      console.warn('Failed to auto-link application studentId:', e);
    }
  }

  return app;
}

export async function submitInternshipApplication(studentId: string, data: any) {
  // Prevent duplicate submissions: return existing application if one already exists
  const existing = await prisma.internshipApplication.findFirst({
    where: { studentId },
    orderBy: { submittedAt: 'desc' },
  });
  if (existing) {
    return existing;
  }

  let internship = await prisma.internship.findFirst();
  if (!internship) {
    internship = await prisma.internship.create({
      data: {
        title: "Software Development & Creator Internship",
        description: "Master full-stack software development, technical content writing, and creator workflows.",
      },
    });
  }

  const rawTrack = data.trackSlug || data.domain || 'ai-development';
  const trackSlug = rawTrack.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'ai-development';

  return prisma.internshipApplication.create({
    data: {
      studentId,
      internshipId: internship.id,
      trackSlug,
      status: "pending",
      paymentStatus: "unpaid",
      name: data.name,
      email: data.email,
      college: data.college,
      course: data.course,
      semester: data.semester,
      location: data.location,
      resume: data.resume,
      github: data.github,
      linkedin: data.linkedin,
      portfolio: data.portfolio,
      domain: data.domain,
      preferredField: data.preferredField,
      internshipTrack: data.internshipTrack,
      statement: data.statement,
    },
  });
}

export async function acceptInternshipOffer(studentId: string, applicationId: string) {
  await prisma.internshipApplication.update({
    where: { id: applicationId },
    data: {
      status: "OFFER_ACCEPTED",
      offerAcceptedAt: new Date(),
    },
  });

  return createEnrollmentForStudent(studentId);
}
