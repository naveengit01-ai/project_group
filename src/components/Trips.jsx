import React, { useEffect, useState } from "react";
import "./styles/Trips.css";

const BASE_URL = "https://back-end-project-group.onrender.com";
// for local testing:
// const BASE_URL = "http://localhost:10000";

export default function Trips({ setPage }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD TRIPS =================
  useEffect(() => {
    async function loadTrips() {
      try {
        const [foodRes, clothesRes] = await Promise.all([
          fetch(`${BASE_URL}/get-trips`, { credentials: "include" }),
          fetch(`${BASE_URL}/get-clothes-trips`, { credentials: "include" })
        ]);

        if (!foodRes.ok || !clothesRes.ok) {
          throw new Error("Failed to load trips");
        }

        const foodData = await foodRes.json();
        const clothesData = await clothesRes.json();

        const merged = [...foodData, ...clothesData]
          .map(trip => ({ ...trip, id: trip._id }))
          .sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

        setTrips(merged);
      } catch (err) {
        console.error("Error loading trips:", err);
        alert("Failed to load trips. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  // ================= TAKE TRIP =================
  const handlePick = async (trip) => {
    const isFood = !!trip.food_type;

    const API = isFood
      ? `${BASE_URL}/pick-trip`
      : `${BASE_URL}/pick-clothes-trip`;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ COOKIE REQUIRED
        body: JSON.stringify({
          trip_id: trip.id
        })
      });

      if (!res.ok) {
        throw new Error("Pick request failed");
      }

      const data = await res.json();

      if (data.status === "success") {
        setPage(`verify-pin#${trip.id}`);
      } else {
        alert(data.message || "Could not pick this trip");
      }
    } catch (err) {
      console.error("Pick error:", err);
      alert("Server error while picking trip");
    }
  };

  // ================= UI =================
  return (
    <div className="trips-container">
      <h1 className="page-title">Available Trips</h1>

      {loading && <p style={{ textAlign: "center" }}>Loading trips...</p>}

      {!loading && trips.length === 0 && (
        <p style={{ textAlign: "center" }}>No trips available</p>
      )}

      <div className="trips-grid">
        {trips.map((trip) => {
          const isFood = !!trip.food_type;

          return (
            <div className="trip-card" key={trip.id}>
              <h2 className="trip-title">
                {isFood ? "Food Donation" : "Clothes Donation"}
              </h2>

              <div className="trip-details">
                {isFood ? (
                  <>
                    <p><strong>Food:</strong> {trip.food_type}</p>
                    <p><strong>Quantity:</strong> {trip.quantity}</p>
                    <p><strong>Price:</strong> {trip.price || 0}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Clothes:</strong> {trip.cloth_type}</p>
                    <p><strong>Quantity:</strong> {trip.quantity}</p>
                    <p><strong>Condition:</strong> {trip.cloth_condition}</p>
                  </>
                )}

                <p><strong>Status:</strong> {trip.status}</p>
                <hr />
                <p><strong>Pickup Address:</strong> {trip.location}</p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(trip.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="trip-actions">
                {trip.status === "pending" && (
                  <button
                    className="pickBtn"
                    onClick={() => handlePick(trip)}
                  >
                    ✔ Take Trip
                  </button>
                )}

                {trip.status === "picked" && (
                  <button className="pickedBtn" disabled>
                    Trip Picked
                  </button>
                )}

                {trip.status === "completed" && (
                  <button className="pickedBtn" disabled>
                    Completed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
