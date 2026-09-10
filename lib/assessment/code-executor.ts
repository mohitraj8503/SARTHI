interface TestCase {
  input: string;
  expected: string;
}

interface ExecuteResult {
  success: boolean;
  output?: string;
  error?: string;
  time?: string;
  memory?: string;
  testResults?: Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
  }>;
}

// Language mappings for Judge0
const LANGUAGE_MAP: Record<string, number> = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'cpp': 54,
  'c': 50,
  'go': 60,
  'rust': 73,
  'ruby': 72,
  'php': 68,
};

export async function runCodeWithValidation(code: string, language: string, testCases: TestCase[]): Promise<{ allPassed: boolean, score: number, testResults: any[] }> {
  const languageId = LANGUAGE_MAP[language.toLowerCase()] || 63;
  const testResults: Array<{ passed: boolean; input: string; expected: string; actual: string }> = [];
  let allPassed = true;

  if (!testCases || testCases.length === 0) {
    const result = await executeCode(code, languageId, null);
    return { allPassed: result.success, score: result.success ? 100 : 0, testResults: [] };
  }

  for (const testCase of testCases) {
    const result = await executeCode(code, languageId, testCase.input);
    
    if (!result.success) {
      testResults.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: result.error || "Execution failed"
      });
      allPassed = false;
    } else {
      const actualOutput = (result.output || "").trim();
      const expectedOutput = (testCase.expected || "").trim();
      const passed = actualOutput === expectedOutput;
      
      testResults.push({
        passed,
        input: testCase.input,
        expected: expectedOutput,
        actual: actualOutput
      });
      
      if (!passed) allPassed = false;
    }
  }

  const passedCount = testResults.filter(r => r.passed).length;
  const score = testCases.length > 0 ? (passedCount / testCases.length) * 100 : (allPassed ? 100 : 0);

  return { allPassed, score, testResults };
}

async function executeCode(code: string, languageId: number, stdin: string | null): Promise<ExecuteResult> {
  try {
    // 1. Piston (Primary Execution Service)
    const piston = await executeWithPiston(code, languageId, stdin);
    if (piston) return piston;
    
    return {
      success: false,
      error: 'Code execution service is currently unavailable. Please try again later.'
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function executeWithPiston(code: string, languageId: number, stdin: string | null): Promise<ExecuteResult | null> {
  const pistonUrl = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";
  const pistonLanguages: Record<number, string> = { 63: "javascript", 71: "python3", 62: "java", 54: "c++", 50: "c" };
  const lang = pistonLanguages[languageId];
  if (!lang) return null;

  try {
    const response = await fetch(`${pistonUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, version: "*", files: [{ content: code }], stdin: stdin || "" })
    });
    if (!response.ok) return null;
    const result = await response.json();
    return {
      success: !result.run?.stderr,
      output: result.run?.stdout || "",
      error: result.run?.stderr || undefined
    };
  } catch { return null; }
}
