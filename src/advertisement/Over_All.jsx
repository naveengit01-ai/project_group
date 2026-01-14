import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Over_All() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD OVERVIEW ================= */
  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/overview`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin overview", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading overview...
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Failed to load data
      </div>
    );
  }

  /* ================= MAIN ================= */
  return (
    <div className="min-h-screen w-screen text-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 pt-20 pb-24"
      >
        {/* TITLE */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Platform Overview 📊
          </h1>
          <p className="text-gray-400 mt-2">
            Real-time snapshot of your platform
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} color="emerald" />
          <StatCard title="Total Riders" value={stats.totalRiders} color="cyan" />
          <StatCard title="Deliveries Completed" value={stats.delivered} color="green" />
          <StatCard title="Rejected Pickups" value={stats.rejected} color="red" />
          <StatCard title="Active Promotions" value={stats.activeAds} color="yellow" />
        </div>
      </motion.div>
    </div>
  );
}

/* ================= CARD ================= */

function StatCard({ title, value, color }) {
  const colors = {
    emerald: "text-emerald-300",
    cyan: "text-cyan-300",
    green: "text-green-300",
    red: "text-red-300",
    yellow: "text-yellow-300",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="rounded-3xl p-8
                 bg-white/10
                 border border-white/20
                 backdrop-blur-xl
                 shadow-[0_0_40px_rgba(0,0,0,0.55)]"
    >
      <span className="text-gray-400 text-sm">
        {title}
      </span>

      <div className={`mt-3 text-4xl font-extrabold ${colors[color]}`}>
        {value}
      </div>
    </motion.div>
  );
}
