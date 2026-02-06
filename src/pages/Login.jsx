import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    user_type: "user",
  });

  const [loading, setLoading] = useState(false);

  /* 🔁 AUTO REDIRECT IF ALREADY LOGGED IN */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/afterlogin");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

      /* ✅ LOGIN SUCCESS */
      if (data.status === "login_success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/afterlogin");
      }

      /* ⚠️ EMAIL NOT VERIFIED → OTP PAGE */
      else if (data.status === "otp_required") {
        alert("Please verify your email with OTP 📩");
        localStorage.setItem("verifyEmail", form.email);
        navigate("/verify-otp");
      }

      /* ❌ OTHER CASES */
      else {
        alert(data.status);
      }

    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl
                   bg-white/10 backdrop-blur-xl border border-white/20
                   shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Welcome Back 👋
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Login to continue
          </p>
        </div>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
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
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl bg-black/40 text-white
                     border border-white/20 focus:outline-none
                     focus:ring-2 focus:ring-emerald-500 transition"
        />

        {/* Role */}
        <select
          name="user_type"
          value={form.user_type}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-black/40 text-white
                     border border-white/20 focus:outline-none
                     focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        {/* Login Button */}
        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-black
            transition-all
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
