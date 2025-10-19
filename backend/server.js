// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import matchRoutes from "./routes/match.js";

dotenv.config();
console.log("HF_API_KEY loaded?", !!process.env.HF_API_KEY, process.env.HF_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", matchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));