import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

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
      } catch {
        setError("Server not reachable");
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <div className="bg-black flex items-center justify-center px-4 py-20">
        <BackgroundGlow />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10 text-green-700 font-semibold"
        >
          Loading available requests 🚴
        </motion.p>
      </div>
    );
  }

  /* ===== ERROR ===== */
  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center px-4">
        <BackgroundGlow />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 text-red-400 font-semibold"
        >
          {error}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen overflow-hidden px-4 py-1">
      <BackgroundGlow />

      <motion.div
        initial={{ opacity: 10, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">
            Available Pickups 🚴
          </h1>
          <p className="text-sm text-emerald-400 mt-1">
            Tap a request to start pickup
          </p>
        </div>

        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl
                       border border-white/20
                       rounded-2xl p-8 text-center
                       text-gray-300"
          >
            No available requests right now.
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {list.map((d, i) => (
              <PickupCard
                key={d._id}
                donation={d}
                index={i}
                onClick={() =>
                  navigate("/afterlogin/pickup/direction", {
                    state: { donation: d }
                  })
                }
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ===== CARD ===== */
function PickupCard({ donation, onClick, index }) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer
                 bg-white/10 backdrop-blur-xl
                 border border-white/20
                 rounded-2xl p-6
                 shadow-xl"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-bold text-lg text-white">
          {donation.item_type.toUpperCase()} – {donation.item_name}
        </h2>

        <span className="px-3 py-1 rounded-full
                         bg-emerald-500/20 text-emerald-400
                         text-xs font-semibold">
          Available
        </span>
      </div>

      <p className="text-sm text-gray-400 mt-3">
        Quantity: {donation.quantity}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        📍 {donation.pickup_location}
      </p>

      <p className="text-xs text-gray-500 mt-3">
        Requested on {new Date(donation.createdAt).toLocaleString()}
      </p>
    </motion.div>
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
