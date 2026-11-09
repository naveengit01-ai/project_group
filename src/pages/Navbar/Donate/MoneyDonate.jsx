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
).replace(/\/+$/, "");

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

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10";

function SectionHeading({ number, title, subtitle }) {
  return (
    <div className="mb-6 flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-bold text-emerald-400">
        {number}
      </div>

      <div>
        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
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
        {required && <span className="ml-1 text-emerald-400">*</span>}
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
    throw new Error(data.message || `Request failed (${response.status}).`);
  }

  return data;
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const scriptUrl = "https://checkout.razorpay.com/v1/checkout.js";

    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);

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
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function getTodayString() {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
  }
}

function getMinimumScheduleDateTime() {
  return new Date(Date.now() + 5 * 60 * 1000);
}

function getScheduledISTTimestamp(dateStr, timeStr) {
  if (!dateStr || !timeStr) return NaN;
  const iso = `${dateStr}T${timeStr}:00+05:30`;
  const parsed = new Date(iso);
  return parsed.getTime();
}

export default function MoneyDonate() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef([]);
  const checkoutRef = useRef(null);
  const paymentHandlerStartedRef = useRef(false);

  // Tracks the exact form parameters used to create a pending donation record.
  // If the user alters the amount or any detail, we invalidate the pending donation.
  const pendingDonationSnapshotRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [razorpayKey, setRazorpayKey] = useState("");
  const [keyLoading, setKeyLoading] = useState(true);

  const [busy, setBusy] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Donation created in MongoDB but payment not completed.
  const [pendingDonationId, setPendingDonationId] = useState(null);

  // Payment verified successfully, but media may still need uploading.
  const [paidDonationId, setPaidDonationId] = useState(null);

  const today = getTodayString();

  // --------------------------------------------------
  // LOAD PUBLIC RAZORPAY KEY FROM BACKEND
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

    previewUrlsRef.current = nextPreviews.map((item) => item.url);

    setPreviews(nextPreviews);
  };

  // --------------------------------------------------
  // FORM FIELD UPDATES
  // If the user modifies any field, reset the pending donation
  // so payment order is always generated for the current amount & details.
  // --------------------------------------------------

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Invalidate unpaid donation request whenever form details change
    if (pendingDonationId) {
      setPendingDonationId(null);
      pendingDonationSnapshotRef.current = null;
    }
  };

  const handleOccasionSelect = (name) => {
    setForm((old) => ({
      ...old,
      occasionType: name,
    }));

    if (pendingDonationId && pendingDonationSnapshotRef.current?.occasionType !== name) {
      setPendingDonationId(null);
      pendingDonationSnapshotRef.current = null;
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setForm((old) => ({
      ...old,
      amount: String(selectedAmount),
    }));

    // If user previously attempted payment with a different amount,
    // clear the pending donation so a new order is created for this amount.
    if (
      pendingDonationId &&
      pendingDonationSnapshotRef.current?.amount !== String(selectedAmount)
    ) {
      setPendingDonationId(null);
      pendingDonationSnapshotRef.current = null;
    }
  };

  // --------------------------------------------------
  // FILE UPLOAD HANDLING
  // Files stay in browser until payment is verified.
  // --------------------------------------------------

  const handleFiles = (event) => {
    if (paidDonationId || busy || uploadingMedia) return;

    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    setError("");
    setSuccess("");

    const combined = [...files, ...selected];

    if (combined.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} files.`);
      event.target.value = "";
      return;
    }

    const invalid = combined.find(
      (file) => !ALLOWED_FILE_TYPES.includes(file.type)
    );

    if (invalid) {
      setError(
        `${invalid.name} is not a supported file. Upload JPG, PNG, WEBP, MP4, WEBM, or MOV files.`
      );
      event.target.value = "";
      return;
    }

    const oversized = combined.find((file) => file.size > MAX_FILE_SIZE);

    if (oversized) {
      setError(`${oversized.name} exceeds the 50 MB per-file limit.`);
      event.target.value = "";
      return;
    }

    const totalSize = combined.reduce((total, file) => total + file.size, 0);

    if (totalSize > MAX_TOTAL_SIZE) {
      setError("The total media size cannot exceed 100 MB.");
      event.target.value = "";
      return;
    }

    setFiles(combined);
    refreshPreviews(combined);
    event.target.value = "";
  };

  const removeFile = (index) => {
    if (paidDonationId || busy || uploadingMedia) return;

    const updated = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(updated);
    refreshPreviews(updated);
    setError("");
  };

  // --------------------------------------------------
  // FORM VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return "Your login session has expired. Please log in again.";
    }

    if (!form.occasionType) {
      return "Please select an occasion.";
    }

    if (!form.occasionTitle.trim()) {
      return "Please enter a title for the occasion.";
    }

    if (!form.recipientName.trim()) {
      return "Please enter the recipient's name.";
    }

    if (!form.recipientEmail.trim() && !form.recipientPhone.trim()) {
      return "Please provide at least one recipient contact detail.";
    }

    if (
      form.recipientEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail.trim())
    ) {
      return "Please enter a valid recipient email address.";
    }

    if (!form.occasionDate) {
      return "Please select the occasion date.";
    }

    if (!form.scheduledWishTime) {
      return "Please select the greeting delivery time.";
    }

    const scheduledTimestamp = getScheduledISTTimestamp(
      form.occasionDate,
      form.scheduledWishTime
    );

    if (
      !Number.isFinite(scheduledTimestamp) ||
      scheduledTimestamp < getMinimumScheduleDateTime().getTime()
    ) {
      return "Please schedule the greeting at least 5min  in advance (IST).";
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
  // API 1: CREATE DONATION REQUEST
  //
  // IMPORTANT:
  // Send JSON only. Do not send media files here.
  // Backend must save media: [].
  // --------------------------------------------------

  const createDonationRequest = async (token) => {
    const data = await apiRequest("/api/occasion-donations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(form),
    });

    const donationId = data.donation?.id || data.donation?._id || data.id;

    if (!donationId) {
      throw new Error("The server did not return a donation ID.");
    }

    setPendingDonationId(donationId);

    // Save snapshot of the parameters this donation was created with
    pendingDonationSnapshotRef.current = {
      id: donationId,
      amount: String(form.amount).trim(),
      occasionType: form.occasionType,
      recipientName: form.recipientName,
      occasionDate: form.occasionDate,
      scheduledWishTime: form.scheduledWishTime,
    };

    return donationId;
  };

  // --------------------------------------------------
  // API 2: CREATE RAZORPAY ORDER
  // --------------------------------------------------

  const createPaymentOrder = async (donationId, token) => {
    const data = await apiRequest(
      `/api/occasion-donations/${donationId}/create-order`,
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
  // API 3: VERIFY PAYMENT
  // --------------------------------------------------

  const verifyPayment = async (donationId, paymentResponse, token) => {
    const data = await apiRequest(
      `/api/occasion-donations/${donationId}/verify-payment`,
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
  // API 4: UPLOAD MEDIA AFTER PAYMENT VERIFICATION
  // --------------------------------------------------

  const uploadPaidMedia = async (donationId, token) => {
    if (!files.length) {
      setSuccess(
        "Payment successful! Your donation request is saved and awaiting review."
      );
      resetForm();
      return;
    }

    setUploadingMedia(true);
    setError("");

    try {
      const payload = new FormData();
      files.forEach((file) => {
        payload.append("media", file);
      });

      const data = await apiRequest(
        `/api/occasion-donations/${donationId}/upload-media`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: payload,
        }
      );

      setSuccess(
        data.message ||
          "Payment successful! Your media has been uploaded and your occasion donation is complete."
      );

      resetForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Paid donation media upload error:", err);
      setError(
        `Payment succeeded, but media upload failed: ${err.message}. Your payment is safe. Use the retry button below to upload without paying again.`
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  // --------------------------------------------------
  // RETRY MEDIA UPLOAD
  // Payment is already successful. Do not create a new order.
  // --------------------------------------------------

  const retryMediaUpload = async () => {
    if (!paidDonationId) {
      setError("No paid donation is available for media upload.");
      return;
    }

    if (!files.length) {
      setError("Please select the media files before retrying.");
      return;
    }

    if (uploadingMedia || busy) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again before retrying media upload.");
      return;
    }

    await uploadPaidMedia(paidDonationId, token);
  };

  // --------------------------------------------------
  // RESET FORM AFTER COMPLETION
  // --------------------------------------------------

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFiles([]);
    refreshPreviews([]);

    setPendingDonationId(null);
    setPaidDonationId(null);
    pendingDonationSnapshotRef.current = null;

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

    if (paidDonationId) {
      setError(
        "Your payment has already been verified. Please retry media upload instead of paying again."
      );
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (busy || keyLoading) return;

    setBusy(true);
    paymentHandlerStartedRef.current = false;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in again to continue.");
      }

      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay checkout. Check your internet connection and try again."
        );
      }

      // Check if we can safely reuse the pending donation ID.
      // Reusing is ONLY allowed if the form amount and key details still match
      // the snapshot from when that pending donation was created.
      const currentAmount = String(form.amount).trim();
      const snapshot = pendingDonationSnapshotRef.current;

      const canReusePending =
        pendingDonationId &&
        snapshot &&
        snapshot.id === pendingDonationId &&
        snapshot.amount === currentAmount &&
        snapshot.occasionType === form.occasionType &&
        snapshot.recipientName === form.recipientName &&
        snapshot.occasionDate === form.occasionDate &&
        snapshot.scheduledWishTime === form.scheduledWishTime;

      let donationId = canReusePending ? pendingDonationId : null;

      // If amount or details changed (e.g. from 1000 to 500), create a fresh donation record
      if (!donationId) {
        donationId = await createDonationRequest(token);
      }

      const orderData = await createPaymentOrder(donationId, token);

      const checkout = new window.Razorpay({
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "DWJD",
        description: `Donation for ${form.occasionType}`,
        order_id: orderData.order.id,
        prefill: orderData.prefill || {
          name: form.recipientName,
          email: form.recipientEmail,
          contact: form.recipientPhone,
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: () => {
            checkoutRef.current = null;
            setBusy(false);
            if (!paymentHandlerStartedRef.current) {
              setError(
                "Payment was cancelled. You can change details or retry payment."
              );
            }
          },
        },
        handler: async (paymentResponse) => {
          if (paymentHandlerStartedRef.current) return;
          paymentHandlerStartedRef.current = true;
          setBusy(true);
          setError("");
          setSuccess("");

          try {
            const verified = await verifyPayment(
              donationId,
              paymentResponse,
              token
            );

            const isVerifiedPaid =
              verified.paymentStatus === "paid" ||
              verified.donation?.paymentStatus === "paid" ||
              verified.success === true;

            if (!isVerifiedPaid) {
              throw new Error(
                verified.message ||
                  "The backend has not confirmed successful payment."
              );
            }

            setPaidDonationId(donationId);
            setPendingDonationId(null);
            pendingDonationSnapshotRef.current = null;

            if (files.length > 0) {
              setSuccess(
                "Payment verified successfully. Uploading your selected media..."
              );
              await uploadPaidMedia(donationId, token);
            } else {
              setSuccess(
                "Payment successful! Your occasion donation is complete and saved."
              );
              resetForm();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          } catch (verificationError) {
            console.error("Payment verification error:", verificationError);
            setError(
              `Payment verification could not be confirmed: ${verificationError.message}. Do not pay again yet. Check your donation history or contact DWJD support.`
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
            "Payment failed. Your donation request remains saved. You can try again."
        );
        checkoutRef.current = null;
        setBusy(false);
      });

      checkout.open();
    } catch (requestError) {
      console.error("Donation submission error:", requestError);
      setError(
        requestError.message || "Something went wrong. Please try again."
      );
      checkoutRef.current = null;
      setBusy(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --------------------------------------------------
  // SELECTED OCCASION & FORMATTING
  // --------------------------------------------------

  const selectedOccasion = OCCASIONS.find(
    (item) => item.name === form.occasionType
  );

  const formattedAmount = Number(form.amount || 0).toLocaleString("en-IN");
  const isPaid = Boolean(paidDonationId);

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
            Make their day{" "}
            <span className="block bg-gradient-to-r from-emerald-300 via-green-400 to-teal-300 bg-clip-text text-transparent">
              meaningful.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Celebrate a special moment by donating in someone's name. A
            thoughtful gift can make a real difference.
          </p>
        </header>

        {/* Razorpay loading notice */}
        {keyLoading && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <LoaderCircle
              className="animate-spin text-emerald-400"
              size={19}
            />
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
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-300 hover:text-white"
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
            <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Unpaid donation notice */}
        {pendingDonationId && !paidDonationId && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span>
                You have an unpaid donation request for ₹
                {Number(
                  pendingDonationSnapshotRef.current?.amount || form.amount
                ).toLocaleString("en-IN")}
                . If you changed the amount or details, submit below to generate a new order.
              </span>
              <span className="mt-1 block text-xs text-amber-200/70">
                Request ID: {pendingDonationId}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setPendingDonationId(null);
                pendingDonationSnapshotRef.current = null;
              }}
              className="shrink-0 self-start rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/20 sm:self-center"
            >
              Start new request
            </button>
          </div>
        )}

        {/* Paid donation, media upload pending */}
        {paidDonationId && (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.07] p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={23}
                className="shrink-0 text-emerald-400"
              />
              <div>
                <h3 className="font-bold text-emerald-300">
                  Your payment is verified!
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Your donation is saved. If media upload did not complete,
                  retry it below. You do not need to pay again.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Donation ID: {paidDonationId}
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <button
                type="button"
                onClick={retryMediaUpload}
                disabled={uploadingMedia || busy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-[#06251a] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {uploadingMedia ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Uploading media...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Retry media upload
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <form onSubmit={submitDonation}>
          <div className="grid gap-7 lg:grid-cols-[1fr_340px]">
            {/* Main form fields */}
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
                    const active = form.occasionType === occasion.name;

                    return (
                      <button
                        type="button"
                        key={occasion.name}
                        disabled={busy || isPaid}
                        onClick={() => handleOccasionSelect(occasion.name)}
                        className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          active
                            ? "border-emerald-400/60 bg-emerald-400/[0.10] text-emerald-300"
                            : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="text-2xl">{occasion.emoji}</span>
                        <span className="text-xs font-semibold">
                          {occasion.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <FormField label="Give your occasion a title" required>
                    <input
                      name="occasionTitle"
                      value={form.occasionTitle}
                      onChange={updateField}
                      disabled={busy || isPaid}
                      maxLength={100}
                      placeholder="Example: Celebrating Rahul's birthday"
                      className={inputClass}
                      required
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
                        disabled={busy || isPaid}
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
                        disabled={busy || isPaid}
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
                        disabled={busy || isPaid}
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
                        disabled={busy || isPaid}
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
                        disabled={busy || isPaid}
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
                        disabled={busy || isPaid}
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
                    disabled={busy || isPaid}
                    className="mt-1 accent-emerald-400"
                  />
                  <span>
                    I have permission to share the recipient's contact
                    information with DWJD for the purpose of delivering this
                    greeting.
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
                    const active = Number(form.amount) === amount;

                    return (
                      <button
                        key={amount}
                        type="button"
                        disabled={busy || isPaid}
                        onClick={() => handleAmountSelect(amount)}
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

                <FormField label="Custom donation amount (INR)" required>
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
                      disabled={busy || isPaid}
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
                      disabled={busy || isPaid}
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
                  disabled={busy || isPaid}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy || isPaid}
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
                          disabled={busy || isPaid}
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

                <p className="mt-4 text-xs leading-6 text-emerald-300/70">
                  Your selected media stays in your browser until payment is
                  successfully verified. Only then will DWJD upload it to Google
                  Drive.
                </p>
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
                      Please review your information before making the payment.
                    </p>
                  </div>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-400">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={updateField}
                    disabled={busy || isPaid}
                    className="mt-1 accent-emerald-400"
                  />
                  <span>
                    I confirm that the information I provided is accurate and I
                    agree to DWJD's donation terms and review process.
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
                    <span className="text-slate-400">Donation amount</span>
                    <span className="font-bold text-white">
                      ₹{formattedAmount}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Recipient</span>
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
                    <span className="text-slate-400">Greeting time</span>
                    <span className="font-semibold text-white">
                      {form.scheduledWishTime
                        ? `${form.scheduledWishTime} IST`
                        : "Not selected"}
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

                  {!paidDonationId && (
                    <button
                      type="submit"
                      disabled={busy || keyLoading || !razorpayKey}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-4 font-extrabold text-[#06251a] shadow-lg shadow-emerald-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? (
                        <>
                          <LoaderCircle size={19} className="animate-spin" />
                          Processing...
                        </>
                      ) : keyLoading ? (
                        <>
                          <LoaderCircle size={19} className="animate-spin" />
                          Loading payment...
                        </>
                      ) : (
                        <>
                          <Wallet size={19} />
                          {pendingDonationId
                            ? "Retry payment"
                            : "Continue to payment"}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  )}

                  {paidDonationId && files.length === 0 && (
                    <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-4 text-sm font-bold text-emerald-300">
                      <CheckCircle2 size={19} />
                      Payment completed
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={15} className="text-emerald-400" />
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
                    "Payment is verified by DWJD",
                    "Media is uploaded to Google Drive",
                    "DWJD reviews your request",
                    "Approved greeting is scheduled",
                    "Recipient receives the greeting",
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-xs font-bold text-emerald-400">
                        {index + 1}
                      </div>

                      <p className="text-xs text-slate-400">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="px-2 text-center text-xs leading-6 text-slate-600">
                Payment does not guarantee approval. Rejected requests are
                handled through the refund process. Refund processing time
                depends on the payment provider and bank.
              </p>
            </aside>
          </div>

          {/* Bottom Submit Action */}
          <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0e121c] p-5 sm:flex-row sm:p-7">
            <p className="max-w-lg text-xs leading-6 text-slate-500">
              By continuing, you agree to the donation terms. Your donation
              request is saved even if payment is cancelled or fails. Media is
              uploaded only after payment verification.
            </p>

            <button
              type="submit"
              disabled={
                busy || uploadingMedia || keyLoading || isPaid || !razorpayKey
              }
              className="flex w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-emerald-400 px-7 py-4 font-bold text-[#06251a] shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {busy || uploadingMedia ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  {uploadingMedia ? "Uploading media..." : "Processing..."}
                </>
              ) : (
                <>
                  <Wallet size={19} />
                  {pendingDonationId
                    ? "Retry payment"
                    : "Continue to payment"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="mt-10 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} DWJD. Made with care.</p>
        </footer>
      </div>
    </div>
  );
}