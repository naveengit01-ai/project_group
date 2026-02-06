import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔁 switch when needed
// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Notifications() {
  const [apps, setApps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/admin/job-applications`)
      .then(res => res.json())
      .then(data => setApps(data.applications || []));
  }, []);

  const removeFromUI = id =>
    setApps(prev => prev.filter(a => a._id !== id));

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
            className="bg-white/10 border border-white/20 rounded-xl p-5 space-y-3"
          >
            {/* ROLE */}
            <h2 className="font-bold text-lg">{app.job_title}</h2>

            {/* CANDIDATE */}
            <p className="text-sm text-gray-300">
              {app.first_name} {app.last_name} • {app.email} • {app.phone}
            </p>

            <p className="text-xs text-gray-400">
              Location: {app.location}
            </p>

            {/* RESUME */}
            {app.resume_link && (
              <a
                href={app.resume_link}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cyan-400 hover:underline"
              >
                📄 View Resume
              </a>
            )}

            {/* ================= ACTIONS ================= */}
            <div className="flex gap-3 pt-3 flex-wrap">

              {/* 🟢 PENDING → ACCEPT */}
              {app.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      navigate(`/afterlogin/notifications/accept/${app._id}`)
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-400 text-black font-semibold"
                  >
                    ✅ Accept
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/afterlogin/notifications/reject/${app._id}`)
                    }
                    className="px-4 py-2 rounded-lg bg-red-400 text-black font-semibold"
                  >
                    ❌ Reject
                  </button>
                </>
              )}

              {/* 🟡 INTERVIEW SCHEDULED */}
              {app.status === "interview_scheduled" && (
                <>
                  <span className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold">
                    📧 Interview Mail Sent
                  </span>

                  <button
                    onClick={() =>
                      navigate(`/afterlogin/notifications/result/${app._id}`)
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold"
                  >
                    🧾 Interview Result
                  </button>
                </>
              )}

              {/* ❌ REJECTED (auto remove) */}
              {app.status === "rejected" && removeFromUI(app._id)}

              {/* ✅ SELECTED (auto remove) */}
              {app.status === "selected" && removeFromUI(app._id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
