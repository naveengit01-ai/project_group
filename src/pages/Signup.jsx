import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";

export default function Signup({ setEmail }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    user_type: "user",
    password: "",
    confirm_password: "",
    latitude: "",
    longitude: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* 📍 GET LOCATION FOR RIDER */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
      },
      () => alert("Location permission denied")
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async e => {
    e.preventDefault();

    if (form.username.length < 6) {
      alert("Username must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    if (
      form.user_type === "rider" &&
      (!form.latitude || !form.longitude)
    ) {
      alert("Please allow location access");
      return;
    }

    setLoading(true);

    try {
      const res = await signup(form);

      if (res.status === "signup_success_otp_sent") {
        alert("OTP sent to your email 📩");
        setEmail(form.email);
        navigate("/verify-otp");
      } else {
        alert(res.status);
      }
    } catch {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl
                   bg-white/10 backdrop-blur-xl border border-white/20
                   shadow-2xl space-y-4 animate-fadeIn"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-white">
            Create Account ✨
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Verify email to activate account
          </p>
        </div>

        {/* Inputs */}
        <input
          className="glass-input"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="glass-input"
            name="first_name"
            placeholder="First name"
            onChange={handleChange}
          />
          <input
            className="glass-input"
            name="last_name"
            placeholder="Last name"
            onChange={handleChange}
          />
        </div>

        <input
          className="glass-input"
          name="phone"
          placeholder="Phone number"
          onChange={handleChange}
        />

        <input
          className="glass-input"
          name="email"
          placeholder="Email address"
          onChange={handleChange}
        />

        <select
          name="user_type"
          className="glass-input"
          onChange={handleChange}
        >
          <option value="user" >User</option>
          <option value="rider">Rider</option>
        </select>

        {/* Rider Location */}
        {form.user_type === "rider" && (
          <div className="space-y-2">
            <input
              className="glass-input"
              placeholder="Latitude"
              value={form.latitude}
              disabled
            />
            <input
              className="glass-input"
              placeholder="Longitude"
              value={form.longitude}
              disabled
            />

            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full py-2 rounded-lg text-sm
                         bg-emerald-500/20 text-emerald-300
                         hover:bg-emerald-500/30 transition"
            >
              📍 Use current location
            </button>
          </div>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="glass-input"
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm password"
          className="glass-input"
          onChange={handleChange}
        />

        {/* Button */}
        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-black transition-all
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-400 hover:bg-emerald-300 active:scale-[0.97]"
            }`}
        >
          {loading ? "Sending OTP..." : "Create Account"}
        </button>

        {/* Login */}
        <p className="text-sm text-center text-gray-300">
          Already verified?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-emerald-400 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
