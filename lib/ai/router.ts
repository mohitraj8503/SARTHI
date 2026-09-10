import 'dotenv/config';
import { callGemini } from './gemini';

export interface RouterResponse {
  success: boolean;
  content: string;
  model: string;
  source?: 'gemini' | 'openrouter' | 'ollama' | 'fallback';
  error?: string;
  latencyMs?: number;
}

const OPENROUTER_MODELS = [
  "openai/gpt-4o-mini",
  "google/gemini-2.5-flash",
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat",
  "anthropic/claude-3.5-haiku",
  "mistralai/mistral-small-24b-instruct-2501",
];

export async function callOpenRouter(
  messages: { role: string; content: string }[],
  customModels?: string[]
): Promise<RouterResponse> {
  const startTime = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      content: "",
      model: "",
      error: "OpenRouter API Key is missing in environment variables.",
    };
  }

  const models = customModels && customModels.length > 0 ? customModels : OPENROUTER_MODELS;
  const primaryModel = models[0];
  const fallbackModels = models.slice(1);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout protection

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sarthi.techtomorrow.in",
        "X-Title": "SARTHI AI",
      },
      body: JSON.stringify({
        model: primaryModel,
        messages,
        temperature: Number(process.env.AI_TEMPERATURE || 0.6),
        max_tokens: Number(process.env.AI_MAX_TOKENS || 1200),
        route: "fallback",
        extra_body: {
          models: [primaryModel, ...fallbackModels],
          provider: {
            allow_fallbacks: true,
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        content: "",
        model: "",
        error: `OpenRouter error (${res.status}): ${errorText}`,
      };
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    const responseModel = data?.model || primaryModel;

    return {
      success: true,
      content,
      model: responseModel,
      source: 'openrouter',
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      content: "",
      model: "",
      error: err.message || "Failed to fetch from OpenRouter.",
    };
  }
}

/**
 * Master Unified AI Cascade:
 * Tier 1: Direct Google Gemini 3.6/3.5 Flash (Ultra-fast, 1-2s response)
 * Tier 2: OpenRouter GPT-4o-mini / Gemini-2.5 / Llama-3.3 Cascade
 */
export async function callAICascade(
  messages: { role: string; content: string }[],
  systemPrompt?: string
): Promise<RouterResponse> {
  const startTime = Date.now();

  // Tier 1: Direct Google Gemini
  try {
    const userMsg = messages.filter(m => m.role === 'user').map(m => m.content).join('\n') || '';
    const sysPrompt = systemPrompt || messages.find(m => m.role === 'system')?.content;

    const geminiRes = await callGemini(userMsg, sysPrompt, 'gemini-3.6-flash');
    if (geminiRes.success && geminiRes.text) {
      return {
        success: true,
        content: geminiRes.text,
        model: geminiRes.model,
        source: 'gemini',
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (e: any) {
    console.warn('[AI Cascade] Gemini tier failed, falling to OpenRouter:', e?.message);
  }

  // Tier 2: OpenRouter Fast Multi-Model Cascade
  try {
    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages.filter(m => m.role !== 'system')]
      : messages;

    const openRouterRes = await callOpenRouter(formattedMessages);
    if (openRouterRes.success && openRouterRes.content) {
      return openRouterRes;
    }
  } catch (e: any) {
    console.warn('[AI Cascade] OpenRouter tier failed:', e?.message);
  }

  return {
    success: false,
    content: "",
    model: "",
    error: "All AI tiers failed.",
    latencyMs: Date.now() - startTime,
  };
}

