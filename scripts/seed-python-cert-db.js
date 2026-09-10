const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Python Professional Developer Certification into DB...');

  // 1. Find or create instructor
  let instructor = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'TEACHER'] } }
  });

  if (!instructor) {
    console.log('No instructor found, creating a default admin...');
    instructor = await prisma.user.create({
      data: {
        email: 'admin@sarthi.in',
        name: 'Mohit Raj',
        role: 'ADMIN',
        status: 'ACTIVE',
        onboarded: true
      }
    });
  }
  console.log('Using Instructor:', instructor.name, '(ID:', instructor.id, ')');

  const certId = 'python-professional-developer';
  
  // 2. Clean up existing certification if any
  console.log('Cleaning up existing python certification and questions...');
  await prisma.certificationQuestion.deleteMany({
    where: { certificationId: { in: [certId, 'cert_python_prof'] } }
  });
  await prisma.certification.deleteMany({
    where: { id: { in: [certId, 'cert_python_prof'] } }
  });

  // 3. Create Certification
  const pythonCert = await prisma.certification.create({
    data: {
      id: certId,
      title: 'Python Professional Developer',
      slug: 'python-professional-developer',
      description: 'Presented in recognition of exceptional performance, technical expertise, and successful completion of the Python Professional Developer Certification Program.',
      duration: 45,
      passingScore: 80,
      price: 39,
      premiumPrice: 49,
      proPrice: 99,
      difficulty: 'Expert',
      assessmentDurationMinutes: 45,
      status: 'PUBLISHED',
      instructorId: instructor.id,
      questions: '[]'
    }
  });

  console.log('Created Certification:', pythonCert.title, 'with ID:', pythonCert.id);

  // 4. Questions list
  const questions = [
    {
      questionText: 'What is the purpose of the `__init__` method in a Python class?',
      options: ['To initialize the class attributes', 'To delete an object', 'To define a private method', 'To import external modules'],
      correctAnswer: '0',
      explanation: 'The `__init__` method is the constructor in Python, used to initialize an instance of a class.',
      difficulty: 'EASY',
      orderNumber: 1
    },
    {
      questionText: 'Which of the following data structures is immutable in Python?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
      correctAnswer: '3',
      explanation: 'Tuples are immutable, meaning their elements cannot be changed after creation.',
      difficulty: 'EASY',
      orderNumber: 2
    },
    {
      questionText: 'What does a decorator do in Python?',
      options: ['Adds functionality to an existing function without modifying it', 'Deletes a function', 'Renames a variable', 'Prints a debug message'],
      correctAnswer: '0',
      explanation: 'Decorators are used to wrap functions to modify their behavior.',
      difficulty: 'MEDIUM',
      orderNumber: 3
    },
    {
      questionText: 'What is the key difference between a list and a generator in Python?',
      options: ['Generators use more memory', 'Lists are faster for large datasets', 'Generators yield values one at a time (lazy evaluation)', 'Lists cannot be iterated over'],
      correctAnswer: '2',
      explanation: 'Generators yield values lazily, making them memory-efficient for large sequences.',
      difficulty: 'MEDIUM',
      orderNumber: 4
    },
    {
      questionText: 'How does Python manage its memory?',
      options: ['Manual allocation', 'Automatic garbage collection and reference counting', 'It does not manage memory', 'Using external C libraries'],
      correctAnswer: '1',
      explanation: 'Python uses a private heap, reference counting, and a cyclic garbage collector.',
      difficulty: 'HARD',
      orderNumber: 5
    },
    {
      questionText: 'What does the Global Interpreter Lock (GIL) prevent in Python?',
      options: ['Multiple processes from running', 'Multiple threads from executing Python bytecodes at once in a single process', 'Functions from being called', 'Variables from being global'],
      correctAnswer: '1',
      explanation: 'The GIL ensures only one thread runs Python code at a time per process.',
      difficulty: 'HARD',
      orderNumber: 6
    },
    {
      questionText: 'What is a metaclass in Python?',
      options: ['A class that inherits from another class', 'A class used for metadata', 'A class of a class (it defines how classes behave)', 'A built-in class'],
      correctAnswer: '2',
      explanation: 'Metaclasses are the "classes of classes" that define class creation logic.',
      difficulty: 'HARD',
      orderNumber: 7
    },
    {
      questionText: 'Which block in a `try-except` statement is executed regardless of whether an exception occurred?',
      options: ['else', 'finally', 'catch', 'throw'],
      correctAnswer: '1',
      explanation: 'The `finally` block always executes.',
      difficulty: 'EASY',
      orderNumber: 8
    },
    {
      questionText: 'What is the purpose of "WSGI" in Python web development?',
      options: ['Database management', 'A web server specification for Python applications', 'Frontend styling', 'Encryption library'],
      correctAnswer: '1',
      explanation: 'WSGI is the standard interface between web servers and web apps.',
      difficulty: 'MEDIUM',
      orderNumber: 9
    },
    {
      questionText: 'Which file is required to make a directory a Python package?',
      options: ['main.py', '__init__.py', 'setup.py', 'config.json'],
      correctAnswer: '1',
      explanation: '`__init__.py` is used to mark directories as Python packages.',
      difficulty: 'EASY',
      orderNumber: 10
    },
    {
      questionText: 'What is "Duck Typing" in Python?',
      options: ['Testing for a specific type', 'A method of writing C extensions', 'Behavior-based typing (if it looks like a duck and quacks like a duck...)', 'A type of recursion'],
      correctAnswer: '2',
      explanation: 'Duck typing focuses on what an object can do rather than what it is.',
      difficulty: 'MEDIUM',
      orderNumber: 11
    },
    {
      questionText: 'Which module provides support for high-performance container datatypes?',
      options: ['math', 'collections', 'os', 're'],
      correctAnswer: '1',
      explanation: 'The `collections` module includes specialized containers like deque and Counter.',
      difficulty: 'MEDIUM',
      orderNumber: 12
    },
    {
      questionText: 'What is a lambda function in Python?',
      options: ['A function that can only be called once', 'An anonymous, one-line function', 'A function that returns multiple values', 'A type of global variable'],
      correctAnswer: '1',
      explanation: 'Lambdas are small anonymous functions.',
      difficulty: 'EASY',
      orderNumber: 13
    },
    {
      questionText: 'What does the `nonlocal` keyword do?',
      options: ['Declares a global variable', 'Declares a variable in an outer, but not global, scope', 'Makes a variable constant', 'Imports a module'],
      correctAnswer: '1',
      explanation: '`nonlocal` is used to access variables in enclosing nested scopes.',
      difficulty: 'MEDIUM',
      orderNumber: 14
    },
    {
      questionText: 'What is "Memoization" in Python?',
      options: ['Writing notes in code', 'Caching the results of expensive function calls', 'Clearing RAM', 'Sorting a list'],
      correctAnswer: '1',
      explanation: 'Memoization caches return values to avoid redundant computation.',
      difficulty: 'MEDIUM',
      orderNumber: 15
    },
    {
      questionText: 'What is PEP 8?',
      options: ['A performance enhancement proposal', 'A coding style guide for Python', 'A tool for managing environments', 'A cryptographic standard'],
      correctAnswer: '1',
      explanation: 'PEP 8 is the official style guide for Python code.',
      difficulty: 'EASY',
      orderNumber: 16
    },
    {
      questionText: 'What is the purpose of the `typing` module?',
      options: ['To speed up code execution', 'To provide runtime type checking', 'To support static type analysis and code clarity', 'To encrypt text'],
      correctAnswer: '2',
      explanation: 'The `typing` module provides support for type hints.',
      difficulty: 'MEDIUM',
      orderNumber: 17
    },
    {
      questionText: 'Which framework is widely used for unit testing in Python?',
      options: ['Django', 'PyTest', 'Flask', 'Pandas'],
      correctAnswer: '1',
      explanation: 'PyTest is a popular testing framework.',
      difficulty: 'EASY',
      orderNumber: 18
    },
    {
      questionText: 'What is the purpose of `slots` in a class definition?',
      options: ['To limit attribute names and save memory', 'To create private variables', 'To speed up class instantiation', 'To define static methods'],
      correctAnswer: '0',
      explanation: '`__slots__` prevents the creation of `__dict__`, saving memory.',
      difficulty: 'HARD',
      orderNumber: 19
    },
    {
      questionText: 'What does `await` do in an `async` function?',
      options: ['Pauses the execution of the coroutine until the awaited task is complete', 'Executes code in parallel', 'Terminates the program', 'Returns a value immediately'],
      correctAnswer: '0',
      explanation: '`await` yields control back to the event loop until the result is ready.',
      difficulty: 'MEDIUM',
      orderNumber: 20
    }
  ];

  // 5. Seed questions
  console.log('Inserting questions...');
  for (const q of questions) {
    await prisma.certificationQuestion.create({
      data: {
        certificationId: pythonCert.id,
        questionText: q.questionText,
        questionType: 'MULTIPLE_CHOICE',
        difficulty: q.difficulty,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: 5,
        marksCorrect: 5,
        marksWrong: -1,
        orderNumber: q.orderNumber,
        order: q.orderNumber
      }
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
