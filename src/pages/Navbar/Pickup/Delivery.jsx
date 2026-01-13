import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Delivery() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const donation = state?.donation;
  const user = JSON.parse(localStorage.getItem("user")); // rider

  const [loading, setLoading] = useState(false);

  if (!donation) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Delivery data missing. Please go back.
      </div>
    );
  }

  /* ================= MARK AS DELIVERED ================= */
  const handleDelivered = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/rider/mark-delivered`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: donation._id,
          rider_email: user.email
        })
      });

      const data = await res.json();

      if (data.status === "delivered_success") {
        alert("Delivered successfully ✅");

        // ✅ FINAL STEP → MY RIDES
        navigate("/afterlogin/pickup/my-rides");
      } else {
        alert(data.status);
      }
    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">
            Complete Delivery 🚚
          </h1>
          <p className="text-gray-500 mt-1">
            Confirm once food is safely delivered
          </p>
        </div>

        {/* INFO */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <p className="font-semibold">
            {donation.item_type.toUpperCase()} – {donation.item_name}
          </p>
          <p className="text-sm text-gray-600">
            Quantity: {donation.quantity}
          </p>
          <p className="text-sm text-gray-600">
            Pickup Location:
          </p>
          <p className="text-xs text-gray-500">
            {donation.pickup_location}
          </p>
        </div>

        {/* DELIVER BUTTON */}
        <button
          disabled={loading}
          onClick={handleDelivered}
          className={`w-full py-4 rounded-2xl text-white font-bold transition
            ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Updating..." : "Mark as Delivered ✅"}
        </button>

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto text-sm text-gray-500 hover:text-black transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
