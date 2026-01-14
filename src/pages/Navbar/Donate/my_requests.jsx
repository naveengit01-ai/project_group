import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function MyRequests() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch(`${BASE_URL}/my-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();
      if (data.status === "success") {
        setRequests(data.requests);
      }
    } catch {
      console.error("Fetch requests failed");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp(donationId) {
    try {
      const res = await fetch(`${BASE_URL}/resend-donation-otp`, {
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
  }

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <div className="bg-black flex items-center justify-center px-4 py-20">
        <BackgroundGlow />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10 text-green-700 font-semibold"
        >
          Loading your Requests
        </motion.p>
      </div>
    );
  }

  return (
    <div className="bg-black  px-4 py-12">
      <BackgroundGlow />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            My Requests
          </h1>
          <p className="text-emerald-400 mt-1">
            Track your donation requests and their status
          </p>
        </div>

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl
                       border border-white/20
                       rounded-2xl p-8 text-center
                       text-gray-300"
          >
            No requests yet.
          </motion.div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, index) => (
              <RequestCard
                key={req._id}
                req={req}
                index={index}
                resendOtp={resendOtp}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- CARD ---------- */
function RequestCard({ req, resendOtp, index }) {
  const statusStyle = {
    not_picked: "bg-yellow-500/20 text-yellow-400",
    picked: "bg-blue-500/20 text-blue-400",
    collected: "bg-purple-500/20 text-purple-400",
    delivered: "bg-emerald-500/20 text-emerald-400"
  };

  const showResend =
    req.donation_status === "not_picked" && req.is_verified === false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white/10 backdrop-blur-xl
                 border border-white/20
                 rounded-2xl shadow-xl p-5"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg text-white">
            {req.item_type.toUpperCase()} – {req.item_name}
          </h2>
          <p className="text-sm text-gray-400">
            Quantity: {req.quantity}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Requested on{" "}
            {new Date(req.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold
            ${statusStyle[req.donation_status]}`}
        >
          {req.donation_status.replace("_", " ")}
        </span>
      </div>

      {/* RESEND OTP */}
      {showResend && (
        <button
          onClick={() => resendOtp(req._id)}
          className="mt-4 text-sm font-semibold
                     text-blue-400 hover:underline"
        >
          Resend OTP
        </button>
      )}
    </motion.div>
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
