export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const attemptId = params.id;
        const body = await req.json();
        const { answers: finalAnswers } = body;

        // 1. Fetch attempt and questions (questions is a JSON field in Certification)
        const attempt = await prisma.certificationAttempt.findUnique({
            where: { id: attemptId },
            include: {
                certification: {
                    include: {
                        questionsV2: true
                    }
                }
            }
        });

        if (!attempt) {
            return NextResponse.json({ error: "Attempt session not found" }, { status: 404 });
        }

        if (attempt.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        if (attempt.completedAt) {
            return NextResponse.json({ error: "Quiz already submitted" }, { status: 400 });
        }

        let questions: any[] = [];
        if (attempt.certification.questionsV2 && attempt.certification.questionsV2.length > 0) {
            questions = attempt.certification.questionsV2.map(q => {
                let options = [];
                try {
                    options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                } catch (e) {
                    options = [];
                }
                return {
                    id: q.id,
                    type: q.questionType === 'CODING' ? 'Coding' : 'MCQ',
                    questionType: q.questionType,
                    questionText: q.questionText,
                    options: Array.isArray(options) ? options : [],
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    marks: q.marks || q.marksCorrect || 10,
                    marksCorrect: q.marks || q.marksCorrect || 10,
                    marksWrong: q.marksWrong || 0,
                    codeSnippet: q.codeSnippet,
                    starterCode: q.starterCode,
                    testCases: q.testCases
                };
            });
        } else {
            const questionsData = attempt.certification.questions || '[]';
            questions = JSON.parse(questionsData);
        }

        const userAnswers = finalAnswers || attempt.answers || {};

        // 2. Calculate Scoring
        let totalMarks = 0;
        let obtainedMarks = 0;
        let correctCount = 0;

        const detailedResults = questions.map(q => {
            const userAnswer = userAnswers[q.id];
            let isCorrect = false;
            let finalValue = userAnswer;

            const isCoding = q.questionType === 'CODING' || q.type === 'Coding';
            if (isCoding) {
                const resp = userAnswer as any;
                const code = typeof resp === 'string' ? resp : resp?.code;
                const testResults = resp?.testResults;
                
                isCorrect = !!code && (testResults?.every((tr: any) => tr.passed) ?? false);
                finalValue = code;
            } else {
                // MCQ Logic - handle various formats (number, array, object)
                const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                let userArr: any[] = [];
                
                if (typeof userAnswer === 'number' || typeof userAnswer === 'string') {
                    userArr = [userAnswer];
                } else if (Array.isArray(userAnswer)) {
                    userArr = userAnswer;
                } else if (userAnswer && typeof userAnswer === 'object') {
                    const resp = userAnswer as any;
                    if ('selectedOption' in resp && resp.selectedOption !== null && resp.selectedOption !== undefined) {
                        userArr = [resp.selectedOption];
                    }
                }
                
                isCorrect = JSON.stringify(correctArr.map(x => String(x)).sort()) === JSON.stringify(userArr.map(x => String(x)).sort());
            }
            
            const marks = q.marks || q.marksCorrect || 10;
            totalMarks += marks;
            if (isCorrect) {
                obtainedMarks += marks;
                correctCount++;
            }

            return {
                questionId: q.id,
                yourAnswer: finalValue,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation
            };
        });

        const scorePercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        const passed = obtainedMarks >= attempt.certification.passingScore;
        const completedAt = new Date();
        const timeTakenMs = completedAt.getTime() - attempt.startedAt.getTime();
        const timeTakenMinutes = Math.round(timeTakenMs / 60000);

        // 3. Update Attempt Session
        await prisma.certificationAttempt.update({
            where: { id: attemptId },
            data: {
                score: obtainedMarks,
                passed: passed,
                completedAt: completedAt,
                answers: JSON.stringify({
                    userAnswers,
                    detailedResults,
                    stats: {
                        totalMarks,
                        obtainedMarks,
                        scorePercentage,
                        timeTakenMinutes,
                        correctCount,
                        totalQuestions: questions.length
                    }
                })
            }
        });

        // 4. Return result
        return NextResponse.json({
            result: passed ? 'passed' : 'failed',
            score: obtainedMarks,
            scorePercentage: Math.round(scorePercentage),
            passingScore: attempt.certification.passingScore,
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            timeTaken: `${timeTakenMinutes} minutes`,
            detailedResults
        });

    } catch (error: any) {
        console.error("[SUBMIT_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
