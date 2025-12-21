import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Hedder.css";

export default function Header({ user, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const navigate = useNavigate();

  // hide navbar before login
  if (!user) return null;

  const firstLetter =
    user?.user_name && typeof user.user_name === "string"
      ? user.user_name.charAt(0).toUpperCase()
      : "U";

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <header className="header">
        <h1
          className="logo"
          onClick={() => {
            setProfileOpen(false);
            setDonateOpen(false);
            navigate("/");
          }}
        >
          DWJD
        </h1>

        <nav className="nav">
          {/* ===== NAV LINKS ===== */}
          <span
            className="navLink"
            onClick={() => {
              setProfileOpen(false);
              setDonateOpen(false);
              navigate("/");
            }}
          >
            Home
          </span>

          <span
            className="navLink"
            onClick={() => {
              setProfileOpen(false);
              setDonateOpen(false);
              navigate("/about");
            }}
          >
            About
          </span>

          <span
            className="navLink"
            onClick={() => {
              setProfileOpen(false);
              setDonateOpen(false);
              navigate("/contact");
            }}
          >
            Contact
          </span>

          {/* ☰ DONATE BUTTON (USER ONLY) */}
          {user.user_type === "user" && (
            <span
              className="hamburger"
              onClick={() => {
                setDonateOpen(!donateOpen);
                setProfileOpen(false);
              }}
            >
              ☰
            </span>
          )}

          {/* ===== PROFILE MENU ===== */}
          <div className="menuWrapper">
            <div
              className="profileCircle"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setDonateOpen(false);
              }}
            >
              {firstLetter}
            </div>

            {profileOpen && (
              <div className="popupMenu profileMenu">
                <div className="popupUser">{user.user_name}</div>

                <div className="popupItem">My Profile</div>

                {user.user_type === "user" && (
                  <div className="popupItem">My Donations</div>
                )}

                {user.user_type === "rider" && (
                  <div className="popupItem">My Trips</div>
                )}

                <div
                  className="popupItem logout"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                    navigate("/login");
                  }}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ===== DONATE SLIDER ===== */}
      {donateOpen && (
        <div className="donateSlider">
          <div className="sliderHeader">
            <h3>Donate</h3>
            <span
              className="closeBtn"
              onClick={() => setDonateOpen(false)}
            >
              ✕
            </span>
          </div>

          <div className="sliderItem">🍱 Food</div>
          <div className="sliderItem">👕 Clothes</div>
          <div className="sliderItem">🥬 Vegetable Waste</div>

          <div className="sliderHeader">
            <h3>Other</h3>
          </div>

          <div className="sliderItem">📍 Nearby Locations</div>
        </div>
      )}
    </>
  );
}
