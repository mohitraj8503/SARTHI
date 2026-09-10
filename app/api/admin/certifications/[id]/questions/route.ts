export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isManagement } from "@/lib/auth";
import { QuestionType, DifficultyLevel } from "@prisma/client";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!isManagement(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const questions = await prisma.certificationQuestion.findMany({
      where: { certificationId: params.id },
      orderBy: { orderNumber: 'asc' }
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!isManagement(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const { question, options, correctAnswer, explanation, marks, type, order, difficulty, starterCode, testCases } = data;

    const newQuestion = await prisma.certificationQuestion.create({
      data: {
        certificationId: params.id,
        questionText: question || data.questionText,
        options: typeof options === 'string' ? options : JSON.stringify(options || []),
        correctAnswer: String(correctAnswer),
        explanation,
        marks: parseInt(marks) || data.marks || 10,
        questionType: (type === 'Coding' || type === 'CODING' ? QuestionType.CODING : QuestionType.MULTIPLE_CHOICE),
        difficulty: (difficulty as DifficultyLevel) || DifficultyLevel.MEDIUM,
        orderNumber: parseInt(order) || 0,
        starterCode,
        testCases: typeof testCases === 'string' ? testCases : JSON.stringify(testCases || [])
      }
    });

    return NextResponse.json(newQuestion);
  } catch (error: any) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bulk update / Syncing from old format
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!isManagement(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
      const cert = await prisma.certification.findUnique({ where: { id: params.id } });
      if (!cert || !cert.questions) return NextResponse.json({ error: "No old questions found" }, { status: 404 });

      let oldQuestions;
      try {
          oldQuestions = JSON.parse(cert.questions);
      } catch (e) {
          return NextResponse.json({ error: "Invalid JSON in old questions field" }, { status: 400 });
      }
      
      if (!Array.isArray(oldQuestions)) return NextResponse.json({ error: "Old questions field is not an array" }, { status: 400 });

      // Clear existing V2 questions to avoid duplicates during sync? 
      // Or just append? Let's clear first for a clean sync if requested.
      await prisma.certificationQuestion.deleteMany({ where: { certificationId: params.id } });

      const created: any[] = [];
      for (const [index, q] of oldQuestions.entries()) {
          const createdQ = await prisma.certificationQuestion.create({
              data: {
                  certificationId: params.id,
                  questionText: q.text || q.question || q.questionText || "Untitled Question",
                  options: JSON.stringify(q.options || []),
                  correctAnswer: String(q.answer !== undefined ? q.answer : (q.correctAnswer !== undefined ? q.correctAnswer : "0")),
                  explanation: q.explanation || "",
                  marks: q.marks || q.marksCorrect || 10,
                  orderNumber: index,
                  questionType: (q.type === 'Coding' || q.type === 'CODING' ? QuestionType.CODING : QuestionType.MULTIPLE_CHOICE),
                  difficulty: DifficultyLevel.MEDIUM, // Default to medium as old format didn't have strict enums
                  starterCode: q.starterCode || "",
                  testCases: JSON.stringify(q.testCases || [])
              }
          });
          created.push(createdQ);
      }

      return NextResponse.json({ success: true, count: created.length });
  } catch (error: any) {
      console.error('PATCH Sync Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
