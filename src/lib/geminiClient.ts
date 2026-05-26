export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export type GeminiChatMessage = {
   role: 'user' | 'model';
   parts: { text: string }[];
};

export interface GeminiTextClient {
   generateText(prompt: string, systemInstruction?: string): Promise<string>;
   sendChatMessage(history: GeminiChatMessage[], message: string, systemInstruction?: string): Promise<string>;
}

interface GeminiRestResponse {
   candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

class RestGeminiTextClient implements GeminiTextClient {
   constructor(private readonly apiKey: string, private readonly model = DEFAULT_GEMINI_MODEL) {}

   private async generate(contents: GeminiChatMessage[], systemInstruction?: string) {
      const response = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
         {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               contents,
               ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
            }),
         }
      );

      if (!response.ok) {
         throw new Error(`Gemini request failed with ${response.status}`);
      }

      const data = await response.json() as GeminiRestResponse;
      return data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || '';
   }

   async generateText(prompt: string, systemInstruction?: string) {
      return this.generate([{ role: 'user', parts: [{ text: prompt }] }], systemInstruction);
   }

   async sendChatMessage(history: GeminiChatMessage[], message: string, systemInstruction?: string) {
      return this.generate([...history, { role: 'user', parts: [{ text: message }] }], systemInstruction);
   }
}

export const createGeminiTextClient = (apiKey = import.meta.env.VITE_GEMINI_API_KEY): GeminiTextClient | null => {
   if (!apiKey) {
      return null;
   }

   return new RestGeminiTextClient(apiKey);
};

export const parseJsonBlock = <T>(text: string, fallback: T): T => {
   const jsonMatch = text.match(/\{[\s\S]*\}/);
   if (!jsonMatch) {
      return fallback;
   }

   try {
      return JSON.parse(jsonMatch[0]) as T;
   } catch {
      return fallback;
   }
};
