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

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 📍 Location for rider
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

  const handleSubmit = async e => {
    e.preventDefault();

    // 🔐 Username validation
    if (!form.username || form.username.length < 6) {
      alert("Username must be at least 6 characters");
      return;
    }

    // Rider must have location
    if (
      form.user_type === "rider" &&
      (!form.latitude || !form.longitude)
    ) {
      alert("Please allow location access");
      return;
    }

    setLoading(true);

    const res = await signup(form);

    if (res.status === "signup_success_otp_sent") {
      alert("OTP sent 📩");
      setEmail(form.email);
      navigate("/verify-otp");
    } else {
      alert(res.status);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Create Account</h2>
          <p className="text-sm text-gray-500">
            Join DWJD and reduce food waste 🌱
          </p>
        </div>

        {/* USERNAME */}
        <input
          className="input"
          name="username"
          placeholder="Username (min 6 chars)"
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <input className="input" name="first_name" placeholder="First name" onChange={handleChange} />
          <input className="input" name="last_name" placeholder="Last name" onChange={handleChange} />
        </div>

        <input className="input" name="phone" placeholder="Phone number" onChange={handleChange} />
        <input className="input" name="email" placeholder="Email address" onChange={handleChange} />

        <select name="user_type" className="input bg-white" onChange={handleChange}>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        {/* 📍 RIDER LOCATION */}
        {form.user_type === "rider" && (
          <div className="space-y-2">
            <input className="input" placeholder="Latitude" value={form.latitude} disabled />
            <input className="input" placeholder="Longitude" value={form.longitude} disabled />

            <button
              type="button"
              onClick={getCurrentLocation}
              className="text-sm text-blue-600 underline"
            >
              📍 Use current location
            </button>

            <p className="text-xs text-gray-500">
              Used to show donations within 15 km
            </p>
          </div>
        )}

        <input type="password" name="password" placeholder="Password" className="input" onChange={handleChange} />
        <input type="password" name="confirm_password" placeholder="Confirm password" className="input" onChange={handleChange} />

        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white
            ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
