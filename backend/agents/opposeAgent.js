import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";

/**
 * Oppose Agent representing the Company/Respondent perspective.
 * Strictly grounded ONLY in retrieved legal context from ChromaDB.
 * Prohibits inventing company defenses, intermediary status, courier liability, or terms of service.
 * 
 * @param {string} question The user's legal question or case facts.
 * @param {string} context The retrieved legal text chunks from ChromaDB.
 * @param {Array} history Optional prior conversation turns in the current thread.
 * @returns {Promise<object>} Structured JSON object for Oppose Agent.
 */
export async function opposeAgent(question, context = "", history = []) {
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
  console.log("OPPOSE AGENT RAG CONTEXT");
  console.log("========================================");
  console.log(context || "(No RAG context provided)");
  console.log("========================================\n");

  const prompt = `
ROLE & GROUNDING MANDATE:
You are the Oppose Agent for the COMPANY / RESPONDENT.
You must challenge the Support argument, but you MUST be strictly grounded in RETRIEVED_CONTEXT.
${historySection}
USER QUESTION / CASE FACTS:
${question}

RETRIEVED_CONTEXT (ONLY LEGAL AUTHORITY AVAILABLE):
${context || "No legal context available."}

RULES:
1. DO NOT INVENT UNRETRIEVED DEFENSES:
   - Do NOT say "Flipkart has intermediary immunity", "Safe harbour applies", "Third-party courier is solely liable", "Burden of proof lies on consumer", "OTP is legally required", "Warranty terms apply", or "Laboratory testing is mandatory" UNLESS explicitly present in RETRIEVED_CONTEXT.
   - If such a defense is not present in RETRIEVED_CONTEXT, explicitly label it: "Not established by retrieved legal material."
2. CHALLENGE USING EXPRESS STATUTORY CONDITIONS:
   - Point out that statutory remedies are conditional upon the District Commission being satisfied that allegations or defects are proved.
3. CONVERSATION CONTINUITY:
   - If prior conversation history is provided above, address the new question as a continuation of the same ongoing legal matter while remaining strictly grounded in RETRIEVED_CONTEXT.
4. CITATION DISCIPLINE:
   - For legal arguments, include exact legalBasis array [{ "section": "Section ...", "title": "...", "source": "Consumer Protection Act, 2019", "page": ... }].

The JSON structure below is a SCHEMA TEMPLATE ONLY. Every value must be freshly generated from the RETRIEVED_CONTEXT and USER QUESTION above -- do not reuse any specific wording, section numbers, or scores from this template itself.

Return ONLY a valid JSON object matching this EXACT structure (no code fences, no markdown):

{
  "position": "<one sentence stating the company position, grounded strictly in RETRIEVED_CONTEXT for THIS question>",
  "keyArguments": [
    {
      "argument": "<an opposing argument text citing a specific section number actually present in RETRIEVED_CONTEXT above>",
      "type": "<legal | factual>",
      "status": "<EXPLICITLY SUPPORTED | INFERRED | UNSUPPORTED BY RETRIEVED LEGAL MATERIAL>",
      "legalBasis": [
        {
          "section": "<exact section from RETRIEVED_CONTEXT>",
          "title": "<its title>",
          "source": "Consumer Protection Act, 2019",
          "page": <integer page number>
        }
      ]
    }
  ],
  "legalBasis": [
    {
      "section": "<exact section from RETRIEVED_CONTEXT>",
      "title": "<its title>",
      "source": "Consumer Protection Act, 2019",
      "page": <integer page number>
    }
  ],
  "weaknessesInConsumerClaim": [
    "<weakness or missing proof in the consumer's factual claim>"
  ],
  "defensesSupportedByRetrievedLaw": [
    {
      "defense": "<a defense text grounded strictly in RETRIEVED_CONTEXT>",
      "status": "<EXPLICITLY SUPPORTED | INFERRED | UNSUPPORTED BY RETRIEVED LEGAL MATERIAL>",
      "legalBasis": [
        {
          "section": "<exact section from RETRIEVED_CONTEXT>",
          "title": "<its title>",
          "source": "Consumer Protection Act, 2019",
          "page": <integer page number>
        }
      ]
    }
  ],
  "unsupportedClaims": [
    "<any defense or claim that is NOT established by RETRIEVED_CONTEXT>"
  ],
  "strength": <integer 0-100, calculated per the RULES above based on how well RETRIEVED_CONTEXT supports this side -- do not default to a fixed number>
}
`;

  const result = await generateContentWithRetry(prompt);
  const parsedJSON = safeParseJSON(result.response.text());

  console.log("========================================");
  console.log("OPPOSE AGENT STRUCTURED OUTPUT");
  console.log("========================================");
  console.log(JSON.stringify(parsedJSON, null, 2));
  console.log("========================================\n");

  return parsedJSON;
}