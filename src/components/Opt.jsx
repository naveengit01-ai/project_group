import React, { useState } from "react";
import "./styles/Otp.css";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const handleVerify = async () => {
    const rider = JSON.parse(localStorage.getItem("user"));
    const tripId = localStorage.getItem("current_trip");

    if (!rider || !tripId) {
      alert("Invalid Trip or User");
      return;
    }

    const res = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        rider_id: rider.id,
        otp: otp,
      }),
    });

    const data = await res.json();

    if (data.status === "success") {
      setMsg("OTP Verified! Trip Completed Successfully ✔");
    } else {
      setMsg("Invalid OTP ❌");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>Enter OTP</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button onClick={handleVerify}>Verify OTP</button>

        {msg && <p className="otp-msg">{msg}</p>}
      </div>
    </div>
  );
}
