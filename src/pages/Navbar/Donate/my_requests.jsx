
import { useCallback, useEffect, useMemo, useState } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";

const STATUS_META = {
  not_picked: {
    label: "Pending",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: "clock",
    progress: 0,
  },
  picked: {
    label: "Picked Up",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: "truck",
    progress: 1,
  },
  collected: {
    label: "Collected",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    icon: "package",
    progress: 2,
  },
  delivered: {
    label: "Delivered",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    icon: "check",
    progress: 3,
  },
};

const ITEM_ICON = {
  food: "🍱",
  clothes: "👕",
  other: "📦",
};

const FILTERS = [
  { key: "all", label: "All requests" },
  { key: "not_picked", label: "Pending" },
  { key: "picked", label: "Picked up" },
  { key: "collected", label: "Collected" },
  { key: "delivered", label: "Delivered" },
];

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    truck: <><path d="M3 6h12v12H3z" /><path d="M15 10h4l3 4v4h-7" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="18.5" cy="18" r="1.5" /></>,
    package: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M12 13v9M3 8v10l9 4 9-4V8" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    box: <><path d="M4 7 12 3l8 4v10l-8 4-8-4V7Z" /><path d="m4 7 8 4 8-4M12 11v10" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" /></>,
    search: <><circle cx="10.8" cy="10.8" r="7" /><path d="m16 16 5 5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    alert: <><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h2" /></>,
  };

  return <svg {...common}>{paths[name] || paths.box}</svg>;
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prettyStatus(value) {
  if (!value) return "Not available";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusStyle(value) {
  const status = String(value || "").toLowerCase();

  if (
    status.includes("paid") ||
    status.includes("approved") ||
    status.includes("delivered") ||
    status.includes("complete") ||
    status.includes("sent")
  ) {
    return { color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" };
  }

  if (
    status.includes("failed") ||
    status.includes("rejected") ||
    status.includes("cancelled") ||
    status.includes("refunded")
  ) {
    return { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" };
  }

  return { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" };
}

function StatusPill({ value, fallback }) {
  const label = prettyStatus(value || fallback);
  const style = getStatusStyle(value || fallback);

  return (
    <span
      className="mr-money-status"
      style={{
        color: style.color,
        background: style.bg,
        borderColor: style.border,
      }}
    >
      {label}
    </span>
  );
}

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [moneyRequests, setMoneyRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [moneyLoading, setMoneyLoading] = useState(false);
  const [moneyLoaded, setMoneyLoaded] = useState(false);

  const [resending, setResending] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [moneyError, setMoneyError] = useState("");
  const [notice, setNotice] = useState("");

  const [moneyExpanded, setMoneyExpanded] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const getToken = () => localStorage.getItem("token");

  // Existing regular donation API - preserved.
  const fetchRequests = useCallback(async () => {
    if (!user?.email) {
      setError("Please sign in to view your donation requests.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/my-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to load your requests.");
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      console.error("Fetch requests error:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Occasion money donation history - read only.
  const fetchMoneyRequests = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setMoneyError("Please sign in again to view your money donations.");
      setMoneyLoaded(true);
      return;
    }

    setMoneyLoading(true);
    setMoneyError("");

    try {
      const res = await fetch(
        `${BASE_URL}/occasion-donations/my-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Unable to load money donation requests."
        );
      }

      const list = Array.isArray(data.donations)
        ? data.donations
        : Array.isArray(data.requests)
          ? data.requests
          : [];

      setMoneyRequests(list);
      setMoneyLoaded(true);
    } catch (err) {
      console.error("Money donation history error:", err);
      setMoneyError(err.message || "Unable to load money donations.");
      setMoneyLoaded(true);
    } finally {
      setMoneyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Load money donations when the user opens the section.
  useEffect(() => {
    if (moneyExpanded && !moneyLoaded && !moneyLoading) {
      fetchMoneyRequests();
    }
  }, [
    moneyExpanded,
    moneyLoaded,
    moneyLoading,
    fetchMoneyRequests,
  ]);

  async function resendOtp(donationId) {
    setResending(donationId);
    setNotice("");
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/resend-donation-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donation_id: donationId }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "otp_resent") {
        throw new Error(
          data.message || data.status || "Unable to resend OTP."
        );
      }

      setNotice("Verification OTP has been sent to your email.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setResending(null);
    }
  }

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((r) => r.donation_status === filter);
  }, [requests, filter]);

  const stats = useMemo(() => [
    {
      key: "all",
      label: "Total requests",
      value: requests.length,
      icon: "box",
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      key: "not_picked",
      label: "Awaiting pickup",
      value: requests.filter((r) => r.donation_status === "not_picked").length,
      icon: "clock",
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      key: "picked",
      label: "Picked up",
      value: requests.filter((r) => r.donation_status === "picked").length,
      icon: "truck",
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      key: "delivered",
      label: "Successfully delivered",
      value: requests.filter((r) => r.donation_status === "delivered").length,
      icon: "check",
      color: "#059669",
      bg: "#ECFDF5",
    },
  ], [requests]);

  const moneyTotal = moneyRequests.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .mr-root {
          --green: #059669;
          --green-dark: #047857;
          --ink: #172B24;
          --muted: #718078;
          --line: #E8EEEA;
          min-height: 100vh;
          padding: 46px 24px 90px;
          background: #F6F9F7;
          color: var(--ink);
          font-family: 'Inter', sans-serif;
        }

        .mr-root * { box-sizing: border-box; }

        .mr-wrap {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          animation: mrEnter .55s ease both;
        }

        @keyframes mrEnter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mr-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 36px;
        }

        .mr-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Manrope', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .mr-brand-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 13px;
          color: white;
          background: linear-gradient(135deg,#10B981,#047857);
          box-shadow: 0 6px 16px #05966930;
        }

        .mr-brand small {
          display: block;
          color: #87938C;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .mr-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 15px;
          border: 1px solid var(--line);
          border-radius: 11px;
          background: white;
          color: #47574E;
          font: 600 12px 'Inter', sans-serif;
          cursor: pointer;
          transition: .2s ease;
        }

        .mr-refresh:hover {
          border-color: #A7DCC6;
          color: var(--green);
          transform: translateY(-1px);
        }

        .mr-refresh:disabled { opacity: .55; cursor: wait; }

        .mr-heading { margin-bottom: 25px; }

        .mr-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 13px;
          color: var(--green);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .mr-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 4px #10B98118;
        }

        .mr-title {
          margin: 0;
          font-family: 'Manrope', sans-serif;
          font-size: clamp(30px,4vw,43px);
          font-weight: 800;
          letter-spacing: -1.8px;
          line-height: 1.15;
          color: #172B24;
        }

        .mr-title span { color: var(--green); }

        .mr-subtitle {
          margin: 11px 0 0;
          color: #78877F;
          font-size: 14px;
          line-height: 1.7;
        }

        /* Money donation expandable section */
        .mr-money-section {
          margin: 26px 0 32px;
          border: 1px solid #DCEBE2;
          border-radius: 18px;
          background: white;
          box-shadow: 0 5px 20px #193B2B08;
          overflow: hidden;
        }

        .mr-money-trigger {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 19px 21px;
          border: 0;
          background: linear-gradient(110deg,#F0FBF5,#FFFFFF 75%);
          color: var(--ink);
          text-align: left;
          cursor: pointer;
          transition: background .2s ease;
        }

        .mr-money-trigger:hover {
          background: linear-gradient(110deg,#E5F8ED,#FFFFFF 75%);
        }

        .mr-money-trigger:focus-visible {
          outline: 3px solid #6EE7B7;
          outline-offset: -3px;
        }

        .mr-money-trigger-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .mr-money-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 47px;
          height: 47px;
          border-radius: 14px;
          color: #047857;
          background: #DDF8E9;
        }

        .mr-money-title {
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #1C3528;
        }

        .mr-money-description {
          margin-top: 5px;
          color: #7D8C82;
          font-size: 11px;
          line-height: 1.5;
        }

        .mr-money-trigger-right {
          display: flex;
          align-items: center;
          gap: 13px;
          flex-shrink: 0;
        }

        .mr-money-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          border-radius: 20px;
          background: #DDF8E9;
          color: #047857;
          font-size: 11px;
          font-weight: 800;
        }

        .mr-money-chevron {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid #DCEBE2;
          border-radius: 10px;
          background: white;
          color: #047857;
          transition: transform .25s ease;
        }

        .mr-money-chevron.open { transform: rotate(90deg); }

        .mr-money-content {
          padding: 21px;
          border-top: 1px solid #EAF1EC;
          animation: mrExpand .25s ease both;
        }

        @keyframes mrExpand {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mr-money-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 17px;
        }

        .mr-money-toolbar-title {
          color: #344B3C;
          font-size: 12px;
          font-weight: 800;
        }

        .mr-money-refresh {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 0;
          background: transparent;
          color: #07865C;
          font: 700 11px 'Inter',sans-serif;
          cursor: pointer;
        }

        .mr-money-refresh:disabled { opacity: .5; cursor: wait; }

        .mr-money-list {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 13px;
        }

        .mr-money-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid #E7EEE9;
          border-radius: 13px;
          background: #FCFEFC;
          transition: .2s ease;
        }

        .mr-money-card:hover {
          border-color: #B9DFCD;
          box-shadow: 0 7px 20px #193B2B08;
        }

        .mr-money-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 15px;
        }

        .mr-money-occasion {
          color: #243D2E;
          font-family: 'Manrope',sans-serif;
          font-size: 14px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .mr-money-recipient {
          margin-top: 5px;
          color: #839087;
          font-size: 11px;
        }

        .mr-money-amount {
          margin: 13px 0;
          color: #047857;
          font-family: 'Manrope',sans-serif;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.8px;
        }

        .mr-money-details {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 12px;
          padding-top: 13px;
          border-top: 1px solid #EDF2EE;
        }

        .mr-money-label {
          margin-bottom: 5px;
          color: #9AA59D;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .6px;
          text-transform: uppercase;
        }

        .mr-money-value {
          color: #43564A;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .mr-money-status {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          max-width: 100%;
          padding: 5px 8px;
          border: 1px solid;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 800;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .mr-money-reason {
          margin-top: 13px;
          padding: 10px 12px;
          border: 1px solid #FECACA;
          border-radius: 9px;
          background: #FEF2F2;
          color: #991B1B;
          font-size: 10px;
          line-height: 1.6;
        }

        .mr-money-empty {
          padding: 35px 18px;
          border: 1px dashed #D5E3D9;
          border-radius: 13px;
          color: #839087;
          text-align: center;
          font-size: 12px;
          line-height: 1.7;
        }

        .mr-money-empty strong {
          display: block;
          margin-bottom: 5px;
          color: #344B3C;
          font-size: 13px;
        }

        .mr-money-error {
          padding: 12px 14px;
          border: 1px solid #FECACA;
          border-radius: 10px;
          background: #FEF2F2;
          color: #B91C1C;
          font-size: 11px;
          line-height: 1.6;
        }

        .mr-money-skeleton {
          height: 190px;
          border: 1px solid #E8EEEA;
          border-radius: 13px;
          background: linear-gradient(90deg,#fff 25%,#F0F5F1 50%,#fff 75%);
          background-size: 200% 100%;
          animation: mrShimmer 1.4s infinite;
        }

        .mr-stats {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .mr-stat {
          min-width: 0;
          padding: 19px;
          border: 1px solid #E9EFEB;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 3px 12px #193B2B06;
          transition: transform .22s ease, box-shadow .22s ease;
          cursor: pointer;
        }

        .mr-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px #193B2B0D;
        }

        .mr-stat:focus-visible {
          outline: 3px solid #6EE7B7;
          outline-offset: 2px;
        }

        .mr-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
        }

        .mr-stat-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 12px;
        }

        .mr-stat-number {
          font-family: 'Manrope', sans-serif;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1;
        }

        .mr-stat-label {
          margin-top: 8px;
          color: #859189;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.5;
        }

        .mr-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 17px;
        }

        .mr-section-title {
          font-family: 'Manrope', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -.4px;
        }

        .mr-count {
          color: #849188;
          font-size: 11px;
          font-weight: 600;
        }

        .mr-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 22px;
        }

        .mr-filter {
          min-height: 37px;
          padding: 0 15px;
          border: 1px solid #E5ECE7;
          border-radius: 9px;
          background: white;
          color: #718078;
          font: 600 11px 'Inter',sans-serif;
          cursor: pointer;
          transition: .2s ease;
        }

        .mr-filter:hover {
          border-color: #A7DCC6;
          color: var(--green);
        }

        .mr-filter.active {
          border-color: var(--green);
          background: #ECFDF5;
          color: var(--green-dark);
        }

        .mr-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mr-card {
          position: relative;
          padding: 22px;
          border: 1px solid #E7EDE9;
          border-radius: 17px;
          background: white;
          box-shadow: 0 3px 12px #193B2B05;
          animation: mrCardIn .35s ease both;
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        @keyframes mrCardIn {
          from { opacity: 0; transform: translateY(9px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mr-card:hover {
          border-color: #B9DFCD;
          box-shadow: 0 9px 26px #193B2B0B;
        }

        .mr-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .mr-card-left {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .mr-item-icon {
          display: grid;
          place-items: center;
          width: 49px;
          height: 49px;
          flex-shrink: 0;
          border: 1px solid #E8F0EB;
          border-radius: 14px;
          background: #F4F8F5;
          font-size: 22px;
        }

        .mr-item-name {
          overflow-wrap: anywhere;
          color: #20372B;
          font-family: 'Manrope',sans-serif;
          font-size: 15px;
          font-weight: 800;
        }

        .mr-item-type {
          margin-top: 4px;
          color: #8A968F;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .mr-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          padding: 7px 11px;
          border: 1px solid;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
        }

        .mr-divider {
          height: 1px;
          margin: 19px 0;
          background: #EDF1EE;
        }

        .mr-progress-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 13px;
          color: #87938B;
          font-size: 10px;
          font-weight: 700;
        }

        .mr-progress-heading strong {
          color: #53665A;
          font-weight: 700;
        }

        .mr-progress {
          display: flex;
          align-items: flex-start;
          margin-bottom: 21px;
        }

        .mr-progress-step {
          position: relative;
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .mr-progress-step:not(:last-child)::after {
          position: absolute;
          top: 11px;
          left: calc(50% + 12px);
          width: calc(100% - 24px);
          height: 3px;
          border-radius: 5px;
          background: #E8EEEA;
          content: "";
        }

        .mr-progress-step.done:not(:last-child)::after {
          background: #34B989;
        }

        .mr-progress-dot {
          z-index: 1;
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border: 2px solid #E0E8E2;
          border-radius: 50%;
          background: white;
          color: transparent;
          font-size: 11px;
          transition: .2s ease;
        }

        .mr-progress-step.done .mr-progress-dot {
          border-color: #10B981;
          background: #10B981;
          color: white;
        }

        .mr-progress-label {
          color: #A0AAA3;
          font-size: 9px;
          font-weight: 600;
          text-align: center;
        }

        .mr-progress-step.done .mr-progress-label {
          color: #16875F;
        }

        .mr-meta {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px;
          padding: 15px;
          border-radius: 12px;
          background: #F7FAF8;
        }

        .mr-meta-label {
          margin-bottom: 6px;
          color: #96A198;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .7px;
          text-transform: uppercase;
        }

        .mr-meta-value {
          overflow-wrap: anywhere;
          color: #405248;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.5;
        }

        .mr-resend {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          margin-top: 15px;
          padding: 0 14px;
          border: 1px solid #BBDCCB;
          border-radius: 9px;
          background: #F0FBF5;
          color: #07865C;
          font: 700 11px 'Inter',sans-serif;
          cursor: pointer;
          transition: .2s ease;
        }

        .mr-resend:hover:not(:disabled) {
          border-color: #059669;
          background: #DCFCEB;
          transform: translateY(-1px);
        }

        .mr-resend:disabled { cursor: not-allowed; opacity: .6; }

        .mr-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 65px 22px;
          border: 1px dashed #D5E3D9;
          border-radius: 17px;
          background: #fff;
          text-align: center;
        }

        .mr-empty-icon {
          display: grid;
          place-items: center;
          width: 65px;
          height: 65px;
          margin-bottom: 17px;
          border-radius: 20px;
          background: #ECFDF5;
          color: #059669;
        }

        .mr-empty-title {
          color: #263D30;
          font-family: 'Manrope',sans-serif;
          font-size: 17px;
          font-weight: 800;
        }

        .mr-empty-text {
          max-width: 340px;
          margin-top: 8px;
          color: #8A978F;
          font-size: 12px;
          line-height: 1.7;
        }

        .mr-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
          padding: 12px 15px;
          border: 1px solid;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .mr-alert.error {
          border-color: #FECACA;
          background: #FEF2F2;
          color: #B91C1C;
        }

        .mr-alert.success {
          border-color: #A7F3D0;
          background: #ECFDF5;
          color: #047857;
        }

        .mr-retry {
          margin-top: 14px;
          padding: 10px 18px;
          border: 0;
          border-radius: 9px;
          background: #059669;
          color: white;
          font: 700 11px 'Inter',sans-serif;
          cursor: pointer;
        }

        .mr-skeleton {
          height: 180px;
          margin-bottom: 14px;
          border: 1px solid #E8EEEA;
          border-radius: 17px;
          background: linear-gradient(90deg,#fff 25%,#F0F5F1 50%,#fff 75%);
          background-size: 200% 100%;
          animation: mrShimmer 1.4s infinite;
        }

        @keyframes mrShimmer {
          to { background-position: -200% 0; }
        }

        .mr-footer {
          margin-top: 40px;
          color: #A0AAA3;
          font-size: 10px;
          text-align: center;
        }

        @media (max-width: 850px) {
          .mr-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .mr-meta { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .mr-money-list { grid-template-columns: 1fr; }
        }

        @media (max-width: 560px) {
          .mr-root { padding: 25px 15px 60px; }
          .mr-topline { margin-bottom: 29px; }
          .mr-brand { font-size: 15px; }
          .mr-heading { margin-bottom: 23px; }
          .mr-title { letter-spacing: -1.2px; }
          .mr-stats { gap: 10px; }
          .mr-stat { padding: 15px; }
          .mr-stat-number { font-size: 25px; }
          .mr-stat-label { font-size: 10px; }
          .mr-card { padding: 16px; }
          .mr-card-top { flex-direction: column; }
          .mr-status { align-self: flex-start; }
          .mr-meta { gap: 13px; padding: 13px; }
          .mr-progress-label { font-size: 8px; }
          .mr-filter { padding: 0 11px; }
          .mr-money-trigger { padding: 15px; }
          .mr-money-content { padding: 14px; }
          .mr-money-trigger-right { gap: 7px; }
          .mr-money-description { max-width: 210px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mr-root *, .mr-root *::before, .mr-root *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <main className="mr-root">
        <div className="mr-wrap">

          <div className="mr-topline">
            <div className="mr-brand">
              <div className="mr-brand-icon">
                <Icon name="box" size={22} />
              </div>
              <div>
                DWJD
                <small>Donation platform</small>
              </div>
            </div>

            <button
              className="mr-refresh"
              onClick={() => {
                fetchRequests();
                if (moneyExpanded) fetchMoneyRequests();
              }}
              disabled={loading || moneyLoading}
            >
              <Icon name="refresh" size={15} />
              Refresh
            </button>
          </div>

          <header className="mr-heading">
            <div className="mr-eyebrow">
              <span className="mr-eyebrow-dot" />
              Your donation activity
            </div>

            <h1 className="mr-title">
              My <span>Requests.</span>
            </h1>

            <p className="mr-subtitle">
              Follow your donations from pickup to successful delivery.
              Every contribution makes a difference.
            </p>
          </header>

          {error && (
            <div className="mr-alert error" role="alert">
              <Icon name="alert" size={18} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="mr-alert success" role="status">
              <Icon name="check" size={18} />
              <span>{notice}</span>
            </div>
          )}

          {/* Money donation history - view only */}
          <section className="mr-money-section">
            <button
              type="button"
              className="mr-money-trigger"
              onClick={() => setMoneyExpanded((value) => !value)}
              aria-expanded={moneyExpanded}
              aria-controls="mr-money-content"
            >
              <div className="mr-money-trigger-left">
                <div className="mr-money-icon">
                  <Icon name="wallet" size={23} />
                </div>

                <div>
                  <div className="mr-money-title">
                    Money Donation
                  </div>
                  <div className="mr-money-description">
                    View your occasion donation requests and their results.
                  </div>
                </div>
              </div>

              <div className="mr-money-trigger-right">
                {moneyLoaded && (
                  <span className="mr-money-count">{moneyTotal}</span>
                )}
                <span className={`mr-money-chevron ${moneyExpanded ? "open" : ""}`}>
                  <Icon name="arrow" size={17} />
                </span>
              </div>
            </button>

            {moneyExpanded && (
              <div
                className="mr-money-content"
                id="mr-money-content"
              >
                <div className="mr-money-toolbar">
                  <div className="mr-money-toolbar-title">
                    Your occasion donation history
                  </div>

                  <button
                    type="button"
                    className="mr-money-refresh"
                    onClick={fetchMoneyRequests}
                    disabled={moneyLoading}
                  >
                    <Icon name="refresh" size={14} />
                    Refresh
                  </button>
                </div>

                {moneyLoading ? (
                  <div className="mr-money-list">
                    <div className="mr-money-skeleton" />
                    <div className="mr-money-skeleton" />
                  </div>
                ) : moneyError ? (
                  <div className="mr-money-error" role="alert">
                    {moneyError}
                    <button
                      type="button"
                      className="mr-retry"
                      onClick={fetchMoneyRequests}
                    >
                      Try again
                    </button>
                  </div>
                ) : moneyRequests.length === 0 ? (
                  <div className="mr-money-empty">
                    <strong>No money donation requests yet</strong>
                    Your occasion donation requests will appear here
                    after you submit one.
                  </div>
                ) : (
                  <div className="mr-money-list">
                    {moneyRequests.map((item, index) => {
                      const paymentStatus =
                        item.paymentStatus || "Not available";

                      const adminStatus =
                        item.adminStatus || "Not available";

                      const greetingStatus =
                        item.greetingStatus || "Not available";

                      const rejectionReason =
                        item.rejectionReason ||
                        item.adminRejectionReason ||
                        item.reviewNote ||
                        item.rejection_note;

                      const refundStatus =
                        item.refundStatus || item.refund_status;

                      return (
                        <article
                          className="mr-money-card"
                          key={item._id || item.id || index}
                        >
                          <div className="mr-money-card-top">
                            <div>
                              <div className="mr-money-occasion">
                                {item.occasionTitle ||
                                  prettyStatus(item.occasionType) ||
                                  "Occasion Donation"}
                              </div>

                              <div className="mr-money-recipient">
                                For {item.recipientName || "Recipient not specified"}
                              </div>
                            </div>

                            <StatusPill value={adminStatus} />
                          </div>

                          <div className="mr-money-amount">
                            ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                          </div>

                          <div className="mr-money-details">
                            <div>
                              <div className="mr-money-label">
                                Occasion date
                              </div>
                              <div className="mr-money-value">
                                {formatDate(item.occasionDate)}
                              </div>
                            </div>

                            <div>
                              <div className="mr-money-label">
                                Scheduled wish
                              </div>
                              <div className="mr-money-value">
                                {formatDateTime(
                                  item.scheduledAt || item.scheduledWishTime
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="mr-money-label">
                                Payment
                              </div>
                              <StatusPill value={paymentStatus} />
                            </div>

                            <div>
                              <div className="mr-money-label">
                                Admin review
                              </div>
                              <StatusPill value={adminStatus} />
                            </div>

                            <div>
                              <div className="mr-money-label">
                                Greeting status
                              </div>
                              <StatusPill value={greetingStatus} />
                            </div>

                            <div>
                              <div className="mr-money-label">
                                Submitted on
                              </div>
                              <div className="mr-money-value">
                                {formatDate(item.createdAt)}
                              </div>
                            </div>

                            {(item.referenceCode || item._id) && (
                              <div>
                                <div className="mr-money-label">
                                  Reference
                                </div>
                                <div className="mr-money-value">
                                  {item.referenceCode || item._id}
                                </div>
                              </div>
                            )}

                            {refundStatus && (
                              <div>
                                <div className="mr-money-label">
                                  Refund
                                </div>
                                <StatusPill value={refundStatus} />
                              </div>
                            )}
                          </div>

                          {rejectionReason && (
                            <div className="mr-money-reason">
                              <strong>Review note: </strong>
                              {rejectionReason}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {loading ? (
            <>
              <div className="mr-stats">
                {[1, 2, 3, 4].map((n) => (
                  <div className="mr-skeleton" key={n} />
                ))}
              </div>
              <div className="mr-skeleton" />
              <div className="mr-skeleton" />
            </>
          ) : error && requests.length === 0 ? (
            <div className="mr-empty">
              <div className="mr-empty-icon">
                <Icon name="alert" size={28} />
              </div>
              <div className="mr-empty-title">
                Unable to load requests
              </div>
              <p className="mr-empty-text">
                Please check your connection and try again.
              </p>
              <button className="mr-retry" onClick={fetchRequests}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <section className="mr-stats" aria-label="Request summary">
                {stats.map((stat) => (
                  <div
                    key={stat.key}
                    className="mr-stat"
                    role="button"
                    tabIndex={0}
                    onClick={() => setFilter(stat.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setFilter(stat.key);
                      }
                    }}
                    aria-label={`Filter ${stat.label}`}
                  >
                    <div className="mr-stat-top">
                      <div
                        className="mr-stat-icon"
                        style={{ background: stat.bg, color: stat.color }}
                      >
                        <Icon name={stat.icon} size={19} />
                      </div>
                    </div>

                    <div
                      className="mr-stat-number"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>

                    <div className="mr-stat-label">{stat.label}</div>
                  </div>
                ))}
              </section>

              <div className="mr-toolbar">
                <div className="mr-section-title">
                  Donation history
                </div>
                <div className="mr-count">
                  Showing {filtered.length} of {requests.length}
                </div>
              </div>

              <nav className="mr-filters" aria-label="Filter requests">
                {FILTERS.map((item) => (
                  <button
                    key={item.key}
                    className={`mr-filter ${filter === item.key ? "active" : ""}`}
                    onClick={() => setFilter(item.key)}
                    aria-pressed={filter === item.key}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {requests.length === 0 ? (
                <div className="mr-empty">
                  <div className="mr-empty-icon">
                    <Icon name="box" size={28} />
                  </div>
                  <div className="mr-empty-title">
                    No donations yet
                  </div>
                  <p className="mr-empty-text">
                    Your donation requests will appear here once you
                    make your first contribution.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="mr-empty">
                  <div className="mr-empty-icon">
                    <Icon name="search" size={28} />
                  </div>
                  <div className="mr-empty-title">
                    No matching requests
                  </div>
                  <p className="mr-empty-text">
                    There are no requests in this category.
                    Try selecting another filter.
                  </p>
                </div>
              ) : (
                <div className="mr-list">
                  {filtered.map((req, index) => {
                    const status =
                      STATUS_META[req.donation_status] ||
                      STATUS_META.not_picked;

                    const stepIndex = status.progress;

                    const steps = [
                      { key: "not_picked", label: "Pending" },
                      { key: "picked", label: "Picked up" },
                      { key: "collected", label: "Collected" },
                      { key: "delivered", label: "Delivered" },
                    ];

                    const showResend =
                      req.donation_status === "not_picked" &&
                      req.is_verified === false;

                    return (
                      <article
                        key={req._id}
                        className="mr-card"
                        style={{ animationDelay: `${index * 65}ms` }}
                      >
                        <div className="mr-card-top">
                          <div className="mr-card-left">
                            <div className="mr-item-icon">
                              {ITEM_ICON[req.item_type] || "📦"}
                            </div>

                            <div>
                              <div className="mr-item-name">
                                {req.item_name || "Donation"}
                              </div>
                              <div className="mr-item-type">
                                {req.item_type || "Other"} donation
                              </div>
                            </div>
                          </div>

                          <div
                            className="mr-status"
                            style={{
                              color: status.color,
                              background: status.bg,
                              borderColor: status.border,
                            }}
                          >
                            <Icon name={status.icon} size={14} />
                            {status.label}
                          </div>
                        </div>

                        <div className="mr-divider" />

                        <div className="mr-progress-heading">
                          <span>DELIVERY PROGRESS</span>
                          <strong>
                            {Math.round((stepIndex + 1) / 4 * 100)}% complete
                          </strong>
                        </div>

                        <div className="mr-progress">
                          {steps.map((step, i) => {
                            const done = i <= stepIndex;

                            return (
                              <div
                                key={step.key}
                                className={`mr-progress-step ${done ? "done" : ""}`}
                              >
                                <div className="mr-progress-dot">
                                  {done ? "✓" : ""}
                                </div>
                                <div className="mr-progress-label">
                                  {step.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mr-meta">
                          <div>
                            <div className="mr-meta-label">Quantity</div>
                            <div className="mr-meta-value">
                              {req.quantity ?? "—"}
                            </div>
                          </div>

                          <div>
                            <div className="mr-meta-label">Price</div>
                            <div className="mr-meta-value">
                              {req.price_type === "free"
                                ? "Free donation"
                                : `₹${req.price_amount ?? 0}`}
                            </div>
                          </div>

                          <div>
                            <div className="mr-meta-label">Created on</div>
                            <div className="mr-meta-value">
                              {formatDate(req.createdAt)}
                            </div>
                          </div>

                          <div>
                            <div className="mr-meta-label">Pickup location</div>
                            <div className="mr-meta-value">
                              {req.pickup_location || "Not specified"}
                            </div>
                          </div>
                        </div>

                        {showResend && (
                          <button
                            className="mr-resend"
                            disabled={resending === req._id}
                            onClick={() => resendOtp(req._id)}
                          >
                            <Icon name="mail" size={15} />
                            {resending === req._id
                              ? "Sending OTP..."
                              : "Resend verification OTP"}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <footer className="mr-footer">
            © {new Date().getFullYear()} DWJD · Making a difference,
            one donation at a time.
          </footer>
        </div>
      </main>
    </>
  );
}
