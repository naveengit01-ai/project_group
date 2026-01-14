import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function DonateOtpVerify() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const donationId = state?.donation_id;
  const user = JSON.parse(localStorage.getItem("user"));

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  /* SAFETY CHECK */
  if (!donationId) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center px-4">
        <BackgroundGlow />
        <p className="relative z-10 text-red-400 font-semibold">
          Donation ID missing. Please go back.
        </p>
      </div>
    );
  }

  /* ================= VERIFY OTP ================= */
  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/verify-donate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: donationId,
          otp,
          rider_email: user.email
        })
      });

      const data = await res.json();

      if (data.status === "donation_verified_and_picked") {
        navigate("/afterlogin/pickup/my-rides");
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResend = async () => {
    try {
      const res = await fetch(`${BASE_URL}/resend-donate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donation_id: donationId })
      });

      const data = await res.json();

      if (data.status === "otp_resent") {
        alert("OTP resent successfully 📩");
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-4">
      <BackgroundGlow />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md
                   bg-white/10 backdrop-blur-xl
                   border border-white/20
                   rounded-3xl shadow-2xl
                   p-8 space-y-6"
      >
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Verify Pickup OTP 🔐
          </h1>
          <p className="text-sm text-emerald-400 mt-1">
            Ask the donor for the OTP to confirm pickup
          </p>
        </div>

        {/* OTP INPUT */}
        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-4 rounded-xl
                     bg-black/40 text-white text-center
                     tracking-widest text-xl
                     border border-white/20
                     focus:outline-none focus:ring-2
                     focus:ring-emerald-500"
        />

        {/* VERIFY BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={handleVerify}
          className={`w-full py-4 rounded-2xl font-bold transition
            ${loading
              ? "bg-gray-500 text-black cursor-not-allowed"
              : "bg-emerald-400 text-black hover:bg-emerald-300"
            }`}
        >
          {loading ? "Verifying..." : "Verify & Pickup"}
        </motion.button>

        {/* RESEND OTP */}
        <button
          disabled={loading}
          onClick={handleResend}
          className="w-full py-3 rounded-xl
                     border border-white/20
                     text-emerald-400 font-semibold
                     hover:bg-white/10 transition"
        >
          Resend OTP
        </button>

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto text-sm
                     text-gray-400 hover:text-white transition"
        >
          ← Back
        </button>
      </motion.div>
    </div>
  );
}

/* ===== SAME BACKGROUND GLOW ===== */
function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    </>
  );
}
