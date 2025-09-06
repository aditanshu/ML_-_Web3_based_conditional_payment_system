const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /upload
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    const { conditionId } = req.body;
    const files = req.files;

    if (!conditionId || !files) {
      return res.status(400).json({ message: "Condition ID and files are required" });
    }

    // For each file, create a response object
    const uploadedFiles = files.map((file) => ({
      fileUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      conditionId,
      aiScore: 0, // Placeholder for AI verification
      verified: null, // null = pending
    }));

    // TODO: Save uploadedFiles to database (optional)

    res.json(uploadedFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
