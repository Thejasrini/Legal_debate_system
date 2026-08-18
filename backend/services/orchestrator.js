import { supportAgent } from "../agents/supportAgent.js";
import { opposeAgent } from "../agents/opposeAgent.js";
import { judgeAgent } from "../agents/judgeAgent.js";
import { retrieveRelevantSections } from "./retriever.js";
import { validateAgentOutput } from "./groundingValidator.js";

export async function runDebate(question, customContext = "") {
  console.log("⚖ LexAgent Started");

  let context = customContext;

  if (!context) {
    try {
      const relevantSections = await retrieveRelevantSections(question, 3);
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

  // 1. Support Agent execution & validation
  const rawSupport = await supportAgent(question, context);
  const support = validateAgentOutput("Support", rawSupport, context);
  console.log("Support Validated & Done");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 2. Oppose Agent execution & validation
  const rawOppose = await opposeAgent(question, context);
  const oppose = validateAgentOutput("Oppose", rawOppose, context);
  console.log("Oppose Validated & Done");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 3. Judge Agent execution & validation
  const rawJudge = await judgeAgent(question, support, oppose, context);
  const judge = validateAgentOutput("Judge", rawJudge, context);
  console.log("Judge Validated & Done");

  return {
    question,
    support,
    oppose,
    judge
  };
}