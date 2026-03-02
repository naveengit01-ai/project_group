import { useNavigate } from "react-router-dom";
import Home from "./../Home";

const CARDS = [
  {
    title: "Food",
    desc: "Donate surplus cooked or packed food to those in need",
    icon: "🍱",
    path: "/afterlogin/donate/food",
    color: "#34d399",
    colorBg: "rgba(52,211,153,0.08)",
    colorBorder: "rgba(52,211,153,0.25)",
    colorGlow: "rgba(52,211,153,0.15)",
  },
  {
    title: "Clothes",
    desc: "Donate wearable clothes in good condition",
    icon: "👕",
    path: "/afterlogin/donate/clothes",
    color: "#60a5fa",
    colorBg: "rgba(96,165,250,0.08)",
    colorBorder: "rgba(96,165,250,0.25)",
    colorGlow: "rgba(96,165,250,0.15)",
  },
  {
    title: "Other",
    desc: "Donate essentials like books, utensils, and more",
    icon: "📦",
    path: "/afterlogin/donate/other",
    color: "#a78bfa",
    colorBg: "rgba(167,139,250,0.08)",
    colorBorder: "rgba(167,139,250,0.25)",
    colorGlow: "rgba(167,139,250,0.15)",
  },
  {
    title: "Near Orphanages",
    desc: "Support children nearby with essential items",
    icon: "🏠",
    path: "/afterlogin/donate/nearorphanages",
    color: "#fb923c",
    colorBg: "rgba(251,146,60,0.08)",
    colorBorder: "rgba(251,146,60,0.25)",
    colorGlow: "rgba(251,146,60,0.15)",
  },
];

export default function DonationsType() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        .dt-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 60px 24px 100px;
        }

        .dt-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .dt-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }

        .dt-wrap {
          position: relative; z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .dt-header {
          text-align: center;
          margin-bottom: 56px;
          animation: dtFadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes dtFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dt-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 100px;
          padding: 6px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #34d399;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .dt-badge-dot {
          width: 6px; height: 6px;
          background: #34d399; border-radius: 50%;
          animation: dtBlink 2s ease-in-out infinite;
        }

        @keyframes dtBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .dt-title {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dt-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dt-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: rgba(238,234,244,0.4);
        }

        /* ── GRID ── */
        .dt-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 64px;
        }

        /* ── CARD ── */
        .dt-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          padding: 28px 24px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          animation: dtCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes dtCardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dt-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--card-color, rgba(52,211,153,0.4)), transparent);
          opacity: 0;
          transition: opacity 0.35s;
        }

        .dt-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 100%, var(--card-glow, rgba(52,211,153,0.1)), transparent);
          opacity: 0;
          transition: opacity 0.35s;
          pointer-events: none;
        }

        .dt-card:hover {
          transform: translateY(-6px);
          border-color: var(--card-border, rgba(52,211,153,0.3));
          box-shadow: 0 20px 48px rgba(0,0,0,0.4), 0 0 0 1px var(--card-border, rgba(52,211,153,0.1));
          background: var(--card-bg, rgba(52,211,153,0.04));
        }

        .dt-card:hover::before,
        .dt-card:hover::after { opacity: 1; }

        .dt-card:active { transform: translateY(-2px) scale(0.98); }

        .dt-card-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: var(--card-bg, rgba(52,211,153,0.08));
          border: 1px solid var(--card-border, rgba(52,211,153,0.2));
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          margin-bottom: 18px;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; z-index: 1;
        }

        .dt-card:hover .dt-card-icon-wrap {
          transform: scale(1.1) rotate(-4deg);
          box-shadow: 0 8px 20px var(--card-glow, rgba(52,211,153,0.2));
        }

        .dt-card-num {
          position: absolute;
          top: 18px; right: 18px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.2);
          letter-spacing: 0.08em;
          z-index: 1;
        }

        .dt-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #eeeaf4;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
          position: relative; z-index: 1;
          transition: color 0.2s;
        }

        .dt-card:hover .dt-card-title {
          color: var(--card-color, #34d399);
        }

        .dt-card-desc {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.4);
          line-height: 1.6;
          margin-bottom: 22px;
          position: relative; z-index: 1;
        }

        .dt-card-cta {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px;
          font-weight: 600;
          color: var(--card-color, #34d399);
          position: relative; z-index: 1;
          transition: gap 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .dt-card:hover .dt-card-cta { gap: 12px; }

        .dt-card-arrow {
          display: inline-flex; align-items: center; justify-content: center;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: var(--card-bg, rgba(52,211,153,0.1));
          border: 1px solid var(--card-border, rgba(52,211,153,0.2));
          font-size: 11px;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .dt-card:hover .dt-card-arrow {
          background: var(--card-color, #34d399);
          color: #07080f;
          border-color: var(--card-color, #34d399);
        }

        /* ── HOME SECTION DIVIDER ── */
        .dt-section-divider {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 40px;
        }

        .dt-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .dt-divider-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.25);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        @media (max-width: 540px) {
          .dt-root { padding: 48px 16px 80px; }
          .dt-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }

        @media (max-width: 360px) {
          .dt-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dt-root">
        <div className="dt-grid-bg" />

        <div className="dt-wrap">

          {/* HEADER */}
          <div className="dt-header">
            <div className="dt-badge">
              <span className="dt-badge-dot" />
              Make a Difference
            </div>
            <h1 className="dt-title">
              What would you like to <span>Donate?</span>
            </h1>
            <p className="dt-subtitle">Choose a category to continue your donation</p>
          </div>

          {/* CARDS */}
          <div className="dt-grid">
            {CARDS.map((card, i) => (
              <div
                key={card.path}
                className="dt-card"
                style={{
                  "--card-color":  card.color,
                  "--card-bg":     card.colorBg,
                  "--card-border": card.colorBorder,
                  "--card-glow":   card.colorGlow,
                  animationDelay: `${i * 0.09}s`,
                }}
                onClick={() => navigate(card.path)}
              >
                <div className="dt-card-num">#{String(i + 1).padStart(2, "0")}</div>

                <div className="dt-card-icon-wrap">
                  {card.icon}
                </div>

                <div className="dt-card-title">{card.title}</div>
                <div className="dt-card-desc">{card.desc}</div>

                <div className="dt-card-cta">
                  Donate now
                  <span className="dt-card-arrow">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* DIVIDER */}
          <div className="dt-section-divider">
            <div className="dt-divider-line" />
            <span className="dt-divider-label">Sponsorships & Partners</span>
            <div className="dt-divider-line" />
          </div>

          {/* HOME / SPONSORSHIPS */}
          <Home />
        </div>
      </div>
    </>
  );
}