import React, { useEffect, useState } from "react";
import "./styles/Trips.css";

export default function Trips({ setPage }) {
  const [trips, setTrips] = useState([]);

  // Load BOTH FOOD + CLOTHES TRIPS from backend
  useEffect(() => {
    async function loadTrips() {
      const foodRes = await fetch("http://localhost:5000/get-trips");
      const clothesRes = await fetch("http://localhost:5000/get-clothes-trips");

      const foodData = await foodRes.json();
      const clothesData = await clothesRes.json();

      // merge both lists and sort by date (latest first)
      const merged = [...foodData, ...clothesData].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setTrips(merged);
    }

    loadTrips();
  }, []);

  // TAKE TRIP
  const handlePick = async (trip) => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return alert("Please login first");

    const isFood = trip.food_type !== null;

    const API = isFood
      ? "http://localhost:5000/pick-trip"
      : "http://localhost:5000/pick-clothes-trip";

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: trip.id,
          rider_id: rider.id,
        }),
      });

      const data = await res.json();
      console.log("Pick Trip Response:", data);

      if (data.status === "success") {
        // ⭐ Redirect to verify pin page
        setPage("verify-pin#" + trip.id);
      } else {
        alert(data.message || "Something went wrong!");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  // REJECT TRIP
  const handleReject = async (tripId) => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return alert("Please login first");

    const reason = prompt("Enter reason for rejecting this trip:");
    if (!reason) return;

    const res = await fetch("http://localhost:5000/reject-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        rider_id: rider.id,
        reason,
      }),
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Trip Rejected!");

      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId ? { ...trip, status: "rejected" } : trip
        )
      );
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="trips-container">
      <h1 className="page-title">Available Trips</h1>

      <div className="trips-grid">
        {trips.map((trip) => (
          <div className="trip-card" key={trip.id}>

            {/* Donation Type Heading */}
            <h2 className="trip-title">
              {trip.food_type ? "Food Donation" : "Clothes Donation"}
            </h2>

            <div className="trip-details">
              {/* FOOD DETAILS */}
              {trip.food_type && (
                <>
                  <p><strong>Food:</strong> {trip.food_type}</p>
                  <p><strong>Quantity:</strong> {trip.quantity}</p>
                  <p><strong>Price:</strong> {trip.price}</p>
                </>
              )}

              {/* CLOTHES DETAILS */}
              {!trip.food_type && (
                <>
                  <p><strong>Cloth Type:</strong> {trip.cloth_type}</p>
                  <p><strong>Quantity:</strong> {trip.quantity}</p>
                  <p><strong>Condition:</strong> {trip.cloth_condition}</p>
                </>
              )}

              <p><strong>Status:</strong> {trip.status}</p>
              <hr />
              <p><strong>Pickup Address:</strong> {trip.location}</p>
              <p><strong>Created On:</strong> {trip.created_at}</p>
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
                    onClick={() => handleReject(trip.id)}
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
        ))}
      </div>
    </div>
  );
}
