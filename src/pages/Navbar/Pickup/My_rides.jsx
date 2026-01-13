import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function MyRides() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRides() {
      try {
        const res = await fetch(`${BASE_URL}/rider/my-rides`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rider_email: user.email })
        });

        const data = await res.json();
        if (data.status === "success") {
          setRides(data.rides);
        }
      } catch (err) {
        console.error("Fetch rides error");
      }
      setLoading(false);
    }

    fetchRides();
  }, [user.email]);

  if (loading) {
    return <p className="text-gray-500">Loading your rides...</p>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-2">
        My Rides 🚴‍♂️
      </h1>
      <p className="text-gray-500 mb-6">
        Picked & delivered donations
      </p>

      {rides.length === 0 ? (
        <p className="text-gray-600">No rides yet.</p>
      ) : (
        <div className="space-y-4">
          {rides.map(ride => (
            <RideCard
              key={ride._id}
              ride={ride}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= CARD ================= */
function RideCard({ ride, navigate }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
      <div>
        <h2 className="font-bold text-lg">
          {ride.item_type.toUpperCase()} – {ride.item_name}
        </h2>

        <p className="text-sm text-gray-500">
          Quantity: {ride.quantity}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          📍 {ride.pickup_location}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Status:{" "}
          <span className="font-semibold capitalize">
            {ride.donation_status.replace("_", " ")}
          </span>
        </p>
      </div>

      {/* 🔥 FINAL CORRECT ACTION LOGIC */}
      {ride.donation_status === "picked" && !ride.is_verified && (
        <button
          onClick={() =>
            navigate("/afterlogin/pickup/direction", {
              state: { donation: ride }
            })
          }
          className="px-4 py-2 rounded-xl bg-yellow-500 text-white
                     font-semibold hover:bg-yellow-600 transition"
        >
          Continue Pickup
        </button>
      )}

      {ride.donation_status === "picked" && ride.is_verified && (
        <button
          onClick={() =>
            navigate("/afterlogin/pickup/delivery", {
              state: { donation: ride }
            })
          }
          className="px-4 py-2 rounded-xl bg-blue-600 text-white
                     font-semibold hover:bg-blue-700 transition"
        >
          Continue Delivery
        </button>
      )}

      {ride.donation_status === "delivered" && (
        <span className="px-4 py-1 rounded-full text-sm font-semibold
                         bg-green-100 text-green-800">
          Delivered
        </span>
      )}
    </div>
  );
}
