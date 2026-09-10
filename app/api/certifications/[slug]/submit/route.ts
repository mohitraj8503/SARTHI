export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runCodeWithValidation } from "@/lib/assessment/code-executor";
import { CertificateGenerator } from "@/lib/certificate-generator";
import { getCurrentUser } from "@/lib/auth";
import { generateCredentialId, generateCertificateHash } from "@/lib/certificates";

function safeParseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function inferCodingLanguage(question: any, certification: { title?: string; slug?: string }) {
  const options = safeParseJson(question.options);
  const directLanguage =
    question.language ||
    question.lang ||
    (options && !Array.isArray(options) ? options.language || options.lang : null);

  if (typeof directLanguage === "string" && directLanguage.trim()) {
    return directLanguage.trim().toLowerCase();
  }

  const certFingerprint = `${certification.title || ""} ${certification.slug || ""}`.toLowerCase();
  if (certFingerprint.includes("python")) return "python";
  if (certFingerprint.includes("c++") || certFingerprint.includes("cpp")) return "cpp";
  if (certFingerprint.includes("java")) return "java";
  if (certFingerprint.includes("rust")) return "rust";
  if (certFingerprint.includes("go")) return "go";
  if (certFingerprint.includes("php")) return "php";

  const starterCode = String(question.starterCode || "").toLowerCase();
  const testCasesRaw = question.testCases ? safeParseJson(question.testCases) : [];
  const testCaseFingerprint = Array.isArray(testCasesRaw)
    ? JSON.stringify(testCasesRaw).toLowerCase()
    : String(testCasesRaw || "").toLowerCase();
  const combinedFingerprint = `${starterCode}\n${testCaseFingerprint}`;

  if (combinedFingerprint.includes("def ") || combinedFingerprint.includes("assert ")) return "python";
  if (combinedFingerprint.includes("#include") || combinedFingerprint.includes("std::")) return "cpp";
  if (combinedFingerprint.includes("public class") || combinedFingerprint.includes("system.out")) return "java";
  if (combinedFingerprint.includes("fn ") || combinedFingerprint.includes("println!")) return "rust";
  if (combinedFingerprint.includes("package main") || combinedFingerprint.includes("fmt.")) return "go";
  if (combinedFingerprint.includes("<?php")) return "php";

  return "javascript";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized - Please login to submit" }, { status: 401 });
    }

    const body = await request.json();
    const { answers, timeTaken, tabSwitchCount } = body;

    // Validate input
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ success: false, error: "Invalid answers format" }, { status: 400 });
    }

    // 1. Fetch certification and questions from DATABASE
    const cert = await prisma.certification.findUnique({
      where: { slug: slug },
      include: {
        questionsV2: true
      }
    });

    if (!cert) {
      return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
    }

    // 2. Prioritize RELATIONAL DATA (V2) over string-based JSON
    let questions = cert.questionsV2 && cert.questionsV2.length > 0
      ? cert.questionsV2
      : (typeof cert.questions === 'string' ? JSON.parse(cert.questions || "[]") : (cert.questions || []));

    if (questions.length === 0) {
      return NextResponse.json({ success: false, error: "No questions found for this certification" }, { status: 404 });
    }

    // 3. SERVER-SIDE VALIDATION - Calculate score from DB questions (NOT from client)
    let correctCount = 0;
    let earnedMarks = 0;
    let totalMarks = 0;
    const questionResults: Array<{ questionId: string; correct: boolean; userAnswer: any; score: number }> = [];

    // Use for...of for asynchronous code validation
    for (const q of questions) {
      const qType = q.questionType || q.type || (q.options ? 'MCQ' : 'Coding');
      const marksCorrect = q.marksCorrect || 10;
      totalMarks += marksCorrect;

      let isCorrect = false;
      let scoreForThisQ = 0;

      if (qType === 'MCQ') {
        const correctAnswer = q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption;
        const userAnswer = answers[q.id];
        isCorrect = userAnswer === correctAnswer;
        if (isCorrect) {
          scoreForThisQ = marksCorrect;
          earnedMarks += marksCorrect;
          correctCount++;
        }
      } else if (qType === 'Coding' || qType === 'CODING') {
        // FOR CODING: Validate submission (Secure Server-side validation)
        const userAnswer = answers[q.id] || "";
        const testCases = q.testCases ? (typeof q.testCases === 'string' ? JSON.parse(q.testCases) : q.testCases) : [];
        const codingLanguage = inferCodingLanguage(q, cert);
        
        // Use our secure executor utility
        const validation = await runCodeWithValidation(userAnswer, codingLanguage, testCases);
        
        scoreForThisQ = (validation.score / 100) * marksCorrect;
        earnedMarks += scoreForThisQ;
        isCorrect = validation.allPassed;
        if (isCorrect) correctCount++;
      }

      questionResults.push({
        questionId: q.id,
        correct: isCorrect,
        userAnswer: answers[q.id] || null,
        score: scoreForThisQ
      });
    }

    const scorePercentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
    
    // Use PASSING SCORE from DATABASE
    const passingScore = cert.passingScore || 80;
    const passed = scorePercentage >= passingScore;

    // 3. Anti-cheating: Check tab switch count
    const tabSwitchPenalty = tabSwitchCount > 5 ? 10 : 0; // Reduce 10% if too many switches
    const finalScore = Math.max(0, scorePercentage - tabSwitchPenalty);
    const finalPassed = finalScore >= passingScore;

    // 4. Create record in a single transaction (P0: Dual Write Fix)
    const { attempt, certRecord } = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.certificationAttempt.create({
        data: {
          userId: user.id,
          certificationId: cert.id,
          score: Math.round(finalScore),
          passed: finalPassed,
          answers: JSON.stringify(answers),
          timeTaken: timeTaken || 0,
          tabSwitchCount: tabSwitchCount || 0,
          completedAt: new Date(),
        },
      });

      let issuedCert = null;
      if (finalPassed) {
        // Check if already certified to prevent duplicates within transaction
        const existing = await tx.userCertification.findFirst({
          where: { userId: user.id, certificationId: cert.id }
        });

        if (!existing) {
          const certPrefix = slug === 'fullstack-mastery' 
            ? 'FSWDM' 
            : slug === 'ias-preparation' 
              ? 'UPSC-FS' 
              : slug === 'python-professional' || slug === 'python-professional-developer' 
                ? 'PY-PRO' 
                : slug === 'advanced-excel-certification-exam'
                  ? 'AEX-C'
                  : slug.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
          const year = new Date().getFullYear();
          const count = await tx.certificate.count({
            where: {
              certificateNumber: {
                startsWith: `TT-${certPrefix}-${year}-`
              }
            }
          });
          const sequenceStr = String(count + 1).padStart(6, '0');
          const certNumber = `TT-${certPrefix}-${year}-${sequenceStr}`;
          const issueDate = new Date();
          const certificateHash = generateCertificateHash(
            user.name || 'Student',
            cert.title,
            issueDate,
            certNumber
          );

          issuedCert = await tx.userCertification.create({
            data: {
              userId: user.id,
              certificationId: cert.id,
              certNumber,
              certificateHash,
              status: 'VALID',
              issuedAt: issueDate
            }
          });

          // Legacy sync (wrapped in same transaction)
          await tx.certificate.create({
            data: {
              certificateNumber: certNumber,
              certificateId: certNumber,
              certificateHash,
              userId: user.id,
              courseId: cert.id,
              status: 'VALID',
              tier: 'pro',
              issuedAt: issueDate,
              metadata: JSON.stringify({
                type: 'professional_certification',
                score: finalScore,
                totalQuestions: questions.length
              })
            }
          });
        } else {
          issuedCert = existing;
        }
      }

      return { attempt: newAttempt, certRecord: issuedCert };
    });

    return NextResponse.json({
      success: true,
      score: finalScore,
      passed: finalPassed,
      passingScore,
      correctCount,
      totalQuestions: questions.length,
      attemptId: attempt.id,
      certNumber: certRecord?.certNumber || null,
      tabSwitchPenaltyApplied: tabSwitchPenalty > 0,
      questionResults: questionResults.map(r => ({
        questionId: r.questionId,
        isCorrect: r.correct
      }))
    });

  } catch (error: any) {
    console.error("Submission processing error:", error);
    return NextResponse.json({ success: false, error: "Internal server error. Please try again." }, { status: 500 });
  }
}
