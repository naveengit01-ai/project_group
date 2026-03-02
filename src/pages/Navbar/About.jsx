import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const values = [
  {
    icon: "🌿",
    title: "Sustainability",
    desc: "Reducing waste to protect our planet for future generations.",
    color: "#34d399",
  },
  {
    icon: "🤝",
    title: "Community",
    desc: "Building a culture of shared responsibility and care.",
    color: "#818cf8",
  },
  {
    icon: "⚡",
    title: "Impact",
    desc: "Turning small actions into meaningful change.",
    color: "#fb923c",
  },
];

const steps = [
  { num: "01", icon: "📦", text: "Donors post surplus food through the platform." },
  { num: "02", icon: "🛵", text: "Riders pick up food from donor locations." },
  { num: "03", icon: "💚", text: "Food is delivered to people or organizations in need." },
];

const stats = [
  { value: "1.3B", label: "Tons wasted yearly" },
  { value: "828M", label: "Go hungry daily" },
  { value: "3",    label: "Simple steps" },
];

export default function About() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="ab-loading">
          <div className="ab-load-ring">
            <div className="ab-load-orbit" />
            <span className="ab-load-emoji">🌱</span>
          </div>
          <motion.p className="ab-load-text"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}>
            Loading your impact...
          </motion.p>
          <div className="ab-orb ab-orb1" />
          <div className="ab-orb ab-orb2" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="ab-root">
        <div className="ab-orb ab-orb1" />
        <div className="ab-orb ab-orb2" />
        <div className="ab-orb ab-orb3" />
        <div className="ab-grid" />

        <div className="ab-wrap">

          {/* ── HERO ── */}
          <motion.div className="ab-hero"
            initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}>
            <div className="ab-badge">
              <span className="ab-badge-dot" />
              Our Story
            </div>
            <h1 className="ab-title">
              About <span className="ab-title-green">DWJD</span>
            </h1>
            <p className="ab-hero-quote">"Turning surplus into sustenance."</p>
            <p className="ab-hero-sub">
              DWJD (Don't Waste, Just Donate) is a community-driven platform built to
              reduce food waste and connect surplus food with people who need it most.
              We believe hunger is not caused by lack of food — but by lack of sharing.
            </p>
          </motion.div>

          {/* ── STATS ── */}
          <motion.div className="ab-stats"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.15, duration:0.5 }}>
            {stats.map((s, i) => (
              <div key={i} className="ab-stat">
                <div className="ab-stat-val">{s.value}</div>
                <div className="ab-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── MISSION ── */}
          <motion.div className="ab-section"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.2, duration:0.5 }}>
            <div className="ab-section-tag">Mission</div>
            <h2 className="ab-section-title">Why We Exist</h2>
            <p className="ab-section-text">
              Millions of meals are wasted every day while many go hungry. Our mission
              is to bridge this gap by enabling individuals and organizations to donate
              excess food easily, responsibly, and with dignity.
            </p>
          </motion.div>

          {/* ── HOW IT WORKS ── */}
          <motion.div className="ab-section"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.25, duration:0.5 }}>
            <div className="ab-section-tag">Process</div>
            <h2 className="ab-section-title">How DWJD Works</h2>
            <div className="ab-steps">
              {steps.map((s, i) => (
                <motion.div key={i} className="ab-step"
                  initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.3 + i*0.08 }}>
                  <div className="ab-step-num">{s.num}</div>
                  <div className="ab-step-icon">{s.icon}</div>
                  <div className="ab-step-text">{s.text}</div>
                  {i < steps.length - 1 && <div className="ab-step-connector" />}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── VALUES ── */}
          <motion.div className="ab-section"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.3, duration:0.5 }}>
            <div className="ab-section-tag">Values</div>
            <h2 className="ab-section-title">What We Stand For</h2>
            <div className="ab-values">
              {values.map((v, i) => (
                <motion.div key={i} className="ab-value-card"
                  style={{ "--vcolor": v.color }}
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.35 + i*0.08 }}
                  whileHover={{ y:-6, transition:{ type:"spring", stiffness:300 } }}>
                  <div className="ab-value-icon">{v.icon}</div>
                  <div className="ab-value-title">{v.title}</div>
                  <div className="ab-value-desc">{v.desc}</div>
                  <div className="ab-value-bar" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── FOOTER ── */}
          <motion.p className="ab-footer"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ delay:0.5 }}>
            Together, we can make a difference — one meal at a time. 🌍
          </motion.p>

        </div>
      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

  .ab-root {
    min-height: 100vh;
    background: #07080f;
    color: #eeeaf4;
    font-family: 'Syne', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .ab-loading {
    min-height: 100vh;
    background: #07080f;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 16px; position: relative; overflow: hidden;
  }

  .ab-load-ring {
    width: 72px; height: 72px;
    position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  .ab-load-orbit {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #34d399;
    border-right-color: rgba(52,211,153,0.3);
    animation: abSpin 1s linear infinite;
  }
  @keyframes abSpin { to { transform: rotate(360deg); } }
  .ab-load-emoji {
    font-size: 28px;
    animation: abFloat 2s ease-in-out infinite;
  }
  @keyframes abFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .ab-load-text {
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: #34d399; letter-spacing: 0.06em;
  }

  /* ORBS */
  .ab-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
  .ab-orb1 { width: 500px; height: 500px; top: -100px; left: -150px; background: rgba(52,211,153,0.06); }
  .ab-orb2 { width: 400px; height: 400px; bottom: 0; right: -100px; background: rgba(99,102,241,0.05); }
  .ab-orb3 { width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(251,146,60,0.03); }

  .ab-grid {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px);
    background-size: 56px 56px;
    pointer-events: none; z-index: 0;
  }

  .ab-wrap {
    position: relative; z-index: 1;
    max-width: 860px;
    margin: 0 auto;
    padding: 80px 24px 100px;
    display: flex; flex-direction: column; gap: 64px;
  }

  /* HERO */
  .ab-hero { text-align: center; }

  .ab-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2);
    border-radius: 100px; padding: 6px 18px;
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: #34d399; letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 20px;
  }
  .ab-badge-dot {
    width: 6px; height: 6px; background: #34d399; border-radius: 50%;
    animation: abBlink 2s ease-in-out infinite;
  }
  @keyframes abBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .ab-title {
    font-size: clamp(40px, 7vw, 72px);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.0;
    color: #eeeaf4; margin-bottom: 16px;
  }
  .ab-title-green {
    background: linear-gradient(135deg, #34d399, #10b981);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ab-hero-quote {
    font-size: clamp(16px, 2.5vw, 22px);
    font-style: italic;
    color: #34d399;
    margin-bottom: 20px;
    font-weight: 400;
  }

  .ab-hero-sub {
    max-width: 600px; margin: 0 auto;
    font-size: 15px; font-weight: 400;
    color: rgba(238,234,244,0.5);
    line-height: 1.7;
    font-family: 'DM Mono', monospace;
  }

  /* STATS */
  .ab-stats {
    display: flex; justify-content: center;
    gap: 0;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
  }

  .ab-stat {
    flex: 1; text-align: center;
    padding: 28px 16px;
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .ab-stat:last-child { border-right: none; }

  .ab-stat-val {
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 800;
    color: #34d399;
    letter-spacing: -0.03em;
  }
  .ab-stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(238,234,244,0.35);
    margin-top: 6px;
    letter-spacing: 0.04em;
  }

  /* SECTIONS */
  .ab-section { display: flex; flex-direction: column; gap: 16px; }

  .ab-section-tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #34d399;
  }

  .ab-section-title {
    font-size: clamp(24px, 3.5vw, 36px);
    font-weight: 800; letter-spacing: -0.02em;
    color: #eeeaf4;
  }

  .ab-section-text {
    font-size: 15px; line-height: 1.75;
    color: rgba(238,234,244,0.5);
    font-family: 'DM Mono', monospace;
    font-weight: 300;
    max-width: 680px;
  }

  /* STEPS */
  .ab-steps {
    display: flex; flex-direction: column; gap: 0;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px; overflow: hidden;
  }

  .ab-step {
    display: flex; align-items: center; gap: 20px;
    padding: 22px 28px;
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    position: relative;
    transition: background 0.2s;
  }
  .ab-step:last-child { border-bottom: none; }
  .ab-step:hover { background: rgba(52,211,153,0.04); }

  .ab-step-num {
    font-family: 'DM Mono', monospace;
    font-size: 11px; color: rgba(52,211,153,0.5);
    letter-spacing: 0.1em; flex-shrink: 0; width: 24px;
  }
  .ab-step-icon { font-size: 22px; flex-shrink: 0; }
  .ab-step-text {
    font-size: 14px; color: rgba(238,234,244,0.7);
    line-height: 1.5;
  }

  /* VALUES */
  .ab-values {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .ab-value-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 28px 24px;
    position: relative; overflow: hidden;
    cursor: default;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .ab-value-card:hover {
    border-color: color-mix(in srgb, var(--vcolor) 30%, transparent);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  }

  .ab-value-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px;
    background: var(--vcolor);
    opacity: 0.4;
  }

  .ab-value-icon {
    font-size: 28px; margin-bottom: 14px;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
  }

  .ab-value-title {
    font-size: 16px; font-weight: 700;
    color: #eeeaf4; margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .ab-value-desc {
    font-family: 'DM Mono', monospace;
    font-size: 12px; font-weight: 300;
    color: rgba(238,234,244,0.4);
    line-height: 1.6;
  }

  /* FOOTER */
  .ab-footer {
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: rgba(238,234,244,0.25);
    letter-spacing: 0.04em;
  }

  @media(max-width:560px){
    .ab-stats { flex-direction: column; }
    .ab-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .ab-stat:last-child { border-bottom: none; }
    .ab-wrap { padding: 60px 16px 80px; gap: 48px; }
    .ab-values { grid-template-columns: 1fr; }
  }
`;