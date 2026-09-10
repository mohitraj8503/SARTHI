const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pythonCourseId = "python-beginners-mr";

const curriculum = [
  {
    title: "Module 1: The Foundations (Weeks 1-4)",
    description: "Setting up the developer environment and mastering core syntax.",
    lessons: [
      {
        title: "Week 1: The Developer's Setup",
        description: "Installing Python, configuring VS Code, understanding the terminal, and writing that first line of code.",
        duration: 20,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 1: The Developer's Setup
Start your Python journey by setting up a professional coding environment:
* Installing Python on Windows, macOS, or Linux.
* Configuring Visual Studio Code (VS Code) as our primary code editor.
* Navigating the command line / terminal.
* Writing and executing your very first script: \`print("Hello World!")\``
      },
      {
        title: "Week 2: Variables & Data Types",
        description: "Integers, floats, strings, and booleans. Understanding memory and variable assignment.",
        duration: 25,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 2: Variables & Data Types
Learn how computers store and manage information in memory:
* Defining variables and assignment rules.
* Working with core numeric data types (Integers and Floats).
* Text manipulation using Strings.
* Logical states using Booleans (True / False).`
      },
      {
        title: "Week 3: Operators & Expressions",
        description: "Arithmetic, relational, and logical operators.",
        duration: 20,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 3: Operators & Expressions
Perform calculations and evaluations in your code:
* **Arithmetic Operators:** +, -, *, /, //, %, **
* **Relational/Comparison Operators:** ==, !=, >, <, >=, <=
* **Logical Operators:** and, or, not
* Building compound conditional logic expressions.`
      },
      {
        title: "Week 4: The Input/Output Matrix",
        description: "Handling user inputs, dynamic string formatting (f-strings), and clean console output.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 4: The Input/Output Matrix
Build interactive scripts that talk to the user:
* Requesting user feedback with the \`input()\` function.
* Dynamic formatting using f-strings (format strings).
* Output formatting and writing clean console tables.`
      }
    ]
  },
  {
    title: "Module 2: Logic & Control Flow (Weeks 5-8)",
    description: "Giving the program a \"brain\" to make automated decisions.",
    lessons: [
      {
        title: "Week 5: Conditional Statements",
        description: "Deep dive into if, elif, and else blocks.",
        duration: 25,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 5: Conditional Statements
Master the core logic execution paths of programming:
* Basic conditional branching with \`if\` and \`else\`.
* Multi-path decision making using \`elif\`.
* Nesting conditional statements safely.`
      },
      {
        title: "Week 6: The Power of Iteration (Part 1)",
        description: "Mastering the for loop.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 6: The Power of Iteration (Part 1)
Automate repetitive tasks using loops:
* Standard syntax of the \`for\` loop in Python.
* Iterating through sequences and numbers using \`range()\`.
* Accumulating values and tracking indexes during loop cycles.`
      },
      {
        title: "Week 7: The Power of Iteration (Part 2)",
        description: "Utilizing while loops, break, and continue execution statements.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 7: The Power of Iteration (Part 2)
Master state-driven loops and flow control statements:
* Using \`while\` loops for dynamic conditions.
* Immediate exit from loop bodies using the \`break\` statement.
* Skipping the rest of current cycle iteration using \`continue\`.`
      },
      {
        title: "Week 8: Project 1: Interactive Smart Calculator / Text-Based Adventure Game",
        description: "Building an Interactive Smart Calculator or a Text-Based Adventure Game.",
        duration: 45,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 8: Project 1: First Milestones
Apply all core concepts to build your first portfolio project:
* Building a CLI-based smart calculator supporting basic functions and error-free loops.
* Creating an interactive text adventure game branching options based on user decisions.`
      }
    ]
  },
  {
    title: "Module 3: Data Structures (Weeks 9-12)",
    description: "Organizing, storing, and manipulating data efficiently.",
    lessons: [
      {
        title: "Week 9: Lists & Tuples",
        description: "Creating, slicing, sorting, and mutating arrays of data.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 9: Lists & Tuples
Organize multiple values sequentially:
* Declaring lists and modifying contents.
* List slicing techniques: extraction of partial datasets.
* In-place sorting and reverse mutations.
* Immutable ordered structures using Tuples.`
      },
      {
        title: "Week 10: Dictionaries",
        description: "Mastering key-value pairs, JSON-like structures, and rapid data retrieval.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 10: Dictionaries
Master rapid lookups and key-value mapping systems:
* Understanding Dictionaries and dictionary operations.
* Safely accessing keys using \`.get()\` and nested JSON structures.
* Looping through dictionary items, keys, and values.`
      },
      {
        title: "Week 11: Sets",
        description: "Unique data collections and mathematical set operations.",
        duration: 25,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 11: Sets
Work with distinct elements and mathematical structures:
* Creating and mutating unique item sets.
* Mathematical set operations: union, intersection, difference, and symmetric difference.
* Using sets to deduplicate database elements.`
      },
      {
        title: "Week 12: Project 2: Command-Line Inventory Management System",
        description: "Developing a Command-Line Inventory Management System.",
        duration: 45,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 12: Project 2: Inventory Management
Combine data structures to build a business utility:
* Tracking stock levels and products with structured dictionary collections.
* Supporting operations like adding, editing, and listing inventory items.
* Generating automated metrics for low-stock items.`
      }
    ]
  },
  {
    title: "Module 4: Functions & Modularity (Weeks 13-16)",
    description: "Writing clean, DRY (Don't Repeat Yourself), and professional-grade code.",
    lessons: [
      {
        title: "Week 13: Defining Functions",
        description: "Parameters, arguments, and understanding return statements.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 13: Defining Functions
Break your code into reusable operations:
* Writing functions using the \`def\` keyword.
* Passing positional and keyword arguments.
* Resolving execution values with return statements.`
      },
      {
        title: "Week 14: Scope & Lambda",
        description: "Local vs. global variables, and writing anonymous functions.",
        duration: 25,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 14: Scope & Lambda
Understand execution boundaries and anonymous inline operations:
* Local vs. global namespaces and variable resolution.
* Writing quick, single-line anonymous operations with \`lambda\`.
* Leveraging Higher-Order functions (e.g. \`map()\`, \`filter()\`).`
      },
      {
        title: "Week 15: Built-in Modules",
        description: "Leveraging the Python Standard Library (e.g., math, random, datetime).",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 15: Built-in Modules
Unbox the powerful tools shipped standard with Python:
* Mathematical calculations using the \`math\` module.
* Generating pseudo-random numbers with the \`random\` module.
* Parsing and formatting dates using the \`datetime\` module.`
      },
      {
        title: "Week 16: Project 3: Custom Password Generator and Security strength Analyzer",
        description: "Creating a Custom Password Generator and Security Strength Analyzer.",
        duration: 45,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 16: Project 3: Security Tools
Develop a cryptographically strong utilities generator:
* Generating secure random characters based on user-defined length.
* Evaluating password complexity (length, symbols, casing, numbers).
* Giving recommendations for boosting security.`
      }
    ]
  },
  {
    title: "Module 5: Object-Oriented Programming (OOP) (Weeks 17-20)",
    description: "Grasping the industry standard for structuring complex software.",
    lessons: [
      {
        title: "Week 17: Classes & Objects",
        description: "Defining blueprints and instantiating objects.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 17: Classes & Objects
Learn the paradigm shift of Object-Oriented Programming (OOP):
* Defining modular classes.
* Creating (instantiating) object instances.
* Initializing state values using structural templates.`
      },
      {
        title: "Week 18: Methods & Attributes",
        description: "__init__, self-references, and instance variables.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 18: Methods & Attributes
Bind attributes and behaviors directly to class blueprints:
* Understanding the constructor method (\`__init__\`).
* Passing reference pointers using the \`self\` keyword.
* Defining custom instance methods.`
      },
      {
        title: "Week 19: Inheritance & Polymorphism",
        description: "Extending classes and reusing code architectures.",
        duration: 35,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 19: Inheritance & Polymorphism
Design reusable, hierarchical object relationships:
* Inheriting parent classes and methods.
* Method overriding: modifying parent methods in child classes.
* Achieving Polymorphism: running shared methods across different classes.`
      },
      {
        title: "Week 20: Project 4: Virtual Banking System",
        description: "Building a Virtual Banking System (Managing Accounts, Deposits, and Withdrawals).",
        duration: 50,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 20: Project 4: OOP Virtual Bank
Combine OOP concepts to build a production-mode simulator:
* Architecting parent/child accounts with unique transaction logic.
* Implementing deposits, withdrawals, balances, and security validation.
* Managing ledger logs using lists of transactions.`
      }
    ]
  },
  {
    title: "Module 6: The Intermediate Edge & Capstone (Weeks 21-24)",
    description: "Real-world application, error handling, and final portfolio development.",
    lessons: [
      {
        title: "Week 21: Exception Handling",
        description: "Using try, except, and finally to prevent crashes and handle bugs gracefully.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 21: Exception Handling
Prevent software failures and handle runtime errors gracefully:
* Isolating risky execution codes using \`try\` blocks.
* Intercepting specific errors (e.g. ValueError, ZeroDivisionError) using \`except\`.
* Declaring cleanup operations with the \`finally\` statement.`
      },
      {
        title: "Week 22: File I/O Operations",
        description: "Reading from and writing to external .txt and .csv files.",
        duration: 30,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 22: File I/O Operations
Work with non-volatile memory by writing to the disk:
* Opening and reading files using \`open()\` and \`with\` contexts.
* Parsing and loading comma-separated records (.csv).
* Saving structured data states into custom external records.`
      },
      {
        title: "Week 23: Capstone Kickoff",
        description: "Architecture planning and system design for the final project.",
        duration: 35,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 23: Capstone Kickoff
Set structural benchmarks for your final portfolio piece:
* Diagramming execution routes and data structures.
* Establishing coding directory scopes and environment parameters.
* Planning project features and tracking tasks.`
      },
      {
        title: "Week 24: Final Capstone Project",
        description: "Building a fully functional Expense Tracker or a basic Web Scraper (introducing requests and BeautifulSoup).",
        duration: 60,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: `### Week 24: Capstone Completion
Complete and showcase your ultimate portfolio project:
* Option A: Expense Tracker (calculating balances, exporting sheets, tracking budgets).
* Option B: Web Scraper (parsing remote HTML, cleaning nodes, compiling database items).
* Final evaluations and certificate readiness.`
      }
    ]
  }
];

async function main() {
  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: pythonCourseId }
  });

  if (!course) {
    console.error(`Course with ID ${pythonCourseId} not found.`);
    process.exit(1);
  }

  console.log(`Cleaning up old lessons and modules for course: ${course.title}...`);

  // Delete existing lessons and modules for this course
  await prisma.lesson.deleteMany({
    where: { courseId: pythonCourseId }
  });

  await prisma.module.deleteMany({
    where: { courseId: pythonCourseId }
  });

  console.log("Seeding fresh modules and lessons...");

  let overallOrderNumber = 1;
  let totalDuration = 0;

  for (let mIndex = 0; mIndex < curriculum.length; mIndex++) {
    const modData = curriculum[mIndex];
    
    // Create Module
    const dbModule = await prisma.module.create({
      data: {
        title: modData.title,
        description: modData.description,
        courseId: pythonCourseId,
        order: mIndex
      }
    });

    console.log(`Created Module [${mIndex + 1}/${curriculum.length}]: ${dbModule.title}`);

    // Create Lessons for this module
    for (let lIndex = 0; lIndex < modData.lessons.length; lIndex++) {
      const lessonData = modData.lessons[lIndex];
      totalDuration += lessonData.duration;

      const dbLesson = await prisma.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          videoUrl: lessonData.videoUrl,
          content: lessonData.content,
          contentType: "video",
          duration: lessonData.duration,
          courseId: pythonCourseId,
          orderNumber: overallOrderNumber++,
          position: lIndex,
          moduleId: dbModule.id,
          isPublished: true,
          type: "VIDEO"
        }
      });
      console.log(`  -> Created Lesson [Order ${dbLesson.orderNumber}]: ${dbLesson.title}`);
    }
  }

  // Update overall course duration and update status
  await prisma.course.update({
    where: { id: pythonCourseId },
    data: {
      title: "Python Mastery: Beginner to Intermediate",
      thumbnail: "/course-thumbnails/Pythonkaddugang.png",
      duration: totalDuration,
      lastContentUpdate: new Date(),
      isPublished: true,
      status: "PUBLISHED"
    }
  });

  console.log(`Successfully completed seeding! Total Course Duration: ${totalDuration} minutes.`);
}

main()
  .catch(e => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
