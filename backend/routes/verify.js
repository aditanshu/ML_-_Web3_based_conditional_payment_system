const express = require("express");
const router = express.Router();
const { verifyImage } = require("../utils/aiVerifier");

// Mock database for demo (replace with real DB)
let uploadsDB = [];

/**
 * GET /verify/:conditionId
 * Return all uploads for a condition, including AI score
 */
router.get("/:conditionId", async (req, res) => {
  const { conditionId } = req.params;
  const uploads = uploadsDB.filter((u) => u.conditionId === conditionId);

  // Update AI scores for pending uploads
  const updatedUploads = await Promise.all(
    uploads.map(async (u) => {
      if (u.aiScore === 0) {
        const aiResult = await verifyImage(u.fileUrl);
        u.aiScore = aiResult.aiScore;
        u.verified = aiResult.verified ? null : null; // AI can suggest, but payer approves
      }
      return u;
    })
  );

  res.json(updatedUploads);
});

/**
 * POST /verify/approve
 * Approve a file and optionally trigger payment
 */
router.post("/approve", (req, res) => {
  const { conditionId, fileUrl } = req.body;
  const upload = uploadsDB.find((u) => u.conditionId === conditionId && u.fileUrl === fileUrl);
  if (!upload) return res.status(404).json({ message: "Upload not found" });

  upload.verified = true;

  // TODO: Trigger smart contract payment via ethers.js

  res.json({ message: "File approved", upload });
});

/**
 * POST /verify/reject
 * Reject a file
 */
router.post("/reject", (req, res) => {
  const { conditionId, fileUrl } = req.body;
  const upload = uploadsDB.find((u) => u.conditionId === conditionId && u.fileUrl === fileUrl);
  if (!upload) return res.status(404).json({ message: "Upload not found" });

  upload.verified = false;

  res.json({ message: "File rejected", upload });
});

module.exports = router;
