import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const [loading, setLoading] = useState(true);

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

      {/* Contact Card */}
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
            Contact DWJD
          </h1>

          <p className="text-gray-300 text-lg">
            Don’t Waste. Just Donate.
          </p>

          <p className="text-emerald-400 font-semibold text-xl mt-2">
            “Real change begins with a simple conversation.”
          </p>
        </div>

        {/* ===== DIVIDER ===== */}
        <div className="h-px bg-white/20" />

        {/* ===== CONTACT INFO ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 text-center">
          <ContactItem
            label="Email"
            value="kolanaveen797@"
            sub="Support, queries & partnerships"
          />

          <ContactItem
            label="Phone"
            value="+91 6309502549"
            sub="Mon–Sat • 10 AM – 6 PM"
          />

          <ContactItem
            label="Location"
            value="India, Ongole"
            sub="Serving communities nationwide"
          />
        </div>

        {/* ===== FOOTER ===== */}
        <p className="text-center text-sm text-gray-400 pt-6">
          DWJD • A community-driven food donation initiative
        </p>
      </motion.div>
    </div>
  );
}

/* ===== CONTACT ITEM ===== */
function ContactItem({ label, value, sub }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-white/10 backdrop-blur-xl
                 rounded-xl p-6 border border-white/20
                 hover:border-emerald-400/40 transition"
    >
      <p className="text-sm uppercase tracking-widest text-gray-300">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-400">
        {sub}
      </p>
    </motion.div>
  );
}

/* ===== SAME BACKGROUND GLOW AS OTHER PAGES ===== */
function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    </>
  );
}
