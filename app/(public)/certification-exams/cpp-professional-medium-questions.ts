/**
 * C++ Professional Developer Certification - Medium Set (20 Questions)
 * Intermediate-level C++ questions for certification
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

// Section 1: Memory Management
export const cppMediumQuestions: CPPQuestion[] = [
  // Question 1 - MCQ: Stack vs Heap
  {
    id: 'cpp-m-1',
    section: 'Section 1: Memory Management',
    type: 'mcq',
    question: `What happens when you return a pointer to a local variable?
int* func() {
    int x = 10;
    return &x;
}`,
    options: [
      'A) Returns valid pointer',
      'B) Dangling pointer - undefined behavior',
      'C) Compilation error',
      'D) Returns NULL'
    ],
    correctAnswer: 'B',
    explanation: `Returning a pointer to a local variable creates a dangling pointer because the local variable is destroyed when the function returns.`
  },
  // Question 2 - MCQ: Smart Pointers
  {
    id: 'cpp-m-2',
    section: 'Section 1: Memory Management',
    type: 'mcq',
    question: `Which smart pointer ensures only one owner of a resource?`,
    options: [
      'A) std::shared_ptr',
      'B) std::weak_ptr',
      'C) std::unique_ptr',
      'D) std::auto_ptr'
    ],
    correctAnswer: 'C',
    explanation: `std::unique_ptr ensures exclusive ownership - only one unique_ptr can own a resource at a time.`
  },
  // Question 3 - MCQ: Dynamic Memory
  {
    id: 'cpp-m-3',
    section: 'Section 1: Memory Management',
    type: 'mcq',
    question: `What is the correct way to allocate an array of 10 integers?`,
    options: [
      'A) int arr[10];',
      'B) int* arr = new int[10];',
      'C) int arr = new int[10];',
      'D) Both A and B'
    ],
    correctAnswer: 'D',
    explanation: `Both stack allocation (int arr[10]) and dynamic allocation (new int[10]) are valid ways to create an array of 10 integers.`
  },
  // Question 4 - MCQ: References
  {
    id: 'cpp-m-4',
    section: 'Section 2: Advanced Functions',
    type: 'mcq',
    question: `What is the output?
void increment(int& x) {
    x++;
}
int main() {
    int a = 5;
    increment(a);
    std::cout << a;
}`,
    options: [
      'A) 5',
      'B) 6',
      'C) 7',
      'D) Error'
    ],
    correctAnswer: 'B',
    explanation: `Pass-by-reference allows the function to modify the original variable. After increment, a becomes 6.`
  },
  // Question 5 - MCQ: Const Correctness
  {
    id: 'cpp-m-5',
    section: 'Section 2: Advanced Functions',
    type: 'mcq',
    question: `What does "const" in "const int* ptr" mean?`,
    options: [
      'A) Pointer is constant',
      'B) Value pointed is constant',
      'C) Both pointer and value are constant',
      'D) Nothing special'
    ],
    correctAnswer: 'B',
    explanation: `const before * means the value being pointed to is constant (cannot be modified through this pointer).`
  },
  // Question 6 - MCQ: Virtual Destructors
  {
    id: 'cpp-m-6',
    section: 'Section 3: Object-Oriented Programming',
    type: 'mcq',
    question: `Why should base class destructors be virtual?`,
    options: [
      'A) To allow proper cleanup of derived class objects',
      'B) To improve performance',
      'C) To enable multiple inheritance',
      'D) To make class abstract'
    ],
    correctAnswer: 'A',
    explanation: `Virtual destructors ensure that when deleting through a base pointer, the derived class destructor is also called, properly cleaning up resources.`
  },
  // Question 7 - MCQ: Virtual Functions
  {
    id: 'cpp-m-7',
    section: 'Section 3: Object-Oriented Programming',
    type: 'mcq',
    question: `What is a pure virtual function?`,
    options: [
      'A) A function that returns void',
      'B) A function with no implementation',
      'C) A function marked = 0',
      'D) A static virtual function'
    ],
    correctAnswer: 'C',
    explanation: `A pure virtual function is declared with "= 0" and must be overridden by derived classes. It makes the class abstract.`
  },
  // Question 8 - MCQ: Inheritance
  {
    id: 'cpp-m-8',
    section: 'Section 3: Object-Oriented Programming',
    type: 'mcq',
    question: `What is the default access specifier for class inheritance?`,
    options: [
      'A) public',
      'B) private',
      'C) protected',
      'D) None'
    ],
    correctAnswer: 'B',
    explanation: `Default inheritance access for classes is private. For structs, it's public.`
  },
  // Question 9 - MCQ: Copy Constructor
  {
    id: 'cpp-m-9',
    section: 'Section 3: Object-Oriented Programming',
    type: 'mcq',
    question: `When is a copy constructor called?`,
    options: [
      'A) When creating an object',
      'B) When passing object by value to a function',
      'C) When returning object by value',
      'D) All of the above'
    ],
    correctAnswer: 'D',
    explanation: `Copy constructor is called when: object is created from another object, object passed by value, object returned by value.`
  },
  // Question 10 - MCQ: Operator Overloading
  {
    id: 'cpp-m-10',
    section: 'Section 3: Object-Oriented Programming',
    type: 'mcq',
    question: `Which operator cannot be overloaded?`,
    options: [
      'A) +',
      'B) []',
      'C) ?:',
      'D) <<'
    ],
    correctAnswer: 'C',
    explanation: `The conditional operator (ternary operator ?:) cannot be overloaded in C++. Most other operators can be overloaded.`
  },
  // Question 11 - MCQ: STL Map
  {
    id: 'cpp-m-11',
    section: 'Section 4: STL and Containers',
    type: 'mcq',
    question: `What is the time complexity of std::map insertion?`,
    options: [
      'A) O(1)',
      'B) O(log n)',
      'C) O(n)',
      'D) O(n log n)'
    ],
    correctAnswer: 'B',
    explanation: `std::map is typically implemented as a Red-Black tree, providing O(log n) insertion, deletion, and lookup.`
  },
  // Question 12 - MCQ: Vectors
  {
    id: 'cpp-m-12',
    section: 'Section 4: STL and Containers',
    type: 'mcq',
    question: `What happens when vector exceeds its capacity?`,
    options: [
      'A) Throws exception',
      'B) Doubles capacity (typically)',
      'C) Stops adding elements',
      'D) Causes undefined behavior'
    ],
    correctAnswer: 'B',
    explanation: `When a vector's size exceeds its capacity, it typically doubles its capacity (implementation-defined behavior).`
  },
  // Question 13 - MCQ: Iterators
  {
    id: 'cpp-m-13',
    section: 'Section 4: STL and Containers',
    type: 'mcq',
    question: `What type of iterator does std::vector provide?`,
    options: [
      'A) Bidirectional',
      'B) Random access',
      'C) Forward',
      'D) Input'
    ],
    correctAnswer: 'B',
    explanation: `std::vector provides random access iterators, which support O(1) access to any element.`
  },
  // Question 14 - MCQ: Lambda
  {
    id: 'cpp-m-14',
    section: 'Section 5: Modern C++',
    type: 'mcq',
    question: `What is a lambda capture?`,
    options: [
      'A) A way to pass parameters',
      'B) A way to capture variables from enclosing scope',
      'C) A return type',
      'D) A function name'
    ],
    correctAnswer: 'B',
    explanation: `Lambda captures allow you to capture variables from the surrounding scope to use inside the lambda body.`
  },
  // Question 15 - MCQ: Auto
  {
    id: 'cpp-m-15',
    section: 'Section 5: Modern C++',
    type: 'mcq',
    question: `What does auto keyword do?`,
    options: [
      'A) Creates automatic variable',
      'B) Automatically deduces type',
      'C) Creates anonymous type',
      'D) Defines constant'
    ],
    correctAnswer: 'B',
    explanation: `The auto keyword allows the compiler to automatically deduce the type of a variable from its initializer.`
  },
  // Question 16 - MCQ: Range-based For
  {
    id: 'cpp-m-16',
    section: 'Section 5: Modern C++',
    type: 'mcq',
    question: `What is the correct range-based for loop to iterate vector<int>?`,
    options: [
      'A) for (int i : vec)',
      'B) for (int& i : vec)',
      'C) for (const int& i : vec)',
      'D) All are valid'
    ],
    correctAnswer: 'D',
    explanation: `All three are valid. Using references avoids copying, and const reference is useful when not modifying elements.`
  },
  // Question 17 - MCQ: Move Semantics
  {
    id: 'cpp-m-17',
    section: 'Section 5: Modern C++',
    type: 'mcq',
    question: `What does std::move do?`,
    options: [
      'A) Moves an object to another location',
      'B) Casts an lvalue to rvalue reference',
      'C) Deletes an object',
      'D) Transfers ownership'
    ],
    correctAnswer: 'B',
    explanation: `std::move converts an lvalue into an rvalue reference, enabling move semantics. It doesn't actually move - it just enables it.`
  },
  // Question 18 - MCQ: Exceptions
  {
    id: 'cpp-m-18',
    section: 'Section 6: Error Handling',
    type: 'mcq',
    question: `What is the purpose of try-catch?`,
    options: [
      'A) Handle compile errors',
      'B) Handle runtime errors',
      'C) Define new types',
      'D) Create loops'
    ],
    correctAnswer: 'B',
    explanation: `try-catch blocks are used for exception handling - catching and handling runtime errors in a structured way.`
  },
  // Question 19 - MCQ: Threads
  {
    id: 'cpp-m-19',
    section: 'Section 7: Concurrency',
    type: 'mcq',
    question: `Which header provides std::thread?`,
    options: [
      'A) <iostream>',
      'B) <thread>',
      'C) <mutex>',
      'D) <atomic>'
    ],
    correctAnswer: 'B',
    explanation: `std::thread is defined in the <thread> header in C++11 and later.`
  },
  // Question 20 - MCQ: RAII
  {
    id: 'cpp-m-20',
    section: 'Section 1: Memory Management',
    type: 'mcq',
    question: `What does RAII stand for?`,
    options: [
      'A) Resource Allocation Is Initialization',
      'B) Runtime Abstraction In Inheritance',
      'C) Resource Acquisition Is Initialization',
      'D) Reference And Implementation Interface'
    ],
    correctAnswer: 'C',
    explanation: `RAII (Resource Acquisition Is Initialization) ties resource management to object lifetime, using constructors and destructors.`
  }
];

// Export for easy importing
export default cppMediumQuestions;

