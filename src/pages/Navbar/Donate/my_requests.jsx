import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function MyRequests() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  async function fetchRequests() {
    const res = await fetch(`${BASE_URL}/my-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email })
    });

    const data = await res.json();
    if (data.status === "success") {
      setRequests(data.requests);
    }
    setLoading(false);
  }

  async function resendOtp(donationId) {
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
  }

  if (loading) {
    return <p className="text-gray-500">Loading your requests...</p>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-2">My Requests</h1>
      <p className="text-gray-500 mb-6">
        Track your donation requests and their status
      </p>

      {requests.length === 0 ? (
        <p className="text-gray-600">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <RequestCard
              key={req._id}
              req={req}
              resendOtp={resendOtp}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Card ---------- */
function RequestCard({ req, resendOtp }) {
  const statusColor = {
    not_picked: "bg-yellow-100 text-yellow-800",
    picked: "bg-blue-100 text-blue-800",
    collected: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800"
  };

  const showResend =
    req.donation_status === "not_picked" && req.is_verified === false;

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">
            {req.item_type.toUpperCase()} – {req.item_name}
          </h2>
          <p className="text-sm text-gray-500">
            Quantity: {req.quantity}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Requested on {new Date(req.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold
            ${statusColor[req.donation_status]}`}
        >
          {req.donation_status.replace("_", " ")}
        </span>
      </div>

      {/* 🔥 RESEND OTP */}
      {showResend && (
        <button
          onClick={() => resendOtp(req._id)}
          className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
        >
          Resend OTP
        </button>
      )}
    </div>
  );
}
