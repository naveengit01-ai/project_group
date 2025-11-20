import React, { useState, useEffect } from "react";
import "./styles/Food.css"; // reuse same CSS

export default function Clothes() {
  const [clothType, setClothType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState(""); // new field
  const [location, setLocation] = useState("");

  const [generatedPIN, setGeneratedPIN] = useState("");
  const [lastTrip, setLastTrip] = useState(null);
  const [riderVerifiedMsg, setRiderVerifiedMsg] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("last_cloth_donation"));

    if (saved) {
      setLastTrip(saved);
      setGeneratedPIN(saved.pin);

      const interval = setInterval(async () => {
        const res = await fetch(`http://localhost:5000/check-trip-status/${saved.trip_id}`);
        const data = await res.json();

        if (data.trip_status === "completed") {
          setRiderVerifiedMsg("✔ Rider verified the PIN. You can give the clothes now.");

          setTimeout(() => {
            localStorage.removeItem("last_cloth_donation");
            setLastTrip(null);
            setGeneratedPIN("");
            setRiderVerifiedMsg("");
          }, 15000);

          clearInterval(interval);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return alert("Please login!");

    const payload = {
      user_id: storedUser.id,
      cloth_type: clothType,
      quantity,
      condition,
      location,
    };

    const res = await fetch("http://localhost:5000/addClothes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success") {
      const tripInfo = {
        trip_id: data.trip_id,
        clothType,
        quantity,
        condition,
        location,
        pin: data.pin,
      };

      localStorage.setItem("last_cloth_donation", JSON.stringify(tripInfo));

      setLastTrip(tripInfo);
      setGeneratedPIN(data.pin);
    } else {
      alert("Error: " + data.message);
    }
  };

  return (
    <div className="foodContainer">
      <form className="foodForm" onSubmit={handleSubmit}>
        <h2>Clothes Donation</h2>

        <input
          type="text"
          placeholder="Cloth Type (Shirt, Pants, Jackets...)"
          value={clothType}
          onChange={(e) => setClothType(e.target.value)}
        />

        <input
          type="text"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          type="text"
          placeholder="Condition (New / Good / Used)"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />

        <input
          type="text"
          placeholder="Pickup Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button>Donate Clothes</button>
      </form>

      {/* Success message */}
      {riderVerifiedMsg && (
        <div className="pinBox">
          <h3>{riderVerifiedMsg}</h3>
          <p className="pinInfo">This will close in 15 seconds...</p>
        </div>
      )}

      {/* PIN & Details */}
      {!riderVerifiedMsg && lastTrip && (
        <div className="pinBox">
          <h3>Your Pickup Verification PIN</h3>
          <p className="pinValue">{generatedPIN}</p>

          <h4>Cloth Details</h4>
          <p>Type: {lastTrip.clothType}</p>
          <p>Quantity: {lastTrip.quantity}</p>
          <p>Condition: {lastTrip.condition}</p>
          <p>Location: {lastTrip.location}</p>

          <p className="pinInfo">Give this PIN to the rider when they arrive.</p>
        </div>
      )}
    </div>
  );
}
