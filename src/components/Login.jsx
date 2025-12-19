import React, { useState } from "react";
import "./styles/Login.css";

// 👉 change to http://localhost:5000 for local testing
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Login({ onLogin }) {
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(""); // user | rider

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations
    if (!user_name.trim() || !password.trim()) {
      alert("Username and password are required");
      return;
    }

    if (!userType) {
      alert("Please select User or Rider");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // ✅ REQUIRED FOR COOKIES
        body: JSON.stringify({
          user_name,
          password,
          user_type: userType
        })
      });

      if (!res.ok) {
        throw new Error("Server not responding");
      }

      const data = await res.json();

      if (data.status === "success") {
        // ✅ Cookie is set by backend
        // Pass user info only for UI state (not storage)
        onLogin(data.user);
      } else {
        alert("Invalid username, password, or role");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(
        "Login failed.\n\n" +
        "Possible reasons:\n" +
        "- Backend sleeping (Render)\n" +
        "- Cookie / CORS issue\n" +
        "- Network problem\n\n" +
        "Try again."
      );
    }
  };

  return (
    <div className="loginWrapper">
      {/* Background Glow Effects */}
      <div className="glow glow1"></div>
      <div className="glow glow2"></div>
      <div className="glow glow3"></div>

      <form className="loginCard" onSubmit={handleSubmit}>
        <h2 className="loginTitle">Welcome Back</h2>
        <p className="loginSubtitle">Log in to continue</p>

        <input
          type="text"
          placeholder="Username"
          value={user_name}
          onChange={(e) => setUsername(e.target.value)}
          className="loginInput"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="loginInput"
        />

        {/* USER / RIDER SELECT */}
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="loginSelect"
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        <button className="loginBtn">Login</button>
      </form>
    </div>
  );
}
