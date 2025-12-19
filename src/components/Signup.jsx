import React, { useState } from "react";
import "./styles/signup.css";

const BASE_URL = "https://back-end-project-group.onrender.com";
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
    user_type: ""
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting signup form", form);

    // validation
    for (let key in form) {
      if (!form[key]?.trim()) {
        alert(`${key} cannot be empty`);
        return;
      }
    }

    if (!photoFile) {
      alert("Profile photo is required!");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append("profile_photo", photoFile);

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        body: formData
      });

      console.log("Signup response status:", res.status);

      const data = await res.json();
      console.log("Signup response data:", data);

      if (data.status === "success") {
        alert("Signup successful! Please login.");
        onSignup("login");
      } else if (data.status === "exists") {
        alert("Username already exists!");
      } else {
        alert("Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed — backend not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <form className="signup-card" onSubmit={handleSubmit}>
        <h2 className="signup-title">Create an Account</h2>

        <div style={{ display: "flex", gap: "12px" }}>
          <input name="firstname" placeholder="First Name" onChange={handleChange} />
          <input name="lastname" placeholder="Last Name" onChange={handleChange} />
        </div>

        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="ph_no" placeholder="Phone Number" onChange={handleChange} />

        <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />

        <input name="user_name" placeholder="Username" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />

        <select name="user_type" onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        <button disabled={loading}>
          {loading ? "Creating account..." : "Signup"}
        </button>
      </form>
    </div>
  );
}
