import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

/**
 * Streams debate events from backend SSE via POST fetch.
 * Supports threadId for conversation history continuity.
 * 
 * @param {string} question 
 * @param {string|null} threadId 
 * @param {function} onEvent (eventType, data) => void
 * @param {function} onError (errorMessage) => void
 * @param {function} onComplete () => void
 */
export async function streamDebate(question, threadId, onEvent, onError, onComplete) {
  try {
    const response = await fetch("http://localhost:5000/api/debate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question, threadId })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server error (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || ""; // retain trailing incomplete chunk

      for (const block of blocks) {
        if (!block.trim()) continue;

        let eventType = "message";
        let eventData = {};

        const lines = block.split("\n");
        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const rawData = line.slice(5).trim();
            try {
              eventData = JSON.parse(rawData);
            } catch (e) {
              eventData = rawData;
            }
          }
        }

        if (eventType === "error") {
          if (onError) onError(eventData.message || "Server streaming error");
        } else if (eventType === "done") {
          if (onComplete) onComplete();
        } else {
          if (onEvent) onEvent(eventType, eventData);
        }
      }
    }

    if (onComplete) onComplete();
  } catch (err) {
    if (onError) onError(err.message);
  }
}

export default API;