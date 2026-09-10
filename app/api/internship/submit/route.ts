import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitVersionedAssignment } from '@/lib/services/internship.service';
import { canSubmitAssignment } from '@/lib/auth/internshipAuthorization';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId, assignmentId, githubUrl, liveUrl, driveLink, comments } = await req.json();
    if (!memberId || !assignmentId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Central Auth validation: check if the user is authorized to submit for this assignment/member
    const isAuthorized = await canSubmitAssignment(user, assignmentId, memberId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const submission = await submitVersionedAssignment(memberId, assignmentId, {
      githubUrl,
      liveUrl,
      driveLink,
      comments
    });

    // Sync new Excel-specific tracking fields directly to the submission record
    const resolvedLink = liveUrl || githubUrl || driveLink || null;
    let resolvedLinkType = 'Other';
    if (liveUrl) resolvedLinkType = 'Live Link';
    else if (githubUrl) resolvedLinkType = 'GitHub Link';
    else if (driveLink) resolvedLinkType = 'Drive Link';

    await prisma.internshipSubmission.update({
      where: { id: submission.id },
      data: {
        liveDemoProjectLink: resolvedLink,
        linkType: resolvedLinkType,
        notes: comments || null,
        submissionTime: new Date(),
        demoProjectStatus: 'Submitted'
      }
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 });
  }
}
