import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use dedicated Gemini embedding model
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001"
});

/**
 * Generates vector embedding for a given text.
 * @param {string} text
 * @returns {Promise<number[]>} Array of floating point numbers representing the vector
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text parameter must be a non-empty string.");
  }

  try {
    const result = await embeddingModel.embedContent(text);
    if (!result || !result.embedding || !result.embedding.values) {
      throw new Error("No embedding values returned from Gemini API.");
    }
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    throw error;
  }
}
