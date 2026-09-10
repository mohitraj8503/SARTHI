'use client';

import { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizAttempt, User } from '@/lib/types';
import { storage } from '@/lib/storage';
import { Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface QuizPlayerProps {
  quiz: Quiz;
  courseId: string;
  onComplete: (passed: boolean, score: number) => void;
}

export default function QuizPlayer({ quiz, courseId: _courseId, onComplete }: QuizPlayerProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState((quiz.time_limit_minutes || 30) * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);

  // Timer
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, handleSubmit]);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = useCallback(() => {
    if (!user) return;
    setSubmitted(true);

    // Calculate Score
    let correctCount = 0;
    const questions = quiz.questions || [];
    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (Array.isArray(q.correct_answers)) {
        if (q.correct_answers.includes(userAnswer)) correctCount++;
      } else if (q.correct_answers === userAnswer) {
        correctCount++;
      }
    });

    const questionsCount = (quiz.questions || []).length;
    const percentage = questionsCount > 0 ? Math.round((correctCount / questionsCount) * 100) : 0;
    const passed = percentage >= quiz.passing_score;
    const score = percentage;

    const quizResult: QuizAttempt = {
      id: `quiz:${user.id}:${quiz.id}_${Date.now()}`,
      student_id: user.id,
      quiz_id: quiz.id,
      score: correctCount,
      max_score: questionsCount,
      percentage,
      passed,
      started_at: Date.now() - ((quiz.time_limit_minutes || 30) * 60 - timeLeft) * 1000,
      submitted_at: Date.now(),
      answers,
    };

    // Save Result
    storage.set(quizResult.id, quizResult, true);

    // Award Points if passed
    if (passed) {
      let points = 50;
      if (percentage >= 90) points = 100;
      else if (percentage >= 80) points = 75;

      const fullUser = storage.get<User>(`users:${user.id}`, true);
      if (fullUser) {
        storage.set(
          `users:${user.id}`,
          {
            ...fullUser,
            totalPoints: (fullUser.totalPoints || 0) + points,
          },
          true
        );
      }
    }

    setResult(quizResult);
    onComplete(passed, score);
  }, [user, quiz, answers, timeLeft, onComplete]);

  const currentQuestion = (quiz.questions || [])[currentQuestionIndex];

  if (submitted && result) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-slate-800 rounded-xl border border-slate-700 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {result.passed ? '🎉 Quiz Passed!' : '😔 Quiz Failed'}
        </h2>
        <div className="text-6xl font-bold mb-4 text-blue-400">{result.percentage}%</div>
        <p className="text-slate-400 mb-8">
          You answered {result.score} out of {(quiz.questions || []).length} questions correctly.
        </p>

        <div className="space-y-4 text-left mb-8">
          {(quiz.questions || []).map((q, idx) => {
            const userAns = result.answers[q.id];
            const isCorrect = Array.isArray(q.correct_answers)
              ? q.correct_answers.includes(userAns)
              : q.correct_answers === userAns;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-lg border ${
                  isCorrect
                    ? 'bg-green-900/20 border-green-500/50'
                    : 'bg-red-900/20 border-red-500/50'
                }`}
              >
                <p className="text-white font-medium mb-2">
                  {idx + 1}. {q.question_text}
                </p>
                <p className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  Your Answer: {userAns || 'Skipped'}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-green-400 mt-1">
                    Correct Answer: {q.correct_answers.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          {!result.passed && (
            <button
              onClick={() => window.location.reload()} // Quick dirty retry for now
              className="bg-slate-700 text-white px-6 py-2 rounded-lg"
            >
              Retake Quiz
            </button>
          )}
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{quiz.title}</h1>
          <p className="text-slate-400 text-sm">
            Question {currentQuestionIndex + 1} of {(quiz.questions || []).length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xl font-mono font-bold text-blue-400">
          <Clock className="w-5 h-5" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 mb-8 min-h-[300px]">
        <h3 className="text-2xl text-white mb-8">{currentQuestion.question_text}</h3>

        <div className="space-y-3">
          {currentQuestion.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(currentQuestion.id, opt)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                answers[currentQuestion.id] === opt
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    answers[currentQuestion.id] === opt ? 'border-blue-500' : 'border-slate-500'
                  }`}
                >
                  {answers[currentQuestion.id] === opt && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                {opt}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-xl bg-slate-800 text-white disabled:opacity-50"
        >
          Previous
        </button>

        {currentQuestionIndex < (quiz.questions || []).length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-500 font-bold"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}

