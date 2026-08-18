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
 * @param {Array} history Optional prior conversation turns in the current thread.
 * @returns {Promise<object>} Structured JSON object for Judge Agent.
 */
export async function judgeAgent(question, support, oppose, context = "", history = []) {
  const historySection = Array.isArray(history) && history.length > 0
    ? `
========================================
PRIOR CONVERSATION HISTORY (Current Case Thread)
========================================
${history.map((t, idx) => `Turn ${idx + 1}:
Q: ${t.question}
Judge Verdict / Decision: ${t.judge?.decision || "N/A"}`).join("\n\n")}
========================================
`
    : "";

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
${historySection}
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
   - Do NOT say "Non-delivery is automatically a deficiency in service under Section 39" or "Platform is liable because it accepted payment" unless RETRIEVED_CONTEXT explicitly says so.
   - Use cautious wording: "Based on the retrieved provision...", "Section X provides remedies where relevant allegations are proved. The retrieved provision does not, by itself, establish..."
2. CONVERSATION CONTINUITY:
   - If prior conversation history is provided above, address the new question as a continuation of the same ongoing legal matter while remaining strictly grounded in RETRIEVED_CONTEXT.
3. WINNING SIDE OPTIONS: "Support", "Oppose", or "Inconclusive".
   - Use "Inconclusive" if the retrieved law is incomplete or does not address specific platform liabilities.
4. STRENGTH / CONFIDENCE CALIBRATION:
   - Strongly supported: 85–95%
   - Partially supported: 65–84%
   - Limited retrieved support: 40–64%
   - Mostly unsupported: <40%
5. SAFETY RULE:
   - LexAgent is a legal research tool, NOT a lawyer. Use non-definitive legal language.

The JSON structure below is a SCHEMA TEMPLATE ONLY. Every value must be freshly generated from the RETRIEVED_CONTEXT and USER QUESTION above -- do not reuse any specific wording, section numbers, or scores from this template itself.

Return ONLY a valid JSON object matching this EXACT structure (no code fences, no markdown):

{
  "winningSide": "<Support | Oppose | Inconclusive>",
  "decision": "<short 2-4 sentence conclusion grounded in RETRIEVED_CONTEXT and evaluated arguments>",
  "legalRule": "<summary of what the retrieved Act text explicitly provides>",
  "application": "<how the retrieved legal rule applies to the user's specific facts>",
  "supportAssessment": "<assessment of what Support correctly or incorrectly established>",
  "opposeAssessment": "<assessment of what Oppose correctly or incorrectly established>",
  "unsupportedIssues": [
    "<issues or claims that cannot be determined from RETRIEVED_CONTEXT>"
  ],
  "evidenceRequired": [
    "<evidence required to resolve remaining factual/legal questions>"
  ],
  "recommendation": "<cautious legally grounded recommendation>",
  "confidence": <integer 0-100, calculated per the RULES above based on completeness of RETRIEVED_CONTEXT -- do not default to a fixed number>
}
`;

  const result = await generateContentWithRetry(prompt);
  const parsedJSON = safeParseJSON(result.response.text());

  console.log("========================================");
  console.log("JUDGE AGENT STRUCTURED OUTPUT");
  console.log("========================================");
  console.log(JSON.stringify(parsedJSON, null, 2));
  console.log("========================================\n");

  return parsedJSON;
}