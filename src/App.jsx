import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Landing from "./components/Landing";
import About from "./components/About";
import Contact from "./components/Contact";
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogin = (data) => {
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        {/* Protected routes */}
        <Route
          path="/"
          element={user ? <Landing /> : <Navigate to="/login" />}
        />
        <Route
          path="/about"
          element={user ? <About /> : <Navigate to="/login" />}
        />
        <Route
          path="/contact"
          element={user ? <Contact /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}
