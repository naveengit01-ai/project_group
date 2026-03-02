import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";

const COLORS = [
  { primary: "#34d399", secondary: "#059669", glow: "rgba(52,211,153,0.35)" },
  { primary: "#818cf8", secondary: "#4f46e5", glow: "rgba(129,140,248,0.35)" },
  { primary: "#fb923c", secondary: "#ea580c", glow: "rgba(251,146,60,0.35)"  },
  { primary: "#f472b6", secondary: "#db2777", glow: "rgba(244,114,182,0.35)" },
  { primary: "#38bdf8", secondary: "#0284c7", glow: "rgba(56,189,248,0.35)"  },
  { primary: "#facc15", secondary: "#ca8a04", glow: "rgba(250,204,21,0.35)"  },
];

export default function Home() {
  const [ads, setAds]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState(0);
  const containerRef          = useRef(null);
  const isHovering            = useRef(false);
  const rafRef                = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch(`${BASE_URL}/advertisements`)
      .then(r => r.json())
      .then(d => { if (d.status === "success") setAds(d.ads || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* auto-scroll */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || ads.length === 0) return;
    const step = () => {
      if (!isHovering.current) {
        el.scrollLeft += 0.6;
        const max = el.scrollWidth - el.clientWidth;
        const pct = max > 0 ? el.scrollLeft / max : 0;
        setProgress(pct);
        if (pct >= 1) el.scrollLeft = 0;
        // update active dot
        const cardW = 320 + 24;
        setActive(Math.round(el.scrollLeft / cardW) % ads.length);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ads]);

  return (
    <>
      <style>{css}</style>
      <section className="hm-root">
        <div className="hm-orb hm-orb1"/><div className="hm-orb hm-orb2"/>

        {/* HEADER */}
        <div className="hm-header">
          <div className="hm-badge">
            <span className="hm-badge-dot"/>
            Live Promotions
          </div>
          <h2 className="hm-title">Sponsored <span className="hm-title-accent">Partners</span></h2>
          <p className="hm-sub">Companies making food donation possible</p>
        </div>

        {loading ? (
          <div className="hm-empty">
            <div className="hm-spinner"/><p>Loading promotions…</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="hm-empty"><p>No promotions right now ✨</p></div>
        ) : (
          <>
            {/* CAROUSEL */}
            <div className="hm-fade-left"/><div className="hm-fade-right"/>
            <div
              ref={containerRef}
              className="hm-carousel"
              onMouseEnter={() => isHovering.current = true}
              onMouseLeave={() => isHovering.current = false}
            >
              {[...ads, ...ads].map((ad, i) => {
                const c = COLORS[i % COLORS.length];
                return (
                  <AdCard key={`${ad._id}-${i}`} ad={ad} color={c} index={i} />
                );
              })}
            </div>

            {/* DOTS */}
            <div className="hm-dots">
              {ads.map((_, i) => (
                <div key={i} className={`hm-dot ${i === active ? "hm-dot-active" : ""}`}
                  onClick={() => {
                    const el = containerRef.current;
                    if (el) el.scrollLeft = i * (320 + 24);
                  }}
                />
              ))}
            </div>

            {/* PROGRESS BAR */}
            <div className="hm-track">
              <motion.div className="hm-fill"
                style={{ scaleX: progress, transformOrigin:"left" }}
              />
              <div className="hm-track-glow" style={{ left: `${progress * 100}%` }}/>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function AdCard({ ad, color, index }) {
  const cardRef = useRef(null);
  const rotX    = useMotionValue(0);
  const rotY    = useMotionValue(0);

  const handleMouseMove = (e) => {
    const el   = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    animate(rotY, x * 18, { duration: 0.3 });
    animate(rotX, -y * 18, { duration: 0.3 });
  };

  const handleMouseLeave = () => {
    animate(rotX, 0, { duration: 0.5, ease: "spring" });
    animate(rotY, 0, { duration: 0.5, ease: "spring" });
  };

  const rx = useTransform(rotX, v => `${v}deg`);
  const ry = useTransform(rotY, v => `${v}deg`);

  return (
    <motion.div
      ref={cardRef}
      className="hm-card"
      style={{
        rotateX: rx, rotateY: ry,
        transformStyle: "preserve-3d",
        "--c1": color.primary,
        "--c2": color.secondary,
        "--glow": color.glow,
      }}
      initial={{ opacity:0, y:30 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04, z: 40 }}
    >
      {/* GLOW BG */}
      <div className="hm-card-glow"/>

      {/* SHINE */}
      <div className="hm-card-shine"/>

      {/* TOP ACCENT LINE */}
      <div className="hm-card-line"/>

      {/* SPONSORED BADGE */}
      <div className="hm-card-badge">
        <span className="hm-badge-pulse"/>
        Sponsored
      </div>

      {/* COMPANY INITIAL AVATAR */}
      <div className="hm-card-avatar">
        <span>{ad.company_name?.[0]?.toUpperCase() || "A"}</span>
      </div>

      {/* CONTENT */}
      <div className="hm-card-body">
        <h3 className="hm-card-title">{ad.title}</h3>
        <p className="hm-card-desc">{ad.description}</p>
      </div>

      {/* FOOTER */}
      <div className="hm-card-footer">
        <span className="hm-card-company">by {ad.company_name}</span>
        <span className="hm-card-arrow">→</span>
      </div>

      {/* CORNER DECORATION */}
      <div className="hm-card-corner"/>
    </motion.div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

  .hm-root {
    position:relative;
    background:#07080f;
    padding:80px 0 100px;
    overflow:hidden;
    font-family:'Syne',sans-serif;
    color:#eeeaf4;
  }

  .hm-orb { position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none; }
  .hm-orb1 { width:600px;height:600px;top:-200px;left:-200px;background:rgba(52,211,153,0.04); }
  .hm-orb2 { width:500px;height:500px;bottom:-100px;right:-150px;background:rgba(99,102,241,0.04); }

  /* HEADER */
  .hm-header { text-align:center; padding:0 24px 56px; }

  .hm-badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);
    border-radius:100px;padding:6px 18px;
    font-family:'DM Mono',monospace;font-size:11px;
    color:#34d399;letter-spacing:0.1em;text-transform:uppercase;
    margin-bottom:20px;
  }
  .hm-badge-dot {
    width:6px;height:6px;background:#34d399;border-radius:50%;
    animation:hmBlink 2s ease-in-out infinite;
  }
  @keyframes hmBlink{0%,100%{opacity:1}50%{opacity:0.3}}

  .hm-title {
    font-size:clamp(32px,5vw,56px);font-weight:800;
    letter-spacing:-0.03em;line-height:1;
    color:#eeeaf4;margin-bottom:12px;
  }
  .hm-title-accent {
    background:linear-gradient(135deg,#34d399,#818cf8);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .hm-sub {
    font-family:'DM Mono',monospace;font-size:13px;
    color:rgba(238,234,244,0.35);letter-spacing:0.04em;
  }

  /* LOADING */
  .hm-empty {
    display:flex;flex-direction:column;align-items:center;gap:12px;
    padding:60px;color:rgba(238,234,244,0.3);
    font-family:'DM Mono',monospace;font-size:13px;
  }
  .hm-spinner {
    width:32px;height:32px;
    border:2px solid rgba(52,211,153,0.15);
    border-top-color:#34d399;
    border-radius:50%;
    animation:hmSpin 0.8s linear infinite;
  }
  @keyframes hmSpin{to{transform:rotate(360deg)}}

  /* FADE EDGES */
  .hm-fade-left,.hm-fade-right {
    position:absolute;top:0;bottom:0;width:120px;z-index:10;pointer-events:none;
  }
  .hm-fade-left  { left:0;  background:linear-gradient(to right, #07080f, transparent); }
  .hm-fade-right { right:0; background:linear-gradient(to left,  #07080f, transparent); }

  /* CAROUSEL */
  .hm-carousel {
    display:flex;gap:24px;
    padding:24px 80px 40px;
    overflow-x:scroll;
    scroll-behavior:smooth;
    cursor:grab;
    scrollbar-width:none;
    perspective:1000px;
  }
  .hm-carousel::-webkit-scrollbar { display:none; }
  .hm-carousel:active { cursor:grabbing; }

  /* CARD */
  .hm-card {
    position:relative;
    flex-shrink:0;
    width:320px;
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:24px;
    padding:0;
    overflow:hidden;
    cursor:pointer;
    display:flex;flex-direction:column;
    transition:border-color 0.3s,box-shadow 0.3s;
  }

  .hm-card:hover {
    border-color:color-mix(in srgb, var(--c1) 40%, transparent);
    box-shadow: 0 24px 64px var(--glow), 0 0 0 1px color-mix(in srgb, var(--c1) 15%, transparent) inset;
  }

  .hm-card-glow {
    position:absolute;inset:0;
    background:radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--c1) 15%, transparent), transparent 70%);
    pointer-events:none;
    opacity:0;transition:opacity 0.4s;
  }
  .hm-card:hover .hm-card-glow { opacity:1; }

  .hm-card-shine {
    position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 50%);
    pointer-events:none;
  }

  .hm-card-line {
    height:3px;width:100%;
    background:linear-gradient(90deg, var(--c1), var(--c2));
    flex-shrink:0;
  }

  .hm-card-badge {
    display:inline-flex;align-items:center;gap:6px;
    margin:16px 20px 0;
    background:color-mix(in srgb, var(--c1) 12%, transparent);
    border:1px solid color-mix(in srgb, var(--c1) 25%, transparent);
    border-radius:100px;padding:4px 12px;
    font-family:'DM Mono',monospace;font-size:9px;
    color:var(--c1);letter-spacing:0.12em;text-transform:uppercase;
    width:fit-content;
  }

  .hm-badge-pulse {
    width:5px;height:5px;background:var(--c1);border-radius:50%;
    animation:hmBlink 1.5s ease-in-out infinite;
    flex-shrink:0;
  }

  .hm-card-avatar {
    width:52px;height:52px;
    background:linear-gradient(135deg, color-mix(in srgb,var(--c1) 20%,transparent), color-mix(in srgb,var(--c2) 10%,transparent));
    border:1px solid color-mix(in srgb,var(--c1) 25%,transparent);
    border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    margin:16px 20px 0;
    font-size:22px;font-weight:800;color:var(--c1);
    font-family:'Syne',sans-serif;
  }

  .hm-card-body {
    padding:16px 20px 12px;
    flex:1;
  }

  .hm-card-title {
    font-size:17px;font-weight:700;
    color:#eeeaf4;letter-spacing:-0.01em;
    margin-bottom:10px;line-height:1.3;
  }

  .hm-card-desc {
    font-family:'DM Mono',monospace;font-size:12px;font-weight:300;
    color:rgba(238,234,244,0.45);line-height:1.65;
    display:-webkit-box;-webkit-line-clamp:3;
    -webkit-box-orient:vertical;overflow:hidden;
  }

  .hm-card-footer {
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 20px 20px;
    border-top:1px solid rgba(255,255,255,0.04);
    margin-top:auto;
  }

  .hm-card-company {
    font-family:'DM Mono',monospace;font-size:11px;
    color:var(--c1);letter-spacing:0.04em;
  }

  .hm-card-arrow {
    width:28px;height:28px;
    background:color-mix(in srgb,var(--c1) 10%,transparent);
    border:1px solid color-mix(in srgb,var(--c1) 20%,transparent);
    border-radius:8px;
    display:flex;align-items:center;justify-content:center;
    font-size:13px;color:var(--c1);
    transition:all 0.2s;
  }
  .hm-card:hover .hm-card-arrow {
    background:var(--c1);color:#07080f;
    transform:translateX(3px);
  }

  .hm-card-corner {
    position:absolute;bottom:0;right:0;
    width:80px;height:80px;
    background:radial-gradient(circle at bottom right, color-mix(in srgb,var(--c1) 8%,transparent), transparent 70%);
    pointer-events:none;
  }

  /* DOTS */
  .hm-dots {
    display:flex;justify-content:center;gap:8px;
    padding:0 24px 24px;
  }
  .hm-dot {
    width:6px;height:6px;border-radius:100px;
    background:rgba(238,234,244,0.15);
    cursor:pointer;transition:all 0.3s ease;
  }
  .hm-dot-active {
    width:24px;background:#34d399;
  }

  /* PROGRESS */
  .hm-track {
    position:relative;
    margin:0 80px;height:3px;
    background:rgba(255,255,255,0.04);
    border-radius:100px;overflow:visible;
  }

  .hm-fill {
    position:absolute;inset-y:0;left:0;right:0;
    background:linear-gradient(90deg,#34d399,#818cf8,#34d399);
    background-size:200% 100%;
    border-radius:100px;
    animation:hmShimmer 3s linear infinite;
    transform-origin:left;
  }
  @keyframes hmShimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}

  .hm-track-glow {
    position:absolute;top:50%;
    transform:translate(-50%,-50%);
    width:12px;height:12px;
    background:#34d399;border-radius:50%;
    box-shadow:0 0 12px 4px rgba(52,211,153,0.6);
    transition:left 0.1s linear;
  }

  @media(max-width:640px){
    .hm-carousel{padding:24px 24px 40px;}
    .hm-track{margin:0 24px;}
    .hm-fade-left,.hm-fade-right{width:60px;}
    .hm-card{width:280px;}
  }
`;