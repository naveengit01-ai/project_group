import { useState, useEffect } from "react";
import { verifyOtp, resendOtp } from "../api";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp({ email: propEmail }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("verifyEmail");
    if (propEmail) {
      setEmail(propEmail);
      localStorage.setItem("verifyEmail", propEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      alert("Email missing. Please sign up again.");
      navigate("/signup");
    }
  }, [propEmail, navigate]);

  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) { alert("Enter valid 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      if (res.status === "account_verified" || res.status === "already_verified") {
        setSuccess(true);
        localStorage.removeItem("verifyEmail");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        alert(res.status);
      }
    } catch { alert("Server error"); }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const res = await resendOtp({ email });
      if (res.status === "otp_resent") {
        setResendTimer(30);
      } else { alert(res.status); }
    } catch { alert("Unable to resend OTP"); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        html, body { margin: 0; background: #07080f; }

        .vo-root {
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

        .vo-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .vo-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }

        /* CARD */
        .vo-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 40px 36px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.04) inset;
          animation: voCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          box-sizing: border-box;
        }

        @keyframes voCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .vo-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* BADGE */
        .vo-badge {
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

        .vo-badge-dot {
          width: 6px; height: 6px;
          background: #34d399;
          border-radius: 50%;
          animation: voBlink 2s ease-in-out infinite;
        }

        @keyframes voBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .vo-title {
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

        .vo-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .vo-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.35);
          margin-bottom: 6px;
        }

        .vo-email {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #34d399;
          margin-bottom: 28px;
          word-break: break-all;
        }

        /* OTP INPUT ROW */
        .vo-otp-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .vo-otp-box {
          width: 52px; height: 56px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 22px;
          font-weight: 400;
          color: #eeeaf4;
          outline: none;
          transition: all 0.2s;
          caret-color: #34d399;
        }

        .vo-otp-box:focus {
          border-color: rgba(52,211,153,0.5);
          background: rgba(52,211,153,0.05);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.1);
        }

        .vo-otp-box.filled {
          border-color: rgba(52,211,153,0.35);
          color: #34d399;
        }

        /* PROGRESS BAR */
        .vo-progress-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .vo-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #34d399, #10b981);
          border-radius: 100px;
          transition: width 0.3s ease;
        }

        /* SUBMIT */
        .vo-submit {
          width: 100%;
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
          margin-bottom: 10px;
        }

        .vo-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }

        .vo-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(52,211,153,0.45);
        }

        .vo-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .vo-btn-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; z-index: 1;
        }

        .vo-btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(7,8,15,0.3);
          border-top-color: #07080f;
          border-radius: 50%;
          animation: voSpin 0.7s linear infinite;
        }

        @keyframes voSpin { to { transform: rotate(360deg); } }

        /* RESEND */
        .vo-resend {
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.35);
        }

        .vo-resend-link {
          color: #34d399;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .vo-resend-link:hover { opacity: 0.75; }

        .vo-resend-link.disabled {
          color: rgba(238,234,244,0.25);
          cursor: not-allowed;
        }

        /* TIMER RING */
        .vo-timer {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 4px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.4);
          margin-top: 8px;
        }

        .vo-timer-dot {
          width: 5px; height: 5px;
          background: rgba(52,211,153,0.5);
          border-radius: 50%;
          animation: voBlink 1s ease-in-out infinite;
        }

        /* SUCCESS STATE */
        .vo-success {
          text-align: center;
          padding: 24px 0;
          animation: voCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        .vo-success-icon {
          font-size: 52px;
          display: block;
          margin-bottom: 16px;
          animation: successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes successPop {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1) rotate(0); opacity: 1; }
        }

        .vo-success-title {
          font-size: 22px;
          font-weight: 800;
          color: #34d399;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .vo-success-sub {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        .vo-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0 16px;
        }

        @media (max-width: 480px) {
          .vo-card { padding: 32px 20px; }
          .vo-otp-box { width: 44px; height: 50px; font-size: 20px; }
        }
      `}</style>

      <div className="vo-root">
        <div className="vo-grid-bg" />

        <div className="vo-card">
          {success ? (
            <div className="vo-success">
              <span className="vo-success-icon">✅</span>
              <div className="vo-success-title">Email Verified!</div>
              <div className="vo-success-sub">Redirecting you to login 🌱</div>
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="vo-badge">
                <span className="vo-badge-dot" />
                OTP Verification
              </div>
              <div className="vo-title">Verify your <span>Email</span></div>
              <div className="vo-subtitle">6-digit code sent to</div>
              <div className="vo-email">{email}</div>

              {/* PROGRESS */}
              <div className="vo-progress-track">
                <div
                  className="vo-progress-fill"
                  style={{ width: `${(otp.length / 6) * 100}%` }}
                />
              </div>

              {/* OTP BOXES */}
              <div className="vo-otp-row">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    className={`vo-otp-box ${otp[i] ? "filled" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (!val) {
                        setOtp(prev => prev.slice(0, i) + prev.slice(i + 1));
                        return;
                      }
                      const next = (otp.slice(0, i) + val + otp.slice(i + 1)).slice(0, 6);
                      setOtp(next);
                      // auto-focus next
                      const boxes = document.querySelectorAll(".vo-otp-box");
                      if (i < 5 && val) boxes[i + 1]?.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        document.querySelectorAll(".vo-otp-box")[i - 1]?.focus();
                      }
                    }}
                    onPaste={e => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      setOtp(pasted);
                    }}
                  />
                ))}
              </div>

              <div className="vo-divider" />

              {/* SUBMIT */}
              <button
                className="vo-submit"
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
              >
                <div className="vo-btn-inner">
                  {loading && <span className="vo-btn-spinner" />}
                  {loading ? "Verifying..." : "Verify Email →"}
                </div>
              </button>

              {/* RESEND */}
              <div className="vo-resend">
                Didn't receive the code?{" "}
                {resendTimer > 0 ? (
                  <div style={{ marginTop: "8px", display: "flex", justifyContent: "center" }}>
                    <div className="vo-timer">
                      <span className="vo-timer-dot" />
                      Resend in {resendTimer}s
                    </div>
                  </div>
                ) : (
                  <span className="vo-resend-link" onClick={handleResend}>
                    Resend OTP
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}