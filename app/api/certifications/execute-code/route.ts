export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

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

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, language, testCases, questionId } = body;

    if (!code || !language) {
      return NextResponse.json({ success: false, error: "Missing code or language" }, { status: 400 });
    }

    const languageId = LANGUAGE_MAP[language.toLowerCase()];
    if (!languageId) {
      return NextResponse.json({ success: false, error: `Unsupported language: ${language}` }, { status: 400 });
    }

    // If no test cases provided, just compile/run the code
    if (!testCases || testCases.length === 0) {
      const result = await executeCode(code, languageId, null);
      return NextResponse.json(result);
    }

    // Run all test cases
    const testResults: Array<{ passed: boolean; input: string; expected: string; actual: string }> = [];
    let allPassed = true;

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

    return NextResponse.json({
      success: true,
      allPassed,
      testResults,
      score: allPassed ? 100 : 0
    });

  } catch (error: any) {
    console.error("Code execution error:", error);
    return NextResponse.json({ success: false, error: "Code execution failed" }, { status: 500 });
  }
}

async function executeCode(code: string, languageId: number, stdin: string | null): Promise<ExecuteResult> {
  try {
    // 1. Piston API (Primary Service)
    const pistonResult = await executeWithPiston(code, languageId, stdin);
    if (pistonResult) return pistonResult;
    
    return {
      success: false,
      error: "Code execution service is currently unavailable. Please try again later."
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Execution failed"
    };
  }
}

async function executeWithPiston(code: string, languageId: number, stdin: string | null): Promise<ExecuteResult | null> {
  const pistonUrl = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";
  
  // Map language IDs to Piston language names
  const pistonLanguages: Record<number, string> = {
    63: "javascript",
    71: "python3",
    62: "java",
    54: "c++",
    50: "c",
    60: "go",
    73: "rust",
    72: "ruby",
    68: "php"
  };
  
  const pistonLang = pistonLanguages[languageId];
  if (!pistonLang) return null;

  try {
    const response = await fetch(`${pistonUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: "*",
        files: [{ content: code }],
        stdin: stdin || ""
      })
    });

    if (!response.ok) return null;

    const result = await response.json();
    
    if (result.run?.stderr) {
      return {
        success: false,
        error: result.run.stderr
      };
    }

    return {
      success: true,
      output: result.run?.stdout || "",
      time: result.run?.execution_time ? `${result.run.execution_time}s` : undefined
    };
  } catch {
    return null;
  }
}

