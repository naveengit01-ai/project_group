import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://back-end-project-group.onrender.com";
const foodEmojis = ["🍱","🥗","🍛","🥘","🍲","🥙","🍜","🥡"];

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", user_type: "user" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/afterlogin", { replace: true });
  }, [navigate]);

  const startY = useRef(0);
  const active = useRef(false);
  const [offset, setOffset] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [emoji, setEmoji] = useState("🍱");

  const TRIGGER = 72;
  const progress = Math.min(offset / TRIGGER, 1);
  const snapping = phase === "snap";

  useEffect(() => {
    const onStart = (y) => {
      if (window.scrollY !== 0 || loading) return;
      active.current = true;
      startY.current = y;
      setEmoji(foodEmojis[Math.floor(Math.random() * foodEmojis.length)]);
    };
    const onMove = (y) => {
      if (!active.current) return;
      const raw = y - startY.current;
      if (raw <= 0) return;
      setOffset(Math.min(Math.log1p(raw) * 18, 110));
      setPhase("pulling");
    };
    const onEnd = () => {
      if (!active.current) return;
      active.current = false;
      setPhase("snap");
      setTimeout(() => { setOffset(0); setPhase("idle"); }, 450);
    };

    const ts = e => onStart(e.touches[0].clientY);
    const tm = e => onMove(e.touches[0].clientY);
    const te = () => onEnd();
    let mouse = false;
    const md = e => { mouse = true; onStart(e.clientY); };
    const mm = e => mouse && onMove(e.clientY);
    const mu = () => { mouse = false; onEnd(); };

    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchmove", tm, { passive: true });
    window.addEventListener("touchend", te);
    window.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", te);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [loading]);

  const pageStyle = {
    transform: `translateY(${offset}px)`,
    transition: snapping ? "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)" : "none",
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "login_success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/afterlogin", { replace: true });
      } else if (data.status === "otp_required") {
        localStorage.setItem("verifyEmail", form.email);
        navigate("/verify-otp");
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        html, body { margin: 0; background: #07080f; }

        .lg-root {
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

        .lg-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .lg-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }

        /* PULL STRIP */
        .lg-pull-strip {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 5;
        }

        .lg-pull-bar {
          width: 50px;
          height: 3px;
          background: rgba(255,255,255,0.1);
          border-radius: 100px;
          overflow: hidden;
          margin-top: 6px;
        }

        .lg-pull-fill {
          height: 100%;
          background: linear-gradient(90deg, #34d399, #10b981);
          border-radius: 100px;
        }

        /* CARD — exactly matches signup */
        .lg-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 40px 36px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.04) inset;
          animation: lgCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          box-sizing: border-box;
        }

        @keyframes lgCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .lg-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* BADGE */
        .lg-badge {
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

        .lg-badge-dot {
          width: 6px; height: 6px;
          background: #34d399;
          border-radius: 50%;
          animation: lgBlink 2s ease-in-out infinite;
        }

        @keyframes lgBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .lg-title {
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

        .lg-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lg-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.35);
          margin-bottom: 28px;
        }

        /* FORM */
        .lg-form { display: flex; flex-direction: column; gap: 10px; }

        .lg-field { display: flex; flex-direction: column; gap: 5px; }

        .lg-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .lg-input {
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

        .lg-input::placeholder { color: rgba(238,234,244,0.2); }

        .lg-input:focus {
          border-color: rgba(52,211,153,0.4);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        /* LOGIN AS TOGGLE */
        .lg-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .lg-toggle-btn {
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(238,234,244,0.4);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .lg-toggle-btn:hover {
          border-color: rgba(52,211,153,0.25);
          color: rgba(238,234,244,0.7);
        }

        .lg-toggle-btn.active {
          background: rgba(52,211,153,0.12);
          border-color: rgba(52,211,153,0.45);
          color: #34d399;
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        .lg-toggle-icon {
          font-size: 16px;
          line-height: 1;
        }

        /* DIVIDER */
        .lg-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0;
        }

        /* SUBMIT */
        .lg-submit {
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

        .lg-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }

        .lg-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(52,211,153,0.45);
        }

        .lg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .lg-btn-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; z-index: 1;
        }

        /* FOOTER */
        .lg-footer {
          text-align: center;
          margin-top: 16px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.35);
        }

        .lg-footer span {
          color: #34d399;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .lg-footer span:hover { opacity: 0.75; }

        /* LOADING OVERLAY */
        .lg-overlay {
          position: fixed;
          inset: 0;
          background: rgba(7,8,15,0.92);
          backdrop-filter: blur(16px);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          animation: lgFadeIn 0.25s ease both;
        }

        @keyframes lgFadeIn { from{opacity:0} to{opacity:1} }

        .lg-food-plate {
          width: 90px; height: 90px;
          border-radius: 50%;
          border: 2px dashed rgba(52,211,153,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: lgSpin 6s linear infinite;
          margin-bottom: 22px;
        }

        .lg-food-icon {
          font-size: 36px;
          animation: lgPop 1.6s ease-in-out infinite;
        }

        @keyframes lgSpin { to { transform: rotate(360deg); } }

        @keyframes lgPop {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .lg-overlay-text {
          font-size: 16px; font-weight: 600;
          color: #eeeaf4; margin-bottom: 6px;
        }

        .lg-overlay-sub {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        .lg-dots {
          display: flex; gap: 6px;
          margin-top: 18px;
        }

        .lg-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: lgDotPulse 1.4s ease-in-out infinite;
        }

        .lg-dot:nth-child(2) { animation-delay: 0.2s; }
        .lg-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes lgDotPulse {
          0%,100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @media (max-width: 480px) {
          .lg-card { padding: 32px 20px; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-grid-bg" />

        {/* PULL STRIP */}
        <div className="lg-pull-strip">
          <div style={{
            fontSize: "32px",
            opacity: progress,
            transform: `scale(${0.6 + progress * 0.4})`,
            transition: "transform 0.05s",
          }}>
            {emoji}
          </div>
          <div className="lg-pull-bar">
            <div className="lg-pull-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {/* CARD */}
        <div style={pageStyle} className="lg-card">

          <div className="lg-badge">
            <span className="lg-badge-dot" />
            Welcome Back
          </div>
          <div className="lg-title">Sign in to <span>FoodSave</span></div>
          <div className="lg-subtitle">Help us eliminate food waste — one delivery at a time</div>

          <form className="lg-form" onSubmit={handleLogin}>

            <div className="lg-field">
              <label className="lg-label">Login As</label>
              <div className="lg-toggle">
                <button
                  type="button"
                  className={`lg-toggle-btn ${form.user_type === "user" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, user_type: "user" })}
                >
                  <span className="lg-toggle-icon">🙋</span> User
                </button>
                <button
                  type="button"
                  className={`lg-toggle-btn ${form.user_type === "rider" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, user_type: "rider" })}
                >
                  <span className="lg-toggle-icon">🏍️</span> Rider
                </button>
              </div>
            </div>

            <div className="lg-divider" />

            <div className="lg-field">
              <label className="lg-label">Email</label>
              <input
                className="lg-input"
                type="email"
                name="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <input
                className="lg-input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className="lg-submit" type="submit" disabled={loading}>
              <div className="lg-btn-inner">
                Login →
              </div>
            </button>

          </form>

          <div className="lg-footer">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>Create one</span>
          </div>
        </div>

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="lg-overlay">
            <div className="lg-food-plate">
              <div className="lg-food-icon">🍲</div>
            </div>
            <div className="lg-overlay-text">Verifying your account</div>
            <div className="lg-overlay-sub">Securing access 🌱</div>
            <div className="lg-dots">
              <div className="lg-dot" />
              <div className="lg-dot" />
              <div className="lg-dot" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}