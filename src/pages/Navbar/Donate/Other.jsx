import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://back-end-project-group.onrender.com";

const ITEM_TYPES = [
  { label: "Books",       icon: "📚" },
  { label: "Utensils",    icon: "🍳" },
  { label: "Toys",        icon: "🧸" },
  { label: "Furniture",   icon: "🪑" },
  { label: "Electronics", icon: "📱" },
  { label: "Stationery",  icon: "✏️" },
  { label: "Medicines",   icon: "💊" },
  { label: "Blankets",    icon: "🛏️" },
  { label: "Other",       icon: "📦" },
];

export default function Other() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [itemName, setItemName]       = useState("");
  const [customItem, setCustomItem]   = useState("");
  const [quantity, setQuantity]       = useState(1);
  const [priceType, setPriceType]     = useState("free");
  const [priceAmount, setPriceAmount] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [remarks, setRemarks]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [locLoading, setLocLoading]   = useState(false);

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
          const addr = data.address;
          const parts = [
            addr.road || addr.pedestrian || addr.footway,
            addr.neighbourhood || addr.suburb,
            addr.city || addr.town || addr.village,
            addr.state,
            addr.country,
          ].filter(Boolean);
          setPickupLocation(parts.join(", "));
        } catch {
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

  const finalItemName = itemName === "Other" ? customItem : itemName;

  const handleDonate = async e => {
    e.preventDefault();
    if (!finalItemName || !quantity || !pickupLocation) {
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
          item_type: "other",
          item_name: finalItemName,
          quantity: Number(quantity),
          price_type: priceType,
          price_amount: priceType === "paid" ? Number(priceAmount) : 0,
          pickup_location: pickupLocation,
          remarks,
        }),
      });
      const data = await res.json();
      if (data.status === "otp_sent") {
        navigate("/afterlogin/donate/verify", { state: { donation_id: data.donation_id } });
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

        .ot-root {
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

        .ot-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(167,139,250,0.06), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(139,92,246,0.04), transparent 60%);
          pointer-events: none; z-index: 0;
        }

        .ot-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(167,139,250,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167,139,250,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        .ot-wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 580px;
          animation: otCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes otCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* BACK */
        .ot-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 8px 14px;
          color: rgba(238,234,244,0.5);
          font-family: 'DM Mono', monospace; font-size: 12px;
          cursor: pointer; transition: all 0.2s;
          margin-bottom: 28px;
        }

        .ot-back:hover {
          background: rgba(255,255,255,0.08);
          color: #eeeaf4;
          border-color: rgba(255,255,255,0.15);
        }

        /* CARD */
        .ot-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          position: relative;
        }

        .ot-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* BADGE */
        .ot-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(167,139,250,0.08);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 100px;
          padding: 6px 18px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: #a78bfa; letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 16px;
        }

        .ot-badge-dot {
          width: 6px; height: 6px; background: #a78bfa;
          border-radius: 50%; animation: otBlink 2s ease-in-out infinite;
        }

        @keyframes otBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .ot-title {
          font-size: 26px; font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.1;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ot-title span {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ot-subtitle {
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: rgba(238,234,244,0.35); margin-bottom: 28px;
        }

        /* FORM */
        .ot-form { display: flex; flex-direction: column; gap: 12px; }
        .ot-field { display: flex; flex-direction: column; gap: 5px; }

        .ot-label {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: rgba(238,234,244,0.4); letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ot-required { color: #f87171; font-size: 10px; margin-left: 2px; }

        .ot-input, .ot-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 14px;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif; font-size: 13px;
          outline: none; transition: all 0.2s;
          width: 100%; box-sizing: border-box;
        }

        .ot-input::placeholder, .ot-textarea::placeholder {
          color: rgba(238,234,244,0.2);
        }

        .ot-input:focus, .ot-textarea:focus {
          border-color: rgba(167,139,250,0.4);
          background: rgba(167,139,250,0.04);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.08);
        }

        .ot-textarea { resize: none; height: 80px; }

        /* ITEM TYPE GRID */
        .ot-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .ot-type-btn {
          padding: 10px 8px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(238,234,244,0.5);
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; flex-direction: column;
          align-items: center; gap: 5px; text-align: center;
        }

        .ot-type-btn:hover {
          background: rgba(167,139,250,0.06);
          border-color: rgba(167,139,250,0.2);
          color: rgba(238,234,244,0.8);
          transform: translateY(-2px);
        }

        .ot-type-btn.active {
          background: rgba(167,139,250,0.12);
          border-color: rgba(167,139,250,0.4);
          color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167,139,250,0.08);
          transform: translateY(-2px);
        }

        .ot-type-icon { font-size: 20px; line-height: 1; }
        .ot-type-label { font-size: 11px; line-height: 1.3; }

        /* QUANTITY STEPPER */
        .ot-stepper {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; overflow: hidden;
        }

        .ot-step-btn {
          width: 44px; height: 44px;
          background: transparent; border: none;
          color: rgba(238,234,244,0.5);
          font-size: 18px; cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ot-step-btn:hover {
          background: rgba(167,139,250,0.1);
          color: #a78bfa;
        }

        .ot-step-val {
          flex: 1; text-align: center;
          font-family: 'DM Mono', monospace; font-size: 16px;
          color: #eeeaf4; font-weight: 400;
          border-left: 1px solid rgba(255,255,255,0.06);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 10px 0;
        }

        /* TOGGLE */
        .ot-toggle-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .ot-toggle-btn {
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

        .ot-toggle-btn:hover {
          border-color: rgba(167,139,250,0.2);
          color: rgba(238,234,244,0.7);
        }

        .ot-toggle-btn.active-purple {
          background: rgba(167,139,250,0.12);
          border-color: rgba(167,139,250,0.4);
          color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167,139,250,0.08);
        }

        .ot-toggle-btn.active-amber {
          background: rgba(251,191,36,0.1);
          border-color: rgba(251,191,36,0.35);
          color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251,191,36,0.07);
        }

        /* LOCATION */
        .ot-location-row {
          display: flex; gap: 8px; align-items: stretch;
        }

        .ot-location-row .ot-input { flex: 1; }

        .ot-loc-btn {
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid rgba(167,139,250,0.25);
          background: rgba(167,139,250,0.08);
          color: #a78bfa;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 5px; flex-shrink: 0;
        }

        .ot-loc-btn:hover {
          background: rgba(167,139,250,0.15);
          border-color: rgba(167,139,250,0.4);
        }

        .ot-loc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ot-loc-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(167,139,250,0.2);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: otSpin 0.7s linear infinite;
        }

        @keyframes otSpin { to { transform: rotate(360deg); } }

        /* DIVIDER */
        .ot-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 2px 0; }

        /* SUBMIT */
        .ot-submit {
          width: 100%; margin-top: 6px; padding: 14px;
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          border: none; border-radius: 12px;
          color: #fff; font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(167,139,250,0.3);
          position: relative; overflow: hidden;
        }

        .ot-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }

        .ot-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(167,139,250,0.45);
        }

        .ot-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .ot-submit-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; z-index: 1;
        }

        .ot-submit-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: otSpin 0.7s linear infinite;
        }

        /* LOADING OVERLAY */
        .ot-overlay {
          position: fixed; inset: 0;
          background: rgba(7,8,15,0.92);
          backdrop-filter: blur(16px);
          z-index: 9999;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          animation: otFadeIn 0.25s ease both;
        }

        @keyframes otFadeIn { from{opacity:0} to{opacity:1} }

        .ot-plate {
          width: 90px; height: 90px; border-radius: 50%;
          border: 2px dashed rgba(167,139,250,0.4);
          display: flex; align-items: center; justify-content: center;
          animation: otRotate 6s linear infinite; margin-bottom: 22px;
        }

        .ot-plate-icon {
          font-size: 36px;
          animation: otPop 1.6s ease-in-out infinite;
        }

        @keyframes otRotate { to { transform: rotate(360deg); } }

        @keyframes otPop {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .ot-overlay-text {
          font-size: 16px; font-weight: 600;
          color: #eeeaf4; margin-bottom: 6px;
        }

        .ot-overlay-sub {
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        .ot-dots { display: flex; gap: 6px; margin-top: 18px; }

        .ot-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a78bfa;
          animation: otDotPulse 1.4s ease-in-out infinite;
        }

        .ot-dot:nth-child(2) { animation-delay: 0.2s; }
        .ot-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes otDotPulse {
          0%,100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @media (max-width: 480px) {
          .ot-card { padding: 28px 18px; }
          .ot-root { padding: 32px 16px 80px; }
          .ot-type-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="ot-root">
        <div className="ot-grid-bg" />

        <div className="ot-wrap">

          {/* BACK */}
          <button className="ot-back" onClick={() => navigate("/afterlogin/donate")}>
            ← Back to Donation Types
          </button>

          {/* CARD */}
          <div className="ot-card">
            <div className="ot-badge">
              <span className="ot-badge-dot" />
              Other Donations
            </div>
            <div className="ot-title">Donate <span>Other Items</span> 📦</div>
            <div className="ot-subtitle">Books, utensils, essentials and more</div>

            <form className="ot-form" onSubmit={handleDonate}>

              {/* ITEM TYPE GRID */}
              <div className="ot-field">
                <label className="ot-label">Item Category <span className="ot-required">*</span></label>
                <div className="ot-type-grid">
                  {ITEM_TYPES.map(t => (
                    <button
                      key={t.label}
                      type="button"
                      className={`ot-type-btn ${itemName === t.label ? "active" : ""}`}
                      onClick={() => setItemName(t.label)}
                    >
                      <span className="ot-type-icon">{t.icon}</span>
                      <span className="ot-type-label">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CUSTOM IF OTHER */}
              {itemName === "Other" && (
                <div className="ot-field">
                  <label className="ot-label">Describe Item <span className="ot-required">*</span></label>
                  <input
                    className="ot-input"
                    placeholder="What are you donating?"
                    value={customItem}
                    onChange={e => setCustomItem(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {/* QUANTITY STEPPER */}
              <div className="ot-field">
                <label className="ot-label">Quantity <span className="ot-required">*</span></label>
                <div className="ot-stepper">
                  <button
                    type="button"
                    className="ot-step-btn"
                    onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}
                  >−</button>
                  <div className="ot-step-val">{quantity} {quantity === 1 ? "item" : "items"}</div>
                  <button
                    type="button"
                    className="ot-step-btn"
                    onClick={() => setQuantity(q => Number(q) + 1)}
                  >+</button>
                </div>
              </div>

              <div className="ot-divider" />

              {/* PRICE TYPE */}
              <div className="ot-field">
                <label className="ot-label">Pricing</label>
                <div className="ot-toggle-row">
                  <button
                    type="button"
                    className={`ot-toggle-btn ${priceType === "free" ? "active-purple" : ""}`}
                    onClick={() => setPriceType("free")}
                  >
                    🎁 Free
                  </button>
                  <button
                    type="button"
                    className={`ot-toggle-btn ${priceType === "paid" ? "active-amber" : ""}`}
                    onClick={() => setPriceType("paid")}
                  >
                    💰 Paid
                  </button>
                </div>
              </div>

              {priceType === "paid" && (
                <div className="ot-field">
                  <label className="ot-label">Amount</label>
                  <input
                    className="ot-input"
                    type="number" min="1"
                    placeholder="Amount ₹"
                    value={priceAmount}
                    onChange={e => setPriceAmount(e.target.value)}
                  />
                </div>
              )}

              <div className="ot-divider" />

              {/* PICKUP LOCATION */}
              <div className="ot-field">
                <label className="ot-label">Pickup Location <span className="ot-required">*</span></label>
                <div className="ot-location-row">
                  <input
                    className="ot-input"
                    placeholder="Enter address or use GPS"
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                  />
                  <button
                    type="button"
                    className="ot-loc-btn"
                    onClick={getCurrentLocation}
                    disabled={locLoading}
                  >
                    {locLoading ? <span className="ot-loc-spinner" /> : "📍"}
                    {locLoading ? "Locating..." : "GPS"}
                  </button>
                </div>
              </div>

              {/* REMARKS */}
              <div className="ot-field">
                <label className="ot-label">Remarks <span style={{color:"rgba(238,234,244,0.3)"}}>optional</span></label>
                <textarea
                  className="ot-textarea"
                  placeholder="Condition, quantity details, or any notes..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <button className="ot-submit" type="submit" disabled={loading}>
                <div className="ot-submit-inner">
                  {loading && <span className="ot-submit-spinner" />}
                  {loading ? "Submitting..." : "Donate Item ❤️"}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="ot-overlay">
            <div className="ot-plate">
              <div className="ot-plate-icon">📦</div>
            </div>
            <div className="ot-overlay-text">Sending OTP to verify</div>
            <div className="ot-overlay-sub">Almost there 🌱</div>
            <div className="ot-dots">
              <div className="ot-dot" />
              <div className="ot-dot" />
              <div className="ot-dot" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}