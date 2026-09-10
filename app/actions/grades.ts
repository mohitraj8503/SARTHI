'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { format } from 'date-fns';

export interface GradeItem {
    id: string;
    course: string;
    assignment: string;
    score: number;
    max: number;
    grade: string;
    status: string;
    date: string;
}

export interface GradeStats {
    gpa: number;
    totalAssignments: number;
    totalCourses: number;
    percentileText: string;
}

export async function getUserGrades(): Promise<{ stats: GradeStats; items: GradeItem[] }> {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error('Unauthorized');
    }

    const userId = session.userId;

    // 1. Fetch Quiz Submissions
    const quizSubmissions = await prisma.quizSubmission.findMany({
        where: { userId },
        include: {
            quiz: {
                include: {
                    course: { select: { title: true } }
                }
            }
        }
    });

    // 2. Fetch Graded Assignment Submissions
    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
        where: {
            userId,
            status: 'graded'
        },
        include: {
            assignment: {
                include: {
                    lesson: {
                        include: {
                            course: { select: { title: true } }
                        }
                    }
                }
            }
        }
    });

    // 3. Map to UI items
    const items: GradeItem[] = [
        ...quizSubmissions.map(qs => ({
            id: qs.id,
            course: qs.quiz.course.title,
            assignment: qs.quiz.title,
            score: qs.score,
            max: qs.maxScore,
            grade: calculateLetterGrade((qs.score / qs.maxScore) * 100),
            status: 'Graded',
            date: format(qs.createdAt, 'MMM d, yyyy')
        })),
        ...assignmentSubmissions.map(as => ({
            id: as.id,
            course: as.assignment.lesson.course.title,
            assignment: as.assignment.title,
            score: as.score || 0,
            max: as.assignment.maxScore,
            grade: calculateLetterGrade(((as.score || 0) / as.assignment.maxScore) * 100),
            status: 'Graded',
            date: format(as.gradedAt || as.createdAt, 'MMM d, yyyy')
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 4. Calculate Stats
    const totalSubmissions = items.length;
    const courseIds = new Set([
        ...quizSubmissions.map(qs => qs.quiz.courseId),
        ...assignmentSubmissions.map(as => as.assignment.lesson.courseId)
    ]);

    const gpa = calculateGPA(items);

    return {
        stats: {
            gpa,
            totalAssignments: totalSubmissions,
            totalCourses: courseIds.size,
            percentileText: getPercentileText(gpa)
        },
        items
    };
}

function calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
}

function calculateGPA(items: GradeItem[]): number {
    if (items.length === 0) return 0;

    const totalPoints = items.reduce((acc, item) => {
        const percentage = (item.score / item.max) * 100;
        if (percentage >= 90) return acc + 4.0;
        if (percentage >= 80) return acc + 3.0;
        if (percentage >= 70) return acc + 2.0;
        if (percentage >= 60) return acc + 1.0;
        return acc;
    }, 0);

    return parseFloat((totalPoints / items.length).toFixed(2));
}

function getPercentileText(gpa: number): string {
    if (gpa >= 3.8) return 'Top 5% of class';
    if (gpa >= 3.5) return 'Top 15% of class';
    if (gpa >= 3.0) return 'Above average';
    if (gpa > 0) return 'Good progress';
    return 'Starting journey';
}

