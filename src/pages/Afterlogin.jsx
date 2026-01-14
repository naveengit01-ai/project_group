import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Home from "./Navbar/Home"; // 👈 ADD THIS

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
                   w-[96%] max-w-7xl
                   bg-white/10 backdrop-blur-xl
                   border border-white/25
                   rounded-2xl px-8 py-4
                   flex items-center justify-between
                   shadow-2xl"
      >
        {/* LEFT : LOGO */}
        <div
          onClick={() => navigate("/afterlogin")}
          className="text-2xl md:text-3xl font-extrabold tracking-wide
                     cursor-pointer select-none flex items-center"
        >
          DWJD
        </div>

        {/* CENTER : NAV BUTTONS */}
        <div className="flex items-center gap-4">
          <NavButton text="Home" onClick={() => navigate("/afterlogin")} />
          <NavButton text="About" onClick={() => navigate("/afterlogin/about")} />
          <NavButton text="Contact" onClick={() => navigate("/afterlogin/contact")} />
        </div>

        {/* RIGHT : PROFILE + MENU */}
        <div className="flex items-center gap-3 relative">
          <div
            title={email}
            onClick={() => navigate("/afterlogin/profile")}
            className={`w-11 h-11 rounded-full flex items-center justify-center
              font-bold cursor-pointer border border-white/30 text-lg
              ${role === "user" ? "bg-emerald-500/80" : "bg-cyan-500/80"}`}
          >
            {firstLetter}
          </div>

          <button
            onClick={() => setMenuOpen(p => !p)}
            className="w-11 h-11 rounded-xl border border-white/30
                       flex items-center justify-center text-xl
                       hover:bg-white/10 transition"
          >
            ☰
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-14 w-56
                         bg-black/80 backdrop-blur-xl
                         border border-white/20
                         rounded-xl p-2 text-sm shadow-2xl"
            >
              {role === "user" ? (
                <>
                  <MenuItem
                    text="My Requests"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("donate/request");
                    }}
                  />
                  <MenuItem
                    text="Donate Food"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/afterlogin/donate");
                    }}
                  />
                </>
              ) : (
                <>
                  <MenuItem
                    text="Available Pickups"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/afterlogin/pickup/requests");
                    }}
                  />
                  <MenuItem
                    text="My Deliveries"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/afterlogin/pickup/my-rides");
                    }}
                  />
                </>
              )}

              <MenuItem
                text="My Profile"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/afterlogin/profile");
                }}
              />

              <hr className="my-1 border-white/20" />

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
      {isHome ? (
        <>
          <HomeHero />
          <Home /> {/* 👈 ADD SPONSORSHIP SECTION HERE */}
        </>
      ) : (
        <div className="pt-32 p-6">
          <Outlet />
        </div>
      )}
    </div>
  );
}

/* ================= FULL SCREEN HERO ================= */

function HomeHero() {
  const images = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    "https://images.unsplash.com/photo-1593113598332-cd288d649433",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
    "https://images.unsplash.com/photo-1543352634-8730b0d7b5c5",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc"
  ];

  const quotes = [
    "Don’t waste food. Someone is praying for it.",
    "Hunger exists not because of scarcity, but because of neglect.",
    "Food should fill stomachs, not landfills.",
    "What is extra for you can be everything for someone else.",
    "A shared meal is dignity restored.",
    "Care begins with sharing."
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

      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Don’t Waste.<br />Just Donate.
        </h1>

        <p className="max-w-3xl text-xl md:text-2xl font-medium text-gray-200">
          “{quotes[index]}”
        </p>

        <p className="absolute bottom-6 text-sm text-gray-400 tracking-wide">
          DWJD • Community-driven food donation platform
        </p>
      </div>
    </div>
  );
}

/* ================= NAV BUTTON ================= */

function NavButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-xl
                 border border-white/30
                 bg-white/10 backdrop-blur-md
                 hover:bg-white/20 transition
                 text-sm md:text-base font-medium"
    >
      {text}
    </button>
  );
}

/* ================= MENU ITEM ================= */

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
