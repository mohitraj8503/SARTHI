import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getBrandedTemplate } from '@/lib/email/templates/branded';

export async function getMentorDashboardData(userEmail: string) {
  const memberUserInclude = {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      avatar_url: true,
      lastActive: true,
      status: true,
      college: true,
      location: true,
      phone: true,
      internshipApplications: true,
    }
  };

  const memberInclude = {
    include: {
      user: memberUserInclude,
      submissions: {
        include: {
          assignment: true,
          versions: {
            take: 5,
            orderBy: { versionNumber: 'desc' as const },
          },
          feedbacks: true,
        },
      },
      xpTransactions: {
        take: 20,
        orderBy: { createdAt: 'desc' as const },
      },
      attendances: true,
      checkIns: {
        take: 30,
        orderBy: { createdAt: 'desc' as const },
      },
      badges: true,
      certificates: true,
    },
  };

  const assignmentInclude = {
    include: {
      submissions: {
        include: {
          versions: {
            take: 5,
            orderBy: { versionNumber: 'desc' as const },
          },
          feedbacks: true,
        },
      },
      recipients: {
        include: {
          member: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      },
      resources: true,
      discussions: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true, role: true }
          },
        },
        take: 20,
        orderBy: { createdAt: 'desc' as const },
      },
    },
  };

const EXCLUDED_COMPLETED_INTERN_EMAILS = new Set([
  'keshavruhela25@gmail.com',
  'arpitjha1647@gmail.com',
  'manirohilla369@gmail.com',
  'herilbhuptawat@gmail.com',
  'ishantyadav155@gmail.com',
  'adityasin473@gmail.com',
  'yugankjadon@gmail.com',
  'shivanipushantanwani@gmail.com',
]);

  // Run initial queries in parallel for maximum performance
  const [mentorBatches, rawApplications] = await Promise.all([
    prisma.internshipBatch.findMany({
      where: {
        OR: [
          { mentorEmail: userEmail },
          { mentorEmail: userEmail.toLowerCase() }
        ]
      },
      include: {
        members: memberInclude,
        assignments: assignmentInclude,
      },
    }),
    prisma.internshipApplication.findMany({
      select: {
        id: true,
        studentId: true,
        internshipId: true,
        trackSlug: true,
        status: true,
        paymentStatus: true,
        paymentId: true,
        orderId: true,
        amountPaidInr: true,
        paidAt: true,
        paymentStatusSource: true,
        paymentOverrideBy: true,
        paymentOverrideNote: true,
        paymentOverrideAt: true,
        name: true,
        email: true,
        college: true,
        course: true,
        semester: true,
        location: true,
        resume: true,
        github: true,
        linkedin: true,
        portfolio: true,
        domain: true,
        preferredField: true,
        internshipTrack: true,
        statement: true,
        submittedAt: true,
        reviewedAt: true,
        reviewedBy: true,
        offerAcceptedAt: true,
        student: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      },
      orderBy: { submittedAt: 'desc' },
    })
  ]);

  const applications = rawApplications.filter(
    app => !EXCLUDED_COMPLETED_INTERN_EMAILS.has((app.email || '').toLowerCase().trim())
  );

  let batches = mentorBatches;
  if (batches.length === 0) {
    batches = await prisma.internshipBatch.findMany({
      include: {
        members: memberInclude,
        assignments: assignmentInclude,
      },
    });
  }

  // Exclude completed certified interns from batch members list
  batches = batches.map(batch => ({
    ...batch,
    members: batch.members.filter(
      member => !EXCLUDED_COMPLETED_INTERN_EMAILS.has((member.user?.email || '').toLowerCase().trim())
    )
  }));

  // Calculate dynamic operational statistics
  let activeInternsCount = 0;
  let activeCohortsCount = 0;
  let pendingReviewsCount = 0;
  let reviewedTodayCount = 0;
  let totalRatingSum = 0;
  let ratingCount = 0;
  let totalXpAwarded = 0;
  let certificatesRecommendedCount = 0;
  let onlineInternsCount = 0;
  let totalProgressPctSum = 0;
  let progressCount = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  // Lists for compiling recent activities dynamically
  const activities: any[] = [];
  const allMembersList: any[] = [];

  batches.forEach(batch => {
    if (batch.status === 'ACTIVE') {
      activeCohortsCount++;
    }

    batch.members.forEach(member => {
      allMembersList.push({
        ...member,
        batchName: batch.name,
      });

      if (member.status === 'ACTIVE') {
        activeInternsCount++;
      }

      // Check online status: lastActive within the past 15 minutes (null-safe)
      const lastActiveMs = member.user.lastActive ? new Date(member.user.lastActive).getTime() : 0;
      const isOnline = lastActiveMs > 0 && (Date.now() - lastActiveMs < 15 * 60 * 1000);
      if (isOnline) {
        onlineInternsCount++;
      }

      totalXpAwarded += member.xpTransactions.reduce((acc, t) => acc + t.amount, 0);
      certificatesRecommendedCount += member.certificates.length;

      // Calculate progress: approved assignments out of total batch assignments
      const approvedCount = member.submissions.filter(s => s.status === 'Approved').length;
      const totalAssigned = batch.assignments.length;
      if (totalAssigned > 0) {
        totalProgressPctSum += (approvedCount / totalAssigned) * 100;
        progressCount++;
      }

      // Map member XP transactions to activity list
      member.xpTransactions.forEach(t => {
        activities.push({
          id: `xp-${t.id}`,
          type: 'XP',
          date: t.createdAt,
          title: `${member.user.name} earned/lost XP`,
          desc: t.description,
        });
      });

      // Map member badges to activity list
      member.badges.forEach(b => {
        activities.push({
          id: `badge-${b.id}`,
          type: 'BADGE',
          date: b.createdAt,
          title: `${member.user.name} unlocked ${b.icon || '🏆'} ${b.name}`,
          desc: b.description,
        });
      });

      // Map member submissions to activity list
      member.submissions.forEach(sub => {
        const assignment = batch.assignments.find((a: any) => a.id === sub.assignmentId);
        activities.push({
          id: `sub-${sub.id}`,
          type: 'SUBMISSION',
          date: sub.updatedAt,
          title: `${member.user.name} submitted assignment`,
          desc: assignment ? assignment.title : 'Task submission',
        });

        if (sub.status === 'Waiting for Review' || sub.status === 'Submitted') {
          pendingReviewsCount++;
        }

        const subDateStr = sub.updatedAt.toISOString().split('T')[0];
        if (subDateStr === todayStr && (sub.status === 'Approved' || sub.status === 'Rejected' || sub.status === 'Needs Changes')) {
          reviewedTodayCount++;
        }

        sub.feedbacks.forEach(fb => {
          totalRatingSum += fb.rating;
          ratingCount++;
        });
      });
    });
  });

  // Map Applications to activity list
  applications.forEach(app => {
    activities.push({
      id: `app-${app.id}`,
      type: 'APPLICATION',
      date: app.submittedAt,
      title: `New application: ${app.name}`,
      desc: `${app.college} - ${app.course}`,
    });
  });

  // Sort activities by date descending
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentActivities = activities.slice(0, 10);

  // Top performers and needs attention snapshot
  const topPerformers = [...allMembersList]
    .sort((a, b) => b.currentXp - a.currentXp)
    .slice(0, 5);

  const needsAttention = allMembersList
    .filter(m => m.currentXp < 300 || m.submissions.length === 0)
    .slice(0, 5);

  const avgRating = ratingCount > 0 ? Number((totalRatingSum / ratingCount).toFixed(1)) : 5.0;
  const avgProgress = progressCount > 0 ? Math.round(totalProgressPctSum / progressCount) : 0;

  return {
    batches,
    applications,
    recentActivities,
    topPerformers,
    needsAttention,
    stats: {
      activeInterns: activeInternsCount,
      activeCohorts: activeCohortsCount,
      pendingReviews: pendingReviewsCount,
      reviewedToday: reviewedTodayCount,
      avgPerformanceRating: avgRating,
      totalXpAwarded,
      certificatesRecommended: certificatesRecommendedCount,
      onlineInterns: onlineInternsCount,
      averageProgress: avgProgress,
      currentResponseTime: "2h 45m",
    }
  };
}

export async function createAssignmentAction(data: {
  memberId: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  xpReward: number;
  deadline: string;
}) {
  const member = await prisma.batchMember.findUnique({
    where: { id: data.memberId },
    select: {
      id: true,
      batchId: true,
      userId: true,
      user: {
        select: { email: true, name: true }
      }
    }
  });

  if (!member) {
    throw new Error('Member not found');
  }

  const assignment = await prisma.internshipAssignment.create({
    data: {
      batchId: member.batchId,
      title: data.title,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
      estimatedTime: data.estimatedTime,
      xpReward: Number(data.xpReward),
      deadline: new Date(data.deadline),
      mode: 'INDIVIDUAL',
    },
  });

  await prisma.internshipAssignmentRecipient.create({
    data: {
      assignmentId: assignment.id,
      memberId: member.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: member.userId,
      title: 'New Assignment Assigned 📋',
      body: `You have been assigned a new task: "${data.title}".`,
      message: `Please complete and submit: "${data.title}". XP Reward: ${data.xpReward} XP.`,
      type: 'SYSTEM',
    },
  });

  // Send email notice to the intern
  if (member?.user?.email) {
    const formattedDeadline = new Date(data.deadline).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' (IST)';

    const emailSubject = `New Assignment: ${data.title}`;
    const emailBody = `Dear ${member.user.name || 'Intern'},

You have been assigned a new task under your internship cohort. Here are the details of your assignment:

**Assignment Title**: ${data.title}
**Category**: ${data.category || 'Daily Assignment'}
**Difficulty**: ${data.difficulty || 'Intermediate'}
**Reward**: ${data.xpReward} XP
**Deadline**: ${formattedDeadline}

**Exact Work / Instructions**:
${data.description}

Please complete the assignment and submit your work before the deadline to earn your XP and maintain progress in the cohort.`;

    const html = getBrandedTemplate({
      badge: 'NEW ASSIGNMENT',
      heading: emailSubject,
      body: emailBody,
      highlight: `Deadline: ${formattedDeadline} | Reward: ${data.xpReward} XP`,
      action: {
        label: 'Go to Student Dashboard',
        url: 'https://sarthi-woad.vercel.app/dashboard',
      },
      senderName: 'SARTHI Mentor Team',
    });

    sendTransactionalEmail({
      to: member.user.email,
      subject: emailSubject,
      html: html,
      type: 'notification',
      provider: 'resend',
    }).catch(err => {
      console.error('[createAssignmentAction] Failed to send transactional email:', err);
    });
  }

  return assignment;
}

export async function reviewSubmissionAction(data: {
  submissionId: string;
  status: string; // Approved, Rejected, Needs Changes
  rating: number;
  publicFeedback: string;
  privateNotes?: string;
  xpBonus?: number;
  xpPenalty?: number;
  reason?: string;
}) {
  const submission = await prisma.internshipSubmission.findUnique({
    where: { id: data.submissionId },
    include: {
      member: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      assignment: true,
      versions: {
        orderBy: { versionNumber: 'desc' }
      }
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Create MentorFeedback
  const feedback = await prisma.mentorFeedback.create({
    data: {
      submissionId: data.submissionId,
      rating: Number(data.rating),
      publicFeedback: data.publicFeedback,
      privateNotes: data.privateNotes || '',
    },
  });

  // Update submission status and sync Excel evaluation fields
  const demoStatus = data.status === 'Approved' ? 'Verified' : (data.status === 'Needs Changes' ? 'Revision Requested' : 'Rejected');
  await prisma.internshipSubmission.update({
    where: { id: data.submissionId },
    data: { 
      status: data.status,
      mentorFeedback: data.publicFeedback,
      reviewerFeedback: data.privateNotes || null,
      demoProjectStatus: demoStatus
    },
  });

  // Award/Adjust XP
  let xpChange = 0;
  if (data.status === 'Approved') {
    xpChange += submission.assignment.xpReward;
  }
  if (data.xpBonus) {
    xpChange += Number(data.xpBonus);
  }
  if (data.xpPenalty) {
    xpChange -= Number(data.xpPenalty);
  }

  if (xpChange !== 0) {
    await prisma.xpTransaction.create({
      data: {
        memberId: submission.memberId,
        amount: xpChange,
        description: `Submission check [${submission.assignment.title}] evaluated as ${data.status}. Reason: ${data.reason || 'Standard evaluation'}`,
      },
    });

    const settings = await prisma.internshipSettings.findFirst();
    const thresholdsStr = settings?.levelThresholds || "500,1200,2200";
    const newXp = Math.max(0, submission.member.currentXp + xpChange);
    
    const thresholds = thresholdsStr.split(',').map(Number);
    let level = 1;
    for (let i = 0; i < thresholds.length; i++) {
      if (newXp >= thresholds[i]) {
        level = i + 2;
      }
    }

    await prisma.batchMember.update({
      where: { id: submission.memberId },
      data: {
        currentXp: newXp,
        currentLevel: level,
      },
    });
  }

  // Send branded email notification to intern for non-approved outcomes (Needs Changes / Rejected)
  // PRIVACY GUARANTEE: privateNotes is strictly omitted from email content
  if ((data.status === 'Needs Changes' || data.status === 'Rejected') && submission.member?.user?.email) {
    const { getEvaluationEmailHtml } = await import('@/lib/email/templates/evaluation-email');
    const emailHtml = getEvaluationEmailHtml({
      recipientName: submission.member.user.name || 'Intern',
      assignmentTitle: submission.assignment.title,
      versionNumber: submission.versions?.[0]?.versionNumber || 1,
      status: data.status,
      publicFeedback: data.publicFeedback,
      rating: Number(data.rating),
      xpPenalty: data.xpPenalty ? Number(data.xpPenalty) : undefined,
    });

    sendTransactionalEmail({
      to: submission.member.user.email,
      subject: `Action Required: Your submission for "${submission.assignment.title}" needs revision`,
      html: emailHtml,
      type: 'notification',
      provider: 'resend',
    }).catch(err => {
      console.error('[reviewSubmissionAction] Failed to send evaluation email:', err.message);
    });
  }

  return feedback;
}

export async function manageAttendanceAction(data: {
  memberId: string;
  action: 'approve' | 'reject';
}) {
  const attendance = await prisma.internshipAttendance.findUnique({
    where: { memberId: data.memberId }
  });

  if (!attendance) {
    return await prisma.internshipAttendance.create({
      data: {
        memberId: data.memberId,
        daysActive: data.action === 'approve' ? 1 : 0,
        totalSubmitted: 0,
        consistency: data.action === 'approve' ? 100.0 : 0.0,
        streak: data.action === 'approve' ? 1 : 0,
      }
    });
  }

  const updatedDays = data.action === 'approve' ? attendance.daysActive + 1 : attendance.daysActive;
  const updatedStreak = data.action === 'approve' ? attendance.streak + 1 : 0;
  // consistency = approved days / total recorded days (capped at 100%)
  const totalDays = updatedDays + (data.action === 'reject' ? 1 : 0);
  const consistencyPct = totalDays > 0 ? Number(((updatedDays / totalDays) * 100).toFixed(1)) : 100.0;

  return await prisma.internshipAttendance.update({
    where: { memberId: data.memberId },
    data: {
      daysActive: updatedDays,
      streak: updatedStreak,
      consistency: consistencyPct,
    }
  });
}

export async function adjustXpAction(data: {
  memberId: string;
  amount: number;
  description: string;
}) {
  const member = await prisma.batchMember.findUnique({
    where: { id: data.memberId }
  });

  if (!member) throw new Error("Member not found");

  await prisma.xpTransaction.create({
    data: {
      memberId: data.memberId,
      amount: data.amount,
      description: data.description,
    }
  });

  const settings = await prisma.internshipSettings.findFirst();
  const thresholdsStr = settings?.levelThresholds || "500,1200,2200";
  const newXp = Math.max(0, member.currentXp + data.amount);

  const thresholds = thresholdsStr.split(',').map(Number);
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (newXp >= thresholds[i]) {
      level = i + 2;
    }
  }

  return await prisma.batchMember.update({
    where: { id: data.memberId },
    data: {
      currentXp: newXp,
      currentLevel: level
    }
  });
}

export async function awardBadgeAction(data: {
  memberId: string;
  name: string;
  description: string;
  icon: string;
}) {
  return await prisma.internshipBadge.create({
    data: {
      memberId: data.memberId,
      name: data.name,
      description: data.description,
      icon: data.icon,
    }
  });
}

export async function deleteAssignmentAction(data: {
  assignmentId: string;
}) {
  return await prisma.internshipAssignment.delete({
    where: { id: data.assignmentId }
  });
}

export async function bulkReviewAction(data: {
  submissionIds: string[];
  status: string; // Approved, Rejected
  rating: number;
  publicFeedback: string;
}) {
  const results = [];
  for (const subId of data.submissionIds) {
    const feedback = await reviewSubmissionAction({
      submissionId: subId,
      status: data.status,
      rating: data.rating,
      publicFeedback: data.publicFeedback,
      privateNotes: data.status === 'Approved' ? 'Bulk Approved' : 'Bulk Rejected',
      xpBonus: 0,
      xpPenalty: 0,
      reason: 'Bulk actions utility',
    });
    results.push(feedback);
  }
  return results;
}

export async function manageApplicationAction(data: {
  applicationId: string;
  status: string; // APPROVED, REJECTED
  reviewerEmail: string;
}) {
  return await prisma.internshipApplication.update({
    where: { id: data.applicationId },
    data: {
      status: data.status,
      reviewedAt: new Date(),
      reviewedBy: data.reviewerEmail,
    }
  });
}

export async function suspendInternAction(data: {
  memberId: string;
  reason: string;
  actorEmail?: string;
}) {
  const member = await prisma.batchMember.findUnique({
    where: { id: data.memberId },
    include: {
      user: true,
      batch: {
        include: {
          internship: true
        }
      }
    }
  });

  if (!member) {
    throw new Error('Intern record not found');
  }

  // 1. Update BatchMember status to SUSPENDED
  const updatedMember = await prisma.batchMember.update({
    where: { id: data.memberId },
    data: { status: 'SUSPENDED' }
  });

  // 2. Also update User status if available
  if (member.userId) {
    await prisma.user.update({
      where: { id: member.userId },
      data: { status: 'SUSPENDED' }
    });
  }

  // 3. Send Branded Permanent Suspension Email
  const internEmail = member.user?.email;
  const internName = member.user?.name || 'Intern';
  const trackName = member.batch?.internship?.title || 'Internship Program';
  const reasonText = data.reason?.trim() || 'Attendance requirement non-compliance';

  if (internEmail) {
    try {
      const { sendTransactionalEmail } = await import('@/lib/email/send');
      const { getBrandedTemplate } = await import('@/lib/email/templates/branded');

      const suspensionEmailHtml = getBrandedTemplate({
        badge: 'DISQUALIFICATION & SUSPENSION NOTICE',
        heading: 'IMMEDIATE PERMANENT SUSPENSION & DISQUALIFICATION',
        body: `Dear **${internName}**,

This is an **OFFICIAL NOTICE** that your enrollment and participation in the **${trackName}** at **SARTHI** has been **IMMEDIATELY & PERMANENTLY TERMINATED**.

Your record has been updated to **PERMANENTLY SUSPENDED** due to strict non-compliance with our program policies and standards.

**Official Disqualification Record:**
• **Intern ID:** ${member.permanentInternId || member.referenceNumber || 'N/A'}
• **Batch:** ${member.batch?.name || 'Cohort 2026'}
• **Account Status:** PERMANENTLY SUSPENDED
• **Official Reason:** ${reasonText}

**Immediate Mandatory Consequences:**
1. **Access Revocation:** Your student portal access, task submission system, and learning workspace are locked immediately.
2. **Forfeiture of Credentials:** You are permanently disqualified from receiving any Certificate of Completion, Letter of Recommendation (LOR), or performance endorsement.
3. **Blacklist Entry:** Your profile has been flagged as Suspended in our internal academic registry.

This decision is **FINAL and NON-APPEALABLE**. Any further unauthorized access attempts will be blocked by system security.`,
        highlight: '🛑 FINAL DECISION: Your active internship standing is officially revoked. No requests for reinstatement will be entertained.',
        action: {
          label: 'CONTACT ACADEMIC DISCIPLINE BOARD',
          url: 'mailto:mohitraj8503@gmail.com',
        },
        senderName: 'Academic Disciplinary Board & Leadership Team',
      });

      await sendTransactionalEmail({
        to: internEmail,
        subject: 'OFFICIAL NOTICE: Permanent Internship Program Suspension',
        html: suspensionEmailHtml,
        type: 'notification',
        provider: 'resend',
      });
    } catch (emailErr) {
      console.error('[SUSPEND_INTERN] Email dispatch error:', emailErr);
    }
  }

  // 4. Log System AuditLog
  try {
    await prisma.auditLog.create({
      data: {
        actorId: 'mentor',
        actorEmail: data.actorEmail || 'mentor@sarthi.in',
        action: 'INTERN_PERMANENTLY_SUSPENDED',
        entityType: 'BatchMember',
        entityId: member.id,
        entityName: member.user?.name || 'Intern',
        newValues: JSON.stringify({ reason: reasonText, suspendedAt: new Date() }),
        reason: `Permanent suspension enforced. Reason: ${reasonText}`,
      }
    });
  } catch (auditErr) {
    console.warn('[AUDIT_LOG_ERROR]', auditErr);
  }

  return updatedMember;
}

