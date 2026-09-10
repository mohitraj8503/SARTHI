export interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'markdown' | 'playground';
  content: string;
  codeSnippet?: string;
  expectedOutput?: string;
}

export const MODULE_1_LESSONS: Lesson[] = [
  {
    id: 'py-l-1-1',
    title: '1. How Python Reads Your Code',
    duration: 10,
    type: 'markdown',
    content: `# MODULE HERO SECTION

# Python Foundations
Welcome to your guided engineering journey. Instead of parsing textbook chapters, we will learn Python by engineering a real-world system: the **SARTHI Student Portal CLI**. Over this course, you will write the interpreter scripts, compute grading stats, and manage user connection sessions.

---

# CONCEPT EXPLANATION
## Top-To-Bottom Execution
When you run a Python file, the system reads your instructions like a human reads a book: from top to bottom, one line at a time.

---

# DIAGRAM
## Sequential Execution Flow
\`\`\`text
Line 1: print("Welcome")   ──> Prints "Welcome"
Line 2: print("Student")   ──> Prints "Student"
Line 3: print("Dashboard") ──> Prints "Dashboard"
\`\`\`

---

# INTERACTIVE PREDICT
## Predict the Order
Look at this code:
\`\`\`python
print("System Booting")
print("Welcome Mohit")
\`\`\`
Which message will the user see first in their terminal?
* Welcome Mohit
* System Booting
Correct: 2
Explanation: Python executes commands sequentially from top to bottom. It will print "System Booting" first, then "Welcome Mohit".
`
  },
  {
    id: 'py-l-1-2',
    title: '2. The Interpreter vs Compiler',
    duration: 12,
    type: 'markdown',
    content: `# CONCEPT EXPLANATION
## What is the Python Interpreter?
Computers cannot understand raw text like \`print()\`. They only understand binary numbers (ones and zeros).
Python uses a translation engine called the **Interpreter** to translate each line of your code into computer instructions *on the fly*, as it runs.

---

# REAL-WORLD ANALOGY
## The Real-time Translator
Think of a compiler like a book translator who translates a whole novel into Spanish before you read it.
The Python Interpreter is like a live translator standing next to a speaker, translating sentence-by-sentence in real time.

---

# COMMON BEGINNER ERRORS
## Halt on First Error
Since Python translates line-by-line, it will run all correct lines at the top of your file, but the moment it hits a line with a typo, it halts immediately.

---

# INTERACTIVE PREDICT
## Trace the Crash
If line 1 has correct code, but line 2 has a typo, what happens?
* The computer warns you but runs both lines anyway.
* Line 1 runs successfully, then the program halts with an error on line 2.
* The program does not run at all.
Correct: 2
Explanation: Python executes statements sequentially. It successfully prints line 1, then crashes immediately when translating line 2.
`
  },
  {
    id: 'py-l-1-3',
    title: '3. System PATH & Environment',
    duration: 15,
    type: 'markdown',
    content: `# CONCEPT EXPLANATION
## The System PATH
Before you can run Python, your computer needs to find where the Python execution program is saved. This is managed by a list of folder paths called the **PATH Variable**.

---

# COMMON BEGINNER ERRORS
## "Python is not recognized"
If you open a terminal and type \`python\` but see "Command not found" or "not recognized", it means the folder containing Python is not listed in your system's PATH.
*Tip: During installation, always check the box that says "Add Python to PATH".*

---

# TERMINAL RUN
## Verify environment
Command: python --version
Output:
Python 3.12.2
Verification Successful: Your operating system successfully located Python using the PATH variable.
`
  },
  {
    id: 'py-l-1-4',
    title: '4. Professional IDE Setup: VS Code',
    duration: 10,
    type: 'markdown',
    content: `# CONCEPT EXPLANATION
## Why use an Editor?
While you can write code in a basic text file, professional developers use Visual Studio Code (VS Code) because it highlights typos before we run the code.

---

# REFLECTION CARD
## Squiggly Red Lines
VS Code uses an extension called **Pylance**. Think of Pylance as a spellchecker for your code. If you make a typo, Pylance highlights it with a red squiggly line.

---

# BEST PRACTICES
## Open Folders, Not Files
Never open isolated single files in VS Code. Always open a full folder. This lets VS Code index your code files and help you navigate them easily.
`
  },
  {
    id: 'py-l-1-5',
    title: '5. Printing CLI Output',
    duration: 20,
    type: 'playground',
    codeSnippet: `# Print the active status message below
print("STUDENT PORTAL ACTIVE")
`,
    expectedOutput: 'STUDENT PORTAL ACTIVE',
    content: `# CONCEPT EXPLANATION
## Standard Output print()
To display status messages on our Student Portal CLI, we use the \`print()\` function.
Characters must be enclosed inside matching quotes:
* Double quotes: \`print("STUDENT PORTAL ACTIVE")\`
* Single quotes: \`print('STUDENT PORTAL ACTIVE')\`

---

# COMMON BEGINNER ERRORS
## Quote Clashes
If you use single quotes inside a single-quoted print, Python gets confused:
* \`print('It's active')\` ──> Crash!
* \`print("It's active")\` ──> Safe! (Double quotes wrap the single quote).

---

# CHALLENGE CARD
## Boot the Portal
Modify the code on the right-side compiler panel to display this exact message:
\`STUDENT PORTAL ACTIVE\`
Then run the compiler.
`
  },
  {
    id: 'py-l-1-6',
    title: '6. Case Sensitivity Rules',
    duration: 12,
    type: 'markdown',
    content: `# CONCEPT EXPLANATION
## Case Matters
Python treats uppercase and lowercase letters as completely different characters. To Python, \`print\` and \`Print\` are not the same thing.

---

# COMMON BEGINNER ERRORS
## NameError typo
Since built-in commands are lowercase, typing \`Print("Hello")\` with a capital \`P\` will result in a \`NameError\` because \`Print\` does not exist in Python's memory.

---

# INTERACTIVE PREDICT
## Spot the Case Bug
Predict the result of running this code:
\`\`\`python
username = "Mohit"
print(Username)
\`\`\`
* It prints "Mohit".
* It crashes with a NameError because "Username" starts with a capital U.
Correct: 2
Explanation: Python is strictly case-sensitive. The variable was declared as lowercase \`username\`, so trying to fetch \`Username\` fails.
`
  },
  {
    id: 'py-l-1-7',
    title: '7. Documenting Code',
    duration: 15,
    type: 'markdown',
    content: `# CONCEPT EXPLANATION
## Writing for Humans
Code tells the computer *what* to do, but documentation tells other engineers *why* we did it.
* **Comments (#):** Python ignores anything written after a \`#\` symbol. Use comments to explain complex lines.
* **Docstrings ("""):** Triple-quoted blocks placed at the top of a file or function to document what the whole file does.

---

# BEST PRACTICES
## Clear Comments
Write comments that explain the reason, not just describe the obvious code.
* Bad: \`print(name) # Print name\`
* Good: \`# Print student name in upper case to match portal header\`
`
  },
  {
    id: 'py-l-1-8',
    title: '8. Spacing and Indentation',
    duration: 15,
    type: 'markdown',
    content: `# CONCEPT EXPLANATION
## Spacing is Structural
In other languages, developers use curly braces \`{}\` to group code blocks. Python does not use braces; it uses **blank spaces (indentation)**.
The official Python guide (called PEP 8) recommends using exactly **4 spaces** for each level of indentation.

---

# DIAGRAM
## Visualizing Indentation Levels
\`\`\`text
Global Scope (No Indentation)
└── if user_role == "student":
    └── print("Access Granted") (Indented 4 spaces)
\`\`\`

---

# COMMON BEGINNER ERRORS
## IndentationError
Adding an accidental space at the start of a normal line will trigger an \`IndentationError\` and prevent Python from running your code.
`
  },
  {
    id: 'py-l-1-9',
    title: '9. Capstone: CLI Portal Profile',
    duration: 25,
    type: 'playground',
    codeSnippet: `# TODO: Complete the Student Portal Profile CLI Generator script.
# It must print the exact header and student attributes below.
# Write your code statements using standard print() syntax.

print("STUDENT PORTAL:")
print("Name: Mohit")
print("Role: Developer")
print("Status: Active")
`,
    expectedOutput: 'STUDENT PORTAL:\nName: Mohit\nRole: Developer\nStatus: Active',
    content: `# CONCEPT EXPLANATION
## The Complete CLI Dashboard
Let's assemble our first working sub-system: a script that displays the active student profile dashboard.
We need to output multiple lines of text, keeping the exact capitalization and spacing for alignment.

---

# CHALLENGE CARD
## Generate Student Card
Modify the code on the right-side compiler panel to display this exact profile layout in the console stdout:
\`\`\`text
STUDENT PORTAL:
Name: Mohit
Role: Developer
Status: Active
\`\`\`
`
  },
  {
    id: 'py-l-1-10',
    title: '10. Module 1 Milestone Review',
    duration: 10,
    type: 'markdown',
    content: `# CONCEPT EXPLANATION
## Milestone Reached!
You have mastered the foundations of Python code execution and configured the basic terminal outputs for the SARTHI CLI.

---

# BEST PRACTICES
## Self-Check List
Review this checklist before starting the Checkpoint Assessment Gate:
1. Python translates line-by-line sequentially from top-to-bottom.
2. Capitalization matters: \`print\` is correct, \`Print\` crashes.
3. Spacing defines block structures. Mismatched spacing causes crashes.
`
  }
];

export const MODULE_1_QUIZ: QuizQuestion[] = [
  {
    question: "You type 'python --version' in the terminal and see: 'python is not recognized as an internal or external command'. What is the most likely cause?",
    options: [
      "The Python script has a case-sensitivity syntax error.",
      "VS Code is not installed in the Windows System directory.",
      "The directory where Python is installed is missing from the system's PATH environment variable.",
      "You have mixed single quotes and double quotes in your script."
    ],
    correctIdx: 2,
    explanation: "The operating system searches folders listed in the PATH environment variable to locate command files. If Python's folder isn't in PATH, the terminal cannot find it."
  },
  {
    question: "You write a script with five lines. Line 1 to 3 print active status messages. Line 4 contains a spelling error ('Print' instead of 'print'). Line 5 prints 'System Boot Complete'. What happens when you execute this script?",
    options: [
      "The program crashes immediately without printing anything at all.",
      "Lines 1 to 3 print successfully, then the program crashes on line 4 without executing line 5.",
      "The program executes line 1 to 3, skips line 4, and runs line 5 successfully.",
      "The program runs completely, auto-correcting 'Print' to 'print'."
    ],
    correctIdx: 1,
    explanation: "Python is an interpreted language that runs code sequentially from top to bottom. It executes lines 1 to 3, and then crashes the moment it attempts to run line 4."
  },
  {
    question: "You are writing a script for the student portal CLI startup. You accidentally leave a blank space at the very beginning of line 3, which is a normal print statement. What will Python do when you run the script?",
    options: [
      "It runs normally, ignoring the extra space.",
      "It crashes with a NameError because of the space.",
      "It raises an IndentationError and fails to run.",
      "It automatically aligns the line to fit standard styles."
    ],
    correctIdx: 2,
    explanation: "In Python, spacing is structural. An unexpected space at the beginning of a line violates layout rules, causing an IndentationError before execution."
  },
  {
    question: "You want to display the message: 'Student's Portal'. Which of the following print statements is written correctly and will run without a crash?",
    options: [
      "print('Student's Portal')",
      "print(\"Student's Portal\")",
      "print(\"Student\"s Portal\")",
      "print('Student\\'s' Portal)"
    ],
    correctIdx: 1,
    explanation: "By wrapping the string in double quotes (\"...\"), you can safely include a single quote (apostrophe) inside the string without confusing the Python parser."
  },
  {
    question: "A developer on your team writes the portal launch code: 'init_portal = \"success\"' and then tries to run 'print(Init_portal)'. What will occur?",
    options: [
      "It prints 'success' normally.",
      "It crashes with a NameError because Init_portal with a capital 'I' is undefined.",
      "It prints the variable name 'Init_portal'.",
      "It runs but displays a blank empty line."
    ],
    correctIdx: 1,
    explanation: "Python is strictly case-sensitive. The variable was declared as lowercase 'init_portal', so 'Init_portal' is treated as a completely different, undefined name."
  },
  {
    question: "You want to document the startup code of the SARTHI CLI to help other engineers understand why a specific configuration delay is added. Which of the following is the best practice for comment documentation?",
    options: [
      "# Print startup text to terminal",
      "# Wait 2 seconds for local database server to finish opening connection session",
      "print(\"Loading...\") # print Loading...",
      "/* Delay startup database connection */"
    ],
    correctIdx: 1,
    explanation: "Comments should explain the reasoning ('why') rather than stating what the code line obviously does ('what'). In Python, comments start with a '#' symbol."
  }
];
