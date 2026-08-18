import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({
  model: "gemini-flash-lite-latest"
});

/**
 * Generates content with smart retry handling for rate limits (429) and high demand (503).
 * @param {string} prompt 
 * @param {number} maxRetries 
 */
export async function generateContentWithRetry(prompt, maxRetries = 5) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      attempt++;
      const is429 = error.status === 429 || (error.message && error.message.includes("429"));
      const is503 = error.status === 503 || (error.message && error.message.includes("503"));
      
      const backoffMs = is429 ? 10000 : is503 ? 4000 : 2000;
      
      console.warn(`⚠️ Gemini API call attempt ${attempt}/${maxRetries} failed (${error.status || "Error"}). Retrying in ${backoffMs / 1000}s...`);
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}