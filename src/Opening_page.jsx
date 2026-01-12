import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const images = [
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
];

export default function OpeningPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Slideshow */}
      <img
        src={images[index]}
        alt="Food waste awareness"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Reduce Food Waste.  
          <br />Feed More Lives.
        </h1>

        <p className="mt-4 max-w-xl text-gray-200 text-sm md:text-base">
          Millions of meals are wasted every day while people go hungry.
          DWJD connects surplus food with those who need it most.
        </p>

        {/* Buttons */}
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
    </div>
  );
}
