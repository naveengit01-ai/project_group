import React, { useState, useEffect } from "react";
import "./styles/Landing.css";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    title: "Don't Waste Food",
    desc: "Donate excess food and help people in need"
  },
  {
    img: "https://images.unsplash.com/photo-1520975916090-3105956dac38",
    title: "Clothes for Everyone",
    desc: "Your unused clothes can change lives"
  },
  {
    img: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
    title: "Reduce Waste",
    desc: "Support sustainable and clean communities"
  }
];

export default function Landing() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landingPage">

      {/* ===== SLIDER ===== */}
      <div className="slider">
        <img src={slides[index].img} alt="slide" />
        <div className="overlay">
          <h1>{slides[index].title}</h1>
          <p>{slides[index].desc}</p>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <section className="homeContent">
        <h2>Welcome to DWJD</h2>
        <p>
          DWJD (Don't Waste Just Donate) is a platform that connects donors
          and riders to reduce food, clothes, and vegetable waste.
        </p>

        <div className="features">
          <div className="featureCard">🍱 Food Donation</div>
          <div className="featureCard">👕 Clothes Donation</div>
          <div className="featureCard">🌱 Vegetable Waste</div>
          <div className="featureCard">📍 Nearby Locations</div>
        </div>
      </section>

    </div>
  );
}
