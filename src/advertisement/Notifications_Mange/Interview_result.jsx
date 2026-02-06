import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function InterviewResult() {
  const { id } = useParams(); // application_id
  const navigate = useNavigate();

  /* ❌ NOT SELECTED */
  const handleReject = async () => {
    const res = await fetch(`${BASE_URL}/admin/interview/not-selected`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: id })
    });

    const data = await res.json();

    if (data.status === "rejection_email_sent") {
      alert("Rejection email sent 📧");
      navigate(-1);
    } else {
      alert(data.status);
    }
  };

  /* ✅ SELECTED */
  const handleSelect = () => {
    navigate(`/afterlogin/notifications/add-employee/${id}`);
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/10 rounded-2xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-emerald-400">
        Interview Result
      </h2>

      <div className="flex gap-4">
        <button
          onClick={handleSelect}
          className="flex-1 py-3 bg-emerald-400 text-black font-bold rounded-xl"
        >
          ✅ Selected
        </button>

        <button
          onClick={handleReject}
          className="flex-1 py-3 bg-red-400 text-black font-bold rounded-xl"
        >
          ❌ Not Selected
        </button>
      </div>
    </div>
  );
}
