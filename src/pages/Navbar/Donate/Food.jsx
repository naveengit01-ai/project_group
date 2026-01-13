import { useState } from "react";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Food() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [foodType, setFoodType] = useState("solid");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState("free");
  const [priceAmount, setPriceAmount] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      setPickupLocation(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
    });
  };

  const handleDonate = async e => {
    e.preventDefault();

    if (!itemName || !quantity || !pickupLocation) {
      alert("Please fill all required fields");
      return;
    }

    if (priceType === "paid" && (!priceAmount || priceAmount <= 0)) {
      alert("Enter valid amount");
      return;
    }

    setLoading(true);

    const res = await fetch(`${BASE_URL}/donate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donor_email: user.email,
        donor_name: user.first_name,
        item_type: "food",
        item_name:
          foodType === "solid"
            ? `Solid Food - ${itemName}`
            : `Liquid Food - ${itemName}`,
        quantity: Number(quantity),
        price_type: priceType,
        price_amount: priceType === "paid" ? Number(priceAmount) : 0,
        pickup_location: pickupLocation,
        remarks
      })
    });

    const data = await res.json();

    if (data.status === "otp_sent") {
      navigate("/afterlogin/donate/request", {
        state: { donation_id: data.donation_id }
      });
    } else {
      alert(data.status);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-green-50 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">

        {/* 🔙 BACK BUTTON */}
        <button
          onClick={() => navigate("/afterlogin/donate")}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-black transition"
        >
          ← Back to Donation Types
        </button>

        {/* HEADER */}
        <h1 className="text-3xl font-extrabold mb-1">Donate Food 🍲</h1>
        <p className="text-gray-500 mb-6">
          Share surplus food and help reduce waste
        </p>

        {/* FORM */}
        <form onSubmit={handleDonate} className="space-y-5">
          <input
            className="input"
            placeholder="Food name"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
          />

          {/* FOOD TYPE */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFoodType("solid")}
              className={`py-3 rounded-xl font-semibold ${
                foodType === "solid"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Solid (KG)
            </button>

            <button
              type="button"
              onClick={() => setFoodType("liquid")}
              className={`py-3 rounded-xl font-semibold ${
                foodType === "liquid"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Liquid (Litres)
            </button>
          </div>

          {/* QUANTITY */}
          {foodType === "solid" ? (
            <input
              type="number"
              min="1"
              className="input"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          ) : (
            <>
              <input
                type="range"
                min="1"
                max="100"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
              <p className="text-center font-bold">{quantity} Litres</p>
            </>
          )}

          {/* FREE / PAID */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPriceType("free")}
              className={`py-3 rounded-xl font-semibold ${
                priceType === "free"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Free
            </button>

            <button
              type="button"
              onClick={() => setPriceType("paid")}
              className={`py-3 rounded-xl font-semibold ${
                priceType === "paid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Paid
            </button>
          </div>

          {priceType === "paid" && (
            <input
              type="number"
              min="1"
              className="input"
              placeholder="Amount ₹"
              value={priceAmount}
              onChange={e => setPriceAmount(e.target.value)}
            />
          )}

          {/* LOCATION */}
          <input
            className="input"
            placeholder="Pickup location"
            value={pickupLocation}
            onChange={e => setPickupLocation(e.target.value)}
          />

          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-sm text-green-600 underline"
          >
            📍 Use current location
          </button>

          <textarea
            className="input"
            placeholder="Remarks (optional)"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
          >
            {loading ? "Sending OTP..." : "Donate Food ❤️"}
          </button>
        </form>
      </div>
    </div>
  );
}
