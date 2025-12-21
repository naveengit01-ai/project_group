import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/signup.css";

// const BASE_URL = "http://localhost:10000";
const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    ph_no: "",
    user_name: "",
    password: "",
    user_type: ""
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= TIMER ================= */
  useEffect(() => {
    if (step !== 2 || timer === 0) return;

    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, step]);

  /* ================= SIGNUP ================= */
  const signup = async e => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      credentials: "include",
      body: fd
    });

    const data = await res.json();

    if (data.status === "success") {
      setStep(2);
      setTimer(30);
      setCanResend(false);
    } else {
      alert(data.status);
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    const res = await fetch(`${BASE_URL}/verify-signup-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: form.user_name,
        otp
      })
    });

    const data = await res.json();
    if (data.status === "verified") {
      alert("Account verified");
      navigate("/login");
    } else {
      alert(data.status);
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtp = async () => {
    const res = await fetch(`${BASE_URL}/resend-signup-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name: form.user_name })
    });

    const data = await res.json();
    if (data.status === "resent") {
      setTimer(30);
      setCanResend(false);
    }
  };

  useEffect(() => {
    if (timer === 0) setCanResend(true);
  }, [timer]);

  return (
    <div className="signup-page">
      {step === 1 && (
        <form onSubmit={signup}>
          <input name="firstname" placeholder="First Name" onChange={handleChange} required />
          <input name="lastname" placeholder="Last Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input name="ph_no" placeholder="Phone" onChange={handleChange} />
          <input name="user_name" placeholder="Username" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          <select name="user_type" onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="rider">Rider</option>
          </select>

          <button>Signup</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <input placeholder="Enter OTP" onChange={e => setOtp(e.target.value)} />
          <button onClick={verifyOtp}>Verify OTP</button>

          {!canResend ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <button onClick={resendOtp}>Resend OTP</button>
          )}
        </div>
      )}
    </div>
  );
}
