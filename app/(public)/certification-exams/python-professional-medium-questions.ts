/**
 * Core Programming - Milestone 2 Assessment Gate
 * Contains 20 MCQ questions
 */

export interface PythonMCQQuestion {
  id: string;
  section: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PythonCodingQuestion {
  id: string;
  section: string;
  type: 'coding';
  question: string;
  functionName: string;
  testCases: string;
  solution: string;
  explanation: string;
}

export type PythonQuestion = PythonMCQQuestion | PythonCodingQuestion;

export const pythonMediumQuestions: PythonQuestion[] = [
  {
    id: 'py-core-m1',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which keyword is strictly used to define a custom function in Python?',
    options: ['A) function', 'B) def', 'C) func', 'D) define'],
    correctAnswer: 'B',
    explanation: 'The def keyword is used to define functions.'
  },
  {
    id: 'py-core-m2',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the primary purpose of the `return` statement inside a function?',
    options: [
      'A) To print a value to the console',
      'B) To stop the program completely',
      'C) To send a result back to the caller of the function',
      'D) To import a module'
    ],
    correctAnswer: 'C',
    explanation: 'The return statement terminates function execution and specifies the value to return to the caller.'
  },
  {
    id: 'py-core-m3',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'How do you define a function parameter with a default value?',
    options: [
      'A) def my_func(a, b=10):',
      'B) def my_func(a=10, b):',
      'C) def my_func(a : 10):',
      'D) def my_func(a) default 10:'
    ],
    correctAnswer: 'A',
    explanation: 'Parameters with default values must come after parameters without default values.'
  },
  {
    id: 'py-core-m4',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the standard built-in function used to open a file?',
    options: ['A) file()', 'B) read()', 'C) open()', 'D) load()'],
    correctAnswer: 'C',
    explanation: 'The open() function returns a file object, and is most commonly used to read and write files.'
  },
  {
    id: 'py-core-m5',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which file mode will strictly APPEND data to the end of a file without overwriting existing content?',
    options: ["A) 'w'", "B) 'r'", "C) 'a'", "D) 'r+'"],
    correctAnswer: 'C',
    explanation: "'a' opens the file for appending. Data is written to the end of the file."
  },
  {
    id: 'py-core-m6',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Why is using the `with` statement recommended when working with files in Python?',
    options: [
      'A) It makes the file read faster.',
      'B) It automatically closes the file after the nested block of code executes, even if exceptions occur.',
      'C) It compresses the file.',
      'D) It is required by PEP-8 syntax rules.'
    ],
    correctAnswer: 'B',
    explanation: 'The with statement sets up a context manager that ensures resources are cleanly closed on exit.'
  },
  {
    id: 'py-core-m7',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which structural block is used to catch and handle runtime errors?',
    options: ['A) try / catch', 'B) do / except', 'C) try / except', 'D) handle / error'],
    correctAnswer: 'C',
    explanation: 'Python uses try and except blocks to capture and handle exceptions.'
  },
  {
    id: 'py-core-m8',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'In an exception handling structure, when does the `finally` block execute?',
    options: [
      'A) Only if an exception was raised.',
      'B) Only if no exception was raised.',
      'C) Always, regardless of whether an exception occurred or not.',
      'D) When the program finishes completely.'
    ],
    correctAnswer: 'C',
    explanation: 'The finally block always runs whether or not an exception was thrown.'
  },
  {
    id: 'py-core-m9',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'How do you correctly import only the `sqrt` function from the `math` module?',
    options: [
      'A) import sqrt from math',
      'B) from math import sqrt',
      'C) include math.sqrt',
      'D) using math import sqrt'
    ],
    correctAnswer: 'B',
    explanation: 'from module import name imports only the specified name directly.'
  },
  {
    id: 'py-core-m10',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does the `*args` syntax allow you to do in a function definition?',
    options: [
      'A) Pass a dictionary of keyword arguments.',
      'B) Pass a variable number of positional arguments as a tuple.',
      'C) Pass memory pointers to variables.',
      'D) Multiply all arguments together.'
    ],
    correctAnswer: 'B',
    explanation: '*args gathers extra positional parameters as a tuple.'
  },
  {
    id: 'py-core-m11',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does the `**kwargs` syntax represent in a function signature?',
    options: [
      'A) A tuple of arguments',
      'B) A variable number of keyword arguments packed into a dictionary',
      'C) A double pointer array',
      'D) Exponentiation of arguments'
    ],
    correctAnswer: 'B',
    explanation: '**kwargs gathers extra keyword parameters as a dictionary.'
  },
  {
    id: 'py-core-m12',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the primary characteristic of a `lambda` function?',
    options: [
      'A) It is an anonymous, single-line function without a defined name.',
      'B) It can contain multiple return statements.',
      'C) It is used exclusively for mathematical operations.',
      'D) It requires the `def` keyword.'
    ],
    correctAnswer: 'A',
    explanation: 'Lambdas are short, single-expression anonymous functions.'
  },
  {
    id: 'py-core-m13',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which built-in higher-order function applies a given function to all items in an iterable?',
    options: ['A) reduce()', 'B) filter()', 'C) map()', 'D) apply()'],
    correctAnswer: 'C',
    explanation: 'map() returns an iterator that applies the function to every item.'
  },
  {
    id: 'py-core-m14',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'If a variable is defined INSIDE a function, what is its scope?',
    options: ['A) Global scope', 'B) Built-in scope', 'C) Local scope', 'D) Module scope'],
    correctAnswer: 'C',
    explanation: 'Variables inside a function are local to that function.'
  },
  {
    id: 'py-core-m15',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'How can a function explicitly declare that it wants to modify a variable defined at the top level of the script?',
    options: [
      'A) Using the `nonlocal` keyword',
      'B) Using the `global` keyword',
      'C) Using the `static` keyword',
      'D) By passing it as `*args`',
    ],
    correctAnswer: 'B',
    explanation: 'The global keyword permits changing a variable in the global scope.'
  },
  {
    id: 'py-core-m16',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which statement is used to intentionally trigger a specific exception in Python?',
    options: ['A) throw', 'B) emit', 'C) raise', 'D) trigger'],
    correctAnswer: 'C',
    explanation: 'raise triggers a new exception.'
  },
  {
    id: 'py-core-m17',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the purpose of a docstring (e.g., `"""This is a function"""`) inside a function definition?',
    options: [
      'A) It acts as a multi-line comment strictly ignored by the interpreter.',
      'B) It provides official documentation for the function, accessible via the `__doc__` attribute.',
      'C) It defines the function\'s return type.',
      'D) It encrypts the function code.'
    ],
    correctAnswer: 'B',
    explanation: 'Docstrings document functions and are accessible through the __doc__ attribute.'
  },
  {
    id: 'py-core-m18',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which module from the Python standard library is used to work with regular expressions?',
    options: ['A) regex', 'B) string', 'C) match', 'D) re'],
    correctAnswer: 'D',
    explanation: 're is Python\'s built-in module for regular expressions.'
  },
  {
    id: 'py-core-m19',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What happens if a function does NOT have a `return` statement?',
    options: [
      'A) It throws a SyntaxError.',
      'B) It returns 0.',
      'C) It returns `None` implicitly.',
      'D) The program crashes at runtime.'
    ],
    correctAnswer: 'C',
    explanation: 'Functions without an explicit return statement return None.'
  },
  {
    id: 'py-core-m20',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which of the following is the correct syntax for a list comprehension that creates a list of squares for numbers 0 to 4?',
    options: [
      'A) [x^2 for x in range(5)]',
      'B) [x*x in range(5)]',
      'C) [x**2 for x in range(5)]',
      'D) list(x*2 from 0 to 4)'
    ],
    correctAnswer: 'C',
    explanation: '[x**2 for x in range(5)] produces [0, 1, 4, 9, 16] using exponentiation operator **.'
  }
];
