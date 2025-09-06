const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const uploadRoute = require("./routes/upload");
const verifyRoute = require("./routes/verify");

app.use("/upload", uploadRoute);
app.use("/verify", verifyRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
