import { useState } from "react";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Cloths() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState("free");
  const [priceAmount, setPriceAmount] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

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
        item_type: "clothes",
        item_name: itemName,
        quantity: Number(quantity),
        price_type: priceType,
        price_amount: priceType === "paid" ? Number(priceAmount) : 0,
        pickup_location: pickupLocation,
        remarks
      })
    });

    const data = await res.json();

    if (data.status === "otp_sent") {
      navigate("/afterlogin/donate/verify", {
        state: { donation_id: data.donation_id }
      });
    } else {
      alert(data.status);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">

        {/* 🔙 BACK */}
        <button
          onClick={() => navigate("/afterlogin/donate")}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-black"
        >
          ← Back to Donation Types
        </button>

        <h1 className="text-3xl font-extrabold mb-1">Donate Clothes 👕</h1>
        <p className="text-gray-500 mb-6">
          Donate usable clothes and help someone in need
        </p>

        <form onSubmit={handleDonate} className="space-y-5">
          <input
            className="input"
            placeholder="Clothes type (Shirts, Sarees, Jackets)"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
          />

          <input
            type="number"
            min="1"
            className="input"
            placeholder="Number of clothes"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

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

          <input
            className="input"
            placeholder="Pickup location"
            value={pickupLocation}
            onChange={e => setPickupLocation(e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Remarks (optional)"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />

          <button className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700">
            {loading ? "Sending OTP..." : "Donate Clothes ❤️"}
          </button>
        </form>
      </div>
    </div>
  );
}
