import { useEffect, useState } from "react";
const BASE_URL = "https://back-end-project-group.onrender.com";
// const BASE_URL = "http://localhost:5000";

export default function Career() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    resume_link: "",
    message: ""
  });

  useEffect(() => {
    fetch(`${BASE_URL}/jobs`)
      .then(res => res.json())
      .then(data => setJobs(data.jobs || []));
  }, []);

  const handleApply = async () => {
    const {
      first_name,
      last_name,
      email,
      phone,
      location
    } = form;

    if (!first_name || !last_name || !email || !phone || !location) {
      alert("All required fields must be filled");
      return;
    }

    const res = await fetch(`${BASE_URL}/apply-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: selectedJob._id,
        first_name,
        last_name,
        email,
        phone,
        location,
        resume_link: form.resume_link,
        message: form.message
      })
    });

    const data = await res.json();

    if (data.status === "application_submitted") {
      alert("Application submitted ✅");
      setSelectedJob(null);
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        location: "",
        resume_link: "",
        message: ""
      });
    } else {
      alert(data.status);
    }
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
            <h2 className="text-xl font-bold">{job.title}</h2>
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
              Apply for {selectedJob.title}
            </h2>

            {[
              ["first_name", "First Name"],
              ["last_name", "Last Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["location", "Location"],
              ["resume_link", "Resume Link (optional)"],
              ["message", "Message (optional)"]
            ].map(([key, label]) => (
              <input
                key={key}
                placeholder={label}
                className="glass-input mb-3"
                value={form[key]}
                onChange={e =>
                  setForm({ ...form, [key]: e.target.value })
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
