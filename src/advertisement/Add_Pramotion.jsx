import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Megaphone, Building2, IndianRupee } from "lucide-react";

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
    <div className="relative min-h-screen text-white overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] bg-[size:22px_22px]" />

      {/* BACK BUTTON */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        className="
          fixed top-6 left-6 z-50
          flex items-center gap-2
          px-4 py-2 rounded-xl
          bg-white/10 border border-white/20
          backdrop-blur-lg
          text-gray-200
          hover:bg-white/20
          shadow-lg
        "
      >
        <ArrowLeft size={18} />
        Back
      </motion.button>

      {/* HEADER */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-20 pb-6">
        <div className="flex items-center gap-3 mb-8">
          <Megaphone className="w-8 h-8 text-emerald-400" />
          <h1 className="text-4xl font-extrabold tracking-tight">
            Add Promotion
          </h1>

          <span className="ml-auto px-3 py-1 text-xs rounded-full
                           bg-emerald-500/20 text-emerald-300
                           border border-emerald-500/30">
            ADMIN
          </span>
        </div>
      </div>

      {/* FORM CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 max-w-4xl mx-auto px-8 pb-24"
      >
        <div className="rounded-3xl p-10
                        bg-white/10
                        border border-white/20
                        backdrop-blur-xl
                        shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

          {/* INTRO */}
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-emerald-400">
              Boost Your Brand ✨
            </h2>
            <p className="text-gray-400 mt-2">
              Admin-controlled sponsored visibility across the platform
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-7">
            <Field
              icon={Megaphone}
              label="Promotion Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Eg: Feed a Child Campaign"
            />

            <Field
              icon={Building2}
              label="Company Name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              placeholder="Eg: Helping Hands Foundation"
            />

            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Promotion Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Explain the purpose and impact of this promotion..."
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-black/40 text-white
                  border border-white/20
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                  resize-none transition
                "
              />
            </div>

            <Field
              icon={IndianRupee}
              label="Amount Paid (₹)"
              type="number"
              name="amount_paid"
              value={form.amount_paid}
              onChange={handleChange}
              placeholder="Eg: 5000"
            />

            {/* CTA */}
            <motion.button
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all
                ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:scale-[1.01]"
                }`}
            >
              {loading ? "Publishing..." : "🚀 Publish Promotion"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= FIELD ================= */

function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-300 mb-1 block">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          {...props}
          className="
            w-full pl-11 pr-4 py-3 rounded-xl
            bg-black/40 text-white
            border border-white/20
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            transition
          "
        />
      </div>
    </div>
  );
}
