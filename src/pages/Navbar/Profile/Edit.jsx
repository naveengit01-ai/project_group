import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Edit() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 🚨 Guard: no email → go back to login */
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  /* Fetch user data */
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${BASE_URL}/get-user-by-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.status === "success") {
          setForm({
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            phone: data.user.phone || ""
          });
        } else {
          setError(data.status);
        }
      } catch (err) {
        setError("Failed to load profile");
      }
    }

    if (email) fetchUser();
  }, [email]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form })
      });

      const data = await res.json();

      if (data.status === "updated_successfully") {
        alert("Profile updated successfully ✅");

        /* 🔑 Merge updated fields into localStorage */
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            ...data.user
          })
        );

        navigate("/afterlogin/profile");
      } else {
        setError(data.status);
      }
    } catch (err) {
      setError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      <form
        onSubmit={handleUpdate}
        className="mt-6 bg-white rounded-xl shadow p-6 space-y-4"
      >
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First Name"
          className="input"
        />

        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last Name"
          className="input"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="input"
        />

        {/* Read-only email */}
        <input
          value={email || ""}
          disabled
          className="input bg-gray-100 cursor-not-allowed"
        />

        <button
          disabled={loading}
          className={`w-full py-2 rounded-xl text-white font-semibold
            ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
            }`}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
