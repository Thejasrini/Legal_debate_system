/**
 * Safely parses JSON strings returned by AI models.
 * Handles Markdown code fences (e.g. ```json ... ```) and leading/trailing noise.
 */
export function safeParseJSON(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid or empty string provided for JSON parsing.");
  }

  let cleaned = text.trim();

  // Strip markdown code block wrappers if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  } else {
    // Extract JSON substring from the first '{' to the last '}'
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse JSON response. Raw text:", text);
    throw new Error(`JSON Parsing Error: ${error.message}`);
  }
}
