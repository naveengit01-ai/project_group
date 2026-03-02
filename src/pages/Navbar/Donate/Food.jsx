import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [locLoading, setLocLoading] = useState(false);

 const getCurrentLocation = () => {
  setLocLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        // Build a clean readable address
        const addr = data.address;
        const parts = [
          addr.road || addr.pedestrian || addr.footway,
          addr.neighbourhood || addr.suburb,
          addr.city || addr.town || addr.village,
          addr.state,
          addr.country
        ].filter(Boolean);
        setPickupLocation(parts.join(", "));
      } catch {
        // fallback to coords if geocoding fails
        setPickupLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      } finally {
        setLocLoading(false);
      }
    },
    () => {
      alert("Could not get location. Please allow location access.");
      setLocLoading(false);
    }
  );
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
          item_name: foodType === "solid" ? `Solid Food - ${itemName}` : `Liquid Food - ${itemName}`,
          quantity: Number(quantity),
          price_type: priceType,
          price_amount: priceType === "paid" ? Number(priceAmount) : 0,
          pickup_location: pickupLocation,
          remarks
        })
      });
      const data = await res.json();
      if (data.status === "otp_sent") {
        navigate("/afterlogin/donate/request", { state: { donation_id: data.donation_id } });
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        .fd-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 48px 24px 100px;
          display: flex;
          justify-content: center;
        }

        .fd-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none; z-index: 0;
        }

        .fd-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        .fd-wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 580px;
          animation: fdCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes fdCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* BACK BTN */
        .fd-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 8px 14px;
          color: rgba(238,234,244,0.5);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 28px;
        }

        .fd-back:hover {
          background: rgba(255,255,255,0.08);
          color: #eeeaf4;
          border-color: rgba(255,255,255,0.15);
        }

        /* CARD */
        .fd-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          position: relative;
        }

        .fd-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* BADGE */
        .fd-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 100px;
          padding: 6px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: #34d399;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 16px;
        }

        .fd-badge-dot {
          width: 6px; height: 6px; background: #34d399;
          border-radius: 50%; animation: fdBlink 2s ease-in-out infinite;
        }

        @keyframes fdBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .fd-title {
          font-size: 26px; font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.1;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fd-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fd-subtitle {
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: rgba(238,234,244,0.35); margin-bottom: 28px;
        }

        /* FORM */
        .fd-form { display: flex; flex-direction: column; gap: 12px; }

        .fd-field { display: flex; flex-direction: column; gap: 5px; }

        .fd-label {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: rgba(238,234,244,0.4); letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .fd-required { color: #f87171; font-size: 10px; margin-left: 2px; }

        .fd-input, .fd-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 14px;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif; font-size: 13px;
          outline: none; transition: all 0.2s;
          width: 100%; box-sizing: border-box;
        }

        .fd-input::placeholder, .fd-textarea::placeholder {
          color: rgba(238,234,244,0.2);
        }

        .fd-input:focus, .fd-textarea:focus {
          border-color: rgba(52,211,153,0.4);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        .fd-textarea { resize: none; height: 80px; }

        /* TOGGLE ROW */
        .fd-toggle-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }

        .fd-toggle-btn {
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(238,234,244,0.4);
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }

        .fd-toggle-btn:hover {
          border-color: rgba(52,211,153,0.2);
          color: rgba(238,234,244,0.7);
        }

        .fd-toggle-btn.active-green {
          background: rgba(52,211,153,0.12);
          border-color: rgba(52,211,153,0.4);
          color: #34d399;
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        .fd-toggle-btn.active-blue {
          background: rgba(96,165,250,0.12);
          border-color: rgba(96,165,250,0.4);
          color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
        }

        /* RANGE SLIDER */
        .fd-range-wrap {
          display: flex; flex-direction: column; gap: 8px;
        }

        .fd-range {
          width: 100%; accent-color: #34d399;
          height: 4px; cursor: pointer;
        }

        .fd-range-label {
          text-align: center;
          font-family: 'DM Mono', monospace; font-size: 13px;
          color: #34d399; font-weight: 400;
        }

        /* LOCATION ROW */
        .fd-location-row {
          display: flex; gap: 8px; align-items: stretch;
        }

        .fd-location-row .fd-input { flex: 1; }

        .fd-loc-btn {
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid rgba(52,211,153,0.25);
          background: rgba(52,211,153,0.08);
          color: #34d399;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
          flex-shrink: 0;
        }

        .fd-loc-btn:hover {
          background: rgba(52,211,153,0.15);
          border-color: rgba(52,211,153,0.4);
        }

        .fd-loc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .fd-loc-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(52,211,153,0.2);
          border-top-color: #34d399;
          border-radius: 50%;
          animation: fdSpin 0.7s linear infinite;
        }

        @keyframes fdSpin { to { transform: rotate(360deg); } }

        /* DIVIDER */
        .fd-divider {
          height: 1px; background: rgba(255,255,255,0.06); margin: 2px 0;
        }

        /* SUBMIT */
        .fd-submit {
          width: 100%; margin-top: 6px; padding: 14px;
          background: linear-gradient(135deg, #34d399, #10b981);
          border: none; border-radius: 12px;
          color: #07080f; font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(52,211,153,0.3);
          position: relative; overflow: hidden;
        }

        .fd-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }

        .fd-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(52,211,153,0.45);
        }

        .fd-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .fd-submit-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; z-index: 1;
        }

        .fd-submit-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(7,8,15,0.3);
          border-top-color: #07080f;
          border-radius: 50%;
          animation: fdSpin 0.7s linear infinite;
        }

        /* LOADING OVERLAY */
        .fd-overlay {
          position: fixed; inset: 0;
          background: rgba(7,8,15,0.92);
          backdrop-filter: blur(16px);
          z-index: 9999;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          animation: fdFadeIn 0.25s ease both;
        }

        @keyframes fdFadeIn { from{opacity:0} to{opacity:1} }

        .fd-plate {
          width: 90px; height: 90px; border-radius: 50%;
          border: 2px dashed rgba(52,211,153,0.4);
          display: flex; align-items: center; justify-content: center;
          animation: fdRotate 6s linear infinite; margin-bottom: 22px;
        }

        .fd-plate-icon {
          font-size: 36px;
          animation: fdPop 1.6s ease-in-out infinite;
        }

        @keyframes fdRotate { to { transform: rotate(360deg); } }

        @keyframes fdPop {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .fd-overlay-text {
          font-size: 16px; font-weight: 600; color: #eeeaf4; margin-bottom: 6px;
        }

        .fd-overlay-sub {
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        .fd-dots {
          display: flex; gap: 6px; margin-top: 18px;
        }

        .fd-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34d399;
          animation: fdDotPulse 1.4s ease-in-out infinite;
        }

        .fd-dot:nth-child(2) { animation-delay: 0.2s; }
        .fd-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes fdDotPulse {
          0%,100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @media (max-width: 480px) {
          .fd-card { padding: 28px 18px; }
          .fd-root { padding: 32px 16px 80px; }
        }
      `}</style>

      <div className="fd-root">
        <div className="fd-grid-bg" />

        <div className="fd-wrap">
          {/* BACK */}
          <button className="fd-back" onClick={() => navigate("/afterlogin/donate")}>
            ← Back to Donation Types
          </button>

          {/* CARD */}
          <div className="fd-card">
            <div className="fd-badge">
              <span className="fd-badge-dot" />
              Food Donation
            </div>
            <div className="fd-title">Donate <span>Food</span> 🍲</div>
            <div className="fd-subtitle">Share surplus food and help reduce waste</div>

            <form className="fd-form" onSubmit={handleDonate}>

              {/* FOOD NAME */}
              <div className="fd-field">
                <label className="fd-label">Food Name <span className="fd-required">*</span></label>
                <input
                  className="fd-input"
                  placeholder="e.g. Rice, Dal, Biryani..."
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                />
              </div>

              {/* FOOD TYPE TOGGLE */}
              <div className="fd-field">
                <label className="fd-label">Food Type</label>
                <div className="fd-toggle-row">
                  <button
                    type="button"
                    className={`fd-toggle-btn ${foodType === "solid" ? "active-green" : ""}`}
                    onClick={() => setFoodType("solid")}
                  >
                    🍱 Solid (KG)
                  </button>
                  <button
                    type="button"
                    className={`fd-toggle-btn ${foodType === "liquid" ? "active-green" : ""}`}
                    onClick={() => setFoodType("liquid")}
                  >
                    🥛 Liquid (Litres)
                  </button>
                </div>
              </div>

              {/* QUANTITY */}
              <div className="fd-field">
                <label className="fd-label">
                  Quantity <span className="fd-required">*</span>
                </label>
                {foodType === "solid" ? (
                  <input
                    className="fd-input"
                    type="number" min="1"
                    placeholder="Quantity in KG"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
                ) : (
                  <div className="fd-range-wrap">
                    <input
                      className="fd-range"
                      type="range" min="1" max="100"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                    />
                    <div className="fd-range-label">{quantity} Litres</div>
                  </div>
                )}
              </div>

              <div className="fd-divider" />

              {/* PRICE TYPE */}
              <div className="fd-field">
                <label className="fd-label">Pricing</label>
                <div className="fd-toggle-row">
                  <button
                    type="button"
                    className={`fd-toggle-btn ${priceType === "free" ? "active-green" : ""}`}
                    onClick={() => setPriceType("free")}
                  >
                    🎁 Free
                  </button>
                  <button
                    type="button"
                    className={`fd-toggle-btn ${priceType === "paid" ? "active-blue" : ""}`}
                    onClick={() => setPriceType("paid")}
                  >
                    💰 Paid
                  </button>
                </div>
              </div>

              {priceType === "paid" && (
                <div className="fd-field">
                  <label className="fd-label">Amount</label>
                  <input
                    className="fd-input"
                    type="number" min="1"
                    placeholder="Amount ₹"
                    value={priceAmount}
                    onChange={e => setPriceAmount(e.target.value)}
                  />
                </div>
              )}

              <div className="fd-divider" />

              {/* PICKUP LOCATION */}
              <div className="fd-field">
                <label className="fd-label">Pickup Location <span className="fd-required">*</span></label>
                <div className="fd-location-row">
                  <input
                    className="fd-input"
                    placeholder="Enter address or use GPS"
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                  />
                  <button
                    type="button"
                    className="fd-loc-btn"
                    onClick={getCurrentLocation}
                    disabled={locLoading}
                  >
                    {locLoading
                      ? <span className="fd-loc-spinner" />
                      : "📍"
                    }
                    {locLoading ? "Locating..." : "GPS"}
                  </button>
                </div>
              </div>

              {/* REMARKS */}
              <div className="fd-field">
                <label className="fd-label">Remarks <span style={{color:"rgba(238,234,244,0.3)"}}>optional</span></label>
                <textarea
                  className="fd-textarea"
                  placeholder="Any additional notes..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <button className="fd-submit" type="submit" disabled={loading}>
                <div className="fd-submit-inner">
                  {loading && <span className="fd-submit-spinner" />}
                  {loading ? "Submitting..." : "Donate Food ❤️"}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="fd-overlay">
            <div className="fd-plate">
              <div className="fd-plate-icon">🍲</div>
            </div>
            <div className="fd-overlay-text">Sending OTP to verify</div>
            <div className="fd-overlay-sub">Almost there 🌱</div>
            <div className="fd-dots">
              <div className="fd-dot" />
              <div className="fd-dot" />
              <div className="fd-dot" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}