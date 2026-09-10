import { IntentResult, IntentType } from './types';
import { METRICS } from './metrics-config';

// ─── SMALL TALK ───────────────────────────────────────────────────────────────
const GREETINGS  = ['hello', 'hi', 'hey', 'namaste', 'hii', 'helo', 'sup', 'wassup', 'yo', 'oye', 'oyye', 'hai', 'helo'];
const HELP_WORDS = ['help', 'kya kar', 'what can', 'features', 'options', 'commands'];
const THANKS     = ['thanks', 'thank you', 'shukriya', 'dhanyavad', 'thx', 'ty'];

const SMALL_TALK: Record<string, string> = {
  'how are you':   "I'm great! Ready to crunch your platform data. 🚀 What would you like to know?",
  'kya haal hai':  "Bilkul theek! Aapke platform ka data ready hai. Kya chahiye? 🚀",
  'who are you':   "I'm Aastha — SARTHI's admin intelligence layer. I track revenue, users, courses & growth in real-time.",
  'kaun ho':       "Main Aastha hoon — SARTHI ka AI assistant. Revenue, users, courses sab kuch track karta hoon! 🧠",
  'what is this':  "This is your Admin AI Dashboard. Ask me anything about your platform data!",
  'good morning':  "Good morning! ☀️ Ready to check your platform stats?",
  'good night':    "Good night! 🌙 All systems are running smoothly.",
  'bye':           "Goodbye! 👋 Come back anytime for platform insights.",
  'ok':            "Got it! What else would you like to know?",
  'okay':          "Sure! What can I help you with?",
  'cool':          "Glad to help! 😎 What else?",
  'nice':          "Thanks! Ask me about revenue, users, or courses anytime.",
};

// ─── LEVENSHTEIN FUZZY MATCHING ───────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: b.length + 1 }, (_, j) =>
    Array.from({ length: a.length + 1 }, (_, i) => (j === 0 ? i : i === 0 ? j : 0))
  );
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      dp[j][i] = a[i-1] === b[j-1]
        ? dp[j-1][i-1]
        : 1 + Math.min(dp[j][i-1], dp[j-1][i], dp[j-1][i-1]);
    }
  }
  return dp[b.length][a.length];
}

export function fuzzyScore(word: string, keyword: string): number {
  if (word === keyword) return 1;
  if (word.includes(keyword) || keyword.includes(word)) return 0.9;
  const dist = levenshtein(word, keyword);
  return 1 - dist / Math.max(word.length, keyword.length);
}

export function fuzzyMatchKeywords(query: string, keywords: string[]): { matched: boolean; best: string; score: number } {
  const words = query.toLowerCase().split(/\s+/);
  let best = { matched: false, best: '', score: 0 };
  for (const word of words) {
    for (const kw of keywords) {
      const score = fuzzyScore(word, kw);
      if (score > best.score) {
        best = { matched: score >= 0.75, best: kw, score };
      }
    }
  }
  return best;
}

// ─── MAIN QUERY PARSER ────────────────────────────────────────────────────────
export function parseQuery(query: string): IntentResult & { correctedQuery?: string; isSmallTalk?: boolean; smallTalkReply?: string } {
  const q = query.toLowerCase().trim();

  // 1. Greeting
  if (GREETINGS.some(g => q === g || q.startsWith(g + ' ') || q.endsWith(' ' + g))) {
    return { type: 'greeting', metricId: null, confidence: 1, originalQuery: query };
  }

  // 2. Small talk (exact phrase match)
  for (const [phrase, reply] of Object.entries(SMALL_TALK)) {
    if (q.includes(phrase)) {
      return { type: 'greeting', metricId: null, confidence: 1, originalQuery: query, isSmallTalk: true, smallTalkReply: reply };
    }
  }

  // 3. Thanks
  if (THANKS.some(t => q.includes(t))) {
    return { type: 'thanks', metricId: null, confidence: 1, originalQuery: query };
  }

  // 4. Help
  if (HELP_WORDS.some(h => q.includes(h))) {
    return { type: 'help', metricId: null, confidence: 1, originalQuery: query };
  }

  // 5. Student search
  const studentMatch = q.match(/(?:who is|about|find student|search for|kaun hai|dhundo)\s+(.+)/i);
  if (studentMatch) {
    return { type: 'student_search', metricId: 'STUDENT', confidence: 1, originalQuery: studentMatch[1].trim() };
  }

  // 6. Exact keyword metric match
  let best: IntentResult & { correctedQuery?: string } = {
    type: 'unknown' as IntentType,
    metricId: null,
    confidence: 0,
    originalQuery: query,
  };

  for (const [id, config] of Object.entries(METRICS)) {
    let score = 0;
    config.keywords.forEach(k => { if (q.includes(k)) score += config.weight; });
    config.synonyms.forEach(s => { if (q.includes(s)) score += config.weight * 0.6; });
    if (score > best.confidence) {
      best = { type: 'metric', metricId: id, confidence: Math.min(score, 1), originalQuery: query };
    }
  }

  if (best.type === 'metric') return best;

  // 7. Fuzzy metric match (typo correction)
  let fuzzyBest: typeof best & { correctedQuery?: string } = { ...best };

  for (const [id, config] of Object.entries(METRICS)) {
    const allKw = [...config.keywords, ...config.synonyms];
    const fuzzy = fuzzyMatchKeywords(q, allKw);
    if (fuzzy.score > 0.75 && fuzzy.score > (fuzzyBest.confidence || 0)) {
      const corrected = q.replace(/\S+/g, word => {
        const fs = fuzzyScore(word, fuzzy.best);
        return fs >= 0.75 ? fuzzy.best : word;
      });
      fuzzyBest = {
        type: 'metric',
        metricId: id,
        confidence: fuzzy.score * config.weight,
        originalQuery: query,
        correctedQuery: corrected !== q ? fuzzy.best : undefined,
      };
    }
  }

  return fuzzyBest;
}

// ─── REPLY HELPERS ────────────────────────────────────────────────────────────
export function getGreetingReply(): string {
  return "Hey! 👋 I'm Aastha — your SARTHI admin intelligence.\nAsk me about Revenue, Students, Courses, or Growth.\nOr try: 'Who is [name]' for student profile lookup.";
}
export function getThanksReply(): string {
  return "You're welcome! 😊 Let me know if you need more insights.";
}
export function getHelpReply(): string {
  return "📊 Here's what I can help with:\n• Revenue & earnings\n• Users & students\n• Published courses\n• Growth trends\n• Student profiles (say 'Who is [name]')";
}

export function getFallbackSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('revenue') || q.includes('paise'))  return ['Revenue this week', 'Revenue by course', 'Total earnings'];
  if (q.includes('user')   || q.includes('student')) return ['Active users', 'New signups', 'Who is [name]'];
  if (q.includes('course') || q.includes('certificate')) return ['Published courses', 'Course enrollments', 'Growth trends'];
  return ['Total revenue', 'Active users', 'Published courses', 'Growth trends'];
}
