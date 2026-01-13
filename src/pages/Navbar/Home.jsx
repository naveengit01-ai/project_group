import { useEffect } from "react";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.user_type || "user";
  const email = user?.email || "";
  const name = email ? email.split("@")[0] : "Friend";

  const quotesUser = [
    "What you save today feeds someone tomorrow.",
    "Food shared is dignity preserved.",
    "A small act of kindness can fill an empty stomach."
  ];

  const quotesRider = [
    "You are the bridge between surplus and survival.",
    "Every delivery is a story of hope.",
    "Miles traveled for meals that matter."
  ];

  const quote =
    role === "user"
      ? quotesUser[Math.floor(Math.random() * quotesUser.length)]
      : quotesRider[Math.floor(Math.random() * quotesRider.length)];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fadeUp">
      {/* HEADER */}
      <div className="glass rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Hello, {name}
        </h1>
        <p className="mt-3 text-gray-300 text-lg">
          {role === "user"
            ? "You’re helping reduce food waste and restore dignity."
            : "You’re helping deliver hope to people in need."}
        </p>

        <p className="mt-6 text-xl font-semibold text-emerald-400">
          “{quote}”
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {role === "user" ? (
          <>
            <DashboardCard
              title="Donations Made"
              value="0"
              description="Times you chose sharing over wasting"
            />
            <DashboardCard
              title="Active Requests"
              value="0"
              description="Donations currently awaiting pickup"
            />
            <DashboardCard
              title="Meals Saved"
              value="0"
              description="Meals rescued from going to waste"
            />
          </>
        ) : (
          <>
            <DashboardCard
              title="Pickups Completed"
              value="0"
              description="Deliveries successfully completed"
            />
            <DashboardCard
              title="Active Deliveries"
              value="0"
              description="Pickups currently in progress"
            />
            <DashboardCard
              title="People Helped"
              value="0"
              description="Lives impacted through your rides"
            />
          </>
        )}
      </div>

      {/* MOTIVATION PANEL */}
      <div className="glass rounded-2xl p-8 border border-white/20 text-center">
        <h2 className="text-2xl font-bold text-white">
          Why This Matters
        </h2>

        <p className="mt-4 text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Millions of meals are wasted every day while people sleep hungry.
          This platform exists to close that gap — not with noise,
          but with consistent human action.
        </p>

        <p className="mt-6 text-sm uppercase tracking-widest text-gray-400">
          DWJD · Don’t Waste, Just Donate
        </p>
      </div>
    </div>
  );
}

/* ================= DASHBOARD CARD ================= */

function DashboardCard({ title, value, description }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/20
                    hover:border-emerald-400/40 transition
                    hover:-translate-y-1">
      <h3 className="text-sm font-medium text-gray-400">
        {title}
      </h3>

      <p className="text-4xl font-extrabold text-white mt-2">
        {value}
      </p>

      <p className="text-sm text-gray-400 mt-3">
        {description}
      </p>
    </div>
  );
}
