import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

const roleColors = {
  admin:  { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24" },
  rider:  { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.3)",  text: "#818cf8" },
  user:   { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)",  text: "#34d399" },
};

const avatarColors = ["#34d399","#818cf8","#f472b6","#fb923c","#38bdf8"];

function getInitials(first, last) {
  return `${first?.[0]||""}${last?.[0]||""}`.toUpperCase();
}

function getAvatarColor(email) {
  if (!email) return avatarColors[0];
  const idx = email.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

export default function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email;

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${BASE_URL}/get-user-by-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.status === "success") setUser(data.user);
      } catch {}
    }
    if (email) fetchUser();
  }, [email]);

  if (!user) {
    return (
      <>
        <style>{baseCSS}</style>
        <div className="mp-loading">
          <div className="mp-loading-inner">
            <div className="mp-load-ring">
              <div className="mp-load-orbit" />
              <span className="mp-load-emoji">🌱</span>
            </div>
            <motion.p
              className="mp-load-text"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              Loading your impact...
            </motion.p>
          </div>
          <div className="mp-bg-orb mp-orb1" />
          <div className="mp-bg-orb mp-orb2" />
        </div>
      </>
    );
  }

  const role     = user.user_type || "user";
  const roleStyle = roleColors[role] || roleColors.user;
  const avatarColor = getAvatarColor(user.email);
  const initials = getInitials(user.first_name, user.last_name);

  const fields = [
    { icon: "👤", label: "First Name",  value: user.first_name },
    { icon: "👤", label: "Last Name",   value: user.last_name  },
    { icon: "✉️", label: "Email",       value: user.email      },
    { icon: "📱", label: "Phone",       value: user.phone      },
  ];

  return (
    <>
      <style>{baseCSS}</style>
      <div className="mp-root">
        <div className="mp-bg-orb mp-orb1" />
        <div className="mp-bg-orb mp-orb2" />
        <div className="mp-grid" />

        <div className="mp-wrap">
          <motion.div
            className="mp-card"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          >
            {/* TOP STRIP */}
            <div className="mp-strip" style={{ background: `linear-gradient(135deg, ${avatarColor}18, transparent)` }} />

            {/* AVATAR */}
            <div className="mp-avatar-wrap">
              <div className="mp-avatar" style={{ background: `linear-gradient(135deg, ${avatarColor}33, ${avatarColor}11)`, border: `2px solid ${avatarColor}44` }}>
                <span className="mp-avatar-initials" style={{ color: avatarColor }}>{initials}</span>
              </div>
              <div className="mp-avatar-glow" style={{ background: avatarColor }} />
            </div>

            {/* NAME + ROLE */}
            <div className="mp-identity">
              <h1 className="mp-name">{user.first_name} {user.last_name}</h1>
              <span className="mp-role-badge" style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}`, color: roleStyle.text }}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>

            <p className="mp-tagline">Don't Waste. Just Donate. 💚</p>

            {/* DIVIDER */}
            <div className="mp-divider" />

            {/* FIELDS */}
            <div className="mp-fields">
              {fields.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="mp-field"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  <span className="mp-field-icon">{f.icon}</span>
                  <div className="mp-field-content">
                    <span className="mp-field-label">{f.label}</span>
                    <span className="mp-field-value">{f.value || "—"}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* DIVIDER */}
            <div className="mp-divider" />

            {/* EDIT BTN */}
            <motion.button
              className="mp-edit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/afterlogin/profile/edit")}
            >
              <span>Edit Profile</span>
              <span className="mp-btn-arrow">✏️</span>
            </motion.button>

            {/* FOOTER */}
            <p className="mp-footer">Every profile here represents a real-world impact 🌍</p>
          </motion.div>
        </div>
      </div>
    </>
  );
}

const baseCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

  .mp-root {
    min-height: 100vh;
    background: #07080f;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 16px;
    position: relative; overflow: hidden;
    font-family: 'Syne', sans-serif;
  }

  .mp-loading {
    min-height: 100vh;
    background: #07080f;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    font-family: 'Syne', sans-serif;
  }

  .mp-loading-inner {
    display: flex; flex-direction: column; align-items: center; gap: 20px;
    position: relative; z-index: 1;
  }

  .mp-load-ring {
    width: 72px; height: 72px;
    position: relative;
    display: flex; align-items: center; justify-content: center;
  }

  .mp-load-orbit {
    position: absolute; inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #34d399;
    border-right-color: rgba(52,211,153,0.3);
    animation: mpSpin 1s linear infinite;
  }

  @keyframes mpSpin { to { transform: rotate(360deg); } }

  .mp-load-emoji {
    font-size: 28px;
    animation: mpFloat 2s ease-in-out infinite;
  }

  @keyframes mpFloat {
    0%,100%{ transform: translateY(0); }
    50%{ transform: translateY(-5px); }
  }

  .mp-load-text {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #34d399;
    letter-spacing: 0.06em;
  }

  /* BG */
  .mp-bg-orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
  }
  .mp-orb1 {
    width: 500px; height: 500px;
    top: -150px; left: -150px;
    background: rgba(52,211,153,0.06);
  }
  .mp-orb2 {
    width: 400px; height: 400px;
    bottom: -100px; right: -100px;
    background: rgba(99,102,241,0.05);
  }

  .mp-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(52,211,153,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52,211,153,0.02) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  .mp-wrap {
    position: relative; z-index: 1;
    width: 100%; max-width: 460px;
  }

  /* CARD */
  .mp-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 32px 64px rgba(0,0,0,0.5);
    padding: 0 0 28px;
  }

  .mp-strip {
    height: 72px;
    width: 100%;
  }

  .mp-avatar-wrap {
    position: relative;
    display: flex; justify-content: center;
    margin-top: -40px;
    margin-bottom: 16px;
  }

  .mp-avatar {
    width: 80px; height: 80px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1;
    backdrop-filter: blur(10px);
  }

  .mp-avatar-initials {
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.02em;
  }

  .mp-avatar-glow {
    position: absolute;
    width: 80px; height: 80px;
    border-radius: 50%;
    opacity: 0.15;
    filter: blur(20px);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }

  .mp-identity {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 0 24px;
  }

  .mp-name {
    font-size: 22px; font-weight: 800;
    color: #eeeaf4;
    letter-spacing: -0.02em;
    text-align: center;
  }

  .mp-role-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
  }

  .mp-tagline {
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(238,234,244,0.35);
    margin: 10px 0 0;
    padding: 0 24px;
  }

  .mp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    margin: 20px 0;
  }

  /* FIELDS */
  .mp-fields {
    display: flex; flex-direction: column; gap: 4px;
    padding: 0 24px;
  }

  .mp-field {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,0.02);
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .mp-field:hover {
    background: rgba(52,211,153,0.04);
    border-color: rgba(52,211,153,0.1);
  }

  .mp-field-icon { font-size: 15px; flex-shrink: 0; }

  .mp-field-content {
    display: flex; flex-direction: column; gap: 2px;
    flex: 1; min-width: 0;
  }

  .mp-field-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(238,234,244,0.35);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mp-field-value {
    font-size: 14px; font-weight: 600;
    color: #eeeaf4;
    letter-spacing: -0.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* EDIT BTN */
  .mp-edit-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: calc(100% - 48px);
    margin: 0 24px;
    padding: 14px;
    background: linear-gradient(135deg, #34d399, #10b981);
    border: none; border-radius: 14px;
    color: #07080f;
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(52,211,153,0.3);
    position: relative; overflow: hidden;
  }

  .mp-edit-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    pointer-events: none;
  }

  .mp-btn-arrow { font-size: 16px; }

  .mp-footer {
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(238,234,244,0.2);
    padding: 16px 24px 0;
    letter-spacing: 0.04em;
  }

  @media(max-width:480px){
    .mp-name { font-size: 20px; }
    .mp-card { border-radius: 20px; }
  }
`;