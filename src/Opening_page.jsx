import { useEffect, useState, useRef } from "react"; // 🎵 useRef added
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Navbar/Home";
import bgMusic from "./assets/inspiration.mp3"; // 🎵 music import

/* BACKGROUND IMAGES – REALISTIC, CALM */
const images = [
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
];

/* SHORT, HUMAN QUOTES */
const quotes = [
  "Some people waste food without knowing its value.",
  "Some people wait all day for a single meal.",
  "This gap should not exist.",
  "DWJD exists to reduce that gap."
];

/* VOICE-STYLE CAPTIONS (VERY HUMAN) */
const captions = [
  "Every day, usable food is thrown away.",
  "At the same time, people go hungry.",
  "This is not a food problem.",
  "It is a distribution problem."
];

export default function OpeningPage() {
  const navigate = useNavigate();
  const audioRef = useRef(null); // 🎵 audio reference

  const [index, setIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [musicOn, setMusicOn] = useState(true); // 🎵 toggle

  useEffect(() => {
    const t = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIndex(i => (i + 1) % quotes.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCaptionIndex(i => (i + 1) % captions.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  /* 🎵 MUSIC CONTROL */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.25; // soft volume
    audio.loop = true;

    if (musicOn) {
      audio.play().catch(() => {}); // browser safe
    } else {
      audio.pause();
    }

    return () => {
      audio.pause(); // stop when leaving page
    };
  }, [musicOn]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* 🎵 AUDIO ELEMENT */}
      <audio ref={audioRef} src={bgMusic} />

      {/* 🎵 MUSIC TOGGLE */}
      <button
        onClick={() => setMusicOn(!musicOn)}
        className="fixed top-5 right-5 z-50
                   bg-black/60 border border-white/20
                   text-xs px-3 py-2 rounded-full
                   backdrop-blur hover:bg-black"
      >
        {musicOn ? "🔊 Music On" : "🔇 Music Off"}
      </button>

      {/* ================= HERO ================= */}
      <div className="relative min-h-screen overflow-hidden">

        <AnimatePresence>
          <motion.img
            key={index}
            src={images[index]}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 min-h-screen flex flex-col justify-between px-6 py-12">

          <div className="flex flex-col items-center justify-center text-center flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight"
            >
              Don’t Waste.
              <br />
              <span className="text-emerald-400">Just Donate.</span>
            </motion.h1>

            <p className="mt-4 max-w-xl text-gray-300 text-sm sm:text-base">
              DWJD connects surplus food and essential items with people who need them,
              in a simple and secure way.
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={captionIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-emerald-300 text-sm italic"
              >
                {captions[captionIndex]}
              </motion.p>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-6 text-gray-400 italic text-sm"
              >
                “ {quotes[quoteIndex]} ”
              </motion.p>
            </AnimatePresence>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-lg border border-white/60
                           hover:bg-white hover:text-black transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 rounded-lg bg-emerald-500
                           text-black font-medium hover:bg-emerald-400 transition"
              >
                Get Started
              </button>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="text-center text-gray-400 text-xs"
          >
            ↓ Scroll to understand how it works ↓
          </motion.div>
        </div>
      </div>

      {/* ================= PROMOTIONS ================= */}
      <section className="bg-black">
        <Home />
      </section>

      {/* ================= REAL PROBLEM ================= */}
      <div className="px-6 py-20 bg-black text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Why DWJD Is Needed
        </h2>

        <p className="max-w-3xl mx-auto text-gray-300 mb-12 text-sm sm:text-base">
          Restaurants, events, and households often have extra food.
          At the same time, shelters and individuals struggle to access meals.
          DWJD helps bridge this gap responsibly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433"
               className="rounded-xl h-52 w-full object-cover" />
          <img src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1"
               className="rounded-xl h-52 w-full object-cover" />
          <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb"
               className="rounded-xl h-52 w-full object-cover" />
        </div>
      </div>

      {/* ================= SIMPLE STEPS ================= */}
      <div className="px-6 py-20 bg-gradient-to-b from-black to-gray-900">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-14">
          How DWJD Works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            "User donates food or items",
            "OTP ensures secure pickup",
            "Verified rider collects",
            "Donation is delivered safely"
          ].map((text, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10
                         rounded-xl p-6 text-center"
            >
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-white">
                  Step {i + 1}:
                </span>{" "}
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CLOSING ================= */}
      <div className="px-6 py-20 bg-black text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Small Actions Matter
        </h2>
        <p className="max-w-3xl mx-auto text-gray-400 text-sm sm:text-base">
          What is excess for one person can be meaningful support for another.
          DWJD is built to make that connection simple and respectful.
        </p>
      </div>
    </div>
  );
}
