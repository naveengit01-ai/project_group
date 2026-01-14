import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

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
    } catch (err) {
      console.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 AUTO SCROLL LEFT → RIGHT
  useEffect(() => {
    if (!containerRef.current) return;

    let scrollAmount = 0;
    const speed = 0.3; // control speed here

    const scroll = () => {
      if (!containerRef.current) return;

      scrollAmount += speed;
      containerRef.current.scrollLeft = scrollAmount;

      // reset when reached end
      if (
        scrollAmount >=
        containerRef.current.scrollWidth -
          containerRef.current.clientWidth
      ) {
        scrollAmount = 0;
      }

      requestAnimationFrame(scroll);
    };

    scroll();
  }, [ads]);

  return (
    <div className="relative px-6 pb-24 pt-20">
      <h2 className="text-3xl font-extrabold mb-8 text-white">
        Sponsored Promotions
      </h2>

      {loading ? (
        <p className="text-gray-300">Loading promotions...</p>
      ) : ads.length === 0 ? (
        <p className="text-gray-300">No promotions available</p>
      ) : (
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-hidden pb-4"
        >
          {ads.map((ad) => (
            <motion.div
              key={ad._id}
              whileHover={{ scale: 1.08 }}
              className="shrink-0
                         w-64 h-64 rounded-full
                         bg-white/15 backdrop-blur-xl
                         border border-white/30
                         flex flex-col items-center justify-center
                         text-center p-6 text-white"
            >
              <h3 className="text-lg font-bold">
                {ad.title}
              </h3>

              <p className="text-sm mt-3 line-clamp-4">
                {ad.description}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
