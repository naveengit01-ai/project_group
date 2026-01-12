import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function MyDeliveries() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const res = await fetch(`${BASE_URL}/rider/my-deliveries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rider_email: user.email
          })
        });

        const data = await res.json();

        if (data.status === "success") {
          setDeliveries(data.deliveries);
        }
      } catch (err) {
        console.error("Error fetching deliveries");
      }

      setLoading(false);
    }

    fetchDeliveries();
  }, [user.email]);

  if (loading) {
    return <p className="text-gray-500">Loading your deliveries...</p>;
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-extrabold mb-2">
        My Deliveries 📦
      </h1>
      <p className="text-gray-500 mb-6">
        Your past and ongoing pickups
      </p>

      {deliveries.length === 0 ? (
        <p className="text-gray-600">
          No deliveries yet.
        </p>
      ) : (
        <div className="space-y-4">
          {deliveries.map(d => (
            <DeliveryCard key={d._id} delivery={d} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- CARD ---------- */
function DeliveryCard({ delivery }) {
  const statusColor = {
    not_picked: "bg-yellow-100 text-yellow-800",
    picked: "bg-blue-100 text-blue-800",
    collected: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800"
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
      <div>
        <h2 className="font-bold text-lg">
          {delivery.item_type.toUpperCase()} – {delivery.item_name}
        </h2>

        <p className="text-sm text-gray-500">
          Quantity: {delivery.quantity}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {delivery.pickup_location}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {new Date(delivery.updatedAt).toLocaleString()}
        </p>
      </div>

      <span
        className={`px-4 py-1 rounded-full text-sm font-semibold
          ${statusColor[delivery.donation_status]}`}
      >
        {delivery.donation_status.replace("_", " ")}
      </span>
    </div>
  );
}
