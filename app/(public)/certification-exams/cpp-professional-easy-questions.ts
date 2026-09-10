/**
 * C++ Professional Developer Certification - Easy Set (20 Questions)
 * Entry-level C++ questions for certification
 */

export interface CPPMCQQuestion {
  id: string;
  section: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CPPCodingQuestion {
  id: string;
  section: string;
  type: 'coding';
  question: string;
  functionName: string;
  testCases: string;
  solution: string;
  explanation: string;
}

export type CPPQuestion = CPPMCQQuestion | CPPCodingQuestion;

// Section 1: C++ Basics
export const cppEasyQuestions: CPPQuestion[] = [
  // Question 1 - MCQ: Basic Syntax
  {
    id: 'cpp-e-1',
    section: 'Section 1: C++ Basics',
    type: 'mcq',
    question: `What is the correct way to declare a constant in C++?`,
    options: [
      'A) constant int x = 5;',
      'B) int const x = 5;',
      'C) const int x = 5;',
      'D) Both B and C are correct'
    ],
    correctAnswer: 'D',
    explanation: `Both "int const x" and "const int x" are valid ways to declare a constant in C++. The position of const doesn't matter for fundamental types.`
  },
  // Question 2 - MCQ: Memory
  {
    id: 'cpp-e-2',
    section: 'Section 1: C++ Basics',
    type: 'mcq',
    question: `What is the size of an int on a typical 64-bit system?`,
    options: [
      'A) 2 bytes',
      'B) 4 bytes',
      'C) 8 bytes',
      'D) Depends on compiler'
    ],
    correctAnswer: 'B',
    explanation: `On most modern systems, int is 4 bytes (32 bits). The exact size can vary but 4 bytes is the most common implementation.`
  },
  // Question 3 - MCQ: References
  {
    id: 'cpp-e-3',
    section: 'Section 1: C++ Basics',
    type: 'mcq',
    question: `What is a reference in C++?`,
    options: [
      'A) A pointer to a variable',
      'B) An alias for another variable',
      'C) A copy of a variable',
      'D) A constant pointer'
    ],
    correctAnswer: 'B',
    explanation: `A reference is an alias (another name) for an existing variable. It must be initialized and cannot be null after initialization.`
  },
  // Question 4 - MCQ: Scope
  {
    id: 'cpp-e-4',
    section: 'Section 1: C++ Basics',
    type: 'mcq',
    question: `What is the output?
int x = 10;
void foo() {
    std::cout << x;
}
int main() {
    int x = 20;
    foo();
}`,
    options: [
      'A) 10',
      'B) 20',
      'C) Compilation error',
      'D) Undefined behavior'
    ],
    correctAnswer: 'A',
    explanation: `The global variable x is accessible inside foo(). The local x in main() doesn't affect the global x inside the function.`
  },
  // Question 5 - MCQ: Functions
  {
    id: 'cpp-e-5',
    section: 'Section 2: Functions and Parameters',
    type: 'mcq',
    question: `What is pass-by-reference in C++?`,
    options: [
      'A) Passing a copy of the variable',
      'B) Passing the address of the variable',
      'C) Passing a constant value',
      'D) Passing a pointer'
    ],
    correctAnswer: 'B',
    explanation: `Pass-by-reference means passing the address of the variable, allowing the function to modify the original variable.`
  },
  // Question 6 - MCQ: Pointers
  {
    id: 'cpp-e-6',
    section: 'Section 2: Functions and Parameters',
    type: 'mcq',
    question: `What does a null pointer contain?`,
    options: [
      'A) Address 0',
      'B) Undefined value',
      'C) Points to nothing valid',
      'D) Both A and C'
    ],
    correctAnswer: 'D',
    explanation: `A null pointer is a pointer that doesn't point to any valid memory location. Historically it was address 0.`
  },
  // Question 7 - MCQ: Arrays
  {
    id: 'cpp-e-7',
    section: 'Section 3: Data Structures',
    type: 'mcq',
    question: `What is the index of the first element in a C++ array?`,
    options: [
      'A) 1',
      'B) 0',
      'C) -1',
      'D) Depends on the array'
    ],
    correctAnswer: 'B',
    explanation: `Array indices in C++ start at 0. So the first element is accessed with index 0, second with index 1, etc.`
  },
  // Question 8 - MCQ: Strings
  {
    id: 'cpp-e-8',
    section: 'Section 3: Data Structures',
    type: 'mcq',
    question: `Which is the correct way to create a std::string?`,
    options: [
      'A) string s = "Hello";',
      'B) std::string s = "Hello";',
      'C) string s("Hello");',
      'D) All of the above'
    ],
    correctAnswer: 'D',
    explanation: `All three methods are valid ways to initialize a std::string in C++.`
  },
  // Question 9 - MCQ: Classes
  {
    id: 'cpp-e-9',
    section: 'Section 4: Object-Oriented Programming',
    type: 'mcq',
    question: `What is encapsulation?`,
    options: [
      'A) Hiding implementation details',
      'B) Inheriting from another class',
      'C) Creating multiple functions',
      'D) Using pointers'
    ],
    correctAnswer: 'A',
    explanation: `Encapsulation is the concept of bundling data and methods that operate on that data within a class, and restricting access to some components.`
  },
  // Question 10 - MCQ: Constructors
  {
    id: 'cpp-e-10',
    section: 'Section 4: Object-Oriented Programming',
    type: 'mcq',
    question: `What is a default constructor?`,
    options: [
      'A) Constructor with no parameters',
      'B) Constructor with default values',
      'C) Constructor that is automatically created',
      'D) Both A and C'
    ],
    correctAnswer: 'D',
    explanation: `A default constructor is a constructor that can be called with no arguments. If you don't define any constructors, the compiler generates one automatically.`
  },
  // Question 11 - MCQ: Inheritance
  {
    id: 'cpp-e-11',
    section: 'Section 4: Object-Oriented Programming',
    type: 'mcq',
    question: `What does "protected" access specifier allow?`,
    options: [
      'A) Only the class itself can access',
      'B) Class and its derived classes',
      'C) Any function can access',
      'D) Only within the same file'
    ],
    correctAnswer: 'B',
    explanation: `Protected members are accessible by the class itself and by its derived classes, but not by external code.`
  },
  // Question 12 - MCQ: Virtual Functions
  {
    id: 'cpp-e-12',
    section: 'Section 4: Object-Oriented Programming',
    type: 'mcq',
    question: `What is a virtual function?`,
    options: [
      'A) A function that returns void',
      'B) A function that can be overridden in derived classes',
      'C) A static function',
      'D) A private function'
    ],
    correctAnswer: 'B',
    explanation: `A virtual function is a member function that you expect to be overridden in derived classes to achieve runtime polymorphism.`
  },
  // Question 13 - MCQ: STL Containers
  {
    id: 'cpp-e-13',
    section: 'Section 5: STL and Standard Library',
    type: 'mcq',
    question: `Which container provides O(1) access by index?`,
    options: [
      'A) std::list',
      'B) std::vector',
      'C) std::map',
      'D) std::set'
    ],
    correctAnswer: 'B',
    explanation: `std::vector provides O(1) random access by index using the [] operator.`
  },
  // Question 14 - MCQ: Vectors
  {
    id: 'cpp-e-14',
    section: 'Section 5: STL and Standard Library',
    type: 'mcq',
    question: `What does std::vector::push_back do?`,
    options: [
      'A) Adds element at the beginning',
      'B) Adds element at the end',
      'C) Removes last element',
      'D) Clears the vector'
    ],
    correctAnswer: 'B',
    explanation: `push_back adds a new element at the end of the vector, increasing its size by 1.`
  },
  // Question 15 - MCQ: Iterators
  {
    id: 'cpp-e-15',
    section: 'Section 5: STL and Standard Library',
    type: 'mcq',
    question: `What is an iterator in STL?`,
    options: [
      'A) A pointer to a container element',
      'B) A type of container',
      'C) A loop mechanism',
      'D) A function'
    ],
    correctAnswer: 'A',
    explanation: `An iterator is an object that points to an element in a container, allowing traversal and access to elements.`
  },
  // Question 16 - MCQ: Loops
  {
    id: 'cpp-e-16',
    section: 'Section 1: C++ Basics',
    type: 'mcq',
    question: `What is the output?
for (int i = 0; i < 3; i++) {
    std::cout << i;
}`,
    options: [
      'A) 012',
      'B) 123',
      'C) 0123',
      'D) 321'
    ],
    correctAnswer: 'A',
    explanation: `The loop prints i values from 0 to 2 (when i < 3), so output is "012".`
  },
  // Question 17 - MCQ: Operators
  {
    id: 'cpp-e-17',
    section: 'Section 1: C++ Basics',
    type: 'mcq',
    question: `What is the result of 10 / 3 in C++?`,
    options: [
      'A) 3.333',
      'B) 3',
      'C) 3.0',
      'D) Error'
    ],
    correctAnswer: 'B',
    explanation: `When dividing two integers, integer division is performed, resulting in 3 (the quotient).`
  },
  // Question 18 - MCQ: Type Conversion
  {
    id: 'cpp-e-18',
    section: 'Section 2: Functions and Parameters',
    type: 'mcq',
    question: `What is implicit type conversion also known as?`,
    options: [
      'A) Explicit conversion',
      'B) Type casting',
      'C) Coercion',
      'D) Conversion operator'
    ],
    correctAnswer: 'C',
    explanation: `Implicit type conversion (coercion) is automatic conversion performed by the compiler when one type is used where another is expected.`
  },
  // Question 19 - MCQ: Namespace
  {
    id: 'cpp-e-19',
    section: 'Section 5: STL and Standard Library',
    type: 'mcq',
    question: `What is the purpose of "using namespace std"?`,
    options: [
      'A) Import all standard functions',
      'B) Avoid std:: prefix for standard library items',
      'C) Create a namespace',
      'D) Define a new type'
    ],
    correctAnswer: 'B',
    explanation: `Using directive "using namespace std" allows using standard library names without the std:: prefix.`
  },
  // Question 20 - MCQ: Destructors
  {
    id: 'cpp-e-20',
    section: 'Section 4: Object-Oriented Programming',
    type: 'mcq',
    question: `When is a destructor called?`,
    options: [
      'A) When an object is created',
      'B) When an object goes out of scope or is deleted',
      'C) When a function is called',
      'D) Never'
    ],
    correctAnswer: 'B',
    explanation: `A destructor is called automatically when an object is destroyed - either when it goes out of scope or when delete is called on a pointer to it.`
  }
];

// Export for easy importing
export default cppEasyQuestions;

