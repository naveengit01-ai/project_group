import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";

const BASE_URL = "https://back-end-project-group.onrender.com";
// const BASE_URL = "http://localhost:10000"; 
// 👉 use localhost while developing
export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_name: "",
    password: "",
    user_type: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.user_name || !form.password || !form.user_type) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await res.json();

      /* ================= BACKEND STATUS HANDLING ================= */

      if (data.status === "not_verified") {
        alert("Please verify your account using OTP first");
        navigate("/signup");
        return;
      }

      if (data.status !== "success") {
        alert("Invalid username, password, or role");
        return;
      }

      /* ================= SAVE SESSION ================= */
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);

      /* ================= REDIRECT ================= */
      navigate("/");

    } catch (err) {
      console.error("Login error:", err);
      alert("Server error during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginWrapper">
      <form className="loginCard" onSubmit={handleLogin}>

        <h2 className="loginTitle">Welcome Back</h2>
        <p className="loginSubtitle">Login to continue</p>

        <input
          className="loginInput"
          name="user_name"
          placeholder="Username"
          value={form.user_name}
          onChange={handleChange}
        />

        <input
          className="loginInput"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <select
          className="loginSelect"
          name="user_type"
          value={form.user_type}
          onChange={handleChange}
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        <button className="loginBtn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* 🔥 SIGNUP LINK */}
        <p className="signup-link">
          New user?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="signup-text"
          >
            Create account
          </span>
        </p>

      </form>
    </div>
  );
}
