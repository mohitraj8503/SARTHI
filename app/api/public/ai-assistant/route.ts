import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processCounselorMessage } from "@/lib/ai/counselor";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  query: z.string().min(1).max(1000),
  userData: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = QuerySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please ask a clearer question." },
        { status: 400 }
      );
    }

    const { query } = result.data;

    // Process through our counselor engine (Ollama if alive, else intelligent dynamic counselor)
    const counselorResult = await processCounselorMessage(query);

    return NextResponse.json({
      success: true,
      source: counselorResult.source,
      answer: {
        content: counselorResult.reply,
        type: counselorResult.recommendedAction ? 'suggestion' : 'text',
        suggestions: counselorResult.suggestions?.map(s => ({
          id: s.id,
          label: s.label,
          link: s.link
        })),
        recommendedAction: counselorResult.recommendedAction,
      },
    });
  } catch (err: any) {
    console.error("AI Assistant API error:", err);
    return NextResponse.json(
      {
        success: true,
        source: 'counselor_engine',
        answer: {
          content: "Namaste! I am SARTHI AI Counselor. How can I help you with our courses or internship programs today?",
          type: 'text',
          suggestions: [
            { id: 'courses', label: 'Explore Courses', link: '/courses' },
            { id: 'internship', label: 'Internships', link: '/internship/apply' }
          ]
        },
      }
    );
  }
}
