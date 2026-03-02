import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Home from "./Navbar/Home";
import AI_Bot from "./Ai_Bot";

const quotes = [
  "Don't waste food. Someone is praying for it.",
  "Hunger exists not because of scarcity, but because of neglect.",
  "Food should fill stomachs, not landfills.",
  "What is extra for you can be everything for someone else.",
  "A shared meal is dignity restored.",
  "Care begins with sharing.",
];

const images = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
  "https://images.unsplash.com/photo-1543352634-8730b0d7b5c5",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc",
];

export default function Afterlogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const role = user.user_type;
  const email = user.email;
  const firstLetter = email.charAt(0).toUpperCase();
  const isAdmin = role === "admin";
  const isHome = location.pathname === "/afterlogin";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #07080f; }

        .al-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .al-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .al-grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }

        /* ═══════════ NAVBAR ═══════════ */
        .al-nav {
          position: fixed;
          top: 16px; left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          width: calc(100% - 32px);
          max-width: 1100px;
          background: rgba(13,14,26,0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(52,211,153,0.04) inset;
          animation: navDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes navDrop {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .al-nav::before {
          content: '';
          position: absolute;
          top: 0; left: 20%; right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.35), transparent);
          border-radius: 100px;
        }

        .al-logo {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.03em;
          cursor: pointer;
          background: linear-gradient(135deg, #eeeaf4, #a8a0c8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: opacity 0.2s;
          white-space: nowrap;
        }

        .al-logo span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .al-logo:hover { opacity: 0.8; }

        .al-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .al-nav-btn {
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: rgba(238,234,244,0.55);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .al-nav-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #eeeaf4;
        }

        .al-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .al-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
          cursor: pointer;
          border: 1.5px solid rgba(52,211,153,0.4);
          background: rgba(52,211,153,0.15);
          color: #34d399;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .al-avatar.rider {
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.15);
          color: #818cf8;
        }

        .al-avatar:hover {
          transform: scale(1.08);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.15);
        }

        .al-menu-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(238,234,244,0.6);
          font-size: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .al-menu-btn:hover {
          background: rgba(255,255,255,0.09);
          color: #eeeaf4;
          border-color: rgba(255,255,255,0.2);
        }

        /* DROPDOWN */
        .al-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 220px;
          background: #0d0e1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.5);
          animation: dropIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
          z-index: 200;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.92) translateY(-8px); transform-origin: top right; }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .al-dropdown::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent);
          border-radius: 16px 16px 0 0;
        }

        .al-menu-item {
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: rgba(238,234,244,0.65);
          display: flex; align-items: center; gap: 10px;
          transition: all 0.15s;
        }

        .al-menu-item:hover {
          background: rgba(255,255,255,0.06);
          color: #eeeaf4;
        }

        .al-menu-item.danger {
          color: rgba(248,113,113,0.7);
        }

        .al-menu-item.danger:hover {
          background: rgba(248,113,113,0.08);
          color: #f87171;
        }

        .al-menu-icon {
          font-size: 14px;
          width: 18px;
          text-align: center;
          flex-shrink: 0;
        }

        .al-menu-hr {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 6px 4px;
        }

        .al-menu-section {
          padding: 6px 12px 4px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: rgba(238,234,244,0.25);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* hide desktop links on small screens */
        @media (max-width: 768px) {
          .al-nav-links { display: none; }
        }

        /* ═══════════ ADMIN DASHBOARD ═══════════ */
        .al-admin-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        .al-admin-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 40px 36px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          animation: cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          position: relative;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .al-admin-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          border-radius: 28px 28px 0 0;
        }

        .al-admin-badge {
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
          margin-bottom: 16px;
        }

        .al-admin-badge-dot {
          width: 6px; height: 6px;
          background: #34d399;
          border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .al-admin-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #eeeaf4 0%, #a8a0c8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .al-admin-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .al-admin-sub {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.35);
          margin-bottom: 32px;
        }

        .al-admin-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .al-admin-tile {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 18px 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .al-admin-tile::before {
          content: '';
          position: absolute; inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .al-admin-tile:hover {
          transform: translateY(-3px);
          border-color: var(--tile-color, rgba(52,211,153,0.3));
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }

        .al-admin-tile:hover::before { opacity: 1; }

        .al-tile-icon {
          font-size: 22px;
          line-height: 1;
        }

        .al-tile-label {
          font-size: 13px;
          font-weight: 700;
          color: #eeeaf4;
          letter-spacing: -0.01em;
        }

        .al-tile-desc {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.35);
        }

        .al-admin-tile-full {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .al-admin-tile-full:hover {
          transform: translateY(-2px);
          border-color: rgba(52,211,153,0.3);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }

        .al-admin-tile-full .al-tile-icon { font-size: 20px; }

        .al-logout-btn {
          display: block;
          margin: 16px auto 0;
          background: none;
          border: none;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(248,113,113,0.55);
          cursor: pointer;
          transition: color 0.2s;
          letter-spacing: 0.05em;
        }

        .al-logout-btn:hover { color: #f87171; }

        @media (max-width: 480px) {
          .al-admin-grid { grid-template-columns: 1fr; }
          .al-admin-card { padding: 32px 20px; }
        }

        /* ═══════════ HERO ═══════════ */
        .al-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .al-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity 1.2s ease;
        }

        .al-hero-img.hidden { opacity: 0; }

        .al-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(7,8,15,0.2) 0%,
            rgba(7,8,15,0.55) 50%,
            rgba(7,8,15,0.9) 100%
          );
        }

        .al-hero-content {
          position: relative; z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
        }

        .al-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.25);
          border-radius: 100px;
          padding: 6px 18px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #34d399;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 24px;
          animation: fadeUp 0.8s ease both;
        }

        .al-hero-badge-dot {
          width: 6px; height: 6px;
          background: #34d399;
          border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }

        .al-hero-title {
          font-size: clamp(40px, 7vw, 80px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.0;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.75) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeUp 0.8s 0.1s ease both;
        }

        .al-hero-title span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .al-hero-quote {
          max-width: 600px;
          font-family: 'DM Mono', monospace;
          font-size: clamp(13px, 2vw, 16px);
          color: rgba(238,234,244,0.55);
          line-height: 1.7;
          margin-bottom: 36px;
          min-height: 48px;
          animation: fadeUp 0.8s 0.2s ease both;
          transition: opacity 0.5s;
        }

        .al-hero-dots {
          display: flex; gap: 6px;
          animation: fadeUp 0.8s 0.3s ease both;
        }

        .al-hero-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(52,211,153,0.3);
          cursor: pointer;
          transition: all 0.3s;
        }

        .al-hero-dot.active {
          background: #34d399;
          width: 20px;
          border-radius: 3px;
        }

        .al-hero-scroll {
          position: absolute;
          bottom: 32px; left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(238,234,244,0.3);
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          animation: fadeUp 1s 0.5s ease both;
        }

        .al-hero-scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(52,211,153,0.6), transparent);
          animation: scrollLine 2s ease-in-out infinite;
        }

        @keyframes scrollLine {
          0%,100% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(0.6); opacity: 0.4; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ═══════════ OUTLET ═══════════ */
        .al-outlet {
          position: relative;
          z-index: 1;
          padding-top: 100px;
          min-height: 100vh;
        }
      `}</style>

      <div className="al-root">
        <div className="al-grid-bg" />

        {/* ═══════════ ADMIN ═══════════ */}
        {isAdmin && isHome && (
          <div className="al-admin-root">
            <div className="al-admin-card">
              <div className="al-admin-badge">
                <span className="al-admin-badge-dot" />
                Admin Panel
              </div>
              <div className="al-admin-title">Control <span>Center</span></div>
              <div className="al-admin-sub">Manage the platform — all tools in one place</div>

              <div className="al-admin-grid">
                {[
                  { icon: "📊", label: "Overall Statistics", desc: "Platform metrics & insights", path: "/afterlogin/overall", color: "rgba(52,211,153,0.3)" },
                  { icon: "🎯", label: "Promotions", desc: "Manage campaigns", path: "/afterlogin/promotions", color: "rgba(99,210,255,0.3)" },
                  { icon: "💼", label: "Add Job", desc: "Post opportunities", path: "/afterlogin/add-job", color: "rgba(251,191,36,0.3)" },
                  { icon: "📺", label: "YouTube Content", desc: "Manage video library", path: "/afterlogin/youtube-content", color: "rgba(248,113,113,0.3)" },
                  { icon: "🔔", label: "Notifications", desc: "Send alerts & updates", path: "/afterlogin/notifications", color: "rgba(244,114,182,0.3)" },
                  { icon: "📝", label: "To-Do List", desc: "Track your tasks", path: "/afterlogin/todo", color: "rgba(167,139,250,0.3)" },
                ].map((tile, i) => (
                  <div
                    key={tile.path}
                    className="al-admin-tile"
                    style={{
                      "--tile-color": tile.color,
                      animationDelay: `${i * 0.07}s`,
                      animation: "cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                    onClick={() => navigate(tile.path)}
                  >
                    <div className="al-tile-icon">{tile.icon}</div>
                    <div className="al-tile-label">{tile.label}</div>
                    <div className="al-tile-desc">{tile.desc}</div>
                  </div>
                ))}
              </div>

              <button
                className="al-logout-btn"
                onClick={() => { localStorage.clear(); navigate("/login"); }}
              >
                ⎋ &nbsp;Logout
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ NAVBAR (USER / RIDER) ═══════════ */}
        {!isAdmin && (
          <nav className="al-nav">
            <div className="al-logo" onClick={() => navigate("/afterlogin")}>
              DW<span>JD</span>
            </div>

            <div className="al-nav-links">
              {[
                { label: "Home",        path: "/afterlogin" },
                { label: "About",       path: "/afterlogin/about" },
                { label: "Contact",     path: "/afterlogin/contact" },
                { label: "Code Editor", path: "/afterlogin/code-editor" },
                { label: "YouTube",     path: "/youtube" },
              ].map(link => (
                <button
                  key={link.path}
                  className="al-nav-btn"
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="al-nav-right" ref={menuRef}>
              <div
                className={`al-avatar ${role === "rider" ? "rider" : ""}`}
                title={email}
                onClick={() => navigate("/afterlogin/profile")}
              >
                {firstLetter}
              </div>

              <button
                className="al-menu-btn"
                onClick={() => setMenuOpen(p => !p)}
              >
                {menuOpen ? "✕" : "☰"}
              </button>

              {menuOpen && (
                <div className="al-dropdown">
                  <div className="al-menu-section">Navigation</div>
                  {[
                    { icon: "🏠", label: "Home",        path: "/afterlogin" },
                    { icon: "ℹ️",  label: "About",       path: "/afterlogin/about" },
                    { icon: "📞", label: "Contact",     path: "/afterlogin/contact" },
                    { icon: "💻", label: "Code Editor", path: "/afterlogin/code-editor" },
                    { icon: "▶️",  label: "YouTube",     path: "/youtube" },
                  ].map(item => (
                    <div
                      key={item.path}
                      className="al-menu-item"
                      onClick={() => { setMenuOpen(false); navigate(item.path); }}
                    >
                      <span className="al-menu-icon">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}

                  <div className="al-menu-hr" />
                  <div className="al-menu-section">{role === "user" ? "User" : "Rider"}</div>

                  {role === "user" ? (
                    <>
                      <div className="al-menu-item" onClick={() => { setMenuOpen(false); navigate("/afterlogin/donate/request"); }}>
                        <span className="al-menu-icon">📋</span> My Requests
                      </div>
                      <div className="al-menu-item" onClick={() => { setMenuOpen(false); navigate("/afterlogin/donate"); }}>
                        <span className="al-menu-icon">🎁</span> Donate
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="al-menu-item" onClick={() => { setMenuOpen(false); navigate("/afterlogin/pickup/requests"); }}>
                        <span className="al-menu-icon">📦</span> Available Pickups
                      </div>
                      <div className="al-menu-item" onClick={() => { setMenuOpen(false); navigate("/afterlogin/pickup/my-rides"); }}>
                        <span className="al-menu-icon">🏍️</span> My Deliveries
                      </div>
                    </>
                  )}

                  <div className="al-menu-item" onClick={() => { setMenuOpen(false); navigate("/afterlogin/profile"); }}>
                    <span className="al-menu-icon">👤</span> My Profile
                  </div>

                  <div className="al-menu-hr" />

                  <div className="al-menu-item danger" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                    <span className="al-menu-icon">⎋</span> Logout
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* ═══════════ HERO (USER / RIDER) ═══════════ */}
        {!isAdmin && isHome && (
          <>
            <HomeHero />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Home />
            </div>
          </>
        )}

        {/* ═══════════ OUTLET ═══════════ */}
        {!isHome && (
          <div className="al-outlet">
            <Outlet />
          </div>
        )}

        {!isAdmin && <AI_Bot />}
      </div>
    </>
  );
}

/* ═══════════ HERO COMPONENT ═══════════ */
function HomeHero() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % images.length);
        setVisible(true);
      }, 600);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="al-hero">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`al-hero-img ${i === index && visible ? "" : "hidden"}`}
          style={{ zIndex: i === index ? 1 : 0 }}
        />
      ))}

      <div className="al-hero-overlay" style={{ zIndex: 2 }} />

      <div className="al-hero-content">
        <div className="al-hero-badge">
          <span className="al-hero-badge-dot" />
          Community Food Platform
        </div>

        <h1 className="al-hero-title">
          Don't Waste.<br /><span>Just Donate.</span>
        </h1>

        <p
          className="al-hero-quote"
          style={{ opacity: visible ? 1 : 0 }}
        >
          "{quotes[index]}"
        </p>

        <div className="al-hero-dots">
          {images.map((_, i) => (
            <div
              key={i}
              className={`al-hero-dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <div className="al-hero-scroll">
        <div className="al-hero-scroll-line" />
        SCROLL
      </div>
    </div>
  );
}