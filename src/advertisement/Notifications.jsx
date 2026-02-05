import { useEffect, useState } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Notifications() {
  const [apps, setApps] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/job-applications`)
      .then(res => res.json())
      .then(data => setApps(data.applications || []));
  }, []);

  const handleAction = async (id, action) => {
    setLoadingId(id);

    try {
      const res = await fetch(
        `${BASE_URL}/admin/job-application/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application_id: id })
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        alert(
          action === "accept"
            ? "Interview email sent 📧"
            : "Rejection email sent"
        );

        // remove handled application from UI
        setApps(prev => prev.filter(a => a._id !== id));
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="px-6 py-16 text-white">
      <h1 className="text-3xl font-extrabold mb-8">
        Job Applications 📩
      </h1>

      {apps.length === 0 && (
        <p className="text-gray-400">No pending applications</p>
      )}

      <div className="space-y-5">
        {apps.map(app => (
          <div
            key={app._id}
            className="bg-white/10 border border-white/20
                       rounded-xl p-5 space-y-3"
          >
            <h2 className="font-bold text-lg">
              {app.role}
            </h2>

            <p className="text-sm text-gray-300">
              {app.name} • {app.email} • {app.phone}
            </p>

            <p className="text-xs text-gray-400">
              Location: {app.location}
            </p>

            {/* 📄 RESUME */}
            {app.resume_url && (
              <a
                href={app.resume_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm text-cyan-400
                           hover:underline"
              >
                📄 View Resume
              </a>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-2">
              <button
                disabled={loadingId === app._id}
                onClick={() => handleAction(app._id, "accept")}
                className="px-4 py-2 rounded-lg
                           bg-emerald-400 text-black font-semibold
                           hover:bg-emerald-300 transition"
              >
                ✅ Accept
              </button>

              <button
                disabled={loadingId === app._id}
                onClick={() => handleAction(app._id, "reject")}
                className="px-4 py-2 rounded-lg
                           bg-red-400 text-black font-semibold
                           hover:bg-red-300 transition"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
