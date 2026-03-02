import { useEffect, useState } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Career() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    phone: "", location: "", resume_link: "", message: ""
  });

  useEffect(() => {
    fetch(`${BASE_URL}/jobs`)
      .then(r => r.json())
      .then(d => { setJobs(d.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleApply = async () => {
    const { first_name, last_name, email, phone, location } = form;
    if (!first_name || !last_name || !email || !phone || !location) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/apply-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: selectedJob._id, ...form })
      });
      const data = await res.json();
      if (data.status === "application_submitted") {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedJob(null);
          setForm({ first_name:"",last_name:"",email:"",phone:"",location:"",resume_link:"",message:"" });
        }, 2000);
      } else {
        alert(data.status === "already_applied" ? "You already applied for this job!" : data.status);
      }
    } catch { alert("Something went wrong"); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        .cr-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        .cr-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .cr-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        .cr-wrap {
          position: relative; z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }

        /* HEADER */
        .cr-header { text-align: center; margin-bottom: 64px; }

        .cr-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 100px;
          padding: 6px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 400;
          color: #34d399;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 20px;
        }

        .cr-badge-dot {
          width: 6px; height: 6px;
          background: #34d399; border-radius: 50%;
          animation: crBlink 2s ease-in-out infinite;
        }

        @keyframes crBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .cr-title {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.0;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cr-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cr-sub {
          color: rgba(238,234,244,0.45);
          font-size: 15px; font-weight: 400;
          font-family: 'DM Mono', monospace;
        }

        /* JOB GRID */
        .cr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .cr-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          cursor: pointer;
          animation: crCardIn 0.5s ease both;
        }

        .cr-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .cr-card:hover {
          border-color: rgba(52,211,153,0.25);
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(52,211,153,0.1);
          background: rgba(52,211,153,0.04);
        }

        .cr-card:hover::before { opacity: 1; }

        @keyframes crCardIn {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }

        .cr-card-num {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(52,211,153,0.5);
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .cr-card-title {
          font-size: 18px; font-weight: 700;
          color: #eeeaf4;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .cr-card-desc {
          font-size: 13px;
          color: rgba(238,234,244,0.45);
          line-height: 1.6;
          font-family: 'DM Mono', monospace;
          font-weight: 300;
          margin-bottom: 24px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cr-apply-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.3);
          color: #34d399;
          padding: 10px 20px;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .cr-apply-btn:hover {
          background: #34d399;
          color: #07080f;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(52,211,153,0.35);
        }

        /* EMPTY / LOADING */
        .cr-empty {
          text-align: center;
          padding: 80px 0;
          color: rgba(238,234,244,0.3);
          font-family: 'DM Mono', monospace;
          font-size: 13px;
        }

        .cr-spinner {
          width: 32px; height: 32px;
          border: 2px solid rgba(52,211,153,0.15);
          border-top-color: #34d399;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* MODAL OVERLAY */
        .cr-overlay {
          position: fixed; inset: 0;
          background: rgba(7,8,15,0.88);
          backdrop-filter: blur(16px);
          z-index: 999;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: crOverlayIn 0.25s ease both;
        }

        @keyframes crOverlayIn { from{opacity:0} to{opacity:1} }

        .cr-modal {
          background: #0d0e1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 36px 32px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.05) inset;
          animation: crModalIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
          scrollbar-width: thin;
          scrollbar-color: rgba(52,211,153,0.2) transparent;
        }

        @keyframes crModalIn {
          from { opacity:0; transform:scale(0.92) translateY(20px); }
          to { opacity:1; transform:scale(1) translateY(0); }
        }

        .cr-modal-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 28px;
        }

        .cr-modal-title {
          font-size: 20px; font-weight: 700;
          color: #eeeaf4;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .cr-modal-job {
          font-size: 12px;
          color: #34d399;
          font-family: 'DM Mono', monospace;
          margin-top: 4px;
        }

        .cr-close {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(238,234,244,0.6);
          font-size: 16px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .cr-close:hover { background: rgba(255,255,255,0.1); color: #eeeaf4; }

        /* FORM */
        .cr-form { display: flex; flex-direction: column; gap: 10px; }

        .cr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .cr-field { display: flex; flex-direction: column; gap: 5px; }

        .cr-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .cr-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 14px;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
          width: 100%;
        }

        .cr-input::placeholder { color: rgba(238,234,244,0.2); }

        .cr-input:focus {
          border-color: rgba(52,211,153,0.4);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        .cr-textarea {
          resize: none;
          height: 80px;
        }

        .cr-required {
          color: #f87171;
          font-size: 10px;
          margin-left: 2px;
        }

        /* SUBMIT BTN */
        .cr-submit {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #34d399, #10b981);
          border: none;
          border-radius: 12px;
          color: #07080f;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(52,211,153,0.3);
          position: relative; overflow: hidden;
        }

        .cr-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }

        .cr-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(52,211,153,0.45);
        }

        .cr-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .cr-cancel {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(238,234,244,0.5);
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .cr-cancel:hover { border-color: rgba(255,255,255,0.25); color: #eeeaf4; }

        /* SUCCESS */
        .cr-success {
          text-align: center;
          padding: 32px 0;
        }

        .cr-success-icon {
          font-size: 48px;
          animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          margin-bottom: 16px;
          display: block;
        }

        @keyframes successPop {
          from { transform:scale(0) rotate(-20deg); opacity:0; }
          to { transform:scale(1) rotate(0); opacity:1; }
        }

        .cr-success-title {
          font-size: 20px; font-weight: 700;
          color: #34d399; margin-bottom: 8px;
        }

        .cr-success-sub {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        @media(max-width:520px) {
          .cr-row { grid-template-columns: 1fr; }
          .cr-modal { padding: 28px 20px; }
          .cr-wrap { padding: 60px 16px 100px; }
        }
      `}</style>

      <div className="cr-root">
        <div className="cr-grid-bg" />

        <div className="cr-wrap">
          {/* HEADER */}
          <div className="cr-header">
            <div className="cr-badge">
              <span className="cr-badge-dot" />
              We're Hiring
            </div>
            <h1 className="cr-title">
              Join the <span>Mission</span>
            </h1>
            <p className="cr-sub">Help us eliminate food waste — one delivery at a time</p>
          </div>

          {/* JOB GRID */}
          {loading ? (
            <div className="cr-empty">
              <div className="cr-spinner" />
              Loading opportunities...
            </div>
          ) : jobs.length === 0 ? (
            <div className="cr-empty">
              No openings right now — check back soon 🌱
            </div>
          ) : (
            <div className="cr-grid">
              {jobs.map((job, i) => (
                <div
                  key={job._id}
                  className="cr-card"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="cr-card-num">#{String(i+1).padStart(2,"0")}</div>
                  <div className="cr-card-title">{job.title}</div>
                  <div className="cr-card-desc">{job.description}</div>
                  <button className="cr-apply-btn" onClick={() => setSelectedJob(job)}>
                    Apply Now →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL */}
        {selectedJob && (
          <div className="cr-overlay" onClick={() => setSelectedJob(null)}>
            <div className="cr-modal" onClick={e => e.stopPropagation()}>

              {success ? (
                <div className="cr-success">
                  <span className="cr-success-icon">🎉</span>
                  <div className="cr-success-title">Application Submitted!</div>
                  <div className="cr-success-sub">We'll get back to you soon.</div>
                </div>
              ) : (
                <>
                  <div className="cr-modal-top">
                    <div>
                      <div className="cr-modal-title">Apply for Role</div>
                      <div className="cr-modal-job">→ {selectedJob.title}</div>
                    </div>
                    <button className="cr-close" onClick={() => setSelectedJob(null)}>✕</button>
                  </div>

                  <div className="cr-form">
                    <div className="cr-row">
                      <div className="cr-field">
                        <label className="cr-label">First Name <span className="cr-required">*</span></label>
                        <input className="cr-input" placeholder="John" value={form.first_name}
                          onChange={e => setForm({...form, first_name: e.target.value})} />
                      </div>
                      <div className="cr-field">
                        <label className="cr-label">Last Name <span className="cr-required">*</span></label>
                        <input className="cr-input" placeholder="Doe" value={form.last_name}
                          onChange={e => setForm({...form, last_name: e.target.value})} />
                      </div>
                    </div>

                    <div className="cr-field">
                      <label className="cr-label">Email <span className="cr-required">*</span></label>
                      <input className="cr-input" placeholder="you@email.com" value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})} />
                    </div>

                    <div className="cr-row">
                      <div className="cr-field">
                        <label className="cr-label">Phone <span className="cr-required">*</span></label>
                        <input className="cr-input" placeholder="+91 9999..." value={form.phone}
                          onChange={e => setForm({...form, phone: e.target.value})} />
                      </div>
                      <div className="cr-field">
                        <label className="cr-label">Location <span className="cr-required">*</span></label>
                        <input className="cr-input" placeholder="City" value={form.location}
                          onChange={e => setForm({...form, location: e.target.value})} />
                      </div>
                    </div>

                    <div className="cr-field">
                      <label className="cr-label">Resume Link <span style={{color:"rgba(238,234,244,0.3)"}}>optional</span></label>
                      <input className="cr-input" placeholder="https://drive.google.com/..." value={form.resume_link}
                        onChange={e => setForm({...form, resume_link: e.target.value})} />
                    </div>

                    <div className="cr-field">
                      <label className="cr-label">Message <span style={{color:"rgba(238,234,244,0.3)"}}>optional</span></label>
                      <textarea className="cr-input cr-textarea" placeholder="Tell us about yourself..."
                        value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                    </div>

                    <button className="cr-submit" onClick={handleApply} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application →"}
                    </button>
                    <button className="cr-cancel" onClick={() => setSelectedJob(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}