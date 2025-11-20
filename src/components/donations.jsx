import React, { useEffect, useState } from "react";
import "./styles/donations.css";

export default function MyDonations() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch(`http://localhost:5000/my-donations/${user.id}`)
      .then((res) => res.json())
      .then((data) => setDonations(data));
  }, []);

  return (
    <div className="donations-container">
      <h1 className="page-title">My Donations</h1>

      {donations.length === 0 && <p>No donations yet</p>}

      <div className="donations-grid">
        {donations.map((d) => (
          <div className="don-card" key={d.id}>
            <h2>Food Donation</h2>

            <p><strong>Food:</strong> {d.food_type}</p>
            <p><strong>Qty:</strong> {d.quantity}</p>
            <p><strong>Price:</strong> {d.price || "FREE"}</p>
            <p><strong>Status:</strong> {d.status}</p>
            <p><strong>Created:</strong> {d.created_at}</p>

            {/* 🔥 PIN DISPLAY ADDED HERE */}
            {d.status === "pending" && (
              <div className="pin-box">
                <p><strong>Your Pickup PIN:</strong></p>
                <h2 className="pin-value">{d.otp}</h2>
                <p className="pin-expiry">
                  Expires At: {d.otp_expiry}
                </p>
              </div>
            )}

            {d.status === "picked" && (
              <p className="picked-info">Picked by rider</p>
            )}

            {d.status === "completed" && (
              <p className="completed-info">Delivery Completed ✔</p>
            )}

            {d.status === "rejected" && (
              <p className="rejected-info">Donation Rejected by Rider ❌</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
