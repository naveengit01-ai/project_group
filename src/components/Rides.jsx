import React, { useState } from "react";
import "./styles/Rides.css";

export default function Rides({ trip }) {
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    const res = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip_id: trip.id, otp })
    });

    const data = await res.json();
    
    if (data.status === "success") {
      alert("Pickup confirmed!");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="ride-container">
      <h2>{trip.food_title}</h2>
      <p>Address: {trip.address}</p>

      <input
        type="text"
        placeholder="Enter OTP"
        className="otpInput"
        onChange={(e)=>setOtp(e.target.value)}
      />

      <button className="verifyBtn" onClick={handleVerify}>
        Verify OTP
      </button>
    </div>
  );
}
