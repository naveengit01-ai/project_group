
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

const userNavLinks = [
  { icon: "🏠", label: "Home", path: "/afterlogin" },
  { icon: "ℹ️", label: "About", path: "/afterlogin/about" },
  { icon: "📞", label: "Contact", path: "/afterlogin/contact" },
];

export default function Afterlogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // IMPORTANT: All hooks are declared before any conditional return.
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Unable to read saved user:", error);
      return null;
    }
  });

  // Refresh user data if the same tab dispatches this event after login.
  useEffect(() => {
    const refreshUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("dwjd-profile-updated", refreshUser);
    window.addEventListener("storage", refreshUser);

    return () => {
      window.removeEventListener("dwjd-profile-updated", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Close the dropdown when the user clicks outside it.
  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // All hooks are above this return.
  if (!user) return null;

  const role = user.user_type;
  const email = user.email || "";
  const firstLetter = email.charAt(0).toUpperCase() || "U";
  const isAdmin = role === "admin";
  const isHome = location.pathname === "/afterlogin";

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
        }

        html, body {
          background: #07080f;
        }

        .al-root {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
        }

        .al-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .al-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }

        .al-nav {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          width: calc(100% - 32px);
          max-width: 1100px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(13,14,26,.88);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,.4);
          animation: navDrop .6s ease both;
        }

        @keyframes navDrop {
          from { opacity: 0; transform: translate(-50%,-20px); }
          to { opacity: 1; transform: translate(-50%,0); }
        }

        .al-logo {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -.03em;
          cursor: pointer;
          color: #eeeaf4;
          white-space: nowrap;
        }

        .al-logo span {
          color: #34d399;
        }

        .al-nav-links, .al-nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .al-nav-btn {
          padding: 8px 16px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: rgba(238,234,244,.65);
          font: 600 13px 'Syne', sans-serif;
          cursor: pointer;
          transition: .2s;
        }

        .al-nav-btn:hover {
          background: rgba(255,255,255,.06);
          color: white;
        }

        .al-nav-right {
          position: relative;
        }

        .al-avatar {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(52,211,153,.4);
          border-radius: 50%;
          background: rgba(52,211,153,.15);
          color: #34d399;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s;
        }

        .al-avatar.rider {
          border-color: rgba(99,102,241,.4);
          background: rgba(99,102,241,.15);
          color: #818cf8;
        }

        .al-avatar:hover {
          transform: scale(1.08);
        }

        .al-menu-btn {
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 10px;
          background: rgba(255,255,255,.04);
          color: #eeeaf4;
          cursor: pointer;
        }

        .al-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 230px;
          padding: 8px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          background: #0d0e1a;
          box-shadow: 0 24px 48px rgba(0,0,0,.5);
          animation: dropIn .2s ease both;
          z-index: 200;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .al-menu-section {
          padding: 8px 12px 5px;
          color: rgba(238,234,244,.35);
          font: 10px 'DM Mono', monospace;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .al-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          color: rgba(238,234,244,.75);
          font-size: 13px;
          cursor: pointer;
          transition: .15s;
        }

        .al-menu-item:hover {
          background: rgba(255,255,255,.06);
          color: white;
        }

        .al-menu-item.danger {
          color: #f87171;
        }

        .al-menu-hr {
          height: 1px;
          margin: 7px 4px;
          background: rgba(255,255,255,.07);
        }

        .al-admin-root {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 110px 24px 40px;
        }

        .al-admin-card {
          position: relative;
          width: 100%;
          max-width: 520px;
          padding: 40px 36px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 28px;
          background: rgba(255,255,255,.03);
          box-shadow: 0 40px 80px rgba(0,0,0,.5);
          animation: cardIn .5s ease both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .al-admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding: 6px 16px;
          border: 1px solid rgba(52,211,153,.2);
          border-radius: 100px;
          background: rgba(52,211,153,.08);
          color: #34d399;
          font: 11px 'DM Mono', monospace;
          text-transform: uppercase;
        }

        .al-admin-badge-dot, .al-hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          50% { opacity: .3; }
        }

        .al-admin-title {
          margin-bottom: 8px;
          font-size: 28px;
          font-weight: 800;
        }

        .al-admin-title span, .al-hero-title span {
          color: #34d399;
        }

        .al-admin-sub {
          margin-bottom: 28px;
          color: rgba(238,234,244,.4);
          font: 11px 'DM Mono', monospace;
        }

        .al-admin-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .al-admin-tile {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 18px 16px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
          background: rgba(255,255,255,.03);
          cursor: pointer;
          transition: .25s;
        }

        .al-admin-tile:hover {
          transform: translateY(-3px);
          border-color: var(--tile-color);
          box-shadow: 0 12px 32px rgba(0,0,0,.3);
        }

        .al-tile-icon { font-size: 22px; }
        .al-tile-label { font-size: 13px; font-weight: 700; }
        .al-tile-desc { color: rgba(238,234,244,.4); font: 10px 'DM Mono', monospace; }

        .al-logout-btn {
          display: block;
          margin: 22px auto 0;
          border: 0;
          background: transparent;
          color: #f87171;
          font: 11px 'DM Mono', monospace;
          cursor: pointer;
        }

        .al-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .al-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 1s ease;
        }

        .al-hero-img.hidden { opacity: 0; }

        .al-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(7,8,15,.2),
            rgba(7,8,15,.55) 50%,
            rgba(7,8,15,.9)
          );
        }

        .al-hero-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
          text-align: center;
        }

        .al-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding: 7px 18px;
          border: 1px solid rgba(52,211,153,.25);
          border-radius: 100px;
          background: rgba(52,211,153,.1);
          color: #34d399;
          font: 11px 'DM Mono', monospace;
          text-transform: uppercase;
          animation: fadeUp .8s ease both;
        }

        .al-hero-title {
          margin-bottom: 20px;
          font-size: clamp(40px,7vw,80px);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -.04em;
          animation: fadeUp .8s .1s ease both;
        }

        .al-hero-quote {
          max-width: 600px;
          min-height: 48px;
          margin-bottom: 36px;
          color: rgba(238,234,244,.65);
          font: clamp(13px,2vw,16px) 'DM Mono', monospace;
          line-height: 1.7;
          transition: opacity .5s;
        }

        .al-hero-dots {
          display: flex;
          gap: 6px;
        }

        .al-hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(52,211,153,.3);
          cursor: pointer;
          transition: .3s;
        }

        .al-hero-dot.active {
          width: 20px;
          border-radius: 3px;
          background: #34d399;
        }

        .al-hero-scroll {
          position: absolute;
          bottom: 32px;
          left: 50%;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transform: translateX(-50%);
          color: rgba(238,234,244,.4);
          font: 10px 'DM Mono', monospace;
          letter-spacing: .1em;
        }

        .al-hero-scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, #34d399, transparent);
          animation: scrollLine 2s ease-in-out infinite;
        }

        @keyframes scrollLine {
          50% { transform: scaleY(.6); opacity: .4; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .al-outlet {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          padding-top: 100px;
        }

        @media (max-width: 768px) {
          .al-nav-links { display: none; }
        }

        @media (max-width: 480px) {
          .al-admin-grid { grid-template-columns: 1fr; }
          .al-admin-card { padding: 30px 20px; }
          .al-admin-root { padding: 100px 16px 30px; }
          .al-nav { padding: 10px 14px; }
          .al-hero-title { font-size: clamp(38px,12vw,58px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .al-root *, .al-root *::before, .al-root *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="al-root">
        <div className="al-grid-bg" />

        {/* ADMIN DASHBOARD */}
        {isAdmin && isHome && (
          <div className="al-admin-root">
            <div className="al-admin-card">
              <div className="al-admin-badge">
                <span className="al-admin-badge-dot" />
                Admin Panel
              </div>

              <div className="al-admin-title">
                Control <span>Center</span>
              </div>

              <div className="al-admin-sub">
                Manage the platform — all tools in one place
              </div>

              <div className="al-admin-grid">
                {[
                  {
                    icon: "📊",
                    label: "Overall Statistics",
                    desc: "Platform metrics & insights",
                    path: "/afterlogin/overall",
                    color: "rgba(52,211,153,.3)",
                  },
                  {
                    icon: "🎯",
                    label: "Promotions",
                    desc: "Manage campaigns",
                    path: "/afterlogin/promotions",
                    color: "rgba(99,210,255,.3)",
                  },
                  {
                    icon: "💼",
                    label: "Add Job",
                    desc: "Post opportunities",
                    path: "/afterlogin/add-job",
                    color: "rgba(251,191,36,.3)",
                  },
                  {
                    icon: "📺",
                    label: "YouTube Content",
                    desc: "Manage video library",
                    path: "/afterlogin/youtube-content",
                    color: "rgba(248,113,113,.3)",
                  },
                  {
                    icon: "🔔",
                    label: "Notifications",
                    desc: "Send alerts & updates",
                    path: "/afterlogin/notifications",
                    color: "rgba(244,114,182,.3)",
                  },
                  {
                    icon: "📝",
                    label: "To-Do List",
                    desc: "Track your tasks",
                    path: "/afterlogin/todo",
                    color: "rgba(167,139,250,.3)",
                  },
                ].map((tile, index) => (
                  <div
                    key={tile.path}
                    className="al-admin-tile"
                    style={{
                      "--tile-color": tile.color,
                      animation: `cardIn .5s ${index * 0.07}s ease both`,
                    }}
                    onClick={() => navigate(tile.path)}
                  >
                    <div className="al-tile-icon">{tile.icon}</div>
                    <div className="al-tile-label">{tile.label}</div>
                    <div className="al-tile-desc">{tile.desc}</div>
                  </div>
                ))}
              </div>

              <button className="al-logout-btn" onClick={logout}>
                ⎋ &nbsp;Logout
              </button>
            </div>
          </div>
        )}

        {/* USER / RIDER NAVBAR */}
        {!isAdmin && (
          <nav className="al-nav">
            <div className="al-logo" onClick={() => navigate("/afterlogin")}>
              DW<span>JD</span>
            </div>

            <div className="al-nav-links">
              {userNavLinks.map((link) => (
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
                onClick={() => setMenuOpen((previous) => !previous)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setMenuOpen((previous) => !previous);
                  }
                }}
              >
                {firstLetter}
              </div>

              <button
                className="al-menu-btn"
                aria-label="Toggle navigation menu"
                onClick={() => setMenuOpen((previous) => !previous)}
              >
                {menuOpen ? "✕" : "☰"}
              </button>

              {menuOpen && (
                <div className="al-dropdown">
                  <div className="al-menu-section">Navigation</div>

                  {userNavLinks.map((item) => (
                    <div
                      key={item.path}
                      className="al-menu-item"
                      onClick={() => goTo(item.path)}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}

                  <div className="al-menu-hr" />

                  <div className="al-menu-section">
                    {role === "user" ? "My Account" : "Rider"}
                  </div>

                  {role === "user" ? (
                    <>
                      <div
                        className="al-menu-item"
                        onClick={() => goTo("/afterlogin/donate/request")}
                      >
                        <span>📋</span> My Requests
                      </div>

                      <div
                        className="al-menu-item"
                        onClick={() => goTo("/afterlogin/donate")}
                      >
                        <span>🎁</span> Donate
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="al-menu-item"
                        onClick={() => goTo("/afterlogin/pickup/requests")}
                      >
                        <span>📦</span> Available Pickups
                      </div>

                      <div
                        className="al-menu-item"
                        onClick={() => goTo("/afterlogin/pickup/my-rides")}
                      >
                        <span>🏍️</span> My Deliveries
                      </div>
                    </>
                  )}

                  <div
                    className="al-menu-item"
                    onClick={() => goTo("/afterlogin/profile")}
                  >
                    <span>👤</span> My Profile
                  </div>

                  <div className="al-menu-hr" />

                  <div className="al-menu-item danger" onClick={logout}>
                    <span>⎋</span> Logout
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* USER / RIDER HOME PAGE */}
        {!isAdmin && isHome && (
          <>
            <HomeHero />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Home />
            </div>
          </>
        )}

        {/* NESTED ROUTES */}
        {!isHome && (
          <div className="al-outlet">
            <Outlet />
          </div>
        )}

        {/* CHATBOT */}
        {!isAdmin && <AI_Bot />}
      </div>
    </>
  );
}

function HomeHero() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      const timeout = setTimeout(() => {
        setIndex((current) => (current + 1) % images.length);
        setVisible(true);
      }, 600);

      // The timeout completes before the next interval.
      return () => clearTimeout(timeout);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const selectImage = (nextIndex) => {
    setVisible(false);
    setTimeout(() => {
      setIndex(nextIndex);
      setVisible(true);
    }, 250);
  };

  return (
    <div className="al-hero">
      {images.map((src, imageIndex) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`al-hero-img ${
            imageIndex === index && visible ? "" : "hidden"
          }`}
          style={{ zIndex: imageIndex === index ? 1 : 0 }}
        />
      ))}

      <div className="al-hero-overlay" style={{ zIndex: 2 }} />

      <div className="al-hero-content">
        <div className="al-hero-badge">
          <span className="al-hero-badge-dot" />
          Community Food Platform
        </div>

        <h1 className="al-hero-title">
          Don't Waste.
          <br />
          <span>Just Donate.</span>
        </h1>

        <p className="al-hero-quote" style={{ opacity: visible ? 1 : 0 }}>
          "{quotes[index]}"
        </p>

        <div className="al-hero-dots">
          {images.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              aria-label={`Show image ${dotIndex + 1}`}
              className={`al-hero-dot ${
                dotIndex === index ? "active" : ""
              }`}
              onClick={() => selectImage(dotIndex)}
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
