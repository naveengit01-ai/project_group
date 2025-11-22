import React, { useState } from "react";
import "./styles/Signup.css";

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    address: "",
    email: "",
    ph_no: "",
    user_name: "",
    password: "",
    user_type: "",
  });

  const [photoFile, setPhotoFile] = useState(null);

  // Handle text inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    for (let key in form) {
      if (form[key].trim() === "") {
        alert(`${key} cannot be empty`);
        return;
      }
    }

    if (!photoFile) {
      alert("Profile photo is required!");
      return;
    }

    // Prepare formData
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });
    formData.append("profile_photo", photoFile);

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Signup successful!");
        onSignup("login");
      } else if (data.status === "exists") {
        alert("Username already exists!");
      } else {
        alert("Signup failed: " + data.message);
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  return (
    <div className="signup-page">
      <form className="signup-card" onSubmit={handleSubmit}>

        <h2 className="signup-title">Create an Account</h2>

        {/* Name Row */}
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
          type="number"
        />

        {/* File Upload */}
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

        <select
          name="user_type"
          className="signup-select"
          onChange={handleChange}
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        <button className="signup-btn">Signup</button>
      </form>
    </div>
  );
}
