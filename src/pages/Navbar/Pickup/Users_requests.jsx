import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function UsersRequests() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch(`${BASE_URL}/rider/available-pickups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if (data.status === "success") {
          setList(data.donations || []);
        } else {
          setError("Failed to load requests");
        }
      } catch (err) {
        setError("Server not reachable");
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-gray-500 animate-pulse">
        Loading available requests...
      </p>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <p className="text-red-600 font-semibold">
        {error}
      </p>
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-extrabold mb-2">
        Available Pickups 🚴
      </h1>

      <p className="text-gray-500 mb-6">
        Tap a request to start pickup
      </p>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl p-6 shadow text-center text-gray-600">
          No available requests right now.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {list.map(d => (
            <PickupCard
              key={d._id}
              donation={d}
              onClick={() =>
                navigate("/afterlogin/pickup/direction", {
                  state: { donation: d }
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= CARD ================= */
function PickupCard({ donation, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-2xl shadow
                 hover:shadow-xl hover:-translate-y-1
                 transition cursor-pointer border"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-bold text-lg">
          {donation.item_type.toUpperCase()} – {donation.item_name}
        </h2>

        <span className="px-3 py-1 rounded-full
                         bg-green-100 text-green-800
                         text-xs font-semibold">
          Available
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Quantity: {donation.quantity}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        📍 {donation.pickup_location}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        Requested on{" "}
        {new Date(donation.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
