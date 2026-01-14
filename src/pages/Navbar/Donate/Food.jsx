import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
      setPickupLocation(
        `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
      );
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

    try {
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
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black flex justify-center px-4 py-12">
      <BackgroundGlow />

      {/* LOADING OVERLAY */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20
                     bg-black/70 backdrop-blur
                     flex items-center justify-center"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-emerald-400 font-semibold"
          >
            Sending OTP…
          </motion.p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl
                   bg-white/10 backdrop-blur-xl
                   border border-white/20
                   rounded-3xl shadow-2xl
                   p-8"
      >
        {/* BACK */}
        <button
          onClick={() => navigate("/afterlogin/donate")}
          className="mb-6 text-sm font-semibold
                     text-gray-400 hover:text-white transition"
        >
          ← Back to Donation Types
        </button>

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-white mb-1">
          Donate Food 🍲
        </h1>
        <p className="text-emerald-400 mb-6">
          Share surplus food and help reduce waste
        </p>

        {/* FORM */}
        <form onSubmit={handleDonate} className="space-y-5">
          <input
            className="w-full px-4 py-3 rounded-xl
                       bg-black/40 text-white
                       border border-white/20
                       focus:outline-none focus:ring-2
                       focus:ring-emerald-500"
            placeholder="Food name"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
          />

          {/* FOOD TYPE */}
          <div className="grid grid-cols-2 gap-4">
            {["solid", "liquid"].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFoodType(type)}
                className={`py-3 rounded-xl font-semibold transition
                  ${foodType === type
                    ? "bg-emerald-400 text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                {type === "solid" ? "Solid (KG)" : "Liquid (Litres)"}
              </button>
            ))}
          </div>

          {/* QUANTITY */}
          {foodType === "solid" ? (
            <input
              type="number"
              min="1"
              className="w-full px-4 py-3 rounded-xl
                         bg-black/40 text-white
                         border border-white/20"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          ) : (
            <div>
              <input
                type="range"
                min="1"
                max="100"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full"
              />
              <p className="text-center font-bold text-white">
                {quantity} Litres
              </p>
            </div>
          )}

          {/* PRICE TYPE */}
          <div className="grid grid-cols-2 gap-4">
            {["free", "paid"].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setPriceType(type)}
                className={`py-3 rounded-xl font-semibold transition
                  ${priceType === type
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                {type === "free" ? "Free" : "Paid"}
              </button>
            ))}
          </div>

          {priceType === "paid" && (
            <input
              type="number"
              min="1"
              placeholder="Amount ₹"
              className="w-full px-4 py-3 rounded-xl
                         bg-black/40 text-white
                         border border-white/20"
              value={priceAmount}
              onChange={e => setPriceAmount(e.target.value)}
            />
          )}

          {/* LOCATION */}
          <input
            className="w-full px-4 py-3 rounded-xl
                       bg-black/40 text-white
                       border border-white/20"
            placeholder="Pickup location"
            value={pickupLocation}
            onChange={e => setPickupLocation(e.target.value)}
          />

          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-sm text-emerald-400 underline"
          >
            📍 Use current location
          </button>

          <textarea
            className="w-full px-4 py-3 rounded-xl
                       bg-black/40 text-white
                       border border-white/20"
            placeholder="Remarks (optional)"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full py-4 rounded-2xl
                       bg-emerald-400 text-black
                       font-bold hover:bg-emerald-300 transition"
          >
            Donate Food ❤️
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ===== SAME BACKGROUND GLOW ===== */
function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-black to-black" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
    </>
  );
}
