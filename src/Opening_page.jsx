import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Navbar/Home";
import AI_Bot from "./pages/Ai_Bot"; // 🤖 AI BOT (ADDED)
import bgMusic from "./assets/inspiration.mp3";

/* BACKGROUND IMAGES */
const images = [
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
];

/* QUOTES */
const quotes = [
  "Some people waste food without knowing its value.",
  "Some people wait all day for a single meal.",
  "This gap should not exist.",
  "DWJD exists to reduce that gap."
];

/* CAPTIONS + NARRATION (EN + TE) */
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

export default function OpeningPage() {
  const navigate = useNavigate();

  const audioRef = useRef(null);
  const speechRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);

  const [musicOn, setMusicOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const [language, setLanguage] = useState("en");

  /* SLIDESHOW */
  useEffect(() => {
    const t = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  /* QUOTES */
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIndex(i => (i + 1) % quotes.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  /* CAPTIONS */
  useEffect(() => {
    const t = setInterval(() => {
      setCaptionIndex(i => (i + 1) % captions.en.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  /* MUSIC */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.25;
    audio.loop = true;

    if (musicOn) audio.play().catch(() => {});
    else audio.pause();

    return () => audio.pause();
  }, [musicOn]);

  /* 🎙️ SPEAK FUNCTION */
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    u.volume = 1;
    u.lang = language === "en" ? "en-US" : "te-IN";

    if (audioRef.current) audioRef.current.volume = 0.1;

    u.onend = () => {
      if (audioRef.current) audioRef.current.volume = 0.25;
    };

    speechRef.current = u;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (voiceOn) {
      speak(captions[language][captionIndex]);
    }
  }, [captionIndex, voiceOn, language]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* 🎵 AUDIO */}
      <audio ref={audioRef} src={bgMusic} />

      {/* CONTROLS */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        <button
          onClick={() => setMusicOn(!musicOn)}
          className="bg-black/60 border border-white/20 text-xs px-3 py-2 rounded-full backdrop-blur"
        >
          {musicOn ? "🔊 Music On" : "🔇 Music Off"}
        </button>

        <button
          onClick={() => {
            if (voiceOn) {
              window.speechSynthesis.cancel();
              setVoiceOn(false);
            } else {
              setVoiceOn(true);
              speak(captions[language][captionIndex]);
            }
          }}
          className="bg-black/60 border border-white/20 text-xs px-3 py-2 rounded-full backdrop-blur"
        >
          {voiceOn ? "🎙️ Voice On" : "🔇 Voice"}
        </button>

        <button
          onClick={() => setLanguage(l => (l === "en" ? "te" : "en"))}
          className="bg-black/60 border border-white/20 text-xs px-3 py-2 rounded-full backdrop-blur"
        >
          🌍 {language === "en" ? "English" : "తెలుగు"}
        </button>
      </div>

      {/* HERO */}
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
            <h1 className="text-3xl md:text-5xl font-semibold">
              Don’t Waste.
              <br />
              <span className="text-emerald-400">Just Donate.</span>
            </h1>

            <p className="mt-4 max-w-xl text-gray-300">
              DWJD connects surplus food and essentials with people who need them.
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={captionIndex + language}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-emerald-300 italic"
              >
                {captions[language][captionIndex]}
              </motion.p>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-gray-400 italic text-sm"
              >
                “ {quotes[quoteIndex]} ”
              </motion.p>
            </AnimatePresence>

            {/* 🔘 BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-lg border border-white/60"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 rounded-lg bg-emerald-500 text-black"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate("/Career")}
                className="px-6 py-3 rounded-lg
                           border border-cyan-400
                           text-cyan-300
                           hover:bg-cyan-400 hover:text-black
                           transition"
              >
                💼 Careers / Employment
              </button>

              <button
                onClick={() => navigate("/youtube")}
                className="px-6 py-3 rounded-lg
                           border border-red-400
                           text-red-300
                           hover:bg-red-400 hover:text-black transition"
              >
                ▶️ YouTube Content
              </button>

              <button
                onClick={() => navigate("/code-editor")}
                className="px-6 py-3 rounded-lg
                           border border-purple-400
                           text-purple-300
                           hover:bg-purple-400 hover:text-black
                           transition"
              >
                🧠 Code Editor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROMOTIONS */}
      <section className="bg-black">
        <Home />
      </section>

      {/* 🤖 AI BOT (FIXED RIGHT SIDE) */}
      <div className="fixed bottom-6 left-6 z-50">
        <AI_Bot />
      </div>

    </div>
  );
}
