import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { seminarId, question, questionId, action } = body;

    if (action === "UPVOTE" && questionId) {
      const updated = await prisma.seminarQuestion.update({
        where: { id: questionId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json(updated);
    }

    if (!seminarId || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newQuestion = await prisma.seminarQuestion.create({
      data: {
        seminarId,
        userId: user.id,
        userName: user.name || user.email || "Anonymous",
        question,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("QA Error:", error);
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, answer, action } = body;

    if (action === "ANSWER" && questionId && answer) {
      const updated = await prisma.seminarQuestion.update({
        where: { id: questionId },
        data: { isAnswered: true, answer },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("QA PATCH Error:", error);
    return NextResponse.json({ error: "Failed to answer" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seminarId = searchParams.get("seminarId");

    if (!seminarId) {
      return NextResponse.json({ error: "Missing seminarId" }, { status: 400 });
    }

    const questions = await prisma.seminarQuestion.findMany({
      where: { seminarId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("QA GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

