import React, { useEffect, useState } from "react";
import "./styles/Food.css";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Food() {
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [providerType, setProviderType] = useState("");
  const [location, setLocation] = useState("");

  const [tripId, setTripId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  /* ================= POLL STATUS ================= */
  useEffect(() => {
    if (!tripId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/check-trip-status/${tripId}`
        );
        const data = await res.json();

        if (data.trip_status === "picked") {
          setStatusMsg("🚴 Rider picked your donation. OTP sent.");
        }

        if (data.trip_status === "completed") {
          setStatusMsg("✅ Donation collected. Thank you!");

          setTimeout(() => {
            setTripId(null);
            setStatusMsg("");
          }, 8000);

          clearInterval(interval);
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tripId]);

  /* ================= SUBMIT DONATION ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      alert("Please login again");
      return;
    }

    if (!foodType || !quantity || !providerType || !location) {
      alert("Fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/addTrip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // ✅ FIX
        },
        body: JSON.stringify({
          user_id: user._id,
          food_type: foodType,
          quantity,
          price,
          provider_type: providerType,
          location
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setTripId(data.trip_id);
        setStatusMsg("📧 OTP sent to your email / phone.");
      } else {
        alert("Failed to create donation");
      }
    } catch (err) {
      console.error("AddTrip error:", err);
      alert("Server error while creating donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="foodContainer">

      {!tripId && (
        <form className="foodForm" onSubmit={handleSubmit}>
          <h2>Food Donation</h2>

          <input
            type="text"
            placeholder="Food Type"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price (Optional)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            value={providerType}
            onChange={(e) => setProviderType(e.target.value)}
          >
            <option value="">Provider Type</option>
            <option value="hotel">Hotel</option>
            <option value="individual">Individual</option>
          </select>

          <input
            type="text"
            placeholder="Pickup Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button disabled={loading}>
            {loading ? "Submitting..." : "Donate"}
          </button>
        </form>
      )}

      {statusMsg && (
        <div className="pinBox">
          <h3>{statusMsg}</h3>
          <p className="pinInfo">
            OTP is sent securely. Do not share publicly.
          </p>
        </div>
      )}
    </div>
  );
}
