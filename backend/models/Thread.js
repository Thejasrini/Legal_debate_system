import mongoose from "mongoose";

const TurnSchema = new mongoose.Schema({
  question: { type: String, required: true },
  retrievedContext: { type: String, default: "" },
  support: { type: Object, required: true },
  oppose: { type: Object, required: true },
  judge: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ThreadSchema = new mongoose.Schema({
  threadId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  turns: [TurnSchema]
});

export const Thread = mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);
