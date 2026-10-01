import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Navbar/Home";
import AI_Bot from "./pages/Ai_Bot";
import bgMusic from "./assets/music.mp3";

const images = [
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1600&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600&q=80",
  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=1600&q=80",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1600&q=80"
];

const quotes = [
  "Some people waste food without knowing its value.",
  "Some people wait all day for a single meal.",
  "This gap should not exist.",
  "DWJD exists to reduce that gap."
];

const captions = {
  en: [
    "Every day, usable food is thrown away.",
    "At the same time, people go hungry.",
    "This is not a food problem.",
    "It is a distribution problem."
  ],
  te: [
    "ప్రతి రోజు తినదగిన ఆహారం వృథా అవుతుంది.",
    "అదే సమయంలో చాలా మంది ఆకలితో ఉంటారు.",
    "ఇది ఆహార సమస్య కాదు.",
    "ఇది పంపిణీ సమస్య."
  ]
};

const stats = [
  { value: "1.3B", label: "Tons wasted yearly" },
  { value: "828M", label: "Face hunger daily" },
  { value: "100%", label: "Free to use" }
];

const foodEmojis = ["🍱","🥗","🍛","🥘","🍲","🫕","🥙","🍜","🥡","🫙","🍚","🥞"];

export default function OpeningPage() {
  const navigate  = useNavigate();
  const audioRef  = useRef(null);

  const touchStartY = useRef(0);
  const currentDY   = useRef(0);
  const isActive    = useRef(false);

  const [index,        setIndex]        = useState(0);
  const [quoteIndex,   setQuoteIndex]   = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [language]                      = useState("en");

  const [pageOffset, setPageOffset] = useState(0);
  const [phase,      setPhase]      = useState("idle");
  const [emoji,      setEmoji]      = useState("🍱");
  const [ripple,     setRipple]     = useState(false);

  /* SLIDESHOW */
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex(i => (i + 1) % quotes.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCaptionIndex(i => (i + 1) % captions.en.length), 3500);
    return () => clearInterval(t);
  }, []);

  /* AUDIO — plays every 60 seconds at 50% volume */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    audio.loop   = false;

    const play = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    // Play once on load, then repeat every 60s
    play();
    const interval = setInterval(play, 60000);

    return () => {
      clearInterval(interval);
      audio.pause();
    };
  }, []);

  /* PULL DOWN */
  useEffect(() => {
    const TRIGGER = 72;

    const onStart = (clientY) => {
      if (window.scrollY !== 0) return;
      touchStartY.current = clientY;
      currentDY.current   = 0;
      isActive.current    = true;
      setEmoji(foodEmojis[Math.floor(Math.random() * foodEmojis.length)]);
    };

    const onMove = (clientY) => {
      if (!isActive.current) return;
      if (window.scrollY !== 0) { isActive.current = false; setPageOffset(0); setPhase("idle"); return; }
      const raw = clientY - touchStartY.current;
      if (raw <= 0) { setPageOffset(0); setPhase("idle"); return; }
      currentDY.current = raw;
      const offset = Math.min(Math.log1p(raw) * 18, 110);
      setPageOffset(offset);
      setPhase("pulling");
    };

    const onEnd = () => {
      if (!isActive.current) return;
      isActive.current = false;
      if (currentDY.current > TRIGGER) {
        setPhase("snap");
        setRipple(false);
        setTimeout(() => {
          setPageOffset(0);
          setPhase("done");
          setRipple(true);
          setTimeout(() => { setPhase("idle"); setRipple(false); }, 1200);
        }, 80);
      } else {
        setPhase("snap");
        setTimeout(() => { setPageOffset(0); setPhase("idle"); }, 450);
      }
    };

    let mouseDown = false;
    const onTouchStart = (e) => onStart(e.touches[0].clientY);
    const onTouchMove  = (e) => onMove(e.touches[0].clientY);
    const onTouchEnd   = ()  => onEnd();
    const onMouseDown  = (e) => { mouseDown = true; onStart(e.clientY); };
    const onMouseMove  = (e) => { if (mouseDown) onMove(e.clientY); };
    const onMouseUp    = ()  => { if (mouseDown) { mouseDown = false; onEnd(); } };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove",  onTouchMove,  { passive: true });
    window.addEventListener("touchend",   onTouchEnd);
    window.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseup",    onMouseUp);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseup",    onMouseUp);
    };
  }, []);

  const progress   = Math.min(pageOffset / 72, 1);
  const isSnapping = phase === "snap" || phase === "done";
  const isDone     = phase === "done";

  const pageStyle = {
    transform:  `translateY(${pageOffset}px)`,
    transition: isSnapping ? "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)" : "none",
    willChange: "transform",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{overflow-x:hidden;background:#050a05}
        .op-root{font-family:'DM Sans',sans-serif;background:#050a05;color:#f0ede8;min-height:100vh;overflow-x:hidden;}
        .pull-strip{position:fixed;top:0;left:0;right:0;height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#050a05;z-index:1;pointer-events:none;}
        .pull-emoji{font-size:42px;line-height:1;transform-origin:center;filter:drop-shadow(0 4px 16px rgba(74,222,128,0.5));}
        .pull-hint{font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(74,222,128,0.85);}
        .pull-track{width:52px;height:3px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;}
        .pull-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#4ade80,#22c55e);box-shadow:0 0 8px rgba(74,222,128,0.7);transition:width 0.04s linear;}
        .burst-ring{position:fixed;top:55px;left:50%;transform:translateX(-50%);width:60px;height:60px;border-radius:50%;border:2px solid rgba(74,222,128,0.7);pointer-events:none;z-index:9999;animation:burstRing 0.6s ease-out forwards;}
        @keyframes burstRing{0%{width:40px;height:40px;opacity:1;margin-left:-20px;margin-top:-20px}100%{width:240px;height:240px;opacity:0;margin-left:-120px;margin-top:-120px}}
        .full-ripple{position:fixed;inset:0;background:rgba(74,222,128,0.07);pointer-events:none;z-index:9998;animation:fullRipple 0.7s ease-out forwards;}
        @keyframes fullRipple{0%{opacity:1}100%{opacity:0}}
        .op-page{position:relative;z-index:2;}
        .op-hero{position:relative;min-height:100vh;display:flex;flex-direction:column;overflow:hidden;}
        .op-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
        .op-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(5,10,5,0.55) 0%,rgba(5,10,5,0.45) 40%,rgba(5,10,5,0.85) 80%,rgba(5,10,5,1) 100%);}
        .op-noise{position:absolute;inset:0;opacity:0.03;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
        .op-content{position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px 24px 60px;min-height:100vh;}
        .op-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.25);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#4ade80;margin-bottom:28px;animation:fadeUp 0.8s ease both;}
        .op-eyebrow-dot{width:6px;height:6px;background:#4ade80;border-radius:50%;animation:blink 2s ease-in-out infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .op-title{font-family:'Playfair Display',serif;font-size:clamp(42px,8vw,96px);font-weight:900;line-height:1.0;letter-spacing:-0.02em;margin-bottom:12px;animation:fadeUp 0.8s 0.1s ease both;}
        .op-title-accent{color:#4ade80;display:block;}
        .op-subtitle{max-width:520px;color:rgba(240,237,232,0.6);font-size:clamp(15px,2vw,18px);font-weight:300;line-height:1.6;margin-bottom:24px;animation:fadeUp 0.8s 0.2s ease both;}
        .op-caption{font-size:clamp(14px,1.8vw,17px);color:#86efac;font-style:italic;font-weight:300;min-height:28px;margin-bottom:8px;}
        .op-quote{font-size:13px;color:rgba(240,237,232,0.38);font-style:italic;min-height:22px;margin-bottom:40px;}
        .op-stats{display:flex;gap:32px;flex-wrap:wrap;justify-content:center;margin-bottom:48px;animation:fadeUp 0.8s 0.35s ease both;}
        .op-stat{text-align:center;}
        .op-stat-val{font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,38px);font-weight:700;color:#4ade80;line-height:1;}
        .op-stat-label{font-size:11px;color:rgba(240,237,232,0.45);letter-spacing:0.04em;margin-top:4px;max-width:100px;}
        .op-stat-div{width:1px;height:40px;background:rgba(240,237,232,0.1);align-self:center;}
        .op-buttons{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;animation:fadeUp 0.8s 0.45s ease both;}
        .op-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);border:none;outline:none;white-space:nowrap;}
        .op-btn:hover{transform:translateY(-3px);}
        .op-btn:active{transform:scale(0.97);}
        .op-btn-outline{background:rgba(240,237,232,0.07);border:1px solid rgba(240,237,232,0.25);color:#f0ede8;}
        .op-btn-outline:hover{background:rgba(240,237,232,0.14);box-shadow:0 8px 24px rgba(0,0,0,0.3);}
        .op-btn-primary{background:#4ade80;color:#050a05;font-weight:600;box-shadow:0 8px 24px rgba(74,222,128,0.35);}
        .op-btn-primary:hover{background:#22c55e;box-shadow:0 12px 32px rgba(74,222,128,0.5);}
        .op-scroll{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);z-index:10;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0.4;}
        .op-scroll-line{width:1px;height:48px;background:linear-gradient(to bottom,rgba(240,237,232,0.8),transparent);animation:scrollLine 2s ease-in-out infinite;}
        @keyframes scrollLine{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
        .op-scroll-text{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(240,237,232,0.6);}
        .op-dots{position:absolute;bottom:100px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:6px;}
        .op-dot{width:6px;height:6px;border-radius:100px;background:rgba(240,237,232,0.3);transition:all 0.4s ease;}
        .op-dot.active{width:24px;background:#4ade80;}
        .op-divider{width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:640px){.op-stat-div{display:none}.op-stats{gap:20px}}
      `}</style>

      <div className="op-root">
        <audio ref={audioRef} src={bgMusic} />

        {/* PULL STRIP */}
        <div className="pull-strip">
          <span
            className="pull-emoji"
            style={{
              transform: isDone
                ? "scale(1.4)"
                : `scale(${0.4 + progress * 0.8}) rotate(${(progress - 0.5) * 25}deg)`,
              transition: isDone ? "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              opacity: Math.max(progress * 1.4, isDone ? 1 : 0),
            }}
          >
            {emoji}
          </span>
          <span className="pull-hint" style={{ opacity: progress * 1.5 }}>
            {isDone ? "💚 Thank you!" : progress >= 1 ? "↑ Release!" : "↓ Pull to refresh"}
          </span>
          <div className="pull-track" style={{ opacity: progress * 1.5 }}>
            <div className="pull-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {ripple && <div className="burst-ring" key="ring" />}
        {ripple && <div className="full-ripple" key="ripple" />}

        {/* PAGE */}
        <div className="op-page" style={pageStyle}>
          <div className="op-hero">
            <AnimatePresence>
              <motion.img
                key={index}
                src={images[index]}
                className="op-bg"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
              />
            </AnimatePresence>
            <div className="op-overlay" />
            <div className="op-noise" />

            <div className="op-content">
              <div className="op-eyebrow">
                <span className="op-eyebrow-dot" />
                Fighting Food Waste Since Day One
              </div>

              <h1 className="op-title">
                Don't Waste.
                <span className="op-title-accent">Just Donate.</span>
              </h1>

              <p className="op-subtitle">
                DWJD connects surplus food and essentials with people who truly need them —
                securely, transparently, and with love.
              </p>

              <AnimatePresence mode="wait">
                <motion.p
                  key={captionIndex + language}
                  className="op-caption"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                >
                  {captions[language][captionIndex]}
                </motion.p>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  className="op-quote"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  " {quotes[quoteIndex]} "
                </motion.p>
              </AnimatePresence>

              <div className="op-stats">
                {stats.map((s, i) => (
                  <div key={i} style={{ display: "contents" }}>
                    {i > 0 && <div className="op-stat-div" />}
                    <div className="op-stat">
                      <div className="op-stat-val">{s.value}</div>
                      <div className="op-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Only Login + Get Started */}
              <div className="op-buttons">
                <motion.button
                  className="op-btn op-btn-outline"
                  onClick={() => navigate("/login")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>→</span> Login
                </motion.button>

                <motion.button
                  className="op-btn op-btn-primary"
                  onClick={() => navigate("/signup")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.58 }}
                >
                  <span>✦</span> Get Started
                </motion.button>
              </div>
            </div>

            <div className="op-dots">
              {images.map((_, i) => (
                <div key={i} className={`op-dot${i === index ? " active" : ""}`} />
              ))}
            </div>

            <div className="op-scroll">
              <div className="op-scroll-line" />
              <span className="op-scroll-text">Scroll</span>
            </div>
          </div>

          <div className="op-divider" />

          <section style={{ background: "#050a05" }}>
            <Home />
          </section>
        </div>

        {/* AI BOT */}
        <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 50 }}>
          <AI_Bot />
        </div>
      </div>
    </>
  );
}