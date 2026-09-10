/**
 * lib/ai/ollama.ts
 *
 * Self-hosted local Ollama client communicating strictly with local instance (127.0.0.1:11434).
 * ZERO EXTERNAL LLM APIS (No OpenAI, Gemini, Claude, Groq, OpenRouter).
 */

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  success: boolean;
  content: string;
  source: 'ollama' | 'ollama_unavailable';
  model: string;
  latencyMs: number;
  error?: string;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:0.6b-q4_K_M';
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 5000);
const OLLAMA_KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || '1m';
const OLLAMA_PROXY_SECRET = process.env.OLLAMA_PROXY_SECRET || '';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (OLLAMA_PROXY_SECRET) {
    headers['X-Internal-Secret'] = OLLAMA_PROXY_SECRET;
  }
  return headers;
}

export async function checkOllamaHealth(): Promise<{ ollama: boolean; model: string; source: 'ollama' | 'unavailable' }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const models = data?.models || [];
      const hasModel = models.some((m: any) => m.name === OLLAMA_MODEL || m.name?.startsWith('qwen3:0.6b'));
      return {
        ollama: true,
        model: hasModel ? OLLAMA_MODEL : (models[0]?.name || 'no_model_pulled'),
        source: 'ollama',
      };
    }
    return { ollama: false, model: OLLAMA_MODEL, source: 'unavailable' };
  } catch {
    return { ollama: false, model: OLLAMA_MODEL, source: 'unavailable' };
  }
}

export async function callLocalOllama(
  messages: OllamaChatMessage[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<OllamaResponse> {
  const modelToUse = options?.model || OLLAMA_MODEL;
  const temperature = options?.temperature ?? 0.3;
  const maxTokens = options?.maxTokens ?? 150;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: modelToUse,
        messages,
        stream: false,
        keep_alive: OLLAMA_KEEP_ALIVE, // Releases RAM back to Next.js / MySQL when idle
        options: {
          temperature,
          num_predict: maxTokens,
          num_ctx: 1024, // 1K context keeps memory strictly under 600MB
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        content: '',
        source: 'ollama_unavailable',
        model: modelToUse,
        latencyMs,
        error: `Ollama error (${res.status}): ${errText}`,
      };
    }

    const data = await res.json();
    const content = data?.message?.content?.trim() || '';

    // Strip any thinking tags if present
    const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return {
      success: true,
      content: cleaned,
      source: 'ollama',
      model: modelToUse,
      latencyMs,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      content: '',
      source: 'ollama_unavailable',
      model: modelToUse,
      latencyMs,
      error: err.name === 'AbortError' ? 'Ollama request timed out' : (err.message || 'Failed to connect to local Ollama service'),
    };
  }
}
