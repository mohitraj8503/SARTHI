import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processCounselorMessage } from '@/lib/ai/counselor';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ChatSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  userData: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid chat message format.' },
        { status: 400 }
      );
    }

    const { message, userData } = parsed.data;

    // Process directly through local Ollama + RAG pipeline
    const counselorResult = await processCounselorMessage(message);

    // If user provided contact info, optionally capture as lead
    if (userData?.email) {
      try {
        await prisma.waitlistEntry.upsert({
          where: { email: userData.email },
          update: {
            name: userData.name,
            source: 'tech-tomorrow-ai',
          },
          create: {
            email: userData.email,
            name: userData.name || 'AI Chat Visitor',
            source: 'tech-tomorrow-ai',
          },
        });
      } catch (err) {
        console.warn('Lead capture error (non-fatal):', err);
      }
    }

    const isDev = process.env.NODE_ENV === 'development';

    if (counselorResult.source === 'ollama' && counselorResult.reply) {
      return NextResponse.json({
        success: true,
        source: 'ollama',
        reply: counselorResult.reply,
        recommendedAction: counselorResult.recommendedAction,
        suggestions: counselorResult.suggestions,
        ...(isDev && {
          model: counselorResult.model,
          ollamaLatencyMs: counselorResult.latencyMs,
        }),
      });
    }

    // Machine-readable offline state without pretending to be AI
    return NextResponse.json({
      success: false,
      source: 'ollama_unavailable',
      reply: null,
      message: 'SARTHI local AI service is currently unavailable. Please reach out to our team at support@sarthi.in or browse our courses.',
      recommendedAction: counselorResult.recommendedAction,
      suggestions: counselorResult.suggestions,
      ...(isDev && {
        model: counselorResult.model,
        error: counselorResult.error,
      }),
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        source: 'error',
        reply: null,
        error: 'An internal server error occurred.',
      },
      { status: 500 }
    );
  }
}
