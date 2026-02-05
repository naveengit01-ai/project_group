import { useEffect, useState } from "react";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Career() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });

  useEffect(() => {
    fetch(`${BASE_URL}/jobs`)
      .then(res => res.json())
      .then(data => setJobs(data.jobs || []));
  }, []);

  const handleApply = async () => {
    if (!form.name || !form.email || !form.phone || !form.location) {
      alert("All fields required");
      return;
    }

    await fetch(`${BASE_URL}/apply-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        job_id: selectedJob._id,
        role: selectedJob.role
      })
    });

    alert("Application submitted ✅");
    setSelectedJob(null);
    setForm({ name: "", email: "", phone: "", location: "" });
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <h1 className="text-4xl font-extrabold mb-10 text-center">
        Career Opportunities 🌱
      </h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {jobs.map(job => (
          <div
            key={job._id}
            className="bg-white/10 border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold">{job.role}</h2>
            <p className="text-gray-300 mt-2">{job.description}</p>

            <button
              onClick={() => setSelectedJob(job)}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-400 text-black"
            >
              Apply
            </button>
          </div>
        ))}
      </div>

      {/* APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white/10 p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Apply for {selectedJob.role}
            </h2>

            {["name", "email", "phone", "location"].map(field => (
              <input
                key={field}
                placeholder={field}
                className="glass-input mb-3"
                value={form[field]}
                onChange={e =>
                  setForm({ ...form, [field]: e.target.value })
                }
              />
            ))}

            <div className="flex gap-3">
              <button
                onClick={handleApply}
                className="flex-1 bg-emerald-400 text-black py-2 rounded-lg"
              >
                Submit
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 border border-white/30 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
