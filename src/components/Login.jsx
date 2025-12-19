import React, { useState } from "react";
import "./styles/Login.css";

export default function Login({ onLogin }) {
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userType) {
      alert("Select User or Rider");
      return;
    }

    const res = await fetch("https://back-end-project-group.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name,
        password,
        user_type: userType,
      }),
    });

    const data = await res.json();

    if (data.status === "success") {
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } else {
      alert("Invalid login");
    }
  };

  return (
    <div className="loginWrapper">
      {/* Background Glow Balls */}
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
