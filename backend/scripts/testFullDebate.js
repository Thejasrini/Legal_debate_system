import { runDebate } from "../services/orchestrator.js";

async function main() {
  const question = "A consumer ordered a mobile phone through Flipkart but never received it. What remedies may be available under the Consumer Protection Act, 2019?";

  console.log("🚀 EXECUTING GROUNDED LEXAGENT COURTROOM DEBATE...");
  console.log(`Question: "${question}"\n`);

  const result = await runDebate(question);

  console.log("==========================================");
  console.log("FULL GROUNDED DEBATE RESULT");
  console.log("==========================================");
  console.log(JSON.stringify(result, null, 2));
  console.log("==========================================\n");
}

main().catch((err) => {
  console.error("❌ Debate test failed:", err);
});
