import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import debateRoute from "./routes/debate.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection
connectDB();

app.get("/", (req, res) => {
  res.send("LexAgent Backend Running 🚀");
});

app.use("/api/debate", debateRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});