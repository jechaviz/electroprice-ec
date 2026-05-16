import { createGeminiTextClient, parseJsonBlock, type GeminiTextClient } from "../lib/geminiClient";
import { NotificationService } from "./NotificationService";

interface ProductCampaign {
    slogan: string;
    copy: string;
    tags: string[];
}

interface FlashSaleSuggestion {
    discount: number;
    duration: number;
    reason: string;
}

export class CampaignService {
    private ai: GeminiTextClient | null = null;

    constructor() {
        this.ai = createGeminiTextClient();
    }

    /**
     * Generates a marketing slogan and ad copy for a product using Gemini.
     */
    async generateProductCampaign(productName: string, description: string, brand: string): Promise<ProductCampaign> {
        const fallback: ProductCampaign = {
            slogan: `Experience the future of ${brand}`,
            copy: `Get the best deals on ${productName}. ${description.substring(0, 50)}...`,
            tags: ['premium', 'new', brand.toLowerCase()]
        };

        if (!this.ai) {
            // Mock response if no API key is provided
            return fallback;
        }

        try {
            const prompt = `As a marketing expert, generate a catchy slogan and short ad copy (max 150 chars) for this product:
            Name: ${productName}
            Brand: ${brand}
            Description: ${description}
            
            Return format: JSON with "slogan", "copy", and "tags" (array of 3 strings).`;

            return parseJsonBlock(await this.ai.generateText(prompt), fallback);
        } catch (error) {
            console.error("AI Generation failed:", error);
            NotificationService.error("AI assistant is currently busy. Using fallback copy.");
            return {
                slogan: `Elevate your life with ${productName}`,
                copy: `Limited time offer on the latest ${brand} technology.`,
                tags: ['sale', 'trending', brand.toLowerCase()]
            };
        }
    }

    /**
     * Suggests a Flash Sale strategy based on product category.
     */
    async suggestFlashSale(category: string): Promise<FlashSaleSuggestion> {
        const fallback: FlashSaleSuggestion = { discount: 15, duration: 4, reason: "Seasonal clearance" };
        if (!this.ai) return fallback;

        try {
            const prompt = `Suggest a flash sale strategy for the category "${category}". 
            Return JSON: { "discount": number, "duration": number (hours), "reason": string }`;

            return parseJsonBlock(await this.ai.generateText(prompt), { discount: 10, duration: 2, reason: "Flash deal" });
        } catch {
            return { discount: 10, duration: 2, reason: "Special offer" };
        }
    }
}
