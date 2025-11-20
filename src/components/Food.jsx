import React, { useState, useEffect } from "react";
import "./styles/Food.css";
export default function Food() {
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [providerType, setProviderType] = useState("");
  const [location, setLocation] = useState("");

  const [generatedPIN, setGeneratedPIN] = useState("");
  const [lastTrip, setLastTrip] = useState(null);
  const [riderVerifiedMsg, setRiderVerifiedMsg] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("last_donation"));

    if (saved) {
      setLastTrip(saved);
      setGeneratedPIN(saved.pin);

      // every 5 seconds check whether rider verified
      const interval = setInterval(async () => {
        const res = await fetch(`http://localhost:5000/check-trip-status/${saved.trip_id}`);
        const data = await res.json();

        if (data.trip_status === "completed") {
          setRiderVerifiedMsg("✔ Rider verified the PIN. You can give the food now.");

          // After showing message → clear after 40 sec
          setTimeout(() => {
            localStorage.removeItem("last_donation");
            setLastTrip(null);
            setGeneratedPIN("");
            setRiderVerifiedMsg("");
          }, 15000);

          clearInterval(interval); // stop checking once completed
        }
      }, 5000); // check every 5 seconds

      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return alert("Please login!");

    const payload = {
      user_id: storedUser.id,
      food_type: foodType,
      quantity,
      price,
      provider_type: providerType,
      location,
    };

    const res = await fetch("http://localhost:5000/addTrip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success") {
      const tripInfo = {
        trip_id: data.trip_id,
        foodType,
        quantity,
        price,
        providerType,
        location,
        pin: data.pin,
      };

      localStorage.setItem("last_donation", JSON.stringify(tripInfo));

      setLastTrip(tripInfo);
      setGeneratedPIN(data.pin);
    } else {
      alert("Error: " + data.message);
    }
  };

  return (
    <div className="foodContainer">
      <form className="foodForm" onSubmit={handleSubmit}>
        <h2>Food Donation</h2>

        <input type="text" placeholder="Food Type"
          value={foodType} onChange={(e) => setFoodType(e.target.value)} />

        <input type="text" placeholder="Quantity"
          value={quantity} onChange={(e) => setQuantity(e.target.value)} />

        <input type="text" placeholder="Price (Optional)"
          value={price} onChange={(e) => setPrice(e.target.value)} />

        <select value={providerType} onChange={(e) => setProviderType(e.target.value)}>
          <option value="">Provider Type</option>
          <option value="hotel">Hotel</option>
          <option value="individual">Individual</option>
        </select>

        <input type="text" placeholder="Pickup Location"
          value={location} onChange={(e) => setLocation(e.target.value)} />

        <button>Donate</button>
      </form>

      {/* Show message when rider verified */}
      {riderVerifiedMsg && (
        <div className="pinBox">
          <h3>{riderVerifiedMsg}</h3>
          <p className="pinInfo">This will close in 15 seconds...</p>
        </div>
      )}

      {/* Show PIN only before rider verifies */}
      {!riderVerifiedMsg && lastTrip && (
        <div className="pinBox">
          <h3>Your Pickup Verification PIN</h3>
          <p className="pinValue">{generatedPIN}</p>

          <h4>Food Details</h4>
          <p>Food: {lastTrip.foodType}</p>
          <p>Quantity: {lastTrip.quantity}</p>
          <p>Location: {lastTrip.location}</p>

          <p className="pinInfo">Give this PIN to the rider when they arrive.</p>
        </div>
      )}
    </div>
  );
}
