
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleAuthExchange } from "../api";

export default function AuthCallback() {
  const navigate = useNavigate();

  const requestStarted = useRef(false);

  const [message, setMessage] = useState(
    "Completing your Google sign-in..."
  );

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Prevent duplicate code exchange requests.
    // This also protects against React StrictMode effect re-runs.
    if (requestStarted.current) return;

    requestStarted.current = true;

    const completeGoogleLogin = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");
        const googleError = params.get("google_error");

        if (googleError) {
          throw new Error(
            `Google login failed: ${googleError.replaceAll("_", " ")}`
          );
        }

        if (!code) {
          throw new Error("Google authentication code is missing.");
        }

        const data = await googleAuthExchange(code);

        // Match the actual backend response.
        if (
          data.status !== "login_success" ||
          !data.token ||
          !data.user
        ) {
          throw new Error(
            data.message || "Unable to complete Google login."
          );
        }

        // Save authentication details.
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Login successful! Redirecting...");

        // Remove the temporary code from the browser address bar.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        navigate("/afterlogin", { replace: true });

      } catch (error) {
        console.error("Google OAuth callback error:", error);

        setHasError(true);
        setMessage(
          error.message || "Google authentication failed."
        );
      }
    };

    completeGoogleLogin();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#07140f",
        color: "#ffffff",
        padding: "24px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {!hasError ? (
        <div
          style={{
            width: "46px",
            height: "46px",
            border: "4px solid #315443",
            borderTop: "4px solid #39d98a",
            borderRadius: "50%",
            animation: "dwjd-spin 0.8s linear infinite",
          }}
        />
      ) : (
        <div style={{ fontSize: "42px" }}>⚠️</div>
      )}

      <h2 style={{ marginTop: "24px" }}>
        {hasError ? "Google Login Failed" : "Google Authentication"}
      </h2>

      <p style={{ color: "#b8c9bf", maxWidth: "400px" }}>
        {message}
      </p>

      {hasError && (
        <button
          onClick={() => navigate("/login", { replace: true })}
          style={{
            marginTop: "18px",
            padding: "12px 26px",
            border: "none",
            borderRadius: "8px",
            background: "#20b879",
            color: "#ffffff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      )}

      <style>
        {`
          @keyframes dwjd-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
