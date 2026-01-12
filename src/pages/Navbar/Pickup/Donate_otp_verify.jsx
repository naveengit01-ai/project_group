import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function DonateOtpVerify() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const donationId = state?.donation_id;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!donationId) {
    return (
      <p className="text-red-600">
        Donation ID missing. Please go back.
      </p>
    );
  }

  /* VERIFY OTP */
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
          otp
        })
      });

      const data = await res.json();

      if (data.status === "donation_verified_and_picked") {
        alert("Pickup verified successfully ✅");
        navigate("/afterlogin/pickup/Deliveries");
      } else {
        alert(data.status);
      }
    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  };

  /* RESEND OTP */
  const handleResend = async () => {
    try {
      const res = await fetch(`${BASE_URL}/resend-donate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: donationId
        })
      });

      const data = await res.json();

      if (data.status === "otp_resent") {
        alert("OTP resent successfully 📩");
      } else {
        alert(data.status);
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">
            Verify Pickup OTP 🔐
          </h1>
          <p className="text-gray-500 mt-1">
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
          className="input text-center tracking-widest text-xl"
        />

        {/* VERIFY BUTTON */}
        <button
          disabled={loading}
          onClick={handleVerify}
          className={`w-full py-4 rounded-2xl text-white font-bold
            ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Verifying..." : "Verify & Pickup"}
        </button>

        {/* RESEND OTP BUTTON (ALWAYS VISIBLE) */}
        <button
          onClick={handleResend}
          className="w-full py-3 rounded-xl border
                     text-blue-600 font-semibold
                     hover:bg-blue-50 transition"
        >
          Resend OTP
        </button>

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto text-sm text-gray-500 hover:text-black transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
