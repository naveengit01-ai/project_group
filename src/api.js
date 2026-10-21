// ============================================
// BASE URL
// ============================================

// Local development:
// const BASE_URL = "http://localhost:5000";

// Production backend:
export const BASE_URL =
  "https://back-end-project-group.onrender.com";


// ============================================
// SIGNUP
// ============================================

export async function signup(data) {
  const isFormData = data instanceof FormData;

  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",

    // JSON for existing callers; FormData for image uploads.
    ...(isFormData
      ? {}
      : {
          headers: {
            "Content-Type": "application/json",
          },
        }),

    body: isFormData ? data : JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    const error = new Error(
      result.message || result.status || "Signup failed."
    );

    error.status = result.status;

    throw error;
  }

  return result;
}


// ============================================
// VERIFY OTP
// ============================================

export async function verifyOtp(data) {
  const res = await fetch(`${BASE_URL}/verify-otp`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  return res.json();
}


// ============================================
// RESEND OTP
// ============================================

export async function resendOtp(data) {
  const res = await fetch(`${BASE_URL}/resend-otp`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  return res.json();
}