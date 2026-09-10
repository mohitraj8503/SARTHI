export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/messaging/auth";
import { withResiliency } from "@/lib/resilient-db";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations the user is part of (with resiliency)
    const res = await withResiliency(async () => {
      return await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: user.id,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 20, // Paginated for performance
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    }, `conversations-${user.id}`);

    if (!res.success || !res.data) {
      return NextResponse.json({ conversations: [] }); // Fallback
    }

    const conversations = res.data;

    // Fetch user's enrollments to map instructors to courses
    const userEnrollments = await prisma.enrollment.findMany({
      where: { userId: user.id, status: "active" },
      include: { 
        course: { 
          include: { 
            instructor: { 
              select: { 
                id: true, 
                name: true, 
                email: true, 
                image: true, 
                role: true 
              } 
            } 
          } 
        } 
      }
    });

    // Create a map of instructor ID -> Instructor Object (Unique)
    const instructorMap = new Map();
    const instructorToCourseMap = new Map();

    userEnrollments.forEach(e => {
      const instructor = e.course.instructor;
      if (instructor && !instructorMap.has(instructor.id)) {
        instructorMap.set(instructor.id, instructor);
      }
      
      // Group course titles for the same instructor
      const currentTitles = instructorToCourseMap.get(e.course.instructorId) || [];
      if (!currentTitles.includes(e.course.title)) {
        instructorToCourseMap.set(e.course.instructorId, [...currentTitles, e.course.title]);
      }
    });

    const uniqueEnrolledInstructorIds = Array.from(instructorMap.keys());

    // Format existing conversations
    const formattedConversations = conversations.map((conv) => {
      const otherParticipants = conv.participants.filter(
        (p) => p.userId !== user.id
      );
      const otherUser = otherParticipants[0]?.user;
      
      const titles = otherUser ? instructorToCourseMap.get(otherUser.id) : null;
      const courseTitle = titles ? (titles.length > 1 ? `${titles[0]} & ${titles.length - 1} more` : titles[0]) : null;

      const lastMessage = conv.messages[0];
      const unreadCount = conv.participants.find(
        (p) => p.userId === user.id
      )?.unreadCount || 0;

      return {
        id: conv.id,
        isExisting: true,
        type: conv.type,
        title: conv.title,
        courseTitle: courseTitle || (otherUser?.role === 'ADMIN' ? 'System Support' : 'Academy Support'),
        participants: otherParticipants.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          image: p.user.image,
          role: p.user.role,
        })),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderName: lastMessage.sender.name,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      };
    });

    // Add instructors who don't have a conversation yet
    const existingConversationPartnerIds = new Set(
      formattedConversations.flatMap(c => c.participants.map(p => p.id))
    );

    const potentialInstructorIds = uniqueEnrolledInstructorIds.filter(
      id => !existingConversationPartnerIds.has(id)
    );

    // Create "Virtual" conversations for these instructors
    const virtualConversations = potentialInstructorIds.map(id => {
      const instructor = instructorMap.get(id);
      const titles = instructorToCourseMap.get(id);
      const courseTitle = titles ? (titles.length > 1 ? `${titles[0]} & ${titles.length - 1} more` : titles[0]) : null;

      return {
        id: `new-${id}`,
        isExisting: false,
        targetUserId: id,
        type: "DIRECT",
        courseTitle: courseTitle,
        participants: [{
          id: instructor.id,
          name: instructor.name,
          email: instructor.email,
          image: instructor.image,
          role: instructor.role,
        }],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
    });

    const allConversations = [...formattedConversations, ...virtualConversations];

    // Check if user is an active batch member (interns bypass course enrollment lock)
    const activeBatchMember = await prisma.batchMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      select: { id: true },
    });

    const stats = {
      instructors: uniqueEnrolledInstructorIds.length,
      active: formattedConversations.length,
      unread: formattedConversations.reduce((acc, c) => acc + c.unreadCount, 0),
    };

    return NextResponse.json({ 
      conversations: allConversations,
      stats,
      isActiveMember: !!activeBatchMember,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let { targetUserId, type = "DIRECT" } = body;
    const { mentorEmail } = body;

    // If caller passed mentorEmail instead of targetUserId, resolve it
    if (!targetUserId && mentorEmail) {
      const mentorUser = await prisma.user.findUnique({
        where: { email: mentorEmail },
        select: { id: true },
      });
      if (mentorUser) {
        targetUserId = mentorUser.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID or mentor email is required" },
        { status: 400 }
      );
    }

    // Check if user can message this target
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Access control check
    if (user.role === "STUDENT") {
      // Check if target is teacher of enrolled course, assigned mentor, or admin
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id, status: "active" },
        select: { course: { select: { instructorId: true } } },
      });

      const instructorIds = enrollments.map((e) => e.course.instructorId);

      // Get student's assigned mentors
      const batchMembers = await prisma.batchMember.findMany({
        where: { userId: user.id },
        include: { batch: true }
      });
      const mentorEmails = batchMembers.map((bm) => bm.batch?.mentorEmail).filter(Boolean);
      const mentors = await prisma.user.findMany({
        where: { email: { in: mentorEmails } },
        select: { id: true }
      });
      const mentorIds = mentors.map((m) => m.id);

      if (!instructorIds.includes(targetUserId) && !mentorIds.includes(targetUserId) && targetUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "You can only message your course instructors or internship mentors" },
          { status: 403 }
        );
      }
    } else if (user.role === "TEACHER") {
      // Check if target is enrolled student or admin
      if (targetUser.role !== "ADMIN") {
        const teacherCourses = await prisma.course.findMany({
          where: { instructorId: user.id },
          select: { id: true },
        });

        const isEnrolled = await prisma.enrollment.findFirst({
          where: {
            userId: targetUserId,
            courseId: { in: teacherCourses.map((c) => c.id) },
            status: "active",
          },
        });

        if (!isEnrolled) {
          return NextResponse.json(
            { error: "You can only message your enrolled students" },
            { status: 403 }
          );
        }
      }
    }

    // Check if conversation already exists (for DIRECT type)
    if (type === "DIRECT") {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          participants: {
            some: { userId: user.id },
          },
        },
        include: {
          participants: {
            where: { userId: targetUserId },
          },
        },
      });

      if (existingConversation && existingConversation.participants.length > 0) {
        return NextResponse.json({
          conversationId: existingConversation.id,
          alreadyExists: true,
        });
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type,
        participants: {
          create: [
            {
              userId: user.id,
              role: user.role,
            },
            {
              userId: targetUserId,
              role: targetUser.role,
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        conversationId: conversation.id,
        alreadyExists: false,
        conversation: {
          id: conversation.id,
          type: conversation.type,
          participants: conversation.participants.map((p) => ({
            id: p.user.id,
            name: p.user.name,
            email: p.user.email,
            image: p.user.image,
            role: p.user.role,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

