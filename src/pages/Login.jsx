
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = "https://back-end-project-group.onrender.com";

const GOOGLE_ERRORS = {
  cancelled: "Google sign-in was cancelled.",
  invalid_state: "Your Google sign-in session expired. Please try again.",
  verification_failed: "Google account verification failed.",
  account_type_mismatch: "This Google account is registered with a different account type.",
  account_conflict: "This Google account is linked to another account.",
  account_inactive: "Your account is inactive. Please contact support.",
  authentication_failed: "Google sign-in failed. Please try again.",
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: "",
    password: "",
    user_type: "user",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/afterlogin", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const googleError = searchParams.get("google_error");

    if (googleError) {
      setError(
        GOOGLE_ERRORS[googleError] ||
        "Unable to sign in with Google. Please try again."
      );
      searchParams.delete("google_error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setError("");
    setSuccess("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          user_type: form.user_type,
        }),
      });

      const data = await response.json();

      if (data.status === "login_success") {
        if (!data.token || !data.user) {
          throw new Error("The server returned an incomplete login response.");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/afterlogin", { replace: true });
        return;
      }

      if (data.status === "otp_required") {
        localStorage.setItem("verifyEmail", form.email.trim().toLowerCase());
        navigate("/verify-otp");
        return;
      }

      setError(
        data.message ||
        (data.status === "account_inactive"
          ? "Your account is inactive."
          : "Invalid email, password, or account type.")
      );
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogle = () => {
    setError("");
    const role = form.user_type;

    window.location.assign(
      `${BASE_URL}/auth/google?user_type=${encodeURIComponent(role)}`
    );
  };

  const openForgotPassword = () => {
    setResetForm({
      email: form.email.trim().toLowerCase(),
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setResetStep(1);
    setError("");
    setSuccess("");
    setForgotOpen(true);
  };

  const requestResetOtp = async (event) => {
    event.preventDefault();
    if (resetLoading) return;

    setResetLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetForm.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to request password reset.");
      }

      setResetStep(2);
      setSuccess(
        data.message ||
        "If an eligible account exists, a verification code will be sent."
      );
    } catch (err) {
      setError(err.message || "Unable to send the verification code.");
    } finally {
      setResetLoading(false);
    }
  };

  const submitNewPassword = async (event) => {
    event.preventDefault();

    if (resetForm.newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setResetLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetForm.email.trim().toLowerCase(),
          otp: resetForm.otp.trim(),
          newPassword: resetForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "password_reset_success") {
        throw new Error(data.message || "Unable to reset your password.");
      }

      setResetStep(3);
      setSuccess("Your password has been updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .dw-auth, .dw-auth * { box-sizing:border-box; }
        .dw-auth {
          min-height:100vh; display:flex; align-items:center; justify-content:center;
          padding:30px 18px; position:relative; overflow:hidden;
          color:#f4f7f5; background:#080d0c; font-family:'DM Sans',sans-serif;
        }
        .dw-auth:before,.dw-auth:after {
          content:""; position:absolute; width:420px; height:420px;
          border-radius:50%; filter:blur(115px); pointer-events:none;
        }
        .dw-auth:before { background:#087f5b38; top:-220px; left:-160px; }
        .dw-auth:after { background:#4f46e52a; right:-190px; bottom:-220px; }
        .dw-grid {
          position:absolute; inset:0; opacity:.2; pointer-events:none;
          background-image:linear-gradient(#ffffff09 1px,transparent 1px),
            linear-gradient(90deg,#ffffff09 1px,transparent 1px);
          background-size:48px 48px;
        }
        .dw-layout {
          width:100%; max-width:1020px; display:grid;
          grid-template-columns:1fr 440px; gap:48px;
          align-items:center; position:relative; z-index:1;
        }
        .dw-story { padding:20px 0; }
        .dw-brand { display:flex; align-items:center; gap:12px; margin-bottom:58px; }
        .dw-logo {
          width:48px; height:48px; display:grid; place-items:center;
          border-radius:16px; background:linear-gradient(135deg,#6ee7b7,#10b981);
          color:#052e22; font-size:24px; box-shadow:0 10px 35px #10b98130;
        }
        .dw-brand-name { font:700 21px 'Space Grotesk'; }
        .dw-brand-tag { color:#7e9189; font-size:10px; letter-spacing:2px; margin-top:3px; }
        .dw-eyebrow { color:#6ee7b7; font-size:11px; font-weight:800; letter-spacing:2px; }
        .dw-story h1 {
          max-width:520px; margin:15px 0;
          font:700 clamp(40px,5vw,62px)/1.05 'Space Grotesk';
          letter-spacing:-2.5px;
        }
        .dw-story h1 span { color:#6ee7b7; }
        .dw-story p { color:#9aaba4; max-width:430px; line-height:1.8; font-size:14px; }
        .dw-points { display:grid; gap:15px; margin-top:36px; }
        .dw-point { display:flex; align-items:center; gap:12px; color:#c5d3cd; font-size:13px; }
        .dw-point-icon {
          width:35px; height:35px; border:1px solid #ffffff16;
          background:#ffffff08; border-radius:11px; display:grid; place-items:center;
        }
        .dw-card {
          width:100%; padding:34px; border:1px solid #ffffff18;
          border-radius:25px; background:#111a17ed; backdrop-filter:blur(18px);
          box-shadow:0 30px 100px #0008; animation:dwEnter .5s ease both;
        }
        @keyframes dwEnter { from {opacity:0;transform:translateY(20px)} to {opacity:1;transform:translateY(0)} }
        .dw-pill {
          display:inline-flex; align-items:center; gap:8px; padding:7px 11px;
          border:1px solid #34d39935; border-radius:30px;
          color:#6ee7b7; background:#34d39910; font-size:10px;
          font-weight:800; letter-spacing:1.2px; text-transform:uppercase;
        }
        .dw-pill i { width:6px;height:6px;border-radius:50%;background:#34d399; }
        .dw-card h2 { font:700 30px 'Space Grotesk'; margin:17px 0 5px; letter-spacing:-1px; }
        .dw-muted { color:#87978f; font-size:12px; line-height:1.7; margin:0 0 25px; }
        .dw-label { display:block; color:#bdcbc4; font-size:11px; font-weight:700; margin:0 0 8px; }
        .dw-role { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:20px; }
        .dw-role button {
          padding:12px; border:1px solid #ffffff18; border-radius:12px;
          background:#ffffff08; color:#aab8b1; font-weight:700; cursor:pointer; transition:.2s;
        }
        .dw-role button.active { border-color:#34d39990;color:#6ee7b7;background:#34d39916; }
        .dw-field { margin-bottom:16px; }
        .dw-input-wrap { position:relative; }
        .dw-input {
          width:100%; padding:13px 14px; border:1px solid #ffffff1c;
          border-radius:12px; background:#ffffff08; color:#f4f7f5;
          outline:none; font:13px 'DM Sans'; transition:.2s;
        }
        .dw-input:focus { border-color:#34d39999; box-shadow:0 0 0 3px #34d39915; }
        .dw-input::placeholder { color:#63736b; }
        .dw-password { padding-right:65px; }
        .dw-show {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:0; color:#6ee7b7; font-size:11px;
          font-weight:700; cursor:pointer;
        }
        .dw-forgot-row { display:flex; justify-content:flex-end; margin:-5px 0 17px; }
        .dw-link { border:0; padding:0; background:none; color:#6ee7b7; font:700 11px 'DM Sans'; cursor:pointer; }
        .dw-primary {
          width:100%; border:0; border-radius:12px; padding:14px;
          color:#052e22; background:linear-gradient(110deg,#6ee7b7,#10b981);
          font:800 13px 'Space Grotesk'; cursor:pointer; transition:.2s;
          box-shadow:0 9px 25px #10b98125;
        }
        .dw-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 13px 30px #10b98140; }
        .dw-primary:disabled { opacity:.55; cursor:not-allowed; }
        .dw-divider { display:flex; align-items:center; gap:12px; margin:20px 0; color:#66766e; font-size:10px; }
        .dw-divider:before,.dw-divider:after { content:"";height:1px;flex:1;background:#ffffff16; }
        .dw-google {
          width:100%; padding:12px; border:1px solid #ffffff20; border-radius:12px;
          color:#e8efeb; background:#ffffff08; display:flex; align-items:center;
          justify-content:center; gap:11px; font:700 12px 'DM Sans'; cursor:pointer; transition:.2s;
        }
        .dw-google:hover { background:#ffffff12; border-color:#ffffff40; }
        .dw-google b { color:white; font:700 17px Arial; }
        .dw-footer { color:#87978f; text-align:center; font-size:11px; margin:22px 0 0; }
        .dw-footer button { margin-left:4px; }
        .dw-message { padding:11px 12px; margin:0 0 15px; border-radius:10px; font-size:11px; line-height:1.6; }
        .dw-error { color:#fecaca; border:1px solid #f8717138; background:#ef444410; }
        .dw-success { color:#a7f3d0; border:1px solid #34d39938; background:#10b98112; }
        .dw-modal-backdrop {
          position:fixed; inset:0; z-index:10; display:grid; place-items:center;
          padding:18px; background:#000b; backdrop-filter:blur(9px);
        }
        .dw-modal {
          width:100%; max-width:420px; padding:28px; border-radius:20px;
          border:1px solid #ffffff20; background:#111a17; box-shadow:0 25px 90px #0009;
          animation:dwEnter .25s ease both;
        }
        .dw-modal h3 { font:700 23px 'Space Grotesk'; margin:16px 0 7px; }
        .dw-modal p { color:#91a198; font-size:12px; line-height:1.7; margin:0 0 20px; }
        .dw-actions { display:flex; gap:10px; margin-top:16px; }
        .dw-secondary {
          flex:1; border:1px solid #ffffff20; border-radius:11px;
          background:transparent; color:#c3d0c9; padding:12px;
          font-size:12px; font-weight:700; cursor:pointer;
        }
        @media(max-width:820px) {
          .dw-layout { max-width:480px; grid-template-columns:1fr; gap:20px; }
          .dw-story { display:none; }
        }
        @media(max-width:480px) {
          .dw-auth { padding:18px 12px; }
          .dw-card { padding:25px 19px; border-radius:20px; }
        }
        @media(prefers-reduced-motion:reduce) {
          .dw-card,.dw-modal { animation:none; }
          .dw-primary,.dw-google { transition:none; }
        }
      `}</style>

      <main className="dw-auth">
        <div className="dw-grid" />

        <div className="dw-layout">
          <section className="dw-story">
            <div className="dw-brand">
              <div className="dw-logo">🌱</div>
              <div>
                <div className="dw-brand-name">DWJD</div>
                <div className="dw-brand-tag">DON'T WASTE · JUST DONATE</div>
              </div>
            </div>

            <div className="dw-eyebrow">GOOD FOOD. GOOD PEOPLE. BETTER PLANET.</div>
            <h1>Small actions.<br /><span>Big impact.</span></h1>
            <p>
              Join a community that connects surplus food with people who need it.
              Every donation is a step towards a world with less waste.
            </p>

            <div className="dw-points">
              <div className="dw-point"><span className="dw-point-icon">🍲</span> Rescue surplus food</div>
              <div className="dw-point"><span className="dw-point-icon">🤝</span> Support your community</div>
              <div className="dw-point"><span className="dw-point-icon">🌍</span> Make every meal matter</div>
            </div>
          </section>

          <section className="dw-card">
            <div className="dw-pill"><i /> Welcome back</div>
            <h2>Sign in to DWJD</h2>
            <p className="dw-muted">Continue your journey. A little help can make a big difference.</p>

            {error && <div className="dw-message dw-error" role="alert">{error}</div>}
            {success && <div className="dw-message dw-success" role="status">{success}</div>}

            <form onSubmit={handleLogin}>
              <label className="dw-label">Continue as</label>
              <div className="dw-role">
                <button type="button" className={form.user_type === "user" ? "active" : ""}
                  onClick={() => setForm(p => ({ ...p, user_type: "user" }))}>
                  🙋 User
                </button>
                <button type="button" className={form.user_type === "rider" ? "active" : ""}
                  onClick={() => setForm(p => ({ ...p, user_type: "rider" }))}>
                  🏍️ Rider
                </button>
              </div>

              <div className="dw-field">
                <label className="dw-label" htmlFor="login-email">Email address</label>
                <input id="login-email" className="dw-input" type="email" name="email"
                  autoComplete="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>

              <div className="dw-field">
                <label className="dw-label" htmlFor="login-password">Password</label>
                <div className="dw-input-wrap">
                  <input id="login-password" className="dw-input dw-password"
                    type={showPassword ? "text" : "password"} name="password"
                    autoComplete="current-password" placeholder="Enter your password"
                    value={form.password} onChange={handleChange} required />
                  <button type="button" className="dw-show"
                    onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="dw-forgot-row">
                <button type="button" className="dw-link" onClick={openForgotPassword}>
                  Forgot password?
                </button>
              </div>

              <button className="dw-primary" type="submit" disabled={loading}>
                {loading ? "Signing you in..." : "Sign in →"}
              </button>
            </form>

            <div className="dw-divider">OR CONTINUE WITH</div>

            <button type="button" className="dw-google" onClick={continueWithGoogle}>
              <b>G</b> Continue with Google
            </button>

            <div className="dw-footer">
              Don't have an account?
              <button type="button" className="dw-link" onClick={() => navigate("/signup")}>
                Create account
              </button>
            </div>
          </section>
        </div>
      </main>

      {forgotOpen && (
        <div className="dw-modal-backdrop" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setForgotOpen(false);
        }}>
          <section className="dw-modal" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
            <div className="dw-pill"><i /> Account recovery</div>
            <h3 id="forgot-title">
              {resetStep === 3 ? "Password updated!" : "Reset your password"}
            </h3>
            <p>
              {resetStep === 1 && "Enter your registered email. If an eligible account exists, we'll send a verification code."}
              {resetStep === 2 && "Enter the code sent to your email and choose a new password."}
              {resetStep === 3 && "Your password has been changed. You can now sign in."}
            </p>

            {error && <div className="dw-message dw-error">{error}</div>}
            {success && <div className="dw-message dw-success">{success}</div>}

            {resetStep === 1 && (
              <form onSubmit={requestResetOtp}>
                <label className="dw-label" htmlFor="reset-email">Registered email</label>
                <input id="reset-email" className="dw-input" type="email" required
                  value={resetForm.email}
                  onChange={e => setResetForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com" />
                <div className="dw-actions">
                  <button type="button" className="dw-secondary" onClick={() => setForgotOpen(false)}>Cancel</button>
                  <button className="dw-primary" type="submit" disabled={resetLoading}>
                    {resetLoading ? "Sending..." : "Send code"}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={submitNewPassword}>
                <div className="dw-field">
                  <label className="dw-label" htmlFor="reset-otp">6-digit verification code</label>
                  <input id="reset-otp" className="dw-input" inputMode="numeric"
                    autoComplete="one-time-code" maxLength={6} required
                    value={resetForm.otp}
                    onChange={e => setResetForm(p => ({
                      ...p, otp: e.target.value.replace(/\D/g, "")
                    }))}
                    placeholder="Enter OTP" />
                </div>
                <div className="dw-field">
                  <label className="dw-label" htmlFor="new-password">New password</label>
                  <input id="new-password" className="dw-input" type="password"
                    minLength={8} required value={resetForm.newPassword}
                    onChange={e => setResetForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="At least 8 characters" />
                </div>
                <div className="dw-field">
                  <label className="dw-label" htmlFor="confirm-new-password">Confirm password</label>
                  <input id="confirm-new-password" className="dw-input" type="password"
                    minLength={8} required value={resetForm.confirmPassword}
                    onChange={e => setResetForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password" />
                </div>
                <div className="dw-actions">
                  <button type="button" className="dw-secondary" onClick={() => {
                    setResetStep(1); setError(""); setSuccess("");
                  }}>Back</button>
                  <button className="dw-primary" type="submit" disabled={resetLoading}>
                    {resetLoading ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 3 && (
              <button className="dw-primary" onClick={() => {
                setForgotOpen(false);
                setForm(p => ({ ...p, email: resetForm.email }));
                setError("");
                setSuccess("");
              }}>Back to sign in</button>
            )}
          </section>
        </div>
      )}
    </>
  );
}
