const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Example match route
app.post("/api/match", (req, res) => {
  const { title, description } = req.body;
  console.log("Received:", title, description);
  res.json([
    { industry: "Catering", reason: "Eco-friendly cutlery fits products" },
    { industry: "Supermarkets", reason: "Sustainable packaging alternative" }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
