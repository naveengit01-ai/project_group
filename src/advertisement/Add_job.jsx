import { useState } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";
// const BASE_URL = "http://localhost:5000";

export default function AddJob() {
  const [form, setForm] = useState({
    title: "",
    description: ""
  });

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.title || !form.description) {
      alert("All fields required");
      return;
    }

    const res = await fetch(`${BASE_URL}/admin/add-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (data.status === "job_added") {
      alert("Job added successfully ✅");
      setForm({ title: "", description: "" });
    } else {
      alert(data.status);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/10 rounded-2xl text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Add Job Opportunity
      </h2>

      <input
        className="glass-input mb-4"
        placeholder="Job Title (e.g. Field Volunteer)"
        value={form.title}
        onChange={e =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <textarea
        className="glass-input mb-4"
        rows={4}
        placeholder="Job Description"
        value={form.description}
        onChange={e =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-emerald-400 text-black py-3 rounded-xl font-bold"
      >
        Add Job
      </button>
    </div>
  );
}
