import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";

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
  const [errorMessage, setErrorMessage] = useState("");

  // Create and clean up the local image preview URL.
  useEffect(() => {
    if (!profilePhoto) {
      setPhotoPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(profilePhoto);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePhoto]);

  // Handle text fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  // Handle profile-picture selection.
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Please select a JPEG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "Profile picture must not exceed 5 MB."
      );

      event.target.value = "";
      return;
    }

    setProfilePhoto(file);
    setErrorMessage("");
  };

  // Remove the selected picture.
  const removePhoto = () => {
    setProfilePhoto(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setErrorMessage("");
  };

  // Validate and submit registration.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");

    const username = form.username.trim();
    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

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

    if (username.length < 6) {
      setErrorMessage(
        "Username must be at least 6 characters."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (form.password !== form.confirm_password) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // FormData is required for uploading an actual image file.
    const formData = new FormData();

    formData.append("username", username);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("password", form.password);
    formData.append(
      "confirm_password",
      form.confirm_password
    );
    formData.append("user_type", "user");

    // Match the backend's profileUpload.single("profile_image").
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

        navigate("/verify-otp");
        return;
      }

      if (response.status === "user_exists") {
        setErrorMessage(
          "This email is already registered. Please log in."
        );
        return;
      }

      if (response.status === "missing_fields") {
        setErrorMessage(
          "Please complete all required fields."
        );
        return;
      }

      if (response.status === "password_mismatch") {
        setErrorMessage("Passwords do not match.");
        return;
      }

      if (response.status === "invalid_username") {
        setErrorMessage(
          "Username must be at least 6 characters."
        );
        return;
      }

      if (response.status === "weak_password") {
        setErrorMessage(
          "Password must be at least 8 characters."
        );
        return;
      }

      if (response.status === "file_too_large") {
        setErrorMessage(
          "Your profile picture must not exceed 5 MB."
        );
        return;
      }

      if (
        response.status === "invalid_image" ||
        response.status === "upload_error"
      ) {
        setErrorMessage(
          response.message ||
            "The selected profile picture is invalid."
        );
        return;
      }

      if (response.status === "otp_email_failed") {
        setErrorMessage(
          "We couldn't send your verification email. Please try again."
        );
        return;
      }

      setErrorMessage(
        response.message ||
          response.status ||
          "Unable to create your account. Please try again."
      );
    } catch (error) {
      console.error("Signup error:", error);

      setErrorMessage(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .sg-root {
          min-height: 100vh;
          box-sizing: border-box;
          padding: 40px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
        }

        .sg-root *,
        .sg-root *::before,
        .sg-root *::after {
          box-sizing: border-box;
        }

        .sg-root::before,
        .sg-root::after {
          content: '';
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .sg-root::before {
          top: -180px;
          left: -150px;
          background: rgba(52, 211, 153, .11);
        }

        .sg-root::after {
          right: -180px;
          bottom: -180px;
          background: rgba(99, 102, 241, .13);
        }

        .sg-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .4;
          background-image:
            linear-gradient(rgba(52,211,153,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,.035) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .sg-card {
          width: 100%;
          max-width: 740px;
          position: relative;
          z-index: 1;
          padding: 38px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 26px;
          background: rgba(14, 16, 27, .93);
          box-shadow: 0 30px 100px rgba(0,0,0,.4);
          animation: sg-enter .55s ease both;
        }

        @keyframes sg-enter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sg-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .sg-logo {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: linear-gradient(135deg, #34d399, #10b981);
          color: #06130e;
          font-size: 20px;
          font-weight: 800;
          box-shadow: 0 8px 28px rgba(16,185,129,.2);
        }

        .sg-brand-title {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .sg-brand-sub {
          margin: 4px 0 0;
          color: #81869b;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 1.5px;
        }

        .sg-heading {
          margin: 0;
          font-size: clamp(28px, 4vw, 37px);
          letter-spacing: -1.4px;
          line-height: 1.15;
        }

        .sg-heading span {
          color: #34d399;
        }

        .sg-description {
          margin: 12px 0 28px;
          color: #9699ad;
          font-size: 13px;
          line-height: 1.8;
        }

        .sg-photo-section {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px;
          margin-bottom: 26px;
          border: 1px dashed rgba(255,255,255,.15);
          border-radius: 18px;
          background: rgba(255,255,255,.018);
        }

        .sg-avatar {
          width: 82px;
          height: 82px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          border: 2px solid rgba(52,211,153,.4);
          background: #171b29;
          color: #34d399;
          font-size: 28px;
          font-weight: 800;
        }

        .sg-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sg-photo-title {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 700;
        }

        .sg-photo-hint {
          margin: 0 0 12px;
          color: #81869b;
          font-size: 11px;
          line-height: 1.6;
        }

        .sg-file-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          border-radius: 9px;
          padding: 9px 12px;
          background: rgba(52,211,153,.1);
          border: 1px solid rgba(52,211,153,.24);
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 700;
          transition: .2s;
        }

        .sg-file-label:hover {
          background: rgba(52,211,153,.18);
          transform: translateY(-1px);
        }

        .sg-file-input {
          display: none;
        }

        .sg-remove-photo {
          display: block;
          margin-top: 9px;
          padding: 0;
          border: 0;
          background: none;
          color: #fca5a5;
          font-size: 11px;
          cursor: pointer;
        }

        .sg-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 19px;
        }

        .sg-field {
          min-width: 0;
        }

        .sg-field-full {
          grid-column: 1 / -1;
        }

        .sg-field label {
          display: block;
          margin-bottom: 8px;
          color: #c4c6d5;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .3px;
        }

        .sg-field input:not([type="checkbox"]) {
          display: block;
          width: 100%;
          min-width: 0;
          padding: 13px 14px;
          outline: none;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 11px;
          background: rgba(255,255,255,.035);
          color: #f4f4f5;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          transition: border-color .2s, box-shadow .2s;
        }

        .sg-field input::placeholder {
          color: #62677b;
        }

        .sg-field input:focus {
          border-color: rgba(52,211,153,.7);
          box-shadow: 0 0 0 3px rgba(52,211,153,.08);
        }

        .sg-error {
          margin: 22px 0 0;
          padding: 12px 14px;
          border: 1px solid rgba(248,113,113,.25);
          border-radius: 11px;
          background: rgba(248,113,113,.08);
          color: #fca5a5;
          font-size: 12px;
          line-height: 1.6;
        }

        .sg-submit {
          width: 100%;
          margin-top: 25px;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(100deg, #34d399, #10b981);
          color: #052e22;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .2s, box-shadow .2s, opacity .2s;
        }

        .sg-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(16,185,129,.2);
        }

        .sg-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .sg-footer {
          margin: 22px 0 0;
          text-align: center;
          color: #81869b;
          font-size: 12px;
        }

        .sg-link {
          padding: 0;
          border: 0;
          background: none;
          color: #6ee7b7;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .sg-security {
          margin-top: 23px;
          padding-top: 17px;
          border-top: 1px solid rgba(255,255,255,.07);
          color: #6f7488;
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .3px;
        }

        @media (max-width: 560px) {
          .sg-root {
            padding: 20px 12px;
          }

          .sg-card {
            padding: 24px 18px;
            border-radius: 20px;
          }

          .sg-fields {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .sg-field-full {
            grid-column: auto;
          }

          .sg-photo-section {
            align-items: flex-start;
            gap: 13px;
            padding: 13px;
          }

          .sg-avatar {
            width: 66px;
            height: 66px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sg-card {
            animation: none;
          }

          .sg-submit,
          .sg-file-label {
            transition: none;
          }
        }
      `}</style>

      <main className="sg-root">
        <div className="sg-grid" />

        <section className="sg-card">
          <div className="sg-brand">
            <div className="sg-logo">D</div>

            <div>
              <h2 className="sg-brand-title">DWJD</h2>
              <p className="sg-brand-sub">
                JOIN OUR COMMUNITY
              </p>
            </div>
          </div>

          <h1 className="sg-heading">
            Create your <span>account.</span>
          </h1>

          <p className="sg-description">
            Set up your profile and become part of the
            DWJD community. Your email will be verified
            before you sign in.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Profile picture */}

            <div className="sg-photo-section">
              <div className="sg-avatar">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Selected profile preview"
                  />
                ) : (
                  <span>
                    {form.first_name.trim()
                      ? form.first_name.trim()[0].toUpperCase()
                      : "?"}
                  </span>
                )}
              </div>

              <div>
                <p className="sg-photo-title">
                  Your profile picture
                </p>

                <p className="sg-photo-hint">
                  Optional · JPEG, PNG or WEBP · Maximum 5 MB
                </p>

                <label
                  className="sg-file-label"
                  htmlFor="profile_image"
                >
                  {profilePhoto
                    ? "Change picture"
                    : "Choose picture"}
                </label>

                <input
                  ref={fileInputRef}
                  id="profile_image"
                  className="sg-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                />

                {profilePhoto && (
                  <button
                    className="sg-remove-photo"
                    type="button"
                    onClick={removePhoto}
                  >
                    Remove picture
                  </button>
                )}
              </div>
            </div>

            {/* Form fields */}

            <div className="sg-fields">
              <div className="sg-field">
                <label htmlFor="username">
                  USERNAME
                </label>

                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  minLength={6}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="sg-field">
                <label htmlFor="phone">
                  PHONE NUMBER
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="sg-field">
                <label htmlFor="first_name">
                  FIRST NAME
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="sg-field">
                <label htmlFor="last_name">
                  LAST NAME
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="sg-field sg-field-full">
                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="sg-field">
                <label htmlFor="password">
                  PASSWORD
                </label>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="sg-field">
                <label htmlFor="confirm_password">
                  CONFIRM PASSWORD
                </label>

                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="sg-field sg-field-full">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    color: "#9699ad",
                    fontSize: 12,
                    fontWeight: 400,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(event.target.checked)
                    }
                    style={{
                      width: 15,
                      height: 15,
                      accentColor: "#34d399",
                    }}
                  />

                  Show password
                </label>
              </div>
            </div>

            {/* Error message */}

            {errorMessage && (
              <div className="sg-error" role="alert">
                {errorMessage}
              </div>
            )}

            {/* Submit button */}

            <button
              className="sg-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating your account..."
                : "Create Account →"}
            </button>
          </form>

          <p className="sg-footer">
            Already have an account?{" "}
            <button
              type="button"
              className="sg-link"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </p>

          <div className="sg-security">
            EMAIL VERIFICATION · SECURE PASSWORD HASHING
          </div>
        </section>
      </main>
    </>
  );
}