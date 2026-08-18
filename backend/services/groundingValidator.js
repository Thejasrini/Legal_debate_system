/**
 * Grounding Validator Module for LexAgent
 * Performs post-generation deterministic and semantic verification on agent outputs.
 * Intercepts, sanitizes, and flags any legal claim, defense, or citation that is not supported by retrieved_context.
 */

// Terms and concepts that are NOT present in the indexed Consumer Protection Act 2019 PDF chunks
const UNSUPPORTED_CONCEPTS = [
  { pattern: /intermediary/i, name: "intermediary status" },
  { pattern: /safe\s*harbo[u]?r/i, name: "safe harbour" },
  { pattern: /third[- ]party (seller|logistics|courier)/i, name: "third-party liability" },
  { pattern: /logistics/i, name: "logistics responsibility" },
  { pattern: /terms of (service|use)/i, name: "Terms of Service" },
  { pattern: /automated refund/i, name: "automated refund mechanisms" },
  { pattern: /mental agony/i, name: "mental agony" },
  { pattern: /information technology act/i, name: "IT Act provisions" },
  { pattern: /force majeure/i, name: "force majeure" },
  { pattern: /otp/i, name: "OTP requirements" },
  { pattern: /courier/i, name: "courier liability" },
  { pattern: /pre-litigation notice/i, name: "mandatory pre-litigation notice" }
];

/**
 * Extracts all section numbers present in the retrieved context string.
 * @param {string} context 
 * @returns {Set<string>}
 */
function getValidSectionsFromContext(context = "") {
  const validSections = new Set();
  const matches = context.match(/Section\s+\d+[A-Z]?/gi) || [];
  matches.forEach((m) => {
    validSections.add(m.toLowerCase().trim());
  });
  return validSections;
}

/**
 * Checks if a string contains any unsupported concept that is NOT present in the retrieved context.
 * @param {string} text 
 * @param {string} context 
 * @returns {{isUnsupported: boolean, concept: string | null}}
 */
function checkForUnsupportedConcepts(text = "", context = "") {
  if (!text || typeof text !== "string") return { isUnsupported: false, concept: null };

  for (const item of UNSUPPORTED_CONCEPTS) {
    if (item.pattern.test(text)) {
      if (!item.pattern.test(context)) {
        return { isUnsupported: true, concept: item.name };
      }
    }
  }

  return { isUnsupported: false, concept: null };
}

/**
 * Validates legalBasis citations against the retrieved context.
 * @param {Array<object>} legalBasis 
 * @param {Set<string>} validSections 
 * @returns {Array<object>} Filtered valid citations
 */
function validateCitations(legalBasis = [], validSections) {
  if (!Array.isArray(legalBasis)) return [];

  return legalBasis.filter((basis) => {
    if (!basis || !basis.section) return false;
    const secClean = basis.section.toLowerCase().trim();
    const baseSecMatch = secClean.match(/section\s+\d+[a-z]?/i);
    const baseSec = baseSecMatch ? baseSecMatch[0] : secClean;

    const isValid = validSections.has(secClean) || validSections.has(baseSec);
    if (!isValid) {
      console.log(`🛡️ GROUNDING VALIDATOR: Stripped invalid citation '${basis.section}' not present in retrieved context.`);
    }
    return isValid;
  });
}

/**
 * Main Grounding Validator function.
 * Validates agent JSON output against the raw retrieved ChromaDB context.
 * 
 * @param {string} agentName "Support" | "Oppose" | "Judge"
 * @param {object} output Agent JSON response object
 * @param {string} context Raw retrieved ChromaDB context
 * @returns {object} Validated and sanitized agent output
 */
export function validateAgentOutput(agentName, output, context = "") {
  if (!output || typeof output !== "object") return output;

  const validSections = getValidSectionsFromContext(context);
  const sanitized = JSON.parse(JSON.stringify(output));
  const capturedUnsupported = new Set(sanitized.unsupportedClaims || sanitized.unsupportedIssues || []);

  // 1. Sanitize Position / Decision / LegalRule / Application text
  const textFields = ["position", "decision", "legalRule", "application", "supportAssessment", "opposeAssessment", "recommendation"];
  for (const field of textFields) {
    if (sanitized[field] && typeof sanitized[field] === "string") {
      const check = checkForUnsupportedConcepts(sanitized[field], context);
      if (check.isUnsupported) {
        console.log(`🛡️ GROUNDING VALIDATOR [${agentName}]: Intercepted unsupported concept '${check.concept}' in ${field}.`);
        capturedUnsupported.add(`Not established by retrieved legal material: ${check.concept}`);
        if (field === "decision" || field === "position") {
          sanitized[field] = "Based on retrieved material, statutory remedies under Section 39(1) require proof of allegations before the District Commission. Specific platform liabilities are not established by retrieved legal material.";
          if (agentName === "Judge") {
            sanitized.winningSide = "Inconclusive";
            sanitized.confidence = 50;
          }
        }
      }
    }
  }

  // 2. Sanitize keyArguments array
  if (Array.isArray(sanitized.keyArguments)) {
    sanitized.keyArguments = sanitized.keyArguments.map((item) => {
      if (typeof item === "string") {
        const check = checkForUnsupportedConcepts(item, context);
        if (check.isUnsupported) {
          console.log(`🛡️ GROUNDING VALIDATOR [${agentName}]: Intercepted unsupported keyArgument: "${item}"`);
          capturedUnsupported.add(`Not established by retrieved legal material: ${item}`);
          return "Not established by retrieved legal material.";
        }
        return item;
      }

      if (typeof item === "object" && item.argument) {
        const check = checkForUnsupportedConcepts(item.argument, context);
        if (check.isUnsupported) {
          console.log(`🛡️ GROUNDING VALIDATOR [${agentName}]: Intercepted unsupported keyArgument: "${item.argument}"`);
          capturedUnsupported.add(`Not established by retrieved legal material: ${item.argument}`);
          return {
            ...item,
            argument: "Not established by retrieved legal material.",
            status: "UNSUPPORTED BY RETRIEVED LEGAL MATERIAL",
            legalBasis: []
          };
        }

        if (item.legalBasis) {
          item.legalBasis = validateCitations(item.legalBasis, validSections);
        }
      }
      return item;
    });
  }

  // 3. Sanitize possibleRemedies array
  if (Array.isArray(sanitized.possibleRemedies)) {
    sanitized.possibleRemedies = sanitized.possibleRemedies.map((item) => {
      if (typeof item === "object" && item.remedy) {
        const check = checkForUnsupportedConcepts(item.remedy, context);
        if (check.isUnsupported) {
          console.log(`🛡️ GROUNDING VALIDATOR [${agentName}]: Intercepted unsupported remedy: "${item.remedy}"`);
          capturedUnsupported.add(`Not established by retrieved legal material: ${item.remedy}`);
          return {
            ...item,
            remedy: "Not established by retrieved legal material.",
            status: "UNSUPPORTED BY RETRIEVED LEGAL MATERIAL",
            legalBasis: []
          };
        }
        if (item.legalBasis) {
          item.legalBasis = validateCitations(item.legalBasis, validSections);
        }
      }
      return item;
    });
  }

  // 4. Sanitize defensesSupportedByRetrievedLaw array (Oppose)
  if (Array.isArray(sanitized.defensesSupportedByRetrievedLaw)) {
    sanitized.defensesSupportedByRetrievedLaw = sanitized.defensesSupportedByRetrievedLaw.map((item) => {
      if (typeof item === "object" && item.defense) {
        const check = checkForUnsupportedConcepts(item.defense, context);
        if (check.isUnsupported) {
          console.log(`🛡️ GROUNDING VALIDATOR [${agentName}]: Intercepted unsupported defense: "${item.defense}"`);
          capturedUnsupported.add(`Not established by retrieved legal material: ${item.defense}`);
          return {
            ...item,
            defense: "Not established by retrieved legal material.",
            status: "UNSUPPORTED BY RETRIEVED LEGAL MATERIAL",
            legalBasis: []
          };
        }
        if (item.legalBasis) {
          item.legalBasis = validateCitations(item.legalBasis, validSections);
        }
      }
      return item;
    });
  }

  // 5. Update unsupported list
  if (agentName === "Judge") {
    sanitized.unsupportedIssues = Array.from(capturedUnsupported);
  } else {
    sanitized.unsupportedClaims = Array.from(capturedUnsupported);
  }

  return sanitized;
}
