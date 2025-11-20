// import React, { useState, useEffect } from "react";
// import "./App.css";

// import Header from "./components/Header";
// import Landing from "./components/Landing";
// import Login from "./components/Login";
// import Signup from "./components/Signup";

// import Profile from "./components/profile";
// import MyDonations from "./components/donations";
// import MyTrips from "./components/mytrips";

// import Food from "./components/Food";
// import Trips from "./components/Trips";
// import VerifyPin from "./components/VerifyPin";

// export default function App() {
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [page, setPage] = useState("home");
//   const [currentUser, setCurrentUser] = useState(null);

//   useEffect(() => {
//     const stored = localStorage.getItem("user");
//     if (stored) {
//       const user = JSON.parse(stored);
//       setLoggedIn(true);
//       setCurrentUser(user);
//     }

//     const savedPage = sessionStorage.getItem("page");
//     if (savedPage) setPage(savedPage);
//   }, []);

//   const changePage = (p) => {
//     setPage(p);
//     sessionStorage.setItem("page", p);
//   };

//   // login success handler
//   const handleLoginSuccess = (user) => {
//     setLoggedIn(true);
//     setCurrentUser(user);
//     localStorage.setItem("user", JSON.stringify(user));
//     changePage("home");
//   };

//   // signup success handler → redirect to login
//   const handleSignup = (goTo) => {
//     if (goTo === "login") {
//       changePage("login");
//     }
//   };

//   // extract trip id from verify-pin#123
//   let tripId = null;
//   if (page.startsWith("verify-pin")) {
//     tripId = page.split("#")[1];
//   }

//   return (
//     <div className="pageWrapper">
//       <Header
//         loggedIn={loggedIn}
//         user={currentUser}
//         onHomeClick={() => changePage("home")}
//         onLoginClick={() => changePage("login")}
//         onSignupClick={() => changePage("signup")}
//         onProfileClick={() => changePage("profile")}
//         onDonationsClick={() => changePage("donations")}
//         onMyTripsClick={() => changePage("mytrips")}
//         onTripsClick={() => changePage("trips")}
//         onFoodClick={() => changePage("food")}
//       />

//       <main className="mainContent">

//         {/* Verify PIN page */}
//         {page.startsWith("verify-pin") && <VerifyPin tripId={tripId} />}

//         {/* Other pages */}
//         {!page.startsWith("verify-pin") && (
//           <>
//             {page === "home" && <Landing />}
//             {page === "login" && <Login onLogin={handleLoginSuccess} />}
//             {page === "signup" && <Signup onSignup={handleSignup} />}
//             {page === "profile" && <Profile user={currentUser} />}
//             {page === "donations" && <MyDonations user={currentUser} />}
//             {page === "mytrips" && <MyTrips user={currentUser} />}
//             {page === "food" && <Food user={currentUser} />}

//             {page === "trips" && <Trips setPage={changePage} />}
//           </>
//         )}

//       </main>
//     </div>
//   );
// }


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

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setLoggedIn(true);
      setCurrentUser(user);
    }

    const savedPage = sessionStorage.getItem("page");
    if (savedPage) setPage(savedPage);
  }, []);

  const changePage = (p) => {
    setPage(p);
    sessionStorage.setItem("page", p);
  };

  const handleLoginSuccess = (user) => {
    setLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    changePage("home");
  };

  return (
    <div className="pageWrapper">
      <Header
        loggedIn={loggedIn}
        user={currentUser}
        onHomeClick={() => changePage("home")}
        onLoginClick={() => changePage("login")}
        onSignupClick={() => changePage("signup")}
        onProfileClick={() => changePage("profile")}
        onDonationsClick={() => changePage("donations")}
        onMyTripsClick={() => changePage("mytrips")}
        onTripsClick={() => changePage("trips")}
        onFoodClick={() => changePage("food")}
        onClothesClick={() => changePage("clothes")}
      />

      <main className="mainContent">

        {/* VERIFY PIN PAGE */}
        {page.startsWith("verify-pin#") && (
          <VerifyPin tripId={page.split("#")[1]} />
        )}

        {/* ALL OTHER PAGES */}
        {!page.startsWith("verify-pin#") && (
          <>
            {page === "home" && <Landing />}
            {page === "login" && <Login onLogin={handleLoginSuccess} />}
            {page === "signup" && <Signup onSignup={changePage} />}
            {page === "profile" && <Profile user={currentUser} />}
            {page === "donations" && <MyDonations user={currentUser} />}
            {page === "mytrips" && <MyTrips user={currentUser} />}
            {page === "food" && <Food user={currentUser} />}
            {page === "clothes" && <Clothes user={currentUser} />}
            {page === "trips" && <Trips setPage={changePage} />}
          </>
        )}

      </main>
    </div>
  );
}
