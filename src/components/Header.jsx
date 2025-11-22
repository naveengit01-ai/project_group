import React, { useState, useEffect } from "react";
import "./styles/Hedder.css";

export default function Header({
  loggedIn,
  user,
  page,
  setPage,
  onSignupClick,
  onHomeClick,
  onProfileClick,
  onDonationsClick,
  onMyTripsClick,
  onTripsClick,
  onFoodClick,
  onClothesClick,
  onOthersClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    if (user) setUserType(user.user_type);
  }, [user]);

  // PROFILE toggle
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // DONATE toggle
  const toggleDonate = () => setDonateOpen(!donateOpen);
  const closeDonate = () => setDonateOpen(false);

  // LOGIN toggle
  const toggleLogin = () => {
    if (page === "login") setPage("home");
    else setPage("login");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <>
      <header className="header">
        <h1 className="logo" onClick={onHomeClick}>DWJD</h1>

        {!loggedIn ? (
          <nav className="nav">
            <button className="btn loginBtn" onClick={toggleLogin}>
              Login
            </button>

            <button className="btn signupBtn" onClick={onSignupClick}>
              Signup
            </button>
          </nav>
        ) : (
          <nav className="nav">

            {/* STATIC LINKS */}
            <a className="link" onClick={onHomeClick}>Home</a>
            <a className="link">About</a>
            <a className="link">Contact</a>

            {/* USER DONATE BUTTON */}
            {userType === "user" && (
              <button className="donateBtn" onClick={toggleDonate}>
                Donate
              </button>
            )}

            {/* RIDER BUTTONS */}
            {userType === "rider" && (
              <>
                <button className="donateBtn" onClick={onTripsClick}>Trips</button>
                <div className="notifBell" onClick={onMyTripsClick}>🔔</div>
              </>
            )}

            {/* PROFILE ICON */}
            <div className="profileWrapper">
              <div className="profileCircle" onClick={toggleMenu}>
                {user?.firstname?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* PROFILE DROPDOWN */}
              {menuOpen && (
                <div className="dropdown">

                  <div
                    className="dropdownItem"
                    onClick={() => {
                      closeMenu();
                      onProfileClick();
                    }}
                  >
                    My Profile
                  </div>

                  {userType === "user" && (
                    <div
                      className="dropdownItem"
                      onClick={() => {
                        closeMenu();
                        onDonationsClick();
                      }}
                    >
                      My Donations
                    </div>
                  )}

                  {userType === "rider" && (
                    <div
                      className="dropdownItem"
                      onClick={() => {
                        closeMenu();
                        onMyTripsClick();
                      }}
                    >
                      My Trips
                    </div>
                  )}

                  <div
                    className="dropdownItem"
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                  >
                    Logout
                  </div>

                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* DONATION SIDEBAR */}
      {userType === "user" && donateOpen && (
        <div className="sidebar">
          <h3 className="sidebarTitle">Choose Donation</h3>

          <div
            className="sidebarItem"
            onClick={() => {
              closeDonate();
              onFoodClick();
            }}
          >
            Food
          </div>

          <div
            className="sidebarItem"
            onClick={() => {
              closeDonate();
              onClothesClick();
            }}
          >
            Clothes
          </div>

          <div
            className="sidebarItem"
            onClick={() => {
              closeDonate();
              onOthersClick();
            }}
          >
            Others
          </div>
        </div>
      )}
    </>
  );
}
