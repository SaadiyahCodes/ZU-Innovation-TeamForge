// src/pages/HomePage.js
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      <h1>Connecting Ideas to IMPACT</h1>
      <p>Discover innovators and companies working on the next big thing.</p>
      <Link to="/match">
        <button className="submit-btn">Get Started</button>
      </Link>
    </div>
  );
}
