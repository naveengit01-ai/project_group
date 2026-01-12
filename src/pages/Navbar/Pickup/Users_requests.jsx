import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function UsersRequests() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/rider/available-pickups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setList(data.donations);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading requests...</p>;
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-extrabold mb-2">
        Available Pickups 🚴
      </h1>
      <p className="text-gray-500 mb-6">
        Showing all available donation requests
      </p>

      {list.length === 0 ? (
        <p>No available requests right now.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {list.map(d => (
            <div
              key={d._id}
              onClick={() =>
                navigate("/afterlogin/pickup/direction", {
                  state: { donation: d }
                })
              }
              className="bg-white p-5 rounded-xl shadow
                         hover:shadow-xl transition cursor-pointer"
            >
              <h2 className="font-bold text-lg">
                {d.item_type.toUpperCase()} – {d.item_name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Quantity: {d.quantity}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {d.pickup_location}
              </p>

              <span className="inline-block mt-3 px-3 py-1 rounded-full
                               bg-green-100 text-green-800 text-xs font-semibold">
                Available
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
