import React, { useEffect, useState } from "react";
import "./styles/mytrips.css";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || user.user_type !== "rider") {
      setLoading(false);
      setError("Unauthorized");
      return;
    }

    async function loadTrips() {
      try {
        const [foodRes, clothesRes] = await Promise.all([
          fetch(`${BASE_URL}/my-trips/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${BASE_URL}/my-clothes-trips/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        if (!foodRes.ok || !clothesRes.ok) {
          throw new Error("Fetch failed");
        }

        const foodData = await foodRes.json();
        const clothesData = await clothesRes.json();

        const foodTrips = foodData.map(t => ({
          id: t._id,
          type: "food",
          item: t.food_type,
          quantity: t.quantity,
          price: t.price,
          location: t.location,
          status: t.status,
          createdAt: t.createdAt
        }));

        const clothesTrips = clothesData.map(t => ({
          id: t._id,
          type: "clothes",
          item: t.cloth_type,
          quantity: t.quantity,
          condition: t.cloth_condition,
          location: t.location,
          status: t.status,
          createdAt: t.createdAt
        }));

        const merged = [...foodTrips, ...clothesTrips].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTrips(merged);
      } catch (err) {
        console.error(err);
        setError("Unable to load trips");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  if (loading) return <p className="loading">Loading trips…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="trips-container">
      <h1 className="page-title">My Trips</h1>

      {trips.length === 0 && (
        <p className="none">No trips assigned yet</p>
      )}

      <div className="trips-grid">
        {trips.map(t => (
          <div className="trip-card" key={t.id}>
            <h2 className="trip-title">
              {t.type === "food" ? "Food Trip" : "Clothes Trip"}
            </h2>

            <div className="trip-details">
              <p><strong>Item:</strong> {t.item}</p>
              <p><strong>Quantity:</strong> {t.quantity}</p>

              {t.type === "food" && (
                <p><strong>Price:</strong> {t.price || "Free"}</p>
              )}

              {t.type === "clothes" && (
                <p><strong>Condition:</strong> {t.condition}</p>
              )}

              <p><strong>Pickup Address:</strong> {t.location}</p>
              <p><strong>Status:</strong> {t.status}</p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>

            {t.status === "picked" && (
              <p className="picked-info">🚴 On the way</p>
            )}

            {t.status === "completed" && (
              <p className="completed-info">✔ Completed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
