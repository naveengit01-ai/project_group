import React, { useEffect, useState } from "react";
import "./styles/mytrips.css";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider?.id) {
      setLoading(false);
      return;
    }

    async function loadTrips() {
      try {
        const [foodRes, clothRes] = await Promise.all([
          fetch(`${BASE_URL}/my-trips/${rider.id}`),
          fetch(`${BASE_URL}/my-clothes-trips/${rider.id}`)
        ]);

        if (!foodRes.ok || !clothRes.ok) {
          throw new Error("Failed to fetch trips");
        }

        const foodData = await foodRes.json();
        const clothData = await clothRes.json();

        const normalizedFood = Array.isArray(foodData)
          ? foodData.map((f) => ({
              id: f.id,
              type: "food",
              item: f.food_type,
              quantity: f.quantity,
              price: f.price,
              location: f.location,
              status: f.status,
              created_at: f.created_at
            }))
          : [];

        const normalizedClothes = Array.isArray(clothData)
          ? clothData.map((c) => ({
              id: c.id,
              type: "clothes",
              item: c.cloth_type,
              quantity: c.quantity,
              condition: c.cloth_condition,
              location: c.location,
              status: c.status,
              created_at: c.created_at
            }))
          : [];

        const merged = [...normalizedFood, ...normalizedClothes].sort(
          (a, b) =>
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );

        setTrips(merged);
      } catch (err) {
        console.error(err);
        setError("Unable to load trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  if (loading) {
    return <p className="loading">Loading trips...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="trips-container">
      <h1 className="page-title">My Trips</h1>

      {trips.length === 0 && (
        <p className="none">No trips found</p>
      )}

      <div className="trips-grid">
        {trips.map((t) => (
          <div
            className="trip-card"
            key={`${t.type}-${t.id}`}
          >
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
              <p>
                <strong>Picked On:</strong>{" "}
                {t.created_at
                  ? new Date(t.created_at).toLocaleString()
                  : "N/A"}
              </p>
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
