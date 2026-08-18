import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lexagent";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Warning (${error.message}). In-memory fallback will be used if MongoDB service is offline.`);
  }
}
