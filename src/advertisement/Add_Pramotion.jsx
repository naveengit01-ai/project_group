import { useState } from "react";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Add_Pramotions() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    company_name: "",
    amount_paid: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.description ||
      !form.company_name ||
      !form.amount_paid
    ) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/admin/add-advertisement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount_paid: Number(form.amount_paid),
        }),
      });

      const data = await res.json();

      if (data.status === "advertisement_added") {
        alert("Promotion published 🚀");
        setForm({
          title: "",
          description: "",
          company_name: "",
          amount_paid: "",
        });
      } else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-1">
      {/* TOP BAR */}
      <div className="w-full px-1 py-0 border-b border-white/100 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg
                     border border-white/20
                     hover:bg-white/10 transition"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-extrabold">
          Add Promotion
        </h1>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-gray-400 mb-6">
          Create and publish sponsored promotions
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5
                     border border-white/15 rounded-2xl
                     p-6 space-y-5"
        >
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Promotion title"
          />

          <Input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            placeholder="Company name"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Promotion description"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-black text-white
                       border border-white/20 focus:outline-none
                       focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          <Input
            type="number"
            name="amount_paid"
            value={form.amount_paid}
            onChange={handleChange}
            placeholder="Amount paid"
          />

          <button
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-black
              ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]"
              }`}
          >
            {loading ? "Publishing..." : "Publish Promotion"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* REUSABLE INPUT */
function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl bg-black text-white
                 border border-white/20 focus:outline-none
                 focus:ring-2 focus:ring-emerald-500 transition"
    />
  );
}
