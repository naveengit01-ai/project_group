import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Bike,
  CheckCircle,
  XCircle,
  Megaphone,
} from "lucide-react";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Over_All() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        Fetching dashboard intel… 🚀
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        Something broke. Backend crying 💀
      </div>
    );
  }

  /* ================= MAIN ================= */
  return (
    <div className="min-h-screen w-screen text-white bg-gradient-to-br from-black via-zinc-900 to-black relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] bg-[size:22px_22px]" />

      {/* BACK BUTTON */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        className="
          fixed top-6 left-6 z-50
          flex items-center gap-2
          px-4 py-2 rounded-xl
          bg-white/10 border border-white/20
          backdrop-blur-lg
          text-gray-200
          hover:bg-white/20
          shadow-lg
        "
      >
        <ArrowLeft size={18} />
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative max-w-7xl mx-auto px-6 pt-24 pb-28"
      >
        {/* TITLE */}
        <div className="mb-14">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Platform Overview 📊
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl">
            Real-time snapshot of users, riders, and delivery operations.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            gradient="from-emerald-500/20 to-emerald-900/30"
            color="text-emerald-300"
          />
          <StatCard
            title="Total Riders"
            value={stats.totalRiders}
            icon={Bike}
            gradient="from-cyan-500/20 to-cyan-900/30"
            color="text-cyan-300"
          />
          <StatCard
            title="Deliveries Completed"
            value={stats.delivered}
            icon={CheckCircle}
            gradient="from-green-500/20 to-green-900/30"
            color="text-green-300"
          />
          <StatCard
            title="Rejected Pickups"
            value={stats.rejected}
            icon={XCircle}
            gradient="from-red-500/20 to-red-900/30"
            color="text-red-300"
          />
          <StatCard
            title="Active Promotions"
            value={stats.activeAds}
            icon={Megaphone}
            gradient="from-yellow-500/20 to-yellow-900/30"
            color="text-yellow-300"
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ title, value, icon: Icon, gradient, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`
        relative rounded-3xl p-8 overflow-hidden
        bg-gradient-to-br ${gradient}
        border border-white/15
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
      `}
    >
      {/* Glow overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition
                      bg-gradient-to-br from-white/10 to-transparent" />

      {/* Icon */}
      <div className="mb-5 w-12 h-12 rounded-2xl
                      bg-white/10 flex items-center justify-center">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>

      <span className="text-gray-300 text-sm tracking-wide">
        {title}
      </span>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={`mt-3 text-4xl font-extrabold ${color}`}
      >
        {value}
      </motion.div>
    </motion.div>
  );
}
