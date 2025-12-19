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
  const [showForm, setShowForm] = useState(true);

  // ================= LOAD EXISTING DONATION =================
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("last_donation"));

    if (!saved) {
      setShowForm(true);
      return;
    }

    setLastTrip(saved);
    setGeneratedPIN(saved.pin);
    setShowForm(false);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/check-trip-status/${saved.trip_id}`
        );
        const data = await res.json();

        if (data.trip_status === "completed") {
          setRiderVerifiedMsg(
            "✔ Rider verified the PIN. You can give the food now."
          );

          clearInterval(interval);

          setTimeout(() => {
            localStorage.removeItem("last_donation");
            setLastTrip(null);
            setGeneratedPIN("");
            setRiderVerifiedMsg("");
            setShowForm(true); // ✅ FORM RETURNS
          }, 15000);
        }
      } catch (err) {
        console.error("Status check failed:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ================= SUBMIT DONATION =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      alert("Please login!");
      return;
    }

    const payload = {
      user_id: storedUser.id,
      food_type: foodType,
      quantity,
      price,
      provider_type: providerType,
      location,
    };

    try {
      const res = await fetch(
        "https://back-end-project-group.onrender.com/addTrip",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

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
        setShowForm(false);

        // clear inputs
        setFoodType("");
        setQuantity("");
        setPrice("");
        setProviderType("");
        setLocation("");
      } else {
        alert("Error creating donation");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="foodContainer">
      {/* ================= DONATION FORM ================= */}
      {showForm && (
        <form className="foodForm" onSubmit={handleSubmit}>
          <h2>Food Donation</h2>

          <input
            type="text"
            placeholder="Food Type"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Price (Optional)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            value={providerType}
            onChange={(e) => setProviderType(e.target.value)}
            required
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
            required
          />

          <button>Donate</button>
        </form>
      )}

      {/* ================= VERIFIED MESSAGE ================= */}
      {riderVerifiedMsg && (
        <div className="pinBox">
          <h3>{riderVerifiedMsg}</h3>
          <p className="pinInfo">This will close in 15 seconds...</p>
        </div>
      )}

      {/* ================= PIN DISPLAY ================= */}
      {!riderVerifiedMsg && lastTrip && (
        <div className="pinBox">
          <h3>Your Pickup Verification PIN</h3>
          <p className="pinValue">{generatedPIN}</p>

          <h4>Food Details</h4>
          <p>Food: {lastTrip.foodType}</p>
          <p>Quantity: {lastTrip.quantity}</p>
          <p>Location: {lastTrip.location}</p>

          <p className="pinInfo">
            Give this PIN to the rider when they arrive.
          </p>
        </div>
      )}
    </div>
  );
}
