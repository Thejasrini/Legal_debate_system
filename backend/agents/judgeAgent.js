import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";

/**
 * Judge Agent acting as the final Legal Verifier.
 * Strictly grounded ONLY in retrieved legal context from ChromaDB.
 * Evaluates: Legal Rule -> Application -> Conclusion -> Unsupported Issues.
 * 
 * @param {string} question The user's legal question or case facts.
 * @param {object} support Output from Support Agent.
 * @param {object} oppose Output from Oppose Agent.
 * @param {string} context The retrieved legal text chunks from ChromaDB.
 * @returns {Promise<object>} Structured JSON object for Judge Agent.
 */
export async function judgeAgent(question, support, oppose, context = "") {
  // Debug output before calling Gemini
  console.log("========================================");
  console.log("JUDGE AGENT RAG CONTEXT");
  console.log("========================================");
  console.log(context || "(No RAG context provided)");
  console.log("========================================\n");

  const prompt = `
ROLE & GROUNDING MANDATE:
You are the Judge Agent for LexAgent.
You must independently evaluate: User Facts, Support Arguments, Oppose Arguments, and RETRIEVED_CONTEXT.
Retrieved Act Text is the ONLY legal authority (Retrieved Law > Agent Arguments). Do NOT treat agent arguments as legal authority.

USER QUESTION / CASE FACTS:
${question}

RETRIEVED_CONTEXT (ONLY LEGAL AUTHORITY AVAILABLE):
${context || "No legal context available."}

SUPPORT AGENT OUTPUT:
${JSON.stringify(support, null, 2)}

OPPOSE AGENT OUTPUT:
${JSON.stringify(oppose, null, 2)}

JUDGE RULES:
1. DO NOT MAKE OVERCLAIMS:
   - Do NOT say "Non-delivery is automatically a deficiency in service under Section 39" or "Flipkart is liable because it accepted payment" unless RETRIEVED_CONTEXT explicitly says so.
   - Use cautious wording: "Based on the retrieved provision...", "Section 39 provides remedies where relevant allegations are proved. The retrieved provision does not, by itself, establish that every instance of non-delivery automatically constitutes such a deficiency."
2. WINNING SIDE OPTIONS: "Support", "Oppose", or "Inconclusive".
   - Use "Inconclusive" if the retrieved law is incomplete or does not address specific platform liabilities.
3. STRENGTH / CONFIDENCE CALIBRATION:
   - Strongly supported: 85–95%
   - Partially supported: 65–84%
   - Limited retrieved support: 40–64%
   - Mostly unsupported: <40%
4. SAFETY RULE:
   - LexAgent is a legal research tool, NOT a lawyer. Use non-definitive legal language.

Return ONLY a valid JSON object matching this EXACT structure (no code fences, no markdown):

{
  "winningSide": "Inconclusive",
  "decision": "Based on the retrieved material, Section 39(1) of the Consumer Protection Act, 2019 provides statutory remedies such as refund or replacement where allegations are proved to the satisfaction of the District Commission. However, the retrieved Section 39 text alone does not establish specific e-commerce platform liability rules or automatic deficiency for non-delivery without factual proof.",
  "legalRule": "Section 39(1) of the Consumer Protection Act, 2019 explicitly provides that where the District Commission is satisfied that the goods complained against suffer from any defect or that allegations are proved, it shall issue an order directing one or more remedies, including defect removal, replacement under Section 39(1)(b), return of price with interest under Section 39(1)(c), or compensation under Section 39(1)(d).",
  "application": "The consumer alleges non-delivery/defect regarding an order. Applying Section 39(1), if the consumer establishes the allegations with proof before the District Commission, statutory remedies such as price return or replacement become available.",
  "supportAssessment": "Support correctly identified that Section 39(1)(c) provides for return of price with interest and Section 39(1)(b) for replacement when statutory conditions are satisfied.",
  "opposeAssessment": "Oppose correctly established that Section 39(1) remedies are conditional upon allegations being proved to the satisfaction of the District Commission.",
  "unsupportedIssues": [
    "Not established by retrieved legal material: specific e-commerce platform liabilities, Flipkart intermediary safe harbour rules, or automatic deficiency classifications for non-delivery."
  ],
  "evidenceRequired": [
    "Proof of purchase showing transaction details",
    "Evidence establishing non-delivery or product defect"
  ],
  "recommendation": "On the facts provided, the consumer may seek remedies under Section 39(1) by submitting proof of transaction and non-delivery/defect to the District Commission. Additional e-commerce specific provisions would be required to determine platform-specific liability.",
  "confidence": 55
}
`;

  const result = await generateContentWithRetry(prompt);
  const parsedJSON = safeParseJSON(result.response.text());

  // Debug output after Gemini responds
  console.log("========================================");
  console.log("JUDGE AGENT STRUCTURED OUTPUT");
  console.log("========================================");
  console.log(JSON.stringify(parsedJSON, null, 2));
  console.log("========================================\n");

  return parsedJSON;
}