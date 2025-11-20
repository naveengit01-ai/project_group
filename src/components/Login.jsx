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

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name, password, user_type: userType }),
    });

    const data = await res.json();

    if (data.status === "success") {
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);  // <-- IMPORTANT: call parent
    } else {
      alert("Invalid login");
    }
  };

  return (
    <div className="loginContainer">
      <form className="loginForm" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={user_name}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        <button>Login</button>
      </form>
    </div>
  );
}
