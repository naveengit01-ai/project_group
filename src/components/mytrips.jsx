import React, { useEffect, useState } from "react";
import "./styles/mytrips.css";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return;

    fetch(`http://localhost:5000/my-trips/${rider.id}`)
      .then((res) => res.json())
      .then((data) => setTrips(data));
  }, []);

  return (
    <div className="trips-container">
      <h1 className="page-title">My Trips</h1>

      {trips.length === 0 && <p>No trips found</p>}

      <div className="trips-grid">
        {trips.map((trip) => (
          <div className="trip-card" key={trip.id}>
            <h2>Trip #{trip.id}</h2>

            <p><strong>Food:</strong> {trip.food_type}</p>
            <p><strong>Qty:</strong> {trip.quantity}</p>
            <p><strong>Address:</strong> {trip.location}</p>
            <p><strong>Status:</strong> {trip.status}</p>
            <p><strong>Picked On:</strong> {trip.created_at}</p>

            {trip.status === "completed" && (
              <p className="completed-info">Delivery Completed ✔</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
