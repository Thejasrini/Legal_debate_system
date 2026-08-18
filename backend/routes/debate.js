import express from "express";
import crypto from "crypto";
import { runDebate } from "../services/orchestrator.js";
import { getThread, saveTurn } from "../services/threadService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question, threadId: reqThreadId } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Question is required and must be a non-empty string."
      });
    }

    // Assign or reuse threadId
    const activeThreadId = reqThreadId || crypto.randomUUID();

    // Set Server-Sent Event (SSE) headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // 1. Send thread event first
    sendEvent("thread", { threadId: activeThreadId });

    // 2. Load prior thread history if existing threadId provided
    const existingThread = await getThread(activeThreadId);
    const history = existingThread && Array.isArray(existingThread.turns)
      ? existingThread.turns.slice(-3)
      : [];

    if (history.length > 0) {
      console.log(`📜 Loaded ${history.length} prior turns for threadId "${activeThreadId}"`);
    }

    // 3. Execute debate with conversation history
    const result = await runDebate(
      question,
      "",
      (event, data) => sendEvent(event, data),
      history
    );

    // 4. Save new turn to MongoDB / Thread Service if in-scope
    if (result && !result.outOfScope && result.support && result.oppose && result.judge) {
      await saveTurn(activeThreadId, {
        question,
        retrievedContext: result.retrievedContext || "",
        support: result.support,
        oppose: result.oppose,
        judge: result.judge
      });
      console.log(`💾 Turn saved successfully to thread "${activeThreadId}"`);
    }

    res.end();
  } catch (error) {
    console.error("⚠️ Error in SSE Debate route:", error.message);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    } catch (e) {
      // stream closed
    }
  }
});

export default router;