/**
 * Python Master Certification - Simple Pass Questions
 * This file contains simple Python questions for common-level certification,
 * ensuring easy passing for all students.
 */

export interface PythonMasterMCQQuestion {
  id: string;
  section: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type PythonMasterQuestion = PythonMasterMCQQuestion;

// Simple Python Questions
export const pythonMasterQuestions: PythonMasterQuestion[] = [
  // Question 1
  {
    id: 'python-master-hq-1',
    section: 'Basic Syntax',
    type: 'mcq',
    question: `What is the output of print(10 + 5)?`,
    options: [
      'A) 15',
      'B) 105',
      'C) 50',
      'D) Error'
    ],
    correctAnswer: 'A',
    explanation: `The print() function outputs the result of 10 + 5, which is 15.`
  },
  // Question 2
  {
    id: 'python-master-hq-2',
    section: 'Basic Syntax',
    type: 'mcq',
    question: `Which keyword is used to define a function in Python?`,
    options: [
      'A) function',
      'B) def',
      'C) define',
      'D) func'
    ],
    correctAnswer: 'B',
    explanation: `The 'def' keyword is used to define functions in Python.`
  },
  // Question 3
  {
    id: 'python-master-hq-3',
    section: 'Data Types',
    type: 'mcq',
    question: `How do you start a single-line comment in Python?`,
    options: [
      'A) //',
      'B) #',
      'C) /*',
      'D) --'
    ],
    correctAnswer: 'B',
    explanation: `Python uses the '#' symbol for single-line comments.`
  },
  // Question 4
  {
    id: 'python-master-hq-4',
    section: 'Data Types',
    type: 'mcq',
    question: `What is the result of len("Python")?`,
    options: [
      'A) 5',
      'B) 6',
      'C) 7',
      'D) 1'
    ],
    correctAnswer: 'B',
    explanation: `The len() function returns the number of characters in the string "Python", which is 6.`
  },
  // Question 5
  {
    id: 'python-master-hq-5',
    section: 'Data Types',
    type: 'mcq',
    question: `Which of the following is a list in Python?`,
    options: [
      'A) (1, 2, 3)',
      'B) [1, 2, 3]',
      'C) {1, 2, 3}',
      'D) <1, 2, 3>'
    ],
    correctAnswer: 'B',
    explanation: `Square brackets [] are used to define lists in Python.`
  },
  // Question 6
  {
    id: 'python-master-hq-6',
    section: 'Control Flow',
    type: 'mcq',
    question: `How do you write "Hello World" in Python?`,
    options: [
      'A) echo("Hello World")',
      'B) p("Hello World")',
      'C) print("Hello World")',
      'D) console.log("Hello World")'
    ],
    correctAnswer: 'C',
    explanation: `In Python, the print() function is used to output text.`
  },
  // Question 7
  {
    id: 'python-master-hq-7',
    section: 'Control Flow',
    type: 'mcq',
    question: `Which of these is used for an "if" statement shortcut?`,
    options: [
      'A) elif',
      'B) else if',
      'C) second if',
      'D) maybe'
    ],
    correctAnswer: 'A',
    explanation: `'elif' is the keyword for "else if" in Python.`
  },
  // Question 8
  {
    id: 'python-master-hq-8',
    section: 'Control Flow',
    type: 'mcq',
    question: `What is the output of print(type(5))?`,
    options: [
      'A) <class "str">',
      'B) <class "float">',
      'C) <class "int">',
      'D) <class "list">'
    ],
    correctAnswer: 'C',
    explanation: `The number 5 is an integer, so the type is 'int'.`
  },
  // Question 9
  {
    id: 'python-master-hq-9',
    section: 'Advanced Basics',
    type: 'mcq',
    question: `Which operator is used to multiply numbers?`,
    options: [
      'A) x',
      'B) *',
      'C) #',
      'D) /'
    ],
    correctAnswer: 'B',
    explanation: `The asterisk (*) is used for multiplication in Python.`
  },
  // Question 10
  {
    id: 'python-master-hq-10',
    section: 'Advanced Basics',
    type: 'mcq',
    question: `What character is used for indentation in Python?`,
    options: [
      'A) Space or Tab',
      'B) Semicolon',
      'C) Curly Bracket',
      'D) Dollar Sign'
    ],
    correctAnswer: 'A',
    explanation: `Python uses indentation (Spaces or Tabs) to define blocks of code.`
  },
  // Question 11
  {
    id: 'python-master-hq-11',
    section: 'Advanced Basics',
    type: 'mcq',
    question: `Which function is used to get input from the user?`,
    options: [
      'A) get()',
      'B) read()',
      'C) input()',
      'D) ask()'
    ],
    correctAnswer: 'C',
    explanation: `The input() function asks the user for a response.`
  },
  // Question 12
  {
    id: 'python-master-hq-12',
    section: 'Data Structures',
    type: 'mcq',
    question: `What does [1, 2].append(3) do?`,
    options: [
      'A) Adds 3 to the list',
      'B) Removes 3 from the list',
      'C) Clears the list',
      'D) Creates a new list'
    ],
    correctAnswer: 'A',
    explanation: `The append() method adds an item to the end of a list.`
  },
  // Question 13
  {
    id: 'python-master-hq-13',
    section: 'Data Structures',
    type: 'mcq',
    question: `Which extension is used for Python files?`,
    options: [
      'A) .py',
      'B) .python',
      'C) .pt',
      'D) .txt'
    ],
    correctAnswer: 'A',
    explanation: `Python files end with the .py extension.`
  },
  // Question 14
  {
    id: 'python-master-hq-14',
    section: 'Data Structures',
    type: 'mcq',
    question: `What is the boolean for "yes" in Python?`,
    options: [
      'A) Yes',
      'B) True',
      'C) 1',
      'D) Correct'
    ],
    correctAnswer: 'B',
    explanation: `Python uses 'True' (with a capital T) for truthy boolean values.`
  },
  // Question 15
  {
    id: 'python-master-hq-15',
    section: 'Data Structures',
    type: 'mcq',
    question: `What happens if you run "print(None)"?`,
    options: [
      'A) It prints "None"',
      'B) It crashes',
      'C) It format the disk',
      'D) It prints space'
    ],
    correctAnswer: 'A',
    explanation: `print(None) will output the word "None" to the console.`
  }
];

// Scoring guide for the certification
export const pythonMasterCertificationScoring = {
  totalQuestions: 15,
  passingScore: 85,
  sections: [
    { name: 'Basic Syntax', questions: 3 },
    { name: 'Data Types', questions: 3 },
    { name: 'Control Flow', questions: 3 },
    { name: 'Advanced Basics', questions: 3 },
    { name: 'Data Structures', questions: 3 }
  ],
  scoringGuide: {
    expert: { correct: '13-15', level: 'Master Level (95%+ marks)' },
    advanced: { correct: '11-12', level: 'Expert Level (85-94% marks)' },
    intermediate: { correct: '9-10', level: 'Advanced Level (75-84% marks)' },
    needsImprovement: { correct: 'Below 9', level: 'Needs improvement' }
  }
};

// Export for easy importing
export default pythonMasterQuestions;

