import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Signup({ setEmail }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // PROFILE IMAGE PREVIEW
  useEffect(() => {
    if (!profilePhoto) {
      setPhotoPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(profilePhoto);

    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePhoto]);

  // INPUT HANDLING
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  // PROFILE IMAGE VALIDATION
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Choose a JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile image cannot exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setProfilePhoto(file);
    setErrorMessage("");
  };

  // REMOVE PROFILE IMAGE
  const removePhoto = () => {
    setProfilePhoto(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SIGNUP
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");

    const username = form.username.trim();
    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

    // REQUIRED FIELD VALIDATION
    if (
      !username ||
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !form.password ||
      !form.confirm_password
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    // USERNAME VALIDATION
    if (username.length < 6) {
      setErrorMessage("Username must contain at least 6 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setErrorMessage(
        "Username can contain only letters, numbers and underscores."
      );
      return;
    }

    // EMAIL VALIDATION
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // PHONE VALIDATION
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    // PASSWORD VALIDATION
    if (form.password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    if (form.password.length > 128) {
      setErrorMessage("Password cannot exceed 128 characters.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // CREATE FORMDATA
    const formData = new FormData();

    formData.append("username", username);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("password", form.password);
    formData.append("confirm_password", form.confirm_password);
    formData.append("user_type", "user");

    if (profilePhoto) {
      formData.append("profile_image", profilePhoto);
    }

    setLoading(true);

    try {
      const response = await signup(formData);

      if (
        response.status === "signup_success_otp_sent" ||
        response.status === "otp_resent"
      ) {
        if (typeof setEmail === "function") {
          setEmail(email);
        }

        localStorage.setItem("verifyEmail", email);

        navigate("/verify-otp");

        return;
      }

      const messages = {
        user_exists: "This email is already registered. Please log in.",
        missing_fields: "Please complete all required fields.",
        password_mismatch: "Passwords do not match.",
        invalid_username: "Username must contain at least 6 characters.",
        weak_password: "Password must contain at least 8 characters.",
        file_too_large: "Profile image cannot exceed 5 MB.",
        otp_email_failed: "Unable to send your verification email.",
        invalid_user_type: "Invalid account type.",
        invalid_email: "Please enter a valid email address.",
        invalid_phone: "Please enter a valid phone number.",
      };

      setErrorMessage(
        messages[response.status] ||
          response.message ||
          response.status ||
          "Unable to create your account."
      );
    } catch (error) {
      console.error("Signup error:", error);

      setErrorMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGNUP
  const continueWithGoogle = () => {
    setErrorMessage("");

    window.location.assign(
      `${BASE_URL}/auth/google?user_type=user`
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .dw-signup,.dw-signup * {
          box-sizing:border-box;
        }

        .dw-signup {
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:34px 18px;
          position:relative;
          overflow:hidden;
          color:#f5f7f6;
          background:#080d0c;
          font-family:'DM Sans',sans-serif;
        }

        .dw-signup:before,.dw-signup:after {
          content:"";
          position:absolute;
          width:440px;
          height:440px;
          border-radius:50%;
          filter:blur(115px);
          pointer-events:none;
        }

        .dw-signup:before {
          background:#087f5b35;
          top:-220px;
          left:-170px;
        }

        .dw-signup:after {
          background:#4f46e52b;
          right:-210px;
          bottom:-230px;
        }

        .dw-signup-grid {
          position:absolute;
          inset:0;
          opacity:.2;
          pointer-events:none;
          background-image:
            linear-gradient(#ffffff09 1px,transparent 1px),
            linear-gradient(90deg,#ffffff09 1px,transparent 1px);
          background-size:48px 48px;
        }

        .dw-signup-card {
          position:relative;
          z-index:1;
          width:100%;
          max-width:780px;
          padding:36px;
          border:1px solid #ffffff18;
          border-radius:26px;
          background:#111a17ed;
          box-shadow:0 30px 100px #0008;
          backdrop-filter:blur(18px);
          animation:dwSignupEnter .5s ease both;
        }

        @keyframes dwSignupEnter {
          from {
            opacity:0;
            transform:translateY(20px) scale(.99);
          }
          to {
            opacity:1;
            transform:translateY(0) scale(1);
          }
        }

        .dw-signup-brand {
          display:flex;
          align-items:center;
          gap:12px;
          margin-bottom:28px;
        }

        .dw-signup-logo {
          width:46px;
          height:46px;
          display:grid;
          place-items:center;
          border-radius:15px;
          background:linear-gradient(135deg,#6ee7b7,#10b981);
          color:#052e22;
          font-size:22px;
          box-shadow:0 9px 30px #10b98130;
        }

        .dw-signup-brand-name {
          font:700 20px 'Space Grotesk';
        }

        .dw-signup-brand-tag {
          color:#7e9189;
          font-size:10px;
          letter-spacing:1.6px;
          margin-top:3px;
        }

        .dw-signup-eyebrow {
          color:#6ee7b7;
          font-size:10px;
          font-weight:800;
          letter-spacing:2px;
        }

        .dw-signup-heading {
          margin:10px 0 7px;
          font:700 clamp(28px,4vw,38px)/1.15 'Space Grotesk';
          letter-spacing:-1.3px;
        }

        .dw-signup-heading span {
          color:#6ee7b7;
        }

        .dw-signup-description {
          color:#91a198;
          font-size:12px;
          line-height:1.7;
          margin:0 0 24px;
        }

        .dw-photo {
          display:flex;
          align-items:center;
          gap:17px;
          padding:16px;
          margin-bottom:24px;
          border:1px dashed #ffffff2b;
          border-radius:17px;
          background:#ffffff06;
        }

        .dw-avatar {
          width:76px;
          height:76px;
          flex-shrink:0;
          overflow:hidden;
          display:grid;
          place-items:center;
          border-radius:50%;
          border:2px solid #34d39980;
          background:#1a2922;
          color:#6ee7b7;
          font:700 24px 'Space Grotesk';
        }

        .dw-avatar img {
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .dw-photo-title {
          font-size:13px;
          font-weight:800;
          margin-bottom:5px;
        }

        .dw-photo-hint {
          color:#84958c;
          font-size:10px;
          line-height:1.6;
          margin-bottom:10px;
        }

        .dw-file-label {
          display:inline-flex;
          align-items:center;
          gap:7px;
          padding:9px 12px;
          border:1px solid #34d39945;
          border-radius:9px;
          background:#34d39913;
          color:#6ee7b7;
          font-size:11px;
          font-weight:800;
          cursor:pointer;
          transition:.2s;
        }

        .dw-file-label:hover {
          background:#34d39925;
          transform:translateY(-1px);
        }

        .dw-file-input {
          display:none;
        }

        .dw-remove-photo {
          margin-left:9px;
          border:0;
          background:none;
          color:#fca5a5;
          font-size:10px;
          cursor:pointer;
        }

        .dw-fields {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }

        .dw-signup-field {
          min-width:0;
        }

        .dw-signup-field.full {
          grid-column:1 / -1;
        }

        .dw-signup-field label {
          display:block;
          color:#c1cec7;
          font-size:11px;
          font-weight:700;
          margin-bottom:8px;
        }

        .dw-signup-input-wrap {
          position:relative;
        }

        .dw-signup-input {
          display:block;
          width:100%;
          min-width:0;
          padding:13px 14px;
          border:1px solid #ffffff1c;
          border-radius:11px;
          outline:none;
          background:#ffffff08;
          color:#f4f7f5;
          font:12px 'DM Sans';
          transition:.2s;
        }

        .dw-signup-input:focus {
          border-color:#34d39999;
          box-shadow:0 0 0 3px #34d39915;
        }

        .dw-signup-input::placeholder {
          color:#63736b;
        }

        .dw-signup-password {
          padding-right:62px;
        }

        .dw-signup-show {
          position:absolute;
          right:11px;
          top:50%;
          transform:translateY(-50%);
          border:0;
          background:none;
          color:#6ee7b7;
          font-size:10px;
          font-weight:800;
          cursor:pointer;
        }

        .dw-signup-error {
          padding:11px 13px;
          margin:18px 0 0;
          border-radius:10px;
          font-size:11px;
          line-height:1.6;
          color:#fecaca;
          border:1px solid #f8717138;
          background:#ef444410;
        }

        .dw-signup-submit {
          width:100%;
          margin-top:22px;
          padding:15px;
          border:0;
          border-radius:12px;
          color:#052e22;
          background:linear-gradient(110deg,#6ee7b7,#10b981);
          font:800 13px 'Space Grotesk';
          cursor:pointer;
          transition:.2s;
          box-shadow:0 9px 25px #10b98125;
        }

        .dw-signup-submit:hover:not(:disabled) {
          transform:translateY(-2px);
          box-shadow:0 13px 30px #10b98140;
        }

        .dw-signup-submit:disabled {
          opacity:.55;
          cursor:not-allowed;
        }

        .dw-signup-divider {
          display:flex;
          align-items:center;
          gap:12px;
          margin:20px 0;
          color:#66766e;
          font-size:10px;
        }

        .dw-signup-divider:before,.dw-signup-divider:after {
          content:"";
          height:1px;
          flex:1;
          background:#ffffff16;
        }

        .dw-signup-google {
          width:100%;
          padding:12px;
          border:1px solid #ffffff20;
          border-radius:12px;
          color:#e8efeb;
          background:#ffffff08;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:11px;
          font:700 12px 'DM Sans';
          cursor:pointer;
          transition:.2s;
        }

        .dw-signup-google:hover {
          background:#ffffff12;
          border-color:#ffffff40;
        }

        .dw-signup-google b {
          color:white;
          font:700 17px Arial;
        }

        .dw-signup-footer {
          color:#87978f;
          text-align:center;
          font-size:11px;
          margin:21px 0 0;
        }

        .dw-signup-link {
          border:0;
          background:none;
          color:#6ee7b7;
          font:800 11px 'DM Sans';
          cursor:pointer;
          margin-left:4px;
        }

        .dw-signup-security {
          color:#63736b;
          text-align:center;
          font-size:10px;
          margin-top:20px;
        }

        @media(max-width:600px) {
          .dw-signup {
            padding:18px 11px;
          }

          .dw-signup-card {
            padding:24px 18px;
            border-radius:20px;
          }

          .dw-fields {
            grid-template-columns:1fr;
            gap:14px;
          }

          .dw-signup-field.full {
            grid-column:auto;
          }

          .dw-photo {
            align-items:flex-start;
          }
        }

        @media(prefers-reduced-motion:reduce) {
          .dw-signup-card {
            animation:none;
          }

          .dw-signup-submit,.dw-file-label {
            transition:none;
          }
        }
      `}</style>

      <main className="dw-signup">
        <div className="dw-signup-grid" />

        <section className="dw-signup-card">
          <div className="dw-signup-brand">
            <div className="dw-signup-logo">🌱</div>

            <div>
              <div className="dw-signup-brand-name">DWJD</div>
              <div className="dw-signup-brand-tag">
                DON'T WASTE · JUST DONATE
              </div>
            </div>
          </div>

          <div className="dw-signup-eyebrow">
            BECOME PART OF THE CHANGE
          </div>

          <h1 className="dw-signup-heading">
            Create your <span>account.</span>
          </h1>

          <p className="dw-signup-description">
            Join DWJD and help connect surplus food with the people who need
            it. Your journey towards making a difference starts here.
          </p>

          <form onSubmit={handleSubmit}>
            {/* PROFILE PHOTO */}
            <div className="dw-photo">
              <div className="dw-avatar">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" />
                ) : (
                  form.first_name.trim().charAt(0).toUpperCase() || "👤"
                )}
              </div>

              <div>
                <div className="dw-photo-title">
                  Your profile picture
                </div>

                <div className="dw-photo-hint">
                  JPEG, PNG or WEBP · Maximum 5 MB
                </div>

                <label className="dw-file-label">
                  ＋ Choose photo

                  <input
                    ref={fileInputRef}
                    className="dw-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                  />
                </label>

                {profilePhoto && (
                  <button
                    type="button"
                    className="dw-remove-photo"
                    onClick={removePhoto}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="dw-fields">
              <div className="dw-signup-field">
                <label htmlFor="signup-username">
                  Username
                </label>

                <input
                  id="signup-username"
                  className="dw-signup-input"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  minLength={6}
                  maxLength={30}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="dw-signup-field">
                <label htmlFor="signup-phone">
                  Phone number
                </label>

                <input
                  id="signup-phone"
                  className="dw-signup-input"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="dw-signup-field">
                <label htmlFor="signup-first-name">
                  First name
                </label>

                <input
                  id="signup-first-name"
                  className="dw-signup-input"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Your first name"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="dw-signup-field">
                <label htmlFor="signup-last-name">
                  Last name
                </label>

                <input
                  id="signup-last-name"
                  className="dw-signup-input"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Your last name"
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="dw-signup-field full">
                <label htmlFor="signup-email">
                  Email address
                </label>

                <input
                  id="signup-email"
                  className="dw-signup-input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="dw-signup-field">
                <label htmlFor="signup-password">
                  Password
                </label>

                <div className="dw-signup-input-wrap">
                  <input
                    id="signup-password"
                    className="dw-signup-input dw-signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="dw-signup-show"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="dw-signup-field">
                <label htmlFor="signup-confirm-password">
                  Confirm password
                </label>

                <div className="dw-signup-input-wrap">
                  <input
                    id="signup-confirm-password"
                    className="dw-signup-input dw-signup-password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="dw-signup-show"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="dw-signup-error" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              className="dw-signup-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating your account..."
                : "Create my account →"}
            </button>
          </form>

          <div className="dw-signup-divider">
            OR SIGN UP WITH
          </div>

          <button
            type="button"
            className="dw-signup-google"
            onClick={continueWithGoogle}
          >
            <b>G</b> Continue with Google
          </button>

          <div className="dw-signup-footer">
            Already have an account?

            <button
              type="button"
              className="dw-signup-link"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>

          <div className="dw-signup-security">
            🔒 Your information is protected by DWJD.
          </div>
        </section>
      </main>
    </>
  );
}