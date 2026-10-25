
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const BASE_URL =
  "https://back-end-project-group.onrender.com";

const ACCENTS = [
  { color: "#7cf7c4", rgb: "124,247,196" },
  { color: "#a5a4ff", rgb: "165,164,255" },
  { color: "#ffbd7a", rgb: "255,189,122" },
  { color: "#ff91c8", rgb: "255,145,200" },
  { color: "#83d9ff", rgb: "131,217,255" },
];

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "DW"
  );
}

function getDriveFileId(url = "") {
  const value = String(url).trim();

  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/i,
    /drive\.google\.com\/thumbnail\?[^#]*\bid=([^&#]+)/i,
    /[?&]id=([^&#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }

  return "";
}

function getCampaignImageUrl(url = "") {
  const value = String(url).trim();
  if (!value) return "";

  const fileId = getDriveFileId(value);

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      fileId
    )}&sz=w1200`;
  }

  return value;
}

/* Artwork image: fully visible, centered and never cropped. */
function CampaignArtwork({ ad, index, accent }) {
  const imageUrl = getCampaignImageUrl(ad.image_url);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div
      className="partner-card-visual"
      style={{
        "--accent": accent.color,
        "--accent-rgb": accent.rgb,
      }}
    >
      <span className="partner-card-number">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="partner-card-orbit orbit-a" />
      <span className="partner-card-orbit orbit-b" />

      {imageUrl && !imageFailed ? (
        <img
          key={imageUrl}
          className="partner-card-image"
          src={imageUrl}
          alt={`${ad.brand_name || "Partner"} campaign`}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="partner-brand-monogram">
          {getInitials(ad.brand_name)}
        </div>
      )}

      <div className="partner-visual-label">
        <span />
        PARTNER SPOTLIGHT
      </div>
    </div>
  );
}

function CampaignModal({ campaign, onClose }) {
  const imageUrl = getCampaignImageUrl(campaign.image_url);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <motion.div
      className="partner-modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className="partner-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-title"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
      >
        <button
          type="button"
          className="partner-modal-close"
          onClick={onClose}
          aria-label="Close campaign details"
        >
          ×
        </button>

        <div className="partner-modal-art">
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={`${campaign.brand_name || "Partner"} campaign`}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span>{getInitials(campaign.brand_name)}</span>
          )}
        </div>

        <p className="partner-kicker">LIVE PARTNER CAMPAIGN</p>

        <h3 id="partner-modal-title">
          {campaign.title ||
            campaign.brand_name ||
            "Partner campaign"}
        </h3>

        <p className="partner-modal-brand">
          {campaign.brand_name || "Community partner"}
        </p>

        <p className="partner-modal-description">
          {campaign.description ||
            "Together, we can make a meaningful difference."}
        </p>

        <div className="partner-modal-details">
          {campaign.start_date && (
            <div>
              <span>CAMPAIGN START</span>
              <strong>{formatDate(campaign.start_date)}</strong>
            </div>
          )}

          {campaign.end_date && (
            <div>
              <span>CAMPAIGN END</span>
              <strong>{formatDate(campaign.end_date)}</strong>
            </div>
          )}

          {campaign.collaboration_type && (
            <div>
              <span>COLLABORATION</span>
              <strong>
                {String(campaign.collaboration_type).replace(
                  /[_-]/g,
                  " "
                )}
              </strong>
            </div>
          )}
        </div>

        <button
          type="button"
          className="partner-modal-done"
          onClick={onClose}
        >
          Back to partners <span>←</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const reduceMotion = useReducedMotion();

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${BASE_URL}/advertisements/active`
      );

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data.advertisements)) {
        throw new Error(
          data.message || "Unexpected promotions response."
        );
      }

      setAds(data.advertisements);
    } catch (err) {
      console.error("Campaign loading failed:", err);
      setError(
        "We couldn't load the live campaigns. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  return (
    <>
      <style>{styles}</style>

      <section className="partner-section">
        <div className="partner-grid-bg" />
        <div className="partner-glow" />

        <div className="partner-shell">
          <motion.header
            className="partner-header"
            initial={
              reduceMotion ? false : { opacity: 0, y: 20 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="partner-eyebrow">
              <span className="partner-live-pip" />
              GOODNESS IN MOTION
              <span className="eyebrow-divider" />
              LIVE PARTNER NETWORK
            </div>

            <div className="partner-heading-row">
              <div>
                <p className="partner-kicker">
                  THE PEOPLE BEHIND THE PURPOSE
                </p>
                <h2 className="partner-heading">
                  Good things happen
                  <br />
                  <span>when we team up.</span>
                </h2>
              </div>

              <p className="partner-intro">
                Meet the brands helping turn everyday generosity
                into real meals, meaningful action, and less food
                waste.
              </p>
            </div>

            <div className="partner-meta-row">
              <span className="partner-count">
                <span className="partner-live-pip" />
                {String(ads.length).padStart(2, "0")} ACTIVE{" "}
                {ads.length === 1 ? "CAMPAIGN" : "CAMPAIGNS"}
              </span>
              <span className="partner-meta-note">
                A little support. A lasting impact.
              </span>
            </div>
          </motion.header>

          {loading ? (
            <div className="partner-state" role="status">
              <div className="partner-loader">
                <span />
                <span />
                <span />
              </div>
              <h3>Finding the good in progress</h3>
              <p>Loading live campaigns…</p>
            </div>
          ) : error ? (
            <div className="partner-state" role="alert">
              <h3>Campaigns are temporarily unavailable</h3>
              <p>{error}</p>
              <button
                className="partner-retry"
                onClick={fetchPromotions}
              >
                Try again ↗
              </button>
            </div>
          ) : ads.length === 0 ? (
            <div className="partner-state">
              <h3>Our next collaboration is on its way.</h3>
              <p>Check back soon to see our new campaigns.</p>
              <button
                className="partner-retry"
                onClick={fetchPromotions}
              >
                Refresh campaigns ↻
              </button>
            </div>
          ) : (
            <motion.div
              className="partner-campaign-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08 }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: reduceMotion ? 0 : 0.08,
                  },
                },
              }}
            >
              {ads.map((ad, index) => {
                const accent = ACCENTS[index % ACCENTS.length];

                return (
                  <motion.article
                    className="partner-card"
                    key={ad._id || `${ad.brand_name}-${index}`}
                    style={{
                      "--accent": accent.color,
                      "--accent-rgb": accent.rgb,
                    }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5 },
                      },
                    }}
                    whileHover={
                      reduceMotion ? undefined : { y: -5 }
                    }
                  >
                    <CampaignArtwork
                      ad={ad}
                      index={index}
                      accent={accent}
                    />

                    <div className="partner-card-content">
                      <div className="partner-card-topline">
                        <span className="partner-status">
                          <span />
                          LIVE CAMPAIGN
                        </span>

                        <span className="partner-type">
                          {String(
                            ad.collaboration_type ||
                              "Paid Promotion"
                          ).replace(/[_-]/g, " ")}
                        </span>
                      </div>

                      <p className="partner-brand-name">
                        {ad.brand_name || "Community partner"}
                      </p>

                      <h3 className="partner-card-title">
                        {ad.title || "Making a difference together"}
                      </h3>

                      <p className="partner-card-description">
                        {ad.description ||
                          "Working together to support food donations and create a stronger community."}
                      </p>

                      <div className="partner-card-footer">
                        <div className="partner-date">
                          <span className="partner-date-icon">
                            ↗
                          </span>
                          <span>
                            {ad.end_date
                              ? `Campaign ends ${formatDate(
                                  ad.end_date
                                )}`
                              : "Making an impact today"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="partner-open-button"
                          aria-label={`View ${
                            ad.title || ad.brand_name || "campaign"
                          } details`}
                          onClick={() => setSelected(ad)}
                        >
                          ↗
                        </button>
                      </div>
                    </div>

                    <div className="partner-card-bottom-line" />
                  </motion.article>
                );
              })}
            </motion.div>
          )}

          {!loading && !error && ads.length > 0 && (
            <div className="partner-footer-note">
              <span>✳</span>
              Every partnership can help make a meal matter.
              <span className="partner-footer-rule" />
              <span>{ads.length} partners and counting</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <CampaignModal
              key={selected._id || selected.brand_name}
              campaign={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </section>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

.partner-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(60px, 8vw, 110px) 0;
  background: #080b10;
  color: #f4f7f5;
  font-family: 'DM Sans', sans-serif;
}

.partner-section *,
.partner-section *::before,
.partner-section *::after {
  box-sizing: border-box;
}

.partner-grid-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  opacity: .18;
  background-image:
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size: 58px 58px;
}

.partner-glow {
  position: absolute;
  z-index: -1;
  top: -260px;
  left: -150px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: rgba(67,230,166,.12);
  filter: blur(110px);
  pointer-events: none;
}

.partner-shell {
  width: min(1200px, calc(100% - 64px));
  margin: 0 auto;
}

.partner-header {
  margin-bottom: 36px;
}

.partner-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 13px;
  border: 1px solid rgba(124,247,196,.19);
  border-radius: 99px;
  background: rgba(124,247,196,.05);
  color: #b6c9c1;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
}

.partner-live-pip {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: #7cf7c4;
  box-shadow: 0 0 12px rgba(124,247,196,.8);
  animation: partnerPulse 2s infinite;
}

.eyebrow-divider {
  height: 13px;
  width: 1px;
  background: rgba(255,255,255,.2);
}

.partner-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 36px;
  margin-top: 28px;
}

.partner-kicker {
  margin: 0 0 14px;
  color: #7cf7c4;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .17em;
}

.partner-heading {
  margin: 0;
  font: 700 clamp(38px, 6vw, 72px)/1.05 'Manrope', sans-serif;
  letter-spacing: -.06em;
}

.partner-heading > span {
  color: transparent;
  background: linear-gradient(100deg, #7cf7c4, #c1f8db 50%, #a5a4ff);
  background-clip: text;
  -webkit-background-clip: text;
}

.partner-intro {
  max-width: 310px;
  margin: 0 0 6px;
  color: #8c9894;
  font-size: 13px;
  line-height: 1.85;
}

.partner-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 32px;
  padding: 18px 0;
  border-top: 1px solid rgba(255,255,255,.1);
}

.partner-count {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #b4c2bc;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .13em;
}

.partner-meta-note {
  color: #65716c;
  font-size: 12px;
}

.partner-campaign-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.partner-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.015));
  box-shadow: 0 16px 44px rgba(0,0,0,.15);
  transition: border-color .25s, box-shadow .25s;
}

.partner-card:hover {
  border-color: rgba(var(--accent-rgb), .42);
  box-shadow: 0 24px 60px rgba(0,0,0,.28);
}

/* Image area: keep its full proportions visible. */
.partner-card-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 270px;
  flex: 0 0 270px;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(ellipse at 50% 48%, rgba(var(--accent-rgb), .15), transparent 62%),
    linear-gradient(135deg, #101c1b, #080d11 75%);
  border-bottom: 1px solid rgba(255,255,255,.07);
}

.partner-card-visual::before {
  content: "";
  position: absolute;
  z-index: -1;
  width: 220px;
  height: 220px;
  border: 1px solid rgba(var(--accent-rgb), .12);
  border-radius: 50%;
}

.partner-card-visual::after {
  content: "";
  position: absolute;
  z-index: 2;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.035), transparent 48%);
  pointer-events: none;
}

.partner-card-number {
  position: absolute;
  z-index: 3;
  top: 17px;
  left: 18px;
  color: rgba(255,255,255,.5);
  font: 800 12px 'Manrope', sans-serif;
  letter-spacing: .1em;
}

.partner-card-orbit {
  position: absolute;
  width: 155px;
  height: 155px;
  border: 1px solid rgba(var(--accent-rgb), .13);
  border-radius: 50%;
  pointer-events: none;
}

.orbit-a {
  width: 205px;
  height: 205px;
  transform: scaleX(1.15);
}

.orbit-b {
  width: 150px;
  height: 150px;
  border-style: dashed;
  opacity: .6;
}

/*
  Main fix:
  The image can grow in both dimensions but remains within
  the artwork area. "contain" preserves the original aspect ratio.
*/
.partner-card-image {
  position: relative;
  z-index: 1;
  display: block;
  width: auto;
  height: auto;
  max-width: min(82%, 260px);
  max-height: 200px;
  object-fit: contain;
  object-position: center;
  border-radius: 12px;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,.22));
  transition: transform .45s ease;
}

.partner-card:hover .partner-card-image {
  transform: scale(1.025);
}

.partner-brand-monogram {
  position: relative;
  z-index: 1;
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  border: 1px solid rgba(var(--accent-rgb), .45);
  border-radius: 24px;
  background: rgba(var(--accent-rgb), .1);
  color: var(--accent);
  font: 800 27px 'Manrope', sans-serif;
}

.partner-visual-label {
  position: absolute;
  z-index: 3;
  bottom: 16px;
  left: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ba8a2;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .13em;
}

.partner-visual-label > span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px rgba(var(--accent-rgb), .65);
}

.partner-card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 22px 21px 18px;
}

.partner-card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.partner-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
}

.partner-status > span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}

.partner-type {
  max-width: 55%;
  overflow: hidden;
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 99px;
  color: #8d9993;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: capitalize;
}

.partner-brand-name {
  margin: 21px 0 7px;
  color: #8f9e96;
  font-size: 11px;
  font-weight: 600;
}

.partner-card-title {
  margin: 0;
  color: #f2f6f3;
  font: 800 23px/1.28 'Manrope', sans-serif;
  letter-spacing: -.045em;
  overflow-wrap: anywhere;
}

.partner-card-description {
  display: -webkit-box;
  min-height: 62px;
  margin: 12px 0 20px;
  overflow: hidden;
  color: #89958f;
  font-size: 12px;
  line-height: 1.75;
  overflow-wrap: anywhere;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.partner-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,.075);
}

.partner-date {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #78857e;
  font-size: 10px;
  line-height: 1.5;
}

.partner-date-icon {
  display: grid;
  flex: 0 0 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(var(--accent-rgb), .2);
  border-radius: 10px;
  color: var(--accent);
}

.partner-open-button {
  display: grid;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid rgba(var(--accent-rgb), .38);
  border-radius: 14px;
  background: rgba(var(--accent-rgb), .08);
  color: var(--accent);
  font-size: 19px;
  cursor: pointer;
  transition: background .2s, transform .2s;
}

.partner-open-button:hover {
  background: var(--accent);
  color: #08100d;
  transform: rotate(45deg);
}

.partner-card-bottom-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: .55;
}

.partner-footer-note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  color: #748179;
  font-size: 11px;
}

.partner-footer-note > span:first-child {
  color: #7cf7c4;
  font-size: 16px;
}

.partner-footer-rule {
  height: 1px;
  flex: 1;
  background: rgba(255,255,255,.09);
}

.partner-state {
  min-height: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 24px;
  background: rgba(255,255,255,.025);
  text-align: center;
}

.partner-state h3 {
  margin: 18px 0 8px;
  font: 700 22px 'Manrope', sans-serif;
}

.partner-state p {
  max-width: 430px;
  margin: 0;
  color: #84918a;
  font-size: 13px;
  line-height: 1.8;
}

.partner-loader {
  display: flex;
  gap: 7px;
}

.partner-loader span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7cf7c4;
  animation: partnerBounce .8s ease-in-out infinite alternate;
}

.partner-loader span:nth-child(2) {
  animation-delay: .18s;
}

.partner-loader span:nth-child(3) {
  animation-delay: .36s;
}

.partner-retry {
  margin-top: 22px;
  padding: 12px 16px;
  border: 1px solid rgba(124,247,196,.3);
  border-radius: 12px;
  background: rgba(124,247,196,.08);
  color: #b9f9dc;
  font: 600 12px 'DM Sans', sans-serif;
  cursor: pointer;
}

.partner-modal-backdrop {
  position: fixed;
  z-index: 9999;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2,5,7,.8);
  backdrop-filter: blur(12px);
}

.partner-modal {
  position: relative;
  width: min(520px, 100%);
  max-height: 88vh;
  overflow: auto;
  padding: 28px;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 26px;
  background: #0e1418;
  box-shadow: 0 35px 100px rgba(0,0,0,.5);
}

.partner-modal-close {
  position: absolute;
  z-index: 2;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 12px;
  background: rgba(0,0,0,.4);
  color: white;
  font-size: 23px;
  cursor: pointer;
}

.partner-modal-art {
  height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  background: radial-gradient(circle, rgba(124,247,196,.12), transparent 70%), #0a1013;
}

/* Same full-image-fit behavior in the modal. */
.partner-modal-art img {
  display: block;
  width: auto;
  height: auto;
  max-width: 88%;
  max-height: 210px;
  object-fit: contain;
  object-position: center;
  border-radius: 12px;
}

.partner-modal-art > span {
  color: #7cf7c4;
  font: 800 34px 'Manrope', sans-serif;
}

.partner-modal .partner-kicker {
  margin-bottom: 12px;
}

.partner-modal h3 {
  margin: 0;
  font: 700 30px/1.15 'Manrope', sans-serif;
  letter-spacing: -.05em;
}

.partner-modal-brand {
  margin: 9px 0;
  color: #7cf7c4;
  font-size: 12px;
}

.partner-modal-description {
  color: #9aa69f;
  font-size: 13px;
  line-height: 1.8;
}

.partner-modal-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 20px;
}

.partner-modal-details > div {
  padding: 13px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px;
  background: rgba(255,255,255,.025);
}

.partner-modal-details span {
  display: block;
  margin-bottom: 7px;
  color: #748179;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
}

.partner-modal-details strong {
  color: #dfe8e2;
  font-size: 12px;
  text-transform: capitalize;
}

.partner-modal-done {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 22px;
  padding: 14px 16px;
  border: 0;
  border-radius: 12px;
  background: #7cf7c4;
  color: #07120d;
  font: 700 12px 'DM Sans', sans-serif;
  cursor: pointer;
}

.partner-open-button:focus-visible,
.partner-retry:focus-visible,
.partner-modal button:focus-visible {
  outline: 2px solid #7cf7c4;
  outline-offset: 3px;
}

@keyframes partnerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .45; }
}

@keyframes partnerBounce {
  to { transform: translateY(-7px); opacity: .5; }
}

@media (max-width: 900px) {
  .partner-shell {
    width: min(760px, calc(100% - 40px));
  }

  .partner-heading-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .partner-campaign-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .partner-section {
    padding: 58px 0;
  }

  .partner-shell {
    width: calc(100% - 28px);
  }

  .partner-eyebrow {
    gap: 7px;
    padding: 8px 9px;
    font-size: 8px;
    letter-spacing: .07em;
  }

  .partner-heading {
    font-size: clamp(36px, 9.5vw, 50px);
  }

  .partner-meta-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .partner-campaign-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .partner-card-visual {
    height: 270px;
    flex-basis: 270px;
  }

  .partner-card-image {
    max-width: 82%;
    max-height: 200px;
  }

  .partner-card-content {
    padding: 20px 19px 18px;
  }

  .partner-card-title {
    font-size: 22px;
  }

  .partner-footer-note {
    flex-wrap: wrap;
    line-height: 1.6;
  }

  .partner-modal {
    padding: 22px;
  }

  .partner-modal-art {
    height: 220px;
  }

  .partner-modal-art img {
    max-height: 200px;
  }

  .partner-modal h3 {
    font-size: 25px;
  }

  .partner-modal-details {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .partner-section *,
  .partner-section *::before,
  .partner-section *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
`;
