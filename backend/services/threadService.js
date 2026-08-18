import { Thread } from "../models/Thread.js";
import mongoose from "mongoose";

// In-memory fallback map if MongoDB is offline
const memoryStore = new Map();

/**
 * Retrieves thread document by threadId.
 * @param {string} threadId 
 * @returns {Promise<{threadId: string, turns: Array}>}
 */
export async function getThread(threadId) {
  if (!threadId) return null;

  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Thread.findOne({ threadId }).lean();
      if (doc) return doc;
    } catch (err) {
      console.warn("⚠️ MongoDB getThread warning:", err.message);
    }
  }

  // Fallback to in-memory store
  return memoryStore.get(threadId) || { threadId, turns: [] };
}

/**
 * Saves a new turn to a thread document.
 * @param {string} threadId 
 * @param {object} turnData { question, retrievedContext, support, oppose, judge }
 */
export async function saveTurn(threadId, turnData) {
  if (!threadId || !turnData) return;

  const newTurn = {
    ...turnData,
    timestamp: new Date()
  };

  if (mongoose.connection.readyState === 1) {
    try {
      await Thread.findOneAndUpdate(
        { threadId },
        { $push: { turns: newTurn } },
        { upsert: true, new: true }
      );
      return;
    } catch (err) {
      console.warn("⚠️ MongoDB saveTurn warning:", err.message);
    }
  }

  // Fallback to in-memory store
  const existing = memoryStore.get(threadId) || { threadId, turns: [] };
  existing.turns.push(newTurn);
  memoryStore.set(threadId, existing);
}
