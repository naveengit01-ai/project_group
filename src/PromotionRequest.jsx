import { useState } from "react";
import { motion } from "framer-motion";
import { BASE_URL } from "./api.js";

const initialForm = {
  brand_name: "",
  company_name: "",
  contact_person: "",
  contact_email: "",
  contact_phone: "",
  company_website: "",
  title: "",
  description: "",
  promotion_type: "banner",
  target_url: "",
  placement: "home_page",
  start_date: "",
  end_date: "",
  amount_paid: "",
  currency: "INR",
  collaboration_type: "paid_promotion",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";
const labelClass = "mb-1 block text-sm font-semibold text-slate-700";

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`${labelClass} ${className}`}>
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
      {children}
    </label>
  );
}

export default function PromotionRequest() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setError("End date and time must be after the start date and time.");
      return;
    }
    if (bannerFile && bannerFile.size > 5 * 1024 * 1024) {
      setError("The banner image must be 5 MB or smaller.");
      return;
    }
    if (videoFile && videoFile.size > 50 * 1024 * 1024) {
      setError("The campaign video must be 50 MB or smaller.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();

      Object.entries({
        ...form,
        amount_paid: String(Number(form.amount_paid)),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      }).forEach(([key, value]) => {
        payload.append(key, value == null ? "" : String(value));
      });

      if (bannerFile) payload.append("banner", bannerFile);
      if (videoFile) payload.append("video", videoFile);

      const response = await fetch(`${BASE_URL}/advertisements/request`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned an unexpected response (HTTP ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Could not submit promotion (HTTP ${response.status}).`);
      }

      setSuccess(
        data.message ||
          "Your brand promotion request has been submitted. DWJD will review it and contact you."
      );
      setForm(initialForm);
      setBannerFile(null);
      setVideoFile(null);
    } catch (err) {
      setError(err.message || "Could not submit your promotion request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 p-7 text-white shadow-2xl sm:p-10"
        >
          <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
            DWJD · Brand partnerships
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Promote your brand with DWJD
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
            Tell us about your company and campaign. Our team will review your proposal and get in touch.
          </p>
        </motion.header>

        {(error || success) && (
          <div
            role={error ? "alert" : "status"}
            className={`mb-6 rounded-2xl border p-4 text-sm leading-6 ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {error || success}
          </div>
        )}

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-9"
        >
          <section>
            <h2 className="mb-4 text-lg font-extrabold">1. Brand and contact details</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Brand name" required>
                <input className={inputClass} name="brand_name" value={form.brand_name} onChange={update} required maxLength={120} placeholder="Your brand name" />
              </Field>
              <Field label="Company name" required>
                <input className={inputClass} name="company_name" value={form.company_name} onChange={update} required maxLength={160} placeholder="Registered company name" />
              </Field>
              <Field label="Contact person" required>
                <input className={inputClass} name="contact_person" value={form.contact_person} onChange={update} required maxLength={120} placeholder="Marketing or partnership contact" />
              </Field>
              <Field label="Business email" required>
                <input className={inputClass} type="email" name="contact_email" value={form.contact_email} onChange={update} required placeholder="name@company.com" />
              </Field>
              <Field label="Contact phone" required>
                <input className={inputClass} type="tel" name="contact_phone" value={form.contact_phone} onChange={update} required maxLength={30} placeholder="+91…" />
              </Field>
              <Field label="Company website">
                <input className={inputClass} type="url" name="company_website" value={form.company_website} onChange={update} placeholder="https://company.com" />
              </Field>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-7">
            <h2 className="mb-4 text-lg font-extrabold">2. Promotion creative and placement</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Campaign title" required>
                <input className={inputClass} name="title" value={form.title} onChange={update} required maxLength={180} placeholder="Campaign title" />
              </Field>
              <Field label="Promotion type" required>
                <select className={inputClass} name="promotion_type" value={form.promotion_type} onChange={update}>
                  <option value="banner">Banner</option>
                  <option value="sponsored_post">Sponsored post</option>
                  <option value="video">Video</option>
                  <option value="product_promotion">Product promotion</option>
                  <option value="brand_awareness">Brand awareness</option>
                </select>
              </Field>
              <Field label="Campaign description" required className="md:col-span-2">
                <textarea className={inputClass} name="description" value={form.description} onChange={update} required rows={4} maxLength={3000} placeholder="Describe your campaign…" />
              </Field>
              <Field label="Upload banner / image (optional)">
                <input
                  className={inputClass}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setBannerFile(event.target.files?.[0] || null)}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  JPG, PNG, or WEBP · maximum 5 MB
                </span>
                {bannerFile && (
                  <span className="mt-2 block text-xs font-semibold text-emerald-700">
                    Selected: {bannerFile.name}
                  </span>
                )}
              </Field>
              <Field label="Upload campaign video (optional)">
                <input
                  className={inputClass}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  MP4, WEBM, or MOV · maximum 50 MB
                </span>
                {videoFile && (
                  <span className="mt-2 block text-xs font-semibold text-emerald-700">
                    Selected: {videoFile.name}
                  </span>
                )}
              </Field>
              <Field label="Click-through destination URL">
                <input className={inputClass} type="url" name="target_url" value={form.target_url} onChange={update} placeholder="https://brand.com/offer" />
              </Field>
              <Field label="Requested placement" required>
                <select className={inputClass} name="placement" value={form.placement} onChange={update}>
                  <option value="home_page">Home page</option>
                  <option value="donation_page">Donation page</option>
                  <option value="pickup_page">Pickup page</option>
                  <option value="rider_dashboard">Rider dashboard</option>
                  <option value="all_pages">All pages</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-7">
            <h2 className="mb-4 text-lg font-extrabold">3. Schedule and budget</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Requested start date and time" required>
                <input className={inputClass} type="datetime-local" name="start_date" value={form.start_date} onChange={update} required />
              </Field>
              <Field label="Requested end date and time" required>
                <input className={inputClass} type="datetime-local" name="end_date" value={form.end_date} onChange={update} required />
              </Field>
              <Field label="Proposed campaign budget (INR)" required>
                <input className={inputClass} type="number" name="amount_paid" value={form.amount_paid} onChange={update} required min="0" step="0.01" placeholder="e.g. 25000" />
              </Field>
              <Field label="Collaboration type">
                <select className={inputClass} name="collaboration_type" value={form.collaboration_type} onChange={update}>
                  <option value="paid_promotion">Paid promotion</option>
                  <option value="sponsorship">Sponsorship</option>
                  <option value="brand_partnership">Brand partnership</option>
                </select>
              </Field>
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              Submitting this form is a proposal, not payment confirmation or approval. DWJD will contact you to confirm terms and payment.
            </p>
          </section>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button type="button" onClick={() => { setForm(initialForm); setBannerFile(null); setVideoFile(null); }} disabled={submitting} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              Reset form
            </button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-violet-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit promotion request"}
            </button>
          </div>
        </motion.form>
      </div>
    </main>
  );
}
