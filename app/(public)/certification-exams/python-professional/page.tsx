'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Award, Clock, Target, CheckCircle2, XCircle, BookOpen, 
  Code, ChevronDown, ChevronUp, Search, Filter, Zap, 
  Brain, Cpu, Database, Lock, Terminal, Bug
} from 'lucide-react';
import { pythonHardQuestions, pythonCertificationScoring, PythonQuestion, PythonMCQQuestion, PythonCodingQuestion } from '../python-professional-questions';
import { AnimatePresence, motion } from 'framer-motion';

const sectionIcons: Record<string, any> = {
  'Section 1: Advanced Python Concepts': Cpu,
  'Section 2: Concurrency and Parallelism': Zap,
  'Section 3: Metaprogramming and Advanced OOP': Brain,
  'Section 4: Performance Optimization': Cpu,
  'Section 5: Advanced Data Structures': Database,
  'Section 6: Python Internals and CPython': Terminal,
  'Section 7: Advanced Algorithms': Brain,
  'Section 8: Error Handling and Debugging': Bug,
};

export default function PythonProfessionalCertificationPage() {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuestions = pythonHardQuestions.filter(q => {
    const matchesSection = filterSection === 'all' || q.section === filterSection;
    const matchesType = filterType === 'all' || q.type === filterType;
    const matchesSearch = !searchQuery || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesType && matchesSearch;
  });

  const sections = [...new Set(pythonHardQuestions.map(q => q.section))];

  const toggleQuestion = (id: string) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  const toggleSolution = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-[#0F172A] to-[#0F172A]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgNHYyaC0ydi0yaDJ6bTQtOGgydjJoLTJ2LTJ6bS04IDhoMnYyaC0ydi0yek0zMiAyNnYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="container mx-auto max-w-screen-xl px-6 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                  Professional Certification
                </span>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                  Expert Level
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                Python Professional Certification
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl">
                Master the hardest Python concepts with our comprehensive 15-question assessment. 
                Test your knowledge on memory management, concurrency, metaprogramming, and more.
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  <span>15 Hardest Questions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span>90 Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <span>85% Passing Score</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span>₹39 Assessment Fee</span>
                </div>
              </div>
            </div>

            <div className="lg:w-80 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Scoring Guide</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <span className="text-emerald-400 font-medium">Expert</span>
                  <span className="text-white">12-15 (95%+)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <span className="text-blue-400 font-medium">Advanced</span>
                  <span className="text-white">10-11 (85-94%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <span className="text-amber-400 font-medium">Intermediate</span>
                  <span className="text-white">8-9 (75-84%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <span className="text-red-400 font-medium">Needs Work</span>
                  <span className="text-white">Below 8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="container mx-auto max-w-screen-xl px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Section Filter */}
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="mcq">MCQ</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div className="text-gray-400 text-sm">
              Showing {filteredQuestions.length} of {pythonHardQuestions.length} questions
            </div>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="container mx-auto max-w-screen-xl px-6 py-12">
        <div className="space-y-6">
          {filteredQuestions.map((question, index) => {
            const SectionIcon = sectionIcons[question.section] || BookOpen;
            const isExpanded = expandedQuestion === question.id;
            const showAnswer = showSolutions[question.id];

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all"
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="w-full p-6 flex items-start gap-4 text-left"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    question.type === 'mcq' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {question.type === 'mcq' ? <Target className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                        {question.section}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400 capitalize">
                        {question.type === 'mcq' ? 'Multiple Choice' : 'Coding Challenge'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-white line-clamp-2">
                      {question.question.length > 150 
                        ? question.question.substring(0, 150) + '...'
                        : question.question}
                    </h3>
                  </div>

                  <div className="flex-shrink-0 text-gray-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 pt-0">
                        {/* Full Question */}
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">Question</h4>
                          <div className="bg-white/5 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                            {question.question}
                            {question.type === 'mcq' && (question as PythonMCQQuestion).options.map((opt, i) => (
                              <div key={i} className="mt-2">{opt}</div>
                            ))}
                          </div>
                        </div>

                        {/* MCQ Options */}
                        {question.type === 'mcq' && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">Options</h4>
                            {(question as PythonMCQQuestion).options.map((option, i) => {
                              const optionLetter = String.fromCharCode(65 + i);
                              const isCorrect = optionLetter === (question as PythonMCQQuestion).correctAnswer;
                              return (
                                <div 
                                  key={i} 
                                  className={`p-3 rounded-lg border ${
                                    isCorrect 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                      : 'bg-white/5 border-white/10 text-gray-400'
                                  }`}
                                >
                                  <span className="font-medium">{optionLetter})</span> {option.substring(3)}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Coding Solution */}
                        {question.type === 'coding' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-400">Solution</h4>
                              <button
                                onClick={(e) => toggleSolution(question.id, e)}
                                className="text-xs text-emerald-400 hover:text-emerald-300"
                              >
                                {showAnswer ? 'Hide Solution' : 'Show Solution'}
                              </button>
                            </div>
                            
                            {showAnswer && (
                              <div className="bg-[#1E1E1E] rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">
                                  {(question as PythonCodingQuestion).solution}
                                </pre>
                              </div>
                            )}

                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-400 mb-2">Test Cases</h4>
                              <div className="bg-white/5 rounded-lg p-3 font-mono text-xs text-gray-400">
                                {(question as PythonCodingQuestion).testCases}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Explanation */}
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">
                            {question.type === 'mcq' ? 'Explanation' : 'Key Concepts'}
                          </h4>
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                            <p className="text-sm text-emerald-300">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Start Assessment CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-emerald-900/50 to-purple-900/50 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Take the Assessment?</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Test your Python skills with these challenging questions. 
              Get certified and showcase your expertise to employers worldwide.
            </p>
            <Link href="/certification-exams/python-pro-cert/assessment">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25">
                Start Python Certification
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

