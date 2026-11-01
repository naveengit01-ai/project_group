
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { BASE_URL } from "../../api.js";

// --------------------------------------------------
// GET LOGGED-IN USER
// --------------------------------------------------

function getLoggedInUser() {
  const keys = ["user", "userInfo", "loggedInUser", "profile"];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      const candidates = [
        parsed,
        parsed?.user,
        parsed?.data?.user,
        parsed?.profile,
      ].filter(Boolean);

      for (const candidate of candidates) {
        if (candidate.email || candidate._id) {
          return candidate;
        }
      }
    } catch {
      // Try the next storage key.
    }
  }

  return null;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function BecomeRider() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [authenticated, setAuthenticated] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

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

  // ------------------------------------------------
  // LOAD AUTHENTICATED USER
  // ------------------------------------------------

  useEffect(() => {
    document.title = "Become a Rider | DWJD";

    const token = localStorage.getItem("token");
    const user = getLoggedInUser();

    if (!token || !user) {
      setAuthenticated(false);
      setMessageType("error");
      setMessage("Please log in before requesting rider access.");
      setLoadingUser(false);
      return;
    }

    if (user.user_type && user.user_type !== "user") {
      setAuthenticated(false);
      setMessageType("error");
      setMessage(
        user.user_type === "rider"
          ? "You already have a rider account."
          : "This account cannot submit a rider application."
      );
      setLoadingUser(false);
      return;
    }

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    setProfileImageUrl(user.profile_image || "");

    setAuthenticated(true);
    setLoadingUser(false);
  }, []);

  // ------------------------------------------------
  // PHONE INPUT
  // ------------------------------------------------

  const updatePhone = (event) => {
    setForm((current) => ({
      ...current,
      phone: event.target.value,
    }));
  };

  // ------------------------------------------------
  // CAMERA CLEANUP
  // ------------------------------------------------

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ------------------------------------------------
  // OPEN CAMERA
  // ------------------------------------------------

  const openCamera = () => {
    setCameraError("");
    setCapturedPhoto("");
    photoBlobRef.current = null;
    setCameraOpen(true);
  };

  // ------------------------------------------------
  // START LIVE CAMERA
  // ------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      if (!cameraOpen || capturedPhoto) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera is unavailable. Please use HTTPS and a supported browser."
        );
        return;
      }

      try {
        let stream;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { exact: "user" },
              width: { ideal: 640, max: 640 },
              height: { ideal: 640, max: 640 },
            },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: "user",
              width: { ideal: 640, max: 640 },
              height: { ideal: 640, max: 640 },
            },
          });
        }

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
        setCameraError(
          error.name === "NotAllowedError"
            ? "Camera permission denied. Allow camera access and try again."
            : "Unable to open the camera. Check your camera connection."
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;
    };
  }, [cameraOpen, capturedPhoto]);

  // ------------------------------------------------
  // CAPTURE PHOTO
  // ------------------------------------------------

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      setCameraError("Camera is still starting. Please try again.");
      return;
    }

    const maxSide = 640;

    const scale = Math.min(
      1,
      maxSide / Math.max(video.videoWidth, video.videoHeight)
    );

    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Could not capture the photo.");
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
      },
      "image/jpeg",
      0.55
    );
  };

  // ------------------------------------------------
  // RETAKE PHOTO
  // ------------------------------------------------

  const retakePhoto = () => {
    setCapturedPhoto("");
    photoBlobRef.current = null;
    setCameraError("");
  };

  // ------------------------------------------------
  // CONFIRM PHOTO
  // ------------------------------------------------

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
      setMessage("Profile photo confirmed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ------------------------------------------------
  // SUBMIT RIDER APPLICATION
  // ------------------------------------------------

  const submitRequest = async (event) => {
    event.preventDefault();

    setMessage("");

    const token = localStorage.getItem("token");

    if (!token || !authenticated) {
      setMessageType("error");
      setMessage("Your login session is missing. Please log in again.");
      return;
    }

    if (!form.first_name || !form.last_name || !form.email) {
      setMessageType("error");
      setMessage("Your account profile is incomplete.");
      return;
    }

    if (!form.phone.trim()) {
      setMessageType("error");
      setMessage("Please enter your mobile number.");
      return;
    }

    if (!profileImageUrl) {
      setMessageType("error");
      setMessage("Please capture and confirm your profile photo.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/rider/request-account`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            phone: form.phone.trim(),

            // Sent for backend photo processing.
            profile_image_data: profileImageUrl,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status !== "request_submitted") {
        if (response.status === 401) {
          throw new Error(
            "Your login session has expired. Please log in again."
          );
        }

        throw new Error(
          data.message || "Unable to submit your rider application."
        );
      }

      setSuccess(true);
      setMessageType("success");

      setMessage(
        "Your rider application has been submitted successfully. Customer Support will review your application."
      );
    } catch (error) {
      console.error("Rider application error:", error);

      setMessageType("error");
      setMessage(error.message || "A network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------
  // STYLES
  // ------------------------------------------------

  const inputStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "13px 14px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    color: "#111827",
    marginTop: 8,
  };

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  if (loadingUser) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f3f6f4",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p>Loading your account...</p>
      </main>
    );
  }

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

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            lineHeight: 1.15,
            color: "#111827",
            margin: "0 0 12px",
          }}
        >
          Become a Rider
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: 14,
            lineHeight: 1.7,
            margin: "0 0 28px",
          }}
        >
          Apply using your existing DWJD account. After approval,
          your existing account will be converted into a rider account.
          You do not need to create another account.
        </p>

        {!authenticated ? (
          <div
            role="alert"
            style={{
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#991b1b",
              borderRadius: 16,
              padding: 18,
              lineHeight: 1.7,
            }}
          >
            {message || "Please log in before requesting rider access."}
            <p style={{ marginTop: 10, fontSize: 13 }}>
              Log in to DWJD and open this page again.
            </p>
          </div>
        ) : success ? (
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

            <strong>Application submitted successfully!</strong>

            <p style={{ margin: "8px 0 0" }}>{message}</p>

            <p style={{ marginTop: 12, fontSize: 13 }}>
              Your existing account remains unchanged until an
              administrator approves and converts it.
            </p>
          </div>
        ) : (
          <form onSubmit={submitRequest}>
            {/* ACCOUNT DETAILS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                First name

                <input
                  value={form.first_name}
                  readOnly
                  style={{
                    ...inputStyle,
                    background: "#f3f4f6",
                  }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Last name

                <input
                  value={form.last_name}
                  readOnly
                  style={{
                    ...inputStyle,
                    background: "#f3f4f6",
                  }}
                />
              </label>
            </div>

            <label
              style={{
                display: "block",
                color: "#374151",
                fontSize: 13,
                fontWeight: 700,
                marginTop: 18,
              }}
            >
              Email address

              <input
                type="email"
                value={form.email}
                readOnly
                style={{
                  ...inputStyle,
                  background: "#f3f4f6",
                }}
              />
            </label>

            <label
              style={{
                display: "block",
                color: "#374151",
                fontSize: 13,
                fontWeight: 700,
                marginTop: 18,
              }}
            >
              Mobile number

              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={updatePhone}
                required
                maxLength={20}
                placeholder="e.g. +91 98765 43210"
                style={inputStyle}
              />
            </label>

            {/* PROFILE PHOTO */}

            <section
              style={{
                marginTop: 20,
                padding: 16,
                border: "1px solid #d1fae5",
                background: "#f0fdf4",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Confirmed rider profile"
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #86efac",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      background: "#dcfce7",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 28,
                    }}
                  >
                    📷
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <strong
                    style={{
                      display: "block",
                      color: "#166534",
                      fontSize: 14,
                    }}
                  >
                    Rider profile photo *
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#4b5563",
                      fontSize: 12,
                      lineHeight: 1.5,
                      marginTop: 4,
                    }}
                  >
                    {profileImageUrl
                      ? "Photo confirmed."
                      : "Use your live camera to capture a photo."}
                  </span>

                  <button
                    type="button"
                    onClick={openCamera}
                    style={{
                      marginTop: 10,
                      border: 0,
                      borderRadius: 10,
                      padding: "10px 13px",
                      background: "#166534",
                      color: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {profileImageUrl ? "Retake Photo" : "Open Camera"}
                  </button>
                </div>
              </div>
            </section>

            {/* MESSAGE */}

            {message && (
              <div
                role="status"
                style={{
                  marginTop: 16,
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color:
                    messageType === "error" ? "#991b1b" : "#166534",
                  background:
                    messageType === "error" ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${
                    messageType === "error" ? "#fecaca" : "#bbf7d0"
                  }`,
                }}
              >
                {message}
              </div>
            )}

            {/* SUBMIT */}

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
              {submitting
                ? "Submitting application..."
                : "Submit Rider Application →"}
            </button>
          </form>
        )}

        <p
          style={{
            margin: "22px 0 0",
            color: "#9ca3af",
            fontSize: 12,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          By submitting, you agree that DWJD Customer Support may
          contact you about this application.
        </p>
      </motion.section>

      {/* CAMERA MODAL */}

      {cameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Capture rider profile photo"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !uploadingPhoto
            ) {
              setCameraOpen(false);
              stopCamera();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(3, 7, 18, .82)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#fff",
              borderRadius: 22,
              padding: 20,
              boxShadow: "0 25px 80px rgba(0,0,0,.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#111827",
                    fontSize: 21,
                  }}
                >
                  Rider profile photo
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#6b7280",
                    fontSize: 13,
                  }}
                >
                  Capture a clear photo using your live camera.
                </p>
              </div>

              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => {
                  setCameraOpen(false);
                  stopCamera();
                }}
                aria-label="Close camera"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                overflow: "hidden",
                borderRadius: 16,
                background: "#111827",
                aspectRatio: "4 / 3",
                display: "grid",
                placeItems: "center",
              }}
            >
              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured photo preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Live camera preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {cameraError && (
              <p
                role="alert"
                style={{
                  color: "#b91c1c",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: 11,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {cameraError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 16,
              }}
            >
              {!capturedPhoto ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  style={{
                    flex: 1,
                    minWidth: 130,
                    border: 0,
                    borderRadius: 12,
                    padding: 14,
                    background: "#166534",
                    color: "white",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  📸 Capture Photo
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={retakePhoto}
                    style={{
                      flex: 1,
                      minWidth: 110,
                      border: "1px solid #d1d5db",
                      borderRadius: 12,
                      padding: 14,
                      background: "#fff",
                      color: "#111827",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={confirmPhoto}
                    style={{
                      flex: 1,
                      minWidth: 150,
                      border: 0,
                      borderRadius: 12,
                      padding: 14,
                      background: "#166534",
                      color: "white",
                      fontWeight: 800,
                      cursor: uploadingPhoto ? "wait" : "pointer",
                      opacity: uploadingPhoto ? 0.7 : 1,
                    }}
                  >
                    {uploadingPhoto
                      ? "Confirming..."
                      : "✓ Confirm Photo"}
                  </button>
                </>
              )}
            </div>

            <p
              style={{
                margin: "12px 0 0",
                color: "#9ca3af",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              Camera access requires permission and a secure HTTPS
              connection.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
