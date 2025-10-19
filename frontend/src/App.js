import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Building2, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import './App.css';

function App() {
  // ---------- STATES ----------
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedType, setSelectedType] = useState(null); // "company" | "innovator" | null
  const [showMatching, setShowMatching] = useState(false);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [innovation, setInnovation] = useState("");

  const [useExisting, setUseExisting] = useState(false);
  const [existingEntities, setExistingEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");

  const [role, setRole] = useState("company");
  const [companies, setCompanies] = useState([]);
  const [innovators, setInnovators] = useState([]);

  // Modal states
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ---------- FETCH EXISTING DATA ----------
  useEffect(() => {
    fetch("http://localhost:5000/api/companies")
      .then(res => res.json())
      .then(data => setCompanies(data || []));
    fetch("http://localhost:5000/api/innovators")
      .then(res => res.json())
      .then(data => setInnovators(data || []));
  }, []);

  useEffect(() => {
    if (!selectedType) return;
    const endpoint = selectedType === "company" ? "/api/companies" : "/api/innovators";
    fetch(`http://localhost:5000${endpoint}`)
      .then(res => res.json())
      .then(data => setExistingEntities(data || []))
      .catch(() => setExistingEntities([]));
  }, [selectedType]);

  // ---------- FORM SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          name,
          industry,
          description,
          innovation: selectedType === "company" ? innovation : undefined,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
        fetchMatches(name);
      } else {
        setError(data.error || "Submission failed");
      }
    } catch {
      setError("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  // ---------- MATCHING ----------
  const fetchMatches = async (entityName) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/match?role=${selectedType}&name=${encodeURIComponent(entityName)}`
      );
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
        setShowMatching(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- EXISTING SELECT ----------
  const handleExistingSelect = (entityName) => {
    setSelectedEntity(entityName);
    const entity = existingEntities.find(e => e.name === entityName);
    if (entity) {
      setName(entity.name);
      setIndustry(entity.industry || "");
      setDescription(entity.description || "");
      if (selectedType === "company") setInnovation(entity.innovation || "");
    }
  };

  // ---------- RESET ----------
  const handleBackHome = () => {
    setSelectedType(null);
    setShowMatching(false);
    setName(""); setIndustry(""); setDescription(""); setInnovation("");
    setUseExisting(false); setSelectedEntity("");
    setMatches([]);
  };

  // ---------- HERO SECTION ----------
  if (!selectedType) {
    return (
      <div className="min-h-screen hero-background">
        <div className="pyramid-loader">
          <div className="wrapper">
            <span className="side side1"></span>
            <span className="side side2"></span>
            <span className="side side3"></span>
            <span className="side side4"></span>
            <span className="shadow"></span>
          </div>
        </div>

        <header className="header">
          <div className="container flex justify-between items-center">
            <div className="logo flex items-center">
              <img
                src="/logo.png"
                alt="Kineti Logo"
                className="h-10 w-auto object-contain"
                style={{ maxHeight: "80px" }}
              />
            </div>
          </div>
        </header>

        <section className="hero container text-center">
          <div className="hero-slogan">Connecting ideas to impact</div>
          <h1 className="hero-title text-shine">Where innovation meets opportunity</h1>
          <p className="hero-desc">
            Connect companies and investors with groundbreaking innovators and researchers. Transform ideas into
            real-world impact.
          </p>

          <div className="hero-cards">
            <div className="card company-card" onClick={() => setSelectedType("company")}>
              <div className="icon">
                <Building2 />
              </div>
              <h3>Companies, Investors & VCs</h3>
              <p>Find innovative solutions and cutting-edge research to drive your business forward</p>
              <div className="cta">
                Get started <ArrowRight />
              </div>
            </div>

            <div className="card innovator-card" onClick={() => setSelectedType("innovator")}>
              <div className="icon">
                <Lightbulb />
              </div>
              <h3>Innovators & Researchers</h3>
              <p>Connect with companies ready to bring your innovations to market</p>
              <div className="cta">
                Get started <ArrowRight />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ---------- MATCH RESULTS ----------
  if (showMatching) {
    const isCompany = selectedType === "company";
    return (
      <div className="min-h-screen bg-background">
        <header className="header">
          <div className="container flex justify-between items-center">
            <div className="logo flex items-center">
              <img
                src="/logo.png"
                alt="Kineti Logo"
                className="h-10 w-auto object-contain"
                style={{ maxHeight: "80px" }}
              />
            </div>
            <button className="btn-ghost" onClick={handleBackHome}>
              <ArrowLeft /> Back to Home
            </button>
          </div>
        </header>

        <div className="container py-12">
          <div className="text-center mb-8">
            <div className="badge"><Sparkles /> Matching Complete</div>
            <h2>Your Perfect Matches</h2>
            <p>
              We've found {matches.length} potential {isCompany ? "innovators" : "companies"} that align with your goals
            </p>
          </div>

          {matches.length > 0 ? matches.map((m, i) => {
            const matchName = isCompany ? m.innovator : m.company;
            const dataset = isCompany ? innovators : companies;
            const matchData = dataset.find(item => item.name === matchName);

            return (
              <div
                key={i}
                className="match-card clickable"
                onClick={() => {
                  setSelectedMatch(matchData);
                  setShowModal(true);
                }}
              >
                <div className="entity-left">
                  <div className="entity-icon">{isCompany ? <Lightbulb /> : <Building2 />}</div>
                  <div className="entity-name underline hover:text-blue-600 cursor-pointer">
                    {matchName}
                  </div>
                </div>
                <div className="badge">{m.matchScore}</div>
              </div>
            );
          }) : (
            <div className="card text-center p-12">
              <Sparkles size={32} />
              <p>No matches found yet. Check back soon!</p>
            </div>
          )}

          <button className="btn-outline mt-8" onClick={handleBackHome}>Return to Home</button>

          {showModal && (
            <Modal item={selectedMatch} onClose={() => setShowModal(false)} />
          )}
        </div>
      </div>
    );
  }

  // ---------- REGISTRATION FORM ----------
  const isCompany = selectedType === "company";
  return (
    <div className="min-h-screen bg-background">
      <header className="header">
        <div className="container flex justify-between items-center">
            <div className="logo flex items-center">
              <img
                src="/logo.png"
                alt="Kineti Logo"
                className="h-10 w-auto object-contain"
                style={{ maxHeight: "80px" }}
              />
            </div>
          <button className="btn-ghost" onClick={handleBackHome}>
            <ArrowLeft /> Back to Home
          </button>
        </div>
      </header>

      <div className="container py-12">
        <div className="form-card">
          <h2>{isCompany ? "Company Registration" : "Innovator Registration"}</h2>

          {existingEntities.length > 0 && (
            <div className="toggle-buttons">
              <button className={!useExisting ? "active" : ""} onClick={() => setUseExisting(false)}>New Entry</button>
              <button className={useExisting ? "active" : ""} onClick={() => setUseExisting(true)}>Select Existing</button>
            </div>
          )}

          {useExisting && (
            <div className="form-row">
              <label>Select Existing:</label>
              <select value={selectedEntity} onChange={e => handleExistingSelect(e.target.value)}>
                <option value="">--Select--</option>
                {existingEntities.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} disabled={useExisting} required />
            </div>

            <div className="form-row">
              <label>Industry</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)} required />
            </div>

            <div className="form-row">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            {isCompany && (
              <div className="form-row">
                <label>Innovation Looking For</label>
                <input value={innovation} onChange={e => setInnovation(e.target.value)} />
              </div>
            )}

            {message && <div className="message">{message}</div>}
            {error && <div className="error">{error}</div>}

            <button className="btn-primary" type="submit">
              {loading ? <><Loader2 className="spin" /> Submitting...</> : "Submit & Find Matches"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------- MODAL COMPONENT ----------
const Modal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{item.name}</h3>
        <p><strong>Industry:</strong> {item.industry}</p>
        <p><strong>Description:</strong> {item.description}</p>
        {item.innovation && <p><strong>Innovation:</strong> {item.innovation}</p>}
        {item.contact && <p><strong>Contact:</strong> {item.contact}</p>}

        <button onClick={onClose} className="btn-primary mt-4">Close</button>
      </div>
    </div>
  );
};

export default App;
