"use server";
import { prisma } from '@/lib/prisma';
import { getCurrentUser, IS_CONN_ERROR } from './index';
import { withResiliency } from '@/lib/resilient-db';

export async function getStudentTests() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', active: [], upcoming: [], completed: [] };

    const result = await withResiliency(async () => {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id, status: 'active' },
            select: { courseId: true }
        });
        const courseIds = enrollments.map(e => e.courseId);

        if (courseIds.length === 0) return { active: [], upcoming: [], completed: [] };

        const [assignments, quizzes] = await Promise.all([
            prisma.assignment.findMany({
                where: {
                    lesson: {
                        courseId: { in: courseIds }
                    }
                },
                include: {
                    lesson: {
                        include: {
                            course: { select: { title: true } }
                        }
                    }
                }
            }),
            prisma.quiz.findMany({
                where: { courseId: { in: courseIds } },
                include: { course: { select: { title: true } } }
            })
        ]);

        const now = new Date();

        const allTests = [
            ...assignments.map(a => ({
                id: a.id,
                title: a.title,
                courseName: a.lesson?.course?.title || 'Unknown Course',
                dueDate: a.dueDate,
                duration: 60,
                type: 'Assignment',
                attemptsLeft: 1
            })),
            ...quizzes.map(q => ({
                id: q.id,
                title: q.title,
                courseName: q.course?.title || 'Unknown Course',
                dueDate: null,
                duration: q.timeLimit || 30,
                type: 'Quiz',
                attemptsLeft: 3
            }))
        ];

        // Retrieve submissions to filter completed
        const [subAss, subQuiz] = await Promise.all([
            prisma.assignmentSubmission.findMany({ where: { userId: user.id } }),
            prisma.quizSubmission.findMany({ where: { userId: user.id } })
        ]);

        const completedIds = new Set([
            ...subAss.map(s => s.assignmentId),
            ...subQuiz.map(s => s.quizId)
        ]);

        const completed = allTests.filter(t => completedIds.has(t.id));
        const pending = allTests.filter(t => !completedIds.has(t.id));

        // Active: Due date is future or null
        const active = pending.filter(t => !t.dueDate || new Date(t.dueDate) > now);

        // Upcoming logic
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        const activeTests = active.filter(t => !t.dueDate || new Date(t.dueDate) <= sevenDaysFromNow);
        const upcomingTests = active.filter(t => t.dueDate && new Date(t.dueDate) > sevenDaysFromNow);

        return {
            active: activeTests,
            upcoming: upcomingTests,
            completed
        };
    }, `student-tests-${user.id}`);

    if (!result.success || !result.data) {
        return { error: result.error || 'DB_CONNECTION_FAILED', active: [], upcoming: [], completed: [] };
    }

    return result.data;
}

export async function getStudentGrades() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', grades: [] };

    const result = await withResiliency(async () => {
        const [assignments, quizzes] = await Promise.all([
            prisma.assignmentSubmission.findMany({
                where: { userId: user.id, status: 'graded' },
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
            }),
            prisma.quizSubmission.findMany({
                where: { userId: user.id },
                include: {
                    quiz: {
                        include: {
                            course: { select: { title: true } }
                        }
                    }
                }
            })
        ]);

        const gradebook = [
            ...assignments.map(a => ({
                id: a.id,
                item: a.assignment?.title || 'Assignment',
                type: 'Assignment',
                courseName: a.assignment?.lesson?.course?.title || 'Academy Course',
                score: a.score,
                maxScore: a.assignment?.maxScore || 100,
                date: a.gradedAt,
                feedback: a.feedback
            })),
            ...quizzes.map(q => ({
                id: q.id,
                item: q.quiz?.title || 'Quiz',
                type: 'Quiz',
                courseName: q.quiz?.course?.title || 'Academy Course',
                score: q.score,
                maxScore: q.maxScore || 100,
                date: q.createdAt,
                feedback: q.passed ? 'Passed' : 'Failed'
            }))
        ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

        return { grades: gradebook };
    }, `student-grades-${user.id}`);

    if (!result.success || !result.data) {
        return { error: result.error || 'DB_CONNECTION_FAILED', grades: [] };
    }

    return result.data;
}

