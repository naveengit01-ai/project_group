import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Afterlogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.user_type || "user";
  const email = user?.email || "user@email.com";
  const firstLetter = email.charAt(0).toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = location.pathname === "/afterlogin";

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* ================= NAVBAR ================= */}
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                   w-[94%] sm:w-[96%] max-w-7xl
                   bg-white/10 backdrop-blur-xl
                   border border-white/25
                   rounded-2xl px-4 sm:px-8 py-4
                   flex items-center justify-between
                   shadow-2xl"
      >
        {/* LEFT : LOGO */}
        <div
          onClick={() => navigate("/afterlogin")}
          className="text-2xl sm:text-3xl font-extrabold tracking-wide
                     cursor-pointer select-none"
        >
          DWJD
        </div>

        {/* CENTER : NAV (DESKTOP ONLY) */}
        <div className="hidden md:flex items-center gap-4">
          <NavButton text="Home" onClick={() => navigate("/afterlogin")} />
          <NavButton text="About" onClick={() => navigate("/afterlogin/about")} />
          <NavButton text="Contact" onClick={() => navigate("/afterlogin/contact")} />
        </div>

        {/* RIGHT : PROFILE + MENU */}
        <div className="flex items-center gap-3 relative">
          <div
            title={email}
            onClick={() => navigate("/afterlogin/profile")}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full
              flex items-center justify-center
              font-bold cursor-pointer border border-white/30
              ${role === "user" ? "bg-emerald-500/80" : "bg-cyan-500/80"}`}
          >
            {firstLetter}
          </div>

          <button
            onClick={() => setMenuOpen(p => !p)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl
                       border border-white/30
                       flex items-center justify-center text-xl
                       hover:bg-white/10 transition"
          >
            ☰
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-14 w-60
                         bg-black/90 backdrop-blur-xl
                         border border-white/20
                         rounded-xl p-2 text-sm shadow-2xl"
            >
              {/* MOBILE + DESKTOP MENU ITEMS */}
              <MenuItem text="Home" onClick={() => go(navigate, setMenuOpen, "/afterlogin")} />
              <MenuItem text="About" onClick={() => go(navigate, setMenuOpen, "/afterlogin/about")} />
              <MenuItem text="Contact" onClick={() => go(navigate, setMenuOpen, "/afterlogin/contact")} />

              <hr className="my-2 border-white/20" />

              {role === "user" ? (
                <>
                  <MenuItem text="My Requests" onClick={() => go(navigate, setMenuOpen, "donate/request")} />
                  <MenuItem text="Donate" onClick={() => go(navigate, setMenuOpen, "/afterlogin/donate")} />
                </>
              ) : (
                <>
                  <MenuItem text="Available Pickups" onClick={() => go(navigate, setMenuOpen, "/afterlogin/pickup/requests")} />
                  <MenuItem text="My Deliveries" onClick={() => go(navigate, setMenuOpen, "/afterlogin/pickup/my-rides")} />
                </>
              )}

              <MenuItem text="My Profile" onClick={() => go(navigate, setMenuOpen, "/afterlogin/profile")} />

              <hr className="my-2 border-white/20" />

              <MenuItem
                danger
                text="Logout"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
              />
            </div>
          )}
        </div>
      </nav>

      {/* ================= PAGE CONTENT ================= */}
      {isHome ? <HomeHero /> : <div className="pt-32 px-4 sm:px-6"><Outlet /></div>}
    </div>
  );
}

/* ================= HERO ================= */

function HomeHero() {
  const images = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    "https://images.unsplash.com/photo-1593113598332-cd288d649433",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399"
  ];

  const quotes = [
    "Don’t waste food. Someone is praying for it.",
    "What is extra for you can be everything for someone else.",
    "Food belongs on plates, not in bins."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-screen">
      <img
        src={images[index]}
        alt="Donation"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
          Don’t Waste.<br />Just Donate.
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-gray-200">
          “{quotes[index]}”
        </p>

        <p className="absolute bottom-6 text-xs sm:text-sm text-gray-400">
          DWJD • Community-driven donation platform
        </p>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function NavButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-xl
                 border border-white/30
                 bg-white/10 backdrop-blur-md
                 hover:bg-white/20 transition
                 font-medium"
    >
      {text}
    </button>
  );
}

function MenuItem({ text, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 rounded-lg cursor-pointer transition
        ${danger
          ? "text-red-400 hover:bg-red-500/10"
          : "hover:bg-white/10"}`}
    >
      {text}
    </div>
  );
}

function go(navigate, setMenuOpen, path) {
  setMenuOpen(false);
  navigate(path);
}
