
import { GoogleGenAI } from "@google/genai";
import type { Product } from '../types';

export const generateProductSummary = async (product: Product): Promise<string> => {
   const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
   if (!apiKey) {
      return "AI summary is currently unavailable.";
   }

   const ai = new GoogleGenAI({ apiKey });

   const reviewsText = product.reviews.map(r => `- ${r.comment} (${r.rating}/5 stars)`).join('\n');

   const prompt = `
    You are an expert product reviewer for an e-commerce price comparison site.
    Your goal is to provide a balanced, concise, and helpful summary for customers.
    Based on the product description and user reviews below, generate a short summary (3-4 sentences).
    Highlight the key pros and cons mentioned in the reviews.
    
    Product Name: ${product.name}
    Description: ${product.description}
    
    User Reviews:
    ${reviewsText}
    
    Generate the summary now.
  `;

   try {
      const response = await ai.models.generateContent({
         model: 'gemini-2.0-flash',
         contents: prompt,
      });
      return response.text || "Could not generate AI summary at this time.";
   } catch (error) {
      console.error("Error generating summary with Gemini:", error);
      return "Could not generate AI summary at this time.";
   }
};