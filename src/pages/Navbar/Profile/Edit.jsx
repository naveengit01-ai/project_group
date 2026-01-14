import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Edit() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: ""
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  /* 🚨 Guard */
  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  /* Fetch user data */
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${BASE_URL}/get-user-by-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.status === "success") {
          setForm({
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            phone: data.user.phone || ""
          });
        } else {
          setError(data.status);
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    if (email) fetchUser();
  }, [email]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form })
      });

      const data = await res.json();

      if (data.status === "updated_successfully") {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, ...data.user })
        );
        navigate("/afterlogin/profile");
      } else {
        setError(data.status);
      }
    } catch {
      setError("Update failed");
    } finally {
      setUpdating(false);
    }
  };

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

      {/* Edit Card */}
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
            Edit Profile
          </h1>
          <p className="text-sm text-emerald-400 mt-1">
            Keep your details up to date 💚
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full px-4 py-3 rounded-xl
                       bg-black/40 text-white
                       border border-white/20
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full px-4 py-3 rounded-xl
                       bg-black/40 text-white
                       border border-white/20
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full px-4 py-3 rounded-xl
                       bg-black/40 text-white
                       border border-white/20
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            value={email || ""}
            disabled
            className="w-full px-4 py-3 rounded-xl
                       bg-white/10 text-gray-400
                       border border-white/20 cursor-not-allowed"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={updating}
            className={`w-full py-3 rounded-xl font-semibold text-black
              ${updating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-400 hover:bg-emerald-300"
              }`}
          >
            {updating ? "Updating..." : "Update Profile"}
          </motion.button>
        </form>
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
