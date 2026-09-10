/**
 * C++ Master Certification - Hardest Set (20 Questions)
 * Expert-level C++ questions covering memory management, templates, and system programming
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

// Section 1: Memory Management and Smart Pointers
export const cppMasterQuestions: CPPQuestion[] = [
  // Question 1 - MCQ: Smart Pointer Types
  {
    id: 'cpp-m-1',
    section: 'Section 1: Memory Management',
    type: 'mcq',
    question: 'Which smart pointer should you use when you want exclusive ownership and only one pointer can point to the resource?',
    options: [
      'A) std::shared_ptr',
      'B) std::unique_ptr',
      'C) std::weak_ptr',
      'D) std::auto_ptr (deprecated)'
    ],
    correctAnswer: 'B',
    explanation: 'std::unique_ptr provides exclusive ownership. It cannot be copied, only moved. When it goes out of scope, the resource is automatically deleted.'
  },
  // Question 2 - MCQ: Shared Pointer Cycle
  {
    id: 'cpp-m-2',
    section: 'Section 1: Memory Management',
    type: 'mcq',
    question: 'What happens when two shared_ptr objects hold references to each other?',
    options: [
      'A) Memory is automatically freed immediately',
      'B) A memory leak occurs due to reference cycle',
      'C) undefined behavior',
      'D) Compiler error'
    ],
    correctAnswer: 'B',
    explanation: 'Circular references between shared_ptr objects can cause memory leaks because reference count never reaches zero. Use weak_ptr to break cycles.'
  },
  // Question 3 - MCQ: Placement New
  {
    id: 'cpp-m-3',
    section: 'Section 1: Memory Management',
    type: 'mcq',
    question: 'What does placement new do?',
    options: [
      'A) Allocates memory on the heap',
      'B) Allocates memory at a specific location',
      'C) Deletes an object',
      'D) Creates a reference'
    ],
    correctAnswer: 'B',
    explanation: 'Placement new constructs an object at a pre-allocated memory location. Syntax: new (address) Type(args). It does not allocate memory, just constructs.'
  },
  // Question 4 - MCQ: Rule of Three/Five/Zero
  {
    id: 'cpp-m-4',
    section: 'Section 2: Object-Oriented C++',
    type: 'mcq',
    question: 'According to the Rule of Three, if you define any of which three member functions, you should define all three?',
    options: [
      'A) Constructor, Destructor, Assignment Operator',
      'B) Constructor, Copy Constructor, Move Constructor',
      'C) Destructor, Copy Constructor, Assignment Operator',
      'D) Copy Constructor, Move Constructor, Assignment Operator'
    ],
    correctAnswer: 'A',
    explanation: 'Rule of Three: If you define destructor, copy constructor, or copy assignment, define all three. Rule of Five adds move constructor and move assignment.'
  },
  // Question 5 - MCQ: Virtual Destructor
  {
    id: 'cpp-m-5',
    section: 'Section 2: Object-Oriented C++',
    type: 'mcq',
    question: 'Why should a base class have a virtual destructor?',
    options: [
      'A) To allow dynamic casting',
      'B) To ensure proper cleanup of derived class objects through base pointer',
      'C) To enable multiple inheritance',
      'D) To improve performance'
    ],
    correctAnswer: 'B',
    explanation: 'Without virtual destructor, deleting through base pointer only calls base destructor, causing derived class resources to leak.'
  },
  // Question 6 - MCQ: Template Specialization
  {
    id: 'cpp-m-6',
    section: 'Section 3: Templates and Metaprogramming',
    type: 'mcq',
    question: 'What is the output of:\ntemplate<typename T>\nvoid f(T) { std::cout << "primary"; }\ntemplate<>\nvoid f(int*) { std::cout << "specialized"; }\nf(new int);',
    options: [
      'A) primary',
      'B) specialized',
      'C) Compilation error',
      'D) primary specialized'
    ],
    correctAnswer: 'B',
    explanation: 'Full specialization matches int* exactly, so specialized is called. The specialization takes precedence over the primary template for int*.'
  },
  // Question 7 - MCQ: SFINAE
  {
    id: 'cpp-m-7',
    section: 'Section 3: Templates and Metaprogramming',
    type: 'mcq',
    question: 'What does SFINAE stand for?',
    options: [
      'A) Substitution Failure Is Not An Error',
      'B) Static Function Interface Not An Error',
      'C) Subclass Function Inheritance Not An Error',
      'D) Standard Format Interface Not An Error'
    ],
    correctAnswer: 'A',
    explanation: 'SFINAE is a principle where invalid template arguments result in the specialization being discarded rather than a compilation error.'
  },
  // Question 8 - MCQ: Variadic Templates
  {
    id: 'cpp-m-8',
    section: 'Section 3: Templates and Metaprogramming',
    type: 'mcq',
    question: 'How do you access the first element of a parameter pack in variadic templates?',
    options: [
      'A) pack.front()',
      'B) pack[0]',
      'C) std::get<0>(pack)',
      'D) First element cannot be accessed directly'
    ],
    correctAnswer: 'C',
    explanation: 'Parameter packs are not indexable directly. Use std::get<N>(pack) to access elements by index. Use recursive unpacking to process all elements.'
  },
  // Question 9 - MCQ: Lambda Capture
  {
    id: 'cpp-m-9',
    section: 'Section 4: Modern C++ Features',
    type: 'mcq',
    question: 'What does [=, &x]() { } mean in a lambda capture?',
    options: [
      'A) Capture everything by value, except x by reference',
      'B) Capture everything by reference, except x by value',
      'C) Capture only x by reference',
      'D) Capture x by value, everything else by reference'
    ],
    correctAnswer: 'A',
    explanation: '[=] captures everything by value. [&x] overrides to capture x by reference. Other variables remain captured by value.'
  },
  // Question 10 - MCQ: Move Semantics
  {
    id: 'cpp-m-10',
    section: 'Section 4: Modern C++ Features',
    type: 'mcq',
    question: 'What does std::move do?',
    options: [
      'A) Moves an object to another location',
      'B) Casts an lvalue to an rvalue reference',
      'C) Deletes an object',
      'D) Copies an object'
    ],
    correctAnswer: 'B',
    explanation: 'std::move is a cast to rvalue reference. It does not actually move anything - it just enables move semantics by telling the compiler to treat the value as temporary.'
  },
  // Question 11 - MCQ: RAII Pattern
  {
    id: 'cpp-m-11',
    section: 'Section 5: Design Patterns',
    type: 'mcq',
    question: 'What does RAII stand for?',
    options: [
      'A) Resource Allocation Is Initialization',
      'B) Random Access Interface Implementation',
      'C) Reference And Instance Inheritance',
      'D) Runtime Allocation In Iteration'
    ],
    correctAnswer: 'A',
    explanation: 'RAII ties resource management to object lifetime. Resources are acquired in constructor, released in destructor. Smart pointers and locks use RAII.'
  },
  // Question 12 - MCQ: Virtual Function Override
  {
    id: 'cpp-m-12',
    section: 'Section 2: Object-Oriented C++',
    type: 'mcq',
    question: 'What keyword ensures a derived class function overrides a base class virtual function?',
    options: [
      'A) override',
      'B) virtual',
      'C) final',
      'D) static'
    ],
    correctAnswer: 'A',
    explanation: 'The override specifier (C++11) ensures the function actually overrides a virtual function. If it doesnt, compilation fails. Prevents accidental overload.'
  },
  // Question 13 - MCQ: Thread Synchronization
  {
    id: 'cpp-m-13',
    section: 'Section 6: Concurrency',
    type: 'mcq',
    question: 'Which C++20 feature allows waiting for multiple futures simultaneously?',
    options: [
      'A) std::thread::join',
      'B) std::when_all',
      'C) std::mutex',
      'D) std::atomic'
    ],
    correctAnswer: 'B',
    explanation: 'std::when_all (C++20) takes multiple futures and returns a future that completes when all input futures complete. Part of std::jthread and executors.'
  },
  // Question 14 - MCQ: Atomic Operations
  {
    id: 'cpp-m-14',
    section: 'Section 6: Concurrency',
    type: 'mcq',
    question: 'What is the difference between std::atomic<int> and std::atomic<int>?',
    options: [
      'A) No difference',
      'B) First is lock-free, second uses locks',
      'C) First uses acquire-release, second uses sequential consistency',
      'D) First is int, second is pointer to int'
    ],
    correctAnswer: 'D',
    explanation: 'std::atomic<int> is atomic integer. std::atomic<int*> is atomic pointer - provides pointer arithmetic operations like fetch_add, exchange.'
  },
  // Question 15 - MCQ: constexpr Functions
  {
    id: 'cpp-m-15',
    section: 'Section 4: Modern C++ Features',
    type: 'mcq',
    question: 'What is a key difference between constexpr and consteval in C++20?',
    options: [
      'A) constexpr can be evaluated at runtime, consteval only at compile time',
      'B) consteval can be evaluated at runtime, constexpr only at compile time',
      'C) No difference',
      'D) constexpr is deprecated'
    ],
    correctAnswer: 'A',
    explanation: 'constexpr functions may be evaluated at compile time or runtime. consteval functions must be evaluated at compile time - they are immediately invoked functions.'
  },
  // Question 16 - MCQ: std::optional
  {
    id: 'cpp-m-16',
    section: 'Section 4: Modern C++ Features',
    type: 'mcq',
    question: 'What does std::optional<T>::has_value() return?',
    options: [
      'A) true if T is a pointer',
      'B) true if the optional contains a value',
      'C) true if T is default constructible',
      'D) Always true'
    ],
    correctAnswer: 'B',
    explanation: 'has_value() returns true if the optional contains a value, false if it contains std::nullopt. Similar to std::unique_ptr::get() != nullptr.'
  },
  // Question 17 - MCQ: std::variant
  {
    id: 'cpp-m-17',
    section: 'Section 4: Modern C++ Features',
    type: 'mcq',
    question: 'What is std::variant and how does it differ from union?',
    options: [
      'A) Same as union',
      'B) Type-safe union that tracks which type is active',
      'C) A pointer type',
      'D) A smart pointer'
    ],
    correctAnswer: 'B',
    explanation: 'std::variant is a type-safe union. It tracks which type is currently stored and provides std::visit to work with all types safely. Unlike union, it handles non-POD types.'
  },
  // Question 18 - MCQ: CRTP Pattern
  {
    id: 'cpp-m-18',
    section: 'Section 3: Templates and Metaprogramming',
    type: 'mcq',
    question: 'What does CRTP stand for?',
    options: [
      'A) Curiously Recurring Template Pattern',
      'B) Constant Return Type Pointer',
      'C) Compile Runtime Template Processing',
      'D) Class Reference Template Parameter'
    ],
    correctAnswer: 'A',
    explanation: 'CRTP is a pattern where a class inherits from a template parameter. Used for static polymorphism, compile-time method dispatch, and avoiding virtual function overhead.'
  },
  // Question 19 - MCQ: Copy Elision
  {
    id: 'cpp-m-19',
    section: 'Section 5: Performance Optimization',
    type: 'mcq',
    question: 'Which copy elision is guaranteed in C++17?',
    options: [
      'A) Return value optimization (RVO)',
      'B) Named return value optimization (NRVO)',
      'C) Both RVO and NRVO',
      'D) None'
    ],
    correctAnswer: 'A',
    explanation: 'C++17 guarantees copy elision for prvalue returns (RVO). NRVO (named variable returns) is still optional. Guaranteed elision simplifies modern C++ code.'
  },
  // Question 20 - MCQ: PImpl Idiom
  {
    id: 'cpp-m-20',
    section: 'Section 5: Design Patterns',
    type: 'mcq',
    question: 'What is the main benefit of the PImpl (Pointer to Implementation) idiom?',
    options: [
      'A) Faster execution',
      'B) Reduced compilation dependencies and faster compile times',
      'C) Better memory usage',
      'D) Thread safety'
    ],
    correctAnswer: 'B',
    explanation: 'PImpl hides implementation details in a separate class, reducing header dependencies. Changes to implementation dont require recompiling users - improves build times.'
  }
];

