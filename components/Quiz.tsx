
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Trophy, CheckCircle, XCircle } from 'lucide-react';

interface Question {
    id: string;
    question: string;
    options: string; // JSON string in DB, but we'll parse it
    points: number;
}

interface QuizProps {
    quizId: string;
    questions: Question[];
    userId: string;
    onComplete: (score: number) => void;
}

export default function Quiz({ quizId, questions, userId, onComplete }: QuizProps) {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/quiz/submit', {
                method: 'POST',
                body: JSON.stringify({ userId, quizId, answers }),
            });
            return res.json();
        },
        onSuccess: (data) => {
            setResult(data);
            setSubmitted(true);
            if (data.passed) {
                onComplete(data.score);
            }
        }
    });

    const parsedQuestions = questions.map(q => ({
        ...q,
        options: JSON.parse(q.options) as string[]
    }));

    const handleSelect = (qId: string, optionIndex: number) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    };

    if (submitted && result) {
        return (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full mb-4">
                        {result.passed ? <Trophy className="w-12 h-12 text-yellow-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        {result.passed ? 'Assessment Passed!' : 'Keep Practicing'}
                    </h3>
                    <p className="text-slate-400">
                        You scored <span className={result.passed ? "text-green-400" : "text-red-400"}>{result.score}</span> / {result.maxScore}
                    </p>
                </div>

                <div className="space-y-4">
                    {parsedQuestions.map((q, idx) => {
                        const userAns = answers[q.id];
                        const correctAns = result.correctAnswers[q.id];
                        const isCorrect = userAns === correctAns;

                        return (
                            <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                <p className="text-white font-medium mb-2">{idx + 1}. {q.question}</p>
                                <div className="space-y-1">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className={`flex items-center gap-2 text-sm ${oIdx === correctAns ? 'text-green-400 font-bold' :
                                                oIdx === userAns ? 'text-red-400' : 'text-slate-400'
                                            }`}>
                                            {oIdx === correctAns && <CheckCircle className="w-4 h-4" />}
                                            {oIdx === userAns && oIdx !== correctAns && <XCircle className="w-4 h-4" />}
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Course Assessment</h3>
            <div className="space-y-8">
                {parsedQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-3">
                        <h4 className="text-lg font-medium text-slate-200">
                            {idx + 1}. {q.question}
                        </h4>
                        <div className="grid gap-2">
                            {q.options.map((option, optIdx) => (
                                <button
                                    key={optIdx}
                                    onClick={() => handleSelect(q.id, optIdx)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${answers[q.id] === optIdx
                                            ? 'border-blue-500 bg-blue-500/20 text-blue-100'
                                            : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
                <button
                    onClick={() => submitMutation.mutate()}
                    disabled={Object.keys(answers).length !== questions.length || submitMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
                </button>
            </div>
        </div>
    );
}

