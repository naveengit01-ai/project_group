import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Home from "./../Home";

export default function DonationsType() {
  const navigate = useNavigate();

  return (
    <div className="bg-black px-4 py-12 flex justify-center">
      <BackgroundGlow />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 max-w-6xl w-full"
      >
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            What would you like to donate?
          </h1>
          <p className="mt-2 text-emerald-400">
            Choose a category to continue your donation
          </p>
        </div>

        {/* CARDS */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <DonateCard
            title="Food"
            desc="Donate surplus cooked or packed food"
            accent="emerald"
            onClick={() => navigate("/afterlogin/donate/food")}
          />

          <DonateCard
            title="Clothes"
            desc="Donate wearable clothes in good condition"
            accent="blue"
            onClick={() => navigate("/afterlogin/donate/clothes")}
          />

          <DonateCard
            title="Other"
            desc="Donate essentials like books, utensils, etc."
            accent="purple"
            onClick={() => navigate("/afterlogin/donate/other")}
          />
        </motion.div>

        {/* 👇 1 inch gap + HOME (SPONSORSHIPS) */}
        <div className="mt-8">
          <Home />
        </div>
      </motion.div>
    </div>
  );
}

/* ===== CARD ===== */
function DonateCard({ title, desc, accent, onClick }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group cursor-pointer
                 bg-white/10 backdrop-blur-xl
                 border border-white/20
                 rounded-2xl p-6
                 shadow-xl relative overflow-hidden"
    >
      {/* GLOW */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100
          transition duration-500
          bg-${accent}-500/20`}
      />

      <h2 className="relative z-10 text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="relative z-10 mt-2 text-sm text-gray-300">
        {desc}
      </p>

      <motion.div
        className="relative z-10 mt-6 inline-flex items-center
                   text-sm font-semibold text-white"
        initial={{ x: 0 }}
        whileHover={{ x: 6 }}
      >
        Continue
        <span className="ml-1">→</span>
      </motion.div>
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
