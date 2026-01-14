import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function About() {
  const [loading, setLoading] = useState(true);

  // simple mount loading (UX polish)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  /* ===== LOADING STATE ===== */
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
          Loading your impact 🌱
        </motion.p>
      </div>
    );
  }

  return (
    <div className="bg-black overflow-hidden flex justify-center items-start px-4 py-12">
      <BackgroundGlow />

      {/* About Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl
                   bg-white/10 backdrop-blur-xl border border-white/20
                   rounded-2xl shadow-2xl p-10 space-y-10"
      >
        {/* ===== HEADER ===== */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            About DWJD
          </h1>

          <p className="text-gray-300 text-lg">
            Don’t Waste. Just Donate.
          </p>

          <p className="text-emerald-400 font-semibold text-xl mt-2">
            “Turning surplus into sustenance.”
          </p>
        </div>

        {/* ===== INTRO ===== */}
        <p className="text-gray-300 leading-relaxed text-lg">
          DWJD (Don’t Waste, Just Donate) is a community-driven platform built to
          reduce food waste and connect surplus food with people who need it the most.
          We believe that hunger is not caused by lack of food, but by lack of sharing.
        </p>

        {/* ===== MISSION ===== */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            Our Mission
          </h2>
          <p className="mt-3 text-gray-300 leading-relaxed">
            Millions of meals are wasted every day while many go hungry.
            Our mission is to bridge this gap by enabling individuals and
            organizations to donate excess food easily, responsibly, and with dignity.
          </p>
        </div>

        {/* ===== HOW IT WORKS ===== */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            How DWJD Works
          </h2>
          <ul className="mt-4 space-y-2 text-gray-300 list-disc list-inside">
            <li>Donors post surplus food through the platform.</li>
            <li>Riders pick up food from donor locations.</li>
            <li>Food is delivered to people or organizations in need.</li>
          </ul>
        </div>

        {/* ===== VALUES ===== */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            Our Values
          </h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard
              title="Sustainability"
              desc="Reducing waste to protect our planet for future generations."
            />
            <ValueCard
              title="Community"
              desc="Building a culture of shared responsibility and care."
            />
            <ValueCard
              title="Impact"
              desc="Turning small actions into meaningful change."
            />
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <p className="text-center text-sm text-gray-400 pt-6">
          Together, we can make a difference — one meal at a time.
        </p>
      </motion.div>
    </div>
  );
}

/* ===== VALUE CARD ===== */
function ValueCard({ title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-white/10 backdrop-blur-xl
                 rounded-xl p-6 border border-white/20
                 hover:border-emerald-400/40 transition"
    >
      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-300">
        {desc}
      </p>
    </motion.div>
  );
}

/* ===== SAME BACKGROUND GLOW AS MyProfile ===== */
function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    </>
  );
}
