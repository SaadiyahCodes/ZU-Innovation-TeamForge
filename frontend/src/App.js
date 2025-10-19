//import logo from './logo.svg';
//import './App.css';
//import InnovationForm from "./InnovationForm";

// frontend/src/App.js
import { useState, useEffect } from "react";
import './App.css';

function App() {
  // Matching state
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Submission state
  const [type, setType] = useState("company");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [innovation, setInnovation] = useState("");
  const [message, setMessage] = useState("");

  // Matching dropdowns
  const [role, setRole] = useState("company");
  const [selectedName, setSelectedName] = useState("");
  const [companies, setCompanies] = useState([]);
  const [innovators, setInnovators] = useState([]);

  // Fetch companies and innovators
  useEffect(() => {
    fetch("http://localhost:5000/api/companies")
      .then(res => res.json())
      .then(data => setCompanies(data || []));
    fetch("http://localhost:5000/api/innovators")
      .then(res => res.json())
      .then(data => setInnovators(data || []));
  }, []);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name, industry, description, innovation }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);

    // Clear form on success
    if (data.message) {
      setName("");
      setIndustry("");
      setDescription("");
      setInnovation("");
      setType("company");
    }
  };

  // Handle matching
  const handleMatch = async () => {
    if (!selectedName) {
      setError("Please select a name to match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:5000/api/match?role=${role}&name=${encodeURIComponent(selectedName)}`
      );
      const data = await res.json();

      if (data.matches) setMatches(data.matches);
      else setError(data.error || "No matches found");
    } catch (err) {
      setError("Error fetching matches");
    }
    setLoading(false);
  };

  const names = role === "company" ? companies.map(c => c.name) : innovators.map(i => i.name);

  return (
    <div className="app-container">
      <h1>TeamForge Demo</h1>

      {/* Innovation Submission Form */}
      <div className="card">
        <h2>Innovation Submission</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Type:
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="company">Company</option>
                <option value="innovator">Innovator</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>Name: <input value={name} onChange={(e) => setName(e.target.value)} /></label>
          </div>

          <div className="form-row">
            <label>Industry: <input value={industry} onChange={(e) => setIndustry(e.target.value)} /></label>
          </div>

          <div className="form-row">
            <label>Description: <textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          </div>

          {type === "company" && (
            <div className="form-row">
              <label>Innovation Looking For: <input value={innovation} onChange={(e) => setInnovation(e.target.value)} /></label>
            </div>
          )}

          <button className="button" type="submit">Submit</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      {/* Matching Section */}
      <div className="card">
        <h2>🔍 Find Matches</h2>
        <div className="form-row">
          <label>Role:
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="company">Company</option>
              <option value="innovator">Innovator</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>Name:
            <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
              <option value="">--Select--</option>
              {names.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <button className="button" onClick={handleMatch} disabled={loading}>
          {loading ? "Matching..." : "Run Matching"}
        </button>

        {error && <p className="error">{error}</p>}

        {matches.length > 0 && (
          <div className="matches">
            <h3>Results:</h3>
            <ul>
              {matches.map((m, i) => (
                <li key={i}>
                  {role === "company" ? (
                    <><strong>{m.company}</strong> → {m.innovator} ({m.matchScore})</>
                  ) : (
                    <>{m.innovator} → <strong>{m.company}</strong> ({m.matchScore})</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


