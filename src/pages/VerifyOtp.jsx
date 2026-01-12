import { useState } from "react";
import { verifyOtp } from "../api";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp({ email }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    setLoading(true);
    const res = await verifyOtp({ email, otp });

    if (res.status === "account_verified") {
      alert("Account verified ✅");
      navigate("/login");
    } else {
      alert(res.status);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 animate-gradient" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl
                   rounded-3xl shadow-2xl p-8 space-y-6
                   animate-slideUp"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Verify Email
          </h2>
          <p className="text-sm text-gray-500">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-sm font-medium text-gray-700">
            {email}
          </p>
        </div>

        {/* OTP Input */}
        <input
          placeholder="••••••"
          value={otp}
          maxLength={6}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
          className="input text-center text-2xl tracking-[0.4em]"
        />

        {/* Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white
            transition-all duration-200
            ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800 active:scale-[0.97]"
            }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center">
          Didn’t receive the code? Check spam or try again
        </p>
      </div>
    </div>
  );
}
