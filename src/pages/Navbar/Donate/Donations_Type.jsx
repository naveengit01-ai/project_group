import { useNavigate } from "react-router-dom";

export default function DonationsType() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight">
        What would you like to donate?
      </h1>

      <p className="mt-2 text-gray-600">
        Choose a category to continue your donation.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <DonateCard
          title="Food"
          desc="Donate surplus cooked or packed food"
          color="from-green-500 to-green-700"
          onClick={() => navigate("/afterlogin/donate/food")}
        />

        <DonateCard
          title="Clothes"
          desc="Donate wearable clothes in good condition"
          color="from-blue-500 to-blue-700"
          onClick={() => navigate("/afterlogin/donate/clothes")}
        />

        <DonateCard
          title="Other"
          desc="Donate essentials like books, utensils, etc."
          color="from-purple-500 to-purple-700"
          onClick={() => navigate("/afterlogin/donate/other")}
        />
      </div>
    </div>
  );
}

function DonateCard({ title, desc, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-6 text-white
        bg-gradient-to-br ${color}
        shadow-lg hover:scale-[1.03] transition-all`}
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm opacity-90">{desc}</p>

      <div className="mt-6 inline-block text-sm font-semibold underline">
        Continue →
      </div>
    </div>
  );
}
