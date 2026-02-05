import { useState, useEffect } from "react";
import { verifyOtp, resendOtp } from "../api";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp({ email: propEmail }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState(""); // ✅ resolved email

  const navigate = useNavigate();

  /* 🔐 RESOLVE EMAIL (PROP OR LOCALSTORAGE) */
  useEffect(() => {
    const storedEmail = localStorage.getItem("verifyEmail");

    if (propEmail) {
      setEmail(propEmail);
      localStorage.setItem("verifyEmail", propEmail); // backup
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      alert("Email missing. Please sign up again.");
      navigate("/signup");
    }
  }, [propEmail, navigate]);

  /* ⏱️ RESEND TIMER */
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  /* ✅ VERIFY OTP */
  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp({ email, otp });

      if (
        res.status === "account_verified" ||
        res.status === "already_verified"
      ) {
        alert("Email verified successfully ✅");
        localStorage.removeItem("verifyEmail");
        navigate("/login");
      } else {
        alert(res.status);
      }
    } catch {
      alert("Server error");
    }

    setLoading(false);
  };

  /* 🔁 RESEND OTP */
  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      const res = await resendOtp({ email });

      if (res.status === "otp_resent") {
        alert("OTP resent 📩");
        setResendTimer(30);
      } else {
        alert(res.status);
      }
    } catch {
      alert("Unable to resend OTP");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-black to-black" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md p-8 rounded-2xl
                   bg-white/10 backdrop-blur-xl border border-white/20
                   shadow-2xl space-y-5"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Verify Email 🔐</h2>
          <p className="text-sm text-gray-300 mt-1">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-sm font-semibold text-emerald-400">
            {email}
          </p>
        </div>

        <input
          placeholder="••••••"
          value={otp}
          maxLength={6}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
          className="glass-input text-center text-2xl tracking-[0.4em]"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-black transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-400 hover:bg-emerald-300 active:scale-[0.97]"
            }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Resend OTP */}
        <p className="text-sm text-center text-gray-300">
          Didn’t receive the code?{" "}
          <span
            onClick={handleResend}
            className={`font-semibold cursor-pointer
              ${
                resendTimer > 0
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-cyan-400 hover:underline"
              }`}
          >
            {resendTimer > 0
              ? `Resend in ${resendTimer}s`
              : "Resend OTP"}
          </span>
        </p>
      </div>
    </div>
  );
}
