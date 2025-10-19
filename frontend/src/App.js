//import logo from './logo.svg';
//import './App.css';
//import InnovationForm from "./InnovationForm";
// frontend/src/App.js
import { useState } from "react";
import InnovationForm from "./InnovationForm";

function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/match");
      const data = await res.json();

      if (data.matches) {
        setMatches(data.matches);
      } else {
        setError(data.error || "No matches found");
      }
    } catch (err) {
      setError("Error fetching matches");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>TeamForge Demo</h1>
      <InnovationForm />

      <hr style={{ margin: "2rem 0" }} />

      <h2>🔍 Find Matches</h2>
      <button onClick={handleMatch} disabled={loading}>
        {loading ? "Matching..." : "Run Matching"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {matches.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Results:</h3>
          <ul>
            {matches.map((m, i) => (
              <li key={i}>
                <strong>{m.company}</strong> → {m.bestMatch} ({m.matchScore})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
