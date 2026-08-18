import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { generateEmbedding } from "../services/embedding.js";
import { storeChunks, getCollection } from "../services/chroma.js";
import { retrieveRelevantSections } from "../services/retriever.js";

const PDF_PATH = path.resolve("docs/Consumer_Protection_Act_2019.pdf");

async function main() {
  console.log("====================================");
  console.log("LexAgent Legal RAG Indexer");
  console.log("====================================\n");

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF File not found at: ${PDF_PATH}`);
    process.exit(1);
  }

  console.log("Reading PDF...");
  const buffer = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse(new Uint8Array(buffer));
  const pdfData = await parser.getText();

  const totalPages = pdfData.total || (pdfData.pages ? pdfData.pages.length : 0);
  console.log(`Pages: ${totalPages}\n`);

  if (!pdfData.pages || pdfData.pages.length === 0) {
    console.error("❌ Extracted text is empty.");
    process.exit(1);
  }

  console.log("Extracting legal sections...");
  const sections = [];
  let currentSection = null;
  const sectionPattern = /^Section\s+(\d+[A-Z]?)\.\s*(.*)$/i;

  pdfData.pages.forEach((p) => {
    const lines = p.text.split("\n");
    lines.forEach((line) => {
      const match = line.trim().match(sectionPattern);
      if (match) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          section: `Section ${match[1]}`,
          title: match[2].trim(),
          page: p.num,
          textLines: [line]
        };
      } else if (currentSection) {
        currentSection.textLines.push(line);
      }
    });
  });
  if (currentSection) sections.push(currentSection);

  console.log(`Sections found: ${sections.length}\n`);

  console.log("Creating chunks...");
  const chunks = [];
  const MAX_CHUNK_SIZE = 1500;
  const OVERLAP = 200;

  sections.forEach((sec) => {
    const fullText = sec.textLines.join("\n").trim();
    const cleanSecId = sec.section.toLowerCase().replace(/\s+/g, "_");

    if (fullText.length <= MAX_CHUNK_SIZE) {
      chunks.push({
        id: `cpa_${cleanSecId}_p${sec.page}_idx${chunks.length + 1}`,
        text: fullText,
        metadata: {
          act: "Consumer Protection Act, 2019",
          section: sec.section,
          title: sec.title,
          page: sec.page,
          source: "Consumer_Protection_Act_2019.pdf"
        }
      });
    } else {
      let start = 0;
      let subIdx = 1;
      const header = `${sec.section}. ${sec.title}\n\n`;

      while (start < fullText.length) {
        let end = start + MAX_CHUNK_SIZE;
        if (end < fullText.length) {
          const lastNewline = fullText.lastIndexOf("\n", end);
          if (lastNewline > start + 500) end = lastNewline;
        }

        const partText = fullText.substring(start, end).trim();
        const chunkText = partText.startsWith(sec.section)
          ? partText
          : header + partText;

        chunks.push({
          id: `cpa_${cleanSecId}_p${sec.page}_part${subIdx}_idx${chunks.length + 1}`,
          text: chunkText,
          metadata: {
            act: "Consumer Protection Act, 2019",
            section: sec.section,
            title: sec.title,
            page: sec.page,
            source: "Consumer_Protection_Act_2019.pdf"
          }
        });

        subIdx++;
        start = end - OVERLAP;
        if (start >= fullText.length - OVERLAP) break;
      }
    }
  });

  console.log(`Chunks created: ${chunks.length}\n`);

  console.log("Generating embeddings...\n");
  const processedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`[${i + 1}/${chunks.length}] ${chunk.metadata.section} - ${chunk.metadata.title}`);

    let embedding = null;
    let retries = 3;

    while (retries > 0 && !embedding) {
      try {
        embedding = await generateEmbedding(chunk.text);
      } catch (err) {
        retries--;
        if (retries === 0) {
          console.error(`  ⚠️ Warning: Failed to embed chunk ${chunk.id}:`, err.message);
        } else {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    if (embedding) {
      processedChunks.push({
        ...chunk,
        embedding
      });
    }

    // Small delay to prevent API rate limit issues
    await new Promise((r) => setTimeout(r, 80));
  }

  console.log("\nStoring vectors in ChromaDB...");
  await storeChunks(processedChunks);

  console.log("\nIndexing completed successfully.");
  console.log("====================================");
  console.log("Collection: consumer_protection_act");
  console.log(`Documents stored: ${processedChunks.length}`);
  console.log("====================================\n");

  // Perform a test retrieval check
  console.log("🔍 Running test retrieval check...");
  const testQuery = "What rights does a consumer have when a product is defective?";
  console.log(`Query: "${testQuery}"\n`);
  const results = await retrieveRelevantSections(testQuery, 2);

  console.log("Results retrieved:");
  results.forEach((r, idx) => {
    console.log(`\n--- Result [${idx + 1}] (Score: ${r.score || "N/A"}) ---`);
    console.log(`Section: ${r.metadata.section} | Title: ${r.metadata.title} | Page: ${r.metadata.page}`);
    console.log(`Text snippet:\n${r.text.substring(0, 250)}...`);
  });

  console.log("\n✅ RAG Indexing and Verification Complete!");
}

main().catch((err) => {
  console.error("❌ Indexing failed with error:", err);
  process.exit(1);
});