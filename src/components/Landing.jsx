import React from "react";
import "./styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing-container">

      {/* Overlay Content */}
      <div className="landing-overlay">
        <h1 className="landing-title">Welcome to My Website</h1>
        <p className="landing-subtitle">
          Explore. Learn. Build Something Amazing.
        </p>

        <button className="landing-btn">Get Started</button>
      </div>

    </div>
  );
}
