
// ============================================
// BASE URL
// ============================================

// Local development:
// export const BASE_URL = "http://localhost:5000";

// Production backend:
export const BASE_URL =
  "https://back-end-project-group.onrender.com";


// ============================================
// COMMON API RESPONSE HANDLER
// ============================================

async function handleResponse(res) {
  let result;

  try {
    result = await res.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!res.ok) {
    const error = new Error(
      result.message || result.status || "Something went wrong."
    );

    error.status = result.status;
    error.httpStatus = res.status;

    throw error;
  }

  return result;
}


// ============================================
// SIGNUP
// ============================================

export async function signup(data) {
  const isFormData = data instanceof FormData;

  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",

    ...(isFormData
      ? {}
      : {
          headers: {
            "Content-Type": "application/json",
          },
        }),

    body: isFormData ? data : JSON.stringify(data),
  });

  return handleResponse(res);
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

  return handleResponse(res);
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

  return handleResponse(res);
}


// ============================================
// GOOGLE OAUTH - EXCHANGE LOGIN CODE
// POST /auth/google/exchange
// ============================================

export async function googleAuthExchange(code) {
  if (!code || typeof code !== "string") {
    throw new Error("Google authentication code is missing.");
  }

  const res = await fetch(
    `${BASE_URL}/auth/google/exchange`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }),
    }
  );

  return handleResponse(res);
}


// ============================================
// RIDER APPLICATION
// POST /rider/request-account
// Uses the existing logged-in User account
// ============================================

export async function requestRiderAccount(data = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before requesting rider access.");
  }

  const res = await fetch(`${BASE_URL}/rider/request-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}
