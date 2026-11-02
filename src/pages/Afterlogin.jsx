
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Home from "./Navbar/Home";
import AI_Bot from "./Ai_Bot";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://back-end-project-group.onrender.com";

// --------------------------------------------------
// CONTENT
// --------------------------------------------------

const quotes = [
  "Don't waste food. Someone is praying for it.",
  "Hunger exists not because of scarcity, but because of neglect.",
  "Food should fill stomachs, not landfills.",
  "What is extra for you can be everything for someone else.",
  "A shared meal is dignity restored.",
  "Care begins with sharing.",
];

const images = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=85",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=85",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1920&q=85",
  "https://images.unsplash.com/photo-1543352634-8730b0d7b5c5?w=1920&q=85",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=85",
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1920&q=85",
];

const navigation = [
  { label: "Home", path: "/afterlogin" },
  { label: "About", path: "/afterlogin/about" },
  { label: "Contact", path: "/afterlogin/contact" },
];

const accountLinks = {
  user: [
    {
      icon: "▤",
      label: "My Requests",
      description: "Track your donations",
      path: "/afterlogin/donate/request",
    },
    {
      icon: "♧",
      label: "Donate Food",
      description: "Share a meal",
      path: "/afterlogin/donate",
    },
  ],

  rider: [
    {
      icon: "▣",
      label: "Available Pickups",
      description: "Find pickup requests",
      path: "/afterlogin/pickup/requests",
    },
    {
      icon: "↗",
      label: "My Deliveries",
      description: "Manage deliveries",
      path: "/afterlogin/pickup/my-rides",
    },
  ],
};

const adminLinks = [
  {
    icon: "◫",
    label: "Overall Statistics",
    description: "Platform metrics and insights",
    path: "/afterlogin/overall",
    color: "#34D399",
  },
  {
    icon: "✦",
    label: "Promotions",
    description: "Manage campaigns",
    path: "/afterlogin/promotions",
    color: "#60A5FA",
  },
  {
    icon: "▣",
    label: "Add Job",
    description: "Post opportunities",
    path: "/afterlogin/add-job",
    color: "#FBBF24",
  },
  {
    icon: "▶",
    label: "YouTube Content",
    description: "Manage video library",
    path: "/afterlogin/youtube-content",
    color: "#F87171",
  },
  {
    icon: "♧",
    label: "Notifications",
    description: "Send platform updates",
    path: "/afterlogin/notifications",
    color: "#F472B6",
  },
  {
    icon: "✓",
    label: "To-Do List",
    description: "Organize your tasks",
    path: "/afterlogin/todo",
    color: "#A78BFA",
  },
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function Icon({ name, size = 18 }) {
  const paths = {
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    chevron: <path d="m7 10 5 5 5-5" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.user}
    </svg>
  );
}

// --------------------------------------------------
// PROFILE AVATAR
// --------------------------------------------------

function Avatar({ user, size = "normal" }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [user?.profile_image]);

  const image = user?.profile_image;

  const letter = (
    user?.first_name?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <span
      className={`al-avatar ${size} ${
        user?.user_type === "rider" ? "rider" : ""
      }`}
    >
      {image && !imageFailed ? (
        <img
          src={image}
          alt={`${user?.first_name || "Member"} profile`}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        letter
      )}

      <span className="al-avatar-status" />
    </span>
  );
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function Afterlogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [user, setUser] = useState(getSavedUser);

  const [profileLoading, setProfileLoading] = useState(false);

  // ------------------------------------------------
  // REFRESH PROFILE FROM EXISTING BACKEND API
  // ------------------------------------------------

  const refreshProfile = useCallback(async () => {
    const savedUser = getSavedUser();

    if (!savedUser) {
      setUser(null);
      return;
    }

    // Admin accounts use a different MongoDB collection.
    if (savedUser.user_type === "admin") {
      setUser(savedUser);
      return;
    }

    if (!savedUser.email) {
      setUser(savedUser);
      return;
    }

    setUser(savedUser);
    setProfileLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/get-user-by-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: savedUser.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Profile request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status !== "success" || !data.user) {
        throw new Error(
          data.message || "Unable to retrieve profile."
        );
      }

      // Preserve any client-side properties not returned by API.
      const updatedUser = {
        ...savedUser,
        ...data.user,
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error("Profile refresh failed:", error);

      // Keep the previously saved profile if API fails.
      setUser(savedUser);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Listen for profile updates from other components.
  useEffect(() => {
    const handleProfileUpdate = () => {
      refreshProfile();
    };

    window.addEventListener(
      "dwjd-profile-updated",
      handleProfileUpdate
    );

    window.addEventListener(
      "storage",
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "dwjd-profile-updated",
        handleProfileUpdate
      );

      window.removeEventListener(
        "storage",
        handleProfileUpdate
      );
    };
  }, [refreshProfile]);

  // ------------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------------

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);

    navigate("/login", {
      replace: true,
    });
  };

  // ------------------------------------------------
  // DROPDOWN HANDLING
  // ------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "touchstart",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "touchstart",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const goTo = (path) => {
    setMenuOpen(false);
    setMobileOpen(false);
    navigate(path);
  };

  if (!user) return null;

  // ------------------------------------------------
  // USER INFORMATION
  // ------------------------------------------------

  const role = user.user_type;

  const isAdmin = role === "admin";
  const isRider = role === "rider";

  const isHome =
    location.pathname === "/afterlogin";

  const email = user.email || "";

  const fullName =
    [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ") ||
    user.username ||
    email ||
    "DWJD Member";

  const firstName =
    user.first_name || "Welcome";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .al-root {
          --green: #34D399;
          --green-light: #6EE7B7;
          --bg: #080C0E;
          --panel: #10171A;
          --panel-light: #17211F;
          --line: rgba(255,255,255,.075);
          --muted: #84948C;
          --white: #F3F8F5;

          min-height: 100vh;
          position: relative;
          overflow-x: clip;
          background: var(--bg);
          color: var(--white);
          font-family: 'DM Sans', sans-serif;
          isolation: isolate;
        }

        .al-root *,
        .al-root *::before,
        .al-root *::after {
          box-sizing: border-box;
        }

        .al-root button {
          font: inherit;
        }

        .al-root button:focus-visible,
        .al-root [role="button"]:focus-visible {
          outline: 2px solid var(--green);
          outline-offset: 4px;
        }

        .al-root::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 10% 0%, rgba(16,185,129,.13), transparent 38%),
            radial-gradient(ellipse at 90% 70%, rgba(16,185,129,.06), transparent 35%);
        }

        .al-grid-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .22;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 55px 55px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        /* NAVBAR */

        .al-nav {
          position: fixed;
          z-index: 1000;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: min(1240px,calc(100% - 32px));
          min-height: 70px;
          padding: 10px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border: 1px solid rgba(255,255,255,.075);
          border-radius: 20px;
          background: rgba(12,18,20,.82);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 15px 50px rgba(0,0,0,.32);
          animation: alNavEnter .65s cubic-bezier(.2,.8,.2,1) both;
        }

        @keyframes alNavEnter {
          from {
            opacity: 0;
            transform: translate(-50%,-18px);
          }
          to {
            opacity: 1;
            transform: translate(-50%,0);
          }
        }

        .al-logo {
          display: inline-flex;
          align-items: center;
          gap: 1px;
          color: white;
          font-family: Manrope,sans-serif;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -1.5px;
          cursor: pointer;
          user-select: none;
          transition: .25s;
        }

        .al-logo:hover {
          transform: translateY(-2px);
        }

        .al-logo span {
          color: var(--green);
        }

        .al-logo-mark {
          width: 8px;
          height: 8px;
          margin-left: 8px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 16px rgba(52,211,153,.8);
          animation: alPulse 2s infinite;
        }

        @keyframes alPulse {
          0%,100% { box-shadow: 0 0 5px rgba(52,211,153,.5); }
          50% { box-shadow: 0 0 17px rgba(52,211,153,.95); }
        }

        .al-nav-links {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0 auto;
        }

        .al-nav-btn {
          position: relative;
          min-height: 43px;
          padding: 0 18px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #9BAAA1;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: .25s;
        }

        .al-nav-btn:hover,
        .al-nav-btn.active {
          background: rgba(52,211,153,.09);
          color: var(--green);
        }

        .al-nav-btn.active::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 50%;
          width: 18px;
          height: 3px;
          transform: translateX(-50%);
          border-radius: 10px;
          background: var(--green);
          box-shadow: 0 0 10px rgba(52,211,153,.5);
        }

        .al-nav-right {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* PROFILE */

        .al-profile-trigger {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 5px 9px 5px 5px;
          border: 1px solid transparent;
          border-radius: 14px;
          background: transparent;
          color: white;
          cursor: pointer;
          transition: .25s;
        }

        .al-profile-trigger:hover,
        .al-profile-trigger.open {
          border-color: var(--line);
          background: rgba(255,255,255,.045);
        }

        .al-avatar {
          position: relative;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          overflow: visible;
          flex-shrink: 0;
          border: 1px solid rgba(52,211,153,.5);
          border-radius: 50%;
          background: linear-gradient(145deg,#14523C,#0C211B);
          color: var(--green-light);
          font-family: Manrope,sans-serif;
          font-size: 15px;
          font-weight: 800;
          box-shadow: 0 0 18px rgba(52,211,153,.08);
        }

        .al-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .al-avatar.rider {
          border-color: rgba(129,140,248,.55);
          background: #24204A;
          color: #A5B4FC;
        }

        .al-avatar.small {
          width: 35px;
          height: 35px;
        }

        .al-avatar-status {
          position: absolute;
          right: 0;
          bottom: 1px;
          width: 10px;
          height: 10px;
          border: 2px solid #101719;
          border-radius: 50%;
          background: #34D399;
        }

        .al-profile-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          max-width: 150px;
        }

        .al-profile-name {
          max-width: 150px;
          overflow: hidden;
          color: #EDF5EF;
          font-size: 12px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .al-profile-role {
          color: #819087;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .al-chevron {
          color: #8B9B91;
          transition: transform .25s;
        }

        .al-profile-trigger.open .al-chevron {
          transform: rotate(180deg);
        }

        .al-profile-loading {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          animation: alPulse 1s infinite;
        }

        .al-menu-btn {
          display: none;
          place-items: center;
          width: 41px;
          height: 41px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: rgba(255,255,255,.04);
          color: white;
          cursor: pointer;
          transition: .2s;
        }

        .al-menu-btn:hover {
          color: var(--green);
          border-color: rgba(52,211,153,.4);
        }

        /* ACCOUNT DROPDOWN */

        .al-dropdown {
          position: absolute;
          top: calc(100% + 14px);
          right: 0;
          width: 290px;
          padding: 11px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 19px;
          background: #111A1D;
          box-shadow: 0 25px 70px rgba(0,0,0,.55);
          animation: alDropdownEnter .25s cubic-bezier(.2,.8,.2,1) both;
        }

        @keyframes alDropdownEnter {
          from {
            opacity: 0;
            transform: translateY(-9px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .al-dropdown-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          margin-bottom: 9px;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 13px;
          background: rgba(255,255,255,.025);
        }

        .al-dropdown-user-info {
          min-width: 0;
        }

        .al-dropdown-name {
          overflow: hidden;
          color: white;
          font-size: 12px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .al-dropdown-email {
          overflow: hidden;
          margin-top: 5px;
          color: #84948C;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .al-menu-section {
          padding: 11px 10px 7px;
          color: #708178;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .al-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-height: 44px;
          padding: 0 11px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #B0BDB5;
          font-size: 11px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: .2s;
        }

        .al-menu-item:hover {
          transform: translateX(3px);
          background: rgba(52,211,153,.09);
          color: var(--green);
        }

        .al-menu-icon {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 9px;
          background: rgba(255,255,255,.045);
          font-size: 15px;
        }

        .al-menu-hr {
          height: 1px;
          margin: 9px 5px;
          background: var(--line);
        }

        .al-menu-item.danger {
          color: #F87171;
        }

        .al-menu-item.danger:hover {
          background: rgba(248,113,113,.09);
        }

        /* MOBILE NAVIGATION */

        .al-mobile-panel {
          display: none;
        }

        /* ADMIN DASHBOARD */

        .al-admin-root {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 115px 25px 60px;
        }

        .al-admin-wrap {
          width: 100%;
          max-width: 1120px;
          animation: alFadeUp .7s ease both;
        }

        .al-admin-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
        }

        .al-admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          padding: 8px 13px;
          border: 1px solid rgba(52,211,153,.2);
          border-radius: 30px;
          background: rgba(52,211,153,.07);
          color: var(--green);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .al-admin-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 10px var(--green);
        }

        .al-admin-title {
          margin: 0;
          font-family: Manrope,sans-serif;
          font-size: clamp(36px,5vw,59px);
          font-weight: 800;
          letter-spacing: -2.7px;
        }

        .al-admin-title span {
          color: var(--green);
        }

        .al-admin-sub {
          max-width: 560px;
          margin-top: 12px;
          color: #8A9A91;
          font-size: 13px;
          line-height: 1.8;
        }

        .al-admin-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: rgba(255,255,255,.025);
        }

        .al-admin-user-label {
          color: #819087;
          font-size: 9px;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .al-admin-user-name {
          margin-top: 5px;
          color: #EDF5EF;
          font-size: 11px;
          font-weight: 800;
        }

        .al-admin-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 16px;
        }

        .al-admin-tile {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 190px;
          padding: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.075);
          border-radius: 20px;
          background: linear-gradient(145deg,#151F20,#101719);
          text-align: left;
          cursor: pointer;
          transition: transform .3s ease,border-color .3s,box-shadow .3s;
          animation: alFadeUp .55s ease both;
        }

        .al-admin-tile::before {
          content: "";
          position: absolute;
          width: 160px;
          height: 160px;
          right: -65px;
          bottom: -85px;
          border-radius: 50%;
          background: var(--tile-color);
          opacity: .07;
          filter: blur(20px);
          transition: .3s;
        }

        .al-admin-tile:hover {
          transform: translateY(-7px);
          border-color: var(--tile-color);
          box-shadow: 0 20px 50px rgba(0,0,0,.28);
        }

        .al-admin-tile:hover::before {
          opacity: .18;
          transform: scale(1.3);
        }

        .al-tile-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          margin-bottom: 25px;
          border: 1px solid var(--tile-border);
          border-radius: 14px;
          background: var(--tile-bg);
          color: var(--tile-color);
          font-size: 21px;
          transition: transform .3s;
        }

        .al-admin-tile:hover .al-tile-icon {
          transform: rotate(-7deg) scale(1.08);
        }

        .al-tile-label {
          color: #F0F6F1;
          font-family: Manrope,sans-serif;
          font-size: 14px;
          font-weight: 800;
        }

        .al-tile-desc {
          margin-top: 8px;
          color: #84948C;
          font-size: 10px;
        }

        .al-tile-arrow {
          position: absolute;
          top: 25px;
          right: 23px;
          color: #7D8B82;
          transition: .25s;
        }

        .al-admin-tile:hover .al-tile-arrow {
          transform: translateX(5px);
          color: var(--tile-color);
        }

        .al-admin-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 25px;
          padding-top: 22px;
          border-top: 1px solid var(--line);
        }

        .al-admin-footnote {
          color: #728178;
          font-size: 10px;
        }

        .al-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          border: 1px solid rgba(248,113,113,.2);
          border-radius: 10px;
          background: rgba(248,113,113,.05);
          color: #F87171;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }

        .al-logout-btn:hover {
          transform: translateY(-2px);
          background: rgba(248,113,113,.12);
        }

        /* HERO */

        .al-hero {
          position: relative;
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          background: #070B0A;
        }

        .al-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transform: scale(1.06);
          transition: opacity 1s ease,transform 7s ease;
        }

        .al-hero-img.active {
          opacity: 1;
          transform: scale(1);
        }

        .al-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg,rgba(4,11,8,.91),rgba(4,11,8,.55) 60%,rgba(4,11,8,.25)),
            linear-gradient(0deg,#080C0E 0%,transparent 43%);
        }

        .al-hero-content {
          position: relative;
          z-index: 2;
          width: min(1120px,100%);
          padding: 140px 35px 155px;
          animation: alFadeUp .9s ease both;
        }

        .al-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 15px;
          border: 1px solid rgba(52,211,153,.25);
          border-radius: 50px;
          background: rgba(9,46,32,.55);
          color: #75E8B6;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.1px;
          text-transform: uppercase;
          backdrop-filter: blur(12px);
        }

        .al-hero-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 12px var(--green);
        }

        .al-hero-title {
          max-width: 900px;
          margin: 28px 0 0;
          color: #F5F8F5;
          font-family: Manrope,sans-serif;
          font-size: clamp(49px,8vw,95px);
          font-weight: 800;
          letter-spacing: -4px;
          line-height: 1.04;
        }

        .al-hero-title span {
          color: #42DCA2;
        }

        .al-hero-quote {
          max-width: 570px;
          min-height: 55px;
          margin: 25px 0 0;
          color: rgba(241,248,243,.76);
          font-size: clamp(13px,1.5vw,16px);
          line-height: 1.9;
          transition: opacity .35s;
        }

        .al-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 13px;
          margin-top: 32px;
        }

        .al-hero-cta,
        .al-hero-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 51px;
          padding: 0 23px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: .25s;
        }

        .al-hero-cta {
          border: 1px solid transparent;
          background: linear-gradient(110deg,#34D399,#10B981);
          color: #05281B;
          box-shadow: 0 10px 35px rgba(16,185,129,.19);
        }

        .al-hero-cta:hover {
          transform: translateY(-4px);
          box-shadow: 0 17px 40px rgba(16,185,129,.3);
        }

        .al-hero-cta svg {
          transition: transform .2s;
        }

        .al-hero-cta:hover svg {
          transform: translateX(4px);
        }

        .al-hero-secondary {
          border: 1px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.06);
          color: white;
          backdrop-filter: blur(12px);
        }

        .al-hero-secondary:hover {
          transform: translateY(-3px);
          border-color: rgba(52,211,153,.55);
          background: rgba(52,211,153,.1);
        }

        .al-hero-bottom {
          position: absolute;
          right: max(35px,calc((100% - 1120px)/2));
          bottom: 42px;
          left: max(35px,calc((100% - 1120px)/2));
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .al-hero-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .al-hero-dot {
          width: 7px;
          height: 7px;
          padding: 0;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,.4);
          cursor: pointer;
          transition: .25s;
        }

        .al-hero-dot.active {
          width: 29px;
          background: var(--green);
          box-shadow: 0 0 10px rgba(52,211,153,.4);
        }

        .al-hero-counter {
          color: rgba(255,255,255,.6);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .al-hero-scroll {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,.6);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .al-hero-scroll-line {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg,var(--green),transparent);
        }

        /* NESTED ROUTES */

        .al-outlet {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          padding-top: 112px;
          animation: alFadeUp .45s ease both;
        }

        .al-user-home-content {
          position: relative;
          z-index: 1;
        }

        @keyframes alFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 760px) {
          .al-nav {
            top: 10px;
            width: calc(100% - 22px);
            min-height: 60px;
            padding: 8px 12px 8px 15px;
            border-radius: 16px;
          }

          .al-nav-links {
            display: none;
          }

          .al-menu-btn {
            display: grid;
          }

          .al-profile-text,
          .al-profile-trigger > .al-chevron {
            display: none;
          }

          .al-mobile-panel {
            position: absolute;
            display: block;
            top: calc(100% + 10px);
            left: 0;
            width: 100%;
            padding: 10px;
            border: 1px solid var(--line);
            border-radius: 15px;
            background: #111A1D;
            box-shadow: 0 20px 50px rgba(0,0,0,.45);
            animation: alDropdownEnter .2s ease both;
          }

          .al-admin-root {
            padding: 105px 17px 45px;
          }

          .al-admin-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .al-admin-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .al-hero-content {
            padding: 125px 24px 150px;
          }

          .al-hero-title {
            letter-spacing: -2px;
          }

          .al-hero-bottom {
            right: 24px;
            left: 24px;
          }

          .al-outlet {
            padding-top: 90px;
          }
        }

        @media (max-width: 480px) {
          .al-logo {
            font-size: 22px;
          }

          .al-avatar {
            width: 37px;
            height: 37px;
          }

          .al-menu-btn {
            width: 37px;
            height: 37px;
          }

          .al-dropdown {
            position: fixed;
            top: 73px;
            right: 11px;
            width: min(290px,calc(100vw - 22px));
          }

          .al-admin-title {
            font-size: 39px;
          }

          .al-admin-grid {
            gap: 10px;
          }

          .al-admin-tile {
            min-height: 160px;
            padding: 17px;
          }

          .al-tile-icon {
            margin-bottom: 18px;
          }

          .al-tile-label {
            font-size: 12px;
          }

          .al-tile-desc {
            font-size: 9px;
          }

          .al-admin-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .al-hero-content {
            padding: 115px 20px 140px;
          }

          .al-hero-title {
            font-size: clamp(43px,12vw,59px);
          }

          .al-hero-quote {
            font-size: 13px;
          }

          .al-hero-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .al-hero-cta,
          .al-hero-secondary {
            width: 100%;
            max-width: 270px;
          }

          .al-hero-bottom {
            right: 20px;
            left: 20px;
          }

          .al-hero-scroll {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .al-root *,
          .al-root *::before,
          .al-root *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="al-root">
        <div className="al-grid-bg" />

        {/* ----------------------------------------
            ADMIN DASHBOARD
        ---------------------------------------- */}

        {isAdmin && isHome && (
          <main className="al-admin-root">
            <div className="al-admin-wrap">

              <div className="al-admin-header">
                <div>
                  <div className="al-admin-badge">
                    <span className="al-admin-dot" />
                    Administration workspace
                  </div>

                  <h1 className="al-admin-title">
                    Control <span>Center.</span>
                  </h1>

                  <p className="al-admin-sub">
                    Welcome back, {firstName}. Manage your
                    DWJD platform from one central workspace.
                  </p>
                </div>

                <div className="al-admin-user">
                  <Avatar user={user} />

                  <div>
                    <div className="al-admin-user-label">
                      Signed in as
                    </div>

                    <div className="al-admin-user-name">
                      {fullName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="al-admin-grid">
                {adminLinks.map((tile, index) => (
                  <button
                    type="button"
                    key={tile.path}
                    className="al-admin-tile"
                    style={{
                      "--tile-color": tile.color,
                      "--tile-bg": `${tile.color}12`,
                      "--tile-border": `${tile.color}35`,
                      animationDelay: `${index * 65}ms`,
                    }}
                    onClick={() => navigate(tile.path)}
                  >
                    <span className="al-tile-icon">
                      {tile.icon}
                    </span>

                    <span className="al-tile-label">
                      {tile.label}
                    </span>

                    <span className="al-tile-desc">
                      {tile.description}
                    </span>

                    <span className="al-tile-arrow">
                      <Icon name="arrow" size={17} />
                    </span>
                  </button>
                ))}
              </div>

              <div className="al-admin-bottom">
                <span className="al-admin-footnote">
                  DWJD · Administration workspace
                </span>

                <button
                  type="button"
                  className="al-logout-btn"
                  onClick={logout}
                >
                  <Icon name="logout" size={14} />
                  Sign out
                </button>
              </div>

            </div>
          </main>
        )}

        {/* ----------------------------------------
            USER / RIDER NAVBAR
        ---------------------------------------- */}

        {!isAdmin && (
          <nav
            className="al-nav"
            aria-label="Main navigation"
          >
            <div
              className="al-logo"
              onClick={() => goTo("/afterlogin")}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  goTo("/afterlogin");
                }
              }}
            >
              DW<span>JD</span>
              <span className="al-logo-mark" />
            </div>

            <div className="al-nav-links">
              {navigation.map((item) => {
                const active =
                  item.path === "/afterlogin"
                    ? isHome
                    : location.pathname === item.path;

                return (
                  <button
                    type="button"
                    key={item.path}
                    className={`al-nav-btn ${
                      active ? "active" : ""
                    }`}
                    onClick={() => goTo(item.path)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div
              className="al-nav-right"
              ref={menuRef}
            >
              {/* PROFILE */}

              <button
                type="button"
                className={`al-profile-trigger ${
                  menuOpen ? "open" : ""
                }`}
                onClick={() => {
                  setMenuOpen((previous) => !previous);
                  setMobileOpen(false);
                }}
                aria-expanded={menuOpen}
                aria-label="Open account menu"
              >
                <Avatar user={user} />

                <span className="al-profile-text">
                  <span className="al-profile-name">
                    {fullName}
                  </span>

                  <span className="al-profile-role">
                    {isRider
                      ? "Rider account"
                      : "Member account"}
                  </span>
                </span>

                {profileLoading ? (
                  <span className="al-profile-loading" />
                ) : (
                  <span className="al-chevron">
                    <Icon name="chevron" size={15} />
                  </span>
                )}
              </button>

              {/* MOBILE MENU BUTTON */}

              <button
                type="button"
                className="al-menu-btn"
                aria-label={
                  mobileOpen ? "Close menu" : "Open menu"
                }
                aria-expanded={mobileOpen}
                onClick={() => {
                  setMobileOpen((previous) => !previous);
                  setMenuOpen(false);
                }}
              >
                <Icon
                  name={mobileOpen ? "close" : "menu"}
                  size={19}
                />
              </button>

              {/* MOBILE NAVIGATION */}

              {mobileOpen && (
                <div className="al-mobile-panel">
                  <div className="al-menu-section">
                    Main navigation
                  </div>

                  {navigation.map((item) => (
                    <button
                      type="button"
                      key={item.path}
                      className="al-menu-item"
                      onClick={() => goTo(item.path)}
                    >
                      <span className="al-menu-icon">
                        {item.label === "Home"
                          ? "⌂"
                          : item.label === "About"
                            ? "◎"
                            : "✉"}
                      </span>

                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* ACCOUNT DROPDOWN */}

              {menuOpen && (
                <div className="al-dropdown">

                  <div className="al-dropdown-user">
                    <Avatar user={user} />

                    <div className="al-dropdown-user-info">
                      <div className="al-dropdown-name">
                        {fullName}
                      </div>

                      <div className="al-dropdown-email">
                        {email}
                      </div>
                    </div>
                  </div>

                  <div className="al-menu-section">
                    Main navigation
                  </div>

                  {navigation.map((item) => (
                    <button
                      type="button"
                      key={item.path}
                      className="al-menu-item"
                      onClick={() => goTo(item.path)}
                    >
                      <span className="al-menu-icon">
                        {item.label === "Home"
                          ? "⌂"
                          : item.label === "About"
                            ? "◎"
                            : "✉"}
                      </span>

                      {item.label}
                    </button>
                  ))}

                  <div className="al-menu-hr" />

                  <div className="al-menu-section">
                    {isRider
                      ? "Rider workspace"
                      : "My account"}
                  </div>

                  {(accountLinks[
                    isRider ? "rider" : "user"
                  ] || []).map((item) => (
                    <button
                      type="button"
                      key={item.path}
                      className="al-menu-item"
                      onClick={() => goTo(item.path)}
                    >
                      <span className="al-menu-icon">
                        {item.icon}
                      </span>

                      {item.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="al-menu-item"
                    onClick={() =>
                      goTo("/afterlogin/profile")
                    }
                  >
                    <span className="al-menu-icon">
                      <Icon name="user" size={15} />
                    </span>

                    My Profile
                  </button>

                  <div className="al-menu-hr" />

                  <button
                    type="button"
                    className="al-menu-item danger"
                    onClick={logout}
                  >
                    <span className="al-menu-icon">
                      <Icon name="logout" size={15} />
                    </span>

                    Sign out
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* ----------------------------------------
            USER / RIDER HOME
        ---------------------------------------- */}

        {!isAdmin && isHome && (
          <>
            <HomeHero
              onDonate={() =>
                navigate("/afterlogin/donate")
              }
              onAbout={() =>
                navigate("/afterlogin/about")
              }
            />

            <div className="al-user-home-content">
              <Home />
            </div>
          </>
        )}

        {/* ----------------------------------------
            NESTED ROUTES
        ---------------------------------------- */}

        {!isHome && (
          <div className="al-outlet">
            <Outlet />
          </div>
        )}

        {/* ----------------------------------------
            AI CHATBOT
        ---------------------------------------- */}

        {!isAdmin && <AI_Bot />}
      </div>
    </>
  );
}

// --------------------------------------------------
// HOME HERO CAROUSEL
// --------------------------------------------------

function HomeHero({ onDonate, onAbout }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const timeoutRef = useRef(null);

  const selectImage = useCallback((nextIndex) => {
    setVisible(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIndex(nextIndex);
      setVisible(true);
    }, 350);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      timeoutRef.current = setTimeout(() => {
        setIndex((current) =>
          (current + 1) % images.length
        );

        setVisible(true);
      }, 450);
    }, 5500);

    return () => {
      clearInterval(interval);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="al-hero">

      {images.map((src, imageIndex) => (
        <img
          key={src}
          src={src}
          alt=""
          loading={imageIndex === 0 ? "eager" : "lazy"}
          className={`al-hero-img ${
            imageIndex === index && visible
              ? "active"
              : ""
          }`}
        />
      ))}

      <div className="al-hero-overlay" />

      <div className="al-hero-content">

        <div className="al-hero-badge">
          <span className="al-hero-badge-dot" />
          Community food platform
        </div>

        <h1 className="al-hero-title">
          Don't Waste.
          <br />
          <span>Just Donate.</span>
        </h1>

        <p
          className="al-hero-quote"
          style={{
            opacity: visible ? 1 : 0,
          }}
        >
          "{quotes[index]}"
        </p>

        <div className="al-hero-actions">
          <button
            type="button"
            className="al-hero-cta"
            onClick={onDonate}
          >
            Make a donation
            <Icon name="arrow" size={16} />
          </button>

          <button
            type="button"
            className="al-hero-secondary"
            onClick={onAbout}
          >
            Discover DWJD
          </button>
        </div>
      </div>

      <div className="al-hero-bottom">

        <div className="al-hero-dots">
          {images.map((_, dotIndex) => (
            <button
              type="button"
              key={dotIndex}
              aria-label={`Show slide ${dotIndex + 1}`}
              aria-pressed={dotIndex === index}
              className={`al-hero-dot ${
                dotIndex === index ? "active" : ""
              }`}
              onClick={() => selectImage(dotIndex)}
            />
          ))}
        </div>

        <span className="al-hero-counter">
          {String(index + 1).padStart(2, "0")}
          {" / "}
          {String(images.length).padStart(2, "0")}
        </span>

        <div className="al-hero-scroll">
          <span className="al-hero-scroll-line" />
          SCROLL TO EXPLORE
        </div>

      </div>
    </section>
  );
}
