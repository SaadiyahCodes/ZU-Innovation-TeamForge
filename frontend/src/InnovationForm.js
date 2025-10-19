//frontend/src/InnovationForm.js
import { useState } from "react";

export default function InnovationForm() {
  const [type, setType] = useState("company");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [innovation, setInnovation] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name, industry, description, innovation }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Innovation Submission</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="company">Company</option>
            <option value="innovator">Innovator</option>
          </select>
        </label>
        <br />
        <label>
          Name: <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <br />
        <label>
          Industry: <input value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </label>
        <br />
        <label>
          Description: <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <br />
        {type === "company" && (
          <label>
            Innovation Looking For: <input value={innovation} onChange={(e) => setInnovation(e.target.value)} />
          </label>
        )}
        <br />
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
