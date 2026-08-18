import { intentAgent } from "../agents/intentAgent.js";
import { supportAgent } from "../agents/supportAgent.js";
import { opposeAgent } from "../agents/opposeAgent.js";
import { judgeAgent } from "../agents/judgeAgent.js";
import { retrieveRelevantSections } from "./retriever.js";
import { validateAgentOutput } from "./groundingValidator.js";

// List of allowed consumer-law-relevant category keywords for Consumer Protection Act, 2019
const IN_SCOPE_KEYWORDS = [
  "defective product",
  "refund",
  "warranty",
  "e-commerce",
  "unfair trade practice",
  "product liability",
  "misleading advertisement",
  "consumer protection",
  "general consumer law"
];

function isCategoryInScope(category = "") {
  const catClean = category.toLowerCase().trim();
  return IN_SCOPE_KEYWORDS.some((keyword) => catClean.includes(keyword));
}

/**
 * Executes full courtroom debate with RAG retrieval, domain classification, and grounding validation.
 * Supports optional live event streaming callback `onEvent(eventType, data)` and conversation `history`.
 * 
 * @param {string} question 
 * @param {string} customContext 
 * @param {function} onEvent Optional streaming callback (eventType, data) => void
 * @param {Array} history Optional prior conversation turns [{ question, judge: { decision } }]
 */
export async function runDebate(question, customContext = "", onEvent = null, history = []) {
  console.log("⚖ LexAgent Started");

  const emit = (eventType, data) => {
    if (typeof onEvent === "function") {
      try {
        onEvent(eventType, data);
      } catch (err) {
        console.warn(`⚠️ Error in onEvent listener for '${eventType}':`, err.message);
      }
    }
  };

  // 1. STEP 1: Domain Intent Classification
  console.log("🔍 Classifying question domain intent...");
  
  // Construct context-rich query for intent classifier if follow-up
  const intentSearchQuery = history.length > 0
    ? `${question} (Prior context: ${history.map(h => h.question).slice(-2).join("; ")})`
    : question;

  const intentResult = await intentAgent(intentSearchQuery);
  const { category, confidence } = intentResult;
  console.log(`🏷️ Domain Category Detected: "${category}" (Confidence: ${confidence}%)`);

  const inScope = isCategoryInScope(category) && confidence >= 50;

  // Short-circuit if out of scope or low confidence
  if (!inScope) {
    console.log(`🛑 OUT OF SCOPE: "${category}" is not covered by Consumer Protection Act 2019 corpus.`);
    const outOfScopeResult = {
      question,
      outOfScope: true,
      category,
      confidence,
      message: `This system currently covers Indian Consumer Protection Act, 2019 matters only. Your question appears to be about ${category} which isn't supported yet.`
    };
    emit("outOfScope", outOfScopeResult);
    emit("done", {});
    return outOfScopeResult;
  }

  // Emit classified intent event
  emit("intent", { category, confidence });

  // 2. STEP 2: RAG Context Retrieval (combining new question + recent history for context retention)
  let context = customContext;

  if (!context) {
    try {
      const ragSearchQuery = history.length > 0
        ? `${question} ${history.map(t => t.question).slice(-2).join(" ")}`
        : question;

      const relevantSections = await retrieveRelevantSections(ragSearchQuery, 4);
      if (relevantSections && relevantSections.length > 0) {
        context = relevantSections
          .map((r) => `[${r.metadata.section} - ${r.metadata.title} (Page ${r.metadata.page})]\n${r.text}`)
          .join("\n\n");
        console.log(`📖 RAG retrieved ${relevantSections.length} relevant sections from Consumer Protection Act 2019`);
      }
    } catch (err) {
      console.warn("⚠️ RAG Retrieval warning:", err.message);
    }
  }

  // 3. Support Agent execution & validation
  const rawSupport = await supportAgent(question, context, history);
  const support = validateAgentOutput("Support", rawSupport, context);
  console.log("Support Validated & Emitted");
  emit("support", support);

  await new Promise((resolve) => setTimeout(resolve, 600));

  // 4. Oppose Agent execution & validation
  const rawOppose = await opposeAgent(question, context, history);
  const oppose = validateAgentOutput("Oppose", rawOppose, context);
  console.log("Oppose Validated & Emitted");
  emit("oppose", oppose);

  await new Promise((resolve) => setTimeout(resolve, 600));

  // 5. Judge Agent execution & validation
  const rawJudge = await judgeAgent(question, support, oppose, context, history);
  const judge = validateAgentOutput("Judge", rawJudge, context);
  console.log("Judge Validated & Emitted");
  emit("judge", judge);

  emit("done", {});

  return {
    question,
    category,
    outOfScope: false,
    retrievedContext: context,
    support,
    oppose,
    judge
  };
}