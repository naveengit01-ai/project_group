import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Myprofile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email;

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`${BASE_URL}/get-user-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (data.status === "success") {
        setUser(data.user);
      } else {
        alert(data.status);
      }
    }

    fetchUser();
  }, [email]);

  if (!user) {
    return <p className="text-gray-600">Loading profile...</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="mt-6 bg-white rounded-xl shadow p-6 space-y-3">
        <p><strong>First Name:</strong> {user.first_name}</p>
        <p><strong>Last Name:</strong> {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.user_type}</p>

        <button
          onClick={() => navigate("/afterlogin/profile/edit")}
          className="mt-4 px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
