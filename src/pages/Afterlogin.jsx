import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Afterlogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔐 SAFETY CHECK
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const role = user.user_type; // admin | user | rider
  const email = user.email;
  const firstLetter = email.charAt(0).toUpperCase();

  const isAdmin = role === "admin";
  const isHome = location.pathname === "/afterlogin";

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* ================= ADMIN HOME ================= */}
      {isAdmin && isHome && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-xl bg-white/10 backdrop-blur-xl
                          border border-white/20 rounded-3xl
                          p-10 space-y-8 shadow-2xl">
            <h1 className="text-3xl font-extrabold text-center">
              Admin Dashboard
            </h1>

            <button
              onClick={() => navigate("/afterlogin/overall")}
              className="w-full py-5 rounded-2xl
                         bg-emerald-400 text-black
                         font-bold text-lg hover:bg-emerald-300 transition"
            >
              Overall Statistics
            </button>

            <button
              onClick={() => navigate("/afterlogin/promotions")}
              className="w-full py-5 rounded-2xl
                         bg-cyan-400 text-black
                         font-bold text-lg hover:bg-cyan-300 transition"
            >
              Promotions
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="block mx-auto text-sm text-red-400 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ================= NAVBAR (USER / RIDER) ================= */}
      {!isAdmin && (
        <nav
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                     w-[94%] sm:w-[96%] max-w-7xl
                     bg-white/10 backdrop-blur-xl
                     border border-white/25 rounded-2xl
                     px-4 sm:px-8 py-4 flex justify-between shadow-2xl"
        >
          <div
            onClick={() => navigate("/afterlogin")}
            className="text-2xl sm:text-3xl font-extrabold cursor-pointer"
          >
            DWJD
          </div>

          <div className="hidden md:flex gap-4">
            <NavButton text="Home" onClick={() => navigate("/afterlogin")} />
            <NavButton text="About" onClick={() => navigate("/afterlogin/about")} />
            <NavButton text="Contact" onClick={() => navigate("/afterlogin/contact")} />
          </div>

          <div className="flex items-center gap-3 relative">
            <div
              title={email}
              onClick={() => navigate("/afterlogin/profile")}
              className={`w-10 h-10 rounded-full flex items-center justify-center
                          font-bold cursor-pointer border border-white/30
                          ${role === "user" ? "bg-emerald-500/80" : "bg-cyan-500/80"}`}
            >
              {firstLetter}
            </div>

            <button
              onClick={() => setMenuOpen(p => !p)}
              className="w-10 h-10 rounded-xl border border-white/30 hover:bg-white/10"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-60 bg-black/90
                              border border-white/20 rounded-xl p-2 text-sm">
                <MenuItem text="Home" onClick={() => go(navigate, setMenuOpen, "/afterlogin")} />
                <MenuItem text="About" onClick={() => go(navigate, setMenuOpen, "/afterlogin/about")} />
                <MenuItem text="Contact" onClick={() => go(navigate, setMenuOpen, "/afterlogin/contact")} />

                <hr className="my-2 border-white/20" />

                {role === "user" ? (
                  <>
                    <MenuItem text="My Requests" onClick={() => go(navigate, setMenuOpen, "/afterlogin/donate/request")} />
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
      )}

      {/* ================= HOME HERO (IMAGES FITTED) ================= */}
      {!isAdmin && isHome && <HomeHero />}

      {/* ================= PAGE CONTENT ================= */}
      {!isHome && (
        <div className="pt-32 px-4">
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
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Don’t Waste.<br />Just Donate.
        </h1>

        <p className="max-w-3xl text-xl md:text-2xl text-gray-200">
          “{quotes[index]}”
        </p>

        <p className="absolute bottom-6 text-sm text-gray-400">
          DWJD • Community-driven food donation platform
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
      className="px-5 py-2 rounded-xl border border-white/30
                 bg-white/10 hover:bg-white/20 transition"
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
        ${danger ? "text-red-400 hover:bg-red-500/10" : "hover:bg-white/10"}`}
    >
      {text}
    </div>
  );
}

function go(navigate, setMenuOpen, path) {
  setMenuOpen(false);
  navigate(path);
}
