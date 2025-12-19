import React, { useState } from "react";
import "./styles/otp.css";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function VerifyPin({ tripId }) {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return alert("Please login first!");

    if (pin.trim() === "") return alert("Enter PIN!");

    try {
      const res = await fetch(`${BASE_URL}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          rider_id: rider._id, // ✅ FIXED HERE
          pin: pin,
        }),
      });

      if (!res.ok) throw new Error("Verify failed");

      const data = await res.json();

      if (data.status === "success") {
        setMessage("✔ PIN Verified! Trip Completed");

        localStorage.setItem("rider_verified", "done");

        setTimeout(() => {
          window.location.href = "/mytrips";
        }, 1500);

      } else if (data.status === "invalid") {
        setMessage("❌ Wrong PIN");

      } else if (data.status === "expired") {
        setMessage("⚠ PIN expired");

      } else if (data.status === "not_allowed") {
        setMessage("❌ This trip was not assigned to you");

      } else {
        setMessage("Error verifying PIN");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while verifying PIN");
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
          onChange={(e) => setPin(e.target.value)}
          maxLength={6}
        />

        <button className="verify-btn" onClick={handleVerify}>
          Verify PIN
        </button>

        {message && <p className="verify-message">{message}</p>}
      </div>
    </div>
  );
}
