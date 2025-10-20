// backend/routes/match.js
import express from "express";
import fs from "fs";
import path from "path";
//import { pipeline } from "@xenova/transformers";
import { pipeline } from "@huggingface/transformers"
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
  if (!fs.existsSync(embeddingsFile)) return { companies: {}, innovators: {} };
  try {
    return JSON.parse(fs.readFileSync(embeddingsFile, "utf8").trim() || "{}");
  } catch {
    return { companies: {}, innovators: {} };
  }
};

const writeEmbeddings = (data) => fs.writeFileSync(embeddingsFile, JSON.stringify(data, null, 2));

// Initialize Xenova pipeline
let extractor;
async function initExtractor() {
  extractor = await pipeline("feature-extraction", "sentence-transformers/paraphrase-mpnet-base-v2");
}
initExtractor();

// Convert text to embeddings
async function getEmbedding(text) {
  if (!extractor) await initExtractor();
  const response = await extractor([text], { pooling: "mean", normalize: true });
  if (response[0] && typeof response[0].tolist === "function") return response[0].tolist();
  throw new Error("Unexpected embedding format: " + JSON.stringify(response));
}

// Cached embeddings
async function getEmbeddingCached(type, name, text) {
  const allEmbeddings = readEmbeddings();
  allEmbeddings[type] = allEmbeddings[type] || {};

  if (allEmbeddings[type][name]) return allEmbeddings[type][name];

  const embedding = await getEmbedding(text);
  allEmbeddings[type][name] = embedding;
  writeEmbeddings(allEmbeddings);

  return embedding;
}

// FORM SUBMISSION ENDPOINT
router.post("/submit", (req, res) => {
  const { type, name, industry, description, innovation } = req.body;

  if (!type || !name || !industry || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    if (type === "company") {
      const companies = readData(companiesFile);
      companies.push({ name, industry, description, innovation });
      writeData(companiesFile, companies);
      return res.json({ message: "Company submitted successfully" });
    }

    if (type === "innovator") {
      const innovators = readData(innovatorsFile);
      innovators.push({ name, industry, description });
      writeData(innovatorsFile, innovators);
      return res.json({ message: "Innovator submitted successfully" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    console.error("Error saving data:", err);
    return res.status(500).json({ error: "Failed to save submission" });
  }
});


// MATCH ENDPOINT
// Accepts query params: ?role=company&name=MyCompany
router.get("/match", async (req, res) => {
  try {
    const { role, name } = req.query;
    if (!role || !name) return res.status(400).json({ error: "Please provide role and name" });

    const companies = readData(companiesFile);
    const innovators = readData(innovatorsFile);

    let matches = [];

    if (role === "company") {
      const company = companies.find((c) => c.name === name);
      if (!company) return res.status(404).json({ error: "Company not found" });

      const companyText = `${company.industry}. ${company.description} ${company.innovation || ""}`;
      const companyEmbedding = await getEmbeddingCached("companies", company.name, companyText);

      for (const innovator of innovators) {
        const innovatorText = `${innovator.industry}. ${innovator.description}`;
        const innovatorEmbedding = await getEmbeddingCached("innovators", innovator.name, innovatorText);

        const score = cosineSimilarity(companyEmbedding, innovatorEmbedding);
        matches.push({
          company: company.name,
          innovator: innovator.name,
          matchScore: score.toFixed(3),
        });
      }
      // Sort descending
      matches.sort((a, b) => b.matchScore - a.matchScore);

    } else if (role === "innovator") {
      const innovator = innovators.find((i) => i.name === name);
      if (!innovator) return res.status(404).json({ error: "Innovator not found" });

      const innovatorText = `${innovator.industry}. ${innovator.description}`;
      const innovatorEmbedding = await getEmbeddingCached("innovators", innovator.name, innovatorText);

      for (const company of companies) {
        const companyText = `${company.industry}. ${company.description} ${company.innovation || ""}`;
        const companyEmbedding = await getEmbeddingCached("companies", company.name, companyText);

        const score = cosineSimilarity(companyEmbedding, innovatorEmbedding);
        matches.push({
          company: company.name,
          innovator: innovator.name,
          matchScore: score.toFixed(3),
        });
      }
      // Sort descending
      matches.sort((a, b) => b.matchScore - a.matchScore);

    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to perform matching" });
  }
});

// Get all companies (lightweight: name + industry + innovation)
router.get("/companies", (req, res) => {
  try {
    const companies = readData(companiesFile).map(c => ({
      name: c.name,
      industry: c.industry,
      description: c.description || "",
      innovation: c.innovation || "",
      contact: c.contact || ""
    }));
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// Get all innovators (lightweight: name + industry)
router.get("/innovators", (req, res) => {
  try {
    const innovators = readData(innovatorsFile).map(i => ({
      name: i.name,
      industry: i.industry,
      description: i.description || "",
      contact: i.contact || ""
    }));
    res.json(innovators);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch innovators" });
  }
});


export default router;
