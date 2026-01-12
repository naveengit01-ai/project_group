export default function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.user_type || "user";
  const email = user?.email || "";

  return (
    <div className="max-w-6xl">
      {/* Welcome */}
      <h1 className="text-3xl font-extrabold tracking-tight">
        Welcome{email && `, ${email.split("@")[0]}`} 👋
      </h1>

      <p className="mt-2 text-gray-600">
        {role === "user"
          ? "Thank you for helping reduce food waste by donating surplus food."
          : "Thank you for helping deliver food to people in need."}
      </p>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {role === "user" ? (
          <>
            <DashboardCard
              title="Donations Made"
              value="0"
              description="Total food donations you’ve shared"
            />
            <DashboardCard
              title="Active Requests"
              value="0"
              description="Current food pickup requests"
            />
            <DashboardCard
              title="Meals Saved"
              value="0"
              description="Meals rescued from waste"
            />
          </>
        ) : (
          <>
            <DashboardCard
              title="Pickups Completed"
              value="0"
              description="Total food pickups completed"
            />
            <DashboardCard
              title="Active Deliveries"
              value="0"
              description="Deliveries currently in progress"
            />
            <DashboardCard
              title="People Helped"
              value="0"
              description="Lives impacted through deliveries"
            />
          </>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold">
          {role === "user" ? "Start Donating Food" : "View Available Pickups"}
        </h2>
        <p className="text-gray-600 mt-2">
          {role === "user"
            ? "Post a food donation request and help someone today."
            : "Check nearby donation requests and start a delivery."}
        </p>

        <button className="mt-4 px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition">
          {role === "user" ? "Donate Now" : "View Pickups"}
        </button>
      </div>
    </div>
  );
}

/* Reusable Card */
function DashboardCard({ title, value, description }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
  );
}
