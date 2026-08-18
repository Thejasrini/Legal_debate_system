import { model } from "../services/gemini.js";

export async function intentAgent(question) {

    const prompt = `
You are an Indian Legal Intent Classifier.

Your job is ONLY to identify the legal issue.

Possible Categories:

- Defective Product
- Refund
- Warranty
- E-commerce
- Medical Negligence
- Insurance
- Banking
- Misleading Advertisement
- Product Liability
- Unfair Trade Practice

Return ONLY JSON.

Example:

{
 "category":"Defective Product",
 "confidence":97
}

Question:

${question}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();

}