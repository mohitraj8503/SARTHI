export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // 1. Check if certification exists and is published
        const certification = await prisma.certification.findUnique({
            where: { slug: slug },
            include: {
                questionsV2: {
                    select: {
                        id: true,
                        questionText: true,
                        questionType: true,
                        options: true,
                        marksCorrect: true,
                        marksWrong: true,
                        order: true,
                        starterCode: true,
                        testCases: true,
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!certification) {
            return NextResponse.json({ error: "Certification not found" }, { status: 404 });
        }

        const certificationId = certification.id;

        // 2. Check if user already passed this certification
        const existingPassedAttempt = await prisma.certificationAttempt.findFirst({
            where: {
                userId: user.id,
                certificationId: certificationId,
                passed: true
            }
        });

        if (existingPassedAttempt) {
            return NextResponse.json({ 
                error: "You are already certified for this program",
                alreadyCertified: true 
            }, { status: 200 });
        }

        // 3. Get total attempts to calculate current attempt number
        const pastAttemptsCount = await prisma.certificationAttempt.count({
            where: {
                userId: user.id,
                certificationId: certificationId
            }
        });

        // 4. Create new attempt session
        const attempt = await prisma.certificationAttempt.create({
            data: {
                user: { connect: { id: user.id } },
                certification: { connect: { id: certificationId } },
                attemptNumber: pastAttemptsCount + 1,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                startTime: new Date(),
                totalQuestions: certification.questionsV2.length,
                answers: "[]"
            }
        });

        // 5. Return questions without answers
        return NextResponse.json({
            attemptId: attempt.id,
            certification: {
                title: certification.title,
                durationMinutes: certification.duration,
                totalQuestions: certification.questionsV2.length,
                passingScore: certification.passingScore
            },
            questions: certification.questionsV2,
            startTime: attempt.startedAt
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
