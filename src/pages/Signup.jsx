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
    password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

    setLoading(true);

    try {
      const res = await signup({ ...form, user_type: "user" });

      if (res.status === "signup_success_otp_sent" || res.status === "otp_resent") {
        alert("OTP sent to your email 📩");
        setEmail(form.email);
        navigate("/verify-otp");
      } else if (res.status === "user_exists") {
        alert("Email already registered. Please login.");
        navigate("/login");
      } else {
        alert(res.status);
      }
    } catch {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl
                   border border-white/20 rounded-2xl p-8 space-y-4"
      >
        <h2 className="text-3xl font-bold text-center text-white">
          Create User Account
        </h2>

        <input className="glass-input" name="username" placeholder="Username" onChange={handleChange} />
        <input className="glass-input" name="first_name" placeholder="First name" onChange={handleChange} />
        <input className="glass-input" name="last_name" placeholder="Last name" onChange={handleChange} />
        <input className="glass-input" name="phone" placeholder="Phone" onChange={handleChange} />
        <input className="glass-input" name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" className="glass-input" name="password" placeholder="Password" onChange={handleChange} />
        <input type="password" className="glass-input" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} />

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-400 text-black font-semibold"
        >
          {loading ? "Sending OTP..." : "Create Account"}
        </button>

        <p className="text-center text-gray-300 text-sm">
          Already registered?{" "}
          <span onClick={() => navigate("/login")} className="text-emerald-400 cursor-pointer">
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
