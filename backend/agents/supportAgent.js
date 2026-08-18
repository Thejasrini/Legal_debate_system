import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";

/**
 * Support Agent representing the Consumer/Complainant perspective.
 * Strictly grounded ONLY in retrieved legal context from ChromaDB.
 * 
 * @param {string} question The user's legal question or case facts.
 * @param {string} context The retrieved legal text chunks from ChromaDB.
 * @param {Array} history Optional prior conversation turns in the current thread.
 * @returns {Promise<object>} Structured JSON object for Support Agent.
 */
export async function supportAgent(question, context = "", history = []) {
  // Build Prior History Section if available
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
  console.log("SUPPORT AGENT RAG CONTEXT");
  console.log("========================================");
  console.log(context || "(No RAG context provided)");
  console.log("========================================\n");

  const prompt = `
ROLE & GROUNDING MANDATE:
You are the Support Agent for the CONSUMER / COMPLAINANT.
You must argue for the consumer using ONLY the retrieved legal context.
You MUST NOT invent legal rules, e-commerce rules, IT Act safe harbour, burden-of-proof rules, contractual terms, or case law unless explicitly present in RETRIEVED_CONTEXT.
${historySection}
USER QUESTION / CASE FACTS:
${question}

RETRIEVED_CONTEXT (ONLY LEGAL AUTHORITY AVAILABLE):
${context || "No legal context available."}

RULES:
1. DISTINGUISH EXPRESS LAW FROM INFERENCE & UNSUPPORTED CLAIMS:
   - What the law text expressly says: Cite Act + Section + Page.
   - What can reasonably be inferred: State clearly as factual application.
   - What is not established: Mark explicitly as "Not established by retrieved legal material."
2. DO NOT CLAIM REMEDIES ARE AUTOMATIC:
   - Use phrasing such as: "Section X expressly provides that the District Commission may direct..."
   - Do NOT say "refund is guaranteed" or "non-delivery automatically constitutes deficiency".
3. CONVERSATION CONTINUITY:
   - If prior conversation history is provided above, address the new question as a continuation of the same ongoing legal matter while remaining strictly grounded in RETRIEVED_CONTEXT.
4. CITATION DISCIPLINE:
   - Every legal argument must include a "legalBasis" array with:
     - "section": Exact section/subsection from RETRIEVED_CONTEXT
     - "title": Section title from text
     - "source": "Consumer Protection Act, 2019"
     - "page": Integer page number

The JSON structure below is a SCHEMA TEMPLATE ONLY. Every value must be freshly generated from the RETRIEVED_CONTEXT and USER QUESTION above -- do not reuse any specific wording, section numbers, or scores from this template itself.

Return ONLY a valid JSON object matching this EXACT structure (no code fences, no markdown):

{
  "position": "<one sentence stating the consumer position, grounded strictly in RETRIEVED_CONTEXT for THIS question>",
  "keyArguments": [
    {
      "argument": "<an argument text that cites a specific section number actually present in RETRIEVED_CONTEXT above -- do not reuse example section numbers>",
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
  "evidenceNeeded": [
    "<specific evidence item needed to prove the claim>"
  ],
  "possibleRemedies": [
    {
      "remedy": "<statutory remedy description citing a specific section from RETRIEVED_CONTEXT>",
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
    "<any consumer claim or assertion that is NOT established by RETRIEVED_CONTEXT>"
  ],
  "strength": <integer 0-100, calculated per the RULES above based on how well RETRIEVED_CONTEXT supports this side -- do not default to a fixed number>
}
`;

  const result = await generateContentWithRetry(prompt);
  const parsedJSON = safeParseJSON(result.response.text());

  console.log("========================================");
  console.log("SUPPORT AGENT STRUCTURED OUTPUT");
  console.log("========================================");
  console.log(JSON.stringify(parsedJSON, null, 2));
  console.log("========================================\n");

  return parsedJSON;
}