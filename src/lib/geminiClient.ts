import { GoogleGenAI, type Content } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export type GeminiChatMessage = Content;

export interface GeminiTextClient {
   generateText(prompt: string, systemInstruction?: string): Promise<string>;
   sendChatMessage(history: GeminiChatMessage[], message: string, systemInstruction?: string): Promise<string>;
}

class GoogleGeminiTextClient implements GeminiTextClient {
   constructor(private readonly ai: GoogleGenAI, private readonly model = DEFAULT_GEMINI_MODEL) {}

   async generateText(prompt: string, systemInstruction?: string) {
      const response = await this.ai.models.generateContent({
         model: this.model,
         contents: prompt,
         config: systemInstruction ? { systemInstruction } : undefined,
      });
      return response.text ?? '';
   }

   async sendChatMessage(history: GeminiChatMessage[], message: string, systemInstruction?: string) {
      const chat = this.ai.chats.create({
         model: this.model,
         history,
         config: systemInstruction ? { systemInstruction } : undefined,
      });
      const response = await chat.sendMessage({ message });
      return response.text ?? '';
   }
}

export const createGeminiTextClient = (apiKey = import.meta.env.VITE_GEMINI_API_KEY): GeminiTextClient | null => {
   if (!apiKey) {
      return null;
   }

   return new GoogleGeminiTextClient(new GoogleGenAI({ apiKey }));
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
