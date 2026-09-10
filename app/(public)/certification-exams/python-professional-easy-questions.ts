/**
 * Python Foundations - Milestone 1 Assessment Gate
 * Contains 40 MCQ questions (Assessment Set A and Set B)
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

export const pythonEasyQuestions: PythonQuestion[] = [
  // ==========================================
  // ASSESSMENT SET A
  // ==========================================
  {
    id: 'py-found-a1',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What is the correct file extension for a Python source file?',
    options: ['A) .pyt', 'B) .python', 'C) .py', 'D) .pt'],
    correctAnswer: 'C',
    explanation: '.py is the standard file extension for Python source code files.'
  },
  {
    id: 'py-found-a2',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which of the following is a valid, PEP-8 compliant variable name in Python?',
    options: ['A) 1st_name', 'B) user-name', 'C) user_name', 'D) UserName$'],
    correctAnswer: 'C',
    explanation: '_snake_case is PEP-8 compliant. Variable names cannot start with numbers, contain hyphens, or use special characters like $.'
  },
  {
    id: 'py-found-a3',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'How do you correctly write a single-line comment in Python?',
    options: ['A) // This is a comment', 'B) /* This is a comment */', 'C) # This is a comment', 'D) <!-- This is a comment -->'],
    correctAnswer: 'C',
    explanation: 'Python uses the # character for single-line comments.'
  },
  {
    id: 'py-found-a4',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What is the precise output of the expression `3 ** 3` in Python?',
    options: ['A) 9', 'B) 27', 'C) 6', 'D) 33'],
    correctAnswer: 'B',
    explanation: '** is the exponentiation operator in Python. 3 to the power of 3 is 27.'
  },
  {
    id: 'py-found-a5',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which built-in Python data type is strictly immutable?',
    options: ['A) List', 'B) Dictionary', 'C) Set', 'D) Tuple'],
    correctAnswer: 'D',
    explanation: 'Tuples are immutable sequences, meaning their contents cannot be changed after creation.'
  },
  {
    id: 'py-found-a6',
    section: 'Assessment Set A',
    type: 'mcq',
    question: "What will the function `type(42.0)` return?",
    options: ["A) <class 'int'>", "B) <class 'float'>", "C) <class 'double'>", "D) <class 'decimal'>"],
    correctAnswer: 'B',
    explanation: 'Numbers with a decimal point are represented as floats in Python.'
  },
  {
    id: 'py-found-a7',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which of the following statements correctly creates a string?',
    options: ["A) str = 'Hello'", 'B) str = "Hello"', 'C) Both A and B are correct', 'D) str = (Hello)'],
    correctAnswer: 'C',
    explanation: 'Strings in Python can be enclosed in either single or double quotes.'
  },
  {
    id: 'py-found-a8',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What is the output of the floor division operation `7 // 2`?',
    options: ['A) 3.5', 'B) 3', 'C) 4', 'D) 1'],
    correctAnswer: 'B',
    explanation: 'Floor division // divides the numbers and rounds down to the nearest integer.'
  },
  {
    id: 'py-found-a9',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which keyword is explicitly used to check conditional branches in Python?',
    options: ['A) check', 'B) match', 'C) if', 'D) when'],
    correctAnswer: 'C',
    explanation: 'The if keyword begins conditional execution blocks.'
  },
  {
    id: 'py-found-a10',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What is the correct syntax to iterate over a list named `items`?',
    options: ['A) for item in items:', 'B) for (i=0; i<items.length; i++)', 'C) loop item over items:', 'D) foreach item in items:'],
    correctAnswer: 'A',
    explanation: 'The standard loop in Python is the for...in loop.'
  },
  {
    id: 'py-found-a11',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which built-in function returns the total number of elements in a list or string?',
    options: ['A) size()', 'B) count()', 'C) length()', 'D) len()'],
    correctAnswer: 'D',
    explanation: 'The len() function returns the length of a sequence.'
  },
  {
    id: 'py-found-a12',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which list method adds a single element to the very end of an existing list?',
    options: ['A) list.insert()', 'B) list.push()', 'C) list.append()', 'D) list.add()'],
    correctAnswer: 'C',
    explanation: 'The append() method appends an element to the end of a list.'
  },
  {
    id: 'py-found-a13',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What is the boolean evaluation of `bool("")` (an empty string)?',
    options: ['A) True', 'B) False', 'C) None', 'D) Raises a TypeError'],
    correctAnswer: 'B',
    explanation: 'Empty sequences and collections evaluate to False in boolean context.'
  },
  {
    id: 'py-found-a14',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which function pauses execution to accept string input from the user in the console?',
    options: ['A) scan()', 'B) read()', 'C) input()', 'D) get_user()'],
    correctAnswer: 'C',
    explanation: 'The input() function reads a line of text input from stdin.'
  },
  {
    id: 'py-found-a15',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which logical operator is used to ensure TWO conditions are simultaneously true?',
    options: ['A) &&', 'B) AND', 'C) and', 'D) &'],
    correctAnswer: 'C',
    explanation: 'The logical operator and returns True if both operands are true.'
  },
  {
    id: 'py-found-a16',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What is the result of string multiplication: `"A" * 4`?',
    options: ['A) Error', 'B) 4A', 'C) A4', 'D) AAAA'],
    correctAnswer: 'D',
    explanation: 'Multiplying a string by an integer repeats it that many times.'
  },
  {
    id: 'py-found-a17',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Python uses zero-based indexing. How do you access the first element of `my_list`?',
    options: ['A) my_list[1]', 'B) my_list(0)', 'C) my_list[0]', 'D) my_list.first()'],
    correctAnswer: 'C',
    explanation: 'The first element is at index 0.'
  },
  {
    id: 'py-found-a18',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What fundamental structure describes a Python dictionary?',
    options: ['A) An ordered sequence of integers', 'B) A collection of key-value pairs', 'C) A mutable set of unique strings', 'D) An immutable data matrix'],
    correctAnswer: 'B',
    explanation: 'Dictionaries map keys to values.'
  },
  {
    id: 'py-found-a19',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'Which control statement immediately terminates the current execution loop?',
    options: ['A) stop', 'B) exit', 'C) break', 'D) continue'],
    correctAnswer: 'C',
    explanation: 'The break statement exits the nearest enclosing loop.'
  },
  {
    id: 'py-found-a20',
    section: 'Assessment Set A',
    type: 'mcq',
    question: 'What is the output of the modulo operation `14 % 4`?',
    options: ['A) 3.5', 'B) 3', 'C) 2', 'D) 0'],
    correctAnswer: 'C',
    explanation: 'The modulo operator % returns the remainder of the division.'
  },

  // ==========================================
  // ASSESSMENT SET B
  // ==========================================
  {
    id: 'py-found-b1',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which of the following data types represents a sequence of characters in Python?',
    options: ['A) int', 'B) bool', 'C) str', 'D) list'],
    correctAnswer: 'C',
    explanation: 'The str data type represents character strings.'
  },
  {
    id: 'py-found-b2',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'If `x = 5` and `y = "5"`, what will `print(x == y)` output?',
    options: ['A) True', 'B) False', 'C) Error', 'D) None'],
    correctAnswer: 'B',
    explanation: 'Equality comparison checks both value and type. An int is not equal to a str.'
  },
  {
    id: 'py-found-b3',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'What is the correct way to assign the value 10 to a variable named `score`?',
    options: ['A) int score = 10', 'B) score := 10', 'C) score = 10', 'D) let score = 10'],
    correctAnswer: 'C',
    explanation: 'Variables are defined by simple assignment (=) without type declarations.'
  },
  {
    id: 'py-found-b4',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which operator is used to compare if two values are NOT equal?',
    options: ['A) <>', 'B) !=', 'C) =!', 'D) !==='],
    correctAnswer: 'B',
    explanation: '!= is the inequality operator.'
  },
  {
    id: 'py-found-b5',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Given `data = [10, 20, 30]`, what is the output of `data[-1]`?',
    options: ['A) Error', 'B) 10', 'C) 20', 'D) 30'],
    correctAnswer: 'D',
    explanation: 'Negative indices index from the end of the sequence. -1 represents the last element.'
  },
  {
    id: 'py-found-b6',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which string method converts all characters to lowercase?',
    options: ['A) .lower()', 'B) .lowercase()', 'C) .toLower()', 'D) .downcase()'],
    correctAnswer: 'A',
    explanation: '.lower() returns a lowercase version of the string.'
  },
  {
    id: 'py-found-b7',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'What does the `range(5)` function generate in a for loop?',
    options: ['A) 1, 2, 3, 4, 5', 'B) 0, 1, 2, 3, 4, 5', 'C) 0, 1, 2, 3, 4', 'D) 5, 5, 5, 5, 5'],
    correctAnswer: 'C',
    explanation: 'range(n) generates numbers from 0 up to n-1.'
  },
  {
    id: 'py-found-b8',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which dictionary method returns a list of all its keys?',
    options: ['A) .get_keys()', 'B) .keys()', 'C) .all()', 'D) .list()'],
    correctAnswer: 'B',
    explanation: '.keys() returns a view object containing the keys.'
  },
  {
    id: 'py-found-b9',
    section: 'Assessment Set B',
    type: 'mcq',
    question: "What is the output of `type(None)`?",
    options: ["A) <class 'None'>", "B) <class 'null'>", "C) <class 'NoneType'>", "D) <class 'void'>"],
    correctAnswer: 'C',
    explanation: 'None has a special type called NoneType.'
  },
  {
    id: 'py-found-b10',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'In Python, indentation is used to define:',
    options: ['A) Classes', 'B) Functions', 'C) Loops', 'D) All of the above (Blocks of code)'],
    correctAnswer: 'D',
    explanation: 'Indentation blocks define structural scoping in Python.'
  },
  {
    id: 'py-found-b11',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which of the following will raise a SyntaxError?',
    options: ["A) print('Hello')\nprint('World')", "B) print('Hello' + 'World')", "C) 1var = 'Data'", "D) _var = 'Data'"],
    correctAnswer: 'C',
    explanation: 'Variable names cannot start with a digit.'
  },
  {
    id: 'py-found-b12',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'What is the result of `"Python"[0:2]`?',
    options: ['A) Pyt', 'B) Py', 'C) yth', 'D) Error'],
    correctAnswer: 'B',
    explanation: 'Slice syntax [start:end] is end-exclusive, returning index 0 and 1.'
  },
  {
    id: 'py-found-b13',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which statement is used to skip the current iteration of a loop and proceed to the next one?',
    options: ['A) continue', 'B) pass', 'C) break', 'D) skip'],
    correctAnswer: 'A',
    explanation: 'continue skips to the next loop iteration.'
  },
  {
    id: 'py-found-b14',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'If `a = True` and `b = False`, what is the result of `a or b`?',
    options: ['A) True', 'B) False', 'C) None', 'D) Error'],
    correctAnswer: 'A',
    explanation: 'Logical or returns True if either operand is True.'
  },
  {
    id: 'py-found-b15',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'How do you remove a specific item from a list by its value?',
    options: ['A) list.delete(value)', 'B) list.drop(value)', 'C) list.remove(value)', 'D) list.pop(value)'],
    correctAnswer: 'C',
    explanation: '.remove(val) removes the first occurrence of a value from a list.'
  },
  {
    id: 'py-found-b16',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'What does the `in` operator do in Python?',
    options: ['A) Checks if a variable is inside a function', 'B) Checks if a value exists within a sequence (like a list or string)', 'C) Imports a module', 'D) Converts input data'],
    correctAnswer: 'B',
    explanation: 'The in operator checks membership in a sequence.'
  },
  {
    id: 'py-found-b17',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which function converts a string like `"100"` into an integer?',
    options: ['A) to_int()', 'B) convert()', 'C) int()', 'D) Integer()'],
    correctAnswer: 'C',
    explanation: 'int() parses strings containing numbers into integer values.'
  },
  {
    id: 'py-found-b18',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'What is the output of `bool([0, 0])`?',
    options: ['A) False', 'B) True', 'C) Error', 'D) None'],
    correctAnswer: 'B',
    explanation: 'Non-empty lists evaluate to True in a boolean context.'
  },
  {
    id: 'py-found-b19',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'How do you write an `else if` condition in Python?',
    options: ['A) elseif:', 'B) else if:', 'C) elif:', 'D) elsif:'],
    correctAnswer: 'C',
    explanation: 'elif is the keyword for else if.'
  },
  {
    id: 'py-found-b20',
    section: 'Assessment Set B',
    type: 'mcq',
    question: 'Which of the following is NOT a core built-in data type in Python?',
    options: ['A) list', 'B) dict', 'C) array', 'D) tuple'],
    correctAnswer: 'C',
    explanation: 'array is part of the array module, not a core built-in type.'
  }
];
