import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    user_type: "rider"
  });

  /* 🔄 Fetch applicant details */
  useEffect(() => {
    fetch(`${BASE_URL}/admin/application/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          const a = data.application;
          setForm(f => ({
            ...f,
            first_name: a.first_name,
            last_name: a.last_name,
            email: a.email,
            phone: a.phone,
            username: a.first_name,
            user_type: "rider"
          }));
        }
      });
  }, [id]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    if (!form.password) {
      alert("Password required");
      return;
    }

    const res = await fetch(`${BASE_URL}/admin/create-employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: id, ...form })
    });

    const data = await res.json();

    if (data.status === "employee_created_otp_sent") {
      alert("Employee created & OTP sent 📩");
      navigate(-2);
    } else {
      alert(data.status);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white/10 rounded-2xl text-white">
      <h2 className="text-2xl font-bold mb-6">Add Employee</h2>

      {["first_name","last_name","email","phone","username"].map(k => (
        <input
          key={k}
          value={form[k]}
          disabled
          className="glass-input mb-3 opacity-70"
        />
      ))}

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
