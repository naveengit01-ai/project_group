import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email;

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`${BASE_URL}/get-user-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setUser(data.user);
      }
    }
    fetchUser();
  }, [email]);

  /* 🔄 Loading Impact Animation */
  if (!user) {
    return (
      <div className="flex items-center justify-center bg-black overflow-hidden">
        <BackgroundGlow />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative z-10 text-emerald-400 font-semibold text-lg"
        >
          Loading your impact 🌱
        </motion.p>
      </div>
    );
  }

  return (
    <div className="bg-black overflow-hidden flex justify-center items-start px-4 py-12">
      <BackgroundGlow />

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl
                   bg-white/10 backdrop-blur-xl border border-white/20
                   rounded-2xl shadow-2xl p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            My Profile
          </h1>
          <p className="text-sm text-emerald-400 mt-1">
            Don’t Waste. Just Donate. 💚
          </p>
        </div>

        {/* Profile Details */}
        <ProfileRow label="First Name" value={user.first_name} />
        <ProfileRow label="Last Name" value={user.last_name} />
        <ProfileRow label="Email" value={user.email} />
        <ProfileRow label="Phone" value={user.phone} />
        <ProfileRow label="Role" value={user.user_type} />

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/afterlogin/profile/edit")}
          className="w-full py-3 rounded-xl font-semibold text-black
                     bg-emerald-400 hover:bg-emerald-300 transition"
        >
          Edit Profile ✏️
        </motion.button>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400">
          Every profile here represents a real-world impact 🌍
        </p>
      </motion.div>
    </div>
  );
}

/* 🔹 Reusable Row */
function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between items-center
                    border-b border-white/10 pb-3">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

/* 🌈 Background Glow (same family as Login UI) */
function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    </>
  );
}
