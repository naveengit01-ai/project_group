import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://back-end-project-group.onrender.com";

export default function BecomeRider() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [emailEligible, setEmailEligible] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Become a Rider | DWJD";
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (name === "email") {
      setEmailEligible(false);
      setMessage("");
    }
  };

  const verifyEmail = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setMessageType("error");
      setMessage("Enter your first name, last name, and email first.");
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rider/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const data = await response.json();

      if (!response.ok || data.status !== "email_eligible") {
        setEmailEligible(false);
        setMessageType("error");
        setMessage(data.message || "This email cannot be used for a rider request.");
        return;
      }

      setEmailEligible(true);
      setMessageType("success");
      setMessage("Email is eligible. Enter your mobile number to continue.");
    } catch (error) {
      setMessageType("error");
      setMessage("We couldn't check your email. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!emailEligible) {
      setMessageType("error");
      setMessage("Please verify your email eligibility first.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rider/request-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok || data.status !== "request_submitted") {
        setMessageType("error");
        setMessage(data.message || "We couldn't submit your request. Please try again.");
        return;
      }

      setSuccess(true);
      setMessageType("success");
      setMessage(
        "Your request was submitted successfully. Our Customer Support team will review it within 24 hours."
      );

      // This page is opened by the Become a Rider button using window.open().
      // Browsers generally allow script-closing tabs opened by scripts.
      window.setTimeout(() => {
        window.close();
      }, 3500);
    } catch (error) {
      setMessageType("error");
      setMessage("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "13px 14px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    color: "#111827",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at top left, rgba(74,222,128,.15), transparent 35%), #f3f6f4",
        fontFamily: "'DM Sans', Arial, sans-serif",
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: "100%",
          maxWidth: 540,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          padding: "clamp(24px, 5vw, 42px)",
          boxShadow: "0 24px 70px rgba(15, 23, 42, .10)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            display: "grid",
            placeItems: "center",
            borderRadius: 16,
            background: "#dcfce7",
            color: "#166534",
            fontSize: 26,
            marginBottom: 22,
          }}
        >
          🚴
        </div>

        <p
          style={{
            color: "#15803d",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          DWJD Rider Community
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", lineHeight: 1.15, color: "#111827", margin: "0 0 12px" }}>
          Become a Rider
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
          Share your details to request a rider account. Our Customer Support team
          will review your request within 24 hours.
        </p>

        {success ? (
          <div
            role="status"
            style={{
              border: "1px solid #86efac",
              background: "#f0fdf4",
              color: "#166534",
              borderRadius: 16,
              padding: 20,
              lineHeight: 1.7,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
            <strong>Request submitted successfully!</strong>
            <p style={{ margin: "8px 0 0" }}>{message}</p>
            <p style={{ fontSize: 13, margin: "10px 0 0" }}>
              This tab will close automatically. If your browser blocks it, you can close it yourself.
            </p>
          </div>
        ) : (
          <form onSubmit={submitRequest}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700 }}>
                First name
                <input
                  name="first_name"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={updateField}
                  required
                  maxLength={80}
                  placeholder="Enter first name"
                  style={{ ...inputStyle, marginTop: 8 }}
                />
              </label>
              <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700 }}>
                Last name
                <input
                  name="last_name"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={updateField}
                  required
                  maxLength={80}
                  placeholder="Enter last name"
                  style={{ ...inputStyle, marginTop: 8 }}
                />
              </label>
            </div>

            <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700, marginTop: 18 }}>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                required
                maxLength={254}
                placeholder="you@example.com"
                style={{ ...inputStyle, marginTop: 8 }}
              />
            </label>

            <button
              type="button"
              onClick={verifyEmail}
              disabled={checkingEmail}
              style={{
                width: "100%",
                marginTop: 12,
                padding: 13,
                border: "1px solid #bbf7d0",
                borderRadius: 12,
                background: checkingEmail ? "#dcfce7" : "#f0fdf4",
                color: "#166534",
                fontWeight: 800,
                cursor: checkingEmail ? "wait" : "pointer",
              }}
            >
              {checkingEmail ? "Checking email..." : emailEligible ? "Email eligible ✓" : "Verify Email"}
            </button>

            {emailEligible && (
              <motion.label
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700, marginTop: 18 }}
              >
                Mobile number
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={updateField}
                  required
                  maxLength={20}
                  placeholder="e.g. +91 98765 43210"
                  style={{ ...inputStyle, marginTop: 8 }}
                />
                <span style={{ display: "block", color: "#6b7280", fontSize: 12, fontWeight: 400, marginTop: 7 }}>
                  Include your country code if applicable.
                </span>
              </motion.label>
            )}

            {message && (
              <div
                role="status"
                style={{
                  marginTop: 16,
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: messageType === "error" ? "#991b1b" : "#166534",
                  background: messageType === "error" ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${messageType === "error" ? "#fecaca" : "#bbf7d0"}`,
                }}
              >
                {message}
              </div>
            )}

            {emailEligible && (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  marginTop: 22,
                  padding: 15,
                  border: "none",
                  borderRadius: 12,
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: "0 10px 24px rgba(17, 24, 39, .16)",
                }}
              >
                {submitting ? "Submitting request..." : "Request Rider Account →"}
              </button>
            )}
          </form>
        )}

        <p style={{ margin: "22px 0 0", color: "#9ca3af", fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>
          By submitting, you agree that DWJD Customer Support may contact you about this request.
        </p>
      </motion.section>
    </main>
  );
}
