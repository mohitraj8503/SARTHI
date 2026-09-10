require('dotenv').config();

export interface RouterResponse {
  success: boolean;
  content: string;
  model: string;
  error?: string;
}

export async function callOpenRouter(
  messages: { role: string; content: string }[],
  customModels?: string[]
): Promise<RouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      content: "",
      model: "",
      error: "OpenRouter API Key is missing in environment variables.",
    };
  }

  // Define default cascade models if none provided
  const models = customModels && customModels.length > 0 ? customModels : [
    process.env.AI_PRIMARY_MODEL || "google/gemini-2.5-flash:free",
    ...(process.env.AI_FALLBACK_MODELS || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
    process.env.AI_FREE_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1:free"
  ];

  const primaryModel = models[0];
  const fallbackModels = models.slice(1);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sarthi-woad.vercel.app",
        "X-Title": "SARTHI AI",
      },
      body: JSON.stringify({
        model: primaryModel,
        messages,
        temperature: Number(process.env.AI_TEMPERATURE || 0.4),
        max_tokens: Number(process.env.AI_MAX_TOKENS || 1200),
        route: "fallback",
        extra_body: {
          models: [primaryModel, ...fallbackModels],
          provider: {
            allow_fallbacks: true,
          },
        },
      }),
    });

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
