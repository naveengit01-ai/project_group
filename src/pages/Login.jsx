import { useState } from "react";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    user_type: "user",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.status === "login_success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // alert("Login successful 🚀");
        navigate("/afterlogin");
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl
                   bg-white/10 backdrop-blur-xl border border-white/20
                   shadow-2xl space-y-6 animate-fadeIn"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Welcome Back 👋
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Login to continue saving food
          </p>
        </div>

        {/* Email */}
        <input
          name="email"
          placeholder="Email address"
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl bg-black/40 text-white
                     border border-white/20 focus:outline-none
                     focus:ring-2 focus:ring-emerald-500 transition"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl bg-black/40 text-white
                     border border-white/20 focus:outline-none
                     focus:ring-2 focus:ring-emerald-500 transition"
        />

        {/* Role */}
        <select
          name="user_type"
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-black/40 text-white
                     border border-white/20 focus:outline-none
                     focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        {/* Button */}
        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-black
            transition-all duration-200
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-400 hover:bg-emerald-300 active:scale-[0.97]"
            }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Signup */}
        <p className="text-sm text-center text-gray-300">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-emerald-400 font-semibold cursor-pointer hover:underline"
          >
            Create one
          </span>
        </p>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400">
          Secure login • DWJD Platform
        </p>
      </form>
    </div>
  );
}
