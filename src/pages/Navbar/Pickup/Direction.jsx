import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Direction() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const donation = state?.donation;
  const user = JSON.parse(localStorage.getItem("user"));

  const [picked, setPicked] = useState(
    donation?.donation_status === "picked"
  );
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!donation) {
    return (
      <div className="bg-blackflex items-center  px-4">
        <BackgroundGlow />
        <p className="relative z-10 text-red-400 font-semibold">
          Donation data missing. Please go back.
        </p>
      </div>
    );
  }

  /* GOOGLE MAP LINK */
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    donation.pickup_location
  )}`;

  /* ================= PICKUP ================= */
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
        setPicked(true);
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REJECT ================= */
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
        navigate("/afterlogin/pickup/requests");
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black flex items-center justify-center px-4">
      <BackgroundGlow />

      {/* LOADING OVERLAY */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20
                     bg-black/70 backdrop-blur
                     flex items-center justify-center"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-emerald-400 font-semibold"
          >
            Processing pickup…
          </motion.p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl
                   bg-white/10 backdrop-blur-xl
                   border border-white/20
                   rounded-3xl shadow-2xl
                   p-8 space-y-6"
      >
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Navigate to Pickup 📍
          </h1>
          <p className="text-sm text-emerald-400 mt-1">
            Reach the donor and confirm the item
          </p>
        </div>

        {/* DETAILS */}
        <div className="bg-white/5 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-lg text-white">
            {donation.item_type.toUpperCase()} – {donation.item_name}
          </p>
          <p className="text-sm text-gray-400">
            Quantity: {donation.quantity}
          </p>
          <p className="text-sm text-gray-400">
            📍 {donation.pickup_location}
          </p>
        </div>

        {/* MAP */}
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center
                     bg-blue-600 text-white
                     py-4 rounded-2xl font-bold
                     hover:bg-blue-500 transition"
        >
          Open Google Maps Navigation 🧭
        </a>

        {/* ACTIONS */}
        {!picked ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={loading}
              onClick={handlePickup}
              className={`py-4 rounded-2xl font-bold
                ${loading
                  ? "bg-gray-500 text-black"
                  : "bg-emerald-400 text-black hover:bg-emerald-300"
                }`}
            >
              Pickup
            </button>

            <button
              onClick={() => setShowReject(true)}
              className="py-4 rounded-2xl
                         bg-red-600 text-white
                         font-bold hover:bg-red-500 transition"
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
            className="w-full py-4 rounded-2xl
                       bg-emerald-400 text-black
                       font-bold hover:bg-emerald-300 transition"
          >
            Verify OTP ✅
          </button>
        )}

        {/* REJECT FORM */}
        {showReject && (
          <div className="space-y-3">
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for not picking the item"
              className="w-full min-h-[100px]
                         bg-black/40 text-white
                         border border-white/20
                         rounded-xl p-3
                         focus:outline-none focus:ring-2
                         focus:ring-red-500"
            />

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={loading}
                onClick={handleReject}
                className={`py-3 rounded-xl font-bold
                  ${loading
                    ? "bg-gray-500 text-black"
                    : "bg-red-600 text-white hover:bg-red-500"
                  }`}
              >
                Submit Reason
              </button>

              <button
                onClick={() => setShowReject(false)}
                className="py-3 rounded-xl
                           bg-white/20 text-white
                           font-semibold hover:bg-white/30 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto text-sm
                     text-gray-400 hover:text-white transition"
        >
          ← Back
        </button>
      </motion.div>
    </div>
  );
}

/* ===== SAME BACKGROUND GLOW ===== */
function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    </>
  );
}
