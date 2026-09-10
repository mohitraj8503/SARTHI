import 'dotenv/config';

export interface GeminiMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface GeminiResponse {
  success: boolean;
  text: string;
  model: string;
  error?: string;
}

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest',
];

export async function callGemini(
  prompt: string | GeminiMessage[],
  systemInstruction?: string,
  preferredModel: string = 'gemini-3.6-flash'
): Promise<GeminiResponse> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    return {
      success: false,
      text: '',
      model: '',
      error: 'GEMINI_API_KEY is not configured.',
    };
  }

  let contents: any[] = [];
  if (typeof prompt === 'string') {
    contents = [{ role: 'user', parts: [{ text: prompt }] }];
  } else {
    contents = prompt
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role:
          m.role === 'assistant' || (m.role as string) === 'model'
            ? 'model'
            : 'user',
        parts: [{ text: m.content }],
      }));
  }

  const modelsToTry = [
    preferredModel,
    ...GEMINI_MODELS.filter((m) => m !== preferredModel),
  ];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[Gemini AI] Model ${model} returned ${res.status}: ${errText}`);
        continue;
      }

      const data = await res.json();
      const generatedText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (generatedText) {
        return {
          success: true,
          text: generatedText,
          model,
        };
      }
    } catch (e: any) {
      console.warn(`[Gemini AI] Error with model ${model}:`, e.message);
      continue;
    }
  }

  return {
    success: false,
    text: '',
    model: '',
    error: 'All Gemini models failed or quota exceeded.',
  };
}
