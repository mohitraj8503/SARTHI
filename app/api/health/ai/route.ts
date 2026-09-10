import { NextResponse } from 'next/server';
import { checkOllamaHealth } from '@/lib/ai/ollama';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await checkOllamaHealth();
    return NextResponse.json({
      ollama: health.ollama,
      model: health.model,
      source: health.source,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ollama: false,
        model: 'qwen3:0.6b-q4_K_M',
        source: 'unavailable',
        error: error.message || 'Health check failed',
      },
      { status: 500 }
    );
  }
}
