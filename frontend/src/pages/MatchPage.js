// src/pages/MatchPage.js
import React, { useState } from "react";

export default function MatchPage() {
  const [form, setForm] = useState({
    type: "company",
    name: "",
    industry: "",
    description: "",
    innovation: "",
  });
  const [message, setMessage] = useState("");
  const [matches, setMatches] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message || "Submitted!");

    // After submitting, trigger matchmaking
    const matchRes = await fetch("/api/match");
    const matchData = await matchRes.json();
    setMatches(matchData.matches || []);
  };

  return (
    <div>
      <h2>Submit Your Details</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Type:</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="company">Company</option>
          <option value="innovator">Innovator</option>
        </select>

        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Industry:</label>
        <input name="industry" value={form.industry} onChange={handleChange} />

        <label>Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} />

        {form.type === "company" && (
          <>
            <label>Innovation Needed:</label>
            <input name="innovation" value={form.innovation} onChange={handleChange} />
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-btn">Submit</button>
        </div>
      </form>

      {message && <p>{message}</p>}

      {matches.length > 0 && (
        <div className="demo-activity">
          <h3>AI Match Results</h3>
          <ul className="msg-list">
            {matches.map((m, i) => (
              <li key={i}>
                <strong>{m.company}</strong> matched with <strong>{m.bestMatch}</strong> (Score: {m.matchScore})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
