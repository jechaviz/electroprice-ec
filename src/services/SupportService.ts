import { createGeminiTextClient, type GeminiChatMessage, type GeminiTextClient } from "../lib/geminiClient";
import { currentUserSignal } from "../signals/auth.signals";
import { ordersSignal } from "../signals/data.signals";

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export class SupportService {
    private ai: GeminiTextClient | null = null;
    private history: GeminiChatMessage[] = [];

    constructor() {
        this.ai = createGeminiTextClient();
    }

    /**
     * Sends a message to the AI Support Assistant.
     */
    async sendMessage(text: string): Promise<string> {
        const user = currentUserSignal.value;
        const recentOrders = ordersSignal.value.slice(-3);

        if (!this.ai) {
            // Mock Support
            if (text.toLowerCase().includes('order')) {
                return `I found your recent orders. Order #${recentOrders[0]?.id || 'N/A'} is currently ${recentOrders[0]?.status || 'unknown'}. How else can I help?`;
            }
            return "I'm a mock assistant. Please configure VITE_GEMINI_API_KEY for real AI support.";
        }

        try {
            const systemInstruction = `You are the Electroprice Support AI. 
                Customer Name: ${user?.name || 'Guest'}
                Recent Orders: ${JSON.stringify(recentOrders.map(o => ({ id: o.id, status: o.status, total: o.total })))}
                Be helpful, concise, and professional. If they ask about order status, use the provided order data.`;
            const reply = await this.ai.sendChatMessage(this.history, text, systemInstruction);

            // Update history
            this.history.push({ role: 'user', parts: [{ text }] });
            this.history.push({ role: 'model', parts: [{ text: reply }] });

            return reply;
        } catch (error) {
            console.error("Support AI failed:", error);
            return "I apologize, but I'm having trouble connecting to my brain. Please try again in a moment.";
        }
    }

    clearHistory() {
        this.history = [];
    }
}
