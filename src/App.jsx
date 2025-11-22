import React, { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/Header";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/profile";
import MyDonations from "./components/donations";
import MyTrips from "./components/mytrips";
import Food from "./components/Food";
import Clothes from "./components/Cloths";
import Trips from "./components/Trips";
import VerifyPin from "./components/VerifyPin";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);

  // Load user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setLoggedIn(true);
      setCurrentUser(JSON.parse(stored));
    }

    // Restore verify-pin with tripId if needed
    const storedPage = sessionStorage.getItem("page");
    if (storedPage) {
      setPage(storedPage);
    }
  }, []);

  // Keep page saved in session
  useEffect(() => {
    sessionStorage.setItem("page", page);
  }, [page]);

  const handleLoginSuccess = (user) => {
    setLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    setPage("home");
  };

  return (
    <div className="pageWrapper">
      <Header
        loggedIn={loggedIn}
        user={currentUser}
        page={page}
        setPage={setPage}
        onSignupClick={() => setPage("signup")}
        onHomeClick={() => setPage("home")}
        onProfileClick={() => setPage("profile")}
        onDonationsClick={() => setPage("donations")}
        onMyTripsClick={() => setPage("mytrips")}
        onTripsClick={() => setPage("trips")}
        onFoodClick={() => setPage("food")}
        onClothesClick={() => setPage("clothes")}
      />

      <main className="mainContent">
        {page === "home" && <Landing />}
        {page === "login" && <Login onLogin={handleLoginSuccess} />}
        {page === "signup" && <Signup onSignup={setPage} />}
        {page === "profile" && <Profile user={currentUser} />}
        {page === "donations" && <MyDonations user={currentUser} />}
        {page === "mytrips" && <MyTrips user={currentUser} />}

        {/* IMPORTANT — pass setPage here */}
        {page === "food" && <Food user={currentUser} setPage={setPage} />}

        {/* IMPORTANT — pass setPage here for clothes too */}
        {page === "clothes" && <Clothes user={currentUser} setPage={setPage} />}

        {page === "trips" && <Trips setPage={setPage} />}

        {/* VERIFY PIN PAGE — parse tripId */}
        {page.startsWith("verify-pin") && (
          <VerifyPin tripId={page.split("#")[1]} />
        )}
      </main>
    </div>
  );
}
