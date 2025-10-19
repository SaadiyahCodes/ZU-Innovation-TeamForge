// backend/routes/match.js
import express from "express";
import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers";
import cosineSimilarity from "../utils/cosineSimilarity.js";

const router = express.Router();
const __dirname = path.resolve();

// Paths to data
const companiesFile = path.join(__dirname, "data/companies.json");
const innovatorsFile = path.join(__dirname, "data/innovators.json");
const embeddingsFile = path.join(__dirname, "data/embeddings.json");

// Helper functions
const readData = (file) => JSON.parse(fs.readFileSync(file, "utf8") || "[]");
const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const readEmbeddings = () => {
  try {
    if (!fs.existsSync(embeddingsFile)) return { companies: {}, innovators: {} };
    const content = fs.readFileSync(embeddingsFile, "utf8").trim();
    if (!content) return { companies: {}, innovators: {} };
    return JSON.parse(content);
  } catch (err) {
    console.warn("⚠️ Embeddings file was invalid. Resetting it.");
    return { companies: {}, innovators: {} };
  }
};

const writeEmbeddings = (data) => fs.writeFileSync(embeddingsFile, JSON.stringify(data, null, 2));

// 1️⃣ FORM SUBMISSION
router.post("/submit", (req, res) => {
  const { type, name, industry, description, innovation } = req.body;

  if (type === "company") {
    const companies = readData(companiesFile);
    companies.push({ name, industry, description, innovation });
    writeData(companiesFile, companies);
    return res.json({ message: "✅ Company submitted" });
  }

  if (type === "innovator") {
    const innovators = readData(innovatorsFile);
    innovators.push({ name, industry, description });
    writeData(innovatorsFile, innovators);
    return res.json({ message: "✅ Innovator submitted" });
  }

  res.status(400).json({ error: "Invalid type" });
});

// 2️⃣ Xenova Embeddings
let extractor;
async function initExtractor() {
  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
}
initExtractor();

// Convert text to embeddings using Xenova
async function getEmbedding(text) {
  if (!extractor) await initExtractor();

  const response = await extractor([text], { pooling: "mean", normalize: true });

  // Convert Xenova Tensor to plain array
  if (response[0] && typeof response[0].tolist === "function") {
    return response[0].tolist();
  }

  throw new Error("Unexpected embedding format from Xenova pipeline: " + JSON.stringify(response));
}

// Cached embeddings
async function getEmbeddingCached(type, name, text) {
  const allEmbeddings = readEmbeddings();
  allEmbeddings[type] = allEmbeddings[type] || {};

  if (allEmbeddings[type][name]) {
    return allEmbeddings[type][name];
  }

  const embedding = await getEmbedding(text);
  allEmbeddings[type][name] = embedding;
  writeEmbeddings(allEmbeddings);

  return embedding;
}

// 3️⃣ MATCH ENDPOINT
router.get("/match", async (req, res) => {
  try {
    const companies = readData(companiesFile);
    const innovators = readData(innovatorsFile);

    const matches = [];

    for (const company of companies) {
      const companyText = `${company.industry}. ${company.description} ${company.innovation || ""}`;
      const companyEmbedding = await getEmbeddingCached("companies", company.name, companyText);

      let bestMatch = null;
      let bestScore = -1;

      for (const innovator of innovators) {
        const innovatorText = `${innovator.industry}. ${innovator.description}`;
        const innovatorEmbedding = await getEmbeddingCached("innovators", innovator.name, innovatorText);

        const score = cosineSimilarity(companyEmbedding, innovatorEmbedding);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = innovator;
        }
      }

      matches.push({
        company: company.name,
        industry: company.industry,
        bestMatch: bestMatch ? bestMatch.name : "No match found",
        matchScore: bestScore.toFixed(3),
      });
    }

    res.json({ matches });
  } catch (error) {
    console.error("Error during matching:", error);
    res.status(500).json({ error: "Failed to perform AI matching" });
  }
});

export default router;
