// import React from "react";
// import "./styles/profile.css";

// export default function Profile() {
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!user) return <h2>Please Login</h2>;

//   return (
//     <div className="profile-container">
//       <h1>My Profile</h1>

//       <div className="profile-card">
//         <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
//         <p><strong>Email:</strong> {user.email}</p>
//         <p><strong>Phone:</strong> {user.ph_no}</p>
//         <p><strong>Address:</strong> {user.address}</p>
//         <p><strong>Username:</strong> {user.user_name}</p>
//         <p><strong>Role:</strong> {user.user_type}</p>
//       </div>
//     </div>
//   );
// }

import React from "react";
import "./styles/profile.css";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <h2>Please Login</h2>;

  // photo URL (if stored in backend)
  const photoURL = user.profile_photo
    ? `http://localhost:5000${user.profile_photo}`
    : "https://via.placeholder.com/150"; // default image

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-card">

        {/* PROFILE PHOTO */}
        <img
          src={photoURL}
          alt="Profile"
          className="profile-photo"
        />

        <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.ph_no}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>Username:</strong> {user.user_name}</p>
        <p><strong>Role:</strong> {user.user_type}</p>
      </div>
    </div>
  );
}
