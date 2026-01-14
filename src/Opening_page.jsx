import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* BACKGROUND IMAGES */
const images = [
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352"
];

/* QUOTES */
const quotes = [
  "Food wasted is hope wasted.",
  "Hunger is not a lack of food, it is a lack of justice.",
  "Sharing food is sharing humanity.",
  "One meal can change someone’s day.",
  "Waste less. Feed more."
];

export default function OpeningPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  /* IMAGE SLIDESHOW */
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  /* QUOTE ROTATION */
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BACKGROUND SLIDESHOW */}
      <AnimatePresence>
        <motion.img
          key={index}
          src={images[index]}
          alt="Food awareness"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/65" />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between text-white px-6 py-10">

        {/* TOP SECTION */}
        <div className="flex flex-col items-center justify-center text-center flex-1">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold leading-tight"
          >
            Reduce Food Waste.  
            <br />Feed More Lives.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 max-w-xl text-gray-200 text-sm md:text-base"
          >
            Millions of meals are wasted every day while people go hungry.
            DWJD connects surplus food with those who need it most.
          </motion.p>

          {/* QUOTE */}
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-6 italic text-emerald-300 text-sm md:text-base"
            >
              “ {quotes[quoteIndex]} ”
            </motion.p>
          </AnimatePresence>

          {/* BUTTONS */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-xl border border-white
                         hover:bg-white hover:text-black transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 rounded-xl bg-white text-black
                         hover:bg-gray-200 transition font-semibold"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* BOTTOM CREDENTIAL SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full"
        >
          {/* USER */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20
                          rounded-2xl p-5 text-center">
            <h3 className="font-bold text-lg text-emerald-400">
              USER LOGIN (Demo)
            </h3>
            <p className="mt-2 text-sm text-gray-200">
              Email: <span className="font-semibold">User123@gmail.com</span>
            </p>
            <p className="text-sm text-gray-200">
              Password: <span className="font-semibold">User@123</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Role: USER
            </p>
          </div>

          {/* RIDER */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20
                          rounded-2xl p-5 text-center">
            <h3 className="font-bold text-lg text-blue-400">
              RIDER LOGIN (Demo)
            </h3>
            <p className="mt-2 text-sm text-gray-200">
              Email: <span className="font-semibold">Rider123@gmail.com</span>
            </p>
            <p className="text-sm text-gray-200">
              Password: <span className="font-semibold">Rider@123</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Role: RIDER
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
