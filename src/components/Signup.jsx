import React, { useState } from "react";
import "./styles/signup.css";

const BASE_URL = "https://back-end-project-group.onrender.com";
// for local testing:
// const BASE_URL = "http://localhost:5000";

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    address: "",
    email: "",
    ph_no: "",
    user_name: "",
    password: "",
    user_type: "user" // ✅ DEFAULT
  });

  const [photoFile, setPhotoFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    for (let key in form) {
      if (!form[key] || form[key].trim() === "") {
        alert(`${key} cannot be empty`);
        return;
      }
    }

    if (!photoFile) {
      alert("Profile photo is required!");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("profile_photo", photoFile);

    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Signup failed");
      }

      const data = await res.json();

      if (data.status === "success") {
        alert("Signup successful!");
        onSignup("login");
      } else if (data.status === "exists") {
        alert("Username already exists!");
      } else {
        alert("Signup failed!");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert(
        "Signup failed.\n\n" +
        "Possible reasons:\n" +
        "- Backend sleeping (Render)\n" +
        "- MongoDB connection issue\n" +
        "- File upload error\n\n" +
        "Check console & backend logs."
      );
    }
  };

  return (
    <div className="signup-page">
      <form className="signup-card" onSubmit={handleSubmit}>
        <h2 className="signup-title">Create an Account</h2>

        <div style={{ display: "flex", gap: "12px" }}>
          <input
            name="firstname"
            placeholder="First Name"
            onChange={handleChange}
            className="signup-input"
          />
          <input
            name="lastname"
            placeholder="Last Name"
            onChange={handleChange}
            className="signup-input"
          />
        </div>

        <input
          name="address"
          placeholder="Address"
          onChange={handleChange}
          className="signup-input"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="signup-input"
        />

        <input
          name="ph_no"
          placeholder="Phone Number"
          onChange={handleChange}
          className="signup-input"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
          className="signup-file"
        />

        <input
          name="user_name"
          placeholder="Username"
          onChange={handleChange}
          className="signup-input"
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
          className="signup-input"
        />

        {/* Locked role */}
        <select
          name="user_type"
          className="signup-select"
          value={form.user_type}
          onChange={handleChange}
        >
          <option value="user">User</option>
        </select>

        <button className="signup-btn">Signup</button>
      </form>
    </div>
  );
}
