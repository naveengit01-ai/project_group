
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Gift,
  Heart,
  ImagePlus,
  IndianRupee,
  LoaderCircle,
  Mail,
  MessageCircle,
  PartyPopper,
  Phone,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Video,
  Wallet,
  X,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://back-end-project-group.onrender.com";

const RAZORPAY_KEY = import.meta.env.RAZORPAY_KEY_ID;

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

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
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

export default function MoneyDonate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef([]);

  const [form, setForm] = useState({
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
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, []);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const refreshPreviews = (selectedFiles) => {
    previewUrlsRef.current.forEach((url) =>
      URL.revokeObjectURL(url)
    );

    const nextPreviews = selectedFiles.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    previewUrlsRef.current = nextPreviews.map((item) => item.url);
    setPreviews(nextPreviews);
  };

  const handleFiles = (event) => {
    setError("");

    const selected = Array.from(event.target.files || []);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const valid = selected.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (valid.length !== selected.length) {
      setError("Some files were skipped because their format is unsupported.");
    }

    const combined = [...files, ...valid];

    if (combined.length > 5) {
      setError("You can upload a maximum of 5 files.");
      event.target.value = "";
      return;
    }

    if (combined.some((file) => file.size > 50 * 1024 * 1024)) {
      setError("Each uploaded file must be below 50 MB.");
      event.target.value = "";
      return;
    }

    const total = combined.reduce(
      (sum, file) => sum + file.size,
      0
    );

    if (total > 100 * 1024 * 1024) {
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

  const validateForm = () => {
    if (!localStorage.getItem("token")) {
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
      form.recipientEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail)
    ) {
      return "Please enter a valid recipient email address.";
    }

    if (!form.occasionDate) {
      return "Please select the occasion date.";
    }

    const scheduled = new Date(
      `${form.occasionDate}T${form.scheduledWishTime}:00+05:30`
    );

    if (Number.isNaN(scheduled.getTime()) || scheduled <= new Date()) {
      return "Please select a future date and time for the greeting.";
    }

    const amount = Number(form.amount);

    if (
      !Number.isInteger(amount) ||
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

    if (!RAZORPAY_KEY) {
      return "Razorpay is not configured. Please check RAZORPAY_KEY_ID.";
    }

    return "";
  };

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

    setBusy(true);

    try {
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      const token = localStorage.getItem("token");

      // STEP 1: Create donation request.
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, String(value));
      });

      files.forEach((file) => {
        payload.append("media", file);
      });

      const createResponse = await fetch(
        `${API_BASE}/api/occasion-donations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(
          createData.message || "Unable to create donation request."
        );
      }

      const donationId = createData.donation?.id;

      if (!donationId) {
        throw new Error(
          "The server did not return a donation ID."
        );
      }

      // STEP 2: Create Razorpay order.
      const orderResponse = await fetch(
        `${API_BASE}/api/occasion-donations/${donationId}/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message || "Unable to create payment order."
        );
      }

      if (!orderData.order?.id || !orderData.order?.amount) {
        throw new Error("Invalid payment order received from server.");
      }

      // STEP 3: Open Razorpay.
      const checkout = new window.Razorpay({
        key: RAZORPAY_KEY,
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
            setBusy(false);
          },
        },

        handler: async (paymentResponse) => {
          try {
            // STEP 4: Verify payment on backend.
            const verifyResponse = await fetch(
              `${API_BASE}/api/occasion-donations/${donationId}/verify-payment`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentResponse),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            setSuccess(
              `Your donation was successful! Reference: ${
                verifyData.donation?.referenceCode || donationId
              }. Your request is now awaiting admin review.`
            );

            setForm({
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
            });

            setFiles([]);
            refreshPreviews([]);

            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (verificationError) {
            setError(verificationError.message);
          } finally {
            setBusy(false);
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setBusy(false);
      });

      checkout.open();
    } catch (requestError) {
      setError(
        requestError.message || "Something went wrong. Please try again."
      );

      setBusy(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectedOccasion = OCCASIONS.find(
    (item) => item.name === form.occasionType
  );

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

        {/* Alerts */}
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
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4 text-sm text-emerald-200"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            <span>{success}</span>
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
                        onClick={() =>
                          setForm((old) => ({
                            ...old,
                            occasionType: occasion.name,
                          }))
                        }
                        className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition ${
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
                        min={minDate}
                        value={form.occasionDate}
                        onChange={updateField}
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
                        onClick={() =>
                          setForm((old) => ({
                            ...old,
                            amount: String(amount),
                          }))
                        }
                        className={`rounded-xl border py-4 text-sm font-bold transition ${
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
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/[0.035] px-5 py-10 text-center transition hover:bg-emerald-400/[0.07]"
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
                          aria-label={`Remove ${preview.name}`}
                          className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white opacity-100 transition hover:bg-red-500"
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
                    className="mt-1 accent-emerald-400"
                  />
                  I confirm that the information I provided is
                  accurate and I agree to DWJD's donation terms
                  and review process.
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
                      {selectedOccasion?.emoji}{" "}
                      {form.occasionType}
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
                      ₹
                      {Number(form.amount || 0).toLocaleString(
                        "en-IN"
                      )}
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
                      ₹
                      {Number(form.amount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
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
