import { useEffect, useState } from "react";

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
      <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

        <p className="relative z-10 text-gray-300 text-lg animate-pulse">
          Loading overview...
        </p>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (!stats) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-black to-black" />
        <p className="relative z-10 text-red-400 text-lg">
          Failed to load data
        </p>
      </div>
    );
  }

  /* ================= MAIN ================= */
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Content */}
      <div className="relative z-10 px-6 pt-32 pb-20 text-white max-w-7xl mx-auto">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Platform Overview 📊
          </h1>
          <p className="text-gray-400 mt-2">
            Real-time snapshot of your platform
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} color="emerald" />
          <StatCard title="Total Riders" value={stats.totalRiders} color="cyan" />
          <StatCard
            title="Deliveries Completed"
            value={stats.delivered}
            color="green"
          />
          <StatCard
            title="Rejected Pickups"
            value={stats.rejected}
            color="red"
          />
          <StatCard
            title="Active Promotions"
            value={stats.activeAds}
            color="yellow"
          />
        </div>
      </div>
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
    <div
      className="bg-white/10 backdrop-blur-xl
                 border border-white/20 rounded-3xl
                 p-8 shadow-2xl
                 hover:scale-[1.02] transition-transform duration-200"
    >
      <span className="text-gray-400 text-sm">
        {title}
      </span>

      <div className={`mt-2 text-4xl font-extrabold ${colors[color]}`}>
        {value}
      </div>
    </div>
  );
}
