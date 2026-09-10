/**
 * Final Professional Certification Assessment
 * Comprehensive 60-Question Master Examination
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

export type PythonQuestion = PythonMCQQuestion;

export const pythonHardQuestions: PythonQuestion[] = [
  {
    id: 'py-final-q1',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which data structure in Python is mutable and uses key-value pairs?',
    options: ['A) Tuple', 'B) Set', 'C) List', 'D) Dictionary'],
    correctAnswer: 'D',
    explanation: 'A dictionary in Python is a mutable data structure that maps unique keys to values.'
  },
  {
    id: 'py-final-q2',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the output of `bool("False")`?',
    options: ['A) False', 'B) True', 'C) None', 'D) Error'],
    correctAnswer: 'B',
    explanation: 'Any non-empty string in Python, including "False", evaluates to True when cast to a boolean.'
  },
  {
    id: 'py-final-q3',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'In Python 3, what does `5 / 2` return?',
    options: ['A) 2', 'B) 2.5', 'C) 2.0', 'D) 3'],
    correctAnswer: 'B',
    explanation: 'The single slash / operator performs true float division in Python 3, returning 2.5.'
  },
  {
    id: 'py-final-q4',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which keyword is used to handle exceptions in Python?',
    options: ['A) catch', 'B) except', 'C) error', 'D) try_catch'],
    correctAnswer: 'B',
    explanation: 'The except keyword is used to intercept and handle exceptions raised in the try block.'
  },
  {
    id: 'py-final-q5',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the correct file extension for a Python source file?',
    options: ['A) .pyt', 'B) .python', 'C) .py', 'D) .pt'],
    correctAnswer: 'C',
    explanation: '.py is the official file extension for Python script files.'
  },
  {
    id: 'py-final-q6',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which of the following is a valid, PEP-8 compliant variable name in Python?',
    options: ['A) 1st_name', 'B) user-name', 'C) user_name', 'D) UserName$'],
    correctAnswer: 'C',
    explanation: 'Variable names must be in lowercase, with words separated by underscores as necessary to improve readability.'
  },
  {
    id: 'py-final-q7',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the precise output of the expression `3 ** 3` in Python?',
    options: ['A) 9', 'B) 27', 'C) 6', 'D) 33'],
    correctAnswer: 'B',
    explanation: 'The ** operator performs exponentiation. 3 raised to the power of 3 is 27.'
  },
  {
    id: 'py-final-q8',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which built-in Python data type is strictly immutable?',
    options: ['A) List', 'B) Dictionary', 'C) Set', 'D) Tuple'],
    correctAnswer: 'D',
    explanation: 'Tuples are ordered, immutable sequences in Python.'
  },
  {
    id: 'py-final-q9',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What will the function `type(42.0)` return?',
    options: ["A) <class 'int'>", "B) <class 'float'>", "C) <class 'double'>", "D) <class 'decimal'>"],
    correctAnswer: 'B',
    explanation: 'Decimal numbers are classified as floating-point numbers (float) in Python.'
  },
  {
    id: 'py-final-q10',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the output of the floor division operation `7 // 2`?',
    options: ['A) 3.5', 'B) 3', 'C) 4', 'D) 1'],
    correctAnswer: 'B',
    explanation: 'Floor division // performs division and rounds down to the nearest integer.'
  },
  {
    id: 'py-final-q11',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which built-in function returns the total number of elements in a list or string?',
    options: ['A) size()', 'B) count()', 'C) length()', 'D) len()'],
    correctAnswer: 'D',
    explanation: 'The len() function returns the length of an object.'
  },
  {
    id: 'py-final-q12',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which list method adds a single element to the very end of an existing list?',
    options: ['A) list.insert()', 'B) list.push()', 'C) list.append()', 'D) list.add()'],
    correctAnswer: 'C',
    explanation: 'The append() method adds an item to the end of the list.'
  },
  {
    id: 'py-final-q13',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which logical operator is used to ensure TWO conditions are simultaneously true?',
    options: ['A) &&', 'B) AND', 'C) and', 'D) &'],
    correctAnswer: 'C',
    explanation: 'The logical operator and returns True if both operands evaluate to True.'
  },
  {
    id: 'py-final-q14',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the result of string multiplication: `"A" * 4`?',
    options: ['A) Error', 'B) 4A', 'C) A4', 'D) AAAA'],
    correctAnswer: 'D',
    explanation: 'Multiplying a string by an integer duplicates the string content that number of times.'
  },
  {
    id: 'py-final-q15',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which control statement immediately terminates the current execution loop?',
    options: ['A) stop', 'B) exit', 'C) break', 'D) continue'],
    correctAnswer: 'C',
    explanation: 'The break statement exits the loop context immediately.'
  },
  {
    id: 'py-final-q16',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which keyword is strictly used to define a custom function in Python?',
    options: ['A) function', 'B) def', 'C) func', 'D) define'],
    correctAnswer: 'B',
    explanation: 'The def keyword begins a function definition block.'
  },
  {
    id: 'py-final-q17',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'How do you define a function that takes an arbitrary number of positional arguments?',
    options: ['A) def func(**kwargs):', 'B) def func(*args):', 'C) def func(args[]):', 'D) def func(...args):'],
    correctAnswer: 'B',
    explanation: 'The single asterisk * parameter syntax packs arbitrary positional arguments into a tuple.'
  },
  {
    id: 'py-final-q18',
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
    explanation: 'The double asterisk ** syntax packs arbitrary keyword arguments into a dictionary.'
  },
  {
    id: 'py-final-q19',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: "Which file mode will strictly APPEND data to the end of a file without overwriting existing content?",
    options: ["A) 'w'", "B) 'r'", "C) 'a'", "D) 'r+'"],
    correctAnswer: 'C',
    explanation: "The 'a' mode opens a file for appending, positioning the stream pointer at the end of the file."
  },
  {
    id: 'py-final-q20',
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
    explanation: 'The with statement implements context managers, ensuring setup/cleanup routines like closing files occur safely.'
  },
  {
    id: 'py-final-q21',
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
    explanation: 'The finally block always runs before exiting the try/except block, ensuring cleanups execute under all execution flows.'
  },
  {
    id: 'py-final-q22',
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
    explanation: 'The syntax `from module import function` isolates specific objects into the local namespace.'
  },
  {
    id: 'py-final-q23',
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
    explanation: 'Lambda functions are quick anonymous functions defined using the lambda keyword.'
  },
  {
    id: 'py-final-q24',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which built-in higher-order function applies a given function to all items in an iterable?',
    options: ['A) reduce()', 'B) filter()', 'C) map()', 'D) apply()'],
    correctAnswer: 'C',
    explanation: 'map() returns an iterator that applies the function argument to every item of the iterable.'
  },
  {
    id: 'py-final-q25',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'If a variable is defined INSIDE a function, what is its scope?',
    options: ['A) Global scope', 'B) Built-in scope', 'C) Local scope', 'D) Module scope'],
    correctAnswer: 'C',
    explanation: 'Variables initialized within a function block reside in the local scope of that function execution.'
  },
  {
    id: 'py-final-q26',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which statement is used to intentionally trigger a specific exception in Python?',
    options: ['A) throw', 'B) emit', 'C) raise', 'D) trigger'],
    correctAnswer: 'C',
    explanation: 'The raise keyword explicitly raises a specified exception class or object.'
  },
  {
    id: 'py-final-q27',
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
    explanation: 'Python functions that do not hit a return statement return None implicitly.'
  },
  {
    id: 'py-final-q28',
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
    explanation: 'Squares are generated via power operation **2 within standard bracket list comprehension syntax.'
  },
  {
    id: 'py-final-q29',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does the `isinstance(obj, class)` function do?',
    options: [
      'A) Creates a new instance of a class.',
      'B) Checks if an object is an instance or subclass of a class.',
      'C) Copies an existing object.',
      'D) Deletes an instance of a class.'
    ],
    correctAnswer: 'B',
    explanation: 'isinstance() returns True if the object argument is an instance of the classinfo argument, or of a subclass thereof.'
  },
  {
    id: 'py-final-q30',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the output of `[x for x in range(3)]`?',
    options: ['A) [1, 2, 3]', 'B) [0, 1, 2]', 'C) (0, 1, 2)', 'D) [0, 1, 2, 3]'],
    correctAnswer: 'B',
    explanation: 'range(3) yields integers from 0 up to 2 (exclusive of 3).'
  },
  {
    id: 'py-final-q31',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the primary purpose of the `__init__` method in a class?',
    options: [
      'A) To start the program execution.',
      'B) To initialize the instance variables of an object.',
      'C) To delete an object from memory.',
      'D) To define class-level variables.'
    ],
    correctAnswer: 'B',
    explanation: 'The __init__ method is a constructor, initializing instance state when objects are instantiated.'
  },
  {
    id: 'py-final-q32',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which decorator indicates that a method belongs to the class itself rather than an instance?',
    options: ['A) @staticmethod', 'B) @classmethod', 'C) @property', 'D) @abstractmethod'],
    correctAnswer: 'B',
    explanation: 'A @classmethod decorator receives the class object (cls) as its implicit first parameter.'
  },
  {
    id: 'py-final-q33',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does a generator function use to return a value and pause its state?',
    options: ['A) return', 'B) break', 'C) yield', 'D) pause'],
    correctAnswer: 'C',
    explanation: 'The yield keyword returns a value and pauses execution state, resuming on the next invocation.'
  },
  {
    id: 'py-final-q34',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which OOP principle describes wrapping data (variables) and methods into a single unit while restricting direct access to internal components?',
    options: ['A) Polymorphism', 'B) Inheritance', 'C) Encapsulation', 'D) Abstraction'],
    correctAnswer: 'C',
    explanation: 'Encapsulation bundles state variables and behaviors, hiding implementation details from public interfaces.'
  },
  {
    id: 'py-final-q35',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'By Python convention, how do you indicate that a class attribute should be treated as "private" or protected from external access?',
    options: [
      'A) Prefix the attribute name with a single or double underscore (e.g., `_var` or `__var`).',
      'B) Use the `private` keyword before the variable declaration.',
      'C) Define it outside the `__init__` method.',
      'D) Write it in ALL_CAPS.'
    ],
    correctAnswer: 'A',
    explanation: 'Prefixing names with underscores signals private or internal class details.'
  },
  {
    id: 'py-final-q36',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the correct syntax for a class named `Child` to inherit from a class named `Parent`?',
    options: ['A) class Child inherits Parent:', 'B) class Child extends Parent:', 'C) class Child(Parent):', 'D) class Parent(Child):'],
    correctAnswer: 'C',
    explanation: 'Parent classes are specified inside brackets immediately following the subclass name.'
  },
  {
    id: 'py-final-q37',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the purpose of the `super()` function in an inherited class?',
    options: [
      'A) To grant the class global access privileges.',
      'B) To call a method (usually `__init__`) from the parent class.',
      'C) To create a new base class at runtime.',
      'D) To override a child method completely.'
    ],
    correctAnswer: 'B',
    explanation: 'super() returns proxy delegation wrappers that coordinate class MRO method lookups.'
  },
  {
    id: 'py-final-q38',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which concept allows methods in different classes to have the same name but behave differently based on the object calling them?',
    options: ['A) Polymorphism', 'B) Encapsulation', 'C) Single Inheritance', 'D) Class Instantiation'],
    correctAnswer: 'A',
    explanation: 'Polymorphism allows generic programming behaviors where distinct object types respond to uniform method calls.'
  },
  {
    id: 'py-final-q39',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'If you want `print(my_object)` to output a clean, human-readable string representation of the object, which dunder method must you define?',
    options: ['A) __repr__', 'B) __display__', 'C) __str__', 'D) __format__'],
    correctAnswer: 'C',
    explanation: '__str__ returns human-readable formatting, while __repr__ targets unambiguous evaluation debug text.'
  },
  {
    id: 'py-final-q40',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does the `@staticmethod` decorator signify?',
    options: [
      'A) The method can only be called once.',
      'B) The method modifies the class state permanently.',
      'C) The method belongs to the class\'s namespace but does not require an implicit first argument (`self` or `cls`).',
      'D) The method is executed at compile time.'
    ],
    correctAnswer: 'C',
    explanation: 'Static methods receive no class instance context and act like simple scoped module functions.'
  },
  {
    id: 'py-final-q41',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Why are generators often preferred over lists when processing large datasets?',
    options: [
      'A) They encrypt the data automatically.',
      'B) They consume significantly less memory because they generate items one at a time on demand.',
      'C) They execute faster because they use C-extensions.',
      'D) They can be indexed directly (e.g., `gen[5]`).'
    ],
    correctAnswer: 'B',
    explanation: 'Generators execute lazy evaluation, generating objects incrementally to minimize active memory storage.'
  },
  {
    id: 'py-final-q42',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Structurally, what is a Python decorator?',
    options: [
      'A) A syntax tool used exclusively to style console outputs.',
      'B) A callable (usually a function) that takes another function as an argument and extends its behavior without modifying it permanently.',
      'C) A class attribute that cannot be changed.',
      'D) A specific type of generator.'
    ],
    correctAnswer: 'B',
    explanation: 'Decorators accept a callable target, wrapping or altering execution properties dynamically.'
  },
  {
    id: 'py-final-q43',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the purpose of the `@property` decorator in OOP?',
    options: ['A) It defines a static variable.', 'B) It allows a method to be accessed like an attribute.', 'C) It prevents inheritance.', 'D) It makes a class abstract.'],
    correctAnswer: 'B',
    explanation: '@property enables managed fields accessed via normal attribute getter/setter signatures.'
  },
  {
    id: 'py-final-q44',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does the term \'Duck Typing\' mean in the context of Python OOP?',
    options: [
      'A) A strict compiler feature that forces type declarations.',
      'B) An inheritance model where child classes must look exactly like parent classes.',
      'C) A concept where the suitability of an object is determined by the presence of certain methods and properties, rather than its exact class type.',
      'D) A debugging strategy.'
    ],
    correctAnswer: 'C',
    explanation: 'Duck typing validates interface suitability based on behaviors rather than explicit inheritance hierarchies.'
  },
  {
    id: 'py-final-q45',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'When dealing with multiple inheritance, what does MRO stand for?',
    options: [
      'A) Memory Release Operation',
      'B) Method Resolution Order (the sequence in which base classes are searched for a method).',
      'C) Multiple Render Output',
      'D) Main Runtime Object'
    ],
    correctAnswer: 'B',
    explanation: 'MRO represents Method Resolution Order, calculated using the C3 Linearization algorithm.'
  },
  {
    id: 'py-final-q46',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'In the context of REST APIs, what HTTP method is intended to retrieve data?',
    options: ['A) POST', 'B) PUT', 'C) GET', 'D) DELETE'],
    correctAnswer: 'C',
    explanation: 'GET requests are strictly read-only retrieval calls that should not produce server side-effects.'
  },
  {
    id: 'py-final-q47',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which library is standard for parsing HTML and XML in Python for web scraping?',
    options: ['A) requests', 'B) lxml', 'C) BeautifulSoup', 'D) pandas'],
    correctAnswer: 'C',
    explanation: 'BeautifulSoup provides standard, simple interfaces for traversing and extracting parsed tree documents.'
  },
  {
    id: 'py-final-q48',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What command creates a virtual environment named `.venv` in Python 3?',
    options: ['A) python -m venv .venv', 'B) virtualenv create .venv', 'C) py -venv .venv', 'D) pip install venv .venv'],
    correctAnswer: 'A',
    explanation: 'Standard environment generation is triggered via `python -m venv .venv`.'
  },
  {
    id: 'py-final-q49',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Why is it important to use a `requirements.txt` file?',
    options: [
      'A) To list the hardware requirements for the script.',
      'B) To define the exact versions of dependencies needed to run the project.',
      'C) To store sensitive API keys securely.',
      'D) To compile the Python code into an executable.'
    ],
    correctAnswer: 'B',
    explanation: 'requirements.txt locks dependency environments so configurations can be mirrored deterministically.'
  },
  {
    id: 'py-final-q50',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which module allows execution of operating system commands from a Python script?',
    options: ['A) sys', 'B) os', 'C) subprocess', 'D) command'],
    correctAnswer: 'C',
    explanation: 'The subprocess module spawns new execution sub-threads, capturing system stdout/stderr streams.'
  },
  {
    id: 'py-final-q51',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which data format is native to web APIs and maps perfectly to Python dictionaries?',
    options: ['A) XML', 'B) YAML', 'C) CSV', 'D) JSON'],
    correctAnswer: 'D',
    explanation: 'JSON models key-value data structures natively, parsed directly into standard python dict maps.'
  },
  {
    id: 'py-final-q52',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is `pip` in the Python ecosystem?',
    options: [
      'A) Python Integration Protocol',
      'B) The standard package installer for Python.',
      'C) A built-in web framework.',
      'D) A command used to deploy code to production.'
    ],
    correctAnswer: 'B',
    explanation: 'pip fetches and compiles modular package distributions from PyPI.'
  },
  {
    id: 'py-final-q53',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'How do you generate a `requirements.txt` file containing all currently installed packages in your environment?',
    options: [
      'A) pip generate > requirements.txt',
      'B) pip freeze > requirements.txt',
      'C) python save requirements.txt',
      'D) pip export dependencies'
    ],
    correctAnswer: 'B',
    explanation: 'pip freeze prints packages which redirect standard stream writes to files.'
  },
  {
    id: 'py-final-q54',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'When making an API call, what does a `200 OK` HTTP status code indicate?',
    options: [
      'A) The server encountered an error.',
      'B) The request was successful.',
      'C) The requested resource was not found (404).',
      'D) Access is denied (Unauthorized).'
    ],
    correctAnswer: 'B',
    explanation: '200 OK is the standard API success indicator return value.'
  },
  {
    id: 'py-final-q55',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'In a REST API, which HTTP method is typically used to CREATE a new resource on the server?',
    options: ['A) GET', 'B) PUT', 'C) POST', 'D) DELETE'],
    correctAnswer: 'C',
    explanation: 'POST calls handle creation commands and dispatch payload parameters.'
  },
  {
    id: 'py-final-q56',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Why is it critical to use environment variables (e.g., via a `.env` file) in a production application?',
    options: [
      'A) To make the code execute faster on servers.',
      'B) To securely store sensitive data like API keys and database passwords outside the source code.',
      'C) To define global styling rules.',
      'D) To force the application to run in a specific operating system.'
    ],
    correctAnswer: 'B',
    explanation: 'Decoupling configuration configurations from repository updates protects security keys.'
  },
  {
    id: 'py-final-q57',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the purpose of the `unittest` module in Python?',
    options: [
      'A) To test the user interface (UI) of a web application.',
      'B) To write and run automated test cases to verify that individual components of the code work correctly.',
      'C) To monitor server uptime.',
      'D) To automatically generate documentation.'
    ],
    correctAnswer: 'B',
    explanation: 'unittest is the standard framework package supporting test runner suites.'
  },
  {
    id: 'py-final-q58',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'In test-driven development (TDD), what does the `assert` keyword do?',
    options: [
      'A) It prints a statement to the console.',
      'B) It tests a condition and triggers an AssertionError if the condition is False.',
      'C) It assigns a value to a variable securely.',
      'D) It pauses the test execution.'
    ],
    correctAnswer: 'B',
    explanation: 'Assert tests logic requirements, halting on failures.'
  },
  {
    id: 'py-final-q59',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is Flask in the context of Python web development?',
    options: [
      'A) A heavy, batteries-included framework like Django.',
      'B) A micro web framework designed for simplicity and quick API development.',
      'C) A library strictly for database migrations.',
      'D) An HTML templating engine.'
    ],
    correctAnswer: 'B',
    explanation: 'Flask serves lightweight micro API routes without complex configurations dependencies.'
  },
  {
    id: 'py-final-q60',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is an ORM (Object-Relational Mapper) like SQLAlchemy or Prisma used for?',
    options: [
      'A) Mapping web URLs to Python functions.',
      'B) Interacting with a SQL database using Python classes and objects instead of raw SQL queries.',
      'C) Converting Python objects to JSON automatically.',
      'D) Managing API rate limits.'
    ],
    correctAnswer: 'B',
    explanation: 'ORMs map tables to class properties to decouple application structures from SQL layers.'
  }
];

export default pythonHardQuestions;
