/**
 * Full-Stack Web Development Certification - Hardest MCQ Set (20 Questions)
 * Expert-level questions covering frontend, backend, databases, and DevOps
 */

export interface WebDevMCQQuestion {
  id: string;
  section: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Section 1: JavaScript and TypeScript Deep Concepts
export const webDevHardQuestions: WebDevMCQQuestion[] = [
  // Question 1 - Event Loop and Microtasks
  {
    id: 'web-h-1',
    section: 'Section 1: JavaScript Deep Concepts',
    type: 'mcq',
    question: 'What is the output of this code?\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");',
    options: [
      'A) 1 2 3 4',
      'B) 1 4 3 2',
      'C) 1 4 2 3',
      'D) 1 2 4 3'
    ],
    correctAnswer: 'B',
    explanation: 'Synchronous code runs first (1, 4). setTimeout callback goes to task queue. Promise microtask runs before setTimeout. So output: 1, 4, 3, 2.'
  },
  // Question 2 - Closure and Hoisting
  {
    id: 'web-h-2',
    section: 'Section 1: JavaScript Deep Concepts',
    type: 'mcq',
    question: 'What is printed?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    options: [
      'A) 0 1 2',
      'B) 3 3 3',
      'C) 0 0 0',
      'D) 2 2 2'
    ],
    correctAnswer: 'B',
    explanation: 'var is function-scoped, not block-scoped. By the time setTimeout callbacks execute, i is 3. Use let for block scoping or closure with IIFE.'
  },
  // Question 3 - Prototype Chain
  {
    id: 'web-h-3',
    section: 'Section 1: JavaScript Deep Concepts',
    type: 'mcq',
    question: 'What is the output?\nfunction Animal(name) { this.name = name; }\nAnimal.prototype.speak = function() { return this.name + " makes a sound"; }\nfunction Dog(name) { Animal.call(this, name); }\nDog.prototype = Object.create(Animal.prototype);\nDog.prototype.constructor = Dog;\nconst dog = new Dog("Rex");\nconsole.log(dog.speak());',
    options: [
      'A) Rex makes a sound',
      'B) undefined makes a sound',
      'C) Error',
      'D) Animal makes a sound'
    ],
    correctAnswer: 'A',
    explanation: 'Object.create establishes prototype chain. Dog inherits speak from Animal. When called, this refers to dog instance, so this.name is "Rex".'
  },
  // Question 4 - This Binding
  {
    id: 'web-h-4',
    section: 'Section 1: JavaScript Deep Concepts',
    type: 'mcq',
    question: 'What does this print?\nconst obj = {\n  value: 10,\n  getValue: () => this.value,\n  getValueRegular() { return this.value; }\n};\nconsole.log(obj.getValue(), obj.getValueRegular());',
    options: [
      'A) 10 10',
      'B) undefined 10',
      'C) 10 undefined',
      'D) undefined undefined'
    ],
    correctAnswer: 'B',
    explanation: 'Arrow functions inherit this from lexical scope (window in non-strict mode). Regular functions get this from call context. window.value is undefined.'
  },
  // Question 5 - Async/Await Error Handling
  {
    id: 'web-h-5',
    section: 'Section 2: Async JavaScript and Promises',
    type: 'mcq',
    question: 'What is printed?\nasync function f() {\n  try {\n    await Promise.reject(new Error("oops"));\n  } catch (e) {\n    console.log("caught");\n  }\n  console.log("after");\n}\nf();',
    options: [
      'A) caught',
      'B) caught after',
      'C) after',
      'D) Error'
    ],
    correctAnswer: 'B',
    explanation: 'await Promise.reject creates a rejected promise. The catch block catches the Error. After handling, execution continues to print "after".'
  },
  // Question 6 - Promise.all vs Promise.allSettled
  {
    id: 'web-h-6',
    section: 'Section 2: Async JavaScript and Promises',
    type: 'mcq',
    question: 'What does Promise.all return if one promise rejects?',
    options: [
      'A) Array with rejection reason',
      'B) First rejection reason',
      'C) All resolved values',
      'D) Empty array'
    ],
    correctAnswer: 'B',
    explanation: 'Promise.all rejects immediately when any promise rejects, returning the first rejection reason. Use Promise.allSettled to get all results regardless of rejection.'
  },
  // Question 7 - Debounce vs Throttle
  {
    id: 'web-h-7',
    section: 'Section 3: Frontend Performance',
    type: 'mcq',
    question: 'When should you use debounce instead of throttle?',
    options: [
      'A) Window resize events',
      'B) Search input to reduce API calls',
      'C) Mouse movement tracking',
      'D) Scroll events'
    ],
    correctAnswer: 'B',
    explanation: 'Debounce waits until no new calls for a specified time - ideal for search inputs. Throttle limits calls to a fixed rate - ideal for scroll/resize/mouse events.'
  },
  // Question 8 - React useEffect Cleanup
  {
    id: 'web-h-8',
    section: 'Section 4: React Advanced Patterns',
    type: 'mcq',
    question: 'When does useEffect cleanup function run?',
    options: [
      'A) Only on unmount',
      'B) Before component re-renders and on unmount',
      'C) Only when dependencies change',
      'D) After every render'
    ],
    correctAnswer: 'B',
    explanation: 'The cleanup function runs before the effect runs again (when dependencies change) and when the component unmounts. This prevents memory leaks and race conditions.'
  },
  // Question 9 - React useMemo vs useCallback
  {
    id: 'web-h-9',
    section: 'Section 4: React Advanced Patterns',
    type: 'mcq',
    question: 'Which is correct for preventing unnecessary re-renders of child components?',
    options: [
      'A) Use useMemo for the child component',
      'B) Use useCallback for the function passed as prop',
      'C) Use React.memo for the child',
      'D) Use useState for prop values'
    ],
    correctAnswer: 'B',
    explanation: 'useCallback memoizes the function so its reference stays stable. Wrap child in React.memo and pass memoized callbacks to prevent unnecessary re-renders.'
  },
  // Question 10 - React Context and Performance
  {
    id: 'web-h-10',
    section: 'Section 4: React Advanced Patterns',
    type: 'mcq',
    question: 'What happens when Context provider value changes?',
    options: [
      'A) Only the component using useContext re-renders',
      'B) All components consuming that context re-render',
      'C) No re-render occurs',
      'D) Only child components re-render'
    ],
    correctAnswer: 'B',
    explanation: 'All components that consume that context will re-render when provider value changes. Use multiple contexts or split values to optimize. Use useMemo for provider value.'
  },
  // Question 11 - SQL JOIN Types
  {
    id: 'web-h-11',
    section: 'Section 5: Database Design',
    type: 'mcq',
    question: 'Which JOIN returns all rows from left table and matched rows from right, with NULL for non-matches?',
    options: [
      'A) INNER JOIN',
      'B) LEFT JOIN',
      'C) RIGHT JOIN',
      'D) FULL OUTER JOIN'
    ],
    correctAnswer: 'B',
    explanation: 'LEFT JOIN returns all rows from left table, matching rows from right, NULL for non-matches. RIGHT JOIN does the opposite. FULL OUTER JOIN returns all rows from both.'
  },
  // Question 12 - Database Indexing
  {
    id: 'web-h-12',
    section: 'Section 5: Database Design',
    type: 'mcq',
    question: 'When should you NOT use an index?',
    options: [
      'A) On primary key columns',
      'B) On columns with high cardinality used in WHERE',
      'C) On frequently updated columns',
      'D) On columns used in JOIN conditions'
    ],
    correctAnswer: 'C',
    explanation: 'Indexes slow down INSERT, UPDATE, DELETE operations because the index must be updated. Avoid indexing frequently updated columns. Use indexes on high-cardinality columns in WHERE/JOIN.'
  },
  // Question 13 - REST vs GraphQL
  {
    id: 'web-h-13',
    section: 'Section 6: API Design',
    type: 'mcq',
    question: 'What is a key advantage of GraphQL over REST?',
    options: [
      'A) Automatic caching',
      'B) Client can request exactly the data needed',
      'C) Simpler to implement',
      'D) Better security'
    ],
    correctAnswer: 'B',
    explanation: 'GraphQL lets clients specify exactly what fields they need, avoiding over-fetching or under-fetching. REST requires multiple endpoints for different data needs.'
  },
  // Question 14 - HTTP Status Codes
  {
    id: 'web-h-14',
    section: 'Section 6: API Design',
    type: 'mcq',
    question: 'Which status code indicates the server has accepted the request for processing but processing is not complete?',
    options: [
      'A) 200 OK',
      'B) 201 Created',
      'C) 202 Accepted',
      'D) 204 No Content'
    ],
    correctAnswer: 'C',
    explanation: '202 Accepted indicates the request has been accepted for processing but processing is not complete. It is non-blocking - the client can poll for completion.'
  },
  // Question 15 - CORS Preflight
  {
    id: 'web-h-15',
    section: 'Section 7: Web Security',
    type: 'mcq',
    question: 'What triggers a CORS preflight request?',
    options: [
      'A) Simple GET request',
      'B) POST with JSON body',
      'C) Custom header',
      'D) Both B and C'
    ],
    correctAnswer: 'D',
    explanation: 'Preflight is triggered by: methods other than GET/HEAD/POST, POST with Content-Type other than application/x-www-form-urlencoded/multipart/form-data/text, custom headers.'
  },
  // Question 16 - XSS Prevention
  {
    id: 'web-h-16',
    section: 'Section 7: Web Security',
    type: 'mcq',
    question: 'Which is the most effective way to prevent XSS attacks?',
    options: [
      'A) Use HTTPS',
      'B) Sanitize user input',
      'C) Use Content Security Policy header',
      'D) Encode output based on context'
    ],
    correctAnswer: 'D',
    explanation: 'Context-aware output encoding is the primary defense. Sanitization can miss edge cases. CSP provides defense in depth. HTTPS encrypts data in transit.'
  },
  // Question 17 - Docker Container Lifecycle
  {
    id: 'web-h-17',
    section: 'Section 8: DevOps and Containerization',
    type: 'mcq',
    question: 'What is the correct order of Docker container states?',
    options: [
      'A) Created -> Running -> Paused -> Stopped',
      'B) Created -> Running -> Exited -> Removed',
      'C) Created -> Paused -> Running -> Stopped',
      'D) Running -> Paused -> Exited -> Removed'
    ],
    correctAnswer: 'A',
    explanation: 'Container states: Created (created but not started), Running (executing), Paused (processes frozen), Stopped (not running). Removed is after docker rm.'
  },
  // Question 18 - Kubernetes Pod Lifecycle
  {
    id: 'web-h-18',
    section: 'Section 8: DevOps and Containerization',
    type: 'mcq',
    question: 'In Kubernetes, when is a Pod considered Ready?',
    options: [
      'A) When all containers are created',
      'B) When all containers pass readiness probes',
      'C) When the pod is scheduled',
      'D) When the pod receives its first request'
    ],
    correctAnswer: 'B',
    explanation: 'A Pod is Ready when all its containers are Ready AND all readiness checks pass. Readiness probes determine if a container can receive traffic.'
  },
  // Question 19 - Microservices Communication Patterns
  {
    id: 'web-h-19',
    section: 'Section 9: System Design',
    type: 'mcq',
    question: 'When is synchronous HTTP communication between microservices appropriate?',
    options: [
      'A) For fire-and-forget operations',
      'B) When immediate response is required',
      'C) For highly decoupled systems',
      'D) For long-running operations'
    ],
    correctAnswer: 'B',
    explanation: 'Synchronous HTTP is good when immediate response needed (real-time). Use async (message queues) for fire-and-forget, long operations, or when decoupling is priority.'
  },
  // Question 20 - CAP Theorem
  {
    id: 'web-h-20',
    section: 'Section 9: System Design',
    type: 'mcq',
    question: 'A distributed database that provides strong consistency can guarantee which of the following?',
    options: [
      'A) Availability',
      'B) Partition tolerance',
      'C) Either availability or partition tolerance, not both',
      'D) All three simultaneously'
    ],
    correctAnswer: 'C',
    explanation: 'CAP theorem states you can only guarantee two of three: Consistency, Availability, Partition tolerance. In presence of partition, must choose between C and A.'
  }
];

