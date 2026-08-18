import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";

/**
 * Oppose Agent representing the Company/Respondent perspective.
 * Strictly grounded ONLY in retrieved legal context from ChromaDB.
 * Prohibits inventing company defenses, intermediary status, courier liability, or terms of service.
 * 
 * @param {string} question The user's legal question or case facts.
 * @param {string} context The retrieved legal text chunks from ChromaDB.
 * @returns {Promise<object>} Structured JSON object for Oppose Agent.
 */
export async function opposeAgent(question, context = "") {
  // Debug output before calling Gemini
  console.log("========================================");
  console.log("OPPOSE AGENT RAG CONTEXT");
  console.log("========================================");
  console.log(context || "(No RAG context provided)");
  console.log("========================================\n");

  const prompt = `
ROLE & GROUNDING MANDATE:
You are the Oppose Agent for the COMPANY / RESPONDENT.
You must challenge the Support argument, but you MUST be strictly grounded in RETRIEVED_CONTEXT.

USER QUESTION / CASE FACTS:
${question}

RETRIEVED_CONTEXT (ONLY LEGAL AUTHORITY AVAILABLE):
${context || "No legal context available."}

RULES:
1. DO NOT INVENT UNRETRIEVED DEFENSES:
   - Do NOT say "Flipkart has intermediary immunity", "Safe harbour applies", "Third-party courier is solely liable", "Burden of proof lies on consumer", "OTP is legally required", "Warranty terms apply", or "Laboratory testing is mandatory" UNLESS explicitly present in RETRIEVED_CONTEXT.
   - If such a defense is not present in RETRIEVED_CONTEXT, explicitly label it: "Not established by retrieved legal material."
2. CHALLENGE USING EXPRESS STATUTORY CONDITIONS:
   - Point out that Section 39(1) remedies are conditional upon the District Commission being satisfied that allegations or defects are proved.
3. CITATION DISCIPLINE:
   - For legal arguments, include exact legalBasis array [{ "section": "Section ...", "title": "...", "source": "Consumer Protection Act, 2019", "page": ... }].

Return ONLY a valid JSON object matching this EXACT structure (no code fences, no markdown):

{
  "position": "The respondent notes that statutory remedies under Section 39(1) of the Consumer Protection Act, 2019 are conditional upon the District Commission being satisfied that allegations are proved. The user's prompt presents factual allegations requiring proof.",
  "keyArguments": [
    {
      "argument": "Under Section 39(1), remedies such as refund or replacement may be directed only where the District Commission is satisfied that the goods complained against suffer from defects specified in the complaint or allegations are proved.",
      "type": "legal",
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
  "weaknessesInConsumerClaim": [
    "The user's statement is a reported assertion; documentary evidence of purchase and non-delivery/defect has not been provided in the retrieved material."
  ],
  "defensesSupportedByRetrievedLaw": [
    {
      "defense": "Section 39(1) makes statutory remedies conditional upon proof of allegations to the satisfaction of the District Commission.",
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
  "unsupportedClaims": [
    "Not established by retrieved legal material: intermediary safe harbour, courier disclaimers, platform terms of service, or e-commerce liability exemptions."
  ],
  "strength": 60
}
`;

  const result = await generateContentWithRetry(prompt);
  const parsedJSON = safeParseJSON(result.response.text());

  // Debug output after Gemini responds
  console.log("========================================");
  console.log("OPPOSE AGENT STRUCTURED OUTPUT");
  console.log("========================================");
  console.log(JSON.stringify(parsedJSON, null, 2));
  console.log("========================================\n");

  return parsedJSON;
}