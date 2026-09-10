import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { seminarId, question, options, pollId, optionIndex, action } = body;

    if (action === "VOTE" && pollId !== undefined && optionIndex !== undefined) {
      const poll = await prisma.seminarPoll.findUnique({ where: { id: pollId } });
      if (!poll) {
        return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      }

      const existingVote = await prisma.seminarPollVote.findUnique({
        where: { pollId_userId: { pollId, userId: user.id } },
      });

      if (existingVote) {
        if (existingVote.optionIndex === optionIndex) {
          return NextResponse.json({ message: "Already voted for this option" });
        }
        
        await prisma.seminarPollVote.update({
          where: { id: existingVote.id },
          data: { optionIndex },
        });
      } else {
        await prisma.seminarPollVote.create({
          data: { pollId, userId: user.id, optionIndex },
        });
      }

      const updatedPoll = await prisma.seminarPoll.findUnique({
        where: { id: pollId },
        include: { votes: true },
      });

      return NextResponse.json(updatedPoll);
    }

    if (!seminarId || !question || !options) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPoll = await prisma.seminarPoll.create({
      data: {
        seminarId,
        question,
        options: JSON.stringify(options),
      },
    });

    return NextResponse.json(newPoll);
  } catch (error) {
    console.error("Polls Error:", error);
    return NextResponse.json({ error: "Failed to process poll" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seminarId = searchParams.get("seminarId");

    if (!seminarId) {
      return NextResponse.json({ error: "Missing seminarId" }, { status: 400 });
    }

    const polls = await prisma.seminarPoll.findMany({
      where: { seminarId, isActive: true },
      include: { votes: true },
      orderBy: { createdAt: "desc" },
    });

    const pollsWithCounts = polls.map((poll) => {
      const opts = JSON.parse(poll.options || "[]");
      const voteCounts = opts.map((_: any, idx: number) => 
        poll.votes.filter((v) => v.optionIndex === idx).length
      );
      return {
        ...poll,
        options: opts.map((text: string, idx: number) => ({
          text,
          votes: voteCounts[idx],
        })),
      };
    });

    return NextResponse.json(pollsWithCounts);
  } catch (error) {
    console.error("Polls GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

