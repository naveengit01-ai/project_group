// import React, { useState } from "react";
// import "./styles/opt.css";

// export default function VerifyPin({ tripId }) {
//   const [pin, setPin] = useState("");
//   const [message, setMessage] = useState("");

//   const handleVerify = async () => {
//     const rider = JSON.parse(localStorage.getItem("user"));
//     if (!rider) return alert("Please login first!");

//     if (pin.trim() === "") {
//       alert("Enter PIN!");
//       return;
//     }

//     const res = await fetch("http://localhost:5000/verify-pin", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         trip_id: tripId,
//         rider_id: rider.id,
//         pin: pin,
//       }),
//     });

//     const data = await res.json();
//     console.log("Pin Verify Response:", data);

//     if (data.status === "success") {
//       setMessage("PIN Verified ✔ Trip Completed!");
//       setTimeout(() => {
//         window.location.href = "/mytrips";
//       }, 1500);
//     } else if (data.status === "invalid") {
//       setMessage("❌ Wrong PIN. Try again.");
//     } else if (data.status === "expired") {
//       setMessage("⚠ PIN expired. Ask user to regenerate.");
//     } else if (data.status === "not_allowed") {
//       setMessage("❌ This trip is not assigned to you.");
//     } else {
//       setMessage("Something went wrong!");
//     }
//   };

//   if (!tripId) return <h2>Loading Trip…</h2>;

//   return (
//     <div className="verify-container">
//       <div className="verify-card">
//         <h1>Verify Pickup PIN</h1>

//         <p className="trip-id">Trip ID: {tripId}</p>

//         <input
//           type="text"
//           className="pin-input"
//           placeholder="Enter 6-digit PIN"
//           value={pin}
//           onChange={(e) => setPin(e.target.value)}
//           maxLength={6}
//         />

//         <button className="verify-btn" onClick={handleVerify}>
//           Verify PIN
//         </button>

//         {message && <p className="verify-message">{message}</p>}
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import "./styles/otp.css";

export default function VerifyPin({ tripId }) {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    const rider = JSON.parse(localStorage.getItem("user"));
    if (!rider) return alert("Please login first!");

    if (pin.trim() === "") return alert("Enter PIN!");

    const res = await fetch("https://back-end-project-group.onrender.com/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        rider_id: rider.id,
        pin: pin,
      }),
    });

    const data = await res.json();

    if (data.status === "success") {
      setMessage("PIN Verified ✔ Trip Completed!");

      // Tell the donor "ok give food"
      localStorage.setItem("rider_verified", "done");

      setTimeout(() => {
        window.location.href = "/mytrips";
      }, 1500);
    } else if (data.status === "invalid") {
      setMessage("❌ Wrong PIN.");
    } else if (data.status === "expired") {
      setMessage("⚠ PIN expired.");
    } else if (data.status === "not_allowed") {
      setMessage("❌ Not your trip.");
    } else {
      setMessage("Error verifying PIN");
    }
  };

  if (!tripId) return <h2>Loading...</h2>;

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1>Verify Pickup PIN</h1>

        <p className="trip-id">Trip ID: {tripId}</p>

        <input
          type="text"
          className="pin-input"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={6}
        />

        <button className="verify-btn" onClick={handleVerify}>
          Verify PIN
        </button>

        {message && <p className="verify-message">{message}</p>}
      </div>
    </div>
  );
}
