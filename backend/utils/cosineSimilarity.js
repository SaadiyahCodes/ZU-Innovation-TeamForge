// backend/utils/cosineSimilarity.js
import natural from "natural";

/*export default function cosineSimilarity(vec1, vec2) {
  if (!Array.isArray(vec1) || !Array.isArray(vec2)) return 0;
  const dot = vec1.reduce((sum, val, i) => sum + val * (vec2[i] || 0), 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val ** 2, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val ** 2, 0));
  return mag1 && mag2 ? dot / (mag1 * mag2) : 0;
}*/

export default function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

