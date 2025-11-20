import React, { useState, useEffect } from "react";
import "./styles/Hedder.css";

export default function Header({
  loggedIn,
  user,
  onLoginClick,
  onSignupClick,
  onHomeClick,
  onProfileClick,
  onDonationsClick,
  onMyTripsClick,
  onTripsClick,
  onFoodClick,
  onClothesClick,   // <-- corrected spelling
  onOthersClick
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    if (user) setUserType(user.user_type);
  }, [user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDonate = () => setDonateOpen(!donateOpen);
  const closeSidebarOnClick = () => setDonateOpen(false);

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
            <button className="btn loginBtn" onClick={onLoginClick}>Login</button>
            <button className="btn signupBtn" onClick={onSignupClick}>Signup</button>
          </nav>
        ) : (
          <nav className="nav">
            <a className="link" onClick={onHomeClick}>Home</a>
            <a className="link">About</a>
            <a className="link">Contact</a>

            {/* USER DONATE BUTTON */}
            {userType === "user" && (
              <button className="donateBtn" onClick={toggleDonate}>Donate</button>
            )}

            {/* RIDER BUTTONS */}
            {userType === "rider" && (
              <>
                <button className="donateBtn" onClick={onTripsClick}>
                  Trips
                </button>

                <div className="notifBell" onClick={onMyTripsClick}>
                  🔔 <span className="badge"></span>
                </div>
              </>
            )}

            <div className="profileWrapper">
              <div className="profileCircle" onClick={toggleMenu}>
                {user?.firstname?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdownItem" onClick={onProfileClick}>
                    My Profile
                  </div>

                  {userType === "user" && (
                    <div className="dropdownItem" onClick={onDonationsClick}>
                      My Donations
                    </div>
                  )}

                  {userType === "rider" && (
                    <div className="dropdownItem" onClick={onMyTripsClick}>
                      My Trips
                    </div>
                  )}

                  <div className="dropdownItem" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* DONATION SIDEBAR FOR USER */}
      {userType === "user" && (
        <>
          {donateOpen && <div className="overlayBG" onClick={closeSidebarOnClick}></div>}

          <div className={`sidebar ${donateOpen ? "sidebar-open" : ""}`}>
            <h3 className="sidebarTitle">Choose Donation</h3>

            <div className="sidebarItem" onClick={onFoodClick}>Food</div>
            <div className="sidebarItem" onClick={onClothesClick}>Clothes</div> {/* FIXED */}
            <div className="sidebarItem" onClick={onOthersClick}>Others</div>
          </div>
        </>
      )}
    </>
  );
}
