import React, { useState } from "react";
import "./styles/Login.css";

const BASE_URL = "https://back-end-project-group.onrender.com";
// for local testing:
// const BASE_URL = "http://localhost:5000";

export default function Login({ onLogin }) {
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user"); // ✅ LOCKED

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user_name.trim() || !password.trim()) {
      alert("Username and password are required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        alert("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(
        "Login failed.\n\n" +
        "Possible reasons:\n" +
        "- Backend sleeping (Render)\n" +
        "- Server error\n\n" +
        "Try again or refresh."
      );
    }
  };

  return (
    <div className="loginWrapper">
      {/* Glow Background */}
      <div className="glow glow1"></div>
      <div className="glow glow2"></div>
      <div className="glow glow3"></div>

      <form className="loginCard" onSubmit={handleSubmit}>
        <h2 className="loginTitle">Welcome Back</h2>
        <p className="loginSubtitle">Log in to continue your donations</p>

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

        {/* Role locked until rider signup exists */}
        <select
          value={userType}
          className="loginSelect"
          disabled
        >
          <option value="user">User</option>
        </select>

        <button className="loginBtn">Login</button>
      </form>
    </div>
  );
}
