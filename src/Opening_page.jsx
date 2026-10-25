import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Navbar/Home";
import AI_Bot from "./pages/Ai_Bot";

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

const foodEmojis = [
  "🍱", "🥗", "🍛", "🥘", "🍲", "🫕",
  "🥙", "🍜", "🥡", "🫙", "🍚", "🥞"
];

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://back-end-project-group.onrender.com"
).replace(/\/$/, "");

function getDriveFileId(value = "") {
  const url = String(value || "");

  return (
    url.match(/\/file\/d\/([\w-]+)/)?.[1] ||
    url.match(/[?&]id=([\w-]+)/)?.[1] ||
    url.match(/drive\.google\.com\/open\?id=([\w-]+)/)?.[1] ||
    null
  );
}

function getPromotionImageUrl(value = "") {
  const id = getDriveFileId(value);

  return id
    ? `https://drive.google.com/uc?export=view&id=${id}`
    : value;
}

function getPromotionVideoEmbedUrl(value = "") {
  const id = getDriveFileId(value);

  return id
    ? `https://drive.google.com/file/d/${id}/preview?autoplay=1&mute=1`
    : value;
}

/*
 * Direct video URLs:
 * - Autoplay muted
 * - Loop continuously
 * - Custom mute/unmute icon only
 * - Volume set to 65% when unmuted
 * - No native video controls
 *
 * Google Drive preview URLs are rendered separately as iframes below.
 * Their internal controls cannot reliably be controlled by this component.
 */
function PromotionVideo({ videoUrl, imageUrl }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    video.volume = 0.65;

    if (video.paused) {
      video.play().catch(() => {
        // The browser may restrict autoplay.
      });
    }
  }, [muted, videoUrl]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !muted;

    video.volume = 0.65;
    video.muted = nextMuted;
    setMuted(nextMuted);

    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  return (
    <div className="promo-video-wrap">
  <video
    ref={videoRef}
    autoPlay
    muted={muted}
    loop
    playsInline
    preload="metadata"
    poster={imageUrl || undefined}
  >
    <source src={videoUrl} />
  </video>

  <button
    type="button"
    className="promo-mute-button"
    onClick={() => {
      const video = videoRef.current;
      if (!video) return;

      video.volume = 0.65;
      video.muted = !video.muted;
      setMuted(video.muted);
    }}
    aria-label={muted ? "Unmute video" : "Mute video"}
  >
    {muted ? "🔇" : "🔊"}
  </button>
</div>
  );
}

export default function OpeningPage() {
  const navigate = useNavigate();

  const touchStartY = useRef(0);
  const currentDY = useRef(0);
  const isActive = useRef(false);

  const [index, setIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [language] = useState("en");

  const [pageOffset, setPageOffset] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [emoji, setEmoji] = useState("🍱");
  const [ripple, setRipple] = useState(false);

  const [promotions, setPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [promotionsError, setPromotionsError] = useState("");

  // Fetch public active promotions.
  useEffect(() => {
    let cancelled = false;

    const loadPromotions = async () => {
      try {
        setPromotionsLoading(true);
        setPromotionsError("");

        const response = await fetch(
          `${API_BASE_URL}/advertisements/active`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load promotions."
          );
        }

        if (!cancelled) {
          setPromotions(
            Array.isArray(data.advertisements)
              ? data.advertisements
              : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          setPromotionsError(
            error.message || "Could not load promotions."
          );
        }
      } finally {
        if (!cancelled) {
          setPromotionsLoading(false);
        }
      }
    };

    loadPromotions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Hero background slideshow.
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Rotating quotes.
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((current) => (current + 1) % quotes.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Rotating captions.
  useEffect(() => {
    const timer = setInterval(() => {
      setCaptionIndex(
        (current) => (current + 1) % captions.en.length
      );
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  // Pull-down interaction.
  useEffect(() => {
    const TRIGGER = 72;

    const onStart = (clientY) => {
      if (window.scrollY !== 0) return;

      touchStartY.current = clientY;
      currentDY.current = 0;
      isActive.current = true;

      setEmoji(
        foodEmojis[
          Math.floor(Math.random() * foodEmojis.length)
        ]
      );
    };

    const onMove = (clientY) => {
      if (!isActive.current) return;

      if (window.scrollY !== 0) {
        isActive.current = false;
        setPageOffset(0);
        setPhase("idle");
        return;
      }

      const raw = clientY - touchStartY.current;

      if (raw <= 0) {
        setPageOffset(0);
        setPhase("idle");
        return;
      }

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

          setTimeout(() => {
            setPhase("idle");
            setRipple(false);
          }, 1200);
        }, 80);
      } else {
        setPhase("snap");

        setTimeout(() => {
          setPageOffset(0);
          setPhase("idle");
        }, 450);
      }
    };

    let mouseDown = false;

    const onTouchStart = (event) =>
      onStart(event.touches[0].clientY);

    const onTouchMove = (event) =>
      onMove(event.touches[0].clientY);

    const onTouchEnd = () => onEnd();

    const onMouseDown = (event) => {
      mouseDown = true;
      onStart(event.clientY);
    };

    const onMouseMove = (event) => {
      if (mouseDown) onMove(event.clientY);
    };

    const onMouseUp = () => {
      if (mouseDown) {
        mouseDown = false;
        onEnd();
      }
    };

    window.addEventListener("touchstart", onTouchStart, {
      passive: true
    });
    window.addEventListener("touchmove", onTouchMove, {
      passive: true
    });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const progress = Math.min(pageOffset / 72, 1);
  const isSnapping = phase === "snap" || phase === "done";
  const isDone = phase === "done";

  const pageStyle = {
    transform: `translateY(${pageOffset}px)`,
    transition: isSnapping
      ? "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)"
      : "none",
    willChange: "transform"
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        *,*::before,*::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,body {
          overflow-x: hidden;
          background: #050a05;
        }

        .op-root {
          font-family: 'DM Sans', sans-serif;
          background: #050a05;
          color: #f0ede8;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .pull-strip {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 110px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #050a05;
          z-index: 1;
          pointer-events: none;
        }

        .pull-emoji {
          font-size: 42px;
          line-height: 1;
          transform-origin: center;
          filter: drop-shadow(0 4px 16px rgba(74,222,128,.5));
        }

        .pull-hint {
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(74,222,128,.85);
        }

        .pull-track {
          width: 52px;
          height: 3px;
          background: rgba(255,255,255,.06);
          border-radius: 100px;
          overflow: hidden;
        }

        .pull-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg,#4ade80,#22c55e);
          box-shadow: 0 0 8px rgba(74,222,128,.7);
          transition: width .04s linear;
        }

        .burst-ring {
          position: fixed;
          top: 55px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(74,222,128,.7);
          pointer-events: none;
          z-index: 9999;
          animation: burstRing .6s ease-out forwards;
        }

        @keyframes burstRing {
          0% {
            width: 40px;
            height: 40px;
            opacity: 1;
            margin-left: -20px;
            margin-top: -20px;
          }
          100% {
            width: 240px;
            height: 240px;
            opacity: 0;
            margin-left: -120px;
            margin-top: -120px;
          }
        }

        .full-ripple {
          position: fixed;
          inset: 0;
          background: rgba(74,222,128,.07);
          pointer-events: none;
          z-index: 9998;
          animation: fullRipple .7s ease-out forwards;
        }

        @keyframes fullRipple {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        .op-page {
          position: relative;
          z-index: 2;
        }

        .op-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .op-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .op-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(5,10,5,.55) 0%,
            rgba(5,10,5,.45) 40%,
            rgba(5,10,5,.85) 80%,
            rgba(5,10,5,1) 100%
          );
        }

        .op-noise {
          position: absolute;
          inset: 0;
          opacity: .03;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .op-content {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 80px 24px 60px;
          min-height: 100vh;
        }

        .op-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(74,222,128,.1);
          border: 1px solid rgba(74,222,128,.25);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #4ade80;
          margin-bottom: 28px;
          animation: fadeUp .8s ease both;
        }

        .op-eyebrow-dot {
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%,100% { opacity: 1; }
          50% { opacity: .3; }
        }

        .op-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px,8vw,96px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -.02em;
          margin-bottom: 12px;
          animation: fadeUp .8s .1s ease both;
        }

        .op-title-accent {
          color: #4ade80;
          display: block;
        }

        .op-subtitle {
          max-width: 520px;
          color: rgba(240,237,232,.6);
          font-size: clamp(15px,2vw,18px);
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 24px;
          animation: fadeUp .8s .2s ease both;
        }

        .op-caption {
          font-size: clamp(14px,1.8vw,17px);
          color: #86efac;
          font-style: italic;
          font-weight: 300;
          min-height: 28px;
          margin-bottom: 8px;
        }

        .op-quote {
          font-size: 13px;
          color: rgba(240,237,232,.38);
          font-style: italic;
          min-height: 22px;
          margin-bottom: 40px;
        }

        .op-stats {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 48px;
          animation: fadeUp .8s .35s ease both;
        }

        .op-stat { text-align: center; }

        .op-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px,4vw,38px);
          font-weight: 700;
          color: #4ade80;
          line-height: 1;
        }

        .op-stat-label {
          font-size: 11px;
          color: rgba(240,237,232,.45);
          letter-spacing: .04em;
          margin-top: 4px;
          max-width: 100px;
        }

        .op-stat-div {
          width: 1px;
          height: 40px;
          background: rgba(240,237,232,.1);
          align-self: center;
        }

        .op-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          animation: fadeUp .8s .45s ease both;
        }

        .op-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all .25s cubic-bezier(.34,1.56,.64,1);
          border: none;
          outline: none;
          white-space: nowrap;
        }

        .op-btn:hover { transform: translateY(-3px); }
        .op-btn:active { transform: scale(.97); }

        .op-btn-outline {
          background: rgba(240,237,232,.07);
          border: 1px solid rgba(240,237,232,.25);
          color: #f0ede8;
        }

        .op-btn-outline:hover {
          background: rgba(240,237,232,.14);
          box-shadow: 0 8px 24px rgba(0,0,0,.3);
        }

        .op-btn-primary {
          background: #4ade80;
          color: #050a05;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(74,222,128,.35);
        }

        .op-btn-primary:hover {
          background: #22c55e;
          box-shadow: 0 12px 32px rgba(74,222,128,.5);
        }

        .op-scroll {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: .4;
        }

        .op-scroll-line {
          width: 1px;
          height: 48px;
          background: linear-gradient(
            to bottom,
            rgba(240,237,232,.8),
            transparent
          );
          animation: scrollLine 2s ease-in-out infinite;
        }

        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        .op-scroll-text {
          font-size: 10px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: rgba(240,237,232,.6);
        }

        .op-dots {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 6px;
        }

        .op-dot {
          width: 6px;
          height: 6px;
          border-radius: 100px;
          background: rgba(240,237,232,.3);
          transition: all .4s ease;
        }

        .op-dot.active {
          width: 24px;
          background: #4ade80;
        }

        .op-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(74,222,128,.2),
            transparent
          );
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .op-stat-div { display: none; }
          .op-stats { gap: 20px; }
        }

        /* PREMIUM PROMOTIONS SECTION */

        .promo-section {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: clamp(72px,9vw,124px) 24px 92px;
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(41,94,70,.18),
              transparent 55%
            ),
            #070b0a;
          color: #f5f5f0;
        }

        .promo-section::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          opacity: .22;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(to bottom,black,transparent 85%);
        }

        .promo-shell {
          max-width: 1240px;
          margin: 0 auto;
        }

        .promo-heading {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 52px;
        }

        .promo-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 13px;
          border: 1px solid rgba(110,231,183,.23);
          border-radius: 999px;
          background: rgba(16,185,129,.07);
          color: #8ce8be;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .promo-kicker-dot,
        .promo-media-tag span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #5ee6a8;
          box-shadow: 0 0 12px rgba(94,230,168,.65);
        }

        .promo-overline {
          margin: 28px 0 9px;
          color: #9ca9a1;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .promo-heading h2 {
          font-family: 'Playfair Display',serif;
          font-size: clamp(40px,6.3vw,76px);
          line-height: 1.06;
          letter-spacing: -.045em;
          font-weight: 700;
          color: #f4f1e9;
        }

        .promo-heading h2 span { color: #7ce0b1; }

        .promo-intro {
          max-width: 520px;
          margin: 18px auto 0;
          color: #9ca6a0;
          font-size: 15px;
          line-height: 1.85;
        }

        .promo-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%,340px),1fr)
          );
          gap: 24px;
          align-items: stretch;
        }

        .promo-card {
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(207,226,215,.12);
          border-radius: 23px;
          background:
            linear-gradient(
              155deg,
              rgba(255,255,255,.055),
              rgba(255,255,255,.018) 48%
            ),
            #0d1310;
          box-shadow: 0 18px 60px rgba(0,0,0,.18);
          transition: border-color .3s, box-shadow .3s;
        }

        .promo-card:hover {
          border-color: rgba(124,224,177,.42);
          box-shadow:
            0 28px 70px rgba(0,0,0,.32),
            0 0 0 1px rgba(124,224,177,.04);
        }

        .promo-media {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg,#14251c,#0a100d);
        }

        .promo-media::after {
          content: "";
          position: absolute;
          inset: 35% 0 0;
          background: linear-gradient(to bottom,transparent,rgba(0,0,0,.35));
          pointer-events: none;
        }

        .promo-video-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: #000;
        }

        .promo-video-wrap video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 0;
        }

        /* 3. Mute/unmute icon positioned at the top-left corner */
        .promo-mute-button {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 15;
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255,255,255,.24);
          border-radius: 50%;
          background: rgba(5,10,7,.75);
          color: #f4f7f5;
          backdrop-filter: blur(12px);
          cursor: pointer;
          transition: background .2s, border-color .2s, transform .2s;
        }

        .promo-mute-button:hover {
          background: rgba(124,224,177,.25);
          border-color: rgba(124,224,177,.6);
          transform: scale(1.05);
        }

        .promo-mute-button svg {
          width: 17px;
          height: 17px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .promo-mute-button:focus-visible {
          outline: 2px solid #7ce0b1;
          outline-offset: 3px;
        }

        .promo-media img,
        .promo-media video,
        .promo-media iframe {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 0;
          transition: transform .65s cubic-bezier(.2,.7,.2,1);
        }

        .promo-card:hover .promo-media img {
          transform: scale(1.045);
        }

        /* Placed in the top-right corner to allow the mute button to own top-left */
        .promo-media-tag {
          position: absolute;
          z-index: 2;
          right: 14px;
          top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 999px;
          background: rgba(7,12,9,.75);
          backdrop-filter: blur(12px);
          color: #f1f5f2;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        .promo-media-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #82dfb0;
        }

        .promo-media-placeholder span {
          font-size: 48px;
          line-height: 1;
        }

        .promo-media-placeholder small {
          font-size: 9px;
          letter-spacing: .2em;
        }

        .promo-card-body { padding: 23px 24px 21px; }

        .promo-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .promo-brand-mark {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid rgba(124,224,177,.25);
          background: rgba(124,224,177,.09);
          color: #8ce8be;
          font-size: 13px;
          font-weight: 800;
        }

        .promo-brand-name {
          color: #8ce8be;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .promo-card-body h3 {
          font-size: clamp(20px,2vw,25px);
          font-weight: 650;
          line-height: 1.3;
          letter-spacing: -.025em;
          color: #f5f5f0;
        }

        .promo-description {
          margin-top: 12px;
          color: #a5aea8;
          font-size: 13px;
          line-height: 1.85;
          white-space: pre-wrap;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .promo-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 24px;
          padding-top: 17px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .promo-type {
          display: inline-flex;
          align-items: center;
          max-width: calc(100% - 42px);
          padding: 7px 10px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 999px;
          background: rgba(255,255,255,.035);
          color: #c0c9c3;
          font-size: 10px;
          letter-spacing: .04em;
          text-transform: capitalize;
        }

        .promo-arrow {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(124,224,177,.22);
          color: #8ce8be;
          font-size: 17px;
          transition: background .25s, transform .25s;
        }

        .promo-card:hover .promo-arrow {
          background: rgba(124,224,177,.12);
          transform: translate(2px,-2px);
        }

        /* Premium empty state */

        .promo-empty {
          position: relative;
          isolation: isolate;
          display: grid;
          grid-template-columns: minmax(0,1.05fr) minmax(320px,.95fr);
          align-items: center;
          gap: clamp(30px,6vw,88px);
          min-height: 420px;
          overflow: hidden;
          padding: clamp(30px,6vw,76px);
          border: 1px solid rgba(177,218,194,.15);
          border-radius: 30px;
          background:
            radial-gradient(
              ellipse at 78% 48%,
              rgba(37,112,77,.16),
              transparent 38%
            ),
            linear-gradient(
              115deg,
              rgba(255,255,255,.035),
              rgba(255,255,255,.008) 58%
            ),
            #0a100d;
          box-shadow: 0 30px 100px rgba(0,0,0,.2);
        }

        .promo-empty::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          opacity: .25;
          background-image:
            linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(110deg,black,transparent 78%);
        }

        .promo-empty-copy {
          position: relative;
          z-index: 2;
          max-width: 550px;
          text-align: left;
        }

        .promo-empty-label {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #8ce8be;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .promo-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #68e6ad;
          box-shadow: 0 0 14px rgba(104,230,173,.8);
        }

        .promo-empty h3 {
          max-width: 570px;
          margin-top: 24px;
          color: #f4f1e9;
          font-family: 'Playfair Display',serif;
          font-size: clamp(34px,4.4vw,58px);
          font-weight: 400;
          letter-spacing: -.04em;
          line-height: 1.12;
        }

        .promo-empty h3 em {
          color: #7ce0b1;
          font-weight: 400;
        }

        .promo-empty p {
          max-width: 465px;
          margin: 20px 0 0;
          color: #a0aca4;
          font-size: 14px;
          line-height: 1.95;
        }

        .promo-empty-bottom {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 34px;
          color: #7d9185;
          font-size: 10px;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .promo-empty-rule {
          width: 38px;
          height: 1px;
          background: #6ed9a5;
        }

        .promo-empty-art {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 310px;
          overflow: visible;
        }

        .promo-art-glow {
          position: absolute;
          width: min(74%,280px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(77,207,145,.17),
            rgba(29,101,68,.06) 47%,
            transparent 72%
          );
          filter: blur(6px);
        }

        .promo-orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          border: 1px solid rgba(119,220,170,.18);
          border-radius: 50%;
          transform: translate(-50%,-50%) rotate(-24deg);
        }

        .promo-orbit-one {
          width: 270px;
          height: 190px;
        }

        .promo-orbit-two {
          width: 220px;
          height: 290px;
          transform: translate(-50%,-50%) rotate(36deg);
          border-color: rgba(119,220,170,.11);
        }

        .promo-art-core {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 116px;
          height: 116px;
          border: 1px solid rgba(126,231,177,.38);
          border-radius: 34px;
          background: linear-gradient(145deg,rgba(28,76,53,.95),rgba(10,25,17,.98));
          box-shadow:
            0 0 0 12px rgba(95,211,148,.035),
            0 20px 65px rgba(0,0,0,.4),
            inset 0 1px rgba(255,255,255,.12);
          color: #8ce8be;
          transform: rotate(-7deg);
        }

        .promo-art-core span {
          font-size: 40px;
          line-height: 1;
        }

        .promo-art-core small {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .25em;
        }

        .promo-float {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 16px;
          border: 1px solid rgba(198,225,207,.15);
          border-radius: 16px;
          background: rgba(14,24,18,.87);
          box-shadow: 0 16px 40px rgba(0,0,0,.28);
          backdrop-filter: blur(16px);
        }

        .promo-float-top {
          top: 20px;
          right: -4px;
        }

        .promo-float-bottom {
          bottom: 32px;
          left: -4px;
        }

        .promo-float-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(124,224,177,.22);
          border-radius: 11px;
          background: rgba(124,224,177,.08);
          color: #8ce8be;
          font-size: 17px;
        }

        .promo-float b,
        .promo-float small {
          display: block;
        }

        .promo-float b {
          color: #e8eee9;
          font-size: 11px;
          font-weight: 600;
        }

        .promo-float small {
          margin-top: 4px;
          color: #8f9d93;
          font-size: 10px;
        }

        .promo-art-caption {
          position: absolute;
          bottom: -2px;
          color: #5f7668;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .22em;
          text-align: center;
        }

        .promo-state {
          min-height: 210px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: #aab5ad;
          text-align: center;
          border: 1px solid rgba(207,226,215,.1);
          border-radius: 24px;
          background: rgba(255,255,255,.018);
        }

        .promo-loader {
          width: 28px;
          height: 28px;
          border: 2px solid rgba(124,224,177,.18);
          border-top-color: #7ce0b1;
          border-radius: 50%;
          animation: promoSpin .8s linear infinite;
        }

        @keyframes promoSpin {
          to { transform: rotate(360deg); }
        }

        .promo-state-error {
          color: #fca5a5;
          padding: 24px;
        }

        .promo-state-icon {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border: 1px solid rgba(252,165,165,.35);
          border-radius: 50%;
        }

        .promo-footnote {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin: 42px auto 0;
          color: #7d8981;
          font-size: 11px;
          letter-spacing: .08em;
          text-align: center;
        }

        .promo-footnote-line {
          width: min(10vw,100px);
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(124,224,177,.3)
          );
        }

        .promo-footnote-line:last-child {
          transform: rotate(180deg);
        }

        @media (max-width: 760px) {
          .promo-empty {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 34px 25px;
          }

          .promo-empty-copy {
            text-align: center;
            margin: 0 auto;
          }

          .promo-empty h3 {
            font-size: clamp(32px,8vw,46px);
          }

          .promo-empty p {
            margin-left: auto;
            margin-right: auto;
          }

          .promo-empty-bottom {
            justify-content: center;
            margin-top: 24px;
          }

          .promo-empty-art {
            min-height: 280px;
          }

          .promo-float-top { right: 0; }
          .promo-float-bottom { left: 0; }
        }

        @media (max-width: 640px) {
          .promo-section {
            padding: 70px 17px 68px;
          }

          .promo-heading {
            margin-bottom: 34px;
          }

          .promo-grid { gap: 17px; }
          .promo-card-body { padding: 20px; }

          .promo-footnote {
            gap: 10px;
            font-size: 10px;
          }

          .promo-footnote-line { width: 28px; }
        }
      `}</style>

      <div className="op-root">
        {/* PULL STRIP */}
        <div className="pull-strip">
          <span
            className="pull-emoji"
            style={{
              transform: isDone
                ? "scale(1.4)"
                : `scale(${0.4 + progress * 0.8}) rotate(${(progress - 0.5) * 25}deg)`,
              transition: isDone
                ? "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)"
                : "none",
              opacity: Math.max(progress * 1.4, isDone ? 1 : 0)
            }}
          >
            {emoji}
          </span>

          <span
            className="pull-hint"
            style={{ opacity: progress * 1.5 }}
          >
            {isDone
              ? "💚 Thank you!"
              : progress >= 1
              ? "↑ Release!"
              : "↓ Pull to refresh"}
          </span>

          <div
            className="pull-track"
            style={{ opacity: progress * 1.5 }}
          >
            <div
              className="pull-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {ripple && <div className="burst-ring" key="ring" />}
        {ripple && <div className="full-ripple" key="ripple" />}

        {/* HERO */}
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
                <span className="op-title-accent">
                  Just Donate.
                </span>
              </h1>

              <p className="op-subtitle">
                DWJD connects surplus food and essentials with people
                who truly need them — securely, transparently, and
                with love.
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
                  "{quotes[quoteIndex]}"
                </motion.p>
              </AnimatePresence>

              <div className="op-stats">
                {stats.map((stat, i) => (
                  <div key={i} style={{ display: "contents" }}>
                    {i > 0 && <div className="op-stat-div" />}

                    <div className="op-stat">
                      <div className="op-stat-val">
                        {stat.value}
                      </div>

                      <div className="op-stat-label">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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

                <motion.button
                  className="op-btn op-btn-outline"
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/become-rider`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.66 }}
                >
                  <span>🚴</span> Become a Rider
                </motion.button>

                <motion.button
                  className="op-btn op-btn-outline"
                  onClick={() => navigate("/promotion-request")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.74 }}
                >
                  <span>✦</span> Promote Your Brand
                </motion.button>
              </div>
            </div>

            <div className="op-dots">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`op-dot${i === index ? " active" : ""}`}
                />
              ))}
            </div>

            <div className="op-scroll">
              <div className="op-scroll-line" />
              <span className="op-scroll-text">Scroll</span>
            </div>
          </div>

          {/* PREMIUM FEATURED PROMOTIONS */}
          <section
            aria-label="Brand promotions"
            className="promo-section"
          >
            <div className="promo-shell">
              <motion.div
                className="promo-heading"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65 }}
              >
                <span className="promo-kicker">
                  <span className="promo-kicker-dot" />
                  DWJD · Brand partners
                </span>

                <p className="promo-overline">
                  Good brands. Greater impact.
                </p>

                <h2>
                  Featured <span>promotions.</span>
                </h2>

                <p className="promo-intro">
                  Meet the partners helping turn everyday choices
                  into meaningful change.
                </p>
              </motion.div>

              {promotionsLoading ? (
                <div className="promo-state" role="status">
                  <span className="promo-loader" />
                  <p>Finding our brand partners…</p>
                </div>
              ) : promotionsError ? (
                <div
                  className="promo-state promo-state-error"
                  role="status"
                >
                  <span className="promo-state-icon">!</span>
                  <p>{promotionsError}</p>
                </div>
              ) : promotions.length === 0 ? (
                <motion.div
                  className="promo-empty"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <div className="promo-empty-copy">
                    <span className="promo-empty-label">
                      <span className="promo-live-dot" />
                      A space for purposeful brands
                    </span>

                    <h3>
                      Good things happen when{" "}
                      <em>brands show up.</em>
                    </h3>

                    <p>
                      We’re preparing the next wave of DWJD partner
                      campaigns. Once a promotion is approved, paid,
                      and active, you’ll find its story right here.
                    </p>

                    <div className="promo-empty-bottom">
                      <span className="promo-empty-rule" />
                      <span>Partnerships with purpose</span>
                    </div>
                  </div>

                  <div
                    className="promo-empty-art"
                    aria-hidden="true"
                  >
                    <div className="promo-orbit promo-orbit-one" />
                    <div className="promo-orbit promo-orbit-two" />
                    <div className="promo-art-glow" />

                    <div className="promo-art-core">
                      <span>✳</span>
                      <small>DWJD</small>
                    </div>

                    <div className="promo-float promo-float-top">
                      <span className="promo-float-icon">↗</span>
                      <span>
                        <b>Shared impact</b>
                        <small>Better, together</small>
                      </span>
                    </div>

                    <div className="promo-float promo-float-bottom">
                      <span className="promo-float-icon">✦</span>
                      <span>
                        <b>Purpose first</b>
                        <small>Every partner matters</small>
                      </span>
                    </div>

                    <div className="promo-art-caption">
                      THE NEXT CHAPTER STARTS HERE
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="promo-grid">
                    {promotions.map((promotion, cardIndex) => {
                      const imageUrl = getPromotionImageUrl(
                        promotion.image_url || ""
                      );

                      const videoUrl = String(
                        promotion.video_url || ""
                      ).trim();

                      const driveVideoId =
                        getDriveFileId(videoUrl);

                      const videoEmbedUrl =
                        getPromotionVideoEmbedUrl(videoUrl);

                      return (
                        <motion.article
                          key={
                            promotion._id ||
                            `${promotion.brand_name}-${promotion.title}`
                          }
                          className="promo-card"
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{
                            once: true,
                            amount: 0.12
                          }}
                          transition={{
                            duration: 0.5,
                            delay: Math.min(cardIndex * 0.08, 0.32)
                          }}
                          whileHover={{ y: -7 }}
                        >
                          <div className="promo-media">
                            {videoUrl ? (
                              driveVideoId ? (
                                <iframe
                                  title={`${
                                    promotion.title ||
                                    promotion.brand_name ||
                                    "Brand"
                                  } promotion video`}
                                  src={videoEmbedUrl}
                                  loading="lazy"
                                  allow="autoplay; encrypted-media; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <PromotionVideo
                                  videoUrl={videoUrl}
                                  imageUrl={imageUrl}
                                />
                              )
                            ) : imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={
                                  promotion.title ||
                                  `${promotion.brand_name || "Brand"} promotion`
                                }
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="promo-media-placeholder">
                                <span>✳</span>
                                <small>DWJD PARTNER</small>
                              </div>
                            )}

                            <span className="promo-media-tag">
                              <span />
                              Featured partner
                            </span>
                          </div>

                          <div className="promo-card-body">
                            <div className="promo-brand-row">
                              <span className="promo-brand-mark">
                                {String(
                                  promotion.brand_name || "D"
                                )
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <span className="promo-brand-name">
                                {promotion.brand_name || "DWJD Partner"}
                              </span>
                            </div>

                            <h3>
                              {promotion.title || "A campaign with purpose"}
                            </h3>

                            {promotion.description && (
                              <p className="promo-description">
                                {promotion.description}
                              </p>
                            )}

                            <div className="promo-card-footer">
                              <span className="promo-type">
                                {promotion.collaboration_type
                                  ? String(
                                      promotion.collaboration_type
                                    ).replace(/_/g, " ")
                                  : "Community impact"}
                              </span>

                              <span
                                className="promo-arrow"
                                aria-hidden="true"
                              >
                                ↗
                              </span>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>

                  <div className="promo-footnote">
                    <span className="promo-footnote-line" />
                    <span>
                      Every partnership can make a difference.
                    </span>
                    <span className="promo-footnote-line" />
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="op-divider" />

          <section style={{ background: "#050a05" }}>
            <Home />
          </section>
        </div>

        {/* AI BOT */}
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 50
          }}
        >
          <AI_Bot />
        </div>
      </div>
    </>
  );
}