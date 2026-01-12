import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import OpeningPage from "./Opening_page";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";

import Afterlogin from "./pages/Afterlogin";

// Navbar pages
import Home from "./pages/Navbar/Home";
import About from "./pages/Navbar/About";
import Contact from "./pages/Navbar/Contact";

// Profile
import Myprofile from "./pages/Navbar/Profile/Myprofile";
import Edit from "./pages/Navbar/Profile/Edit";

// Donate pages
import DonationsType from "./pages/Navbar/Donate/Donations_Type";
import Food from "./pages/Navbar/Donate/Food";
import Cloths from "./pages/Navbar/Donate/Cloths"; // spelling must match file
import Other from "./pages/Navbar/Donate/Other";
import MyRequests from "./pages/Navbar/Donate/my_requests";
import UsersRequests from "./pages/Navbar/Pickup/Users_requests";
import Direction from "./pages/Navbar/Pickup/Direction";
import DonateOtpVerify from "./pages/Navbar/Pickup/Donate_otp_verify";
import MyRides from "./pages/Navbar/Pickup/My_rides";
export default function App() {
  const [email, setEmail] = useState(null);

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<OpeningPage />} />
      <Route path="/signup" element={<Signup setEmail={setEmail} />} />
      <Route path="/verify-otp" element={<VerifyOtp email={email} />} />
      <Route path="/login" element={<Login />} />

      {/* AFTER LOGIN LAYOUT */}
      <Route path="/afterlogin" element={<Afterlogin />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />

        {/* PROFILE */}
        <Route path="profile" element={<Myprofile />} />
        <Route path="profile/edit" element={<Edit />} />

        {/* DONATE */}
        <Route path="donate" element={<DonationsType />} />
        <Route path="donate/food" element={<Food />} />
        <Route path="donate/clothes" element={<Cloths />} />
        <Route path="donate/other" element={<Other />} />
        <Route path="donate/request" element={<MyRequests />} />
        {/* PICKUP*/}
        <Route path="pickup/requests" element={<UsersRequests />} />
        <Route path="pickup/direction" element={<Direction />} />
        <Route path="pickup/verify" element={<DonateOtpVerify />} />
        <Route path="pickup/Deliveries" element={<MyRides /> } />
      </Route>
    </Routes>
  );
}
