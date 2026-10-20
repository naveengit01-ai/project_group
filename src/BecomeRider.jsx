import { useEffect, useRef, useState } from "react";
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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const photoBlobRef = useRef(null);

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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const openCamera = () => {
    setCameraError("");
    setCapturedPhoto("");
    photoBlobRef.current = null;
    setCameraOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    const startCamera = async () => {
      if (!cameraOpen || capturedPhoto) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Live camera is not available in this browser. Use HTTPS and a supported browser.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        setCameraError(error.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser settings and try again."
          : "Unable to open the camera. Check that your camera is connected and not being used by another app.");
      }
    };
    startCamera();
    return () => {
      cancelled = true;
    };
  }, [cameraOpen, capturedPhoto]);

  useEffect(() => () => stopCamera(), []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) {
      setCameraError("The camera is still starting. Please try again in a moment.");
      return;
    }
    const maxSide = 1200;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
  if (!blob) {
    setCameraError("Could not capture the photo. Please try again.");
    return;
  }

  photoBlobRef.current = blob;

  const reader = new FileReader();

  reader.onloadend = () => {
    setCapturedPhoto(reader.result);
    setCameraError("");
    stopCamera();
  };

  reader.readAsDataURL(blob);
}, "image/jpeg", 0.7);
  };

  const retakePhoto = async () => {
    setCapturedPhoto("");
    setProfileImageUrl("");
    photoBlobRef.current = null;
    setCameraError("");
  };

  // Confirm the camera photo locally. The photo is sent together with the
  // rider's details when the existing /rider/request-account endpoint is called.
  const confirmPhoto = async () => {
    if (!photoBlobRef.current || !capturedPhoto) {
      setCameraError("Capture a photo before confirming.");
      return;
    }

    setUploadingPhoto(true);
    setCameraError("");
    try {
      setProfileImageUrl(capturedPhoto);
      setCameraOpen(false);
      stopCamera();
      setMessageType("success");
      setMessage("Photo confirmed. Submit your rider request to save it.");
    } catch (error) {
      setCameraError(error.message || "Could not confirm this photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
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

    if (!profileImageUrl) {
      setMessageType("error");
      setMessage("Please open the camera, capture your profile photo, and confirm it before submitting.");
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
          // Captured JPEG data URL; backend uploads it to Google Drive.
          profile_image_data: profileImageUrl,
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

            <section style={{ marginTop: 20, padding: 16, border: "1px solid #d1fae5", background: "#f0fdf4", borderRadius: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Confirmed rider profile" style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: "3px solid #86efac" }} />
                ) : capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured rider profile preview" style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: "3px solid #86efac" }} />
                ) : (
                  <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#dcfce7", display: "grid", placeItems: "center", fontSize: 28 }}>📷</div>
                )}
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", color: "#166534", fontSize: 14 }}>Rider profile photo *</strong>
                  <span style={{ display: "block", color: "#4b5563", fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
                    {profileImageUrl ? "Photo confirmed. It will be uploaded when you submit the request." : "Use your live camera. Gallery uploads are not available."}
                  </span>
                  <button type="button" onClick={openCamera} style={{ marginTop: 10, border: 0, borderRadius: 10, padding: "10px 13px", background: "#166534", color: "white", fontWeight: 800, cursor: "pointer" }}>
                    {profileImageUrl ? "Retake Photo" : "Open Camera"}
                  </button>
                </div>
              </div>
            </section>

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

      {cameraOpen && (
        <div role="dialog" aria-modal="true" aria-label="Capture rider profile photo" onClick={(event) => { if (event.target === event.currentTarget && !uploadingPhoto) { setCameraOpen(false); stopCamera(); } }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(3, 7, 18, .82)", display: "grid", placeItems: "center", padding: 16 }}>
          <section style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 22, padding: 20, boxShadow: "0 25px 80px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, color: "#111827", fontSize: 21 }}>Rider profile photo</h2>
                <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: 13 }}>Capture a clear photo using your live camera.</p>
              </div>
              <button type="button" disabled={uploadingPhoto} onClick={() => { setCameraOpen(false); stopCamera(); }} aria-label="Close camera" style={{ width: 42, height: 42, borderRadius: 12, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ overflow: "hidden", borderRadius: 16, background: "#111827", aspectRatio: "4 / 3", display: "grid", placeItems: "center" }}>
              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Captured photo preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <video ref={videoRef} autoPlay muted playsInline aria-label="Live camera preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {cameraError && <p role="alert" style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 11, fontSize: 13, lineHeight: 1.5 }}>{cameraError}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
              {!capturedPhoto ? (
                <button type="button" onClick={capturePhoto} style={{ flex: 1, minWidth: 130, border: 0, borderRadius: 12, padding: 14, background: "#166534", color: "white", fontWeight: 800, cursor: "pointer" }}>📸 Capture Photo</button>
              ) : (
                <>
                  <button type="button" disabled={uploadingPhoto} onClick={retakePhoto} style={{ flex: 1, minWidth: 110, border: "1px solid #d1d5db", borderRadius: 12, padding: 14, background: "#fff", color: "#111827", fontWeight: 800, cursor: "pointer" }}>Retake</button>
                  <button type="button" disabled={uploadingPhoto} onClick={confirmPhoto} style={{ flex: 1, minWidth: 150, border: 0, borderRadius: 12, padding: 14, background: "#166534", color: "white", fontWeight: 800, cursor: uploadingPhoto ? "wait" : "pointer", opacity: uploadingPhoto ? .7 : 1 }}>{uploadingPhoto ? "Uploading photo…" : "✓ Confirm Photo"}</button>
                </>
              )}
            </div>
            <p style={{ margin: "12px 0 0", color: "#9ca3af", fontSize: 11, lineHeight: 1.5 }}>Camera access requires permission and a secure HTTPS connection. No gallery picker is provided.</p>
          </section>
        </div>
      )}
    </main>
  );
}
