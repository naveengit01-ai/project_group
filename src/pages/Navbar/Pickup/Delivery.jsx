import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Delivery() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const donation = state?.donation;
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);

  if (!donation) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center px-4">
        <BackgroundGlow />
        <p className="relative z-10 text-red-400 font-semibold">
          Delivery data missing. Please go back.
        </p>
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
        navigate("/afterlogin/pickup/my-rides");
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
            Completing delivery…
          </motion.p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg
                   bg-white/10 backdrop-blur-xl
                   border border-white/20
                   rounded-3xl shadow-2xl
                   p-8 space-y-6"
      >
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Complete Delivery 🚚
          </h1>
          <p className="text-sm text-emerald-400 mt-1">
            Confirm once food is safely delivered
          </p>
        </div>

        {/* INFO */}
        <div className="bg-white/5 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-white">
            {donation.item_type.toUpperCase()} – {donation.item_name}
          </p>
          <p className="text-sm text-gray-400">
            Quantity: {donation.quantity}
          </p>
          <p className="text-sm text-gray-400">
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
          className={`w-full py-4 rounded-2xl font-bold transition
            ${loading
              ? "bg-gray-500 text-black cursor-not-allowed"
              : "bg-emerald-400 text-black hover:bg-emerald-300"
            }`}
        >
          Mark as Delivered ✅
        </button>

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
