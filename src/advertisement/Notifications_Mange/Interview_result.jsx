import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 🔁 SWITCH WHEN NEEDED
// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function InterviewResult() {
  const { id } = useParams(); // application_id
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    user_type: "rider"
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelect = async () => {
    if (!id) {
      alert("Invalid application ID");
      return;
    }

    if (!form.username || !form.password || !form.user_type) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/interview/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: id,
          username: form.username,
          password: form.password,
          user_type: form.user_type
        })
      });

      const data = await res.json();

      if (data.status === "account_created_otp_sent") {
        alert("Account created & OTP sent 📩");
        navigate(-1);
      } else {
        alert(data.status || "Something went wrong");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/10 rounded-2xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-emerald-400">
        Final Interview Result
      </h2>

      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        className="glass-input mb-3"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Temporary Password"
        value={form.password}
        onChange={handleChange}
        className="glass-input mb-3"
        required
      />

      <select
        name="user_type"
        value={form.user_type}
        onChange={handleChange}
        className="glass-input mb-4"
      >
        <option value="rider">Rider</option>
        <option value="user">User</option>
      </select>

      <button
        onClick={handleSelect}
        className="w-full py-3 bg-emerald-400 text-black font-bold rounded-xl hover:bg-emerald-300 transition"
      >
        Select & Create Account
      </button>
    </div>
  );
}
