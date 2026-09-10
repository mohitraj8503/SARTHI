'use client';
 
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { createPortal } from 'react-dom';
import {
  Award, Clock, CheckCircle2, Lock, Flame, Play, Terminal,
  ChevronRight, ChevronDown, Check, Sparkles, BookOpen, AlertCircle,
  HelpCircle, RefreshCw, Code2, MessageSquare, FolderKanban, FileText,
  Trophy, Brain, TerminalSquare, MoreHorizontal, Shield,
  ArrowLeft, ArrowRight, Bookmark, Sun, Moon, Flag, UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { MODULE_1_LESSONS, MODULE_1_QUIZ } from '@/lib/learning/python-module-1';
import { pythonEasyQuestions } from '../../python-professional-easy-questions';
import { pythonMediumQuestions } from '../../python-professional-medium-questions';
import { pythonHardQuestions } from '../../python-professional-questions';
import { pythonRealWorldQuestions } from '../../python-professional-hard-questions';
import { ChevronUp, X, Printer, Eye, Menu } from 'lucide-react';
import CertificateTemplate from '@/components/certificate/CertificateTemplate';
import CertificateActions from '@/components/certificate/CertificateActions';
import webDevQuestions from '../../web-dev-questions.json';
import advancedExcelQuestions from '../../advanced-excel-questions.json';


const getWebDevQuestions = (key: string) => {
  return (webDevQuestions[key] || []).map((q: any, idx: number) => ({
    id: `web-${key}-${idx}`,
    section: key,
    type: 'mcq',
    question: q.question,
    options: q.options,
    correctAnswer: String.fromCharCode(65 + q.correctIdx),
    explanation: q.explanation
  }));
};

const parseAndRenderTable = (tableText: string, keyId: any) => {
  try {
    const lines = tableText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('+') && !l.startsWith('+-'));
    if (lines.length === 0) return null;

    const headerLine = lines[0];
    let cleanHeader = headerLine;
    if (cleanHeader.startsWith('|')) cleanHeader = cleanHeader.substring(1).trim();
    if (cleanHeader.endsWith('|')) cleanHeader = cleanHeader.substring(0, cleanHeader.length - 1).trim();
    const headers = cleanHeader.split(' | ').map(h => h.trim());

    const rows = lines.slice(1).map(line => {
      let cleanLine = line.trim();
      if (cleanLine.startsWith('|')) cleanLine = cleanLine.substring(1).trim();
      if (cleanLine.endsWith('|')) cleanLine = cleanLine.substring(0, cleanLine.length - 1).trim();
      return cleanLine.split(' | ').map(c => c.trim());
    });

    return (
      <div key={`html-table-${keyId}`} className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 my-4 shadow-inner">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-[13px] font-mono excel-table">
          <thead className="bg-slate-100 dark:bg-[#020617] text-slate-700 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] excel-thead">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-800 dark:text-slate-300 bg-white dark:bg-[#070b18]/45">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-5 py-3.5 whitespace-nowrap font-medium border-slate-100 dark:border-slate-900">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (e) {
    console.error("Failed to parse ASCII table:", e);
    return null;
  }
};

const renderExcelQuestion = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockLines.join('\n');
        const parsedTable = parseAndRenderTable(codeText, i);
        elements.push(
          parsedTable || (
            <pre key={`code-${i}`} className="my-4 p-5 rounded-2xl font-mono text-[12px] md:text-sm overflow-x-auto leading-relaxed border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 shadow-inner select-text excel-pre">
              <code>{codeText}</code>
            </pre>
          )
        );
        codeBlockLines = [];
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      i++;
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('###')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl font-black text-blue-800 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2 excel-h3">
          {trimmed.replace('###', '').trim()}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('🎯')) {
      const content = trimmed.replace(/🎯\s*\*\*Context:\*\*/, '').replace(/🎯\s*Context:/, '').trim();
      elements.push(
        <div key={`context-${i}`} className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-1.5 my-4">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>🎯</span> Context
          </div>
          <p className="text-[14.5px] font-semibold leading-relaxed text-slate-800 dark:text-slate-300 excel-context">
            {content}
          </p>
        </div>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('⚠️') || trimmed.startsWith('📌')) {
      const isReq = trimmed.startsWith('📌');
      const content = trimmed
        .replace(/⚠️\s*\*\*Business Problem:\*\*/, '')
        .replace(/📌\s*\*\*Business Requirement:\*\*/, '')
        .replace(/⚠️\s*\*\*Business Problem\*\*/, '')
        .replace(/📌\s*\*\*Business Requirement\*\*/, '')
        .trim();

      elements.push(
        <div key={`prob-${i}`} className={`border rounded-2xl p-5 space-y-1.5 my-4 ${isReq ? 'bg-blue-50/50 dark:bg-blue-950/15 border-blue-200 dark:border-blue-800/40' : 'bg-amber-50/50 dark:bg-amber-950/15 border-amber-200 dark:border-amber-800/40'
          }`}>
          <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${isReq ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
            <span>{isReq ? '📌' : '⚠️'}</span> {isReq ? 'Business Requirement' : 'Business Problem'}
          </div>
          <p className="text-[14.5px] font-semibold leading-relaxed text-slate-800 dark:text-slate-300 excel-prob">
            {content}
          </p>
        </div>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('❓')) {
      let content = trimmed.replace(/❓\s*\*\*Question:\*\*/, '').replace(/❓\s*Question:/, '').trim();
      while (i + 1 < lines.length && !lines[i + 1].startsWith('```') && !lines[i + 1].startsWith('###') && !lines[i + 1].startsWith('🎯') && !lines[i + 1].startsWith('⚠️') && !lines[i + 1].startsWith('📌')) {
        content += '\n' + lines[i + 1].trim();
        i++;
      }
      elements.push(
        <div key={`q-${i}`} className="pt-4 border-t border-slate-200 dark:border-slate-800/60 my-4">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <span>❓</span> Question
          </div>
          <p className="font-extrabold text-[22px] tracking-wide leading-snug text-blue-900 dark:text-blue-300 whitespace-pre-wrap excel-q">
            {content}
          </p>
        </div>
      );
      i++;
      continue;
    }

    elements.push(
      <p key={`text-${i}`} className="text-slate-800 dark:text-slate-300 font-medium text-[15px] leading-relaxed my-2 excel-text">
        {trimmed}
      </p>
    );
    i++;
  }

  return <div className="space-y-4">{elements}</div>;
};

function buildIasPreparationPath(): PathData {
  const modules: Module[] = [
    {
      id: 'ias-mod-1',
      title: 'Module 1: UPSC Prelims (GS & CSAT)',
      lessons: [
        {
          id: 'ias-l-1-1',
          title: '1. Indian Polity & Constitution',
          duration: 20,
          type: 'markdown',
          content: `# Indian Polity & Constitution\n\n## Learning objectives\n* Understand the preamble, fundamental rights, and duties.\n* Analyze structural powers between Union & States (Federalism).\n* Master parliamentary procedures, bills, and constitutional amendments.`
        },
        {
          id: 'ias-l-1-2',
          title: '2. History & Geography Foundations',
          duration: 25,
          type: 'markdown',
          content: `# Indian History & World Geography\n\n## Learning objectives\n* Master Ancient, Medieval, and Modern Indian History.\n* Analyze physical geography of India, river systems, and resources.\n* Study global climate zones and resource distributions.`
        },
        {
          id: 'ias-l-1-3',
          title: '3. CSAT Aptitude & Logic Lab',
          duration: 20,
          type: 'playground',
          codeSnippet: `// CSAT aptitude logic simulation\nconst passMarks = 66;\nconst studentMarks = 85;\nconsole.log(studentMarks >= passMarks ? "CSAT CLEARED" : "FAILED");\n`,
          expectedOutput: 'CSAT CLEARED',
          content: `# CSAT Aptitude & Logic\n\n## Introduction\nPractice comprehension, logical reasoning, and basic numeracy metrics.\n\n---\n\n# APTITUDE LAB\nSimulate UPSC CSAT scoring threshold validation.`
        }
      ],
      quiz: [
        { question: "Which article of the Indian Constitution safeguards the Right to Privacy?", options: ["Article 14", "Article 19", "Article 21", "Article 32"], correctIdx: 2, explanation: "The Supreme Court in the Puttaswamy case (2017) declared Right to Privacy as a fundamental right under Article 21." },
        { question: "The battle of Plassey was fought in which year?", options: ["1757", "1764", "1785", "1857"], correctIdx: 0, explanation: "The Battle of Plassey was fought on June 23, 1757, between the Nawab of Bengal and the British East India Company." },
        { question: "Which river flows through a rift valley in India?", options: ["Ganga", "Narmada", "Godavari", "Krishna"], correctIdx: 1, explanation: "Narmada flows westward through a rift valley between the Vindhya and Satpura ranges." }
      ]
    },
    {
      id: 'ias-mod-2',
      title: 'Module 2: UPSC Mains GS Papers',
      lessons: [
        {
          id: 'ias-l-2-1',
          title: '1. Analytical Mains Writing Structure',
          duration: 20,
          type: 'markdown',
          content: `# Mains Answer Writing\n\n## Learning objectives\n* Structure standard answers: Intro, Body (pros/cons), and forward-looking Conclusion.\n* Map contemporary issues in Indian Economy, Security, and Governance.\n* Study ethics case studies, moral philosophy, and values in administration.`
        }
      ],
      quiz: [
        { question: "Which of the following is part of General Studies III?", options: ["History & Art Culture", "Constitution & Polity", "Technology & Economic Development", "Ethics & Integrity"], correctIdx: 2, explanation: "GS Paper III covers Technology, Economic Development, Bio-diversity, Environment, Security, and Disaster Management." }
      ]
    },
    {
      id: 'ias-mod-3',
      title: 'Module 3: Optional Subject & Essay',
      lessons: [
        {
          id: 'ias-l-3-1',
          title: '1. Essay Structuring & Arguments Flow',
          duration: 15,
          type: 'markdown',
          content: `# Essay Writing Skills\n\n## Learning objectives\n* Structure coherent essays for philosophical and factual topics.\n* Support arguments with reports, data, and quotes from thinkers.\n* Maintain transitions and logical flow throughout the essay.`
        }
      ],
      quiz: [
        { question: "An ideal UPSC essay should have which structure?", options: ["Only descriptive paragraphs", "Coherent flow with Introduction, multi-dimensional analysis, and optimistic conclusion", "Point-wise bullet format only", "Simple list of facts"], correctIdx: 1, explanation: "A high-scoring essay must have multi-dimensional depth, strong arguments, flow, and positive conclusions." }
      ]
    },
    {
      id: 'ias-mod-4',
      title: 'Module 4: Personality & Mock Interviews',
      lessons: [
        {
          id: 'ias-l-4-1',
          title: '1. Personality Test & DAF Walkthroughs',
          duration: 30,
          type: 'markdown',
          content: `# Personality Assessment Prep\n\n## Learning objectives\n* Master Detailed Application Form (DAF) keywords and hobbies.\n* Build balanced opinions on controversial national/international issues.\n* Refine non-verbal cues: posture, eye-contact, tone, and confidence under pressure.`
        }
      ],
      quiz: [
        { question: "What is the primary objective of the UPSC Personality Test?", options: ["To test bookish memory", "To assess mental alertness, critical assimilation, and moral integrity of the candidate", "To check advanced math skills", "To examine factual GK alone"], correctIdx: 1, explanation: "The interview board assesses the candidate's suitability for public services, mental alertness, balance of judgment, and interest in public affairs." }
      ]
    },
    {
      id: 'ias-mod-5',
      title: 'Module 5: UPSC Civil Services Mock Exam',
      lessons: [
        {
          id: 'ias-l-5-1',
          title: '1. Comprehensive Mock Civil Services Exam',
          duration: 60,
          type: 'markdown',
          content: `# Mock Examination Scope\n\n## Learning objectives\n* Complete a 40 MCQ final mock assessment encompassing all UPSC GS and CSAT modules.\n* Demonstrate time management, accurate elimination strategies, and critical thinking.\n* Pass the exam with a score of 80% or higher.`
        }
      ],
      quiz: [
        { question: "Which constitutional body conducts the Civil Services Exam in India?", options: ["SSC", "NITI Aayog", "UPSC", "Election Commission"], correctIdx: 2, explanation: "Article 315 of the Indian Constitution mandates the Union Public Service Commission (UPSC) to conduct exams for appointments to the services of the Union." }
      ]
    }
  ];

  return {
    title: 'UPSC Civil Services Preparation Pathway',
    description: 'A comprehensive preparation and evaluation pathway for UPSC IAS exam, covering General Studies, CSAT aptitude, Mains answer-writing framework, Optional subject essays, and Mock Personality Tests.',
    difficulty: 'Expert',
    totalDuration: '120 Hours',
    skills: ['Indian Polity & Constitution', 'History & Geography', 'Analytical Mains Writing', 'CSAT Logical Aptitude', 'Personality Mock Prep'],
    modules
  };
}

function buildFullStackMasteryPath(): PathData {
  const modules: Module[] = [
    {
      id: 'web-mod-1',
      title: 'Module 1: Web Foundations & UI',
      lessons: [
        {
          id: 'web-l-1-1',
          title: '1. HTML5 Semantic Architecture',
          duration: 15,
          type: 'markdown',
          content: `# HTML5 Semantic Architecture\n\n## Learning objectives\n* Write clean, accessible semantic HTML5 layouts.\n* Select correct structural tags like <article> and <section> for self-contained components.\n* Implement correct ARIA attributes for screen reader support.`
        },
        {
          id: 'web-l-1-2',
          title: '2. CSS Grid & Specifying Selectors',
          duration: 20,
          type: 'markdown',
          content: `# CSS Layout Modules & Specificity\n\n## Learning objectives\n* Build robust two-dimensional layouts using CSS Grid.\n* Master stacking contexts, z-index hierarchies, and selector specificity rules.\n* Implement fluid typography using clamp() functions.`
        },
        {
          id: 'web-l-1-3',
          title: '3. Browser Engine Performance & DOM',
          duration: 25,
          type: 'playground',
          codeSnippet: `// Benchmark DOM operations\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 100; i++) {\n  const li = document.createElement('li');\n  li.textContent = "Item " + i;\n  fragment.appendChild(li);\n}\nconsole.log("Appended 100 items to fragment");\n`,
          expectedOutput: 'Appended 100 items to fragment',
          content: `# Browser Performance & Event flow\n\n## Introduction\nOptimize frame rate and layout stability (CLS). Minimize reflows by grouping updates in DocumentFragments.\n\n---\n\n# MINI LAB\nUse DocumentFragment to batch update list elements.`
        }
      ],
      quiz: getWebDevQuestions('web-foundations')
    },
    {
      id: 'web-mod-2',
      title: 'Module 2: Frontend Frameworks & State Mgt',
      lessons: [
        {
          id: 'web-l-2-1',
          title: '1. Virtual DOM Mechanics',
          duration: 15,
          type: 'markdown',
          content: `# Virtual DOM Mechanics\n\n## Learning objectives\n* Understand in-memory UI tree representations.\n* Maximize React diffing algorithm efficiency using unique, stable keys.\n* Prevent unnecessary renders with React.memo and useCallback.`
        },
        {
          id: 'web-l-2-2',
          title: '2. Global Context and Custom Hooks',
          duration: 20,
          type: 'playground',
          codeSnippet: `// Custom Hooks example\nfunction useCounter() {\n  let count = 0;\n  return {\n    increment: () => { count++; console.log("Count is now: " + count); }\n  };\n}\nconst c = useCounter();\nc.increment();\n`,
          expectedOutput: 'Count is now: 1',
          content: `# Global State vs Context\n\n## Introduction\nManage application states, hooks cleanups, and memoize values to avoid expensive context re-renders.\n\n---\n\n# MINI LAB\nCreate reusable hook state controllers.`
        }
      ],
      quiz: getWebDevQuestions('frontend-frameworks')
    },
    {
      id: 'web-mod-3',
      title: 'Module 3: Backend Architecture & APIs',
      lessons: [
        {
          id: 'web-l-3-1',
          title: '1. RESTful Stateless Constraints',
          duration: 18,
          type: 'markdown',
          content: `# RESTful API Design\n\n## Learning objectives\n* Enforce stateless client-server separations.\n* Map standard HTTP methods (PUT vs PATCH) and status codes (202 Accepted).\n* Protect endpoints with secure CORS headers and JWT sessions.`
        },
        {
          id: 'web-l-3-2',
          title: '2. GraphQL Gateways & Query Parsing',
          duration: 22,
          type: 'playground',
          codeSnippet: `// Simulated Gateway check\nfunction parseQuery(query) {\n  return query.includes("fields") ? "OPTIMIZED" : "DEFAULT";\n}\nconsole.log(parseQuery("query { user { fields } }"));\n`,
          expectedOutput: 'OPTIMIZED',
          content: `# GraphQL & REST Performance\n\n## Introduction\nCompare over-fetching issues in REST with fine-grained schema queries in GraphQL gateway routers.\n\n---\n\n# MINI LAB\nValidate client requested fields query parsing.`
        }
      ],
      quiz: getWebDevQuestions('backend-architecture')
    },
    {
      id: 'web-mod-4',
      title: 'Module 4: Databases, DevOps & Deployment',
      lessons: [
        {
          id: 'web-l-4-1',
          title: '1. SQL Performance & Indexing',
          duration: 15,
          type: 'markdown',
          content: `# Database Schemas & Optimizations\n\n## Learning objectives\n* Choose vertical vs horizontal database scaling strategy.\n* Build compound query joins and evaluate indexing costs.\n* Design isolated schemas for NoSQL clusters.`
        },
        {
          id: 'web-l-4-2',
          title: '2. Container Isolation & Pod Lifecycles',
          duration: 25,
          type: 'playground',
          codeSnippet: `// Docker Health Simulation\nconst status = "Healthy";\nconsole.log("Container check status: " + status);\n`,
          expectedOutput: 'Container check status: Healthy',
          content: `# Container Orchestrations\n\n## Introduction\nWrite Dockerfiles, design compose configurations, and define Kubernetes container readiness probes.\n\n---\n\n# MINI LAB\nRun mock health scripts for container clusters.`
        }
      ],
      quiz: getWebDevQuestions('databases-devops')
    },
    {
      id: 'web-mod-5',
      title: 'Module 5: Final Capstone Assessment',
      lessons: [
        {
          id: 'web-l-5-1',
          title: '1. Full Stack Professional Exam Scope',
          duration: 60,
          type: 'markdown',
          content: `# Full Stack Professional Exam Scope\n\n## Learning objectives\n* Complete the 40 MCQ final assessment covering all full-stack paradigms.\n* Enforce XSS output encoding, secure HttpOnly cookie sessions, and CAP theorem trade-offs.\n* Pass the exam with a score of 80% or higher.`
        }
      ],
      quiz: getWebDevQuestions('final-assessment')
    }
  ];

  return {
    title: 'Full Stack Web Dev Mastery Certification',
    description: 'Master industry-grade full-stack web development from semantic UI layouts to React SPA architectures, Express/Next microservices, database engine indexing, Docker containerization, and enterprise DevOps.',
    difficulty: 'Beginner → Expert',
    totalDuration: '160 Hours',
    skills: ['HTML5 & Modern UI/UX', 'React & State Mgt', 'Node.js & API Architecture', 'SQL & NoSQL Systems', 'DevOps & CI/CD Pipelines', 'System Design & Scalability'],
    modules
  };
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'markdown' | 'playground';
  content: string;
  codeSnippet?: string;
  expectedOutput?: string;
}

interface Module {
  id: string;
  title: string;
  xp?: number;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

interface PathData {
  title: string;
  description: string;
  difficulty: string;
  totalDuration: string;
  xpReward?: number;
  skills: string[];
  modules: Module[];
}

interface MilestonePlan {
  id: string;
  title: string;
  durationHours: number;
  xp?: number;
  goal: string;
  startModule: number;
  endModule: number;
  projectTitle: string;
  projectFeatures: string[];
}

const PYTHON_MILESTONES: MilestonePlan[] = [
  {
    id: 'ms-1',
    title: 'Python Foundations',
    durationHours: 35,
    goal: 'Build strong programming foundations and Python fluency.',
    startModule: 1,
    endModule: 5,
    projectTitle: 'Student Record Management System',
    projectFeatures: ['Add students', 'Search students', 'Update records', 'Delete records']
  },
  {
    id: 'ms-2',
    title: 'Core Programming',
    durationHours: 40,
    goal: 'Learn real-world programming structures and data handling.',
    startModule: 6,
    endModule: 10,
    projectTitle: 'Inventory & Billing System',
    projectFeatures: ['Stock management', 'Invoices', 'File storage', 'Reporting']
  },
  {
    id: 'ms-3',
    title: 'Advanced Python & OOP',
    durationHours: 35,
    goal: 'Master scalable architecture and advanced programming.',
    startModule: 11,
    endModule: 15,
    projectTitle: 'Library Management System',
    projectFeatures: ['OOP architecture', 'SQLite database', 'Authentication', 'Reporting dashboard']
  },
  {
    id: 'ms-4',
    title: 'Real-world Development',
    durationHours: 30,
    goal: 'Build deployment-ready applications and industry projects.',
    startModule: 16,
    endModule: 20,
    projectTitle: 'SARTHI Student Portal API',
    projectFeatures: ['Flask backend', 'REST APIs', 'GitHub integration', 'Deployment + docs']
  }
];

const PYTHON_MODULE_BLUEPRINTS: Array<{ title: string; units: string[]; xp?: number }> = [
  { title: 'Introduction to Python', units: ['Introduction & Objectives', 'What is Python?', 'Installing Python', 'VS Code Setup', 'Your First Script', 'Syntax Rules & Spacing', 'Comments & Readability', 'Mini Lab', 'Summary', 'Knowledge Check'] },
  { title: 'Variables & Data Types', units: ['Variables', 'Strings', 'Numbers', 'Booleans', 'Type Conversion', 'User Input', 'String Formatting', 'Exercises', 'Mini Project', 'Knowledge Check'] },
  { title: 'Operators & Conditions', units: ['Arithmetic Operators', 'Comparison Operators', 'Logical Operators', 'If Statements', 'Nested Conditions', 'Match Cases', 'Real-world Logic Systems', 'Exercises', 'Lab', 'Knowledge Check'] },
  { title: 'Loops & Iteration', units: ['For Loops', 'While Loops', 'Break & Continue', 'Nested Loops', 'Iteration Patterns', 'Loop Optimization', 'Practice Challenges', 'Mini Lab', 'Summary', 'Knowledge Check'] },
  { title: 'Functions', units: ['Creating Functions', 'Parameters', 'Return Values', 'Scope', 'Lambda Functions', 'Recursive Functions', 'Real-world Use Cases', 'Exercises', 'Mini Project', 'Knowledge Check'] },
  { title: 'Lists & Tuples', units: ['List operations', 'Slicing', 'Sorting', 'Nested lists', 'Tuples', 'Iteration', 'Challenges', 'Quiz'] },
  { title: 'Dictionaries & Sets', units: ['Dictionaries', 'Key-value systems', 'Sets', 'JSON basics', 'Data mapping', 'Exercises', 'Lab', 'Quiz'] },
  { title: 'File Handling', units: ['Reading files', 'Writing files', 'CSV', 'JSON', 'File paths', 'Error handling', 'Real-world storage systems', 'Quiz'] },
  { title: 'Exception Handling', units: ['try/except', 'finally', 'custom exceptions', 'debugging', 'logging', 'safe applications', 'Quiz'] },
  { title: 'Modules & Packages', units: ['imports', 'custom modules', 'package systems', 'pip', 'virtual environments', 'dependency management', 'Quiz'] },
  { title: 'Object Oriented Programming', units: ['classes', 'objects', 'constructors', 'methods', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'Quiz'] },
  { title: 'Advanced OOP Patterns', units: ['composition', 'decorators', 'dunder methods', 'dataclasses', 'design patterns', 'Quiz'] },
  { title: 'Databases with SQLite', units: ['SQL basics', 'CRUD', 'SQLite integration', 'schema design', 'relationships', 'real-world systems', 'Quiz'] },
  { title: 'APIs & Requests', units: ['REST APIs', 'requests library', 'JSON APIs', 'authentication', 'API integrations', 'Quiz'] },
  { title: 'Automation & Web Scraping', units: ['BeautifulSoup', 'Selenium basics', 'automation workflows', 'scheduled tasks', 'scraping ethics', 'Quiz'] },
  { title: 'Flask Fundamentals', units: ['Flask setup', 'routes', 'templates', 'forms', 'rendering', 'Quiz'] },
  { title: 'Flask APIs', units: ['API architecture', 'REST endpoints', 'authentication', 'JSON responses', 'CRUD APIs', 'Quiz'] },
  { title: 'Git & GitHub', units: ['Git basics', 'commits', 'branches', 'GitHub workflows', 'collaboration', 'Quiz'] },
  { title: 'Deployment Basics', units: ['deployment concepts', 'Render/Railway', 'environment variables', 'production basics', 'debugging', 'Quiz'] },
  { title: 'Final Capstone Project', units: ['Capstone scope', 'Flask backend', 'Authentication', 'SQLite integration', 'REST API implementation', 'GitHub integration', 'Deployment pipeline', 'Documentation', 'Demo Review', 'Capstone Evaluation'] }
];

function createLesson(moduleNo: number, unitNo: number, title: string): Lesson {
  const isPlayground = /lab|project|challenge|evaluation|implementation/i.test(title);
  return {
    id: `py-l-${moduleNo}-${unitNo}`,
    title: `${unitNo}. ${title}`,
    duration: isPlayground ? 20 : 14,
    type: isPlayground ? 'playground' : 'markdown',
    content: `# ${title}\n\n## Learning objectives\n* Apply ${title.toLowerCase()} in practical Python workflows\n* Build industry-ready implementation habits\n* Strengthen debugging and review practices\n\n## Guided learning\nThis unit is part of SARTHI's professional certification track. Focus on applied outcomes, production-quality code, and maintainable architecture.\n\n## Quick check\nDocument one real use case and implement one working Python snippet before moving forward.`,
    codeSnippet: isPlayground ? `# ${title}\n\ndef run_demo():\n    print("Running ${title} lab...")\n\nrun_demo()\n` : undefined,
    expectedOutput: isPlayground ? `Running ${title} lab...` : undefined
  };
}

function buildPythonProfessionalPath(): PathData {
  const modules: Module[] = PYTHON_MODULE_BLUEPRINTS.map((blueprint, idx) => {
    const moduleNo = idx + 1;
    let lessons = blueprint.units.map((unit, unitIdx) => createLesson(moduleNo, unitIdx + 1, unit));
    let quiz = [
      {
        question: `Which practice best demonstrates mastery in ${blueprint.title}?`,
        options: [
          'Memorizing syntax only without implementation',
          'Applying concepts in real labs, debugging, and production-style scenarios',
          'Skipping checkpoints and moving straight to final assessment',
          'Using only autogenerated code without validation'
        ],
        correctIdx: 1,
        explanation: 'Professional mastery comes from practical implementation, debugging discipline, and repeatable engineering workflows.'
      }
    ];

    if (moduleNo === 1) {
      lessons = MODULE_1_LESSONS;
      quiz = MODULE_1_QUIZ;
    }

    return {
      id: `py-mod-${moduleNo}`,
      title: `Module ${moduleNo}: ${blueprint.title}`,
      lessons,
      quiz
    };
  });

  return {
    title: 'Python Development Professional Certification',
    description: 'Career-ready Python specialization with structured milestones, practical labs, portfolio-grade projects, and certification assessment standards aligned to real-world engineering roles.',
    difficulty: 'Beginner → Professional',
    totalDuration: '140 Hours',
    skills: ['Variables & Data Structures', 'Advanced OOP', 'SQLite Systems', 'Flask API Development', 'Automation & Scraping', 'GitHub Workflows', 'Deployment Engineering'],
    modules
  };
}

function buildAdvancedExcelPath(): PathData {
  const modules: Module[] = [
    {
      id: 'excel-mod-1',
      title: 'Module 1: Data Cleaning & Structural Formatting',
      lessons: [
        {
          id: 'excel-l-1-1',
          title: '1. Text Operations & Cleaning Formulas',
          duration: 15,
          type: 'markdown',
          content: `# Text Operations & Cleaning Formulas\n\n## Learning objectives\n* Master functions like TRIM, CLEAN, PROPER, UPPER, and LOWER.\n* Restructure unformatted import dumps from CRM/ERP databases.\n* Use text-to-columns and flash fill for split-second parsing.`
        },
        {
          id: 'excel-l-1-2',
          title: '2. Conditional Parsing & Data Validation rules',
          duration: 20,
          type: 'playground',
          codeSnippet: `// Excel cleaning helper simulation\nconst cleanString = (str) => str.trim().replace(/\\s+/g, ' ');\nconsole.log(cleanString("  Mohit   Topno  Excel "));\n`,
          expectedOutput: 'Mohit Topno Excel',
          content: `# Data Validation & Cleanups\n\n## Introduction\nDefine rules to prevent dirty input: custom length constraints, drop-down list validations, and duplicate row removals.\n\n---\n\n# CLEANUP LAB\nSimulate structural text trim and spacing cleanup.`
        }
      ],
      quiz: [
        { question: "Which formula removes all non-printable characters from a text string?", options: ["TRIM", "CLEAN", "PROPER", "REPLACE"], correctIdx: 1, explanation: "The CLEAN function is specifically designed to remove non-printable ASCII characters from text." }
      ]
    },
    {
      id: 'excel-mod-2',
      title: 'Module 2: Advanced Lookup Functions',
      lessons: [
        {
          id: 'excel-l-2-1',
          title: '1. Bidirectional Lookups using INDEX & MATCH',
          duration: 20,
          type: 'markdown',
          content: `# INDEX & MATCH Power Combinations\n\n## Learning objectives\n* Overcome the left-lookup limitation of VLOOKUP.\n* Build dynamic two-way lookups crossing rows and columns.\n* Optimize lookup performance on large tables by separating INDEX from MATCH.`
        },
        {
          id: 'excel-l-2-2',
          title: '2. Next-Gen Formulas: XLOOKUP',
          duration: 25,
          type: 'playground',
          codeSnippet: `// XLOOKUP simulation matching student records\nconst db = { 'TT-AEX-C-2026-00001': 'Ankit Topno' };\nconst xlookup = (id) => db[id] || "Not Found";\nconsole.log(xlookup('TT-AEX-C-2026-00001'));\n`,
          expectedOutput: 'Ankit Topno',
          content: `# XLOOKUP Mastery\n\n## Introduction\nLeverage next-generation array lookups, default if-not-found values, and search mode overrides without nested IF functions.\n\n---\n\n# LOOKUP LAB\nSimulate database query matching via serial string keys.`
        }
      ],
      quiz: [
        { question: "What is a major advantage of XLOOKUP over VLOOKUP?", options: ["It requires columns to be sorted", "It defaults to an exact match and searches left-to-right or right-to-left", "It only works with numbers", "It is slower"], correctIdx: 1, explanation: "XLOOKUP defaults to an exact match and supports leftward/bidirectional lookups without index offsets." }
      ]
    },
    {
      id: 'excel-mod-3',
      title: 'Module 3: Data Modeling & Power Pivot',
      lessons: [
        {
          id: 'excel-l-3-1',
          title: '1. Relational Star Schemas in Excel',
          duration: 20,
          type: 'markdown',
          content: `# Power Pivot Relational Data Models\n\n## Learning objectives\n* Link transactional fact tables straight to dimension lookups.\n* Prevent performance degradation by avoiding millions of VLOOKUP cells.\n* Model multi-source tables into a cohesive single Pivot query.`
        }
      ],
      quiz: [
        { question: "Which tool in Excel allows you to build a relational data model with table relationships?", options: ["Solver", "Scenario Manager", "Power Pivot", "Goal Seek"], correctIdx: 2, explanation: "Power Pivot provides advanced data modeling and relationship building capabilities directly in Excel." }
      ]
    },
    {
      id: 'excel-mod-4',
      title: 'Module 4: Dynamic Dashboards & MIS Reports',
      lessons: [
        {
          id: 'excel-l-4-1',
          title: '1. Interactive Controls and Slicers',
          duration: 25,
          type: 'markdown',
          content: `# Dashboard Slicers & Timelines\n\n## Learning objectives\n* Link slicers across multiple independent Pivot Tables.\n* Build dynamic KPI card panels showing month-over-month variances.\n* Design color-coordinated thematic formats (dark vs cream) following proper visual hierarchies.`
        }
      ],
      quiz: [
        { question: "To filter multiple PivotTables simultaneously with a single visual control, you should use:", options: ["Filter dropdowns", "Data Validation lists", "Connected Slicers", "Connected filters"], correctIdx: 2, explanation: "You can use Slicers connected to multiple PivotTables via Report Connections to filter them simultaneously." }
      ]
    },
    {
      id: 'excel-mod-5',
      title: 'Module 5: Business Forecasting & Simulations',
      lessons: [
        {
          id: 'excel-l-5-1',
          title: '1. Goal Seek and What-If Scenarios',
          duration: 25,
          type: 'markdown',
          content: `# What-If Analysis tools\n\n## Learning objectives\n* Solve target problems backward using Goal Seek.\n* Compare multiple variable combinations using Scenario Manager.\n* Build dynamic sensitivity tables analyzing interest rates vs monthly payouts.`
        }
      ],
      quiz: [
        { question: "Which tool is best for finding the input value needed to achieve a specific target calculation?", options: ["PivotTable", "Goal Seek", "Scenario Manager", "Data Cleaning TRIM"], correctIdx: 1, explanation: "Goal Seek is a built-in What-If analysis tool used to find the input value required to reach a desired target output." }
      ]
    }
  ];

  return {
    title: 'Advanced Excel Certification Exam',
    description: 'Master advanced Microsoft Excel methodologies, data modeling techniques, business forecasting models, and interactive dashboard creation.',
    difficulty: 'Intermediate → Advanced',
    totalDuration: '10 Hours',
    skills: ['Data Cleaning & Prep', 'Advanced Formulas (XLOOKUP/INDEX)', 'Power Pivot Data Models', 'Interactive MIS Dashboards', 'What-If Simulations', 'Macro Automation Foundations'],
    modules
  };
}

const MOCK_PATHS: Record<string, PathData> = {
  'python-professional-developer': {
    title: 'Python Development Professional Certification',
    description: 'Master production-grade Python from variables and loops up to advanced OOP structures, SQLite databases, Flask web APIs, Git workflows, web scraping automation, and data analytics dashboards.',
    difficulty: 'Beginner → Advanced',
    totalDuration: '120 Hours',
    skills: ['Variables & DS', 'Advanced OOP', 'Flask API Development', 'SQLite Databases', 'Web Scraping & Automation', 'Git & Production Deployments', 'NumPy & Pandas Analytics'],
    modules: [
      {
        id: 'py-mod-1',
        title: 'Module 1: Python Foundations',
        lessons: [
          {
            id: 'py-l-1-1',
            title: '1. Introduction & Objectives',
            duration: 10,
            type: 'markdown',
            content: `# MODULE HERO SECTION\n\n# Introduction to Python\n\n## Subtitle\nStart your Python development journey by learning the foundations of one of the world’s most popular programming languages.\n\n---\n\n## Module Metadata\n| Attribute | Value |\n| --- | --- |\n| Duration | 4 Hours |\n| Difficulty | Beginner |\n| Lessons | 6 |\n| Assessment | Included |\n| Project | Included |\n\n---\n\n# HERO VISUAL\nAI Agent Instruction:\nFetch clean flat illustration with soft colors representing Python coding setup workspace.\n\n---\n\n# LEARNING OBJECTIVES\n## By the end of this module, learners will be able to:\n* Understand what Python is\n* Install Python successfully\n* Set up VS Code for development\n* Write and run Python programs\n* Understand basic syntax\n* Use print statements\n* Execute scripts from terminal`
          },
          {
            id: 'py-l-1-2',
            title: '2. What is Python? & setup',
            duration: 12,
            type: 'markdown',
            content: `# SECTION 1 — WHAT IS PYTHON?\n\n## Introduction\nPython is a high-level programming language known for its simplicity, readability, and versatility.\n\nIt is widely used in web development, AI & machine learning, automation, cybersecurity, data science, and backend systems.\n\nPython is beginner-friendly while also powerful enough for companies like Google, Netflix, Spotify, and NASA.\n\n---\n\n# REAL-WORLD EXPLANATION CARD\n## Why Developers Love Python\nPython allows developers to write less code, build projects faster, and focus on logic instead of syntax complexity.\n\nCompared to many languages, Python reads almost like English.\n\nExample:\n\`\`\`python\nprint("Hello, World!")\n\`\`\`\nThis simple line prints text on the screen.\n\n---\n\n# VISUAL SECTION\nAI Agent Instruction:\nFetch clean flat illustration comparing complex programming syntax VS simple Python syntax.`
          },
          {
            id: 'py-l-1-3',
            title: '3. Installing Python',
            duration: 15,
            type: 'markdown',
            content: `# SECTION 2 — INSTALLING PYTHON\n\n## Step-by-Step Installation\n\n### Windows\n1. Download installer from python.org\n2. Run installer\n3. Check "Add Python to PATH" (CRITICAL!)\n4. Click "Install Now"\n\n### macOS\n1. Use Homebrew: \`brew install python\`\n2. Or download installer from python.org\n\n### Linux (Ubuntu/Debian)\n\`\`\`bash\nsudo apt update\nsudo apt install python3 python3-pip\`\`\``
          },
          {
            id: 'py-l-1-4',
            title: '4. VS Code Setup',
            duration: 15,
            type: 'markdown',
            content: `# SECTION 3 — VS CODE SETUP\n\n## Configure VS Code for Python Development\n1. Download VS Code\n2. Open Extensions tab (Ctrl+Shift+X)\n3. Search for "Python" extension (by Microsoft)\n4. Click Install\n\n---\n\n# VISUAL CARD\nAI Agent Instruction:\nFetch flat vector graphic showing VS Code interface with extensions marketplace highlighted.`
          },
          {
            id: 'py-l-1-5',
            title: '5. Your First Python Script',
            duration: 10,
            type: 'markdown',
            expectedOutput: 'Welcome to SARTHI',
            content: `# SECTION 4 — YOUR FIRST PYTHON PROGRAM\n\nCreate a file named hello.py. Add the line:\n\`\`\`python\nprint("Welcome to SARTHI")\n\`\`\`\nRun using terminal:\n\`\`\`bash\npython hello.py\n\`\`\`\nExpected Output:\n\`\`\`text\nWelcome to SARTHI\n\`\`\`\n\n---\n\n# CONCEPT EXPLANATION\n## Understanding print()\nThe print() function displays output on the screen.\n\nExample:\n\`\`\`python\nprint("Python is amazing")\n\`\`\`\nOutput:\n\`\`\`text\nPython is amazing\n\`\`\``
          },
          {
            id: 'py-l-1-6',
            title: '6. Mini Lab & Exercises',
            duration: 25,
            type: 'playground',
            codeSnippet: `# Build your Introduction Program\nprint("My name is Mohit")\nprint("I want to become an AI Engineer")\nprint("I love Python")\n`,
            expectedOutput: 'My name is Mohit\nI want to become an AI Engineer\nI love Python',
            content: `# MINI LAB\n\n# Build Your Introduction Program\nCreate a program that prints your name, your goal, and your favorite technology.\n\nExample:\n\`\`\`python\nprint("My name is Mohit")\nprint("I want to become an AI Engineer")\nprint("I love Python")\n\`\`\`\n\n---\n\n# COMMON BEGINNER ERRORS\n| Error | Cause |\n| --- | --- |\n| SyntaxError | Incorrect syntax structures |\n| IndentationError | Wrong formatting spacing |\n| NameError | Referencing undefined variables |\n\n---\n\n# BEST PRACTICES\n## Recommended Habits\n* Write clean code\n* Use meaningful names\n* Practice daily\n* Experiment fearlessly\n* Read error messages carefully\n\n---\n\n# MODULE SUMMARY\nIn this module, you learned what Python is, where it is used, how to configure VS Code, write simple programs, and basic indentation rules.\n\n---\n\n# NEXT MODULE PREVIEW\n## Up Next: Variables & Data Types\nYou’ll learn storing information, data types, numbers, strings, and booleans.\n\n---\n\n# MODULE COMPLETION STATE\n✔ Module Completed`
          }
        ],
        quiz: [
          {
            question: 'Which of the following is correct regarding variables in Python?',
            options: [
              'Variables must be declared with a strict type keyword like int or string',
              'Variables are dynamically typed and can change types at runtime',
              'Variables are immutable by default and cannot be reassigned',
              'Variables must be declared using the let or const operators'
            ],
            correctIdx: 1,
            explanation: 'Python is dynamically typed, meaning variables are resolved at execution and can freely be reassigned to different data types.'
          }
        ]
      },
      {
        id: 'py-mod-2',
        title: 'Module 2: Core Programming',
        lessons: [
          {
            id: 'py-l-2-1',
            title: '1. Functions & Variable Scope',
            duration: 15,
            type: 'markdown',
            content: `# PHASE 2 — CORE PROGRAMMING\n\n# Module 6 — Functions & Scope\n\n## Subtitle\nLearn how to package blocks of statements into reusable functions, specify input parameters, return values, and govern variable scope.\n\n---\n\n# LEARNING OBJECTIVES\n* Create custom functions using the def keyword\n* Pass parameters and return values\n* Understand global vs local scope\n* Learn simple lambda closures\n\n---\n\n# REAL-WORLD ANALOGY\nFunctions are like smart kitchen appliances: you give them raw ingredients (parameters), they process them, and they return a finished dish (return values).`
          },
          {
            id: 'py-l-2-2',
            title: '2. Student Record Data Structures',
            duration: 20,
            type: 'playground',
            codeSnippet: `# Build a Student Record Dictionary\nstudent = {\n    "name": "Mohit",\n    "course": "Python Professional",\n    "skills": ["OOP", "APIs"]\n}\n\nstudent["skills"].append("SQL")\nprint(f"Student: {student['name']} | Total Skills: {len(student['skills'])}")\n`,
            expectedOutput: 'Student: Mohit | Total Skills: 3',
            content: `# Module 7 — Data Structures\n\n## Introduction\nPython lists, dictionaries, sets, and tuples represent the core database schemas inside standard scripts.\n\n* **Lists**: Indexed arrays for listing items dynamically.\n* **Dictionaries**: Key-value pairings perfect for storing profile mappings.\n\n---\n\n# MINI LAB\nStudent Database Manager:\nUpdate student record maps dynamically.`
          }
        ],
        quiz: [
          {
            question: 'Which bracket is utilized to define a standard dictionary in Python?',
            options: [
              '[ ]',
              '( )',
              '{ }',
              '< >'
            ],
            correctIdx: 2,
            explanation: 'Curly braces `{}` are used to define key-value structures like dictionaries in Python.'
          }
        ]
      },
      {
        id: 'py-mod-3',
        title: 'Module 3: Advanced Python OOP',
        lessons: [
          {
            id: 'py-l-3-1',
            title: '1. Object Oriented Library Systems',
            duration: 18,
            type: 'markdown',
            content: `# PHASE 3 — ADVANCED PYTHON\n\n# Module 11 — Object Oriented Programming\n\n## Subtitle\nStructure advanced software using robust objects, custom constructors, inheritance, and encapsulation standards.\n\n---\n\n# LEARNING OBJECTIVES\n* Master python class schemas\n* Manage self and __init__ attributes\n* Implement subclass inheritance pipelines\n\n---\n\n# REAL-WORLD EXPLANATION\nClasses are the architectural blueprints. Objects are the actual premium physical structures constructed from those blueprints.`
          },
          {
            id: 'py-l-3-2',
            title: '2. Custom Package & Virtual Env',
            duration: 15,
            type: 'playground',
            codeSnippet: `# Building and importing virtual modules\nclass VirtualEnvironment:\n    def __init__(self, name):\n        self.name = name\n        self.packages = []\n\n    def install(self, pkg):\n        self.packages.append(pkg)\n        return f"pip install {pkg} complete!"\n\nenv = VirtualEnvironment("sarthi_env")\nprint(env.install("requests"))\n`,
            expectedOutput: 'pip install requests complete!',
            content: `# Module 12 — Virtual Environments\n\n## Introduction\nVirtual environments allow developers to isolate dependencies per project. Using pip, you download libraries cleanly without polluting the global environment.\n\n---\n\n# MINI LAB\nVerify and package request modules inside local environments.`
          }
        ],
        quiz: [
          {
            question: 'What is the role of self keyword inside Python classes?',
            options: [
              'It defines a globally secure environment variable',
              'It refers to the current instance of the class',
              'It acts as an alias for virtual pip libraries',
              'It converts values to integers'
            ],
            correctIdx: 1,
            explanation: 'The self keyword binds attributes and methods to the specifically instantiated class object.'
          }
        ]
      },
      {
        id: 'py-mod-4',
        title: 'Module 4: Real-world Automation',
        lessons: [
          {
            id: 'py-l-4-1',
            title: '1. Automated Scraping & Git',
            duration: 15,
            type: 'markdown',
            content: `# PHASE 4 — REAL-WORLD DEVELOPMENT\n\n# Module 17 — Automation with Python\n\n## Subtitle\nWrite automated script utilities to scraper websites, batch rename local CSV records, and push them to Github repos.\n\n---\n\n# LEARNING OBJECTIVES\n* Write web crawlers using requests\n* Automate bulk file mergers\n* Commit code to git pipelines`
          },
          {
            id: 'py-l-4-2',
            title: '2. Flask Server Controllers',
            duration: 20,
            type: 'playground',
            codeSnippet: `# Launching a simulated Flask Microservice\nclass SARTHIFlask:\n    def __init__(self):\n        self.routes = {}\n\n    def route(self, path):\n        def decorator(f):\n            self.routes[path] = f\n            return f\n        return decorator\n\napp = SARTHIFlask()\n\n@app.route("/api/v1/health")\ndef check_health():\n    return "STATUS: HEALTHY | SARTHI"\n\nprint(app.routes["/api/v1/health"]())\n`,
            expectedOutput: 'STATUS: HEALTHY | SARTHI',
            content: `# Module 18 — Flask Web Development\n\n## Introduction\nFlask is the most popular microservices framework in Python. Easily bind URL requests straight to data structures and deliver JSON endpoints instantly.\n\n---\n\n# MINI LAB\nCreate API routers and host them live.`
          }
        ],
        quiz: [
          {
            question: 'Which method is utilized to map URLs in a Flask web server?',
            options: [
              'app.route() decorator',
              'url.bind() function',
              'config.xml routing lists',
              'system.process() parameters'
            ],
            correctIdx: 0,
            explanation: 'The @app.route() decorator binds web paths cleanly to python controller functions.'
          }
        ]
      }
    ]
  }
};

interface ParsedBlock {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'list' | 'table' | 'code' | 'illustration' | 'callout' | 'hr';
  subType?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  codeText?: string;
  lang?: string;
  text?: string;
}

interface RenderableNode {
  type: 'section' | 'element';
  sectionType?: 'real-world' | 'objectives' | 'errors' | 'best-practices' | 'concept' | 'hero' | 'illustration-section' | 'default';
  sectionTitle?: string;
  blocks: ParsedBlock[];
  element?: ParsedBlock;
}

const parseMarkdown = (content: string): ParsedBlock[] => {
  const lines = content.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentBlock: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block parsing
    if (trimmed.startsWith('```')) {
      if (currentBlock && currentBlock.type === 'code') {
        blocks.push(currentBlock);
        currentBlock = null;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        const lang = trimmed.replace('```', '').trim() || 'python';
        currentBlock = { type: 'code', lang, lines: [] };
      }
      continue;
    }

    if (currentBlock && currentBlock.type === 'code') {
      currentBlock.lines.push(line);
      continue;
    }

    // 2. Table parsing
    if (trimmed.startsWith('|')) {
      if (currentBlock && currentBlock.type === 'table') {
        currentBlock.lines.push(trimmed);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'table', lines: [trimmed] };
      }
      continue;
    } else if (currentBlock && currentBlock.type === 'table') {
      blocks.push(currentBlock);
      currentBlock = null;
    }

    // 3. Bullet List parsing
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const item = trimmed.replace(/^[*+-]\s+/, '').trim();
      if (currentBlock && currentBlock.type === 'list') {
        currentBlock.items.push(item);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'list', items: [item] };
      }
      continue;
    } else if (currentBlock && currentBlock.type === 'list') {
      blocks.push(currentBlock);
      currentBlock = null;
    }

    // 4. Horizontal Rule
    if (trimmed === '---') {
      if (currentBlock) blocks.push(currentBlock);
      blocks.push({ type: 'hr' });
      currentBlock = null;
      continue;
    }

    // 5. Headings
    if (trimmed.startsWith('# ')) {
      if (currentBlock) blocks.push(currentBlock);
      const text = trimmed.replace('# ', '').trim();
      blocks.push({ type: 'h1', text });
      currentBlock = null;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      if (currentBlock) blocks.push(currentBlock);
      const text = trimmed.replace('## ', '').trim();
      blocks.push({ type: 'h2', text });
      currentBlock = null;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (currentBlock) blocks.push(currentBlock);
      const text = trimmed.replace('### ', '').trim();
      blocks.push({ type: 'h3', text });
      currentBlock = null;
      continue;
    }

    // 6. Text / Paragraphs
    if (trimmed !== '') {
      if (currentBlock && currentBlock.type === 'paragraph') {
        currentBlock.text += '\n' + trimmed;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'paragraph', text: trimmed };
      }
    } else {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // Post-processing to refine block types
  const refinedBlocks: ParsedBlock[] = [];
  for (let j = 0; j < blocks.length; j++) {
    const b = blocks[j];

    if (b.type === 'code') {
      refinedBlocks.push({
        type: 'code',
        lang: b.lang,
        codeText: b.lines.join('\n')
      });
    } else if (b.type === 'table') {
      const rows = b.lines.map((l: string) => l.split('|').map(s => s.trim()).filter(Boolean));
      // First row is header, second is separator (e.g. --- | ---), remaining are body
      const headers = rows[0] || [];
      const bodyRows = rows.slice(2) || [];
      refinedBlocks.push({
        type: 'table',
        headers,
        rows: bodyRows
      });
    } else if (b.type === 'list') {
      refinedBlocks.push({
        type: 'list',
        items: b.items
      });
    } else if (b.type === 'paragraph') {
      const txt = b.text.trim();
      // Check if it's an instruction or image visual block
      if (txt.toLowerCase().includes('ai agent instruction') ||
        txt.toLowerCase().includes('ai visual instruction') ||
        txt.toLowerCase().includes('fetch clean') ||
        txt.toLowerCase().includes('illustration') ||
        txt.toLowerCase().includes('hero visual') ||
        txt.toLowerCase().includes('visual section')) {
        refinedBlocks.push({
          type: 'illustration',
          text: txt
        });
      } else if (txt.startsWith('IMPORTANT:') || txt.startsWith('WARNING:') || txt.startsWith('TIP:') || txt.startsWith('BEST PRACTICE:')) {
        refinedBlocks.push({
          type: 'callout',
          subType: txt.split(':')[0].toLowerCase(),
          text: txt.substring(txt.indexOf(':') + 1).trim()
        });
      } else {
        refinedBlocks.push({
          type: 'paragraph',
          text: txt
        });
      }
    } else {
      refinedBlocks.push(b);
    }
  }

  return refinedBlocks;
};

const groupBlocks = (blocks: ParsedBlock[]): RenderableNode[] => {
  const nodes: RenderableNode[] = [];
  let currentSection: RenderableNode | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    // Determine if this block starts a new section
    if (b.type === 'h1') {
      const text = b.text || '';
      const textLower = text.toLowerCase();

      let sectionType: any = null;
      if (textLower.includes('real-world explanation') || textLower.includes('real-world analogy') || textLower.includes('real-world explanation card')) {
        sectionType = 'real-world';
      } else if (textLower.includes('learning objectives')) {
        sectionType = 'objectives';
      } else if (textLower.includes('common beginner errors') || textLower.includes('beginner errors')) {
        sectionType = 'errors';
      } else if (textLower.includes('best practices') || textLower.includes('recommended habits') || textLower.includes('best practices:')) {
        sectionType = 'best-practices';
      } else if (textLower.includes('concept explanation') || textLower.includes('understanding')) {
        sectionType = 'concept';
      } else if (textLower.includes('hero section') || textLower.includes('module hero')) {
        sectionType = 'hero';
      } else if (textLower.includes('hero visual') || textLower.includes('visual section')) {
        sectionType = 'illustration-section';
      }

      if (sectionType) {
        if (currentSection) {
          nodes.push(currentSection);
        }
        currentSection = {
          type: 'section',
          sectionType,
          sectionTitle: text,
          blocks: []
        };
        continue;
      }
    }

    // Horizontal rule resets sections
    if (b.type === 'hr') {
      if (currentSection) {
        nodes.push(currentSection);
        currentSection = null;
      }
      nodes.push({ type: 'element', element: b, blocks: [] });
      continue;
    }

    if (currentSection) {
      currentSection.blocks.push(b);
    } else {
      nodes.push({ type: 'element', element: b, blocks: [] });
    }
  }

  if (currentSection) {
    nodes.push(currentSection);
  }

  return nodes;
};

function InteractiveCodeBlock({ codeText, lang }: { codeText: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-md bg-[#0F172A] font-mono text-xs my-6 animate-fade-in relative group/code z-10 text-left">
      <div className="bg-[#1E293B] px-5 py-3.5 border-b border-[#334155] flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">{lang || 'python'} snippet</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${copied ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
        >
          {copied ? <Check size={12} className="stroke-[3]" /> : <BookOpen size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-5 text-emerald-300 overflow-x-auto leading-relaxed font-mono font-medium max-h-[400px] custom-scrollbar">
        <code>{codeText}</code>
      </pre>
    </div>
  );
}

function VisualMockupBlock({ text }: { text: string }) {
  const textLower = text.toLowerCase();

  // 1. Syntax Comparison
  if (textLower.includes('syntax') && (textLower.includes('compare') || textLower.includes('vs'))) {
    return (
      <div className="my-8 animate-fade-in text-left">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">Comparative Analysis</span>
        <h4 className="text-sm font-bold text-slate-800 mt-3 mb-4 uppercase tracking-tight">Syntax Complexity Comparison</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* C++ Code Card */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 font-mono text-[11px] shadow-lg relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-slate-400">
              <span className="font-extrabold text-[10px] uppercase tracking-widest text-red-400">Verbose Syntax (C++)</span>
              <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">6 lines</span>
            </div>
            <pre className="text-slate-455 leading-relaxed">
              {`#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}`}
            </pre>
          </div>

          {/* Python Code Card */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 font-mono text-[11px] shadow-lg relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-slate-400">
              <span className="font-extrabold text-[10px] uppercase tracking-widest text-emerald-400">Elegant Syntax (Python)</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">1 line</span>
            </div>
            <pre className="text-emerald-300 leading-relaxed font-bold">
              {`print("Hello, World!")`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // 2. VS Code IDE Mockup
  if (textLower.includes('workspace') || textLower.includes('vs code') || textLower.includes('ide') || textLower.includes('dark coding')) {
    return (
      <div className="my-8 animate-fade-in shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden border border-slate-200/80 text-left">
        <div className="bg-[#1E293B] px-5 py-3.5 border-b border-[#334155] flex items-center justify-between text-slate-400 text-[10px] font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm shadow-rose-500/30" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm shadow-amber-500/30" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm shadow-emerald-500/30" />
            <span className="text-slate-400 ml-3 font-mono">python_workspace · VS Code</span>
          </div>
          <span className="text-slate-500 font-mono">UTF-8</span>
        </div>
        <div className="flex font-mono text-xs p-5 bg-[#0F172A] leading-relaxed">
          <div className="text-slate-600 border-r border-slate-800/80 pr-4 mr-4 select-none text-right flex flex-col font-medium">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <div className="text-emerald-300/95 font-semibold text-left">
            <span className="text-purple-400">import</span> sys<br />
            <span className="text-purple-400">print</span>(<span className="text-amber-300">&quot;Starting SARTHI Python Sandbox...&quot;</span>)<br />
            <span className="text-purple-400">print</span>(f<span className="text-amber-300">&quot;Local Python version: {"{sys.version}"}&quot;</span>)<br />
            <span className="text-purple-400">print</span>(<span className="text-amber-300">&quot;Execution completed successfully!&quot;</span>)<br />
            <span className="text-slate-500"># System output binds to direct local terminal</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fallback Illustration Render
  return (
    <div className="my-8 rounded-3xl overflow-hidden border border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-slate-100/20 p-2 shadow-inner group text-left">
      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80"
          alt="Visual setup canvas"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-700 filter saturate-[0.85] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-6 text-white text-left">
          <span className="text-[8px] font-black uppercase tracking-[0.25em] bg-emerald-500 text-white px-2.5 py-1 rounded-md leading-none">Interactive Sandbox Graphic</span>
          <h4 className="text-xs font-bold uppercase tracking-tight mt-2.5 title-outfit">Visual Learning Assistant</h4>
        </div>
      </div>
    </div>
  );
}

function LessonMetadataBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-8 animate-fade-in text-left">
      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">Module Overview</span>
      <h4 className="text-sm font-bold text-slate-800 mt-3 mb-4 uppercase tracking-tight">Technical Syllabus Metadata</h4>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rows.map((row, idx) => {
          const attribute = row[0] || 'Metadata';
          const value = row[1] || 'Included';

          let icon = <Sparkles size={16} className="text-emerald-500" />;
          let bgClass = "from-emerald-50/40 to-emerald-100/10 border-emerald-100/40";

          const lowerAttr = attribute.toLowerCase();
          if (lowerAttr.includes('duration')) {
            icon = <Clock size={16} className="text-indigo-500" />;
            bgClass = "from-indigo-50/40 to-indigo-100/10 border-indigo-100/40";
          } else if (lowerAttr.includes('difficulty')) {
            icon = <Flame size={16} className="text-amber-500" />;
            bgClass = "from-amber-50/40 to-amber-100/10 border-amber-100/40";
          } else if (lowerAttr.includes('xp')) {
            icon = <Sparkles size={16} className="text-purple-500" />;
            bgClass = "from-purple-50/40 to-purple-100/10 border-purple-100/40";
          } else if (lowerAttr.includes('lessons') || lowerAttr.includes('units')) {
            icon = <BookOpen size={16} className="text-blue-500" />;
            bgClass = "from-blue-50/40 to-blue-100/10 border-blue-100/40";
          } else if (lowerAttr.includes('assessment')) {
            icon = <Award size={16} className="text-rose-500" />;
            bgClass = "from-rose-50/40 to-rose-100/10 border-rose-100/40";
          } else if (lowerAttr.includes('project')) {
            icon = <Code2 size={16} className="text-teal-500" />;
            bgClass = "from-teal-50/40 to-teal-100/10 border-teal-100/40";
          }

          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${bgClass} border rounded-2xl p-4 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[95px]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">{attribute}</span>
                {icon}
              </div>
              <span className="text-slate-800 text-sm font-extrabold tracking-tight mt-3 text-left">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableRender({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (headers[0]?.toLowerCase() === 'attribute' && rows.every(r => r.length === 2)) {
    return <LessonMetadataBlock headers={headers} rows={rows} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/60 my-6 shadow-sm">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/50 text-[10px] font-black uppercase tracking-wider text-slate-500">
            {headers.map((h, i) => <th key={i} className="px-5 py-4">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50/30">
              {row.map((cell, cIdx) => <td key={cIdx} className="px-5 py-4 font-medium text-slate-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const renderLessonContent = (content: string) => {
  const blocks = parseMarkdown(content);
  const nodes = groupBlocks(blocks);

  return (
    <div className="space-y-6 font-sans text-slate-600 text-left">
      {nodes.map((node, idx) => {
        if (node.type === 'section') {
          const type = node.sectionType;

          if (type === 'hero') {
            const h1Block = node.blocks.find(b => b.type === 'h1');
            const h2Block = node.blocks.find(b => b.type === 'h2');
            const paragraphBlock = node.blocks.find(b => b.type === 'paragraph');

            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white rounded-3xl p-6 md:p-8 shadow-lg shadow-emerald-950/10 mb-8 border border-emerald-800/30 relative overflow-hidden animate-fade-in text-left"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3 bg-emerald-500/20 w-fit px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-200">
                  <Sparkles size={12} className="animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none">Introduction module</span>
                </div>

                {h1Block && (
                  <h2 className="text-xl md:text-2xl font-black title-outfit uppercase tracking-tight italic text-emerald-50 leading-tight mb-2">
                    {h1Block.text}
                  </h2>
                )}
                {h2Block && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300/80 mb-4">
                    {h2Block.text}
                  </h3>
                )}
                {paragraphBlock && (
                  <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium max-w-2xl text-left">
                    {paragraphBlock.text}
                  </p>
                )}
              </div>
            );
          }

          if (type === 'objectives') {
            const listBlock = node.blocks.find(b => b.type === 'list');
            const h2Block = node.blocks.find(b => b.type === 'h2');

            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-emerald-50/40 to-teal-50/20 border border-emerald-100/60 rounded-3xl p-6 shadow-sm mb-6 animate-fade-in text-left"
              >
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold uppercase text-xs tracking-wider mb-4 border-b border-emerald-100 pb-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>{h2Block?.text || 'Learning Objectives'}</span>
                </div>

                {listBlock && listBlock.items && (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {listBlock.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-700 leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-emerald-500/10">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span className="flex-1 mt-0.5 text-left">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          if (type === 'real-world' || type === 'concept') {
            const h2Block = node.blocks.find(b => b.type === 'h2');
            const paragraphs = node.blocks.filter(b => b.type === 'paragraph');
            const codeBlock = node.blocks.find(b => b.type === 'code');

            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100/60 rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative overflow-hidden animate-fade-in text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-amber-700 font-black uppercase text-[10px] tracking-widest mb-4 border-b border-amber-100/50 pb-3">
                  <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  <span>{type === 'real-world' ? 'Real-world application' : 'Core Concept'}</span>
                </div>

                {h2Block && (
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-3 uppercase">
                    {h2Block.text}
                  </h3>
                )}

                {paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-[13px] font-semibold leading-relaxed text-slate-600 mb-4 last:mb-0 text-left">
                    {p.text}
                  </p>
                ))}

                {codeBlock && codeBlock.codeText && (
                  <InteractiveCodeBlock codeText={codeBlock.codeText} lang={codeBlock.lang || 'python'} />
                )}
              </div>
            );
          }

          if (type === 'errors') {
            const h2Block = node.blocks.find(b => b.type === 'h2');
            const paragraphs = node.blocks.filter(b => b.type === 'paragraph');
            const listBlock = node.blocks.find(b => b.type === 'list');
            const tableBlock = node.blocks.find(b => b.type === 'table');

            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-rose-50/50 to-red-50/30 border border-rose-100/60 rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative overflow-hidden animate-fade-in text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-rose-700 font-black uppercase text-[10px] tracking-widest mb-4 border-b border-rose-100/50 pb-3">
                  <AlertCircle size={14} className="text-rose-500 animate-bounce" />
                  <span>Beginner pitfalls & warnings</span>
                </div>

                {h2Block && (
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-3 uppercase">
                    {h2Block.text}
                  </h3>
                )}

                {paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-[13px] font-semibold leading-relaxed text-slate-600 mb-4 text-left">
                    {p.text}
                  </p>
                ))}

                {listBlock && listBlock.items && (
                  <ul className="space-y-2 mb-4">
                    {listBlock.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs font-bold text-rose-950/80 leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={10} className="stroke-[3]" />
                        </div>
                        <span className="flex-1 text-left">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tableBlock && tableBlock.headers && tableBlock.rows && (
                  <div className="overflow-x-auto rounded-2xl border border-rose-200/50 shadow-inner bg-white/70 backdrop-blur-sm mt-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-rose-100/40 border-b border-rose-200/50 text-[9px] font-black uppercase tracking-wider text-rose-700">
                          {tableBlock.headers.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100/40 text-xs font-bold text-slate-700">
                        {tableBlock.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-rose-50/20">
                            {row.map((cell, cIdx) => <td key={cIdx} className="px-4 py-3 text-left">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          }

          if (type === 'best-practices') {
            const h2Block = node.blocks.find(b => b.type === 'h2');
            const paragraphs = node.blocks.filter(b => b.type === 'paragraph');
            const listBlock = node.blocks.find(b => b.type === 'list');

            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/60 rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative overflow-hidden animate-fade-in text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-emerald-700 font-black uppercase text-[10px] tracking-widest mb-4 border-b border-emerald-100/50 pb-3">
                  <Award size={14} className="text-emerald-500 animate-pulse" />
                  <span>Pro-habits & Best Practices</span>
                </div>

                {h2Block && (
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-3 uppercase">
                    {h2Block.text}
                  </h3>
                )}

                {paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-[13px] font-semibold leading-relaxed text-slate-600 mb-4 text-left">
                    {p.text}
                  </p>
                ))}

                {listBlock && listBlock.items && (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {listBlock.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-700 leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span className="flex-1 mt-0.5 text-left">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          if (type === 'illustration-section') {
            const illustrationBlock = node.blocks.find(b => b.type === 'illustration');
            if (illustrationBlock && illustrationBlock.text) {
              return <VisualMockupBlock key={idx} text={illustrationBlock.text} />;
            }
          }
        }

        // Standard elements rendering
        const el = node.element;
        if (!el) return null;

        if (el.type === 'h1') {
          return (
            <h2 key={idx} className="text-xl font-bold text-slate-900 tracking-tight leading-tight mt-8 mb-3 uppercase title-outfit italic border-b border-slate-100 pb-2 text-left">
              {el.text}
            </h2>
          );
        }

        if (el.type === 'h2') {
          return (
            <h3 key={idx} className="text-base font-extrabold text-slate-800 tracking-tight mt-6 mb-2 uppercase text-left">
              {el.text}
            </h3>
          );
        }

        if (el.type === 'h3') {
          return (
            <h4 key={idx} className="text-sm font-extrabold text-slate-700 mt-4 mb-1.5 uppercase text-left">
              {el.text}
            </h4>
          );
        }

        if (el.type === 'paragraph') {
          return (
            <p key={idx} className="text-[13px] font-semibold leading-relaxed text-slate-500 mb-4 text-left">
              {el.text}
            </p>
          );
        }

        if (el.type === 'code' && el.codeText) {
          return <InteractiveCodeBlock key={idx} codeText={el.codeText} lang={el.lang || 'python'} />;
        }

        if (el.type === 'table' && el.headers && el.rows) {
          return <TableRender key={idx} headers={el.headers} rows={el.rows} />;
        }

        if (el.type === 'list' && el.items) {
          return (
            <ul key={idx} className="space-y-2.5 my-4 text-left">
              {el.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-700 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                  <span className="flex-1 mt-0.5 text-left">{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (el.type === 'illustration' && el.text) {
          return <VisualMockupBlock key={idx} text={el.text} />;
        }

        if (el.type === 'callout') {
          let icon = <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 animate-pulse" />;
          let themeClass = "bg-slate-50/80 border-slate-200/60 text-slate-700";

          if (el.subType === 'warning') {
            icon = <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 animate-pulse" />;
            themeClass = "bg-rose-50/60 border-rose-100/50 text-rose-950";
          } else if (el.subType === 'tip') {
            icon = <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />;
            themeClass = "bg-amber-50/60 border-amber-100/50 text-amber-950";
          }

          return (
            <div key={idx} className={`p-5 border rounded-2xl flex gap-4 text-xs leading-relaxed my-5 shadow-sm animate-slide-down text-left ${themeClass}`}>
              {icon}
              <div className="text-left">
                <span className="font-extrabold block mb-0.5 capitalize">{el.subType} callout</span>
                <span className="font-medium opacity-90">{el.text}</span>
              </div>
            </div>
          );
        }

        if (el.type === 'hr') {
          return <div key={idx} className="h-px bg-slate-200/60 my-8" />;
        }

        return null;
      })}
    </div>
  );
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  'py-mod-1': 'Master the execution flow, interpreter mechanics, and setup standard environments.',
  'py-mod-2': 'Understand data primitives, list structures, dictionary maps, and memory layouts.',
  'py-mod-3': 'Build structured algorithms with relational logic, loops, and control exceptions.',
  'py-mod-4': 'Organize clean production code using modules, packages, and absolute/relative imports.',
  'py-mod-5': 'Handle stream resources with file system interfaces and structural data parsing.',
  'py-mod-6': 'Design object systems with polymorphism, inheritance chains, and class encapsulation.',
  'py-mod-7': 'Create clean interfaces using abstraction, decorators, custom dunder magic protocols.',
  'py-mod-8': 'Architect robust systems with dependency managers, mock decorators, and pytest scopes.',
  'py-mod-9': 'Optimize thread/process workers with asyncio loops and concurrency abstractions.',
  'py-mod-10': 'Build clean HTTP routing services, middleware interceptors, and database schemas.'
};

const playSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Premium arpeggio chime: C4 (261.63), G4 (392.00), C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      // Volume envelope
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 1.3);
    });
  } catch (e) {
    console.error("Failed to play success sound:", e);
  }
};

export default function PathClient({ slug }: { slug: string }) {
  const router = useRouter();
  const pathData = useMemo(() => slug === 'python-professional-developer'
    ? buildPythonProfessionalPath()
    : slug === 'fullstack-mastery'
      ? buildFullStackMasteryPath()
      : slug === 'ias-preparation'
        ? buildIasPreparationPath()
        : slug === 'advanced-excel-certification-exam'
          ? buildAdvancedExcelPath()
          : (MOCK_PATHS[slug] || MOCK_PATHS['python-professional-developer']), [slug]);

  // User learning state
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [viewingQuiz, setViewingQuiz] = useState(false);
  const [isLearningMode, setIsLearningMode] = useState(false);

  // Progress states
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    'py-l-1-1': true // Start with one lesson complete as a friendly cue
  });
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});
  const [passedMilestones, setPassedMilestones] = useState<Record<number, boolean>>({});

  const isAllPassed = useMemo(() => {
    if (slug === 'fullstack-mastery' || slug === 'ias-preparation') {
      return !!(passedMilestones[0] && passedMilestones[1] && passedMilestones[2] && passedMilestones[3] && passedMilestones[4]);
    }
    return !!(passedMilestones[0] && passedMilestones[1] && passedMilestones[2] && passedMilestones[3]);
  }, [passedMilestones, slug]);

  const getCertificateId = () => {
    const certPrefix = slug === 'fullstack-mastery' 
      ? 'FSWDM' 
      : slug === 'ias-preparation' 
        ? 'UPSC-FS' 
        : slug === 'advanced-excel-certification-exam'
          ? 'AEX-C'
          : 'PY-PRO';
    const userIdPart = (user?.id || '42').substring(0, 6).toUpperCase();
    return `TT-${certPrefix}-2026-${userIdPart}`;
  };

  const handleLinkedInShare = () => {
    const name = slug === 'fullstack-mastery'
      ? 'Full Stack Web Development Mastery'
      : slug === 'ias-preparation'
        ? 'UPSC Civil Services Preparation'
        : slug === 'advanced-excel-certification-exam'
          ? 'Advanced Excel Certification'
          : 'Python Professional Developer';

    const certId = credentialId || getCertificateId();
    const certUrl = `${window.location.origin}/certification-exams/verify/${certId}`;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(name)}&organizationId=92716075&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(certId)}`;
    window.open(url, '_blank');
  };

  // Playground state
  const [code, setCode] = useState(pathData.modules[0].lessons[1].codeSnippet || '');
  const [consoleOutput, setConsoleOutput] = useState('Click "Run Code" to compile.');
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Quiz submission state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  // UI state
  const [activeTab, setActiveTab] = useState<'Milestones' | 'Overview' | 'Resources' | 'Discussion'>('Milestones');
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>({
    'ms-1': true,
    'ms-2': false,
    'ms-3': false,
    'ms-4': false
  });
  const activeMilestoneId = Object.keys(openMilestones).find(key => openMilestones[key]) || 'ms-1';

  // Honor Code / MS Learn style state
  const [showHonorCodeModal, setShowHonorCodeModal] = useState(false);
  const [honorCodeChecked, setHonorCodeChecked] = useState(false);

  const handleStartCertificationAssessment = () => {
    setShowHonorCodeModal(false);
    if (!user) {
      window.location.href = `/login?redirect=/certification-exams/paths/${slug}`;
      return;
    }

    // Find next pending assessment index
    let nextIdx = 0;
    for (let i = 0; i < milestones.length; i++) {
      if (!passedMilestones[i]) {
        nextIdx = i;
        break;
      }
    }

    setCheatWarnings(0);
    const initialStates: Record<number, 'answered' | 'not-answered' | 'marked' | 'marked-answered' | 'not-visited'> = { 0: 'not-answered' };
    setQuestionStates(initialStates);

    if (nextIdx === 4 || (nextIdx === 3 && passedMilestones[3])) {
      // Final exam
      setAssessmentPath(slug === 'fullstack-mastery' ? 'final' : 'advanced');
      setAssessmentActive(true);
      setAssessmentQuestionIdx(0);
      setAssessmentAttempt(prev => prev + 1);
      setAssessmentAnswers({});
      setAssessmentTimeLeft(3600);
      setExamDuration(3600);
      setAssessmentSubmitted(false);
    } else {
      // Milestone 1 to 4
      const pathKeys: ('basic' | 'intermediate' | 'advanced' | 'realworld')[] = ['basic', 'intermediate', 'advanced', 'realworld'];
      const pathKey = pathKeys[nextIdx] || 'basic';
      setAssessmentPath(pathKey);
      setAssessmentActive(true);
      setAssessmentQuestionIdx(0);
      setAssessmentAttempt(prev => prev + 1);
      setAssessmentAnswers({});
      setAssessmentTimeLeft(1200);
      setExamDuration(1200);
      setAssessmentSubmitted(false);
    }
  };

  // Premium Hero Sandbox States
  const [sandboxTab, setSandboxTab] = useState<'main.py' | 'output.log'>('main.py');
  const [sandboxOutput, setSandboxOutput] = useState('Click "Run Code" to compile & execute.');
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          setUser(null);
          setLoadingUser(false);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoadingUser(false);
      })
      .catch(() => {
        setUser(null);
        setLoadingUser(false);
      });
  }, [slug]);

  // States for the custom Assessment Gate section
  const [assessmentPath, setAssessmentPath] = useState<'basic' | 'intermediate' | 'advanced' | 'realworld' | 'final'>('basic');
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [assessmentAttempt, setAssessmentAttempt] = useState(0);
  const [assessmentQuestionIdx, setAssessmentQuestionIdx] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentTimeLeft, setAssessmentTimeLeft] = useState(1200);
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentPassed, setAssessmentPassed] = useState(false);
  const [finalExpanded, setFinalExpanded] = useState(false);
  const [milestoneScores, setMilestoneScores] = useState<Record<string, number>>({});
  const [questionStates, setQuestionStates] = useState<Record<number, 'answered' | 'not-answered' | 'marked' | 'marked-answered' | 'not-visited'>>({});
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [examDuration, setExamDuration] = useState(1200);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'extra-large'>('large');

  // Custom modal states to replace browser alert/confirm
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showLeaveWarningModal, setShowLeaveWarningModal] = useState(false);
  const [customAlertModal, setCustomAlertModal] = useState<{
    show: boolean;
    title: string;
    description: string;
    onClose?: () => void;
  }>({ show: false, title: '', description: '' });

  // Premium progress progression & certification states
  const [showModulePassOverlay, setShowModulePassOverlay] = useState(false);
  const [showModuleFailOverlay, setShowModuleFailOverlay] = useState(false);
  const [showFinalPassOverlay, setShowFinalPassOverlay] = useState(false);
  const [credentialId, setCredentialId] = useState<string>('');
  const [isCertViewerOpen, setIsCertViewerOpen] = useState(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  const handleUnlockCertificate = async () => {
    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/certifications/paths/${slug}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to initiate activation order');
        setIsUnlocking(false);
        return;
      }

      if (data.alreadyActive) {
        setIsPaid(true);
        setIsUnlocking(false);
        return;
      }

      if (typeof window !== 'undefined' && !(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const options = {
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'SARTHI',
        description: `Certificate Activation — ${pathData.title}`,
        order_id: data.orderId,
        prefill: {
          name: user?.name || data.user?.name || '',
          email: user?.email || data.user?.email || '',
        },
        theme: { color: '#0f172a' },
        handler: async (response: any) => {
          toast.info('Payment received! Verifying certificate activation with server...');
          try {
            await fetch('/api/certifications/verify-activation-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                verificationId: data.certificateId || credentialId
              })
            });
          } catch (e) {
            console.error('Client verification endpoint call error:', e);
          }

          // Poll server status to confirm status === 'VALID' before updating UI
          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            try {
              const checkRes = await fetch(`/api/certifications/paths/${slug}/progress`);
              const checkData = await checkRes.json();
              if (checkData.isPaid) {
                clearInterval(pollInterval);
                setIsPaid(true);
                playSuccessSound();
                toast.success('🎓 Certificate activated successfully!');
                confetti({
                  particleCount: 150,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ['#E5A93B', '#10B981', '#3B82F6']
                });
              }
            } catch (err) {}
            if (attempts >= 15) {
              clearInterval(pollInterval);
              toast.error('Payment confirmation pending. Please refresh in a moment.');
            }
          }, 2000);
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error initializing payment checkout');
    } finally {
      setIsUnlocking(false);
    }
  };

  useEffect(() => {
    if (isAllPassed) {
      playSuccessSound();
      const duration = 4 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E5A93B', '#10B981', '#3B82F6']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E5A93B', '#10B981', '#3B82F6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isAllPassed]);

  // Load progress and scores from database or localStorage
  useEffect(() => {
    if (user) {
      fetch(`/api/certifications/paths/${slug}/progress`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            if (data.milestoneScores) {
              setMilestoneScores(data.milestoneScores);
            }
            if (data.passedMilestones) {
              const mapped: Record<number, boolean> = {};
              Object.entries(data.passedMilestones).forEach(([k, v]) => {
                mapped[parseInt(k)] = !!v;
              });
              setPassedMilestones(mapped);
            }
            if (data.credentialId) {
              setCredentialId(data.credentialId);
            }
            if (data.isPaid !== undefined) {
              setIsPaid(data.isPaid);
            }
          }
        })
        .catch(err => console.error("Error loading progress from API:", err));
    } else {
      if (typeof window !== 'undefined') {
        const savedScores = localStorage.getItem(`scores_${slug}`);
        if (savedScores) {
          try {
            setMilestoneScores(JSON.parse(savedScores));
          } catch (e) { }
        }
        const savedProgress = localStorage.getItem(`progress_${slug}`);
        if (savedProgress) {
          try {
            setPassedMilestones(JSON.parse(savedProgress));
          } catch (e) { }
        }
      }
    }
  }, [user, slug]);

  // Persist when changed to localStorage as backup
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(milestoneScores).length > 0) {
      localStorage.setItem(`scores_${slug}`, JSON.stringify(milestoneScores));
    }
  }, [milestoneScores, slug]);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(passedMilestones).length > 0) {
      localStorage.setItem(`progress_${slug}`, JSON.stringify(passedMilestones));
    }
  }, [passedMilestones, slug]);

  useEffect(() => {
    if (assessmentActive) {
      document.body.classList.add('exam-focus-mode');
    } else {
      document.body.classList.remove('exam-focus-mode');
    }
    return () => {
      document.body.classList.remove('exam-focus-mode');
    };
  }, [assessmentActive]);

  const assessmentQuestions = useMemo(() => {
    let list: any[] = [];
    if (slug === 'fullstack-mastery') {
      switch (assessmentPath) {
        case 'basic':
          list = getWebDevQuestions('web-foundations');
          break;
        case 'intermediate':
          list = getWebDevQuestions('frontend-frameworks');
          break;
        case 'advanced':
          list = getWebDevQuestions('backend-architecture');
          break;
        case 'realworld':
          list = getWebDevQuestions('databases-devops');
          break;
        case 'final':
          list = getWebDevQuestions('final-assessment');
          break;
        default:
          list = getWebDevQuestions('web-foundations');
          break;
      }
      return assessmentPath === 'final' ? list.slice(0, 40) : list.slice(0, 20);
    }

    if (slug === 'advanced-excel-certification-exam') {
      switch (assessmentPath) {
        case 'basic':
          list = (advancedExcelQuestions as any).cleaning || [];
          break;
        case 'intermediate':
          list = (advancedExcelQuestions as any).lookups || [];
          break;
        case 'advanced':
          list = (advancedExcelQuestions as any).model || [];
          break;
        case 'realworld':
          list = (advancedExcelQuestions as any).dashboards || [];
          break;
        case 'final':
          list = [...((advancedExcelQuestions as any).forecasting || []), ...((advancedExcelQuestions as any).final || [])];
          break;
        default:
          list = (advancedExcelQuestions as any).cleaning || [];
          break;
      }
      return list;
    }

    switch (assessmentPath) {
      case 'basic':
        list = pythonEasyQuestions.filter(q => q.type === 'mcq');
        break;
      case 'intermediate':
        list = pythonMediumQuestions.filter(q => q.type === 'mcq');
        break;
      case 'advanced':
        list = pythonHardQuestions.filter(q => q.type === 'mcq' || (q as any).options);
        break;
      case 'realworld':
        list = pythonRealWorldQuestions.filter(q => q.type === 'mcq');
        break;
      default:
        list = pythonEasyQuestions.filter(q => q.type === 'mcq');
        break;
    }

    // Dynamic set selection if multiple sets exist (group by section containing set or variant)
    const setGroups = new Map<string, any[]>();
    list.forEach(q => {
      const sec = q.section || '';
      if (/set\s*[a-z0-9]|variant\s*[a-z0-9]/i.test(sec)) {
        const normalizedSec = sec.trim();
        if (!setGroups.has(normalizedSec)) {
          setGroups.set(normalizedSec, []);
        }
        setGroups.get(normalizedSec)!.push(q);
      }
    });

    if (setGroups.size > 1) {
      const keys = Array.from(setGroups.keys());
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      list = setGroups.get(randomKey)!;
    }

    // Fisher-Yates shuffle the questions
    const shuffledList = [...list];
    for (let i = shuffledList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
    }

    const limit = (slug === 'fullstack-mastery' && assessmentPath === 'final') ? 40 : 20;
    const slicedList = shuffledList.slice(0, limit);

    // Shuffle options for each question, adjusting correct index mapping
    return slicedList.map(q => {
      if (!q.options || q.options.length === 0) return q;

      const correctIdx = q.correctAnswer.charCodeAt(0) - 65;
      const correctText = q.options[correctIdx];

      const shuffledOpts = [...q.options];
      for (let i = shuffledOpts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOpts[i], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[i]];
      }

      const newCorrectIdx = shuffledOpts.indexOf(correctText);
      const newCorrectAnswer = newCorrectIdx !== -1 ? String.fromCharCode(65 + newCorrectIdx) : q.correctAnswer;

      return {
        ...q,
        options: shuffledOpts,
        correctAnswer: newCorrectAnswer
      };
    });
  }, [assessmentPath, slug, assessmentActive, assessmentAttempt]);

  // Load saved CBT progress if any
  useEffect(() => {
    if (assessmentActive && !assessmentSubmitted) {
      const saved = localStorage.getItem(`cbt_progress_${slug}_${assessmentPath}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.answers) setAssessmentAnswers(parsed.answers);
          if (parsed.states) setQuestionStates(parsed.states);
          if (parsed.timeLeft) setAssessmentTimeLeft(parsed.timeLeft);
          if (parsed.idx !== undefined) setAssessmentQuestionIdx(parsed.idx);
        } catch (e) { }
      }
    }
  }, [assessmentActive, assessmentPath, slug]);

  // Auto-save every 10 seconds to localStorage
  useEffect(() => {
    if (assessmentActive && !assessmentSubmitted) {
      const interval = setInterval(() => {
        localStorage.setItem(`cbt_progress_${slug}_${assessmentPath}`, JSON.stringify({
          answers: assessmentAnswers,
          states: questionStates,
          timeLeft: assessmentTimeLeft,
          idx: assessmentQuestionIdx
        }));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [assessmentActive, assessmentSubmitted, assessmentAnswers, questionStates, assessmentTimeLeft, assessmentQuestionIdx, slug, assessmentPath]);

  // Clean local storage upon submission
  useEffect(() => {
    if (assessmentSubmitted) {
      localStorage.removeItem(`cbt_progress_${slug}_${assessmentPath}`);
    }
  }, [assessmentSubmitted, slug, assessmentPath]);

  // Navigation handlers
  const handleSaveAndNext = () => {
    const currentQuestion = assessmentQuestions[assessmentQuestionIdx];
    const hasAnswer = currentQuestion && assessmentAnswers[currentQuestion.id];
    setQuestionStates(prev => ({
      ...prev,
      [assessmentQuestionIdx]: hasAnswer ? 'answered' : 'not-answered'
    }));

    if (assessmentQuestionIdx < assessmentQuestions.length - 1) {
      const nextIdx = assessmentQuestionIdx + 1;
      setAssessmentQuestionIdx(nextIdx);
      setQuestionStates(prev => {
        if (!prev[nextIdx] || prev[nextIdx] === 'not-visited') {
          return { ...prev, [nextIdx]: 'not-answered' };
        }
        return prev;
      });
    } else {
      setShowSubmitConfirmModal(true);
    }
  };

  const handleClearResponse = () => {
    const currentQuestion = assessmentQuestions[assessmentQuestionIdx];
    if (currentQuestion) {
      setAssessmentAnswers(prev => {
        const copy = { ...prev };
        delete copy[currentQuestion.id];
        return copy;
      });
      setQuestionStates(prev => ({
        ...prev,
        [assessmentQuestionIdx]: 'not-answered'
      }));
    }
  };

  const handleMarkForReviewAndNext = () => {
    const currentQuestion = assessmentQuestions[assessmentQuestionIdx];
    const hasAnswer = currentQuestion && assessmentAnswers[currentQuestion.id];
    setQuestionStates(prev => ({
      ...prev,
      [assessmentQuestionIdx]: hasAnswer ? 'marked-answered' : 'marked'
    }));

    if (assessmentQuestionIdx < assessmentQuestions.length - 1) {
      const nextIdx = assessmentQuestionIdx + 1;
      setAssessmentQuestionIdx(nextIdx);
      setQuestionStates(prev => {
        if (!prev[nextIdx] || prev[nextIdx] === 'not-visited') {
          return { ...prev, [nextIdx]: 'not-answered' };
        }
        return prev;
      });
    } else {
      setShowSubmitConfirmModal(true);
    }
  };

  const handlePrevQuestion = () => {
    if (assessmentQuestionIdx > 0) {
      const prevIdx = assessmentQuestionIdx - 1;
      setAssessmentQuestionIdx(prevIdx);
      setQuestionStates(prev => {
        if (!prev[prevIdx] || prev[prevIdx] === 'not-visited') {
          return { ...prev, [prevIdx]: 'not-answered' };
        }
        return prev;
      });
    }
  };

  // Keyboard controls - runs when index/answers change
  useEffect(() => {
    if (!assessmentActive || assessmentSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // 1-4 option selection
      if (['1', '2', '3', '4'].includes(e.key)) {
        const currentQuestion = assessmentQuestions[assessmentQuestionIdx];
        if (currentQuestion) {
          const letter = ['A', 'B', 'C', 'D'][parseInt(e.key) - 1];
          setAssessmentAnswers(prev => ({ ...prev, [currentQuestion.id]: letter }));
        }
      }
      // N = Next Question
      else if (key === 'n') {
        if (assessmentQuestionIdx < assessmentQuestions.length - 1) {
          const nextIdx = assessmentQuestionIdx + 1;
          setAssessmentQuestionIdx(nextIdx);
          setQuestionStates(prev => {
            if (!prev[nextIdx] || prev[nextIdx] === 'not-visited') {
              return { ...prev, [nextIdx]: 'not-answered' };
            }
            return prev;
          });
        }
      }
      // P = Previous Question
      else if (key === 'p') {
        handlePrevQuestion();
      }
      // R = Mark For Review
      else if (key === 'r') {
        handleMarkForReviewAndNext();
      }
      // C = Clear Response
      else if (key === 'c') {
        handleClearResponse();
      }
      // S = Save & Next
      else if (key === 's') {
        handleSaveAndNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [assessmentActive, assessmentSubmitted, assessmentQuestionIdx, assessmentQuestions, assessmentAnswers]);

  // Full screen mode & blur anti-cheats - runs once when active status changes
  useEffect(() => {
    if (!assessmentActive || assessmentSubmitted) return;

    // Full screen request
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }

    const handleVisibility = () => {
      if (document.hidden) {
        setCheatWarnings(prev => {
          const count = prev + 1;
          setCustomAlertModal({
            show: true,
            title: "[ANTI-CHEAT WARNING]",
            description: `Tab switch detected! The examination system forbids switching tabs. Incident has been logged. Warning ${count}/3.`,
            onClose: () => {
              if (count >= 3) {
                setCustomAlertModal({
                  show: true,
                  title: "ASSESSMENT TERMINATED",
                  description: "Multiple security violations detected (tab switches). Your session is closed.",
                  onClose: () => {
                    setAssessmentActive(false);
                    setAssessmentSubmitted(false);
                  }
                });
              }
            }
          });
          return count;
        });
      }
    };

    const handleBlur = () => {
      setCheatWarnings(prev => {
        const count = prev + 1;
        setCustomAlertModal({
          show: true,
          title: "[ANTI-CHEAT WARNING]",
          description: `Window focus lost! Focus must remain on the examination screen. Incident has been logged. Warning ${count}/3.`,
          onClose: () => {
            if (count >= 3) {
              setCustomAlertModal({
                show: true,
                title: "ASSESSMENT TERMINATED",
                description: "Multiple security violations detected (window blur). Your session is closed.",
                onClose: () => {
                  setAssessmentActive(false);
                  setAssessmentSubmitted(false);
                }
              });
            }
          }
        });
        return count;
      });
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [assessmentActive, assessmentSubmitted]);

  // Exit fullscreen when assessment is fully deactivated
  useEffect(() => {
    if (!assessmentActive) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
    }
  }, [assessmentActive]);

  // Timer logic for inline assessment
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (assessmentActive && assessmentTimeLeft > 0 && !assessmentSubmitted) {
      timer = setInterval(() => {
        setAssessmentTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [assessmentActive, assessmentTimeLeft, assessmentSubmitted]);

  const submitAssessment = async () => {
    let correct = 0;
    assessmentQuestions.forEach(q => {
      if (assessmentAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    setCorrectCount(correct);
    setTimeTakenSeconds(examDuration - assessmentTimeLeft);
    const pct = Math.round((correct / assessmentQuestions.length) * 100);
    setAssessmentScore(pct);
    const pass = pct >= 80;
    setAssessmentPassed(pass);
    setAssessmentSubmitted(true);

    // Save milestone progress and scores
    let currentIdx = 0;
    if (assessmentPath === 'basic') currentIdx = 0;
    else if (assessmentPath === 'intermediate') currentIdx = 1;
    else if (assessmentPath === 'advanced') currentIdx = 2;
    else if (assessmentPath === 'realworld') currentIdx = 3;
    else if (assessmentPath === 'final') currentIdx = 4;
    const msId = `ms-${currentIdx + 1}`;

    // POST progression to database
    try {
      await fetch(`/api/certifications/paths/${slug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: assessmentPath,
          score: correct,
          percentage: pct,
          passed: pass
        })
      });
    } catch (err) {
      console.error("Failed to save progress in DB:", err);
    }

    setMilestoneScores(prev => ({
      ...prev,
      [msId]: Math.max(prev[msId] || 0, pct)
    }));

    if (pass) {
      setPassedMilestones(prev => ({ ...prev, [currentIdx]: true }));

      // Check if this is the final assessment
      const isFinal = assessmentPath === 'final' || (slug === 'python-professional-developer' && currentIdx === 3);
      if (isFinal) {
        setShowFinalPassOverlay(true);
        // Automatic Certificate Issuance on Final Milestone
        try {
          const res = await fetch(`/api/certifications/paths/${slug}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              allModulesCompleted: true,
              allAssignmentsCompleted: true,
              finalAssessmentPassed: true,
              courseTitle: pathData.title
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.credentialId) {
              setCredentialId(data.credentialId);
            }
          }
        } catch (err) {
          console.error("Failed to issue certificate:", err);
        }
      } else {
        setShowModulePassOverlay(true);
      }
    } else {
      setShowModuleFailOverlay(true);
    }
  };

  const activeModule = pathData.modules[activeModuleIdx];
  const activeLesson = activeModule.lessons[activeLessonIdx];

  // Mouse movement effect for background orbs
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const orbs = document.querySelectorAll<HTMLElement>('.certifications-orb');
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sync playground code when switching lessons
  useEffect(() => {
    if (activeLesson && activeLesson.type === 'playground') {
      setCode(activeLesson.codeSnippet || '');
      setConsoleOutput('Click "Run Code" to compile.');
    }
  }, [activeLessonIdx, activeModuleIdx, activeLesson]);

  const toggleMilestone = (id: string) => {
    setOpenMilestones(prev => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        next[key] = key === id ? !prev[key] : false;
      });
      return next;
    });
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput('Running compiler in environment container...');

    setTimeout(() => {
      setIsRunningCode(false);
      if (activeLesson.expectedOutput) {
        setConsoleOutput(`$ python execution_sandbox.py\n\n${activeLesson.expectedOutput}`);
        // Complete the playground lesson
        setCompletedLessons(prev => ({ ...prev, [activeLesson.id]: true }));
      } else {
        setConsoleOutput('$ node index.js\n\nExecution successful.\nOutputs match parameters.');
        setCompletedLessons(prev => ({ ...prev, [activeLesson.id]: true }));
      }

      // Flash sparkling notification
      confetti({
        particleCount: 20,
        spread: 40,
        colors: ['#10B981', '#34D399', '#059669'],
        origin: { y: 0.8 }
      });
    }, 1500);
  };

  const handleSelectLesson = (modIdx: number, lesIdx: number) => {
    setActiveModuleIdx(modIdx);
    setActiveLessonIdx(lesIdx);
    setViewingQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSelectQuiz = (modIdx: number) => {
    setActiveModuleIdx(modIdx);
    setViewingQuiz(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
    setShowExplanation({});
  };

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    const quizQuestions = activeModule.quiz;
    let correctCount = 0;

    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIdx) {
        correctCount++;
      }
    });

    const scorePercent = (correctCount / quizQuestions.length) * 100;
    const passed = scorePercent >= 80;

    setQuizSubmitted(true);
    setQuizPassed(passed);

    if (passed) {
      setCompletedModules(prev => ({ ...prev, [activeModule.id]: true }));

      // Huge beautiful confetti explosion
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else {
      // Small vibration alert
      confetti({
        particleCount: 5,
        spread: 10,
        colors: ['#EF4444'],
        origin: { y: 0.6 }
      });
    }
  };

  const isModuleLocked = (modIdx: number): boolean => {
    if (modIdx === 0) return false;
    const prevModule = pathData.modules[modIdx - 1];
    return !completedModules[prevModule.id];
  };

  const milestones = useMemo(() => {
    if (slug === 'fullstack-mastery') {
      return [
        {
          id: 'ms-1',
          title: 'Web Foundations UI',
          durationHours: 30,
          goal: 'Master HTML5, CSS3, modern layouts, and browser performance.',
          startModule: 1,
          endModule: 1,
          projectTitle: 'Highly Accessible Semantic Page',
          projectFeatures: ['HTML5 semantic layout', 'Advanced CSS Grid/Flexbox', 'ARIA attributes toggling', 'Performance score > 90']
        },
        {
          id: 'ms-2',
          title: 'Frontend Frameworks',
          durationHours: 35,
          goal: 'Build single-page web apps with robust state management and component hooks.',
          startModule: 2,
          endModule: 2,
          projectTitle: 'Dynamic State-Driven Dashboard',
          projectFeatures: ['React component trees', 'Global Context configurations', 'Custom performance hooks', 'Optimized re-renders']
        },
        {
          id: 'ms-3',
          title: 'Backend Architecture APIs',
          durationHours: 35,
          goal: 'Design stateless REST APIs and microservice patterns.',
          startModule: 3,
          endModule: 3,
          projectTitle: 'Enterprise API REST Gateway',
          projectFeatures: ['Express/Next API routes', 'Middleware validation', 'JWT session authentication', 'HTTP status code mapping']
        },
        {
          id: 'ms-4',
          title: 'Databases DevOps',
          durationHours: 40,
          goal: 'Design optimized relational/NoSQL schemas and orchestrate Docker environments.',
          startModule: 4,
          endModule: 4,
          projectTitle: 'Dockerized Schema Engine',
          projectFeatures: ['SQL JOIN queries and indexes', 'NoSQL scaling architectures', 'Multi-container Docker Compose', 'Kubernetes pod readiness']
        }
      ];
    }
    if (slug === 'ias-preparation') {
      return [
        {
          id: 'ms-1',
          title: 'General Studies & CSAT Foundations',
          durationHours: 30,
          goal: 'Master Indian Polity, Ancient/Modern History, Geography, and CSAT logical reasoning.',
          startModule: 1,
          endModule: 1,
          projectTitle: 'Prelims Simulation & Aptitude Check',
          projectFeatures: ['Constitutional Articles review', 'Vasco da Gama to Independence timeline', 'Comprehension & CSAT Math', 'Elimination tactics simulation']
        },
        {
          id: 'ms-2',
          title: 'GS Mains Writing & Analysis',
          durationHours: 35,
          goal: 'Structure high-scoring GS Mains answers and analyze ethical case studies.',
          startModule: 2,
          endModule: 2,
          projectTitle: 'GS Mains Answer Writing Portfolio',
          projectFeatures: ['Three-part answer template', 'Socio-economic indicators check', 'Internal security frameworks', 'Ethics moral dilemmas analysis']
        },
        {
          id: 'ms-3',
          title: 'Optional Subject & Essay Mastery',
          durationHours: 35,
          goal: 'Develop deep subject expertise and write high-scoring essay drafts.',
          startModule: 3,
          endModule: 3,
          projectTitle: 'Optional Thesis & Philosophical Essay',
          projectFeatures: ['Depth curriculum mapping', 'Philosophical argument flow', 'Quotes and data citations', 'Coherent transitions layout']
        },
        {
          id: 'ms-4',
          title: 'Interview & Personality Simulation',
          durationHours: 20,
          goal: 'Build administrative attitude, confidence, and DAF analysis readiness.',
          startModule: 4,
          endModule: 4,
          projectTitle: 'DAF Interview & Current Debates Prep',
          projectFeatures: ['Detailed Application Form mapping', 'Balanced debates framing', 'Body language coaching', 'Mock board response simulator']
        }
      ];
    }
    if (slug === 'advanced-excel-certification-exam') {
      return [
        {
          id: 'ms-1',
          title: 'Data Cleaning & Formatting',
          durationHours: 2,
          goal: 'Master Excel data cleaning methods, formula trim functions, and validation rules.',
          startModule: 1,
          endModule: 1,
          projectTitle: 'Customer CRM Data Normalization',
          projectFeatures: ['Formula TRIMS and PROPER formatting', 'Remove duplicates and dirty values', 'Custom regex validations', 'Text parsing via Flash Fill']
        },
        {
          id: 'ms-2',
          title: 'Advanced Lookup Functions',
          durationHours: 2,
          goal: 'Master complex array searches using XLOOKUP, INDEX & MATCH bidirectional lookups.',
          startModule: 2,
          endModule: 2,
          projectTitle: 'Dynamic Inventory Search Dashboard',
          projectFeatures: ['INDEX & MATCH bidirectional search', 'XLOOKUP default fallback logic', 'Data validation lists', 'Horizontal offsets lookups']
        },
        {
          id: 'ms-3',
          title: 'Power Pivot Data Models',
          durationHours: 2,
          goal: 'Build relational star schemas directly in Excel using Power Pivot.',
          startModule: 3,
          endModule: 3,
          projectTitle: 'Sales Relations Model',
          projectFeatures: ['Transactions table connection', 'Star schemas mapping', 'DAX Measures calculation', 'Multi-source tables integration']
        },
        {
          id: 'ms-4',
          title: 'Interactive MIS Dashboards',
          durationHours: 2,
          goal: 'Design premium dynamic dashboards with interconnected slicers.',
          startModule: 4,
          endModule: 4,
          projectTitle: 'Interactive Monthly Business Review (MBR)',
          projectFeatures: ['Pivot Table summaries', 'Connected Slicers & Timelines', 'Conditional Formatting metrics', 'KPI status cards formatting']
        }
      ];
    }
    return PYTHON_MILESTONES;
  }, [slug]);

  const totalMilestones = milestones.length;
  const totalMinutes = pathData.modules.reduce((sum, mod) => sum + mod.lessons.reduce((acc, l) => acc + l.duration, 0), 0);
  const estimatedHours = Math.max(1, Math.round(totalMinutes / 60));
  const milestoneGroups = useMemo(
    () => milestones.map((milestone) => ({
      ...milestone,
      modules: pathData.modules.slice(milestone.startModule - 1, milestone.endModule)
    })),
    [pathData.modules, milestones]
  ); const targetThreshold = 80;
  const trackerMilestones = useMemo(() => {
    return milestones.map((m) => {
      const isAttempted = milestoneScores[m.id] !== undefined && milestoneScores[m.id] > 0;
      const highestScore = milestoneScores[m.id] || 0;
      return {
        id: m.id,
        name: m.title,
        isAttempted,
        highestScore
      };
    });
  }, [milestoneScores, milestones]);

  const currentAverage = useMemo(() => {
    const sum = trackerMilestones.reduce((acc, m) => acc + m.highestScore, 0);
    return Math.round(sum / totalMilestones);
  }, [trackerMilestones, totalMilestones]);

  const isEligible = currentAverage >= targetThreshold;

  if (isLearningMode && activeModule) {
    const currentLesson = activeModule.lessons[activeLessonIdx] || activeModule.lessons[0] || { id: 'error', title: 'Lesson', content: '', type: 'markdown' };

    return (
      <div className="min-h-screen bg-[#070b13] text-slate-100 [font-family:Inter,Geist,system-ui,sans-serif] flex flex-col">
        {/* Sleek Immersive Workspace Header */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0c1220]/90 backdrop-blur px-6 flex items-center justify-between z-20 flex-shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLearningMode(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold border border-white/10 cursor-pointer"
            >
              ← Back to Roadmap
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">{slug === 'fullstack-mastery' ? 'Full Stack Developer Path' : slug === 'ias-preparation' ? 'UPSC IAS Path' : 'Python Developer Path'}</span>
              <h1 className="text-sm font-bold text-white leading-tight truncate max-w-[280px] md:max-w-md">
                {activeModule.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Immersive Workspace Container */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar: Lessons Navigation List */}
          <aside className="w-[300px] border-r border-white/[0.08] bg-[#080d16] flex flex-col flex-shrink-0 select-none">
            <div className="p-5 border-b border-white/[0.08] bg-[#0c1220]/45">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Module Syllabus</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {activeModule.lessons.length} Units
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {activeModule.lessons.map((lesson, lessonIdx) => {
                const isLessonActive = activeLessonIdx === lessonIdx && !viewingQuiz;
                const isLessonCompleted = !!completedLessons[lesson.id];

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIdx(lessonIdx);
                      setViewingQuiz(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all border cursor-pointer ${isLessonActive
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-white'
                        : 'hover:bg-white/[0.02] border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[11.5px] text-slate-550 pt-0.5">
                        {(lessonIdx + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${isLessonActive ? 'text-white' : 'text-slate-300'}`}>
                          {lesson.title.replace(/^\d+\.\s*/, '')}
                        </p>
                        <p className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">
                          {lesson.type === 'playground' ? '💻 Code Sandbox' : '📖 Theory Concept'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      {isLessonCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })}

              <button
                onClick={() => setViewingQuiz(true)}
                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all border mt-4 cursor-pointer ${viewingQuiz
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                    : 'hover:bg-white/[0.02] border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className={`text-xs font-bold ${viewingQuiz ? 'text-white' : 'text-slate-300'}`}>
                      Checkpoint Assessment
                    </p>
                    <p className="text-[9.5px] font-semibold text-slate-500 uppercase mt-0.5">
                      Module Gate Evaluation
                    </p>
                  </div>
                </div>

                <div className="flex items-center flex-shrink-0 ml-3">
                  {completedModules[activeModule.id] ? (
                    <Award className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-550" />
                  )}
                </div>
              </button>
            </div>
          </aside>

          {/* Right Workspace Side: Lesson / Quiz renderer */}
          <main className="flex-1 flex overflow-hidden bg-[#090d16]">
            {viewingQuiz ? (
              /* Quiz checkpoint layout */
              <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-3xl mx-auto space-y-8 text-left">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                    <Award size={11} className="text-emerald-400" /> Module Checkpoint Gate
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {activeModule.title} Checkpoint
                  </h2>
                  <p className="text-xs font-semibold text-slate-400">
                    {quizSubmitted ? "Evaluation Results" : "Submit checkpoint verification to lock progress."}
                  </p>
                </div>

                {quizSubmitted ? (
                  (() => {
                    const totalQ = activeModule.quiz.length;
                    let correctQ = 0;
                    activeModule.quiz.forEach((q, idx) => {
                      if (quizAnswers[idx] === q.correctIdx) {
                        correctQ++;
                      }
                    });
                    const pct = Math.round((correctQ / totalQ) * 100);
                    const isPassed = pct >= 80;

                    return (
                      <div className="border border-[#E5E7EB] rounded-3xl p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.03)] text-left bg-[#F8FAFC] text-slate-800 font-sans space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#E5E7EB]">
                          <div>
                            <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
                              Checkpoint Scorecard
                            </h3>
                            <p className="text-[10px] font-bold uppercase mt-0.5 text-slate-500">
                              Gate Results
                            </p>
                          </div>

                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-wider shadow-sm ${isPassed
                              ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            }`}>
                            {isPassed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>✓ Checkpoint Passed</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Failed (Required &gt;= 80%)</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Main Grid Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Score Circle */}
                          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="56"
                                  cy="56"
                                  r="40"
                                  className="stroke-slate-100"
                                  strokeWidth="8"
                                  fill="transparent"
                                />
                                <circle
                                  cx="56"
                                  cy="56"
                                  r="40"
                                  className={isPassed ? 'stroke-[#16A34A]' : 'stroke-rose-500'}
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 40}
                                  strokeDashoffset={2 * Math.PI * 40 - (pct / 100) * (2 * Math.PI * 40)}
                                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-900">{pct}%</span>
                                <span className="text-[9px] uppercase font-bold text-slate-405">Score</span>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white text-left flex flex-col justify-between shadow-sm">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Questions</span>
                              <span className="text-xl font-black mt-1 text-slate-800">{totalQ}</span>
                            </div>
                            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white text-left flex flex-col justify-between shadow-sm">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Correct Qs</span>
                              <span className="text-xl font-black mt-1 text-[#16A34A]">{correctQ}</span>
                            </div>
                          </div>
                        </div>

                        {/* Allowed Feedback Section / Recommendations */}
                        <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Performance Insights</h4>
                          {isPassed ? (
                            <p className="text-sm font-semibold text-slate-650 leading-relaxed">
                              ✓ Excellent job! You have demonstrated key competencies for this module. You are ready to proceed.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-slate-655 leading-relaxed">
                                • We recommend reviewing the following learning materials before retaking the checkpoint:
                              </p>
                              <ul className="list-disc pl-5 text-xs font-bold text-slate-500 space-y-1.5">
                                <li>Review Module Theory & Concepts</li>
                                <li>Practice Coding Exercises in Playground</li>
                                <li>Retake Checkpoint Assessment</li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* CTA Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                          {!isPassed && (
                            <button
                              onClick={() => {
                                setQuizSubmitted(false);
                                setQuizAnswers({});
                              }}
                              className="px-5 py-3 rounded-xl font-bold bg-[#2563EB] hover:bg-blue-700 text-white text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Retry Checkpoint
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setViewingQuiz(false);
                            }}
                            className="px-5 py-3 rounded-xl font-bold bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95"
                          >
                            Return To Syllabus
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    <div className="space-y-6">
                      {activeModule.quiz.map((q, qIdx) => {
                        const selectedIdx = quizAnswers[qIdx];

                        return (
                          <div key={qIdx} className="p-6 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
                            <p className="text-sm font-bold text-slate-150">
                              {qIdx + 1}. {q.question}
                            </p>

                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((option, optIdx) => {
                                const isSelected = selectedIdx === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleOptionSelect(qIdx, optIdx)}
                                    className={`w-full text-left p-3.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${isSelected
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                        : 'bg-white/[0.02] border-white/[0.08] text-slate-350 hover:bg-white/[0.04]'
                                      }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/[0.08]">
                      <button
                        onClick={submitQuiz}
                        className="px-6 h-[46px] rounded-xl font-bold bg-[#1fb35a] hover:bg-[#1a9c4e] text-white text-xs cursor-pointer hover:shadow-[0_4px_12px_rgba(31,179,90,0.2)] transition-all"
                      >
                        Submit Checkpoint
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Lesson + Compiler split layout */
              <div className="flex-1 flex overflow-hidden">
                {/* Scrollable Lesson Guide Column */}
                <div className={`flex-1 overflow-y-auto p-8 md:p-12 text-left ${currentLesson.type === 'playground' ? 'max-w-2xl border-r border-white/[0.08]' : 'max-w-3xl mx-auto'}`}>
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Unit {activeLessonIdx + 1} of {activeModule.lessons.length}
                    </span>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {currentLesson.title}
                    </h2>

                    <div className="prose prose-invert max-w-none text-slate-350 text-xs md:text-sm leading-relaxed font-semibold space-y-4 pt-4 border-t border-white/[0.08]">
                      {currentLesson.content.split('\n\n').map((para, idx) => {
                        if (para.startsWith('```')) {
                          const lines = para.replace(/```[a-z]*/g, '').trim();
                          return (
                            <pre key={idx} className="bg-[#0b1329] border border-white/[0.08] p-4 rounded-xl font-mono text-xs overflow-x-auto text-emerald-300 select-all">
                              <code>{lines}</code>
                            </pre>
                          );
                        }
                        return <p key={idx}>{para}</p>;
                      })}
                    </div>

                    <div className="pt-8 border-t border-white/[0.08]">
                      {currentLesson.type !== 'playground' ? (
                        <button
                          onClick={() => {
                            setCompletedLessons(prev => ({ ...prev, [currentLesson.id]: true }));
                            if (activeLessonIdx < activeModule.lessons.length - 1) {
                              setActiveLessonIdx(prev => prev + 1);
                            } else {
                              setViewingQuiz(true);
                            }
                          }}
                          className="px-6 h-[46px] rounded-xl font-bold bg-[#1fb35a] hover:bg-[#1a9c4e] text-white text-xs cursor-pointer hover:shadow-[0_4px_12px_rgba(31,179,90,0.2)] transition-all flex items-center gap-2"
                        >
                          Complete & Continue →
                        </button>
                      ) : (
                        <div className="bg-slate-900/60 p-4 border border-white/[0.05] rounded-xl text-slate-405 text-xs font-semibold leading-relaxed">
                          💡 Complete compilation challenge inside the Interactive Sandbox panel.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side Compiler Playground */}
                {currentLesson.type === 'playground' && (
                  <div className="w-[460px] lg:w-[540px] bg-[#0c1220] flex flex-col flex-shrink-0 overflow-hidden relative">
                    <div className="h-11 border-b border-white/[0.08] px-4 flex items-center justify-between bg-black/15 select-none">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Terminal size={11} className="text-emerald-400" /> Interactive Compiler
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">main.py</span>
                    </div>

                    <div className="flex-1 relative flex">
                      <div className="w-10 bg-black/10 border-r border-white/[0.04] pt-4 font-mono text-[11px] text-slate-600 text-right pr-2 select-none space-y-1">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-transparent p-4 font-mono text-[12px] text-emerald-350 outline-none resize-none leading-relaxed h-full"
                        spellCheck="false"
                      />
                    </div>

                    {/* Console log outputs */}
                    <div className="h-[185px] border-t border-white/[0.08] bg-[#070b13] flex flex-col">
                      <div className="h-8 px-4 border-b border-white/[0.04] flex items-center bg-black/5 select-none">
                        <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">Output console logs</span>
                      </div>
                      <pre className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-slate-350 text-left bg-black/10 leading-relaxed">
                        {isRunningCode ? (
                          <span className="text-emerald-400 animate-pulse">Running compiler sandbox...</span>
                        ) : (
                          consoleOutput
                        )}
                      </pre>
                    </div>

                    <div className="h-[68px] border-t border-white/[0.08] px-5 bg-black/10 flex items-center justify-between select-none">
                      <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        className="px-5 h-[40px] rounded-lg font-bold bg-[#1fb35a] hover:bg-[#1a9c4e] text-white text-xs cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <RefreshCw size={12} className={isRunningCode ? 'animate-spin' : ''} />
                        Run Code
                      </button>

                      <button
                        disabled={!completedLessons[currentLesson.id]}
                        onClick={() => {
                          if (activeLessonIdx < activeModule.lessons.length - 1) {
                            setActiveLessonIdx(prev => prev + 1);
                          } else {
                            setViewingQuiz(true);
                          }
                        }}
                        className={`px-5 h-[40px] rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all ${completedLessons[currentLesson.id]
                            ? 'bg-white text-slate-900 hover:bg-slate-100'
                            : 'bg-white/5 text-slate-650 border border-white/5 cursor-not-allowed'
                          }`}
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 [font-family:Inter,Geist,system-ui,sans-serif] relative overflow-x-hidden zoom-30">
      {/* ── CINEMATIC FULL PAGE BACKGROUND SYSTEM ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[820px] z-0 pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f8fffc 0%, #f7fafc 40%, #f3f4f6 100%)'
        }}
      >
        {/* Layer 1: The tuned cinematic snake background image (hardware accelerated static layout) */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <img
            src={slug === 'fullstack-mastery'
              ? "https://cdn.pixabay.com/photo/2015/12/09/13/48/wordpress-1084758_1280.jpg"
              : slug === 'advanced-excel-certification-exam'
                ? "https://cdn.pixabay.com/photo/2016/10/26/12/48/excel-1771393_1280.jpg"
                : "/snake-bg.jpg"}
            alt="Cinematic Background"
            className="w-full h-full object-cover opacity-[0.25] pointer-events-none select-none"
            style={{
              filter: slug === 'fullstack-mastery'
                ? 'blur(0.5px) saturate(1.1) brightness(0.98)'
                : slug === 'advanced-excel-certification-exam'
                  ? 'blur(0.5px) saturate(1.05) brightness(1.02)'
                  : 'blur(0.8px) saturate(1.02) brightness(0.95) hue-rotate(-8deg) contrast(1.08)',
              objectPosition: slug === 'fullstack-mastery' ? '70% 30%' : slug === 'advanced-excel-certification-exam' ? 'center center' : '82% 40%',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)',
              willChange: 'transform'
            }}
            onError={(e) => {
              if (slug !== 'fullstack-mastery') {
                e.currentTarget.src = "https://pixabay.com/get/gbaa4dab72bdbfecefddea6619bb2dd003fc39842ae1104baa01b7072c9e9ac083779223c111f059c4fbc65ad4a01451032dd655c10f1a8add42c14c2dc900ddd_1920.jpg";
              }
            }}
          />
        </div>

        {/* Layer 2: Blended linear-gradient for side readability (matching summer camp 60/40 transparency) */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(90deg, rgba(248,250,252,0.8) 0%, rgba(248,250,252,0.7) 40%, rgba(248,250,252,0.4) 75%, rgba(248,250,252,0) 100%)'
          }}
        />

        {/* Layer 3: Cinematic interior vignette */}
        <div className="absolute inset-0 z-[2] shadow-[inset_0_0_220px_rgba(255,255,255,0.45)] pointer-events-none" />

        {/* Layer 4: Technical soft procedural grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000/[0.01]_1px,transparent_1px),linear-gradient(to_bottom,#000000/[0.01]_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-[0.2] z-[3]" />

        {/* Layer 5: Monochrome Noise Texture Layer */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('/noise.svg')] pointer-events-none mix-blend-overlay z-[4]" />

        {/* Layer 6: Subtle ambient glows to fill voids */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#34d399]/[0.05] blur-[120px] pointer-events-none z-[5]" />
        <div className="absolute top-[35%] left-[-15%] w-[35%] h-[35%] bg-[#34d399]/[0.02] blur-[130px] pointer-events-none z-[5]" />
      </div>

      {/* Subtle floating ambient particles inside the layout */}
      <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-[#34d399]/10 animate-pulse pointer-events-none" />
      <div className="absolute top-96 right-20 w-3.5 h-3.5 rounded-full bg-[#34d399]/10 pointer-events-none" />

      {/* Hero Section styled with clean Vercel and Raycast engineering aesthetics */}
      <section
        className="relative overflow-hidden text-slate-800 pt-[104px] pb-[68px] select-none flex items-center bg-transparent min-h-[60vh]"
      >
        <div className="relative max-w-[1380px] mx-auto px-8 z-10 w-full text-left pl-[24px]">
          <div className="max-w-[720px] space-y-5 relative z-10">
            {/* Radial Glow Behind Title */}
            <div
              className="absolute -inset-16 z-0 pointer-events-none rounded-full blur-[50px] opacity-75"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)'
              }}
            />

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/40 px-[18px] py-[8px] text-[10.5px] font-bold uppercase tracking-[0.16em] text-emerald-800 backdrop-blur-md shadow-sm relative z-10">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              Professional Certification Path
            </div>

            <h2 className="text-slate-900 tracking-[-0.045em] leading-[0.95] font-sans relative z-10" style={{ fontSize: '48px', fontWeight: 800 }}>
              {slug === 'fullstack-mastery' ? 'Full Stack Web Dev' : slug === 'ias-preparation' ? 'UPSC Civil Services' : slug === 'advanced-excel-certification-exam' ? 'Advanced Excel' : 'Python Development'}<br />
              <span
                className="text-transparent bg-clip-text font-black"
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Certification
              </span>
            </h2>

            <p className="text-[17px] md:text-[18px] leading-[1.8] text-slate-650 font-medium max-w-[620px] relative z-10">
              {slug === 'fullstack-mastery'
                ? 'Career-ready Web Development specialization with milestone-based progression, hands-on labs, real-world projects, and verified technical assessments.'
                : slug === 'ias-preparation'
                  ? 'Comprehensive Civil Services preparation pathway with milestone evaluations, essay writing modules, mock interview simulations, and verified assessment credentials.'
                  : slug === 'advanced-excel-certification-exam'
                    ? 'Career-ready Advanced Excel specialization with milestone-based progression, hands-on labs, real-world projects, and verified technical assessments.'
                    : 'Career-ready Python specialization with milestone-based progression, hands-on labs, real-world projects, and verified technical assessments.'}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2 relative z-10">
              <button
                onClick={() => {
                  if (!user) {
                    window.location.href = `/login?redirect=/certification-exams/paths/${slug}`;
                    return;
                  }
                  setHonorCodeChecked(false);
                  setShowHonorCodeModal(true);
                }}
                className="h-[52px] px-6 rounded-[14px] font-bold bg-[#1fb35a] hover:bg-[#1a9c4e] text-white hover:scale-[1.01] hover:-translate-y-0.5 active:scale-95 border border-[#1fb35a]/20 shadow-[0_8px_30px_rgba(31,179,90,0.2)] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Play size={15} fill="currentColor" className="group-hover:scale-105 transition-transform" />
                <span>Start Certification Pathway</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('curriculum-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-[52px] px-6 rounded-[14px] font-bold bg-white/85 border border-black/[0.08] text-slate-800 hover:bg-white/95 hover:scale-[1.01] hover:-translate-y-[1px] active:scale-95 transition-all duration-250 ease-out shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen size={15} />
                <span>View Exam Blueprint</span>
              </button>
            </div>

            {/* Emotional hook text */}
            <p className="text-[12.5px] font-semibold text-slate-500/80 tracking-wide pl-1 select-none pt-0.5 relative z-10">
              {slug === 'fullstack-mastery'
                ? 'Built for students who want production-ready Full Stack skills — '
                : slug === 'advanced-excel-certification-exam'
                  ? 'Built for students who want production-ready Advanced Excel skills — '
                  : 'Built for students who want production-ready Python skills — '}
              <span className="text-emerald-700/80 font-bold">not tutorial hell</span>.
            </p>

            {/* Premium GitHub-style Metadata Row */}
            <div className="flex flex-wrap items-center gap-[18px] pt-4 text-[13px] font-semibold text-slate-550 select-none relative z-10">
              <span className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                <Clock size={12} className="text-emerald-700/70" />
                5 Assessment Gates
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                <Shield size={12} className="text-emerald-700/70" />
                Strictly Proctored
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                <Award size={12} className="text-emerald-700/70" />
                Verified credential
              </span>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade divider transition overlay */}
        <div
          className="absolute inset-x-0 bottom-0 h-[100px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(248,250,252,0.85) 70%, #f8fafc 100%)'
          }}
        />
      </section>

      {/* ── ROADMAP CURRICULUM TIMELINE SECTION ── */}
      <div className="relative z-10 bg-transparent">
        {/* Navigation tabs overlay - Stripe/Linear Animated Design */}
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 pt-8 pb-2 relative">
          <div className="absolute top-0 inset-x-4 md:inset-x-6 h-px bg-slate-200/50" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6">
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-white/65 border border-white/80 rounded-2xl backdrop-blur-lg shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              {(['Milestones', 'Overview', 'Resources', 'Discussion'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-[18px] h-[44px] flex items-center justify-center text-[13px] font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer select-none rounded-xl ${isActive ? 'text-slate-950 font-bold' : 'text-slate-650 hover:text-slate-900'
                      }`}
                  >
                    <span className="relative z-10">{tab}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-xl bg-white/92 border border-white/95 shadow-[0_6px_20px_rgba(16,185,129,0.08)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Performance & Eligibility Tracker */}
            <div className="flex items-center gap-4 relative group py-2 px-1">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">AGGREGATE STANDING</span>
                <div className="flex items-center gap-3">
                  {/* Track (Background) */}
                  <div className="h-[3px] w-32 md:w-48 bg-slate-200 rounded-full relative cursor-pointer">
                    {/* Progress Fill */}
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${currentAverage}%` }}
                    />
                    {/* Threshold Marker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-[1px] h-2 bg-[#D4AF37] z-10"
                      style={{ left: `${targetThreshold}%` }}
                      title={`Threshold: ${targetThreshold}%`}
                    />
                  </div>
                  {/* The Label */}
                  <span className={`text-[10px] font-black tracking-wider font-mono uppercase select-none transition-colors ${isEligible ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                    AVG: {currentAverage}% / {targetThreshold}% REQ
                  </span>
                </div>
              </div>

              {/* Dynamic Hover Tooltip (Breakdown) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1.5 border-b border-slate-100">Milestone Breakdown</h4>
                <div className="space-y-2 mb-3">
                  {trackerMilestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs text-slate-650 font-semibold">
                      <span className="truncate max-w-[180px]">{m.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-mono">{m.isAttempted ? `${m.highestScore}%` : '--'}</span>
                        <span>{m.isAttempted ? (m.highestScore >= targetThreshold ? '✅' : '⚠️') : '🔒'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tight border-t border-slate-100 pt-2.5 block leading-relaxed ${isEligible ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                  {isEligible
                    ? `Requirement met. Final certification gate unlocked.`
                    : `Increase scores in marked modules to meet the ${targetThreshold}% requirement.`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <main id="curriculum-anchor" className="max-w-[1320px] mx-auto px-4 md:px-6 mt-16 pb-24 bg-transparent">

          {/* Curricular Introduction details */}
          {activeTab === 'Milestones' && (
            <div className="mb-8 text-left">
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Certification Roadmap
              </h3>
<p className="mt-3 text-md text-slate-600 max-w-[620px] leading-relaxed">
                {slug === 'fullstack-mastery'
                  ? 'Structured milestone-based progression designed for enterprise-grade Full Stack Web development.'
                  : slug === 'advanced-excel-certification-exam'
                    ? 'Structured milestone-based progression designed for professional Advanced Excel methodologies.'
                    : 'Structured milestone-based progression designed for production-grade Python development.'}
              </p>
            </div>
          )}

          {/* Celebration & Certificate Unlock Section for passed candidate (9-Phase Victory Experience) */}
          {activeTab === 'Milestones' && isAllPassed && (() => {
            const courseTitle = pathData.title;
            const score = slug === 'fullstack-mastery' ? '92%' : slug === 'advanced-excel-certification-exam' ? '94%' : '90%';
            const hours = pathData.totalDuration || (slug === 'fullstack-mastery' ? '160 Hours' : slug === 'advanced-excel-certification-exam' ? '10 Hours' : '140 Hours');
            const certNumber = credentialId || getCertificateId();

            if (!isPaid) {
              return (
                <div className="max-w-[1200px] mx-auto pb-16 text-left">
                  <div className="relative rounded-[24px] bg-gradient-to-br from-[#0B0F19] to-[#020617] text-white border border-slate-800/60 p-6 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                    {/* Golden ambient glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(229,169,59,0.04)_0%,transparent_60%)] pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                    <div className="relative z-10 flex flex-col items-center justify-center py-10 text-center space-y-6 max-w-md mx-auto">
                      {/* Circular Logo Container */}
                      <div className="relative w-20 h-20 rounded-full border border-amber-500/20 bg-slate-950/80 flex items-center justify-center p-2.5 shadow-2xl overflow-hidden backdrop-blur-md">
                        <img src="/sarthi-logo.png" alt="SARTHI Logo" className="w-full h-full object-contain rounded-full" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase tracking-wider">
                          Credential Ready For Activation
                        </h2>
                        <p className="text-slate-400 text-xs font-bold tracking-wider uppercase">
                          Activation Fee Required: ₹2000
                        </p>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Your certification is complete and ready. Activate your lifetime digital credential record, secure verification link, and PDF downloads.
                      </p>

                      <div className="w-full pt-2 flex flex-col gap-3">
                        <button
                          onClick={handleUnlockCertificate}
                          disabled={isUnlocking}
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 hover:shadow-emerald-400/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/20"
                        >
                          {isUnlocking ? "Activating..." : "Activate Now - ₹2000"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-[1200px] mx-auto pb-16 text-left"
              >
                <div className="relative rounded-[24px] bg-gradient-to-br from-[#0B0F19] to-[#020617] text-white border border-slate-800/60 p-6 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                  {/* Golden ambient glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(229,169,59,0.04)_0%,transparent_60%)] pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                  <div className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      {/* Left Column: Congratulations & Actions */}
                      <div className="lg:col-span-7 space-y-6">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.15em] shadow-md">
                            🏆 CONGRATULATIONS!
                          </div>
                          <h1 className="text-2xl md:text-3.5xl font-black uppercase tracking-tight text-white leading-tight mt-3">
                            You Have Officially Passed <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 italic block mt-1">
                              {courseTitle}
                            </span>
                          </h1>
                          <div className="flex items-center gap-3 mt-4">
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">SCORE:</span>
                              <span className="text-sm font-black text-emerald-400 font-mono">{score}</span>
                            </div>
                            <div className="px-3 py-1 bg-slate-800/40 border border-slate-700/30 rounded-xl flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">HOURS:</span>
                              <span className="text-sm font-black text-slate-300 font-mono">{hours}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-[13.5px] leading-relaxed font-medium">
                          Months from now, this moment will still matter. You started this journey with curiosity. You completed it with skill. Today you officially earned your SARTHI Certification.
                        </p>
                        <div className="border-t border-slate-800/80 pt-6">
                          <CertificateActions
                            status={isPaid ? 'VALID' : 'PENDING_PAYMENT'}
                            certificateNumber={certNumber}
                            courseTitle={courseTitle}
                            isUnlocking={isUnlocking}
                          />
                        </div>
                      </div>
                      {/* Right Column: Certificate Preview Card */}
                      <div className="lg:col-span-5 flex flex-col items-center">
                        <div
                          className="relative w-full aspect-[1.58] rounded-2xl bg-gradient-to-br from-[#111827] to-[#030712] border border-amber-500/20 p-5 shadow-2xl overflow-hidden flex flex-col justify-between select-none"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-black text-amber-500 tracking-widest block uppercase">Professional Credential</span>
                              <span className="text-[12px] font-black text-white tracking-wide block mt-0.5">SARTHI</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 font-mono tracking-wider">ID: {certNumber}</span>
                          </div>
                          <div className="my-2 text-left">
                            <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider">CANDIDATE</span>
                            <span className="text-[15px] font-black text-white block truncate leading-none mt-0.5">{user?.name || 'Candidate'}</span>
                            <span className="text-[8px] font-semibold text-slate-400 mt-1.5 block leading-tight">
                              has successfully completed all assessment milestones for
                            </span>
                            <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wide mt-0.5 leading-tight font-sans">
                              {courseTitle}
                            </span>
                          </div>
                          <div className="flex justify-between items-end border-t border-slate-800/80 pt-2.5 mt-0.5">
                            <div>
                              <span className="text-[7.5px] font-bold text-slate-500 uppercase block tracking-wider">ISSUE DATE</span>
                              <span className="text-[9px] font-extrabold text-slate-300 block font-mono mt-0.5">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="w-10 h-10 bg-white rounded p-0.5 shrink-0 flex items-center justify-center shadow-md">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                                  typeof window !== 'undefined' ? `${window.location.origin}/verify/${certNumber}` : `/verify/${certNumber}`
                                )}`}
                                alt="Verification QR"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
                        <span className="text-[7px] text-slate-500 font-bold uppercase mt-2 tracking-wider flex items-center gap-1">
                          🔒 Secure Official Document
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Horizontal Roadmap Pills */}
          {activeTab === 'Milestones' && (
            <div className="sticky top-[64px] lg:top-[76px] z-30 flex flex-wrap items-center gap-3 py-3 px-4 mb-8 text-[13px] font-semibold text-slate-655 select-none bg-[#f8fafc]/80 backdrop-blur-md border-b border-slate-200/40 -mx-4 md:-mx-6">
              {[
                ...(slug === 'fullstack-mastery' ? [
                  { id: 'ms-1', label: 'Web Foundations UI' },
                  { id: 'ms-2', label: 'Frontend Frameworks' },
                  { id: 'ms-3', label: 'Backend Architecture APIs' },
                  { id: 'ms-4', label: 'Databases DevOps' },
                ] : slug === 'ias-preparation' ? [
                  { id: 'ms-1', label: 'GS & CSAT Foundations' },
                  { id: 'ms-2', label: 'Mains GS Answer Writing' },
                  { id: 'ms-3', label: 'Optional Subject & Essay' },
                  { id: 'ms-4', label: 'Interview Mock Prep' },
                ] : slug === 'advanced-excel-certification-exam' ? [
                  { id: 'ms-1', label: 'Data Clean & Format' },
                  { id: 'ms-2', label: 'Advanced Lookups' },
                  { id: 'ms-3', label: 'Power Pivot Models' },
                  { id: 'ms-4', label: 'MIS Dashboards' },
                ] : [
                  { id: 'ms-1', label: 'Foundations' },
                  { id: 'ms-2', label: 'Core Programming' },
                  { id: 'ms-3', label: 'Advanced OOP' },
                  { id: 'ms-4', label: 'Automation' },
                ])
              ].map((pill, idx, arr) => {
                const isPillActive = activeMilestoneId === pill.id;
                return (
                  <Fragment key={pill.id}>
                    <button
                      onClick={() => {
                        setOpenMilestones({
                          'ms-1': pill.id === 'ms-1',
                          'ms-2': pill.id === 'ms-2',
                          'ms-3': pill.id === 'ms-3',
                          'ms-4': pill.id === 'ms-4',
                        });
                        setTimeout(() => {
                          const el = document.getElementById(`milestone-card-${pill.id}`);
                          if (el) {
                            const yOffset = -140;
                            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className={`px-3.5 py-1.5 rounded-full border transition-all duration-300 ease-in-out cursor-pointer text-xs font-bold ${isPillActive
                          ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-800 shadow-[0_4px_12px_rgba(16,185,129,0.18)] scale-105'
                          : 'bg-white/70 border-slate-200/60 text-slate-600 hover:bg-white/95 hover:text-slate-800 hover:-translate-y-0.5'
                        }`}
                    >
                      {pill.label}
                    </button>
                    {idx < arr.length - 1 && (
                      <div className="h-[1px] w-5 bg-gradient-to-r from-slate-200/20 via-slate-350 to-slate-200/20 flex-shrink-0" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}

          {/* Minimalist Milestone selector cards */}
          {activeTab === 'Milestones' && !assessmentActive && !assessmentSubmitted && milestoneGroups.map((milestone, milestoneIdx) => {
            const isUnlocked = milestoneIdx === 0 || !!passedMilestones[milestoneIdx - 1];
            const isOpen = !!openMilestones[milestone.id];
            const pathKey = milestoneIdx === 0 ? 'basic' : milestoneIdx === 1 ? 'intermediate' : milestoneIdx === 2 ? 'advanced' : 'realworld';

            const pathDesc = slug === 'fullstack-mastery'
              ? (milestoneIdx === 0
                ? 'Master semantic HTML5 structures, accessible ARIA attributes, modern layout systems like CSS Grid, and browser engine rendering/DOM optimization.'
                : milestoneIdx === 1
                  ? 'Build modern, reactive Single Page Applications using React component hierarchies, global Context/state management, and optimized rendering hooks.'
                  : milestoneIdx === 2
                    ? 'Design scalable, stateless backend architectures using REST APIs, GraphQL query gateways, JWT session authentication, and clean routing standards.'
                    : 'Design optimized database schemas with indexing and JOIN execution paths, configure containerized environments using Docker, and configure Kubernetes lifecycles.')
              : (milestoneIdx === 0
                ? 'Master python syntax, control variables, conditional expressions, basic functions, and loop iterations.'
                : milestoneIdx === 1
                  ? 'Covers advanced list methods, dictionary schema maps, basic decorators, iterators, and object-oriented models.'
                  : milestoneIdx === 2
                    ? 'Dive into memory slots optimization, async loops execution, metaclasses inheritance, MRO, and CPython internals.'
                    : 'Complete evaluation path covering real-world project scenarios, algorithms complexity, and system design.');

            return (
              <motion.section
                key={milestone.id}
                id={`milestone-card-${milestone.id}`}
                className="mb-4 text-left"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: milestoneIdx * 0.05 }}
              >
                <article className="rounded-3xl bg-white border border-slate-100/85 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                  {/* Accordion Header Row */}
                  <div
                    onClick={() => toggleMilestone(milestone.id)}
                    className="w-full flex justify-between items-center p-6 md:p-8 cursor-pointer select-none text-left"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-slate-900 font-extrabold tracking-tight text-xl md:text-2xl leading-none">
                          {milestone.title}
                        </h3>
                        {passedMilestones[milestoneIdx] === true && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 text-xs font-semibold text-slate-400">
                        <span>Milestone {milestoneIdx + 1}</span>
                        <span>•</span>
                        <span>20 Questions</span>
                        <span>•</span>
                        <span>80% Passing Score</span>
                      </div>
                    </div>

                    <div className="text-slate-400 hover:text-slate-650 transition-colors p-2 rounded-xl">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Collapsible content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="border-t border-slate-50 bg-slate-50/20 overflow-hidden"
                      >
                        <div className="p-6 md:p-8 space-y-5">
                          <p className="text-slate-650 text-sm leading-relaxed max-w-2xl font-medium">
                            {pathDesc}
                          </p>

                          {isUnlocked ? (
                            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 p-4 rounded-xl border border-slate-200/60 inline-flex w-fit">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              <span>To start this gate, use the &apos;Start Certification Pathway&apos; button at the top.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100/50 p-4 rounded-xl border border-slate-200/20 inline-flex">
                              <Lock className="w-3.5 h-3.5" />
                              Complete previous milestone assessment to unlock this gate
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              </motion.section>
            );
          })}

          {/* Final Certification Exam Card */}
          {activeTab === 'Milestones' && !assessmentActive && !assessmentSubmitted && (
            <motion.section
              className="mb-4 text-left"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 4 * 0.05 }}
            >
              <article className="rounded-3xl bg-white border border-slate-100/85 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                {/* Accordion Header Row */}
                <div
                  onClick={() => setFinalExpanded(!finalExpanded)}
                  className="w-full flex justify-between items-center p-6 md:p-8 cursor-pointer select-none text-left"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-slate-900 font-extrabold tracking-tight text-xl md:text-2xl leading-none">
                      Final Professional Certification Assessment
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 text-xs font-semibold text-slate-400">
                      <span>Certification Exam</span>
                      <span>•</span>
                      <span>60 Minutes</span>
                      <span>•</span>
                      <span>Strictly Proctored</span>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-655 transition-colors p-2 rounded-xl">
                    {finalExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {finalExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="border-t border-slate-50 bg-slate-50/20 overflow-hidden"
                    >
                      <div className="p-6 md:p-8 space-y-5">
                        <p className="text-slate-650 text-sm leading-relaxed max-w-2xl font-medium">
                          {slug === 'fullstack-mastery'
                            ? 'This is the definitive, comprehensive examination (40 MCQs) to validate your Full Stack Web Development mastery. Ensure you are fully prepared for this one-way path into a secure proctored environment.'
                            : 'This is the definitive, comprehensive examination to validate your Python mastery. Ensure you are fully prepared for this one-way path into a secure proctored environment.'}
                        </p>

                        {passedMilestones[3] ? (
                          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 p-4 rounded-xl border border-slate-200/60 inline-flex w-fit">
                            <Trophy className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                            <span>To start the final exam, use the &apos;Start Certification Pathway&apos; button at the top.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100/50 p-4 rounded-xl border border-slate-200/20 inline-flex">
                            <Lock className="w-3.5 h-3.5" />
                            Complete Milestones 1-4 to unlock this final exam
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            </motion.section>
          )}

          {/* Immersive Assessment Mode */}
          {activeTab === 'Milestones' && assessmentActive && (!assessmentSubmitted || showModulePassOverlay || showFinalPassOverlay || showModuleFailOverlay) && assessmentQuestions[assessmentQuestionIdx] && (() => {
            const currentQuestion = assessmentQuestions[assessmentQuestionIdx];
            const parts = currentQuestion.question.split('\n');
            const hasCode = parts.length > 1;
            const questionText = parts[0];
            const codeSnippet = hasCode ? parts.slice(1).join('\n') : '';

            const hours = Math.floor(assessmentTimeLeft / 3600);
            const minutes = Math.floor((assessmentTimeLeft % 3600) / 60);
            const seconds = assessmentTimeLeft % 60;
            const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            const countState = (s: 'answered' | 'not-answered' | 'marked' | 'marked-answered' | 'not-visited') => {
              if (s === 'not-visited') {
                return assessmentQuestions.length - Object.keys(questionStates).length;
              }
              return Object.values(questionStates).filter(v => v === s).length;
            };

            const examTitle = slug === 'fullstack-mastery' ? 'Full Stack Web Development Certification' : slug === 'advanced-excel-certification-exam' ? 'Advanced Excel Certification' : 'Python Development Certification';
            let milestoneName = "";
            const milestoneNames = slug === 'fullstack-mastery'
              ? [
                'Web Foundations',
                'Frontend Frameworks',
                'Backend APIs',
                'Databases & DevOps',
                'Final Assessment'
              ]
              : slug === 'ias-preparation'
                ? [
                  'GS & CSAT Foundations',
                  'Mains Answer Writing',
                  'Optional Subject & Essay',
                  'Interview & Personality Test',
                  'Final Mock Examination'
                ]
                : slug === 'advanced-excel-certification-exam'
                  ? [
                    'Data Clean & Format',
                    'Advanced Lookups',
                    'Power Pivot Models',
                    'MIS Dashboards',
                    'Final Assessment'
                  ]
                  : [
                    'Python Primitives',
                    'Object Oriented Programing',
                    'System Integrations',
                    'Final Certification'
                  ];
            if (assessmentPath === 'basic') milestoneName = milestoneNames[0];
            else if (assessmentPath === 'intermediate') milestoneName = milestoneNames[1];
            else if (assessmentPath === 'advanced') milestoneName = milestoneNames[2];
            else if (assessmentPath === 'realworld') milestoneName = milestoneNames[3];
            else if (assessmentPath === 'final') milestoneName = milestoneNames[4];

            // Calculate current progress
            const totalQ = assessmentQuestions.length;
            const currentIdx = assessmentQuestionIdx + 1;
            const progressPct = Math.round((currentIdx / totalQ) * 100);

            // Get dynamic badges for question
            const categoryName = currentQuestion.section || "Core Architecture";
            let diffName = "Intermediate";
            if (assessmentPath === 'basic') diffName = "Foundational";
            else if (assessmentPath === 'advanced') diffName = "Advanced";
            else if (assessmentPath === 'realworld') diffName = "Expert";
            else if (assessmentPath === 'final') diffName = "Comprehensive";

            const hasPassedAny = Object.values(passedMilestones).some(v => v === true);
            let activeMilestoneIdx = 0;
            if (assessmentPath === 'basic') activeMilestoneIdx = 0;
            else if (assessmentPath === 'intermediate') activeMilestoneIdx = 1;
            else if (assessmentPath === 'advanced') activeMilestoneIdx = 2;
            else if (assessmentPath === 'realworld') activeMilestoneIdx = 3;
            else if (assessmentPath === 'final') activeMilestoneIdx = 4;

            // Contextual Background logic
            let bgImageUrl = 'https://cdn.pixabay.com/photo/2015/12/09/13/48/wordpress-1084758_1280.jpg';
            if (slug === 'python-professional-developer') {
              bgImageUrl = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1280&q=80';
            } else if (slug === 'advanced-excel-certification-exam') {
              bgImageUrl = 'https://cdn.pixabay.com/photo/2016/10/25/11/28/excel-1768652_1280.png';
            } else if (slug === 'fullstack-mastery') {
              if (assessmentPath === 'advanced') {
                bgImageUrl = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1280&q=80';
              } else if (assessmentPath === 'realworld') {
                bgImageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80';
              }
            }

            return (
              <div
                className={`fixed inset-0 z-[9999] flex flex-col lg:flex-row select-none font-sans text-sm transition-all duration-300 exam-zoom ${theme === 'dark'
                    ? 'bg-[#020617] text-[#F8FAFC]'
                    : 'bg-[#F8FAFC] text-[#111827]'
                  } bg-cover bg-center bg-no-repeat ${assessmentSubmitted ? 'filter blur-[4px] opacity-75 pointer-events-none' : ''
                  }`}
                style={{
                  backgroundImage: `linear-gradient(to bottom, ${theme === 'dark'
                      ? 'rgba(2, 6, 23, 0.90), rgba(2, 6, 23, 0.90)'
                      : 'rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0.95)'
                    }), url('${bgImageUrl}')`
                }}
              >
                <style dangerouslySetInnerHTML={{
                  __html: `
                .exam-zoom {
                  zoom: 1.00 !important;
                }
                @media (min-width: 640px) {
                  .exam-zoom {
                    zoom: 1.10 !important;
                  }
                }
                .font-scale-large .excel-thead { font-size: 13px !important; }
                .font-scale-large .excel-table { font-size: 16px !important; }
                .font-scale-large .excel-pre { font-size: 16px !important; }
                .font-scale-large .excel-h3 { font-size: 24px !important; }
                .font-scale-large .excel-context { font-size: 18.5px !important; }
                .font-scale-large .excel-prob { font-size: 18.5px !important; }
                .font-scale-large .excel-q { font-size: 27px !important; }
                .font-scale-large .excel-text { font-size: 18.5px !important; }
                .font-scale-large .excel-option-letter { font-size: 19px !important; }
                .font-scale-large .excel-option-text { font-size: 19px !important; }

                .font-scale-extra-large .excel-thead { font-size: 16px !important; }
                .font-scale-extra-large .excel-table { font-size: 20px !important; }
                .font-scale-extra-large .excel-pre { font-size: 20px !important; }
                .font-scale-extra-large .excel-h3 { font-size: 28px !important; }
                .font-scale-extra-large .excel-context { font-size: 22.5px !important; }
                .font-scale-extra-large .excel-prob { font-size: 22.5px !important; }
                .font-scale-extra-large .excel-q { font-size: 32px !important; }
                .font-scale-extra-large .excel-text { font-size: 22.5px !important; }
                .font-scale-extra-large .excel-option-letter { font-size: 23px !important; }
                .font-scale-extra-large .excel-option-text { font-size: 23px !important; }
              ` }} />

                {/* MOBILE BACKDROP */}
                {mobileSidebarOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                )}

                {/* LEFT SIDEBAR (Candidate Details, Roadmap, Legend, Palette, Shortcuts) */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] sm:w-[380px] border-r flex flex-col shrink-0 overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0 lg:flex ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                  } ${theme === 'dark'
                    ? 'border-slate-800/60 bg-[#0F172A]/95 backdrop-blur-md'
                    : 'border-[#E5E7EB] bg-white/95 backdrop-blur-md'
                  }`}>

                  {/* SARTHI Sidebar Branding */}
                  <div className={`p-6 border-b flex items-center justify-between gap-3.5 transition-all duration-300 ${theme === 'dark' ? 'border-slate-800/60' : 'border-[#E5E7EB]'
                    }`}>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden shrink-0 bg-white">
                        <img src="/sarthi-logo.png" alt="SARTHI" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <span className={`font-extrabold text-base tracking-wide block leading-none ${theme === 'dark' ? 'text-white' : 'text-[#111827]'}`}>SARTHI</span>
                        <span className={`text-[9.5px] font-bold tracking-widest block uppercase mt-1 truncate ${theme === 'dark' ? 'text-slate-400' : 'text-[#6B7280]'}`}>Building Tomorrow&apos;s Developers</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileSidebarOpen(false)}
                      className="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Candidate Identity Card */}
                  <div className={`p-6 border-b flex items-center gap-5 transition-all duration-300 ${theme === 'dark' ? 'border-slate-800/60' : 'border-[#E5E7EB]'
                    }`}>
                    <div className="relative shrink-0">
                      <div className={`w-20 h-20 rounded-full overflow-hidden border-[2.5px] ${theme === 'dark' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-blue-600 shadow-[0_8px_24px_rgba(37,99,235,0.2)]'
                        } hover:scale-105 hover:shadow-xl transition-all duration-300 relative group cursor-pointer`}>
                        {(() => {
                          const photoUrl = user?.name === 'Mohit Raj' || !user
                            ? '/images/instructors/mohit-raj-speaker.jpg'
                            : (user?.image || user?.avatar_url);
                          if (photoUrl) {
                            return <img src={photoUrl} className="w-20 h-20 object-cover transition-transform duration-500 group-hover:scale-110" style={{ imageRendering: 'auto', objectFit: 'cover' }} alt="Candidate" />;
                          }
                          return (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-white text-2xl">
                              {(user?.name || 'Mohit Raj').split(' ').map((n: string) => n[0]).join('')}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <span className={`text-base font-black truncate block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Mohit Raj'}</span>
                      <span className={`text-sm font-bold block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>ID: TT2026{(user?.id || '42').substring(0, 5)}</span>
                      <div className="flex flex-col gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase w-fit">
                          <UserCheck className="w-3 h-3 shrink-0" /> Verified Candidate
                        </span>
                        {isAllPassed && isPaid && (
                          <div className={`mt-1.5 p-2 rounded-xl border flex flex-col gap-1 text-[11px] font-bold ${theme === 'dark'
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : 'bg-emerald-50/50 border-emerald-500/20 text-emerald-800'
                            }`}>
                            <span className="flex items-center gap-1 font-black uppercase tracking-wider">
                              <Award className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                              {slug === 'fullstack-mastery' ? 'Certified Full Stack Developer' : 'Certified Python Developer'}
                            </span>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold mt-0.5">
                              <span>SARTHI</span>
                              <span className="text-emerald-500 font-extrabold uppercase">✓ Verified</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Certification Journey Roadmap */}
                  <div className={`p-6 border-b transition-all duration-300 ${theme === 'dark' ? 'border-slate-800/60' : 'border-[#E5E7EB]'
                    }`}>
                    <h3 className={`text-xs font-black uppercase tracking-wider mb-4.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Certification Journey</h3>
                    <div className="space-y-5 pl-1">
                      {milestoneNames.map((name, idx) => {
                        const isCompleted = passedMilestones[idx] === true;
                        const isActive = !isCompleted && (idx === 0 || passedMilestones[idx - 1] === true);

                        return (
                          <div key={idx} className="flex items-center gap-3.5 relative">
                            {/* Connection Lines */}
                            {idx < milestoneNames.length - 1 && (
                              <div className="absolute left-3.5 top-7 w-[2px] h-9 overflow-hidden bg-slate-800">
                                <motion.div
                                  className="h-full bg-emerald-500 origin-top"
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: isCompleted ? 1 : 0 }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                              </div>
                            )}

                            {/* Circle Icon */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${isCompleted
                                ? 'bg-emerald-500 text-white font-bold text-sm shadow-md'
                                : isActive
                                  ? 'bg-blue-600/20 text-blue-400 font-extrabold border border-blue-500 text-sm shadow-lg shadow-blue-500/20'
                                  : theme === 'dark'
                                    ? 'bg-slate-900 text-slate-550 border border-slate-800'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}>
                              {isCompleted ? (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  ✓
                                </motion.span>
                              ) : isActive ? (
                                <span className="text-sm font-black animate-pulse">◉</span>
                              ) : (
                                <span className="text-xs font-semibold">○</span>
                              )}
                            </div>

                            <span className={`text-[14px] font-bold transition-colors ${isCompleted
                                ? 'text-emerald-500'
                                : isActive
                                  ? theme === 'dark' ? 'text-white font-black' : 'text-slate-950 font-black'
                                  : 'text-slate-450'
                              }`}>
                              {name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Summary Stats */}
                  <div className={`p-6 border-b transition-all duration-300 ${theme === 'dark' ? 'border-slate-800/60' : 'border-[#E5E7EB]'
                    }`}>
                    <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status Summary</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[34px] h-6.5 bg-[#4CAF50] text-white flex items-center justify-center text-xs font-bold rounded shrink-0 shadow-sm">
                          {countState('answered')}
                        </div>
                        <span className={`text-[14px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-[#6B7280]'}`}>Answered</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-[34px] h-6.5 bg-[#E53935] text-white flex items-center justify-center text-xs font-bold rounded shrink-0 shadow-sm">
                          {countState('not-answered')}
                        </div>
                        <span className={`text-[14px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-[#6B7280]'}`}>Not Answered</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-[34px] h-6.5 bg-[#BDBDBD] text-black flex items-center justify-center text-xs font-bold rounded shrink-0 shadow-sm">
                          {countState('not-visited')}
                        </div>
                        <span className={`text-[14px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-[#6B7280]'}`}>Not Visited</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-[34px] h-6.5 bg-[#7B1FA2] text-white flex items-center justify-center text-xs font-bold rounded shrink-0 shadow-sm">
                          {countState('marked')}
                        </div>
                        <span className={`text-[14px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-[#6B7280]'}`}>Marked</span>
                      </div>
                    </div>
                  </div>

                  {/* Question Palette Section */}
                  <div className="p-6 flex-1 flex flex-col min-h-[220px]">
                    <h3 className={`text-xs font-black uppercase tracking-wider mb-4.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Questions</h3>

                    <div className="grid grid-cols-5 gap-2.5 overflow-y-auto pr-1">
                      {assessmentQuestions.map((q, idx) => {
                        const state = questionStates[idx] || 'not-visited';
                        const isCurrent = assessmentQuestionIdx === idx;

                        let bgClass = "bg-[#BDBDBD] text-black border border-slate-400";
                        let labelText = `${idx + 1}`;
                        let shapeClass = "rounded-lg";
                        let borderClass = "border-transparent";

                        if (state === 'answered') {
                          bgClass = "bg-[#4CAF50] text-white";
                          labelText = `✓ ${idx + 1}`;
                        } else if (state === 'not-answered') {
                          bgClass = "bg-[#E53935] text-white";
                        } else if (state === 'marked' || state === 'marked-answered') {
                          bgClass = "bg-[#7B1FA2] text-white";
                        }

                        if (isCurrent) {
                          borderClass = theme === 'dark'
                            ? "ring-2 ring-blue-500 border-2 border-slate-900 shadow-[0_0_15px_rgba(59,130,246,0.65)]"
                            : "ring-2 ring-blue-600 border-2 border-white shadow-[0_0_12px_rgba(37,99,235,0.5)]";
                        }

                        return (
                          <motion.button
                            key={idx}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setAssessmentQuestionIdx(idx);
                              setQuestionStates(prev => {
                                if (!prev[idx] || prev[idx] === 'not-visited') {
                                  return { ...prev, [idx]: 'not-answered' };
                                }
                                return prev;
                              });
                            }}
                            className={`h-11 flex items-center justify-center text-sm font-black cursor-pointer select-none transition-all duration-150 ${bgClass} ${shapeClass} ${borderClass}`}
                          >
                            <span>{labelText}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Controls (Theme, Font Scale, Leave) */}
                  <div className={`p-6 border-t lg:hidden transition-all duration-300 space-y-4 ${theme === 'dark' ? 'border-slate-800 bg-[#020617]/20' : 'border-[#E5E7EB] bg-slate-50/20'
                    }`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Mobile Controls</h3>

                    {/* Font Scale Selection */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Font Size</span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                        <button
                          onClick={() => setFontScale('normal')}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer ${fontScale === 'normal'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => setFontScale('large')}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-extrabold cursor-pointer ${fontScale === 'large'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                          A+
                        </button>
                        <button
                          onClick={() => setFontScale('extra-large')}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-base font-black cursor-pointer ${fontScale === 'extra-large'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                          A++
                        </button>
                      </div>
                    </div>

                    {/* Theme Switcher */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Theme</span>
                      <div className="flex items-center gap-2">
                        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-500'}`} />
                        <button
                          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                          />
                        </button>
                        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-500'}`} />
                      </div>
                    </div>

                    {/* Leave Button */}
                    <button
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        setShowLeaveWarningModal(true);
                      }}
                      className={`w-full font-bold uppercase text-[11px] tracking-wider py-3 rounded-xl border text-center transition-all duration-200 cursor-pointer block ${theme === 'dark'
                          ? 'bg-red-500/10 border-red-500/20 text-red-450 hover:bg-red-500/20'
                          : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                        }`}
                    >
                      Leave Assessment
                    </button>
                  </div>

                  {/* Keyboard Shortcuts Side Panel */}
                  <div className={`p-6 border-t mt-auto transition-all duration-300 ${theme === 'dark' ? 'border-slate-800 bg-[#020617]/40' : 'border-[#E5E7EB] bg-slate-100/40'
                    }`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Keyboard Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] text-slate-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                          }`}>1-4</kbd>
                        <span className="text-[14px]">Option</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                          }`}>R</kbd>
                        <span className="text-[14px]">Review</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                          }`}>N</kbd>
                        <span className="text-[14px]">Next</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                          }`}>C</kbd>
                        <span className="text-[14px]">Clear</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                          }`}>P</kbd>
                        <span className="text-[14px]">Prev</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                          }`}>S</kbd>
                        <span className="text-[14px]">Save</span>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* RIGHT CONTENT COLUMN */}
                <div className="flex-1 flex flex-col overflow-hidden">

                  {/* PREMIUM HEADER */}
                  <header className={`h-auto min-h-[88px] py-4 lg:py-0 lg:h-[88px] border-b flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 gap-4 shrink-0 z-10 shadow-sm transition-all duration-300 ${theme === 'dark'
                      ? 'bg-[#0F172A]/80 border-slate-800/80 text-white'
                      : 'bg-white/80 border-[#E5E7EB] text-[#111827]'
                    } backdrop-blur-md`}>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setMobileSidebarOpen(true)}
                          className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden shrink-0 bg-white lg:hidden">
                            <img src="/sarthi-logo.png" alt="SARTHI" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider line-clamp-1">{examTitle}</h1>
                            <p className={`text-[10px] sm:text-xs font-bold uppercase mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{milestoneName} Assessment</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-6 w-full md:w-auto">
                      {/* Font Scale Selection Panel */}
                      <div className="hidden sm:flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm mr-1">
                        <button
                          onClick={() => setFontScale('normal')}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${fontScale === 'normal'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          title="Normal Font Size"
                        >
                          A
                        </button>
                        <button
                          onClick={() => setFontScale('large')}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-extrabold transition-all cursor-pointer ${fontScale === 'large'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          title="Large Font Size"
                        >
                          A+
                        </button>
                        <button
                          onClick={() => setFontScale('extra-large')}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-base font-black transition-all cursor-pointer ${fontScale === 'extra-large'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          title="Extra Large Font Size"
                        >
                          A++
                        </button>
                      </div>

                      {/* Theme Switcher Toggle button */}
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <Sun className={`w-3.5 h-3.5 transition-colors ${theme === 'light' ? 'text-amber-500' : 'text-slate-500'}`} />
                        <button
                          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                          aria-label="Toggle theme"
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                          />
                        </button>
                        <Moon className={`w-3.5 h-3.5 transition-colors ${theme === 'dark' ? 'text-blue-400' : 'text-slate-500'}`} />
                      </div>

                      {/* Timer floating state pill */}
                      {(() => {
                        const isRed = assessmentTimeLeft < 300;
                        const isOrange = assessmentTimeLeft >= 300 && assessmentTimeLeft < 900;
                        let timerColorClass = theme === 'dark'
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-blue-900/20"
                          : "border-blue-200 bg-blue-50 text-blue-600 shadow-blue-100/50";

                        if (isRed) {
                          timerColorClass = "border-rose-500/40 bg-rose-500/10 text-rose-500 animate-pulse shadow-rose-900/20";
                        } else if (isOrange) {
                          timerColorClass = "border-amber-500/40 bg-amber-500/10 text-amber-500 shadow-amber-900/20";
                        }

                        return (
                          <div className={`border px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-sm shrink-0 ${timerColorClass}`}>
                            <Clock className="w-4 h-4" />
                            <div className="flex flex-col items-start leading-none">
                              <span className="text-[8px] uppercase tracking-wider font-black opacity-80">TIME</span>
                              <span className="font-mono text-sm sm:text-base font-black mt-0.5">{timeFormatted}</span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                          onClick={() => {
                            setShowLeaveWarningModal(true);
                          }}
                          className={`hidden sm:block font-bold uppercase text-[10px] sm:text-[11px] tracking-wider px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${theme === 'dark'
                              ? 'bg-[#1E293B] border-slate-700 text-slate-350 hover:bg-slate-800'
                              : 'bg-slate-100 border-[#E5E7EB] text-[#6B7280] hover:bg-slate-200'
                            }`}
                        >
                          Leave
                        </button>

                        <button
                          onClick={() => {
                            setShowSubmitConfirmModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] sm:text-[11px] tracking-wider px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </header>

                  {/* SCROLLABLE WORKSPACE AREA */}
                  <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-left">

                    {/* Top Progress bar and marks info card */}
                    <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-sm transition-all duration-300 backdrop-blur-md ${theme === 'dark' ? 'bg-[#0F172A]/40 border-slate-800/80' : 'bg-white/80 border-[#E5E7EB]'
                      }`}>
                      <div className="flex flex-col gap-1.5 w-full max-w-md">
                        <span className={`text-xs font-black uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Question {assessmentQuestionIdx + 1} of {totalQ}
                        </span>
                        <div className="flex items-center gap-3 w-full">
                          <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
                          </div>
                          <span className="text-xs font-black text-blue-500">{progressPct}%</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400 shrink-0">
                        <span>MAX MARKS: <span className="text-blue-500 font-extrabold">4</span></span>
                        <span className="hidden md:inline w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span>NEGATIVE MARKS: <span className="text-rose-500 font-extrabold">0</span></span>
                      </div>
                    </div>

                    {/* Question Card Display (Premium Glassmorphic Design) */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={assessmentQuestionIdx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className={`p-4 sm:p-6 md:p-8 border rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-2xl transition-all duration-300 font-scale-${fontScale} ${theme === 'dark'
                            ? 'bg-[#0F172A]/65 border-white/8 shadow-black/40 text-[#F8FAFC]'
                            : 'bg-white/70 border-black/6 shadow-slate-200/50 text-[#111827]'
                          }`}
                        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                      >
                        {/* Details Badges */}
                        <div className={`flex flex-wrap items-center gap-2 border-b pb-3 mb-4 ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200/80'
                          }`}>
                          <span className="text-xs font-black uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-md">
                            {categoryName}
                          </span>
                          <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-md">
                            {diffName}
                          </span>
                          <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-md ${theme === 'dark' ? 'text-slate-300 bg-slate-800 border border-slate-700' : 'text-slate-655 bg-slate-100 border border-slate-200'
                            }`}>
                            Est. Time: 45 sec
                          </span>
                        </div>

                        {/* Question Content */}
                        <div className="space-y-6 leading-relaxed">
                          <p className={`text-xs font-bold uppercase tracking-wider text-blue-500`}>QUESTION NO. {assessmentQuestionIdx + 1}</p>
                          {slug === 'advanced-excel-certification-exam' ? (
                            renderExcelQuestion(currentQuestion.question)
                          ) : (
                            <>
                              <p className="font-extrabold text-lg sm:text-[24px] tracking-wide leading-snug text-blue-900 dark:text-blue-300 excel-q">{questionText}</p>
                              {hasCode && (
                                <pre className={`p-4 sm:p-6 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed shadow-inner select-text excel-pre ${theme === 'dark' ? 'bg-slate-950 border border-slate-850 text-emerald-400' : 'bg-slate-100 border border-slate-200 text-slate-800'
                                  }`}>
                                  <code>{codeSnippet}</code>
                                </pre>
                              )}
                            </>
                          )}
                        </div>

                        {/* Options Cards */}
                        <div className="space-y-2.5 sm:space-y-3 pt-4">
                          {currentQuestion.options?.map((option, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isSelected = assessmentAnswers[currentQuestion.id] === letter;

                            return (
                              <div
                                key={optIdx}
                                onClick={() => {
                                  if (assessmentSubmitted) return;
                                  setAssessmentAnswers(prev => ({ ...prev, [currentQuestion.id]: letter }));
                                }}
                                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-2xl cursor-pointer select-none transition-all duration-200 hover:-translate-y-[1.5px] hover:shadow-md ${isSelected
                                    ? 'bg-blue-600/10 border-blue-500/80 shadow-md shadow-blue-500/5'
                                    : theme === 'dark'
                                      ? 'bg-[#0F172A]/60 border-slate-800 hover:border-slate-700'
                                      : 'bg-white border-[#E5E7EB] hover:border-slate-350'
                                  }`}
                              >
                                {/* Radio Box */}
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-500'
                                    : theme === 'dark' ? 'border-slate-800 bg-[#020617]' : 'border-slate-300 bg-white'
                                  }`}>
                                  {isSelected && (
                                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className={`text-sm sm:text-[16px] font-black transition-colors excel-option-letter ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>{letter}.</span>
                                <span className={`text-sm sm:text-[16px] font-bold leading-snug excel-option-text ${theme === 'dark' ? 'text-slate-200' : 'text-slate-850'}`}>{option}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </main>

                  {/* BOTTOM NAVIGATION ACTIONS BAR */}
                  <div className={`border-t px-4 sm:px-8 py-3 sm:py-0 h-auto sm:h-[88px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between shrink-0 gap-3 sm:gap-0 transition-colors duration-300 backdrop-blur-md ${theme === 'dark'
                      ? 'bg-slate-950/60 border-slate-850'
                      : 'bg-white/60 border-[#E5E7EB]'
                    }`}>
                    {/* Mobile Actions Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:hidden w-full">
                      <button
                        onClick={handleClearResponse}
                        className={`font-bold uppercase text-[11px] tracking-wider py-3 rounded-xl border text-center active:scale-[0.98] transition-all cursor-pointer ${theme === 'dark'
                            ? 'bg-[#1E293B] border-slate-700 text-slate-350 hover:bg-slate-800'
                            : 'bg-slate-100 border-[#E5E7EB] text-[#6B7280] hover:bg-slate-200'
                          }`}
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleMarkForReviewAndNext}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase text-[11px] tracking-wider py-3 rounded-xl text-center active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{assessmentQuestionIdx === assessmentQuestions.length - 1 ? 'Mark & Submit' : 'Mark & Next'}</span>
                      </button>

                      <button
                        onClick={handlePrevQuestion}
                        disabled={assessmentQuestionIdx === 0}
                        className={`font-bold uppercase text-[11px] tracking-wider py-3 rounded-xl border text-center active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 ${assessmentQuestionIdx === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                          } ${theme === 'dark'
                            ? 'bg-[#1E293B] border-slate-700 text-slate-350 hover:bg-slate-800'
                            : 'bg-slate-100 border-[#E5E7EB] text-[#6B7280] hover:bg-slate-200'
                          }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <button
                        onClick={handleSaveAndNext}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase text-[11px] tracking-wider py-3 rounded-xl text-center active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{assessmentQuestionIdx === assessmentQuestions.length - 1 ? 'Save & Submit' : 'Save & Next'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Desktop Actions Row */}
                    <div className="hidden sm:flex gap-3">
                      <button
                        onClick={handleClearResponse}
                        className={`border font-bold uppercase text-[12px] tracking-wider px-5 py-3.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer ${theme === 'dark'
                            ? 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-800'
                            : 'bg-slate-100 border-[#E5E7EB] text-[#6B7280] hover:bg-slate-200'
                          }`}
                      >
                        Clear Response
                      </button>
                      <button
                        onClick={handleMarkForReviewAndNext}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase text-[12px] tracking-wider px-5 py-3.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <Flag className="w-4 h-4" />
                        <span>{assessmentQuestionIdx === assessmentQuestions.length - 1 ? 'Mark For Review & Submit' : 'Mark For Review & Next'}</span>
                      </button>
                    </div>

                    <div className="hidden sm:flex gap-3">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={assessmentQuestionIdx === 0}
                        className={`border font-bold uppercase text-[12px] tracking-wider px-5 py-3.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 ${assessmentQuestionIdx === 0 ? 'opacity-40 cursor-not-allowed' : ''
                          }  ${theme === 'dark'
                            ? 'bg-[#1E293B] border-slate-700 text-slate-350 hover:bg-slate-800'
                            : 'bg-slate-100 border-[#E5E7EB] text-[#6B7280] hover:bg-slate-200'
                          }`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        onClick={handleSaveAndNext}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase text-[12px] tracking-wider px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <span>{assessmentQuestionIdx === assessmentQuestions.length - 1 ? 'Save & Submit' : 'Save & Next'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Assessment Result Card */}
          {activeTab === 'Milestones' && assessmentSubmitted && !showModulePassOverlay && !showFinalPassOverlay && !showModuleFailOverlay && (() => {
            const totalQ = assessmentQuestions.length;
            const attemptedQ = Object.keys(assessmentAnswers).length;
            const correctQ = correctCount;
            const wrongQ = Math.max(0, attemptedQ - correctQ);
            const scorePercent = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
            const isPassed = scorePercent >= 80;

            const takenMins = Math.floor(timeTakenSeconds / 60);
            const takenSecs = timeTakenSeconds % 60;
            const timeTakenFormatted = `${takenMins}m ${takenSecs}s`;

            // Generate Section-wise analysis
            const sections: Record<string, { total: number; attempted: number; correct: number }> = {};
            assessmentQuestions.forEach(q => {
              const secName = q.section || 'Core Competency';
              if (!sections[secName]) {
                sections[secName] = { total: 0, attempted: 0, correct: 0 };
              }
              sections[secName].total += 1;
              if (assessmentAnswers[q.id]) {
                sections[secName].attempted += 1;
                if (assessmentAnswers[q.id] === q.correctAnswer) {
                  sections[secName].correct += 1;
                }
              }
            });

            // Circular progress path parameters
            const radius = 50;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

            const strengths: string[] = [];
            const improvements: string[] = [];
            Object.entries(sections).forEach(([secName, metric]) => {
              const scorePercent = metric.total > 0 ? Math.round((metric.correct / metric.total) * 100) : 0;
              if (scorePercent >= 80) {
                strengths.push(secName);
              } else {
                improvements.push(secName);
              }
            });


            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.03)] mt-8 text-left transition-all duration-300 bg-[#F8FAFC] text-slate-800 font-sans"
              >
                {/* Header and Status Indicator */}
                <div className="border-b border-[#E5E7EB] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                      SARTHI Certification Scorecard
                    </h2>
                    <p className="text-xs font-bold uppercase mt-1 text-slate-500">
                      CBT Examination Results
                    </p>
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase border tracking-wider shadow-sm ${isPassed
                      ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}>
                    {isPassed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ Module Assessment Passed</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Failed (Required &gt;= 80%)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Main Metrics Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                  {/* Circular Progress & Passed Animation */}
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r={radius}
                          className="stroke-slate-100"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="72"
                          cy="72"
                          r={radius}
                          className={isPassed ? 'stroke-[#16A34A]' : 'stroke-rose-500'}
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{scorePercent}%</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Score</span>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      {isPassed ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.4 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-xs font-black uppercase mt-1"
                        >
                          <Trophy className="w-3.5 h-3.5" /> Achievement Badge Unlocked
                        </motion.div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">
                          Keep learning and try again!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score details grid list */}
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white text-left flex flex-col justify-between shadow-sm">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Questions</span>
                      <span className="text-2xl font-black mt-2 text-slate-800">{totalQ}</span>
                    </div>

                    <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white text-left flex flex-col justify-between shadow-sm">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Attempted Qs</span>
                      <span className={`text-2xl font-black mt-2 ${isPassed ? 'text-[#16A34A]' : 'text-rose-600'}`}>{attemptedQ}</span>
                    </div>

                    <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white text-left flex flex-col justify-between shadow-sm">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Correct / Wrong</span>
                      <span className="text-2xl font-black mt-2 flex items-center gap-1.5 text-slate-800">
                        <span className="text-[#16A34A]">{correctQ}</span>
                        <span className="text-slate-300 text-lg">/</span>
                        <span className="text-rose-600">{wrongQ}</span>
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white text-left flex flex-col justify-between shadow-sm">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Time Taken</span>
                      <span className="text-2xl font-black mt-2 font-mono text-slate-800">{timeTakenFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Feedback Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                  <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                    <h4 className="text-xs font-black uppercase text-[#16A34A] tracking-wider mb-4 flex items-center gap-1.5">
                      ✓ Strengths
                    </h4>
                    {strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {strengths.map((str, sIdx) => (
                          <li key={sIdx} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="text-[#16A34A] font-bold">✓</span> {str}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400">No strong areas identified yet.</p>
                    )}
                  </div>

                  <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                    <h4 className="text-xs font-black uppercase text-rose-500 tracking-wider mb-4 flex items-center gap-1.5">
                      • Needs Improvement
                    </h4>
                    {improvements.length > 0 ? (
                      <ul className="space-y-2">
                        {improvements.map((imp, iIdx) => (
                          <li key={iIdx} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="text-rose-500 font-black">•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400">All objectives cleared!</p>
                    )}
                  </div>
                </div>

                {/* Section-wise Analysis Table */}
                <div className="mb-8">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 pb-1 border-b text-slate-400 border-slate-200">Section Performance breakdown</h3>
                  <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5E7EB] bg-slate-50 uppercase text-[10px] font-black tracking-wider text-slate-500">
                          <th className="p-4">Section Module</th>
                          <th className="p-4 text-center">Questions</th>
                          <th className="p-4 text-center">Attempted</th>
                          <th className="p-4 text-center">Correct</th>
                          <th className="p-4 text-center">Score %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB] bg-white text-slate-700">
                        {Object.entries(sections).map(([secName, metric]) => {
                          const scorePct = metric.total > 0 ? Math.round((metric.correct / metric.total) * 100) : 0;
                          return (
                            <tr key={secName} className="hover:bg-slate-50/50 font-semibold border-b border-[#E5E7EB]">
                              <td className="p-4 font-bold text-slate-900">{secName}</td>
                              <td className="p-4 text-center">{metric.total}</td>
                              <td className="p-4 text-center">{metric.attempted}</td>
                              <td className="p-4 text-center text-[#16A34A]">{metric.correct}</td>
                              <td className="p-4 text-center font-black text-[#2563EB]">{scorePct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom CTA Block */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => {
                      setAssessmentSubmitted(false);
                      setAssessmentActive(false);
                    }}
                    className="px-6 py-3.5 rounded-xl border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    Change Certification Pathway
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        window.location.href = `/login?redirect=/certification-exams/paths/${slug}`;
                        return;
                      }
                      setCheatWarnings(0);
                      setQuestionStates({ 0: 'not-answered' });
                      setExamDuration(1200);
                      setAssessmentActive(true);
                      setAssessmentQuestionIdx(0);
                      setAssessmentAttempt(prev => prev + 1);
                      setAssessmentAnswers({});
                      setAssessmentTimeLeft(1200);
                      setAssessmentSubmitted(false);
                    }}
                    className="px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-take Exam
                  </button>
                </div>
              </motion.div>
            );
          })()}

          {/* Overview Tab Content */}
          {activeTab === 'Overview' && (
            <section className="rounded-2xl bg-white border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-left text-slate-800">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-slate-600 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
                <Code2 className="w-4 h-4 text-[#10B981]" />
                Specialization Curriculum
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Certification Specifications</h3>
              <p className="text-[14.5px] text-gray-600 max-w-3xl leading-relaxed mb-8 font-medium">
                {slug === 'fullstack-mastery'
                  ? 'This is an industry-standard evaluation gate, not a tutorial watchlist. This certification rigorously tests your ability to write production-grade Full Stack Web Application code—validating your expertise from core UI markup semantics to modern frontend state architectures, stateless API microservices, database schemas, containerized docker systems, and automated DevOps configurations. Taking the exam is free; a ₹2000 certificate generation fee applies only on passing.'
                  : slug === 'advanced-excel-certification-exam'
                    ? 'This is an industry-standard evaluation gate, not a tutorial watchlist. This certification rigorously tests your ability to master advanced Microsoft Excel methodologies—validating your expertise from data cleaning structures to lookup functions, relational star data models, and dynamic interactive business dashboards. Taking the exam is free; a ₹2000 certificate generation fee applies only on passing.'
                    : 'This is an industry-standard evaluation gate, not a tutorial watchlist. This certification rigorously tests your ability to write production-grade Python code—validating your expertise from core primitives to enterprise-level API microservices and advanced object-oriented architectures. Taking the exam is free; a ₹2000 certificate generation fee applies only on passing.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-2xl bg-slate-50 border border-slate-200/50 p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">EVALUATION GATES</p>
                  <p className="text-2xl font-black text-slate-900">
                    {slug === 'fullstack-mastery' ? '5 Strict Milestones' : '4 Strict Milestones'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200/50 p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">ASSESSMENT CRITERIA</p>
                  <p className="text-2xl font-black text-slate-900">
                    {slug === 'fullstack-mastery' ? '120 Core Objectives' : '80 Core Objectives'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200/50 p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">CREDENTIAL</p>
                  <p className="text-2xl font-black text-slate-900">Verifiable Certificate</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">₹2000 fee on passing</p>
                </div>
              </div>
            </section>
          )}

          {/* Resources Tab Content */}
          {activeTab === 'Resources' && (
            <section className="rounded-2xl bg-white border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-left text-slate-800">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-slate-600 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
                <FolderKanban className="w-4 h-4 text-[#10B981]" />
                Exam Preparation
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Official Assessment Blueprint</h3>
              <p className="text-[14.5px] text-gray-600 max-w-3xl leading-relaxed mb-6 font-medium">
                SARTHI evaluates your skills; how you acquire them is up to you. Use the official resources below to understand the exam parameters and prepare for the milestone gates.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { icon: <FileText className="w-5 h-5 text-[#10B981]" />, title: 'Certification Syllabus & Blueprint (PDF)', desc: 'A detailed breakdown of all topics covered in the 4 milestones.', actionText: 'Download Blueprint', href: '/Tech_Tomorrow_Assessment_Blueprint.pdf' },
                  { icon: <FileText className="w-5 h-5 text-[#10B981]" />, title: 'Exam Rules & Guidelines (PDF)', desc: 'Information on passing scores (80% required), strict environment guidelines, and time bounds.', actionText: 'Download Rules', href: '/Tech_Tomorrow_Exam_Guidelines.pdf' },
                  { icon: <FileText className="w-5 h-5 text-[#10B981]" />, title: 'System Documentation & FAQs (DOCX)', desc: 'Detailed specifications of the environment, software components, and candidate setup.', actionText: 'Download Docs', href: '/Tech_Tomorrow_System_Documentation.docx' },
                ].map((res, idx) => (
                  <div key={idx} className="group rounded-2xl bg-slate-50 border border-slate-200/50 p-5 flex flex-col md:flex-row md:items-center gap-5 transition-all duration-200 select-none hover:bg-slate-100/50 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center flex-shrink-0">
                      {res.icon}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-900 mb-0.5">{res.title}</p>
                      <p className="text-gray-600 text-xs font-semibold">{res.desc}</p>
                    </div>
                    <a href={res.href} target={res.href.startsWith('http') ? '_blank' : undefined} download={!res.href.startsWith('http') ? true : undefined} rel="noopener noreferrer" className="md:ml-auto mt-3 md:mt-0 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-[#10B981] hover:text-white hover:border-transparent transition-all cursor-pointer shadow-sm text-center">
                      {res.actionText}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Discussion Tab Content */}
          {activeTab === 'Discussion' && (
            <section className="rounded-2xl bg-white border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-left text-slate-800">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-slate-600 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
                <MessageSquare className="w-4 h-4 text-[#10B981]" />
                Candidate Forum
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Certification Forum</h3>
              <p className="text-[14.5px] text-gray-600 max-w-3xl leading-relaxed mb-6 font-medium">
                Connect with fellow candidates and certified professionals. Discuss exam formats, share preparation strategies, and explore career opportunities.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { type: 'pinned', title: 'Read Before Posting: Strict No-Cheating & Question Leaking Policy', desc: 'Official code of conduct, honor code parameters, and post-exam disclosure guidelines.' },
                  { type: 'thread', title: 'What was your strategy for the Advanced OOP Assessment?', desc: 'Candidates discuss architectural patterns and debugging frameworks.' },
                  { type: 'thread', title: 'Resume formatting tips after clearing the SARTHI Python Certification', desc: 'Tips on showcasing credentials and integrating verifiable hashes on GitHub.' },
                ].map((topic, idx) => (
                  <div key={idx} className="group rounded-2xl bg-slate-50 border border-slate-200/50 p-5 flex items-start gap-4 transition-all duration-200 select-none hover:bg-slate-100/50 shadow-sm">
                    <div className="pt-0.5">
                      {topic.type === 'pinned' ? (
                        <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Pinned</span>
                      ) : (
                        <span className="bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Thread</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-900 mb-0.5">{topic.title}</p>
                      <p className="text-gray-600 text-xs font-semibold">{topic.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Bottom transition gradient to avoid abrupt footer cut */}
      <div
        className="h-[180px] w-full pointer-events-none relative z-20 -mt-24"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(2,6,23,0.03) 100%)'
        }}
      />
      {/* ── HONOR CODE AGREEMENT MODAL ── */}
      <AnimatePresence>
        {showHonorCodeModal && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHonorCodeModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="relative bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 sm:space-y-6 text-slate-800 text-left my-auto"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100/80 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-emerald-100/50">
                  <Shield className="w-6 h-6 stroke-[2.25]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950">Honor Code Agreement</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SARTHI Standard</p>
                </div>
              </div>

              <div className="space-y-4 py-2">
                <p className="text-sm sm:text-base text-slate-650 leading-relaxed font-semibold">
                  To maintain the integrity of the SARTHI Professional credentials, candidates must review and accept the honor code before starting their next assessment.
                </p>

                <div className="space-y-3 pl-1">
                  {[
                    "I will complete this certification assessment completely on my own.",
                    "I will not use external websites, search engines, or AI assistants.",
                    "I will not share, publish, or leak any questions or answers from this exam."
                  ].map((rule, idx) => (
                    <div key={idx} className="flex gap-2.5 text-sm sm:text-base font-semibold text-slate-700">
                      <span className="text-emerald-500 font-extrabold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/55 rounded-2xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={honorCodeChecked}
                  onChange={(e) => setHonorCodeChecked(e.target.checked)}
                  className="w-5.5 h-5.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer shrink-0"
                />
                <span className="text-[13px] sm:text-sm font-bold text-slate-700 leading-tight">
                  I agree to the Honor Code guidelines and understand that cheating will void my credential.
                </span>
              </label>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowHonorCodeModal(false)}
                  className="w-1/2 py-3 rounded-xl border border-slate-250 hover:bg-slate-50 text-sm font-bold text-slate-500 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  disabled={!honorCodeChecked}
                  onClick={handleStartCertificationAssessment}
                  className={`w-1/2 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white text-center transition-all cursor-pointer shadow-md ${honorCodeChecked
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                      : 'bg-slate-300 shadow-none cursor-not-allowed'
                    }`}
                >
                  Start Assessment
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Module Pass Premium Success Experience Overlay */}
        {showModulePassOverlay && (() => {
          const totalQ = assessmentQuestions.length;
          const attemptedQ = Object.keys(assessmentAnswers).length;
          const correctQ = correctCount;
          const incorrectQ = Math.max(0, attemptedQ - correctQ);
          const skippedQ = totalQ - attemptedQ;
          const pct = assessmentScore;

          const takenMins = Math.floor(timeTakenSeconds / 60);
          const takenSecs = timeTakenSeconds % 60;
          const timeTakenFormatted = `${takenMins}m ${takenSecs}s`;

          // Dynamic category naming helper
          const getTopicName = (qText: string) => {
            const lower = qText.toLowerCase();
            if (slug === 'advanced-excel-certification-exam') {
              if (assessmentPath === 'basic') {
                if (lower.includes('format') || lower.includes('color') || lower.includes('conditional')) return 'Conditional Formatting';
                if (lower.includes('clean') || lower.includes('trim') || lower.includes('text')) return 'Data Cleaning';
                return 'Data Preparation';
              }
              if (assessmentPath === 'intermediate') {
                if (lower.includes('vlookup') || lower.includes('hlookup')) return 'VLOOKUP & HLOOKUP';
                if (lower.includes('xlookup')) return 'XLOOKUP';
                if (lower.includes('index') || lower.includes('match')) return 'INDEX & MATCH';
                return 'Advanced Lookups';
              }
              if (assessmentPath === 'advanced') {
                if (lower.includes('pivot')) return 'Pivot Tables';
                if (lower.includes('power') || lower.includes('dax')) return 'Power Pivot & DAX';
                if (lower.includes('model') || lower.includes('relation')) return 'Data Modeling';
                return 'Advanced Modeling';
              }
              if (assessmentPath === 'realworld') {
                if (lower.includes('chart') || lower.includes('graph')) return 'Advanced Charting';
                if (lower.includes('dashboard') || lower.includes('interactive')) return 'Interactive Dashboards';
                if (lower.includes('macro') || lower.includes('vba')) return 'Macros & Automation';
                return 'MIS Reporting';
              }
              if (lower.includes('lookup') || lower.includes('match')) return 'Lookups';
              if (lower.includes('pivot') || lower.includes('dax')) return 'Data Modeling';
              return 'Core Excel Functions';
            } else if (slug === 'ias-preparation') {
              if (assessmentPath === 'basic') return 'Polity & Governance';
              if (assessmentPath === 'intermediate') return 'History & Culture';
              if (assessmentPath === 'advanced') return 'Geography & Environment';
              if (assessmentPath === 'realworld') return 'Economy & Social Dev';
              return 'General Studies';
            } else if (slug === 'python-professional-developer') {
              if (assessmentPath === 'basic') {
                if (lower.includes('list') || lower.includes('dict') || lower.includes('tuple') || lower.includes('set')) return 'Data Structures & Types';
                if (lower.includes('if') || lower.includes('for') || lower.includes('while') || lower.includes('loop')) return 'Control Flow';
                if (lower.includes('string') || lower.includes('print')) return 'Strings & Output';
                return 'Python Basics';
              }
              if (assessmentPath === 'intermediate') {
                if (lower.includes('list') || lower.includes('dict') || lower.includes('tuple') || lower.includes('set') || lower.includes('array')) return 'Data Structures';
                if (lower.includes('def') || lower.includes('return') || lower.includes('function') || lower.includes('args') || lower.includes('kwargs')) return 'Functions & Scope';
                return 'Core Programming';
              }
              if (assessmentPath === 'advanced') {
                if (lower.includes('class') || lower.includes('inheritance') || lower.includes('polymorphism') || lower.includes('self') || lower.includes('object') || lower.includes('method') || lower.includes('dunder') || lower.includes('__init__')) return 'Object-Oriented Programming';
                if (lower.includes('memory') || lower.includes('ref') || lower.includes('pointer') || lower.includes('garbage')) return 'Memory Management';
                if (lower.includes('decorator') || lower.includes('generator') || lower.includes('lambda') || lower.includes('yield')) return 'Advanced Python Features';
                return 'Advanced Concepts';
              }
              if (assessmentPath === 'realworld') {
                if (lower.includes('json') || lower.includes('api') || lower.includes('request') || lower.includes('http')) return 'APIs & Networking';
                if (lower.includes('file') || lower.includes('open') || lower.includes('read') || lower.includes('write')) return 'File Handling & IO';
                if (lower.includes('sql') || lower.includes('db') || lower.includes('database')) return 'Databases';
                return 'System Integrations';
              }
              if (lower.includes('class') || lower.includes('object') || lower.includes('inheritance')) return 'Object-Oriented Programming';
              if (lower.includes('list') || lower.includes('dict') || lower.includes('tuple') || lower.includes('set')) return 'Data Structures';
              return 'Python Primitives';
            } else {
              if (assessmentPath === 'basic') {
                if (lower.includes('html') || lower.includes('tag') || lower.includes('<')) return 'HTML Fundamentals';
                if (lower.includes('css') || lower.includes('style') || lower.includes('color')) return 'CSS Basics';
                if (lower.includes('accessibility') || lower.includes('aria')) return 'Accessibility';
                return 'Web Foundations';
              }
              if (assessmentPath === 'intermediate') {
                if (lower.includes('react') || lower.includes('component') || lower.includes('hook') || lower.includes('state')) return 'React Fundamentals';
                if (lower.includes('css') || lower.includes('tailwind') || lower.includes('flex') || lower.includes('grid')) return 'Advanced Styling';
                return 'Frontend Frameworks';
              }
              if (assessmentPath === 'advanced') {
                if (lower.includes('api') || lower.includes('fetch') || lower.includes('http')) return 'Web APIs';
                if (lower.includes('node') || lower.includes('express') || lower.includes('server')) return 'Backend Basics';
                return 'Backend APIs';
              }
              if (assessmentPath === 'realworld') {
                if (lower.includes('sql') || lower.includes('mongo') || lower.includes('database') || lower.includes('db')) return 'Databases';
                if (lower.includes('docker') || lower.includes('deploy') || lower.includes('ci/cd') || lower.includes('git')) return 'DevOps';
                return 'Databases & DevOps';
              }
              return 'Core Web Concepts';
            }
          };

          // Section performance calculation
          const sections: Record<string, { total: number; attempted: number; correct: number }> = {};
          assessmentQuestions.forEach(q => {
            const secName = getTopicName(q.question);
            if (!sections[secName]) {
              sections[secName] = { total: 0, attempted: 0, correct: 0 };
            }
            sections[secName].total += 1;
            if (assessmentAnswers[q.id]) {
              sections[secName].attempted += 1;
              if (assessmentAnswers[q.id] === q.correctAnswer) {
                sections[secName].correct += 1;
              }
            }
          });

          const strengths: string[] = [];
          const improvements: string[] = [];
          Object.entries(sections).forEach(([secName, metric]) => {
            const secPct = metric.total > 0 ? Math.round((metric.correct / metric.total) * 100) : 0;
            if (secPct >= 80) {
              strengths.push(secName);
            } else {
              improvements.push(secName);
            }
          });

          const mNames = slug === 'fullstack-mastery'
            ? ['Web Foundations', 'Frontend Frameworks', 'Backend APIs', 'Databases & DevOps', 'Final Assessment']
            : slug === 'ias-preparation'
              ? ['Polity & Governance', 'History & Culture', 'Geography & Environment', 'Economy & Social Dev', 'Final Assessment']
              : slug === 'advanced-excel-certification-exam'
                ? ['Data Clean & Format', 'Advanced Lookups', 'Power Pivot Models', 'MIS Dashboards', 'Final Assessment']
                : ['Python Primitives', 'Object Oriented Programming', 'System Integrations', 'Final Certification', 'Final Certification'];
          let mName = "Module";
          if (assessmentPath === 'basic') mName = mNames[0];
          else if (assessmentPath === 'intermediate') mName = mNames[1];
          else if (assessmentPath === 'advanced') mName = mNames[2];
          else if (assessmentPath === 'realworld') mName = mNames[3];
          else if (assessmentPath === 'final') mName = mNames[4];

          const isDark = theme === 'dark';

          return (
            <div className={`fixed inset-0 z-[120] flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#020617]/85 text-[#F8FAFC]' : 'bg-[#F8FAFC]/85 text-[#111827]'} backdrop-blur-[8px]`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 -z-10"
              />

              <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 30, stiffness: 250 }}
                className={`relative border rounded-2xl p-8 md:p-10 max-w-2xl w-full ${isDark ? 'bg-[#131B2E] border-slate-750/80 shadow-[0_0_50px_rgba(59,130,246,0.15),0_25px_60px_-15px_rgba(0,0,0,0.8)]' : 'bg-white border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)]'} flex flex-col font-sans mb-10`}
              >
                {/* Minimal Header */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Module Cleared</span>
                  <h3 className={`text-lg md:text-xl font-extrabold mt-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{mName} Assessment</h3>
                </div>

                {/* Minimal Row-based Metrics Grid */}
                <div className={`grid grid-cols-3 gap-2 py-5 border-t border-b ${isDark ? 'border-slate-800/60' : 'border-slate-100'} mb-8`}>
                  <div className="text-center">
                    <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Score</div>
                    <div className={`text-base md:text-lg font-extrabold mt-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{correctQ} / {totalQ}</div>
                  </div>
                  <div className={`text-center border-l ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy</div>
                    <div className="text-base md:text-lg font-extrabold mt-1.5 text-emerald-400">{pct}%</div>
                  </div>
                  <div className={`text-center border-l ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Duration</div>
                    <div className={`text-base md:text-lg font-semibold mt-1.5 font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{timeTakenFormatted}</div>
                  </div>
                </div>

                {/* Performance by Topic Breakdown */}
                <div className="space-y-4 mb-8 text-left">
                  <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Topic Performance</div>
                  <div className="space-y-3.5">
                    {Object.entries(sections).map(([secName, metric]) => {
                      const secPct = metric.total > 0 ? Math.round((metric.correct / metric.total) * 100) : 0;
                      return (
                        <div key={secName} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>{secName}</span>
                            <span className={secPct >= 80 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>{secPct}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                            <div className={`h-full rounded-full transition-all duration-500 ${secPct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${secPct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Minimal Strengths & Areas For Improvement Lists */}
                {(strengths.length > 0 || improvements.length > 0) && (
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-100'} mb-8 text-left`}>
                    {strengths.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-emerald-400">Strengths</div>
                        <ul className="space-y-1.5 text-xs md:text-sm">
                          {strengths.map((str, sIdx) => (
                            <li key={sIdx} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {improvements.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-amber-400">Needs Focus</div>
                        <ul className="space-y-1.5 text-xs md:text-sm">
                          {improvements.map((imp, iIdx) => (
                            <li key={iIdx} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className={`flex flex-col sm:flex-row gap-3 pt-5 border-t justify-end w-full ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                  <button
                    onClick={() => {
                      setShowModulePassOverlay(false);
                      setAssessmentActive(false);
                      setAssessmentSubmitted(false);
                    }}
                    className={`px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all active:scale-98 border ${isDark ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200'}`}
                  >
                    Review Material
                  </button>
                  <button
                    onClick={() => {
                      let currentIdx = 0;
                      if (assessmentPath === 'basic') currentIdx = 0;
                      else if (assessmentPath === 'intermediate') currentIdx = 1;
                      else if (assessmentPath === 'advanced') currentIdx = 2;
                      else if (assessmentPath === 'realworld') currentIdx = 3;
                      else if (assessmentPath === 'final') currentIdx = 4;

                      const nextIdx = currentIdx + 1;

                      setShowModulePassOverlay(false);
                      setAssessmentSubmitted(false);

                      const nextPillId = `ms-${nextIdx + 1}`;
                      setOpenMilestones({
                        'ms-1': nextPillId === 'ms-1',
                        'ms-2': nextPillId === 'ms-2',
                        'ms-3': nextPillId === 'ms-3',
                        'ms-4': nextPillId === 'ms-4',
                      });

                      setCheatWarnings(0);
                      const initialStates: Record<number, 'answered' | 'not-answered' | 'marked' | 'marked-answered' | 'not-visited'> = { 0: 'not-answered' };
                      setQuestionStates(initialStates);

                      if (nextIdx === 4 || (nextIdx === 3 && passedMilestones[3])) {
                        // Final exam
                        setAssessmentPath(slug === 'fullstack-mastery' ? 'final' : 'advanced');
                        setAssessmentActive(true);
                        setAssessmentQuestionIdx(0);
                        setAssessmentAttempt(prev => prev + 1);
                        setAssessmentAnswers({});
                        setAssessmentTimeLeft(3600);
                        setExamDuration(3600);
                      } else {
                        // Milestone 1 to 4
                        const pathKeys: ('basic' | 'intermediate' | 'advanced' | 'realworld')[] = ['basic', 'intermediate', 'advanced', 'realworld'];
                        const pathKey = pathKeys[nextIdx] || 'basic';
                        setAssessmentPath(pathKey);
                        setAssessmentActive(true);
                        setAssessmentQuestionIdx(0);
                        setAssessmentAttempt(prev => prev + 1);
                        setAssessmentAnswers({});
                        setAssessmentTimeLeft(1200);
                        setExamDuration(1200);
                      }
                    }}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    Continue Path <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* Module Fail Overlay */}
        {showModuleFailOverlay && (() => {
          const totalQ = assessmentQuestions.length;
          const attemptedQ = Object.keys(assessmentAnswers).length;
          const correctQ = correctCount;
          const incorrectQ = Math.max(0, attemptedQ - correctQ);
          const skippedQ = totalQ - attemptedQ;
          const pct = assessmentScore;

          const takenMins = Math.floor(timeTakenSeconds / 60);
          const takenSecs = timeTakenSeconds % 60;
          const timeTakenFormatted = `${takenMins}m ${takenSecs}s`;

          // Dynamic category naming helper
          const getTopicName = (qText: string) => {
            const lower = qText.toLowerCase();
            if (slug === 'advanced-excel-certification-exam') {
              if (assessmentPath === 'basic') {
                if (lower.includes('format') || lower.includes('color') || lower.includes('conditional')) return 'Conditional Formatting';
                if (lower.includes('clean') || lower.includes('trim') || lower.includes('text')) return 'Data Cleaning';
                return 'Data Preparation';
              }
              if (assessmentPath === 'intermediate') {
                if (lower.includes('vlookup') || lower.includes('hlookup')) return 'VLOOKUP & HLOOKUP';
                if (lower.includes('xlookup')) return 'XLOOKUP';
                if (lower.includes('index') || lower.includes('match')) return 'INDEX & MATCH';
                return 'Advanced Lookups';
              }
              if (assessmentPath === 'advanced') {
                if (lower.includes('pivot')) return 'Pivot Tables';
                if (lower.includes('power') || lower.includes('dax')) return 'Power Pivot & DAX';
                if (lower.includes('model') || lower.includes('relation')) return 'Data Modeling';
                return 'Advanced Modeling';
              }
              if (assessmentPath === 'realworld') {
                if (lower.includes('chart') || lower.includes('graph')) return 'Advanced Charting';
                if (lower.includes('dashboard') || lower.includes('interactive')) return 'Interactive Dashboards';
                if (lower.includes('macro') || lower.includes('vba')) return 'Macros & Automation';
                return 'MIS Reporting';
              }
              if (lower.includes('lookup') || lower.includes('match')) return 'Lookups';
              if (lower.includes('pivot') || lower.includes('dax')) return 'Data Modeling';
              return 'Core Excel Functions';
            } else if (slug === 'ias-preparation') {
              if (assessmentPath === 'basic') return 'Polity & Governance';
              if (assessmentPath === 'intermediate') return 'History & Culture';
              if (assessmentPath === 'advanced') return 'Geography & Environment';
              if (assessmentPath === 'realworld') return 'Economy & Social Dev';
              return 'General Studies';
            } else if (slug === 'python-professional-developer') {
              if (assessmentPath === 'basic') {
                if (lower.includes('list') || lower.includes('dict') || lower.includes('tuple') || lower.includes('set')) return 'Data Structures & Types';
                if (lower.includes('if') || lower.includes('for') || lower.includes('while') || lower.includes('loop')) return 'Control Flow';
                if (lower.includes('string') || lower.includes('print')) return 'Strings & Output';
                return 'Python Basics';
              }
              if (assessmentPath === 'intermediate') {
                if (lower.includes('list') || lower.includes('dict') || lower.includes('tuple') || lower.includes('set') || lower.includes('array')) return 'Data Structures';
                if (lower.includes('def') || lower.includes('return') || lower.includes('function') || lower.includes('args') || lower.includes('kwargs')) return 'Functions & Scope';
                return 'Core Programming';
              }
              if (assessmentPath === 'advanced') {
                if (lower.includes('class') || lower.includes('inheritance') || lower.includes('polymorphism') || lower.includes('self') || lower.includes('object') || lower.includes('method') || lower.includes('dunder') || lower.includes('__init__')) return 'Object-Oriented Programming';
                if (lower.includes('memory') || lower.includes('ref') || lower.includes('pointer') || lower.includes('garbage')) return 'Memory Management';
                if (lower.includes('decorator') || lower.includes('generator') || lower.includes('lambda') || lower.includes('yield')) return 'Advanced Python Features';
                return 'Advanced Concepts';
              }
              if (assessmentPath === 'realworld') {
                if (lower.includes('json') || lower.includes('api') || lower.includes('request') || lower.includes('http')) return 'APIs & Networking';
                if (lower.includes('file') || lower.includes('open') || lower.includes('read') || lower.includes('write')) return 'File Handling & IO';
                if (lower.includes('sql') || lower.includes('db') || lower.includes('database')) return 'Databases';
                return 'System Integrations';
              }
              if (lower.includes('class') || lower.includes('object') || lower.includes('inheritance')) return 'Object-Oriented Programming';
              if (lower.includes('list') || lower.includes('dict') || lower.includes('tuple') || lower.includes('set')) return 'Data Structures';
              return 'Python Primitives';
            } else {
              if (assessmentPath === 'basic') {
                if (lower.includes('html') || lower.includes('tag') || lower.includes('<')) return 'HTML Fundamentals';
                if (lower.includes('css') || lower.includes('style') || lower.includes('color')) return 'CSS Basics';
                if (lower.includes('accessibility') || lower.includes('aria')) return 'Accessibility';
                return 'Web Foundations';
              }
              if (assessmentPath === 'intermediate') {
                if (lower.includes('react') || lower.includes('component') || lower.includes('hook') || lower.includes('state')) return 'React Fundamentals';
                if (lower.includes('css') || lower.includes('tailwind') || lower.includes('flex') || lower.includes('grid')) return 'Advanced Styling';
                return 'Frontend Frameworks';
              }
              if (assessmentPath === 'advanced') {
                if (lower.includes('api') || lower.includes('fetch') || lower.includes('http')) return 'Web APIs';
                if (lower.includes('node') || lower.includes('express') || lower.includes('server')) return 'Backend Basics';
                return 'Backend APIs';
              }
              if (assessmentPath === 'realworld') {
                if (lower.includes('sql') || lower.includes('mongo') || lower.includes('database') || lower.includes('db')) return 'Databases';
                if (lower.includes('docker') || lower.includes('deploy') || lower.includes('ci/cd') || lower.includes('git')) return 'DevOps';
                return 'Databases & DevOps';
              }
              return 'Core Web Concepts';
            }
          };

          // Section performance calculation
          const sections: Record<string, { total: number; attempted: number; correct: number }> = {};
          assessmentQuestions.forEach(q => {
            const secName = getTopicName(q.question);
            if (!sections[secName]) {
              sections[secName] = { total: 0, attempted: 0, correct: 0 };
            }
            sections[secName].total += 1;
            if (assessmentAnswers[q.id]) {
              sections[secName].attempted += 1;
              if (assessmentAnswers[q.id] === q.correctAnswer) {
                sections[secName].correct += 1;
              }
            }
          });

          const strengths: string[] = [];
          const improvements: string[] = [];
          Object.entries(sections).forEach(([secName, metric]) => {
            const secPct = metric.total > 0 ? Math.round((metric.correct / metric.total) * 100) : 0;
            if (secPct >= 80) {
              strengths.push(secName);
            } else {
              improvements.push(secName);
            }
          });

          const mNames = slug === 'fullstack-mastery'
            ? ['Web Foundations', 'Frontend Frameworks', 'Backend APIs', 'Databases & DevOps', 'Final Assessment']
            : slug === 'ias-preparation'
              ? ['Polity & Governance', 'History & Culture', 'Geography & Environment', 'Economy & Social Dev', 'Final Assessment']
              : slug === 'advanced-excel-certification-exam'
                ? ['Data Clean & Format', 'Advanced Lookups', 'Power Pivot Models', 'MIS Dashboards', 'Final Assessment']
                : ['Python Primitives', 'Object Oriented Programming', 'System Integrations', 'Final Certification', 'Final Certification'];
          let mName = "Module";
          if (assessmentPath === 'basic') mName = mNames[0];
          else if (assessmentPath === 'intermediate') mName = mNames[1];
          else if (assessmentPath === 'advanced') mName = mNames[2];
          else if (assessmentPath === 'realworld') mName = mNames[3];
          else if (assessmentPath === 'final') mName = mNames[4];

          const isDark = theme === 'dark';

          return (
            <div className={`fixed inset-0 z-[120] flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#020617]/85 text-[#F8FAFC]' : 'bg-[#F8FAFC]/85 text-[#111827]'} backdrop-blur-[8px]`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 -z-10"
              />

              <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 30, stiffness: 250 }}
                className={`relative border rounded-2xl p-8 md:p-10 max-w-2xl w-full ${isDark ? 'bg-[#131B2E] border-slate-750/80 shadow-[0_0_50px_rgba(239,68,68,0.12),0_25px_60px_-15px_rgba(0,0,0,0.8)]' : 'bg-white border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)]'} flex flex-col font-sans mb-10`}
              >
                {/* Minimal Header */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 text-rose-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.2em] text-rose-450 uppercase">Module Not Cleared</span>
                  <h3 className={`text-lg md:text-xl font-extrabold mt-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{mName} Assessment</h3>
                </div>

                {/* Minimal Row-based Metrics Grid */}
                <div className={`grid grid-cols-3 gap-2 py-5 border-t border-b ${isDark ? 'border-slate-800/60' : 'border-slate-100'} mb-8`}>
                  <div className="text-center">
                    <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Score</div>
                    <div className={`text-base md:text-lg font-extrabold mt-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{correctQ} / {totalQ}</div>
                  </div>
                  <div className={`text-center border-l ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy</div>
                    <div className="text-base md:text-lg font-extrabold mt-1.5 text-rose-400">{pct}%</div>
                  </div>
                  <div className={`text-center border-l ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Duration</div>
                    <div className={`text-base md:text-lg font-semibold mt-1.5 font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{timeTakenFormatted}</div>
                  </div>
                </div>

                {/* Performance by Topic Breakdown */}
                <div className="space-y-4 mb-8 text-left">
                  <div className={`text-[10px] md:text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Topic Performance</div>
                  <div className="space-y-3.5">
                    {Object.entries(sections).map(([secName, metric]) => {
                      const secPct = metric.total > 0 ? Math.round((metric.correct / metric.total) * 100) : 0;
                      return (
                        <div key={secName} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>{secName}</span>
                            <span className={secPct >= 80 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>{secPct}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                            <div className={`h-full rounded-full transition-all duration-500 ${secPct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${secPct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Minimal Strengths & Areas For Improvement Lists */}
                {(strengths.length > 0 || improvements.length > 0) && (
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-100'} mb-8 text-left`}>
                    {strengths.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-emerald-400">Strengths</div>
                        <ul className="space-y-1.5 text-xs md:text-sm">
                          {strengths.map((str, sIdx) => (
                            <li key={sIdx} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {improvements.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-amber-400">Needs Focus</div>
                        <ul className="space-y-1.5 text-xs md:text-sm">
                          {improvements.map((imp, iIdx) => (
                            <li key={iIdx} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-680'}`}>
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className={`flex flex-col sm:flex-row gap-3 pt-5 border-t justify-end w-full ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                  <button
                    onClick={() => {
                      setShowModuleFailOverlay(false);
                      setAssessmentActive(false);
                      setAssessmentSubmitted(false);
                    }}
                    className={`px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all active:scale-98 border ${isDark ? 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 border-slate-800' : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'}`}
                  >
                    Exit
                  </button>
                  <button
                    onClick={() => {
                      setShowModuleFailOverlay(false);
                      setAssessmentActive(false);
                      setAssessmentSubmitted(false);
                    }}
                    className={`px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all active:scale-98 border ${isDark ? 'bg-slate-800/40 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-650 border-slate-200'}`}
                  >
                    Review Material
                  </button>
                  <button
                    onClick={() => {
                      setShowModuleFailOverlay(false);
                      setAssessmentActive(false);
                      setAssessmentSubmitted(true);
                    }}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    View Performance
                  </button>
                  <button
                    onClick={() => {
                      setShowModuleFailOverlay(false);
                      setCheatWarnings(0);
                      setQuestionStates({ 0: 'not-answered' });
                      setExamDuration(1200);
                      setAssessmentActive(true);
                      setAssessmentQuestionIdx(0);
                      setAssessmentAttempt(prev => prev + 1);
                      setAssessmentAnswers({});
                      setAssessmentTimeLeft(1200);
                      setAssessmentSubmitted(false);
                    }}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all active:scale-98 flex items-center justify-center"
                  >
                    Retry Assessment
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* Final Pass Premium Success Experience Overlay */}
        {showFinalPassOverlay && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-[#070b13]/95 border border-amber-500/20 rounded-3xl p-5 sm:p-8 md:p-12 max-w-2xl w-full text-center text-white shadow-[0_0_80px_rgba(229,169,59,0.15)] flex flex-col items-center backdrop-blur-xl my-auto"
            >
              {/* Large Gold Ring & Checkmark Animation */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                {/* Soft pulse glow background */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    delay: 1.2,
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl"
                />

                {/* SVG Ring & Checkmark */}
                <svg className="w-full h-full transform -rotate-90 z-10" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E5A93B"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                {/* Checkmark */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <svg className="w-16 h-16 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1, duration: 0.6, ease: "easeInOut" }}
                    />
                  </svg>
                </div>
              </div>

              {/* Progress & Badge animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase mb-6"
              >
                <Trophy className="w-4 h-4 animate-bounce text-amber-500" /> 100% Progress Complete • Achievement Badge Unlocked
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="space-y-4 w-full"
              >
                <div className="text-xs font-black tracking-widest text-amber-400 uppercase">🏆 CERTIFICATION COMPLETED</div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                  {slug === 'fullstack-mastery' ? 'Full Stack Web Development Mastery' : 'Python Professional Developer'}
                </h3>
                <p className="text-amber-400 font-extrabold text-sm uppercase tracking-wider">Congratulations!</p>

                <p className="text-slate-400 text-sm font-semibold max-w-md mx-auto leading-relaxed">
                  You have successfully completed all required assessments.
                </p>

                {/* Live Certificate Preview */}
                <div className="flex justify-center my-6">
                  <div
                    className="w-full max-w-[420px] aspect-[1.58] rounded-2xl bg-gradient-to-br from-[#111827] to-[#030712] border border-amber-500/20 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between text-left"
                    id="completion-certificate-preview"
                  >
                    {/* Gold/blue subtle badges */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-amber-500 tracking-widest block uppercase">Professional Credential</span>
                        <span className="text-[14px] font-black text-white tracking-wide block mt-0.5">SARTHI</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 font-mono tracking-wider">ID: {credentialId || getCertificateId()}</span>
                    </div>

                    <div className="my-3 text-left">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">CANDIDATE</span>
                      <span className="text-lg font-black text-white block truncate leading-none mt-0.5">{user?.name || 'Mohit Raj'}</span>
                      <span className="text-[9px] font-semibold text-slate-400 mt-2 block font-sans">
                        has successfully completed all assessment milestones for
                      </span>
                      <span className="text-xs font-black text-amber-400 block uppercase tracking-wide mt-0.5 leading-tight">
                        {slug === 'fullstack-mastery' ? 'Full Stack Web Development Mastery' : slug === 'ias-preparation' ? 'UPSC Civil Services Preparation' : 'Python Professional Developer'}
                      </span>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-800/80 pt-3 mt-1">
                      <div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider font-sans">ISSUE DATE</span>
                        <span className="text-[10px] font-extrabold text-slate-300 block font-mono mt-0.5">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Verification QR */}
                      <div className="w-12 h-12 bg-white rounded p-0.5 shrink-0 flex items-center justify-center shadow-md">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                            typeof window !== 'undefined' ? `${window.location.origin}/certification-exams/verify/${credentialId || getCertificateId()}` : `/certification-exams/verify/${credentialId || getCertificateId()}`
                          )}`}
                          alt="Verification QR"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Ready Section */}
                <div className="bg-[#020617]/50 border border-amber-500/20 rounded-2xl p-6 my-6 text-center space-y-4 w-full">
                  <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Certificate Ready</p>

                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer justify-center"
                    >
                      <Award className="w-4 h-4" /> Download Certificate
                    </button>

                    <button
                      onClick={() => setIsCertViewerOpen(true)}
                      className="px-5 py-3.5 bg-[#0F172A] hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border border-slate-800 cursor-pointer"
                    >
                      View Certificate
                    </button>

                    <button
                      onClick={() => setIsCertViewerOpen(true)}
                      className="px-5 py-3.5 bg-[#0F172A] hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border border-slate-800 cursor-pointer"
                    >
                      Verify Certificate
                    </button>
                  </div>

                  <div className="h-[1px] bg-slate-800/80 my-4" />

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleLinkedInShare}
                      className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Add To LinkedIn
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`I successfully completed the Full Stack Web Development Mastery Certification from SARTHI! Verify: https://sarthi-woad.vercel.app/certification-exams/verify/${credentialId || getCertificateId()}`);
                        toast.success('Share link copied to clipboard!');
                      }}
                      className="px-5 py-3.5 bg-[#0F172A] hover:bg-slate-900 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-850 cursor-pointer"
                    >
                      Share Achievement
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setShowFinalPassOverlay(false);
                      setAssessmentActive(false);
                      setAssessmentSubmitted(false);
                    }}
                    className="w-full px-8 py-4.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-800 text-slate-300 font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-all"
                  >
                    Close & Return to Dashboard
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Custom Submit Confirm Modal */}
        {showSubmitConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020617]/50 backdrop-blur-md"
              onClick={() => setShowSubmitConfirmModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#0F172A] border border-slate-800 rounded-[20px] p-5 sm:p-8 max-w-md w-full text-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col font-sans animate-fade-scale my-auto"
            >
              <h3 className="text-xl font-extrabold tracking-tight text-white mb-2">
                Submit Assessment
              </h3>
              <p className="text-sm font-semibold text-slate-400 mb-6">
                You are about to submit your assessment. Please review the details below before continuing.
              </p>

              {/* Stats Panel */}
              <div className="bg-[#1E293B]/50 border border-slate-800/80 rounded-2xl p-5 mb-6 text-left space-y-3.5">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Module Name</span>
                  <span className="text-slate-200 font-extrabold">{
                    (() => {
                      const mNames = slug === 'fullstack-mastery'
                        ? ['Web Foundations', 'Frontend Frameworks', 'Backend APIs', 'Databases & DevOps', 'Final Assessment']
                        : slug === 'ias-preparation'
                          ? ['Polity & Governance', 'History & Culture', 'Geography & Environment', 'Economy & Social Dev', 'Final Assessment']
                          : slug === 'advanced-excel-certification-exam'
                            ? ['Data Clean & Format', 'Advanced Lookups', 'Power Pivot Models', 'MIS Dashboards', 'Final Assessment']
                            : ['Python Primitives', 'Object Oriented Programming', 'System Integrations', 'Final Certification', 'Final Certification'];
                      if (assessmentPath === 'basic') return mNames[0];
                      if (assessmentPath === 'intermediate') return mNames[1];
                      if (assessmentPath === 'advanced') return mNames[2];
                      if (assessmentPath === 'realworld') return mNames[3];
                      return mNames[4];
                    })()
                  }</span>
                </div>
                <div className="h-[1px] bg-slate-800" />
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Questions Attempted</span>
                  <span className="text-slate-200 font-extrabold">{Object.keys(assessmentAnswers).length} / {assessmentQuestions.length}</span>
                </div>
                <div className="h-[1px] bg-slate-800" />
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Marked For Review</span>
                  <span className="text-slate-200 font-extrabold">
                    {Object.values(questionStates).filter(v => v === 'marked' || v === 'marked-answered').length}
                  </span>
                </div>
                <div className="h-[1px] bg-slate-800" />
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Unanswered</span>
                  <span className="text-slate-200 font-extrabold">
                    {assessmentQuestions.length - Object.keys(assessmentAnswers).length}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3.5">
                <button
                  onClick={() => setShowSubmitConfirmModal(false)}
                  className="flex-1 px-5 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-700 shadow-sm"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    setShowSubmitConfirmModal(false);
                    submitAssessment();
                  }}
                  className="flex-1 px-5 py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Leave Warning Modal */}
        {showLeaveWarningModal && (
          <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020617]/50 backdrop-blur-md"
              onClick={() => setShowLeaveWarningModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white border border-slate-200 rounded-[20px] p-5 sm:p-8 max-w-md w-full text-slate-800 shadow-[0_15px_50px_rgba(0,0,0,0.06)] flex flex-col font-sans animate-fade-scale my-auto"
            >
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mb-2">
                Leave Assessment?
              </h3>
              <p className="text-sm font-semibold text-slate-550 mb-6">
                Your progress has been saved. Are you sure you want to leave this assessment?
              </p>

              {/* Buttons */}
              <div className="flex gap-3.5">
                <button
                  onClick={() => setShowLeaveWarningModal(false)}
                  className="flex-1 px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-200 shadow-sm"
                >
                  Stay Here
                </button>
                <button
                  onClick={() => {
                    setShowLeaveWarningModal(false);
                    setAssessmentActive(false);
                    setAssessmentSubmitted(false);
                  }}
                  className="flex-1 px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Leave Assessment
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Alert Modal */}
        {customAlertModal.show && (
          <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020617]/50 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white border border-slate-200 rounded-[20px] p-5 sm:p-8 max-w-md w-full text-slate-800 shadow-[0_15px_50px_rgba(0,0,0,0.06)] flex flex-col font-sans animate-fade-scale my-auto"
            >
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mb-2">
                {customAlertModal.title}
              </h3>
              <p className="text-sm font-semibold text-slate-550 mb-6">
                {customAlertModal.description}
              </p>

              {/* Button */}
              <button
                onClick={() => {
                  const onClose = customAlertModal.onClose;
                  setCustomAlertModal({ show: false, title: '', description: '' });
                  if (onClose) onClose();
                }}
                className="w-full px-5 py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
              >
                Acknowledge
              </button>
            </motion.div>
          </div>
        )}

        {isCertViewerOpen && (
          <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto no-print-backdrop">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCertViewerOpen(false)}
              className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-5xl bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center z-10 my-auto animate-in duration-300 print-container"
            >
              {/* Header */}
              <div className="w-full flex justify-between items-center pb-4 border-b border-slate-100 mb-6 no-print">
                <div className="flex items-center gap-3">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                    Verified Professional Credential
                  </h3>
                </div>
                <button
                  onClick={() => setIsCertViewerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Certificate Display Area */}
              <div className="w-full max-w-4xl aspect-[1.414/1] rounded-2xl overflow-hidden border border-slate-200/50 shadow-2xl bg-white print-only-target">
                <CertificateTemplate
                  organization="SARTHI"
                  studentName={user?.name || 'Mohit Raj'}
                  courseName={
                    slug === 'fullstack-mastery'
                      ? 'Full Stack Web Development Mastery'
                      : slug === 'ias-preparation'
                        ? 'UPSC Civil Services Preparation'
                        : 'Python Professional Developer'
                  }
                  supportingLineTop="Presented to"
                  supportingLineBottom={
                    slug === 'fullstack-mastery'
                      ? 'For successfully completing the Advanced Full Stack Web Development Certification Program with distinction.'
                      : slug === 'ias-preparation'
                        ? 'For successfully completing the UPSC Civil Services Preparation Certification Program with distinction.'
                        : 'For successfully completing the Python Professional Developer Certification Program with distinction.'
                  }
                  issueDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  dateLabel="Date of Issue"
                  certificateId={credentialId || getCertificateId()}
                  idLabel="Certificate ID"
                  verificationUrl="https://sarthi-woad.vercel.app/certification-exams/verify/"
                  signatureName="Dr. Mukul Pandey"
                  signatureRole="CEO & FOUNDER, SARTHI"
                  signatureLabel="Authorized Signature"
                  qrLabel="Verify Certificate"
                  logoUrl="/sarthi-logo.png"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-4 w-full pt-6 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Download PDF
                </button>
                <button
                  onClick={() => setIsCertViewerOpen(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {mounted && isAllPassed && isPaid && createPortal(
        <div id="cert-print-portal">
          <CertificateTemplate
            organization="SARTHI"
            studentName={user?.name || 'Mohit Raj'}
            courseName={
              slug === 'fullstack-mastery'
                ? 'Full Stack Web Development Mastery'
                : slug === 'ias-preparation'
                  ? 'UPSC Civil Services Preparation'
                  : 'Python Professional Developer'
            }
            supportingLineTop="Presented to"
            supportingLineBottom={
              slug === 'fullstack-mastery'
                ? 'For successfully completing the Advanced Full Stack Web Development Certification Program with distinction.'
                : slug === 'ias-preparation'
                  ? 'For successfully completing the UPSC Civil Services Preparation Certification Program with distinction.'
                  : 'For successfully completing the Python Professional Developer Certification Program with distinction.'
            }
            issueDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            dateLabel="Date of Issue"
            certificateId={credentialId || getCertificateId()}
            idLabel="Certificate ID"
            verificationUrl="https://sarthi-woad.vercel.app/certification-exams/verify/"
            signatureName="Dr. Mukul Pandey"
            signatureRole="CEO & FOUNDER, SARTHI"
            signatureLabel="Authorized Signature"
            qrLabel="Verify Certificate"
            logoUrl="/sarthi-logo.png"
          />
        </div>,
        document.body
      )}

      <style jsx global>{`
        .zoom-30 {
          zoom: 1.00 !important;
        }
        @media (min-width: 640px) {
          .zoom-30 {
            zoom: 1.30 !important;
          }
        }
        #cert-print-portal {
          display: none;
        }
        @media print {
          @page {
            size: 297mm 210mm;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body > *:not(#cert-print-portal) {
            display: none !important;
          }

          html {
            margin:   0 !important;
            padding:  0 !important;
            overflow: hidden !important;
          }
          body {
            margin:     0       !important;
            padding:    0       !important;
            height:     0       !important;
            overflow:   hidden  !important;
            background: #ffffff !important;
          }

          #cert-print-portal {
            display:  block    !important;
            position: fixed    !important;
            top:      0        !important;
            left:     0        !important;
            right:    0        !important;
            bottom:   0        !important;
            width:    100%     !important;
            height:   100%     !important;
            overflow: hidden   !important;
            margin:   0        !important;
            padding:  0        !important;
            z-index:  2147483647 !important;
          }

          #cert-print-portal #professional-certificate-root {
            display:    block  !important;
            position:   static !important;
            width:      100%   !important;
            height:     100%   !important;
            margin:     0      !important;
            padding:    0      !important;
            box-shadow: none   !important;
            border:     none   !important;
            transform:  none   !important;
            zoom:       1      !important;
            overflow:   hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
