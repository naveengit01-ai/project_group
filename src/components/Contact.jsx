import React from "react";
import "./styles/Landing.css";

export default function Contact() {
  return (
    <div className="page">
      <div className="pageContent">
      <h1>Contact Us</h1>

      <p>If you have questions or suggestions, reach us at:</p>

      <div className="contact-box">
        <p><strong>Email:</strong> support@dwjd.com</p>
        <p><strong>Phone:</strong> +91 98765 43210</p>
        <p><strong>Location:</strong> India</p>
      </div>
      </div>
    </div>
  );
}
