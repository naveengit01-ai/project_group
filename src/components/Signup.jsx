import React, { useState } from "react";
import "./styles/signup.css";

const BASE_URL = "https://back-end-project-group.onrender.com";
// for local testing:
// const BASE_URL = "http://localhost:10000";

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    address: "",
    email: "",
    ph_no: "",
    user_name: "",
    password: "",
    user_type: "" // user | rider
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 Basic validation (photo NOT required)
    for (let key in form) {
      if (!form[key].trim()) {
        alert(`${key} cannot be empty`);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // append photo ONLY if user selected one
    if (photoFile) {
      formData.append("profile_photo", photoFile);
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Signup successful! Please login.");
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
        "- Network issue\n\n" +
        "Try again."
      );
    } finally {
      setLoading(false);
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

        {/* OPTIONAL PHOTO */}
        <input
          type="file"
          accept="image/*"
          className="signup-file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) {
              setPhotoFile(null);
              return;
            }

            if (file.size > 1024 * 1024) {
              alert("Image must be less than 1MB");
              e.target.value = "";
              return;
            }

            setPhotoFile(file);
          }}
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

        <select
          name="user_type"
          className="signup-select"
          value={form.user_type}
          onChange={handleChange}
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        <button className="signup-btn" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
}
