import React, { useState } from "react";
import "./styles/otp.css";

const BASE_URL = "https://back-end-project-group.onrender.com";
// local testing:
// const BASE_URL = "http://localhost:10000";

export default function VerifyPin({ tripId }) {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const rider = JSON.parse(localStorage.getItem("user"));

    if (!rider || !rider._id) {
      alert("Please login again");
      return;
    }

    if (!pin.trim()) {
      alert("Enter PIN");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          rider_id: rider._id,
          pin: pin.trim()
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage("✔ PIN Verified. Trip Completed!");

        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);

      } else if (data.status === "invalid") {
        setMessage("❌ Wrong PIN");

      } else if (data.status === "not_allowed") {
        setMessage("❌ This trip is not assigned to you");

      } else if (data.status === "not_found") {
        setMessage("❌ Trip not found");

      } else {
        setMessage("⚠ Verification failed");
      }

    } catch (err) {
      console.error("Verify PIN error:", err);
      setMessage("⚠ Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!tripId) return <h2>Loading...</h2>;

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1>Verify Pickup PIN</h1>

        <p className="trip-id">Trip ID: {tripId}</p>

        <input
          type="text"
          className="pin-input"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.toUpperCase())}
          maxLength={6}
        />

        <button
          className="verify-btn"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify PIN"}
        </button>

        {message && <p className="verify-message">{message}</p>}
      </div>
    </div>
  );
}
