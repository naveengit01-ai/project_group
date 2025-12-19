import React, { useEffect, useState } from "react";
import "./styles/Trips.css";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Trips({ setPage }) {
  const [trips, setTrips] = useState([]);

  // ================= LOAD TRIPS =================
  useEffect(() => {
    async function loadTrips() {
      try {
        const foodRes = await fetch(`${BASE_URL}/get-trips`);
        const clothesRes = await fetch(`${BASE_URL}/get-clothes-trips`);

        const foodData = await foodRes.json();
        const clothesData = await clothesRes.json();

        // Normalize MongoDB _id → id
        const merged = [...foodData, ...clothesData]
          .map(trip => ({
            ...trip,
            id: trip._id
          }))
          .sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

        setTrips(merged);
      } catch (err) {
        console.error("Error loading trips:", err);
        alert("Failed to load trips");
      }
    }

    loadTrips();
  }, []);

  // ================= TAKE TRIP =================
  const handlePick = async (trip) => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return alert("Please login first");

    const isFood = !!trip.food_type;

    const API = isFood
      ? `${BASE_URL}/pick-trip`
      : `${BASE_URL}/pick-clothes-trip`;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: trip.id,
          rider_id: rider._id,
        }),
      });

      if (!res.ok) throw new Error("Pick request failed");

      const data = await res.json();

      if (data.status === "success") {
        setPage(`verify-pin#${trip.id}`);
      } else {
        alert(data.message || "Could not pick this trip");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while picking trip");
    }
  };

  // ================= REJECT TRIP (FOOD ONLY) =================
  const handleReject = async (trip) => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return alert("Please login first");

    const isFood = !!trip.food_type;
    if (!isFood) {
      return alert("Reject option for clothes trips is not available");
    }

    const reason = prompt("Enter reason for rejecting:");
    if (!reason) return;

    try {
      const res = await fetch(`${BASE_URL}/reject-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: trip.id,
          rider_id: rider._id,
          reason,
        }),
      });

      if (!res.ok) throw new Error("Reject request failed");

      const data = await res.json();

      if (data.status === "success") {
        setTrips(prev =>
          prev.map(t =>
            t.id === trip.id ? { ...t, status: "rejected" } : t
          )
        );
      } else {
        alert(data.message || "Reject failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while rejecting trip");
    }
  };

  // ================= UI =================
  return (
    <div className="trips-container">
      <h1 className="page-title">Available Trips</h1>

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
                  <>
                    <button
                      className="pickBtn"
                      onClick={() => handlePick(trip)}
                    >
                      ✔ Take Trip
                    </button>

                    <button
                      className="rejectBtn"
                      onClick={() => handleReject(trip)}
                    >
                      ✖ Not Taking
                    </button>
                  </>
                )}

                {trip.status === "picked" && (
                  <button className="pickedBtn" disabled>
                    Trip Picked
                  </button>
                )}

                {trip.status === "rejected" && (
                  <button className="rejectedBtn" disabled>
                    Rejected
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
