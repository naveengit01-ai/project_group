import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function AddEmploye() {
  const { id } = useParams(); // application_id
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    applied_role: ""
  });

  const [loading, setLoading] = useState(true);

  /* 🔄 FETCH APPLICATION DETAILS */
  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`${BASE_URL}/admin/application/${id}`);
        const data = await res.json();

        if (data.status === "success") {
          const a = data.application;
          setForm({
            username: a.first_name,
            password: "",
            first_name: a.first_name,
            last_name: a.last_name,
            email: a.email,
            phone: a.phone,
            applied_role: a.job_title
          });
        } else {
          alert(data.status);
        }
      } catch {
        alert("Failed to load applicant");
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    if (!form.password) {
      alert("Password is required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/create-employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: id,
          username: form.username,
          password: form.password
        })
      });

      const data = await res.json();

      if (data.status === "employee_created_and_mail_sent") {
        alert("Employee created & credentials sent via email 📧");
        navigate("/afterlogin/notifications");
      } 
      else if (data.status === "employee_created_but_mail_failed") {
        alert("Account created, but email failed. Check server logs.");
      } 
      else {
        alert(data.status);
      }
    } catch {
      alert("Server error");
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center py-20">
        Loading applicant…
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/10 rounded-2xl text-white">
      <h2 className="text-2xl font-bold mb-6">
        Create Employee Account
      </h2>

      {/* READ ONLY DETAILS */}
      {["first_name", "last_name", "email", "phone"].map(k => (
        <input
          key={k}
          value={form[k]}
          disabled
          className="glass-input mb-3 opacity-70"
        />
      ))}

      {/* APPLIED ROLE */}
      <input
        value={form.applied_role}
        disabled
        className="glass-input mb-3 opacity-70 capitalize"
      />

      {/* USERNAME */}
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
        className="glass-input mb-3"
      />

      {/* PASSWORD */}
      <input
        type="password"
        name="password"
        placeholder="Set Password"
        onChange={handleChange}
        className="glass-input mb-4"
      />

      <button
        onClick={handleCreate}
        className="w-full py-3 bg-emerald-400 text-black font-bold rounded-xl"
      >
        Create Account
      </button>
    </div>
  );
}
