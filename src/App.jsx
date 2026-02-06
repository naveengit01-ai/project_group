import { Routes, Route, Navigate } from "react-router-dom";
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

// Donate
import DonationsType from "./pages/Navbar/Donate/Donations_Type";
import Food from "./pages/Navbar/Donate/Food";
import Cloths from "./pages/Navbar/Donate/Cloths";
import Other from "./pages/Navbar/Donate/Other";
import MyRequests from "./pages/Navbar/Donate/my_requests";
import NearbyOrphanages from "./pages/Navbar/Donate/Near_orphanages";

// Pickup
import UsersRequests from "./pages/Navbar/Pickup/Users_requests";
import Direction from "./pages/Navbar/Pickup/Direction";
import DonateOtpVerify from "./pages/Navbar/Pickup/Donate_otp_verify";
import MyRides from "./pages/Navbar/Pickup/My_rides";
import Delivery from "./pages/Navbar/Pickup/Delivery";

// Admin
import Over_All from "./advertisement/Over_All";
import Add_Pramotions from "./advertisement/Add_Pramotion";
import AddJob from "./advertisement/Add_job";
import Notifications from "./advertisement/Notifications";

// 🔔 Notification sub-pages (FIXED)
import Accept from "./advertisement/Notifications_Mange/Accept";
import Reject from "./advertisement/Notifications_Mange/Reject";
import InterviewResult from "./advertisement/Notifications_Mange/Interview_result";

// Career (Public)
import Career from "./Career";

// Auth helpers
import ProtectedRoute from "./hooks/ProtectedRoute";
import { isLoggedIn } from "./hooks/useAuth";
import AddEmploye from "./advertisement/Interview_result/Add_Employe";

export default function App() {
  const [email, setEmail] = useState(null);

  return (
    <Routes>

      {/* ================= ROOT ================= */}
      <Route
        path="/"
        element={
          isLoggedIn() ? (
            <Navigate to="/afterlogin" replace />
          ) : (
            <OpeningPage />
          )
        }
      />

      {/* ================= PUBLIC ================= */}
      <Route path="/signup" element={<Signup setEmail={setEmail} />} />
      <Route path="/verify-otp" element={<VerifyOtp email={email} />} />

      <Route
        path="/login"
        element={
          isLoggedIn() ? (
            <Navigate to="/afterlogin" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* 🌍 CAREER */}
      <Route path="/career" element={<Career />} />

      {/* ================= PROTECTED ================= */}
      <Route
        path="/afterlogin"
        element={
          <ProtectedRoute>
            <Afterlogin />
          </ProtectedRoute>
        }
      >
        {/* HOME */}
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />

        {/* ================= ADMIN ================= */}
        <Route path="overall" element={<Over_All />} />
        <Route path="promotions" element={<Add_Pramotions />} />
        <Route path="add-job" element={<AddJob />} />

        {/* 🔔 NOTIFICATIONS (FIXED ROUTES) */}
        <Route path="notifications" element={<Notifications />} />
        <Route path="notifications/accept/:id" element={<Accept />} />
        <Route path="notifications/reject/:id" element={<Reject />} />
        <Route path="notifications/result/:id" element={<InterviewResult />} />
        <Route path="notifications/add-employee/:id" element={<AddEmploye />} />
        {/* ================= PROFILE ================= */}
        <Route path="profile" element={<Myprofile />} />
        <Route path="profile/edit" element={<Edit />} />

        {/* ================= DONATE ================= */}
        <Route path="donate" element={<DonationsType />} />
        <Route path="donate/food" element={<Food />} />
        <Route path="donate/clothes" element={<Cloths />} />
        <Route path="donate/other" element={<Other />} />
        <Route path="donate/request" element={<MyRequests />} />
        <Route path="donate/nearorphanages" element={<NearbyOrphanages />} />

        {/* ================= PICKUP ================= */}
        <Route path="pickup/requests" element={<UsersRequests />} />
        <Route path="pickup/direction" element={<Direction />} />
        <Route path="pickup/verify" element={<DonateOtpVerify />} />
        <Route path="pickup/my-rides" element={<MyRides />} />
        <Route path="pickup/delivery" element={<Delivery />} />
      </Route>

    </Routes>
  );
}
