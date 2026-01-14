import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

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
      } catch {
        console.error("Fetch rides error");
      } finally {
        setLoading(false);
      }
    }

    fetchRides();
  }, [user.email]);

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
          Loading your deliveries 🚴‍♂️
        </motion.p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen overflow-hidden px-4 py-12">
      <BackgroundGlow />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            My Rides 🚴‍♂️
          </h1>
          <p className="text-sm text-emerald-400 mt-1">
            Picked & delivered donations
          </p>
        </div>

        {rides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl
                       border border-white/20
                       rounded-2xl p-8 text-center
                       text-gray-300"
          >
            No rides yet.
          </motion.div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride, index) => (
              <RideCard
                key={ride._id}
                ride={ride}
                index={index}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ===== CARD ===== */
function RideCard({ ride, navigate, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white/10 backdrop-blur-xl
                 border border-white/20
                 rounded-2xl p-6
                 flex justify-between items-center
                 shadow-xl"
    >
      <div>
        <h2 className="font-bold text-lg text-white">
          {ride.item_type.toUpperCase()} – {ride.item_name}
        </h2>

        <p className="text-sm text-gray-400">
          Quantity: {ride.quantity}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          📍 {ride.pickup_location}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Status:{" "}
          <span className="font-semibold capitalize text-white">
            {ride.donation_status.replace("_", " ")}
          </span>
        </p>
      </div>

      {/* ACTIONS */}
      {ride.donation_status === "picked" && !ride.is_verified && (
        <button
          onClick={() =>
            navigate("/afterlogin/pickup/direction", {
              state: { donation: ride }
            })
          }
          className="px-4 py-2 rounded-xl
                     bg-yellow-500 text-black
                     font-semibold hover:bg-yellow-400 transition"
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
          className="px-4 py-2 rounded-xl
                     bg-blue-600 text-white
                     font-semibold hover:bg-blue-500 transition"
        >
          Continue Delivery
        </button>
      )}

      {ride.donation_status === "delivered" && (
        <span className="px-4 py-1 rounded-full text-sm font-semibold
                         bg-emerald-500/20 text-emerald-400">
          Delivered
        </span>
      )}
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
