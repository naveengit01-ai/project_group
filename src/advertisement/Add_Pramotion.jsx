import { useState } from "react";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Add_Pramotions() {
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
    /* FULL PAGE WRAPPER */
    <div className="min-h-screen w-screen overflow-x-hidden
                    bg-gradient-to-br from-slate-900 via-slate-800 to-black
                    text-white">

      {/* SOFT GLOW BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px]
                        bg-emerald-500/25 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px]
                        bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* CONTENT (TOP ALIGNED, NO GAP) */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 animate-fadeIn">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Add Promotion 📢
          </h1>
          <p className="text-gray-400 mt-2">
            Create and publish sponsored promotions
          </p>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl bg-white/10 backdrop-blur-xl
                     border border-white/20 rounded-3xl
                     p-8 space-y-6 shadow-2xl
                     transition-all duration-300
                     hover:shadow-emerald-500/10"
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
            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white
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
                        transition-all duration-200
                        ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-400 hover:bg-emerald-300 active:scale-[0.97]"
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
      className="w-full px-4 py-3 rounded-xl bg-black/40 text-white
                 border border-white/20 focus:outline-none
                 focus:ring-2 focus:ring-emerald-500 transition"
    />
  );
}
