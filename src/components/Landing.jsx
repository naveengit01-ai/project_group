import React from "react";
import "./styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing-page">

      {/* HERO SECTION */}
      <div className="landing-hero">
        <h1 className="landing-title">Don’t Waste, Just Donate</h1>
        <p className="landing-subtitle">
          Share your extra food & clothes. Create hope. Spread kindness.
        </p>
      </div>

      {/* ABOUT SECTION */}
      <div className="about-section">

        <div className="about-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1048/1048944.png"
            alt="Mission"
            className="about-img"
          />
          <h2 className="about-title">Our Mission</h2>
          <p className="about-text">
            We aim to reduce waste by connecting donors with people in need.
            A small donation today becomes a huge difference for someone tomorrow.
          </p>
        </div>

        <div className="about-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png"
            alt="How We Work"
            className="about-img"
          />
          <h2 className="about-title">How We Work</h2>
          <p className="about-text">
            You donate. Our volunteers pick up. We deliver.  
            Transparent, fast, and community-driven.
          </p>
        </div>

        <div className="about-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3595/3595455.png"
            alt="Why Donate"
            className="about-img"
          />
          <h2 className="about-title">Why Donate?</h2>
          <p className="about-text">
            Millions lack food & clothes. Your unused items can bring relief,
            dignity, and hope to someone in need.
          </p>
        </div>

        <div className="about-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png"
            alt="Join Us"
            className="about-img"
          />
          <h2 className="about-title">Join the Movement</h2>
          <p className="about-text">
            Become part of a growing community that believes in spreading kindness,
            reducing waste, and supporting the needy.
          </p>
        </div>

      </div>
    </div>
  );
}
