import { useEffect, useState } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";

const STATUS_META = {
  not_picked: {
    label:  "Not Picked",
    color:  "#fbbf24",
    bg:     "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
    icon:   "⏳",
  },
  picked: {
    label:  "Picked Up",
    color:  "#60a5fa",
    bg:     "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.25)",
    icon:   "🚗",
  },
  collected: {
    label:  "Collected",
    color:  "#a78bfa",
    bg:     "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.25)",
    icon:   "📦",
  },
  delivered: {
    label:  "Delivered",
    color:  "#34d399",
    bg:     "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.25)",
    icon:   "✅",
  },
};

const ITEM_ICON = {
  food:    "🍱",
  clothes: "👕",
  other:   "📦",
};

export default function MyRequests() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [resending, setResending] = useState(null);
  const [filter, setFilter]     = useState("all");

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    try {
      const res  = await fetch(`${BASE_URL}/my-requests`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.status === "success") setRequests(data.requests);
    } catch {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp(donationId) {
    setResending(donationId);
    try {
      const res  = await fetch(`${BASE_URL}/resend-donation-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ donation_id: donationId }),
      });
      const data = await res.json();
      alert(data.status === "otp_resent" ? "OTP resent successfully 📩" : data.status);
    } catch {
      alert("Server error");
    } finally {
      setResending(null);
    }
  }

  const FILTERS = [
    { key: "all",        label: "All" },
    { key: "not_picked", label: "Pending" },
    { key: "picked",     label: "Picked" },
    { key: "collected",  label: "Collected" },
    { key: "delivered",  label: "Delivered" },
  ];

  const filtered = filter === "all"
    ? requests
    : requests.filter(r => r.donation_status === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        .mr-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 48px 24px 100px;
        }

        .mr-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.05), transparent 60%);
          pointer-events: none; z-index: 0;
        }

        .mr-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        .mr-wrap {
          position: relative; z-index: 1;
          max-width: 720px; margin: 0 auto;
          animation: mrFadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes mrFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* HEADER */
        .mr-header { text-align: center; margin-bottom: 36px; }

        .mr-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 100px; padding: 6px 18px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: #34d399; letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 16px;
        }

        .mr-badge-dot {
          width: 6px; height: 6px; background: #34d399;
          border-radius: 50%; animation: mrBlink 2s ease-in-out infinite;
        }

        @keyframes mrBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .mr-title {
          font-size: clamp(26px, 5vw, 40px); font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 8px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mr-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mr-subtitle {
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: rgba(238,234,244,0.35);
        }

        /* FILTERS */
        .mr-filters {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 28px; justify-content: center;
        }

        .mr-filter-btn {
          padding: 7px 16px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(238,234,244,0.45);
          font-family: 'DM Mono', monospace; font-size: 11px;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }

        .mr-filter-btn:hover {
          border-color: rgba(52,211,153,0.2);
          color: rgba(238,234,244,0.7);
        }

        .mr-filter-btn.active {
          background: rgba(52,211,153,0.1);
          border-color: rgba(52,211,153,0.35);
          color: #34d399;
        }

        /* STATS */
        .mr-stats {
          display: flex; gap: 10px; justify-content: center;
          margin-bottom: 28px; flex-wrap: wrap;
        }

        .mr-stat {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 12px 20px;
          min-width: 80px;
        }

        .mr-stat-num {
          font-size: 22px; font-weight: 800;
          letter-spacing: -0.02em;
        }

        .mr-stat-label {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: rgba(238,234,244,0.35); margin-top: 2px;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* LIST */
        .mr-list { display: flex; flex-direction: column; gap: 14px; }

        /* CARD */
        .mr-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 22px 22px 18px;
          position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          animation: mrCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes mrCardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mr-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--s-color, rgba(52,211,153,0.4)), transparent);
        }

        .mr-card:hover {
          border-color: var(--s-border, rgba(52,211,153,0.2));
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }

        /* CARD TOP ROW */
        .mr-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
          margin-bottom: 14px;
        }

        .mr-card-left { display: flex; align-items: center; gap: 14px; }

        .mr-item-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: var(--s-bg, rgba(52,211,153,0.08));
          border: 1px solid var(--s-border, rgba(52,211,153,0.2));
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }

        .mr-item-name {
          font-size: 15px; font-weight: 700;
          color: #eeeaf4; letter-spacing: -0.01em;
          margin-bottom: 3px; line-height: 1.3;
        }

        .mr-item-type {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: rgba(238,234,244,0.35); text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* STATUS BADGE */
        .mr-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 100px;
          background: var(--s-bg, rgba(52,211,153,0.08));
          border: 1px solid var(--s-border, rgba(52,211,153,0.2));
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: var(--s-color, #34d399);
          white-space: nowrap; flex-shrink: 0;
        }

        /* CARD META ROW */
        .mr-meta-row {
          display: flex; gap: 20px; flex-wrap: wrap;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .mr-meta-item {
          display: flex; flex-direction: column; gap: 2px;
        }

        .mr-meta-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          color: rgba(238,234,244,0.28); text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .mr-meta-value {
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: rgba(238,234,244,0.6);
        }

        /* PROGRESS TRACK */
        .mr-progress {
          display: flex; align-items: center; gap: 0;
          margin: 16px 0 4px;
        }

        .mr-progress-step {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; position: relative;
        }

        .mr-progress-dot {
          width: 10px; height: 10px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          z-index: 1; transition: all 0.3s;
          position: relative;
        }

        .mr-progress-dot.done {
          background: var(--s-color, #34d399);
          border-color: var(--s-color, #34d399);
          box-shadow: 0 0 8px var(--s-color, rgba(52,211,153,0.5));
        }

        .mr-progress-line {
          position: absolute; top: 4px; left: 50%; right: -50%;
          height: 2px;
          background: rgba(255,255,255,0.06);
          z-index: 0;
        }

        .mr-progress-line.done { background: var(--s-color, #34d399); }

        .mr-progress-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          color: rgba(238,234,244,0.25); margin-top: 6px;
          text-align: center; white-space: nowrap;
        }

        .mr-progress-label.done { color: var(--s-color, #34d399); }

        /* RESEND BTN */
        .mr-resend-btn {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 14px;
          padding: 8px 16px; border-radius: 10px;
          border: 1px solid rgba(96,165,250,0.25);
          background: rgba(96,165,250,0.08);
          color: #60a5fa;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }

        .mr-resend-btn:hover {
          background: rgba(96,165,250,0.15);
          border-color: rgba(96,165,250,0.4);
        }

        .mr-resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .mr-resend-spinner {
          width: 11px; height: 11px;
          border: 2px solid rgba(96,165,250,0.2);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: mrSpin 0.7s linear infinite;
        }

        @keyframes mrSpin { to { transform: rotate(360deg); } }

        /* EMPTY */
        .mr-empty {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 60px 24px;
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; gap: 12px;
        }

        .mr-empty-icon { font-size: 40px; }

        .mr-empty-title {
          font-size: 16px; font-weight: 700; color: #eeeaf4;
        }

        .mr-empty-sub {
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: rgba(238,234,244,0.35);
        }

        /* LOADING */
        .mr-loading {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 100vh; gap: 16px;
          background: #07080f;
        }

        .mr-load-plate {
          width: 72px; height: 72px; border-radius: 50%;
          border: 2px dashed rgba(52,211,153,0.3);
          display: flex; align-items: center; justify-content: center;
          animation: mrSpin 6s linear infinite;
        }

        .mr-load-icon {
          font-size: 28px;
          animation: mrPop 1.6s ease-in-out infinite;
        }

        @keyframes mrPop {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.12); opacity: 1; }
        }

        .mr-load-text {
          font-family: 'DM Mono', monospace; font-size: 13px;
          color: rgba(238,234,244,0.4);
        }

        @media (max-width: 480px) {
          .mr-root { padding: 32px 16px 80px; }
          .mr-card-top { flex-direction: column; }
          .mr-status-badge { align-self: flex-start; }
        }
      `}</style>

      {/* LOADING */}
      {loading && (
        <div className="mr-loading">
          <div className="mr-load-plate">
            <div className="mr-load-icon">📋</div>
          </div>
          <div className="mr-load-text">Loading your requests...</div>
        </div>
      )}

      {!loading && (
        <div className="mr-root">
          <div className="mr-grid-bg" />

          <div className="mr-wrap">

            {/* HEADER */}
            <div className="mr-header">
              <div className="mr-badge">
                <span className="mr-badge-dot" />
                Donation Tracker
              </div>
              <h1 className="mr-title">My <span>Requests</span></h1>
              <p className="mr-subtitle">Track your donation requests and their status</p>
            </div>

            {/* STATS */}
            {requests.length > 0 && (
              <div className="mr-stats">
                {[
                  { key: "all",        label: "Total",     num: requests.length },
                  { key: "not_picked", label: "Pending",   num: requests.filter(r => r.donation_status === "not_picked").length },
                  { key: "picked",     label: "Picked",    num: requests.filter(r => r.donation_status === "picked").length },
                  { key: "delivered",  label: "Delivered", num: requests.filter(r => r.donation_status === "delivered").length },
                ].map(s => (
                  <div
                    key={s.key}
                    className="mr-stat"
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter(s.key)}
                  >
                    <div
                      className="mr-stat-num"
                      style={{ color: s.key === "all" ? "#34d399" : (STATUS_META[s.key]?.color || "#34d399") }}
                    >
                      {s.num}
                    </div>
                    <div className="mr-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* FILTER TABS */}
            {requests.length > 0 && (
              <div className="mr-filters">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    className={`mr-filter-btn ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.key !== "all" && STATUS_META[f.key]?.icon + " "}
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {requests.length === 0 && (
              <div className="mr-empty">
                <div className="mr-empty-icon">📭</div>
                <div className="mr-empty-title">No requests yet</div>
                <div className="mr-empty-sub">Your donation requests will appear here</div>
              </div>
            )}

            {/* FILTERED EMPTY */}
            {requests.length > 0 && filtered.length === 0 && (
              <div className="mr-empty">
                <div className="mr-empty-icon">🔍</div>
                <div className="mr-empty-title">No {filter.replace("_", " ")} requests</div>
                <div className="mr-empty-sub">Try selecting a different filter</div>
              </div>
            )}

            {/* REQUEST LIST */}
            <div className="mr-list">
              {filtered.map((req, i) => {
                const status = STATUS_META[req.donation_status] || STATUS_META.not_picked;
                const showResend = req.donation_status === "not_picked" && req.is_verified === false;

                const STEPS = ["not_picked", "picked", "collected", "delivered"];
                const stepIdx = STEPS.indexOf(req.donation_status);

                return (
                  <div
                    key={req._id}
                    className="mr-card"
                    style={{
                      "--s-color":  status.color,
                      "--s-bg":     status.bg,
                      "--s-border": status.border,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  >
                    {/* TOP */}
                    <div className="mr-card-top">
                      <div className="mr-card-left">
                        <div className="mr-item-icon">
                          {ITEM_ICON[req.item_type] || "📦"}
                        </div>
                        <div>
                          <div className="mr-item-name">{req.item_name}</div>
                          <div className="mr-item-type">{req.item_type} donation</div>
                        </div>
                      </div>
                      <div className="mr-status-badge">
                        {status.icon} {status.label}
                      </div>
                    </div>

                    {/* PROGRESS TRACK */}
                    <div className="mr-progress">
                      {STEPS.map((step, si) => {
                        const isDone = si <= stepIdx;
                        const isLast = si === STEPS.length - 1;
                        return (
                          <div key={step} className="mr-progress-step">
                            {!isLast && (
                              <div className={`mr-progress-line ${isDone && si < stepIdx ? "done" : ""}`} />
                            )}
                            <div className={`mr-progress-dot ${isDone ? "done" : ""}`} />
                            <div className={`mr-progress-label ${isDone ? "done" : ""}`}>
                              {STATUS_META[step]?.icon}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* META */}
                    <div className="mr-meta-row">
                      <div className="mr-meta-item">
                        <div className="mr-meta-label">Quantity</div>
                        <div className="mr-meta-value">{req.quantity}</div>
                      </div>
                      <div className="mr-meta-item">
                        <div className="mr-meta-label">Price</div>
                        <div className="mr-meta-value">
                          {req.price_type === "free" ? "Free" : `₹${req.price_amount}`}
                        </div>
                      </div>
                      <div className="mr-meta-item">
                        <div className="mr-meta-label">Date</div>
                        <div className="mr-meta-value">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </div>
                      </div>
                      {req.pickup_location && (
                        <div className="mr-meta-item">
                          <div className="mr-meta-label">Pickup</div>
                          <div className="mr-meta-value" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {req.pickup_location}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RESEND OTP */}
                    {showResend && (
                      <button
                        className="mr-resend-btn"
                        disabled={resending === req._id}
                        onClick={() => resendOtp(req._id)}
                      >
                        {resending === req._id
                          ? <span className="mr-resend-spinner" />
                          : "📩"
                        }
                        {resending === req._id ? "Sending..." : "Resend OTP"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}