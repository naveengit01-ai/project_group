import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Direction() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const donation = state?.donation;
  const user = JSON.parse(localStorage.getItem("user")); // rider

  const [picked, setPicked] = useState(
    donation?.donation_status === "picked"
  );
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!donation) {
    return (
      <p className="text-red-600">
        Donation data missing. Please go back.
      </p>
    );
  }

  /* GOOGLE MAP LINK */
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    donation.pickup_location
  )}`;

  /* ================= PICKUP (LOCK DONATION) ================= */
  const handlePickup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/rider/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: donation._id,
          rider_email: user.email
        })
      });

      const data = await res.json();

      if (data.status === "pickup_locked") {
        alert("Pickup locked successfully ✅");
        setPicked(true); // show Verify OTP button
      } else {
        alert(data.status);
      }
    } catch (err) {
      alert("Server error");
    }
    setLoading(false);
  };

  /* ================= REJECT PICKUP ================= */
  const handleReject = async () => {
    if (!reason.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/rider/reject-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: donation._id,
          rider_email: user.email,
          reason
        })
      });

      const data = await res.json();

      if (data.status === "pickup_rejected") {
        alert("Pickup rejected ❌");
        navigate("/afterlogin/pickup/requests");
      } else {
        alert(data.status);
      }
    } catch (err) {
      alert("Server error");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold">
          Navigate to Pickup 📍
        </h1>
        <p className="text-gray-500 mt-1">
          Reach the donor and confirm the item
        </p>
      </div>

      {/* DONATION DETAILS */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-1">
        <p className="font-semibold text-lg">
          {donation.item_type.toUpperCase()} – {donation.item_name}
        </p>
        <p className="text-sm text-gray-600">
          Quantity: {donation.quantity}
        </p>
        <p className="text-sm text-gray-600">
          📍 {donation.pickup_location}
        </p>
      </div>

      {/* MAP */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-blue-600 text-white
                   py-4 rounded-2xl font-bold hover:bg-blue-700 transition"
      >
        Open Google Maps Navigation 🧭
      </a>

      {/* ACTIONS */}
      {!picked ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={loading}
            onClick={handlePickup}
            className={`py-4 rounded-2xl text-white font-bold
              ${loading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {loading ? "Locking..." : "Pickup"}
          </button>

          <button
            onClick={() => setShowReject(true)}
            className="py-4 rounded-2xl bg-red-600 text-white
                       font-bold hover:bg-red-700 transition"
          >
            Not Picked ❌
          </button>
        </div>
      ) : (
        <button
          onClick={() =>
            navigate("/afterlogin/pickup/verify", {
              state: { donation_id: donation._id }
            })
          }
          className="w-full py-4 rounded-2xl bg-green-600 text-white
                     font-bold hover:bg-green-700 transition"
        >
          Verify OTP ✅
        </button>
      )}

      {/* REJECTION FORM */}
      {showReject && (
        <div className="space-y-3">
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for not picking the item"
            className="input min-h-[100px]"
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={loading}
              onClick={handleReject}
              className={`py-3 rounded-xl text-white font-bold
                ${loading
                  ? "bg-gray-400"
                  : "bg-red-600 hover:bg-red-700"
                }`}
            >
              Submit Reason
            </button>

            <button
              onClick={() => setShowReject(false)}
              className="py-3 rounded-xl bg-gray-200
                         font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="block mx-auto text-sm text-gray-500 hover:text-black transition"
      >
        ← Back
      </button>
    </div>
  );
}
