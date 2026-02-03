import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

/* 🎨 PROFESSIONAL GRADIENTS */
const promoGradients = [
  "from-emerald-500/20 to-emerald-900/30",
  "from-cyan-500/20 to-cyan-900/30",
  "from-indigo-500/20 to-indigo-900/30",
  "from-violet-500/20 to-violet-900/30",
  "from-rose-500/20 to-rose-900/30",
  "from-amber-500/20 to-amber-900/30",
];

export default function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef(null);
  const isHovering = useRef(false);

  /* 🔄 FETCH ADS */
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch(`${BASE_URL}/advertisements`);
      const data = await res.json();
      if (data.status === "success") {
        setAds(data.ads || []);
      }
    } catch {
      console.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  /* 🌊 AUTO SCROLL + WATER PROGRESS */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || ads.length === 0) return;

    let rafId;
    const speed = 0.5;

    const autoScroll = () => {
      if (!isHovering.current) {
        container.scrollLeft += speed;

        const maxScroll =
          container.scrollWidth - container.clientWidth;

        const progress =
          (container.scrollLeft / maxScroll) * 100;

        setScrollProgress(progress || 0);

        if (container.scrollLeft >= maxScroll - 1) {
          container.scrollLeft = 0;
        }
      }

      rafId = requestAnimationFrame(autoScroll);
    };

    rafId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(rafId);
  }, [ads]);

  return (
    <div className="relative px-6 pb-24 pt-20 text-white">
      <h2 className="text-4xl font-extrabold mb-10 tracking-tight">
        Sponsored Promotions ✨
      </h2>

      {loading ? (
        <p className="text-gray-400 animate-pulse">
          Loading promotions…
        </p>
      ) : ads.length === 0 ? (
        <p className="text-gray-400">
          No promotions available
        </p>
      ) : (
        <>
          {/* 🎠 PROMOTION CAROUSEL */}
          <div
            ref={containerRef}
            onMouseEnter={() => (isHovering.current = true)}
            onMouseLeave={() => (isHovering.current = false)}
            className="
              flex gap-10 pb-10
              overflow-x-scroll
              cursor-grab active:cursor-grabbing
              select-none scrollbar-hide
            "
          >
            {ads.map((ad, index) => {
              const gradient =
                promoGradients[index % promoGradients.length];

              return (
                <motion.div
                  key={ad._id}
                  whileHover={{ scale: 1.08, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                  }}
                  className={`
                    relative shrink-0
                    w-72 h-72 rounded-full
                    bg-gradient-to-br ${gradient}
                    backdrop-blur-xl
                    border border-white/20
                    shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                    flex flex-col items-center justify-center
                    text-center p-8
                    overflow-hidden
                  `}
                >
                  {/* glow */}
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition
                                  bg-gradient-to-br from-white/10 to-transparent" />

                  {/* badge */}
                  <span className="absolute top-5 px-4 py-1 text-[11px]
                                   uppercase tracking-widest font-bold
                                   rounded-full
                                   bg-white/10 border border-white/20">
                    Sponsored
                  </span>

                  <h3 className="text-xl font-extrabold mt-8">
                    {ad.title}
                  </h3>

                  <p className="text-sm mt-4 text-gray-300 line-clamp-4">
                    {ad.description}
                  </p>

                  <div className="absolute bottom-6 text-xs text-gray-300">
                    By{" "}
                    <span className="font-semibold text-white">
                      {ad.company_name}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 🌊 WATER FILL SCROLL INDICATOR */}
          <div className="relative mt-6 h-3 w-full overflow-hidden rounded-full
                          bg-white/10 border border-white/20 backdrop-blur">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full
                         bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400
                         bg-[length:200%_200%]"
              style={{ width: `${scrollProgress}%` }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* floating wave highlight */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.5) 0%, transparent 45%)",
                animation: "wave 4s linear infinite",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
