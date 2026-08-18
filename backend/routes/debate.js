import express from "express";
import { runDebate } from "../services/orchestrator.js";

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                error: "Question is required"
            });
        }

        const result = await runDebate(question);

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

export default router;