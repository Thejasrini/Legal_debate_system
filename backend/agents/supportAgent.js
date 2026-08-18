import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";

/**
 * Support Agent representing the Consumer/Complainant perspective.
 * Strictly grounded ONLY in retrieved legal context from ChromaDB.
 * 
 * @param {string} question The user's legal question or case facts.
 * @param {string} context The retrieved legal text chunks from ChromaDB.
 * @returns {Promise<object>} Structured JSON object for Support Agent.
 */
export async function supportAgent(question, context = "") {
  // Debug output before calling Gemini
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
   - Use phrasing such as: "Section 39(1)(c) expressly provides that the District Commission may direct return of the price or charges paid, along with such interest as may be decided, where statutory conditions are satisfied."
   - Do NOT say "refund is guaranteed" or "non-delivery automatically constitutes deficiency".
3. CITATION DISCIPLINE:
   - Every legal argument must include a "legalBasis" array with:
     - "section": Exact section/subsection (e.g., "Section 39(1)(c)")
     - "title": Section title from text
     - "source": "Consumer Protection Act, 2019"
     - "page": Integer page number

Return ONLY a valid JSON object matching this EXACT structure (no code fences, no markdown):

{
  "position": "Based on the retrieved material, the consumer alleges non-delivery/defect. Section 39(1) of the Consumer Protection Act, 2019 provides that where the District Commission is satisfied that allegations or defects are proved, specified remedies may be ordered.",
  "keyArguments": [
    {
      "argument": "Section 39(1) provides that where the District Commission is satisfied that the goods complained against suffer from any of the defects specified in the complaint or claims for compensation are proved, it may issue an order directing one or more specified remedies.",
      "status": "EXPLICITLY SUPPORTED",
      "legalBasis": [
        {
          "section": "Section 39(1)",
          "title": "Findings of District Commission",
          "source": "Consumer Protection Act, 2019",
          "page": 26
        }
      ]
    }
  ],
  "legalBasis": [
    {
      "section": "Section 39(1)",
      "title": "Findings of District Commission",
      "source": "Consumer Protection Act, 2019",
      "page": 26
    }
  ],
  "evidenceNeeded": [
    "Proof of purchase showing the item was ordered and paid for",
    "Evidence establishing non-delivery or defect"
  ],
  "possibleRemedies": [
    {
      "remedy": "Section 39(1)(c) expressly provides that the District Commission may direct return of the price paid along with such interest as may be decided, where statutory conditions are satisfied.",
      "status": "EXPLICITLY SUPPORTED",
      "legalBasis": [
        {
          "section": "Section 39(1)(c)",
          "title": "Findings of District Commission",
          "source": "Consumer Protection Act, 2019",
          "page": 26
        }
      ]
    }
  ],
  "unsupportedClaims": [
    "Not established by retrieved legal material: specific e-commerce platform liabilities, Flipkart delivery rules, or automatic deficiency classifications."
  ],
  "strength": 75
}
`;

  const result = await generateContentWithRetry(prompt);
  const parsedJSON = safeParseJSON(result.response.text());

  // Debug output after Gemini responds
  console.log("========================================");
  console.log("SUPPORT AGENT STRUCTURED OUTPUT");
  console.log("========================================");
  console.log(JSON.stringify(parsedJSON, null, 2));
  console.log("========================================\n");

  return parsedJSON;
}