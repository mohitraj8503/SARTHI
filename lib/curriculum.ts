import fs from 'fs';
import path from 'path';

export interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'markdown' | 'playground';
  content: string;
  codeSnippet?: string;
  expectedOutput?: string;
}

export interface Module {
  id: string;
  title: string;
  xp: number;
  lessons: Lesson[];
  quiz: any[];
}

export interface PathData {
  slug: string;
  modules: Module[];
}

const PYTHON_BLUEPRINTS: Array<{ title: string; units: string[]; xp: number }> = [
  { title: 'Introduction to Python', xp: 180, units: ['Introduction & Objectives', 'What is Python?', 'Installing Python', 'VS Code Setup', 'Your First Script', 'Syntax Rules & Spacing', 'Comments & Readability', 'Mini Lab', 'Summary', 'Knowledge Check'] },
  { title: 'Variables & Data Types', xp: 180, units: ['Variables', 'Strings', 'Numbers', 'Booleans', 'Type Conversion', 'User Input', 'String Formatting', 'Exercises', 'Mini Project', 'Knowledge Check'] },
  { title: 'Operators & Conditions', xp: 200, units: ['Arithmetic Operators', 'Comparison Operators', 'Logical Operators', 'If Statements', 'Nested Conditions', 'Match Cases', 'Real-world Logic Systems', 'Exercises', 'Lab', 'Knowledge Check'] },
  { title: 'Loops & Iteration', xp: 210, units: ['For Loops', 'While Loops', 'Break & Continue', 'Nested Loops', 'Iteration Patterns', 'Loop Optimization', 'Practice Challenges', 'Mini Lab', 'Summary', 'Knowledge Check'] },
  { title: 'Functions', xp: 230, units: ['Creating Functions', 'Parameters', 'Return Values', 'Scope', 'Lambda Functions', 'Recursive Functions', 'Real-world Use Cases', 'Exercises', 'Mini Project', 'Knowledge Check'] },
  { title: 'Lists & Tuples', xp: 250, units: ['List operations', 'Slicing', 'Sorting', 'Nested lists', 'Tuples', 'Iteration', 'Challenges', 'Quiz'] },
  { title: 'Dictionaries & Sets', xp: 260, units: ['Dictionaries', 'Key-value systems', 'Sets', 'JSON basics', 'Data mapping', 'Exercises', 'Lab', 'Quiz'] },
  { title: 'File Handling', xp: 260, units: ['Reading files', 'Writing files', 'CSV', 'JSON', 'File paths', 'Error handling', 'Real-world storage systems', 'Quiz'] },
  { title: 'Exception Handling', xp: 300, units: ['try/except', 'finally', 'custom exceptions', 'debugging', 'logging', 'safe applications', 'Quiz'] },
  { title: 'Modules & Packages', xp: 330, units: ['imports', 'custom modules', 'package systems', 'pip', 'virtual environments', 'dependency management', 'Quiz'] },
  { title: 'Object Oriented Programming', xp: 300, units: ['classes', 'objects', 'constructors', 'methods', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'Quiz'] },
  { title: 'Advanced OOP Patterns', xp: 320, units: ['composition', 'decorators', 'dunder methods', 'dataclasses', 'design patterns', 'Quiz'] },
  { title: 'Databases with SQLite', xp: 320, units: ['SQL basics', 'CRUD', 'SQLite integration', 'schema design', 'relationships', 'real-world systems', 'Quiz'] },
  { title: 'APIs & Requests', xp: 330, units: ['REST APIs', 'requests library', 'JSON APIs', 'authentication', 'API integrations', 'Quiz'] },
  { title: 'Automation & Web Scraping', xp: 330, units: ['BeautifulSoup', 'Selenium basics', 'automation workflows', 'scheduled tasks', 'scraping ethics', 'Quiz'] },
  { title: 'Flask Fundamentals', xp: 350, units: ['Flask setup', 'routes', 'templates', 'forms', 'rendering', 'Quiz'] },
  { title: 'Flask APIs', xp: 390, units: ['API architecture', 'REST endpoints', 'authentication', 'JSON responses', 'CRUD APIs', 'Quiz'] },
  { title: 'Git & GitHub', xp: 380, units: ['Git basics', 'commits', 'branches', 'GitHub workflows', 'collaboration', 'Quiz'] },
  { title: 'Deployment Basics', xp: 420, units: ['deployment concepts', 'Render/Railway', 'environment variables', 'production basics', 'debugging', 'Quiz'] },
  { title: 'Final Capstone Project', xp: 460, units: ['Capstone scope', 'Flask backend', 'Authentication', 'SQLite integration', 'REST API implementation', 'GitHub integration', 'Deployment pipeline', 'Documentation', 'Demo Review', 'Capstone Evaluation'] }
];

export function parseMDX(filePath: string): Omit<Lesson, 'id'> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parts = fileContent.split('---');
  
  if (parts.length < 3) {
    return {
      title: path.basename(filePath, '.mdx'),
      duration: 15,
      type: 'markdown',
      content: fileContent,
    };
  }

  const frontmatterText = parts[1];
  const bodyContent = parts.slice(2).join('---').trim();

  const metadata: Record<string, any> = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const val = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key) {
        if (key === 'duration' || key === 'xp') {
          metadata[key] = parseInt(val, 10);
        } else {
          metadata[key] = val;
        }
      }
    }
  });

  // Extract codeSnippet and expectedOutput from <LiveSandbox /> component
  let codeSnippet: string | undefined = undefined;
  let expectedOutput: string | undefined = undefined;

  const sandboxMatch = bodyContent.match(/<LiveSandbox[\s\S]*?\/>/);
  if (sandboxMatch) {
    const sandboxTag = sandboxMatch[0];
    const codeMatch = sandboxTag.match(/initialCode=(?:\{?`([\s\S]*?)`\}?|"([\s\S]*?)"|'([\s\S]*?)')/);
    const expectedMatch = sandboxTag.match(/expectedOutput=(?:\{?`([\s\S]*?)`\}?|"([\s\S]*?)"|'([\s\S]*?)')/);
    
    if (codeMatch) {
      codeSnippet = (codeMatch[1] || codeMatch[2] || codeMatch[3] || '').trim();
    }
    if (expectedMatch) {
      const rawExpected = expectedMatch[1] || expectedMatch[2] || expectedMatch[3] || '';
      expectedOutput = rawExpected.replace(/\\n/g, '\n').trim();
    }
  }

  const isPlayground = metadata.type === 'interactive-lesson' || !!codeSnippet;

  return {
    title: metadata.title || path.basename(filePath, '.mdx'),
    duration: metadata.duration || 15,
    type: isPlayground ? 'playground' : 'markdown',
    content: bodyContent,
    codeSnippet,
    expectedOutput,
  };
}

export function getCurriculumPath(slug: string): PathData {
  const basePath = path.join(process.cwd(), 'data', 'curriculum', slug);
  const modules: Module[] = [];

  // Define fallback/stub quiz questions for lessons
  const fallbackQuiz = [
    {
      question: "Which of the following describes the execution model of an interpreted language like Python?",
      options: [
        "It translates the entire source file to binary instructions before running it.",
        "It executes commands sequentially, line-by-line, on the fly.",
        "It requires a linking stage to bind static libraries before processing.",
        "It runs all lines concurrently in parallel threads."
      ],
      correctIdx: 1,
      explanation: "Python runs line-by-line via the interpreter, halting immediately if it encounters an error on any line."
    }
  ];

  PYTHON_BLUEPRINTS.forEach((blueprint, idx) => {
    const moduleNo = idx + 1;
    const moduleDirName = `module-${moduleNo.toString().padStart(2, '0')}`;
    const modulePath = path.join(basePath, moduleDirName);
    const lessonsPath = path.join(modulePath, 'lessons');

    let lessons: Lesson[] = [];

    // Attempt to load static MDX lessons from filesystem
    if (fs.existsSync(lessonsPath)) {
      try {
        const files = fs.readdirSync(lessonsPath)
          .filter(f => f.endsWith('.mdx'))
          .sort(); // Sort files to ensure sequence order

        files.forEach((file, fileIdx) => {
          const filePath = path.join(lessonsPath, file);
          const parsed = parseMDX(filePath);
          const unitNo = fileIdx + 1;
          lessons.push({
            id: `py-l-${moduleNo}-${unitNo}`,
            ...parsed,
          });
        });
      } catch (err) {
        console.error(`Error loading modules in ${lessonsPath}:`, err);
      }
    }

    // If no static files found, generate resilient, clean placeholders adhering to blueprints
    if (lessons.length === 0) {
      lessons = blueprint.units.map((unit, unitIdx) => {
        const unitNo = unitIdx + 1;
        const isPlayground = /lab|project|challenge|evaluation|implementation/i.test(unit);
        return {
          id: `py-l-${moduleNo}-${unitNo}`,
          title: `${unitNo}. ${unit}`,
          duration: isPlayground ? 20 : 12,
          type: isPlayground ? 'playground' : 'markdown',
          content: `# ${unit}\n\n## Objectives\n* Practice core patterns of ${unit.toLowerCase()}.\n* Build real software engineering habits.\n\n## Concept\nThis module outlines ${unit}. Practice code syntax on the right and experiment.`,
          codeSnippet: isPlayground ? `# ${unit}\n\ndef run():\n    print("Running...")\n\nrun()\n` : undefined,
          expectedOutput: isPlayground ? "Running..." : undefined,
        };
      });
    }

    modules.push({
      id: `py-mod-${moduleNo}`,
      title: `Module ${moduleNo}: ${blueprint.title}`,
      xp: blueprint.xp,
      lessons,
      quiz: fallbackQuiz
    });
  });

  return {
    slug,
    modules
  };
}
