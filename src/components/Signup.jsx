// // import React, { useState } from "react";
// // import "./styles/Signup.css";

// // export default function Signup({ onSignup }) {
// //   const [form, setForm] = useState({
// //     firstname: "",
// //     lastname: "",
// //     address: "",
// //     email: "",
// //     ph_no: "",
// //     profile_photo: "",
// //     user_name: "",
// //     password: "",
// //     user_type: "",
// //   });

// //   const handleChange = (e) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     // check empty fields
// //     for (let key in form) {
// //       if (form[key].trim() === "") {
// //         alert(`${key} cannot be empty`);
// //         return;
// //       }
// //     }

// //     const res = await fetch("http://localhost:5000/signup", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         ...form,
// //         ph_no: String(form.ph_no),
// //       }),
// //     });

// //     const data = await res.json();

// //     if (data.status === "success") {
// //       alert("Signup successful!");
// //       onSignup();
// //     } else if (data.status === "exists") {
// //       alert("Username already exists!");
// //     } else {
// //       alert("Something went wrong: " + data.message);
// //     }
// //   };

// //   return (
// //     <div className="signup-container">
// //       <form className="signup-form" onSubmit={handleSubmit}>
// //         <h2 className="signup-title">Signup</h2>

// //         <input name="firstname" placeholder="First Name" onChange={handleChange} className="signup-input" />
// //         <input name="lastname" placeholder="Last Name" onChange={handleChange} className="signup-input" />
// //         <input name="address" placeholder="Address" onChange={handleChange} className="signup-input" />
// //         <input name="email" placeholder="Email" onChange={handleChange} className="signup-input" />

// //         <input
// //           name="ph_no"
// //           type="number"
// //           placeholder="Phone Number"
// //           onChange={handleChange}
// //           className="signup-input"
// //         />

// //         <input name="profile_photo" placeholder="Profile Photo URL" onChange={handleChange} className="signup-input" />
// //         <input name="user_name" placeholder="Username" onChange={handleChange} className="signup-input" />
// //         <input name="password" type="password" placeholder="Password" onChange={handleChange} className="signup-input" />

// //         {/* USER TYPE */}
// //         <select name="user_type" className="signup-input" onChange={handleChange}>
// //           <option value="">Select Role</option>
// //           <option value="user">User</option>
// //           <option value="rider">Rider</option>
// //         </select>

// //         <button className="signup-btn">Signup</button>
// //       </form>
// //     </div>
// //   );
// // }

// import React, { useState } from "react";
// import "./styles/Signup.css";

// export default function Signup({ onSignup }) {
//   const [form, setForm] = useState({
//     firstname: "",
//     lastname: "",
//     address: "",
//     email: "",
//     ph_no: "",
//     profile_photo: "",
//     user_name: "",
//     password: "",
//     user_type: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // check empty fields
//     for (let key in form) {
//       if (form[key].trim() === "") {
//         alert(`${key} cannot be empty`);
//         return;
//       }
//     }

//     const res = await fetch("http://localhost:5000/signup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         ...form,
//         ph_no: String(form.ph_no),
//       }),
//     });

//     const data = await res.json();

//     if (data.status === "success") {
//       alert("Signup successful!");
//       onSignup("login");  // redirect to login page
//     } else if (data.status === "exists") {
//       alert("Username already exists!");
//     } else {
//       alert("Something went wrong: " + (data.message || "Server error"));
//     }
//   };

//   return (
//     <div className="signup-container">
//       <form className="signup-form" onSubmit={handleSubmit}>
//         <h2 className="signup-title">Signup</h2>

//         <input name="firstname" placeholder="First Name" onChange={handleChange} className="signup-input" />
//         <input name="lastname" placeholder="Last Name" onChange={handleChange} className="signup-input" />
//         <input name="address" placeholder="Address" onChange={handleChange} className="signup-input" />
//         <input name="email" placeholder="Email" onChange={handleChange} className="signup-input" />

//         <input
//           name="ph_no"
//           type="number"
//           placeholder="Phone Number"
//           onChange={handleChange}
//           className="signup-input"
//         />

//         <input name="profile_photo" placeholder="Profile Photo URL" onChange={handleChange} className="signup-input" />
//         <input name="user_name" placeholder="Username" onChange={handleChange} className="signup-input" />
//         <input name="password" type="password" placeholder="Password" onChange={handleChange} className="signup-input" />

//         {/* USER TYPE */}
//         <select name="user_type" className="signup-input" onChange={handleChange}>
//           <option value="">Select Role</option>
//           <option value="user">User</option>
//           <option value="rider">Rider</option>
//         </select>

//         <button className="signup-btn">Signup</button>
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
import "./styles/Signup.css";

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    address: "",
    email: "",
    ph_no: "",
    user_name: "",
    password: "",
    user_type: "",
  });

  const [photoFile, setPhotoFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate empty fields
    for (let key in form) {
      if (form[key].trim() === "") {
        alert(`${key} cannot be empty`);
        return;
      }
    }

    if (!photoFile) {
      alert("Profile photo is required!");
      return;
    }

    // Create FormData for file + text
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }
    formData.append("profile_photo", photoFile);

    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      body: formData,  // IMPORTANT: no headers
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Signup successful!");
      onSignup("login"); // redirect to login page
    } else if (data.status === "exists") {
      alert("Username already exists!");
    } else {
      alert("Something went wrong: " + (data.message || "Server error"));
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Signup</h2>

        <input name="firstname" placeholder="First Name" onChange={handleChange} className="signup-input" />
        <input name="lastname" placeholder="Last Name" onChange={handleChange} className="signup-input" />
        <input name="address" placeholder="Address" onChange={handleChange} className="signup-input" />
        <input name="email" placeholder="Email" onChange={handleChange} className="signup-input" />

        <input
          name="ph_no"
          type="number"
          placeholder="Phone Number"
          onChange={handleChange}
          className="signup-input"
        />

        {/* FILE UPLOAD FIELD */}
        <input
          type="file"
          name="profile_photo"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
          className="signup-input"
        />

        <input name="user_name" placeholder="Username" onChange={handleChange} className="signup-input" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="signup-input" />

        <select name="user_type" className="signup-input" onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="rider">Rider</option>
        </select>

        <button className="signup-btn">Signup</button>
      </form>
    </div>
  );
}
