import { useLocation, useNavigate } from "react-router-dom";

export default function Direction() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const donation = state?.donation;

  if (!donation) {
    return (
      <p className="text-red-600">
        Donation data missing. Please go back.
      </p>
    );
  }

  /* 🔗 Google Maps Navigation Link */
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    donation.pickup_location
  )}`;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold">
          Navigate to Pickup 📍
        </h1>
        <p className="text-gray-500 mt-1">
          Follow directions to reach the donor location
        </p>
      </div>

      {/* DONATION INFO */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-1">
        <p className="font-semibold">
          {donation.item_type.toUpperCase()} – {donation.item_name}
        </p>
        <p className="text-sm text-gray-600">
          Quantity: {donation.quantity}
        </p>
        <p className="text-sm text-gray-600">
          Location: {donation.pickup_location}
        </p>
      </div>

      {/* MAP BUTTON */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-blue-600 text-white
                   py-4 rounded-2xl font-bold hover:bg-blue-700 transition"
      >
        Open Google Maps Navigation 🧭
      </a>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() =>
            navigate("/afterlogin/pickup/verify", {
              state: { donation_id: donation._id }
            })
          }
          className="py-4 rounded-2xl bg-green-600 text-white
                     font-bold hover:bg-green-700 transition"
        >
          Verify OTP ✅
        </button>

        <button
          onClick={() =>
            navigate("/afterlogin/pickup/not-picked", {
              state: { donation_id: donation._id }
            })
          }
          className="py-4 rounded-2xl bg-red-600 text-white
                     font-bold hover:bg-red-700 transition"
        >
          Not Picked ❌
        </button>
      </div>

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="block mx-auto text-sm text-gray-500 hover:text-black transition"
      >
        ← Back
      </button>
    </div>
  );
}
