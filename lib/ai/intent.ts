import { callOpenRouter } from './router';

export type Intent =
  | 'GREETING'
  | 'COURSE_SEARCH'
  | 'PRICE_QUERY'
  | 'CERTIFICATE_QUERY'
  | 'CAREER_GUIDANCE'
  | 'SMALL_TALK'
  | 'UNKNOWN';

export async function detectIntent(query: string): Promise<Intent> {
  const q = query.toLowerCase().trim();

  // Fast Rule-Based Detection
  if (/^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening|yo)/i.test(q)) {
    return 'GREETING';
  }

  if (q.includes('price') || q.includes('cost') || q.includes('fees') || q.includes('fee') || q.includes('paisa') || q.includes('rupee') || q.includes('charge') || q.includes('stipend') || q.includes('salary')) {
    return 'PRICE_QUERY';
  }

  if (q.includes('certificate') || q.includes('cert') || q.includes('lor') || q.includes('verifiable') || q.includes('completion')) {
    return 'CERTIFICATE_QUERY';
  }

  if (q.includes('job') || q.includes('placement') || q.includes('internship') || q.includes('hiring') || q.includes('ambassador') || q.includes('work')) {
    return 'CAREER_GUIDANCE';
  }

  if (q.includes('course') || q.includes('learn') || q.includes('class') || q.includes('subject') || q.includes('program') || q.includes('study') || q.includes('track') || q.includes('syllabus') || q.includes('curriculum')) {
    return 'COURSE_SEARCH';
  }

  if (q.includes('chai') || q.includes('joke') || q.includes('funny') || q.includes('how are you') || q.includes('kaise ho') || q.includes('weather') || q.includes('song')) {
    return 'SMALL_TALK';
  }

  // Fallback to LLM Classification for complex cases
  try {
    const classificationPrompt = `Classify the following user message into exactly ONE of these categories:
- GREETING (for simple greetings)
- COURSE_SEARCH (questions about courses, syllabus, or learning coding)
- PRICE_QUERY (questions about cost, fees, pricing, or stipends)
- CERTIFICATE_QUERY (questions about certificates, verification, or LOR)
- CAREER_GUIDANCE (questions about internships, placements, or jobs)
- SMALL_TALK (unrelated chitchat, jokes, or casual remarks)
- UNKNOWN (if completely ambiguous)

Respond with ONLY the category name. Do not write anything else.

Message: "${query}"`;

    const response = await callOpenRouter([
      { role: 'user', content: classificationPrompt }
    ], ["google/gemini-2.5-flash:free"]); // Fast free model for classification

    const classified = response.content.trim().toUpperCase() as Intent;
    const validIntents: Intent[] = [
      'GREETING',
      'COURSE_SEARCH',
      'PRICE_QUERY',
      'CERTIFICATE_QUERY',
      'CAREER_GUIDANCE',
      'SMALL_TALK',
      'UNKNOWN'
    ];

    if (validIntents.includes(classified)) {
      return classified;
    }
  } catch (err) {
    console.error("LLM Intent classification failed:", err);
  }

  return 'UNKNOWN';
}
