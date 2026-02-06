import { useNavigate, useParams } from "react-router-dom";

// 🔁 SWITCH BASE URL WHEN NEEDED
// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Reject() {
  const { id } = useParams(); // application_id
  const navigate = useNavigate();

  const handleReject = async () => {
    if (!id) {
      alert("Invalid application ID");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/interview/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: id })
      });

      const data = await res.json();

      if (data.status === "rejected") {
        alert("Rejection email sent 📧");
        navigate(-1);
      } else {
        alert(data.status || "Something went wrong");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/10 rounded-2xl text-center text-white">
      <h2 className="text-2xl font-bold mb-6 text-red-400">
        Reject Candidate
      </h2>

      <p className="text-gray-300 mb-6">
        This will send a polite rejection email to the candidate.
      </p>

      <button
        onClick={handleReject}
        className="px-8 py-3 bg-red-400 text-black font-bold rounded-xl hover:bg-red-300 transition"
      >
        Confirm Reject
      </button>
    </div>
  );
}
