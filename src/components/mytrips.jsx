import React, { useEffect, useState } from "react";
import "./styles/mytrips.css";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return;

    async function loadTrips() {
      const foodRes = await fetch(`http://localhost:5000/my-trips/${rider.id}`);
      const clothRes = await fetch(`http://localhost:5000/my-clothes-trips/${rider.id}`);

      const foodData = await foodRes.json();
      const clothData = await clothRes.json();

      const normalizedClothes = clothData.map((c) => ({
        id: c.id,
        type: "clothes",
        item: c.cloth_type,
        quantity: c.quantity,
        condition: c.cloth_condition,
        location: c.location,
        status: c.status,
        created_at: c.created_at,
      }));

      const normalizedFood = foodData.map((f) => ({
        id: f.id,
        type: "food",
        item: f.food_type,
        quantity: f.quantity,
        price: f.price,
        location: f.location,
        status: f.status,
        created_at: f.created_at,
      }));

      const merged = [...normalizedFood, ...normalizedClothes].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setTrips(merged);
    }

    loadTrips();
  }, []);

  return (
    <div className="trips-container">
      <h1 className="page-title">My Trips</h1>

      {trips.length === 0 && <p className="none">No trips found</p>}

      <div className="trips-grid">
        {trips.map((t) => (
          <div className="trip-card" key={t.id}>

            <h2 className="trip-title">
              {t.type === "food" ? "Food Trip" : "Clothes Trip"} #{t.id}
            </h2>

            <div className="trip-details">
              <p><strong>Item:</strong> {t.item}</p>
              <p><strong>Quantity:</strong> {t.quantity}</p>

              {t.type === "clothes" && (
                <p><strong>Condition:</strong> {t.condition}</p>
              )}

              {t.type === "food" && (
                <p><strong>Price:</strong> {t.price || "Free"}</p>
              )}

              <p><strong>Address:</strong> {t.location}</p>
              <p><strong>Status:</strong> {t.status}</p>
              <p><strong>Picked On:</strong> {t.created_at}</p>
            </div>

            {t.status === "completed" && (
              <p className="completed-info">Delivery Completed ✔</p>
            )}

            {t.status === "picked" && (
              <p className="picked-info">Trip In Progress…</p>
            )}

            {t.status === "rejected" && (
              <p className="rejected-info">Trip Rejected ✘</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
