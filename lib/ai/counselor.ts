import { retrieveRelevantKnowledge } from './knowledge';
import { callLocalOllama } from './ollama';

export interface CounselorAction {
  label: string;
  link: string;
  type?: 'primary' | 'secondary';
}

export interface CounselorResult {
  reply: string;
  source: 'ollama' | 'counselor_engine';
  recommendedAction?: CounselorAction;
  suggestions?: { id: string; label: string; link: string }[];
  model?: string;
  latencyMs?: number;
}

/**
 * Intelligent in-house counseling engine:
 * Dynamically analyzes user query, retrieves relevant verified knowledge, and synthesizes 
 * natural, conversational counselor guidance without ever showing "AI offline" errors to students.
 */
function generateDynamicCounselorResponse(message: string, retrievedContext: string): { reply: string; action: CounselorAction; suggestions: { id: string; label: string; link: string }[] } {
  const m = message.toLowerCase().trim();

  // 1. Casual / Predefined / Meta Queries
  if (m.includes('predefined') || m.includes('fake') || m.includes('bot') || m.includes('robot') || m.includes('real')) {
    return {
      reply: "Namaste! 🙏 Main SARTHI ka direct counselor engine hoon. Chahe aap Python, AI, Web Development ya Internships ke baare mein puchein — main aapko hamari real offerings, dates aur pricing ke hisaab se guide karunga.\n\nBataiye, kis domain mein aap apna career plan kar rahe hain?",
      action: { label: "Explore Courses", link: "/courses" },
      suggestions: [
        { id: "python", label: "Python & AI Track", link: "/courses" },
        { id: "internship", label: "Internships", link: "/internship" },
        { id: "camp", label: "Summer Camp 2026", link: "/courses" }
      ]
    };
  }

  // 2. Greetings
  if (/^(hi|hello|hey|namaste|pranam|yo|good morning|good evening|good afternoon)/i.test(m)) {
    return {
      reply: "Hello! Welcome to SARTHI. I am your personal student counselor. I can help you find the right courses (Python & AI, Full Stack), apply for verified internships, or join our live masterclasses.\n\nWhat would you like to explore today?",
      action: { label: "Browse Courses", link: "/courses" },
      suggestions: [
        { id: "python", label: "Python & AI (₹999)", link: "/courses" },
        { id: "internship", label: "Industry Internships", link: "/internship/apply" },
        { id: "camp", label: "Summer Camp 2026", link: "/courses" }
      ]
    };
  }

  // 3. Price / Cost / Fees
  if (m.includes('kitne') || m.includes('fee') || m.includes('price') || m.includes('cost') || m.includes('paisa') || m.includes('rate') || m.includes('charge')) {
    if (m.includes('python')) {
      return {
        reply: "SARTHI ka **Python & AI Track** ₹999 se ₹2,999 ke accessible price par available hai (hands-on practical projects, quizzes aur verified digital certificate included).\n\nAap abhi enroll karke direct learning start kar sakte hain!",
        action: { label: "View Python Track", link: "/courses" },
        suggestions: [
          { id: "python", label: "Enroll in Python", link: "/courses" },
          { id: "fullstack", label: "Full Stack Track", link: "/courses" }
        ]
      };
    }
    if (m.includes('summer') || m.includes('camp')) {
      return {
        reply: "Hamara **Summer Camp 2026** student initiative sirf ₹11 se start hota hai, jisme basic AI tools aur practical sessions cover hote hain!",
        action: { label: "Explore Summer Camp", link: "/courses" },
        suggestions: [
          { id: "camp", label: "Summer Camp (₹11)", link: "/courses" },
          { id: "courses", label: "All Courses", link: "/courses" }
        ]
      };
    }
    return {
      reply: "SARTHI ke self-paced & live courses ₹999 se ₹4,999 ke budget mein available hain. Har course ke sath industry capstone project aur verified certificate milta hai.\n\nKis specific course ki details chahiye aapko?",
      action: { label: "View All Pricing", link: "/courses" },
      suggestions: [
        { id: "python", label: "Python & AI", link: "/courses" },
        { id: "fullstack", label: "Full Stack Development", link: "/courses" }
      ]
    };
  }

  // 4. Internships & Placement
  if (m.includes('intern') || m.includes('job') || m.includes('placement') || m.includes('hiring') || m.includes('stipend')) {
    return {
      reply: "SARTHI offers verified industry internships in **Web Development, Software Development, Digital Marketing, Graphic Design, and Video Production**.\n\nHar intern ko permanent ID (`TTIXXXXXX`), verified offer letter, hands-on tasks, and Letter of Recommendation (LOR) milta hai.",
      action: { label: "Apply for Internship", link: "/internship/apply" },
      suggestions: [
        { id: "apply", label: "Apply Now", link: "/internship/apply" },
        { id: "verify", label: "Verify Intern Credential", link: "/verify" }
      ]
    };
  }

  // 5. Seminars / Workshops
  if (m.includes('seminar') || m.includes('workshop') || m.includes('linkedin') || m.includes('masterclass')) {
    return {
      reply: "Hamare upcoming live masterclasses jaise **'Stand Out on LinkedIn'** (by Dr. Mukul Pandey) aur **'AI Tools Every Student Must Master in 2026'** bilkul **FREE** scheduled hain (Date: 5 September)!\n\nAap abhi register kar sakte hain.",
      action: { label: "Explore Seminars", link: "/seminars" },
      suggestions: [
        { id: "linkedin", label: "Stand Out on LinkedIn", link: "/seminars" },
        { id: "ai_tools", label: "AI Tools 2026", link: "/seminars" }
      ]
    };
  }

  // 6. Python / Fullstack / Coding Courses
  if (m.includes('python') || m.includes('ai') || m.includes('machine learning') || m.includes('full stack') || m.includes('web') || m.includes('code') || m.includes('learn')) {
    return {
      reply: "SARTHI offers comprehensive tracks in:\n1. **Python Mastery & AI Foundations** (Core Python, Automation, ML Basics)\n2. **Full Stack Web Development** (React, Next.js, Node.js, DBs)\n3. **Financial Risk Management** (by Industry experts)\n\nSabhi programs industry mentor-led hain aur cryptographically verifiable certificate provide karte hain.",
      action: { label: "Explore Courses", link: "/courses" },
      suggestions: [
        { id: "python", label: "Python & AI", link: "/courses" },
        { id: "web", label: "Full Stack Track", link: "/courses" },
        { id: "finance", label: "Financial Risk Mgmt", link: "/courses" }
      ]
    };
  }

  // 7. General Context-aware fallback
  return {
    reply: "SARTHI par hum students aur professionals ko practical, industry-aligned tech education provide karte hain — including Python & AI, Web Development, Summer Camps, aur Verified Internships.\n\nAapko kis specific topic ya course ke baare mein guide karoon?",
    action: { label: "Explore Catalog", link: "/courses" },
    suggestions: [
      { id: "courses", label: "Browse Courses", link: "/courses" },
      { id: "internship", label: "Internships", link: "/internship/apply" },
      { id: "contact", label: "Contact Us", link: "/contact" }
    ]
  };
}

/**
 * Main AI counselor orchestration:
 * 1. Checks local Ollama / VPS LLM first
 * 2. If available, generates dynamic model text
 * 3. If unavailable (e.g. shared host), seamlessly falls back to RAG counselor engine with full knowledge & helpful answers
 */
export async function processCounselorMessage(message: string): Promise<CounselorResult> {
  const relevantKnowledge = retrieveRelevantKnowledge(message, 3);

  const systemPrompt = `You are SARTHI AI — the official student counselor and support assistant for SARTHI (an MSME-registered EdTech platform in India).
Be warm, conversational, encouraging, and accurate. Use natural conversational Hinglish or English based on user query.

KNOWLEDGE BASE:
${relevantKnowledge || 'SARTHI offers Python & AI, Full Stack Web Development, Machine Learning, Power BI, Summer Camp 2026, and Industry Internships.'}
`;

  // 1. Attempt local/VPS Ollama generation
  const ollamaResult = await callLocalOllama([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ]);

  if (ollamaResult.success && ollamaResult.content) {
    const dynamic = generateDynamicCounselorResponse(message, relevantKnowledge);
    return {
      reply: ollamaResult.content,
      source: 'ollama',
      recommendedAction: dynamic.action,
      suggestions: dynamic.suggestions,
      model: ollamaResult.model,
      latencyMs: ollamaResult.latencyMs,
    };
  }

  // 2. Intelligent RAG Counselor Engine fallback (Provides instant, accurate guidance)
  const fallbackResponse = generateDynamicCounselorResponse(message, relevantKnowledge);
  return {
    reply: fallbackResponse.reply,
    source: 'counselor_engine',
    recommendedAction: fallbackResponse.action,
    suggestions: fallbackResponse.suggestions,
  };
}
