import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = "https://back-end-project-group.onrender.com";
// for local testing:
// const BASE_URL = "http://localhost:5000";

export default function Accept() {
  const { id } = useParams(); // application_id
  const navigate = useNavigate();

  const [form, setForm] = useState({
    interview_date: "",
    interview_time: "",
    mode: "Online",
    location: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    if (!id) {
      alert("Invalid application ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/admin/interview/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_id: id,
            date: form.interview_date,
            time: form.interview_time,
            mode: form.mode,
            location: form.location
          })
        }
      );

      const data = await res.json();

      if (data.status === "interview_scheduled") {
        alert("Interview mail sent successfully 📧");
        navigate(-1);
      } else {
        alert(data.status || "Something went wrong");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/10 rounded-2xl text-white">
      <h2 className="text-2xl font-bold mb-6">
        Schedule Interview
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          name="interview_date"
          onChange={handleChange}
          className="glass-input"
          required
        />

        <input
          type="time"
          name="interview_time"
          onChange={handleChange}
          className="glass-input"
          required
        />

        <select
          name="mode"
          onChange={handleChange}
          className="glass-input"
        >
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>

        <input
          name="location"
          placeholder="Meeting link / Office address"
          onChange={handleChange}
          className="glass-input"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-400 text-black font-bold rounded-xl disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Interview Mail"}
        </button>
      </form>
    </div>
  );
}
