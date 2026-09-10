/**
 * Python Professional Certification - Real-World Development (Milestone 4 Assessment Gate)
 * Contains 20 MCQ questions on API integration, environment isolation & testing.
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

export const pythonRealWorldQuestions: PythonQuestion[] = [
  {
    id: 'py-rw-1',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the primary purpose of a Python Virtual Environment (venv)?',
    options: [
      'A) To increase the execution speed of Python scripts.',
      'B) To securely isolate project-specific package dependencies from the global system.',
      'C) To simulate a different operating system (like running Linux on Windows).',
      'D) To encrypt source code files.'
    ],
    correctAnswer: 'B',
    explanation: 'A virtual environment isolates project-specific dependencies from other projects and the global Python installation.'
  },
  {
    id: 'py-rw-2',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which command correctly creates a new virtual environment named `env`?',
    options: [
      'A) python -m create env',
      'B) python --virtual env',
      'C) python -m venv env',
      'D) pip create venv env'
    ],
    correctAnswer: 'C',
    explanation: 'The standard command to create a virtual environment in Python is `python -m venv env`.'
  },
  {
    id: 'py-rw-3',
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
    explanation: 'pip is the package installer for Python, used to install and manage software packages from the Python Package Index (PyPI).'
  },
  {
    id: 'py-rw-4',
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
    explanation: 'The `pip freeze` command outputs installed packages in requirements format, which is typically redirected to a `requirements.txt` file.'
  },
  {
    id: 'py-rw-5',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which external library is the industry standard for making HTTP requests in Python?',
    options: [
      'A) urllib',
      'B) http.server',
      'C) requests',
      'D) curl_py'
    ],
    correctAnswer: 'C',
    explanation: 'The requests library is the standard, developer-friendly library for making HTTP requests in Python.'
  },
  {
    id: 'py-rw-6',
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
    explanation: 'An HTTP status code of 200 OK means the request was successfully processed by the server.'
  },
  {
    id: 'py-rw-7',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What data format is most commonly used to send and receive data from modern RESTful APIs?',
    options: [
      'A) XML',
      'B) CSV',
      'C) YAML',
      'D) JSON'
    ],
    correctAnswer: 'D',
    explanation: 'JSON (JavaScript Object Notation) is the lightweight and most widely used format for API data exchange.'
  },
  {
    id: 'py-rw-8',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'If you receive a JSON response from an API using the `requests` library, how do you convert it into a Python dictionary?',
    options: [
      'A) response.dict()',
      'B) response.to_python()',
      'C) response.json()',
      'D) json.parse(response)'
    ],
    correctAnswer: 'C',
    explanation: 'The requests response object has a built-in `.json()` method to decode JSON responses directly into Python dicts.'
  },
  {
    id: 'py-rw-9',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does REST stand for in web API architecture?',
    options: [
      'A) Remote Execution Service Technology',
      'B) Representational State Transfer',
      'C) Request Entry System Transfer',
      'D) Real-time Environment Secure Transport'
    ],
    correctAnswer: 'B',
    explanation: 'REST stands for Representational State Transfer, which defines architectural constraints for web services.'
  },
  {
    id: 'py-rw-10',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'In a REST API, which HTTP method is typically used to CREATE a new resource on the server?',
    options: [
      'A) GET',
      'B) PUT',
      'C) POST',
      'D) DELETE'
    ],
    correctAnswer: 'C',
    explanation: 'The POST method is used to submit entities to the specified resource, often causing a change in state or side effects on the server.'
  },
  {
    id: 'py-rw-11',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the primary function of the `BeautifulSoup` library in Python?',
    options: [
      'A) Formatting code to look aesthetically pleasing.',
      'B) Parsing HTML and XML documents for web scraping.',
      'C) Generating graphical user interfaces (GUIs).',
      'D) Managing database connections.'
    ],
    correctAnswer: 'B',
    explanation: 'BeautifulSoup is a python library widely used for extracting data out of HTML and XML files.'
  },
  {
    id: 'py-rw-12',
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
    explanation: 'Environment variables prevent sensitive configuration secrets from being hardcoded or committed to git repositories.'
  },
  {
    id: 'py-rw-13',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which module from the standard library is best suited for executing operating system commands (like `ls` or `dir`) from within a Python script?',
    options: [
      'A) os',
      'B) sys',
      'C) subprocess',
      'D) command'
    ],
    correctAnswer: 'C',
    explanation: 'The subprocess module allows spawning new processes and connecting to their input/output pipes.'
  },
  {
    id: 'py-rw-14',
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
    explanation: 'unittest is Python\'s built-in unit testing framework used to verify unit-level functionality.'
  },
  {
    id: 'py-rw-15',
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
    explanation: 'The assert statement tests a condition; if the condition evaluates to False, an AssertionError exception is raised.'
  },
  {
    id: 'py-rw-16',
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
    explanation: 'Flask is classified as a microframework because it does not require particular tools or libraries, making it simple and lightweight.'
  },
  {
    id: 'py-rw-17',
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
    explanation: 'An ORM allows querying and manipulating data from a database using object-oriented paradigms.'
  },
  {
    id: 'py-rw-18',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What is the purpose of PEP 8?',
    options: [
      'A) It is the official package index for Python.',
      'B) It is a style guide providing conventions on how to write clean, readable Python code.',
      'C) It is a framework for building APIs.',
      'D) It is a tool for compiling Python code to machine code.'
    ],
    correctAnswer: 'B',
    explanation: 'PEP 8 provides guidelines and conventions for writing Python code to improve readability and consistency.'
  },
  {
    id: 'py-rw-19',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'Which module allows you to parse complex command-line arguments when running a script from the terminal (e.g., `python script.py --verbose`)?',
    options: [
      'A) sys.argv',
      'B) cli_parser',
      'C) argparse',
      'D) terminal'
    ],
    correctAnswer: 'C',
    explanation: 'The argparse module makes it easy to write user-friendly command-line interfaces.'
  },
  {
    id: 'py-rw-20',
    section: 'Official Assessment Set',
    type: 'mcq',
    question: 'What does CI/CD stand for in modern software development workflows?',
    options: [
      'A) Code Integration / Code Deployment',
      'B) Continuous Integration / Continuous Deployment (or Delivery)',
      'C) Constant Iteration / Constant Debugging',
      'D) Cloud Infrastructure / Cloud Distribution'
    ],
    correctAnswer: 'B',
    explanation: 'CI/CD stands for Continuous Integration and Continuous Deployment (or Delivery), automating the building, testing, and deployment of applications.'
  }
];

export default pythonRealWorldQuestions;
