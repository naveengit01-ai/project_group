import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://back-end-project-group.onrender.com";

const CLOTHES_TYPES = [
  { label: "Shirts / T-Shirts", icon: "👕" },
  { label: "Sarees", icon: "🥻" },
  { label: "Jackets / Coats", icon: "🧥" },
  { label: "Kids Wear", icon: "🧒" },
  { label: "Trousers / Jeans", icon: "👖" },
  { label: "Other", icon: "📦" },
];

export default function Cloths() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [itemName, setItemName] = useState("");
  const [customItem, setCustomItem] = useState("");
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
          item_type: "clothes",
          item_name: finalItemName,
          quantity: Number(quantity),
          price_type: priceType,
          price_amount: priceType === "paid" ? Number(priceAmount) : 0,
          pickup_location: pickupLocation,
          remarks
        })
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

        .cl-root {
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

        .cl-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(96,165,250,0.06), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.05), transparent 60%);
          pointer-events: none; z-index: 0;
        }

        .cl-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(96,165,250,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96,165,250,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        .cl-wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 580px;
          animation: clCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes clCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* BACK */
        .cl-back {
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

        .cl-back:hover {
          background: rgba(255,255,255,0.08);
          color: #eeeaf4;
          border-color: rgba(255,255,255,0.15);
        }

        /* CARD */
        .cl-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          position: relative;
        }

        .cl-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* BADGE */
        .cl-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(96,165,250,0.08);
          border: 1px solid rgba(96,165,250,0.2);
          border-radius: 100px;
          padding: 6px 18px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: #60a5fa; letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 16px;
        }

        .cl-badge-dot {
          width: 6px; height: 6px; background: #60a5fa;
          border-radius: 50%; animation: clBlink 2s ease-in-out infinite;
        }

        @keyframes clBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .cl-title {
          font-size: 26px; font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.1;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cl-title span {
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cl-subtitle {
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: rgba(238,234,244,0.35); margin-bottom: 28px;
        }

        /* FORM */
        .cl-form { display: flex; flex-direction: column; gap: 12px; }

        .cl-field { display: flex; flex-direction: column; gap: 5px; }

        .cl-label {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: rgba(238,234,244,0.4); letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .cl-required { color: #f87171; font-size: 10px; margin-left: 2px; }

        .cl-input, .cl-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 14px;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif; font-size: 13px;
          outline: none; transition: all 0.2s;
          width: 100%; box-sizing: border-box;
        }

        .cl-input::placeholder, .cl-textarea::placeholder {
          color: rgba(238,234,244,0.2);
        }

        .cl-input:focus, .cl-textarea:focus {
          border-color: rgba(96,165,250,0.4);
          background: rgba(96,165,250,0.04);
          box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
        }

        .cl-textarea { resize: none; height: 80px; }

        /* CLOTHES TYPE GRID */
        .cl-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .cl-type-btn {
          padding: 10px 8px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(238,234,244,0.5);
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; flex-direction: column;
          align-items: center; gap: 5px;
          text-align: center;
        }

        .cl-type-btn:hover {
          background: rgba(96,165,250,0.06);
          border-color: rgba(96,165,250,0.2);
          color: rgba(238,234,244,0.8);
          transform: translateY(-2px);
        }

        .cl-type-btn.active {
          background: rgba(96,165,250,0.12);
          border-color: rgba(96,165,250,0.4);
          color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
          transform: translateY(-2px);
        }

        .cl-type-icon { font-size: 20px; line-height: 1; }
        .cl-type-label { font-size: 11px; line-height: 1.3; }

        /* QUANTITY STEPPER */
        .cl-stepper {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          overflow: hidden;
        }

        .cl-step-btn {
          width: 44px; height: 44px;
          background: transparent;
          border: none;
          color: rgba(238,234,244,0.5);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .cl-step-btn:hover {
          background: rgba(96,165,250,0.1);
          color: #60a5fa;
        }

        .cl-step-val {
          flex: 1; text-align: center;
          font-family: 'DM Mono', monospace; font-size: 16px;
          color: #eeeaf4; font-weight: 400;
          border-left: 1px solid rgba(255,255,255,0.06);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 10px 0;
        }

        /* TOGGLE */
        .cl-toggle-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .cl-toggle-btn {
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

        .cl-toggle-btn:hover {
          border-color: rgba(96,165,250,0.2);
          color: rgba(238,234,244,0.7);
        }

        .cl-toggle-btn.active-blue {
          background: rgba(96,165,250,0.12);
          border-color: rgba(96,165,250,0.4);
          color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
        }

        .cl-toggle-btn.active-amber {
          background: rgba(251,191,36,0.1);
          border-color: rgba(251,191,36,0.35);
          color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251,191,36,0.07);
        }

        /* LOCATION */
        .cl-location-row {
          display: flex; gap: 8px; align-items: stretch;
        }

        .cl-location-row .cl-input { flex: 1; }

        .cl-loc-btn {
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid rgba(96,165,250,0.25);
          background: rgba(96,165,250,0.08);
          color: #60a5fa;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
          flex-shrink: 0;
        }

        .cl-loc-btn:hover {
          background: rgba(96,165,250,0.15);
          border-color: rgba(96,165,250,0.4);
        }

        .cl-loc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .cl-loc-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(96,165,250,0.2);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: clSpin 0.7s linear infinite;
        }

        @keyframes clSpin { to { transform: rotate(360deg); } }

        /* DIVIDER */
        .cl-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 2px 0; }

        /* SUBMIT */
        .cl-submit {
          width: 100%; margin-top: 6px; padding: 14px;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          border: none; border-radius: 12px;
          color: #fff; font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(96,165,250,0.3);
          position: relative; overflow: hidden;
        }

        .cl-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }

        .cl-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(96,165,250,0.45);
        }

        .cl-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .cl-submit-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; z-index: 1;
        }

        .cl-submit-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: clSpin 0.7s linear infinite;
        }

        /* LOADING OVERLAY */
        .cl-overlay {
          position: fixed; inset: 0;
          background: rgba(7,8,15,0.92);
          backdrop-filter: blur(16px);
          z-index: 9999;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          animation: clFadeIn 0.25s ease both;
        }

        @keyframes clFadeIn { from{opacity:0} to{opacity:1} }

        .cl-plate {
          width: 90px; height: 90px; border-radius: 50%;
          border: 2px dashed rgba(96,165,250,0.4);
          display: flex; align-items: center; justify-content: center;
          animation: clRotate 6s linear infinite; margin-bottom: 22px;
        }

        .cl-plate-icon {
          font-size: 36px;
          animation: clPop 1.6s ease-in-out infinite;
        }

        @keyframes clRotate { to { transform: rotate(360deg); } }

        @keyframes clPop {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .cl-overlay-text {
          font-size: 16px; font-weight: 600; color: #eeeaf4; margin-bottom: 6px;
        }

        .cl-overlay-sub {
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        .cl-dots { display: flex; gap: 6px; margin-top: 18px; }

        .cl-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #60a5fa;
          animation: clDotPulse 1.4s ease-in-out infinite;
        }

        .cl-dot:nth-child(2) { animation-delay: 0.2s; }
        .cl-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes clDotPulse {
          0%,100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @media (max-width: 480px) {
          .cl-card { padding: 28px 18px; }
          .cl-root { padding: 32px 16px 80px; }
          .cl-type-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="cl-root">
        <div className="cl-grid-bg" />

        <div className="cl-wrap">
          {/* BACK */}
          <button className="cl-back" onClick={() => navigate("/afterlogin/donate")}>
            ← Back to Donation Types
          </button>

          {/* CARD */}
          <div className="cl-card">
            <div className="cl-badge">
              <span className="cl-badge-dot" />
              Clothes Donation
            </div>
            <div className="cl-title">Donate <span>Clothes</span> 👕</div>
            <div className="cl-subtitle">Donate usable clothes and help someone in need</div>

            <form className="cl-form" onSubmit={handleDonate}>

              {/* CLOTHES TYPE GRID */}
              <div className="cl-field">
                <label className="cl-label">Clothes Type <span className="cl-required">*</span></label>
                <div className="cl-type-grid">
                  {CLOTHES_TYPES.map(t => (
                    <button
                      key={t.label}
                      type="button"
                      className={`cl-type-btn ${itemName === t.label ? "active" : ""}`}
                      onClick={() => setItemName(t.label)}
                    >
                      <span className="cl-type-icon">{t.icon}</span>
                      <span className="cl-type-label">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CUSTOM IF OTHER */}
              {itemName === "Other" && (
                <div className="cl-field">
                  <label className="cl-label">Specify Item</label>
                  <input
                    className="cl-input"
                    placeholder="Describe the clothing item..."
                    value={customItem}
                    onChange={e => setCustomItem(e.target.value)}
                  />
                </div>
              )}

              {/* QUANTITY STEPPER */}
              <div className="cl-field">
                <label className="cl-label">Quantity <span className="cl-required">*</span></label>
                <div className="cl-stepper">
                  <button
                    type="button"
                    className="cl-step-btn"
                    onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}
                  >−</button>
                  <div className="cl-step-val">{quantity} pcs</div>
                  <button
                    type="button"
                    className="cl-step-btn"
                    onClick={() => setQuantity(q => Number(q) + 1)}
                  >+</button>
                </div>
              </div>

              <div className="cl-divider" />

              {/* PRICE TYPE */}
              <div className="cl-field">
                <label className="cl-label">Pricing</label>
                <div className="cl-toggle-row">
                  <button
                    type="button"
                    className={`cl-toggle-btn ${priceType === "free" ? "active-blue" : ""}`}
                    onClick={() => setPriceType("free")}
                  >
                    🎁 Free
                  </button>
                  <button
                    type="button"
                    className={`cl-toggle-btn ${priceType === "paid" ? "active-amber" : ""}`}
                    onClick={() => setPriceType("paid")}
                  >
                    💰 Paid
                  </button>
                </div>
              </div>

              {priceType === "paid" && (
                <div className="cl-field">
                  <label className="cl-label">Amount</label>
                  <input
                    className="cl-input"
                    type="number" min="1"
                    placeholder="Amount ₹"
                    value={priceAmount}
                    onChange={e => setPriceAmount(e.target.value)}
                  />
                </div>
              )}

              <div className="cl-divider" />

              {/* PICKUP LOCATION */}
              <div className="cl-field">
                <label className="cl-label">Pickup Location <span className="cl-required">*</span></label>
                <div className="cl-location-row">
                  <input
                    className="cl-input"
                    placeholder="Enter address or use GPS"
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                  />
                  <button
                    type="button"
                    className="cl-loc-btn"
                    onClick={getCurrentLocation}
                    disabled={locLoading}
                  >
                    {locLoading ? <span className="cl-loc-spinner" /> : "📍"}
                    {locLoading ? "Locating..." : "GPS"}
                  </button>
                </div>
              </div>

              {/* REMARKS */}
              <div className="cl-field">
                <label className="cl-label">Remarks <span style={{color:"rgba(238,234,244,0.3)"}}>optional</span></label>
                <textarea
                  className="cl-textarea"
                  placeholder="Condition, size range, or any notes..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <button className="cl-submit" type="submit" disabled={loading}>
                <div className="cl-submit-inner">
                  {loading && <span className="cl-submit-spinner" />}
                  {loading ? "Submitting..." : "Donate Clothes ❤️"}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="cl-overlay">
            <div className="cl-plate">
              <div className="cl-plate-icon">👕</div>
            </div>
            <div className="cl-overlay-text">Sending OTP to verify</div>
            <div className="cl-overlay-sub">Almost there 🌱</div>
            <div className="cl-dots">
              <div className="cl-dot" />
              <div className="cl-dot" />
              <div className="cl-dot" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}