import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";

export default function Signup({ setEmail }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (form.username.length < 6) {
      alert("Username must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await signup({ ...form, user_type: "user" });

      if (res.status === "signup_success_otp_sent" || res.status === "otp_resent") {
        alert("OTP sent to your email 📩");
        setEmail(form.email);
        navigate("/verify-otp");
      } else if (res.status === "user_exists") {
        alert("Email already registered. Please login.");
        navigate("/login");
      } else {
        alert(res.status);
      }
    } catch {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        html, body { background: #07080f; margin: 0; }

        .sg-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .sg-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .sg-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }

        .sg-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 40px 36px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.04) inset;
          animation: sgCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes sgCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sg-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* HEADER */
        .sg-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 100px;
          padding: 6px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #34d399;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .sg-badge-dot {
          width: 6px; height: 6px;
          background: #34d399;
          border-radius: 50%;
          animation: sgBlink 2s ease-in-out infinite;
        }

        @keyframes sgBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .sg-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sg-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sg-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.35);
          margin-bottom: 28px;
        }

        /* FORM */
        .sg-form { display: flex; flex-direction: column; gap: 10px; }

        .sg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .sg-field { display: flex; flex-direction: column; gap: 5px; }

        .sg-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sg-required { color: #f87171; font-size: 10px; margin-left: 2px; }

        .sg-input {
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
          box-sizing: border-box;
        }

        .sg-input::placeholder { color: rgba(238,234,244,0.2); }

        .sg-input:focus {
          border-color: rgba(52,211,153,0.4);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        /* SUBMIT */
        .sg-submit {
          width: 100%;
          margin-top: 6px;
          padding: 14px;
          background: linear-gradient(135deg, #34d399, #10b981);
          border: none;
          border-radius: 12px;
          color: #07080f;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(52,211,153,0.3);
          position: relative;
          overflow: hidden;
        }

        .sg-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }

        .sg-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(52,211,153,0.45);
        }

        .sg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* LOADING SPINNER inside button */
        .sg-btn-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; z-index: 1;
        }

        .sg-btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(7,8,15,0.3);
          border-top-color: #07080f;
          border-radius: 50%;
          animation: sgSpin 0.7s linear infinite;
        }

        @keyframes sgSpin { to { transform: rotate(360deg); } }

        /* FOOTER LINK */
        .sg-footer {
          text-align: center;
          margin-top: 16px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.35);
        }

        .sg-footer span {
          color: #34d399;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .sg-footer span:hover { opacity: 0.75; }

        /* DIVIDER */
        .sg-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0;
        }

        @media (max-width: 480px) {
          .sg-row { grid-template-columns: 1fr; }
          .sg-card { padding: 32px 20px; }
        }
      `}</style>

      <div className="sg-root">
        <div className="sg-grid-bg" />

        <div className="sg-card">
          {/* HEADER */}
          <div className="sg-badge">
            <span className="sg-badge-dot" />
            New Account
          </div>
          <div className="sg-title">Join the <span>Mission</span></div>
          <div className="sg-subtitle">Help us eliminate food waste — one delivery at a time</div>

          {/* FORM */}
          <form className="sg-form" onSubmit={handleSubmit}>

            <div className="sg-field">
              <label className="sg-label">Username <span className="sg-required">*</span></label>
              <input
                className="sg-input"
                name="username"
                placeholder="min. 6 characters"
                onChange={handleChange}
              />
            </div>

            <div className="sg-row">
              <div className="sg-field">
                <label className="sg-label">First Name <span className="sg-required">*</span></label>
                <input
                  className="sg-input"
                  name="first_name"
                  placeholder="John"
                  onChange={handleChange}
                />
              </div>
              <div className="sg-field">
                <label className="sg-label">Last Name <span className="sg-required">*</span></label>
                <input
                  className="sg-input"
                  name="last_name"
                  placeholder="Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sg-row">
              <div className="sg-field">
                <label className="sg-label">Phone <span className="sg-required">*</span></label>
                <input
                  className="sg-input"
                  name="phone"
                  placeholder="+91 9999..."
                  onChange={handleChange}
                />
              </div>
              <div className="sg-field">
                <label className="sg-label">Email <span className="sg-required">*</span></label>
                <input
                  className="sg-input"
                  name="email"
                  placeholder="you@email.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sg-divider" />

            <div className="sg-field">
              <label className="sg-label">Password <span className="sg-required">*</span></label>
              <input
                className="sg-input"
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>

            <div className="sg-field">
              <label className="sg-label">Confirm Password <span className="sg-required">*</span></label>
              <input
                className="sg-input"
                type="password"
                name="confirm_password"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>

            <button className="sg-submit" type="submit" disabled={loading}>
              <div className="sg-btn-inner">
                {loading && <span className="sg-btn-spinner" />}
                {loading ? "Sending OTP..." : "Create Account →"}
              </div>
            </button>
          </form>

          <div className="sg-footer">
            Already registered?{" "}
            <span onClick={() => navigate("/login")}>Login here</span>
          </div>
        </div>
      </div>
    </>
  );
}