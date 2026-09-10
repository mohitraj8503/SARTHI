import { NextRequest, NextResponse } from 'next/server';
import { parseQuery, getFallbackSuggestions, getThanksReply, getHelpReply } from '@/lib/intent-engine';
import { fetchMetricData, fetchStudentData } from '@/lib/data-fetcher';
import { formatNaturalResponse, formatFollowUpSuggestions } from '@/lib/response-formatter';
import { METRICS } from '@/lib/metrics-config';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json({
        success: true,
        answer: "Hey! 👋 Ask me anything about your platform — revenue, students, courses, or growth!",
        suggestions: ['Total revenue', 'Active users', 'Published courses'],
      });
    }

    const intent = parseQuery(query);

    // ── GREETING / SMALL TALK ─────────────────────────────────────────────────
    if (intent.type === 'greeting') {
      // Check if it's specific small talk with a preset reply
      const reply = (intent as any).smallTalkReply;
      return NextResponse.json({
        success: true,
        answer: reply ?? "Hey! 👋 I'm Aastha — your SARTHI admin intelligence.\nAsk me about Revenue, Students, Courses, or Growth.\nOr try: 'Who is [name]' for student profile lookup.",
        suggestions: ['Total revenue', 'Active users', 'Published courses', 'Growth trends'],
      });
    }

    // ── THANKS ────────────────────────────────────────────────────────────────
    if (intent.type === 'thanks') {
      return NextResponse.json({
        success: true,
        answer: getThanksReply(),
        suggestions: ['Total revenue', 'Active users'],
      });
    }

    // ── HELP ──────────────────────────────────────────────────────────────────
    if (intent.type === 'help') {
      return NextResponse.json({
        success: true,
        answer: getHelpReply(),
        suggestions: ['Total revenue', 'Active users', 'Published courses', 'Growth trends'],
      });
    }

    // ── METRIC QUERY ──────────────────────────────────────────────────────────
    if (intent.type === 'metric' && intent.metricId) {
      const data = await fetchMetricData(intent.metricId);

      if (data.error) {
        return NextResponse.json({
          success: false,
          answer: "⚠️ Hmm, couldn't reach the database. Please try again in a moment.",
          suggestions: ['Retry', 'Active users'],
        });
      }

      const answer = formatNaturalResponse(intent.metricId, data);
      const suggestions = formatFollowUpSuggestions(intent.metricId, data);

      return NextResponse.json({
        success: true,
        answer,
        metric: METRICS[intent.metricId]?.label,
        data,
        suggestions,
        // Show "Did you mean?" if fuzzy matched
        correctedQuery: (intent as any).correctedQuery,
      });
    }

    // ── STUDENT SEARCH ────────────────────────────────────────────────────────
    if (intent.type === 'student_search') {
      const data = await fetchStudentData(intent.originalQuery as string);
      if (data.error) {
        return NextResponse.json({
          success: true,
          answer: `🔍 No student found matching "${intent.originalQuery}".\nTry: 'Who is [exact name]'`,
          suggestions: ['Active users', 'New signups'],
        });
      }
      const answer = `👤 Student Profile\nName: ${data.name}\nEmail: ${data.email}\nStatus: ${data.status ?? 'Active'}\nEnrollments: ${data.enrollments ?? 0}\nJoined: ${data.joined}`;
      return NextResponse.json({
        success: true,
        answer,
        suggestions: ['Active students', 'Course stats', 'Revenue'],
      });
    }

    // ── UNKNOWN / FUZZY FALLBACK ──────────────────────────────────────────────
    const corrected = (intent as any).correctedQuery;
    const fallbackAnswer = corrected
      ? `🔍 Did you mean "${corrected}"? I couldn't find an exact match.\nTry asking about:`
      : `🤔 I didn't quite get that. I can help you with:`;

    return NextResponse.json({
      success: true,
      answer: `${fallbackAnswer}\n• Revenue & earnings\n• Students & users\n• Published courses\n• Growth trends\n• Student profiles (say 'Who is [name]')`,
      suggestions: getFallbackSuggestions(query),
      correctedQuery: corrected,
    });

  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({
      success: false,
      answer: "🙃 Hmm, I'm having a moment. Please try again — or ask about revenue, users, or courses.",
      suggestions: ['Total revenue', 'Active users', 'Help'],
    }, { status: 200 });
  }
}

