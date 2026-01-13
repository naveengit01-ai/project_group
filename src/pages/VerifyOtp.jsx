import { useState, useEffect } from "react";
import { verifyOtp } from "../api";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp({ email }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* 🔐 SAFETY CHECK */
  useEffect(() => {
    if (!email) {
      alert("Email missing. Please sign up again.");
      navigate("/signup");
    }
  }, [email, navigate]);

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
        navigate("/login");
      } else {
        alert(res.status);
      }
    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl
                      rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold">Verify Email</h2>
          <p className="text-sm text-gray-500">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-sm font-medium text-gray-700">
            {email}
          </p>
        </div>

        <input
          placeholder="••••••"
          value={otp}
          maxLength={6}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
          className="input text-center text-2xl tracking-[0.4em]"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white
            ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
            }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Didn’t receive the code? Check spam folder
        </p>
      </div>
    </div>
  );
}
