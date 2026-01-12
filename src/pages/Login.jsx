import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";


export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        user_type: "user"
    });
    
    const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.status === "login_success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful 🚀");
        navigate("/afterlogin");
        // later → navigate to dashboard
      } else {
        alert(data.status);
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 animate-gradient" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg
                   rounded-2xl shadow-2xl p-8 space-y-6
                   animate-slideUp"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500">
            Login to continue saving food 🌱
          </p>
        </div>

        {/* Email */}
        <input
          className="input"
          name="email"
          placeholder="Email address"
          onChange={handleChange}
        />

        {/* Password */}
        <input
          type="password"
          className="input"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {/* Role */}
        <select
          name="user_type"
          onChange={handleChange}
          className="input bg-white"
        >
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        {/* Button */}
        <button
  disabled={loading}
  className={`w-full py-3 rounded-xl font-semibold text-white
    transition-all duration-200
    ${loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-black hover:bg-gray-800 active:scale-[0.97]"
    }`}
>
  {loading ? "Logging in..." : "Login"}
</button>

<p className="text-sm text-center text-gray-600">
  Don’t have an account?{" "}
  <span
    onClick={() => navigate("/signup")}
    className="text-black font-semibold cursor-pointer
               hover:underline transition"
  >
    Create one
  </span>
</p>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center">
          Secure login powered by DWJD
        </p>
      </form>
    </div>
  );
}
