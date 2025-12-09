import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";
import * as relayer from "./relayer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || "demo_api_key_12345";

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
    message: { error: "Too many requests, please try again later" }
});

app.use("/api/", limiter);

// Simple in-memory storage (replace with database in production)
const conditionsDB = new Map();

// Initialize relayer
try {
    relayer.initProvider();
    relayer.loadContract();
    console.log("🚀 Relayer service initialized\n");
} catch (error) {
    console.error("❌ Failed to initialize relayer:", error.message);
    process.exit(1);
}

// ==================== ROUTES ====================

/**
 * Health check endpoint
 */
app.get("/health", async (req, res) => {
    try {
        const balance = await relayer.getRelayerBalance();
        const conditionCount = await relayer.getConditionCount();

        res.json({
            status: "healthy",
            network: process.env.NETWORK || "localhost",
            relayerBalance: balance + " ETH",
            totalConditions: conditionCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: "unhealthy",
            error: "Failed to fetch relayer status"
        });
    }
});

/**
 * Create condition metadata
 * POST /api/conditions
 */
app.post("/api/conditions", async (req, res) => {
    try {
        const { conditionId, metadata } = req.body;

        if (conditionId === undefined) {
            return res.status(400).json({ error: "conditionId is required" });
        }

        // Store metadata
        conditionsDB.set(conditionId.toString(), {
            conditionId,
            metadata: metadata || {},
            createdAt: new Date().toISOString()
        });

        res.json({
            success: true,
            conditionId,
            message: "Condition metadata stored"
        });
    } catch (error) {
        console.error("Error storing condition metadata:", error);
        res.status(500).json({ error: "Failed to store condition metadata" });
    }
});

/**
 * Get condition status
 * GET /api/conditions/:id
 */
app.get("/api/conditions/:id", async (req, res) => {
    try {
        const conditionId = req.params.id;

        // Get condition from contract
        const condition = await relayer.getCondition(conditionId);

        if (!condition) {
            return res.status(404).json({ error: "Condition not found" });
        }

        // Get metadata from storage
        const storedData = conditionsDB.get(conditionId);

        // Check status
        const canTrigger = await relayer.canTrigger(conditionId);
        const canRefund = await relayer.canRefund(conditionId);

        res.json({
            ...condition,
            metadata: storedData?.metadata || {},
            canTrigger,
            canRefund,
            status: condition.executed ? "executed" : condition.refunded ? "refunded" : "active"
        });
    } catch (error) {
        console.error("Error fetching condition:", error);
        res.status(500).json({ error: "Failed to fetch condition status" });
    }
});

/**
 * Trigger condition
 * POST /api/conditions/:id/trigger
 */
app.post("/api/conditions/:id/trigger", async (req, res) => {
    try {
        const conditionId = req.params.id;
        const { proof, apiKey } = req.body;

        // Validate API key
        if (apiKey !== API_KEY) {
            return res.status(401).json({ error: "Invalid API key" });
        }

        // Validate proof
        if (!proof) {
            return res.status(400).json({ error: "Proof is required" });
        }

        // Check if condition exists and can be triggered
        const condition = await relayer.getCondition(conditionId);
        if (!condition) {
            return res.status(404).json({ error: "Condition not found" });
        }

        if (condition.executed) {
            return res.status(400).json({ error: "Condition already executed" });
        }

        if (condition.refunded) {
            return res.status(400).json({ error: "Condition already refunded" });
        }

        // Create proof hash
        const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proof));

        // Trigger condition via relayer
        const result = await relayer.triggerCondition(conditionId, proofHash);

        res.json({
            success: true,
            conditionId,
            txHash: result.txHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed,
            message: "Condition triggered successfully"
        });
    } catch (error) {
        console.error("Error triggering condition:", error);

        // Sanitize error message
        let errorMessage = "Failed to trigger condition";
        if (error.message.includes("Condition already executed")) {
            errorMessage = "Condition already executed";
        } else if (error.message.includes("Condition already refunded")) {
            errorMessage = "Condition already refunded";
        } else if (error.message.includes("insufficient funds")) {
            errorMessage = "Relayer has insufficient funds";
        }

        res.status(500).json({ error: errorMessage });
    }
});

/**
 * Get all conditions (for debugging)
 */
app.get("/api/conditions", async (req, res) => {
    try {
        const count = await relayer.getConditionCount();
        const conditions = [];

        for (let i = 0; i < count; i++) {
            try {
                const condition = await relayer.getCondition(i);
                if (condition) {
                    conditions.push(condition);
                }
            } catch (error) {
                // Skip if condition doesn't exist
            }
        }

        res.json({
            total: count,
            conditions
        });
    } catch (error) {
        console.error("Error fetching conditions:", error);
        res.status(500).json({ error: "Failed to fetch conditions" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Relayer server running on port ${PORT}`);
    console.log(`📡 Network: ${process.env.NETWORK || "localhost"}`);
    console.log(`🔗 RPC: ${process.env.RPC_URL || "http://127.0.0.1:8545"}`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /health`);
    console.log(`   POST /api/conditions`);
    console.log(`   GET  /api/conditions/:id`);
    console.log(`   POST /api/conditions/:id/trigger`);
    console.log(`   GET  /api/conditions\n`);
});

export default app;
