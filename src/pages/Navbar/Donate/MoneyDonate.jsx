
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Gift,
  Heart,
  IndianRupee,
  LoaderCircle,
  Mail,
  PartyPopper,
  Phone,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Wallet,
  X,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://back-end-project-group.onrender.com"
).replace(/\/$/, "");

const INITIAL_FORM = {
  occasionType: "Birthday",
  occasionTitle: "",
  occasionDate: "",
  scheduledWishTime: "09:00",
  recipientName: "",
  recipientEmail: "",
  recipientPhone: "",
  dedicationName: "",
  amount: "",
  donorMessage: "",
  recipientContactConsent: false,
  termsAccepted: false,
};

const OCCASIONS = [
  { name: "Birthday", emoji: "🎂" },
  { name: "Wedding", emoji: "💍" },
  { name: "Wedding Anniversary", emoji: "❤️" },
  { name: "Engagement", emoji: "💐" },
  { name: "Graduation", emoji: "🎓" },
  { name: "New Job", emoji: "💼" },
  { name: "Promotion", emoji: "🚀" },
  { name: "Baby Shower", emoji: "👶" },
  { name: "Newborn / Naming Ceremony", emoji: "🍼" },
  { name: "Housewarming", emoji: "🏡" },
  { name: "Retirement", emoji: "🌟" },
  { name: "Festival", emoji: "🎉" },
  { name: "Memorial / In Loving Memory", emoji: "🕊️" },
  { name: "Get Well Soon", emoji: "🌻" },
  { name: "Thank You", emoji: "🙏" },
  { name: "Just Because", emoji: "💚" },
  { name: "Other", emoji: "✨" },
];

const AMOUNTS = [101, 251, 501, 1001, 2001];

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10";

function SectionHeading({ number, title, subtitle }) {
  return (
    <div className="mb-6 flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-bold text-emerald-400">
        {number}
      </div>

      <div>
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-emerald-400">*</span>
        )}
      </span>
      {children}
    </label>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-[#0e121c] p-5 shadow-xl shadow-black/10 sm:p-7 ${className}`}
    >
      {children}
    </section>
  );
}

async function readResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `The server returned an unexpected response (${response.status}).`
    );
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status}).`
    );
  }

  return data;
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function getTodayString() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function MoneyDonate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef([]);
  const checkoutRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [razorpayKey, setRazorpayKey] = useState("");
  const [keyLoading, setKeyLoading] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Retain an unpaid donation ID when checkout is dismissed or fails.
  const [pendingDonationId, setPendingDonationId] = useState(null);

  const today = getTodayString();

  // --------------------------------------------------
  // LOAD PUBLIC RAZORPAY KEY FROM EXISTING BACKEND
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchRazorpayKey = async () => {
      try {
        setKeyLoading(true);

        const data = await apiRequest("/razorpay/public-key");

        if (!data.key) {
          throw new Error("Razorpay public Key ID was not returned.");
        }

        if (!cancelled) {
          setRazorpayKey(data.key);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load Razorpay configuration."
          );
        }
      } finally {
        if (!cancelled) {
          setKeyLoading(false);
        }
      }
    };

    fetchRazorpayKey();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // CLEAN UP IMAGE AND VIDEO PREVIEWS
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const refreshPreviews = (selectedFiles) => {
    previewUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    const nextPreviews = selectedFiles.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    previewUrlsRef.current = nextPreviews.map(
      (item) => item.url
    );

    setPreviews(nextPreviews);
  };

  // --------------------------------------------------
  // FORM FIELD UPDATES
  // --------------------------------------------------

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // FILE UPLOAD HANDLING
  // --------------------------------------------------

  const handleFiles = (event) => {
    setError("");

    const selected = Array.from(event.target.files || []);

    const valid = selected.filter((file) =>
      ALLOWED_FILE_TYPES.includes(file.type)
    );

    if (valid.length !== selected.length) {
      setError(
        "Some files were skipped because their format is unsupported."
      );
    }

    const combined = [...files, ...valid];

    if (combined.length > 5) {
      setError("You can upload a maximum of 5 files.");
      event.target.value = "";
      return;
    }

    if (
      combined.some(
        (file) => file.size > 50 * 1024 * 1024
      )
    ) {
      setError("Each uploaded file must be below 50 MB.");
      event.target.value = "";
      return;
    }

    const totalSize = combined.reduce(
      (sum, file) => sum + file.size,
      0
    );

    if (totalSize > 100 * 1024 * 1024) {
      setError("The total upload size cannot exceed 100 MB.");
      event.target.value = "";
      return;
    }

    setFiles(combined);
    refreshPreviews(combined);

    event.target.value = "";
  };

  const removeFile = (index) => {
    const remaining = files.filter((_, i) => i !== index);

    setFiles(remaining);
    refreshPreviews(remaining);
  };

  // --------------------------------------------------
  // FORM VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return "Your login session has expired. Please log in again.";
    }

    if (!form.recipientName.trim()) {
      return "Please enter the recipient's name.";
    }

    if (
      !form.recipientEmail.trim() &&
      !form.recipientPhone.trim()
    ) {
      return "Please provide at least one recipient contact detail.";
    }

    if (
      form.recipientEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.recipientEmail.trim()
      )
    ) {
      return "Please enter a valid recipient email address.";
    }

    if (!form.occasionDate) {
      return "Please select the occasion date.";
    }

    if (!form.scheduledWishTime) {
      return "Please select the greeting delivery time.";
    }

    const scheduled = new Date(
      `${form.occasionDate}T${form.scheduledWishTime}:00+05:30`
    );

    if (
      Number.isNaN(scheduled.getTime()) ||
      scheduled <= new Date()
    ) {
      return "Please select a future date and time for the greeting.";
    }

    const amount = Number(form.amount);

    if (
      !Number.isSafeInteger(amount) ||
      amount < 1 ||
      amount > 1000000
    ) {
      return "Enter a valid donation amount between ₹1 and ₹10,00,000.";
    }

    if (!form.recipientContactConsent) {
      return "Please confirm that you have permission to share recipient contact details.";
    }

    if (!form.termsAccepted) {
      return "Please accept the donation terms before continuing.";
    }

    if (!razorpayKey) {
      return "Razorpay is not ready. Please refresh the page and try again.";
    }

    return "";
  };

  // --------------------------------------------------
  // CREATE DONATION REQUEST
  // --------------------------------------------------

  const createDonationRequest = async (token) => {
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, String(value));
    });

    files.forEach((file) => {
      payload.append("media", file);
    });

    const data = await apiRequest("/occasion-donations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: payload,
    });

    const donationId = data.donation?.id;

    if (!donationId) {
      throw new Error("The server did not return a donation ID.");
    }

    setPendingDonationId(donationId);

    return donationId;
  };

  // --------------------------------------------------
  // CREATE RAZORPAY ORDER
  // --------------------------------------------------

  const createPaymentOrder = async (donationId, token) => {
    const data = await apiRequest(
      `/occasion-donations/${donationId}/create-order`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!data.order?.id || !data.order?.amount) {
      throw new Error("Invalid payment order received from server.");
    }

    return data;
  };

  // --------------------------------------------------
  // VERIFY PAYMENT ON BACKEND
  // --------------------------------------------------

  const verifyPayment = async (
    donationId,
    paymentResponse,
    token
  ) => {
    const data = await apiRequest(
      `/occasion-donations/${donationId}/verify-payment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(paymentResponse),
      }
    );

    return data;
  };

  // --------------------------------------------------
  // RESET FORM AFTER SUCCESSFUL PAYMENT
  // --------------------------------------------------

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFiles([]);
    refreshPreviews([]);
    setPendingDonationId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // MAIN DONATION + PAYMENT FLOW
  // --------------------------------------------------

  const submitDonation = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (busy) return;

    setBusy(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again to continue.");
      }

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      // Step 1: Create the donation only if one is not pending.
      // This avoids creating another request on a retry.
      let donationId = pendingDonationId;

      if (!donationId) {
        const donation = await createDonationRequest(token);
        donationId = donation;
      }

      // Step 2: Ask backend to create the Razorpay order.
      const orderData = await createPaymentOrder(
        donationId,
        token
      );

      // Step 3: Open Razorpay Checkout.
      const checkout = new window.Razorpay({
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "DWJD",
        description: `Donation for ${form.occasionType}`,
        order_id: orderData.order.id,
        prefill: orderData.prefill || {},
        theme: {
          color: "#10b981",
        },

        modal: {
          ondismiss: () => {
            checkoutRef.current = null;
            setBusy(false);
          },
        },

        // Step 4: Verify payment on your backend.
        handler: async (paymentResponse) => {
          try {
            setError("");

            const verified = await verifyPayment(
              donationId,
              paymentResponse,
              token
            );

            setSuccess(
              `Your donation was successful! Reference: ${
                verified.donation?.referenceCode || donationId
              }. Your request is awaiting admin review.`
            );

            resetForm();

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } catch (verificationError) {
            setError(
              verificationError.message ||
                "Payment verification failed. Please contact DWJD support with your payment reference."
            );
          } finally {
            checkoutRef.current = null;
            setBusy(false);
          }
        },
      });

      checkoutRef.current = checkout;

      checkout.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        checkoutRef.current = null;
        setBusy(false);
      });

      checkout.open();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Something went wrong. Please try again."
      );

      checkoutRef.current = null;
      setBusy(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // --------------------------------------------------
  // SELECTED OCCASION
  // --------------------------------------------------

  const selectedOccasion = OCCASIONS.find(
    (item) => item.name === form.occasionType
  );

  const formattedAmount = Number(
    form.amount || 0
  ).toLocaleString("en-IN");

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen overflow-hidden bg-[#080b12] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/afterlogin/donate")}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
          >
            <ArrowLeft
              size={17}
              className="transition group-hover:-translate-x-1"
            />
            Back
          </button>

          <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-emerald-400">
            <Heart size={17} fill="currentColor" />
            DWJD
          </div>
        </div>

        {/* Hero */}
        <header className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Sparkles size={14} />
            Celebrate with kindness
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Make their day
            <span className="block bg-gradient-to-r from-emerald-300 via-green-400 to-teal-300 bg-clip-text text-transparent">
              meaningful.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Celebrate a special moment by donating in someone's
            name. A thoughtful gift can make a real difference.
          </p>
        </header>

        {/* Razorpay loading notice */}
        {keyLoading && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <LoaderCircle className="animate-spin text-emerald-400" size={19} />
            Preparing secure payment...
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.08] p-4 text-sm text-red-200"
          >
            <X size={19} className="mt-0.5 shrink-0" />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4 text-sm text-emerald-200"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {pendingDonationId && (
          <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-200">
            You have an unpaid donation request. Continuing will
            retry payment for that request.
            <span className="mt-1 block text-xs text-amber-200/70">
              Request reference: {pendingDonationId}
            </span>
          </div>
        )}

        <form onSubmit={submitDonation}>
          <div className="grid gap-7 lg:grid-cols-[1fr_340px]">
            {/* Main form */}
            <div className="space-y-6">
              {/* Occasion */}
              <Panel>
                <SectionHeading
                  number="01"
                  title="What's the occasion?"
                  subtitle="Select the special moment you're celebrating."
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {OCCASIONS.map((occasion) => {
                    const active =
                      form.occasionType === occasion.name;

                    return (
                      <button
                        type="button"
                        key={occasion.name}
                        disabled={busy || !!pendingDonationId}
                        onClick={() =>
                          setForm((old) => ({
                            ...old,
                            occasionType: occasion.name,
                          }))
                        }
                        className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          active
                            ? "border-emerald-400/60 bg-emerald-400/[0.10] text-emerald-300"
                            : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="text-2xl">
                          {occasion.emoji}
                        </span>
                        <span className="text-xs font-semibold">
                          {occasion.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <FormField label="Give your occasion a title">
                    <input
                      name="occasionTitle"
                      value={form.occasionTitle}
                      onChange={updateField}
                      disabled={busy || !!pendingDonationId}
                      maxLength={100}
                      placeholder="Example: Celebrating Rahul's birthday"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <FormField label="Occasion date" required>
                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="pointer-events-none absolute left-4 top-4 text-emerald-400"
                      />

                      <input
                        type="date"
                        name="occasionDate"
                        min={today}
                        value={form.occasionDate}
                        onChange={updateField}
                        disabled={busy || !!pendingDonationId}
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Greeting delivery time (IST)"
                    required
                  >
                    <div className="relative">
                      <Clock
                        size={17}
                        className="pointer-events-none absolute left-4 top-4 text-emerald-400"
                      />

                      <input
                        type="time"
                        name="scheduledWishTime"
                        value={form.scheduledWishTime}
                        onChange={updateField}
                        disabled={busy || !!pendingDonationId}
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </FormField>
                </div>
              </Panel>

              {/* Recipient */}
              <Panel>
                <SectionHeading
                  number="02"
                  title="Who are you celebrating?"
                  subtitle="Tell us who should receive your greeting."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="Recipient name" required>
                    <div className="relative">
                      <User
                        size={17}
                        className="pointer-events-none absolute left-4 top-4 text-slate-500"
                      />

                      <input
                        name="recipientName"
                        value={form.recipientName}
                        onChange={updateField}
                        disabled={busy || !!pendingDonationId}
                        placeholder="Full name"
                        maxLength={100}
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </FormField>

                  <FormField label="Recipient email">
                    <div className="relative">
                      <Mail
                        size={17}
                        className="pointer-events-none absolute left-4 top-4 text-slate-500"
                      />

                      <input
                        type="email"
                        name="recipientEmail"
                        value={form.recipientEmail}
                        onChange={updateField}
                        disabled={busy || !!pendingDonationId}
                        placeholder="example@email.com"
                        maxLength={150}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </FormField>

                  <FormField label="Recipient phone">
                    <div className="relative">
                      <Phone
                        size={17}
                        className="pointer-events-none absolute left-4 top-4 text-slate-500"
                      />

                      <input
                        type="tel"
                        name="recipientPhone"
                        value={form.recipientPhone}
                        onChange={updateField}
                        disabled={busy || !!pendingDonationId}
                        placeholder="+91 98765 43210"
                        maxLength={20}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </FormField>

                  <FormField label="Your dedication">
                    <div className="relative">
                      <Heart
                        size={17}
                        className="pointer-events-none absolute left-4 top-4 text-slate-500"
                      />

                      <input
                        name="dedicationName"
                        value={form.dedicationName}
                        onChange={updateField}
                        disabled={busy || !!pendingDonationId}
                        placeholder="With love, ..."
                        maxLength={100}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </FormField>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs leading-6 text-slate-400">
                  <input
                    type="checkbox"
                    name="recipientContactConsent"
                    checked={form.recipientContactConsent}
                    onChange={updateField}
                    disabled={busy || !!pendingDonationId}
                    className="mt-1 accent-emerald-400"
                  />

                  <span>
                    I have permission to share the recipient's
                    contact information with DWJD for the purpose
                    of delivering this greeting.
                  </span>
                </label>
              </Panel>

              {/* Donation */}
              <Panel>
                <SectionHeading
                  number="03"
                  title="Choose your donation"
                  subtitle="Every contribution can make a difference."
                />

                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {AMOUNTS.map((amount) => {
                    const active =
                      Number(form.amount) === amount;

                    return (
                      <button
                        key={amount}
                        type="button"
                        disabled={busy || !!pendingDonationId}
                        onClick={() =>
                          setForm((old) => ({
                            ...old,
                            amount: String(amount),
                          }))
                        }
                        className={`rounded-xl border py-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          active
                            ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                            : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-emerald-400/30"
                        }`}
                      >
                        ₹{amount.toLocaleString("en-IN")}
                      </button>
                    );
                  })}
                </div>

                <FormField
                  label="Custom donation amount (INR)"
                  required
                >
                  <div className="relative">
                    <IndianRupee
                      size={18}
                      className="pointer-events-none absolute left-4 top-4 text-emerald-400"
                    />

                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={updateField}
                      disabled={busy || !!pendingDonationId}
                      min="1"
                      max="1000000"
                      step="1"
                      placeholder="Enter your amount"
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </FormField>

                <div className="mt-5">
                  <FormField label="Personal message">
                    <textarea
                      name="donorMessage"
                      value={form.donorMessage}
                      onChange={updateField}
                      disabled={busy || !!pendingDonationId}
                      rows={4}
                      maxLength={1000}
                      placeholder="Write something special..."
                      className={`${inputClass} resize-none`}
                    />

                    <div className="mt-2 text-right text-xs text-slate-600">
                      {form.donorMessage.length}/1000
                    </div>
                  </FormField>
                </div>
              </Panel>

              {/* Media */}
              <Panel>
                <SectionHeading
                  number="04"
                  title="Add your memories"
                  subtitle="Upload photos or videos to make the greeting special."
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  multiple
                  onChange={handleFiles}
                  disabled={busy || !!pendingDonationId}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy || !!pendingDonationId}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/[0.035] px-5 py-10 text-center transition hover:bg-emerald-400/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                    <Upload size={25} />
                  </div>

                  <span className="font-bold text-white">
                    Click to upload your memories
                  </span>

                  <span className="mt-2 text-xs text-slate-500">
                    Images and videos · Maximum 5 files
                  </span>

                  <span className="mt-1 text-xs text-slate-600">
                    50 MB per file · 100 MB total
                  </span>
                </button>

                {previews.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previews.map((preview, index) => (
                      <div
                        key={`${preview.name}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-black"
                      >
                        {preview.type.startsWith("image/") ? (
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="h-36 w-full object-cover"
                          />
                        ) : (
                          <video
                            src={preview.url}
                            controls
                            className="h-36 w-full object-cover"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={busy || !!pendingDonationId}
                          aria-label={`Remove ${preview.name}`}
                          className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>

                        <div className="truncate bg-black/70 p-2 text-xs text-slate-300">
                          {preview.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              {/* Consent */}
              <Panel>
                <div className="flex gap-3">
                  <ShieldCheck
                    size={25}
                    className="shrink-0 text-emerald-400"
                  />

                  <div>
                    <h3 className="font-bold text-white">
                      A little confirmation
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Please review your information before making
                      the payment.
                    </p>
                  </div>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-400">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={updateField}
                    disabled={busy || !!pendingDonationId}
                    className="mt-1 accent-emerald-400"
                  />

                  <span>
                    I confirm that the information I provided is
                    accurate and I agree to DWJD's donation terms
                    and review process.
                  </span>
                </label>
              </Panel>
            </div>

            {/* Right side summary */}
            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#0e1718]">
                <div className="relative overflow-hidden p-6">
                  <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-400/10 blur-2xl" />

                  <div className="relative">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                      <Gift size={24} />
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-400">
                      Your celebration
                    </p>

                    <h3 className="mt-3 text-2xl font-black text-white">
                      {selectedOccasion?.emoji} {form.occasionType}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {form.occasionTitle ||
                        "A special moment deserves a special gesture."}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] p-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Donation amount
                    </span>

                    <span className="font-bold text-white">
                      ₹{formattedAmount}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Recipient
                    </span>

                    <span className="max-w-[150px] truncate font-semibold text-white">
                      {form.recipientName || "Not added"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Date</span>

                    <span className="font-semibold text-white">
                      {form.occasionDate || "Not selected"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Media</span>

                    <span className="font-semibold text-white">
                      {files.length} file(s)
                    </span>
                  </div>

                  <div className="my-5 border-t border-dashed border-white/10" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">
                      Total donation
                    </span>

                    <span className="text-2xl font-black text-emerald-400">
                      ₹{formattedAmount}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={busy || keyLoading || !razorpayKey}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-4 font-extrabold text-[#06251a] shadow-lg shadow-emerald-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? (
                      <>
                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />
                        Processing...
                      </>
                    ) : keyLoading ? (
                      <>
                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />
                        Loading payment...
                      </>
                    ) : (
                      <>
                        <Wallet size={19} />
                        Continue to payment
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck
                      size={15}
                      className="text-emerald-400"
                    />
                    Secure payment powered by Razorpay
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-[#0e121c] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                    <PartyPopper size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      What happens next?
                    </h3>

                    <p className="text-xs text-slate-500">
                      Your donation journey
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    "Complete your payment",
                    "DWJD reviews your request",
                    "Approved greeting is scheduled",
                    "Recipient receives the greeting",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-xs font-bold text-emerald-400">
                        {index + 1}
                      </div>

                      <p className="text-xs text-slate-400">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="px-2 text-center text-xs leading-6 text-slate-600">
                Payment does not guarantee approval. Rejected
                requests are handled through the refund process.
                Refund processing time depends on the payment
                provider and bank.
              </p>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
