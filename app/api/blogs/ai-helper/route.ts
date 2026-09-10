export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const MODEL_CASCADE = [
  // === Ultra Low Latency (Small / Nano models) ===
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "poolside/laguna-xs-2.1:free",
  "poolside/laguna-xs.2:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "openai/gpt-oss-20b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",

  // === Low Latency (Mid-size models) ===
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "qwen/qwen3-coder:free",
  "poolside/laguna-m.1:free",

  // === Medium Latency (Large models) ===
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-120b:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",

  // === Fallback Auto-Router ===
  "openrouter/free",
];

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('AI configuration missing (NVIDIA_API_KEY or OPENROUTER_API_KEY)');
  }

  console.log('[AI-Helper] Starting cascade with', MODEL_CASCADE.length, 'models');

  for (const model of MODEL_CASCADE) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout per model

    try {
      console.log(`[AI-Helper] Trying model: ${model}`);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://sarthi-woad.vercel.app",
          "X-Title": "SARTHI AI Writer",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const responseText = await res.text();
      console.log(`[AI-Helper] Model ${model} status: ${res.status}, body length: ${responseText.length}`);

      if (res.ok) {
        const data = JSON.parse(responseText);
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          console.log(`[AI-Helper] Success with model ${model}, result length: ${text.trim().length}`);
          return text.trim();
        }
        console.warn(`[AI-Helper] Model ${model} returned empty content`);
      } else {
        console.warn(`[AI-Helper] Model ${model} HTTP ${res.status}: ${responseText.substring(0, 200)}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[AI-Helper] Failed or timed out with model ${model}:`, err.message || err);
    }
  }
  throw new Error('All AI models failed to respond or timed out. Please try again.');
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, title, content, excerpt, category } = await request.json();
    const cleanContent = (content || '').replace(/<[^>]*>/g, ' ').substring(0, 4000);

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'conclusion':
        systemPrompt = "You are a world-class technology journalist and chief editor. Write an inspiring, authoritative, and forward-looking editorial conclusion paragraph for a professional article. Synthesize the core theme of the content. Avoid clichés like 'In conclusion', 'To summarize', or 'Ultimately'. Use sophisticated vocabulary, active voice, and a strong final call to action. Output ONLY the paragraph, no markdown, no quotes.";
        userPrompt = `Title: ${title}\nCategory: ${category}\nContent Summary: ${cleanContent}`;
        break;
      case 'title':
        systemPrompt = "You are a viral headline copywriter and SEO specialist. Analyze the article body content and write a single, highly click-worthy, premium, and SEO-optimized headline for it. Use psychological triggers (curiosity, urgency, loss-aversion) and strong power words. Avoid generic clickbait; keep it elite and intellectual. Output ONLY the headline, with no labels, no quotes, and no formatting.";
        userPrompt = `Article Content:\n${cleanContent}`;
        break;
      case 'grammar':
        systemPrompt = "You are a senior editorial copyeditor. Correct the provided draft for grammar, spelling, punctuation, structure, flow, and vocabulary. Elevate the tone to be professional, clean, and engaging while preserving the original intent. Output ONLY the corrected version. Do not add intro/outro comments or explanations.";
        userPrompt = `Content: ${cleanContent}`;
        break;
      case 'expand':
        systemPrompt = "You are an elite research analyst and industry expert. Expand on the current topic by providing deep technical insights, strategic industry analysis, or concrete case details. Write 2 highly structured, analytical paragraphs. Use premium industry terminology and offer practical value. Output ONLY the paragraphs, no headings, no intro/outro.";
        userPrompt = `Title: ${title}\nCategory: ${category}\nContent: ${cleanContent}`;
        break;
      case 'summary':
        systemPrompt = "You are a master digital marketer and newsletter curator. Write a captivating, high-conversion, 2-sentence description/excerpt of the blog post. Sentence 1 must hook the reader with a dramatic stat or trend. Sentence 2 must highlight the essential value they will gain. Make it highly engaging, sleek, and premium. Output ONLY the 2 sentences, no quotes.";
        userPrompt = `Title: ${title}\nContent: ${cleanContent}`;
        break;
      case 'tags':
        systemPrompt = "You are a lead SEO growth manager. Generate 5 high-traffic, highly relevant, exact-match search tags (comma-separated) for the blog post. Focus on specific search queries. Output ONLY the tags, lowercase, comma-separated with no spaces, e.g. 'artificial-intelligence,machine-learning,tech-trends'.";
        userPrompt = `Title: ${title}\nContent: ${cleanContent}`;
        break;
      case 'seo':
        systemPrompt = "You are a senior SEO Technical Auditor. Analyze the title and content. Write a highly analytical, professional 2-sentence report. Sentence 1: Detail the absolute SEO strengths (keyword placement, semantic relevance). Sentence 2: Provide a specific, high-impact tactical optimization (e.g. key density, header structures). Make it sound professional, direct, and elite.";
        userPrompt = `Title: ${title}\nContent: ${cleanContent}`;
        break;
      case 'faq':
        systemPrompt = "You are a technical documentarian. Generate exactly 2 high-value Frequently Asked Questions and Answers (Q&A) based on the content. Structure them cleanly. Output ONLY the Q&A text. No numbering or prefixes other than 'Q:' and 'A:'.";
        userPrompt = `Title: ${title}\nContent: ${cleanContent}`;
        break;
      case 'hooks':
        systemPrompt = "You are a viral social media strategist. Write 3 highly engaging, scroll-stopping hooks for platforms like LinkedIn and Twitter. Use hooks, bold statements, and a curiosity gap. Output ONLY the hooks, one per line, no quotes.";
        userPrompt = `Title: ${title}`;
        break;
      case 'keywords':
        systemPrompt = "You are a semantic search specialist. List 5 high-intent, high-value search keywords (comma-separated) that would rank this blog post. Use actual search terms. Output ONLY the keywords, comma-separated, no spaces.";
        userPrompt = `Title: ${title}\nCategory: ${category}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await callOpenRouter(systemPrompt, userPrompt);
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error in AI helper:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
