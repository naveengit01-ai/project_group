
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const BASE_URL =
  "https://back-end-project-group.onrender.com";

const ACCENTS = [
  { color: "#7cf7c4", rgb: "124,247,196" },
  { color: "#a5a4ff", rgb: "165,164,255" },
  { color: "#ffbd7a", rgb: "255,189,122" },
  { color: "#ff91c8", rgb: "255,145,200" },
  { color: "#83d9ff", rgb: "131,217,255" },
];

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "DW";

/* Convert Google Drive links into image thumbnail links. */
const getDriveFileId = (url = "") => {
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
};

const getCampaignImageUrl = (url = "") => {
  const value = String(url).trim();

  if (!value) return "";

  const fileId = getDriveFileId(value);

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      fileId
    )}&sz=w1200`;
  }

  return value;
};

/* Reusable campaign artwork with a reliable fallback. */
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
        <div
          className="partner-brand-monogram"
          aria-label={`${ad.brand_name || "Partner"} initials`}
        >
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

/* Campaign details modal. */
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
        if (event.target === event.currentTarget) {
          onClose();
        }
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

        <p className="partner-kicker">
          LIVE PARTNER CAMPAIGN
        </p>

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
        throw new Error(
          `Request failed (${response.status})`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.advertisements)) {
        throw new Error(
          data.message ||
            "The promotions response was unexpected."
        );
      }

      setAds(data.advertisements);
    } catch (err) {
      console.error("Campaign loading failed:", err);

      setError(
        "We couldn't load the live partner campaigns. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    if (!selected) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selected]);

  const countLabel = useMemo(
    () =>
      `${String(ads.length).padStart(2, "0")} ${
        ads.length === 1
          ? "ACTIVE CAMPAIGN"
          : "ACTIVE CAMPAIGNS"
      }`,
    [ads.length]
  );

  return (
    <>
      <style>{css}</style>

      <section
        className="partner-section"
        aria-labelledby="partner-heading"
      >
        <div className="partner-grid-bg" aria-hidden="true" />

        <div
          className="partner-glow partner-glow-one"
          aria-hidden="true"
        />

        <div
          className="partner-glow partner-glow-two"
          aria-hidden="true"
        />

        <div className="partner-shell">
          <motion.header
            className="partner-header"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 24 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="partner-eyebrow">
              <span className="partner-live-pip" />
              <span>Goodness in motion</span>
              <span className="partner-eyebrow-divider" />
              <span>Live partner network</span>
            </div>

            <div className="partner-heading-row">
              <div>
                <p className="partner-kicker">
                  THE PEOPLE BEHIND THE PURPOSE
                </p>

                <h2
                  id="partner-heading"
                  className="partner-heading"
                >
                  Good things happen
                  <br className="partner-mobile-break" />{" "}
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
              <div className="partner-count">
                <span className="partner-count-dot" />
                {countLabel}
              </div>

              <div className="partner-meta-note">
                A little support. A lasting impact.
              </div>
            </div>
          </motion.header>

          {loading ? (
            <div
              className="partner-state"
              role="status"
              aria-live="polite"
            >
              <div className="partner-loader">
                <span />
                <span />
                <span />
              </div>

              <h3>Finding the good in progress</h3>
              <p>Loading verified live campaigns…</p>
            </div>
          ) : error ? (
            <div
              className="partner-state partner-state-error"
              role="alert"
            >
              <div className="partner-state-icon">↻</div>

              <h3>Our partners are just out of reach</h3>
              <p>{error}</p>

              <button
                type="button"
                className="partner-retry"
                onClick={fetchPromotions}
              >
                Try again <span>↗</span>
              </button>
            </div>
          ) : ads.length === 0 ? (
            <div className="partner-empty">
              <div
                className="partner-empty-art"
                aria-hidden="true"
              >
                <span className="empty-ring empty-ring-one" />
                <span className="empty-ring empty-ring-two" />
                <span className="empty-star">✳</span>
                <span className="empty-seed">✦</span>
              </div>

              <p className="partner-kicker">
                GOOD THINGS ARE GROWING
              </p>

              <h3>
                Our next collaboration is on its way.
              </h3>

              <p>
                There are no live campaigns at the moment.
                Check back soon to see who’s joining the mission.
              </p>

              <button
                type="button"
                className="partner-retry"
                onClick={fetchPromotions}
              >
                Refresh campaigns <span>↻</span>
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
                    staggerChildren: reduceMotion ? 0 : 0.09,
                  },
                },
              }}
            >
              {ads.map((ad, index) => {
                const accent =
                  ACCENTS[index % ACCENTS.length];

                return (
                  <motion.article
                    className="partner-card"
                    key={ad._id || `${ad.brand_name}-${index}`}
                    style={{
                      "--accent": accent.color,
                      "--accent-rgb": accent.rgb,
                    }}
                    variants={{
                      hidden: { opacity: 0, y: 22 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.55,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                    whileHover={
                      reduceMotion ? undefined : { y: -7 }
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

                        {ad.collaboration_type && (
                          <span className="partner-type">
                            {String(
                              ad.collaboration_type
                            ).replace(/[_-]/g, " ")}
                          </span>
                        )}
                      </div>

                      <p className="partner-brand-name">
                        {ad.brand_name || "Community partner"}
                      </p>

                      <h3 className="partner-card-title">
                        {ad.title ||
                          "Making a difference together"}
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
                          aria-label={`View details for ${
                            ad.title ||
                            ad.brand_name ||
                            "campaign"
                          }`}
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
              <span className="partner-footer-mark">✳</span>

              <span>
                Every partnership can help make a meal matter.
              </span>

              <span className="partner-footer-rule" />

              <span className="partner-footer-count">
                {ads.length}{" "}
                {ads.length === 1 ? "partner" : "partners"} and
                counting
              </span>
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

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

.partner-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #080b10;
  color: #f4f7f5;
  padding: clamp(72px, 9vw, 126px) 0 clamp(68px, 8vw, 104px);
  font-family: 'DM Sans', sans-serif;
}

.partner-section * {
  box-sizing: border-box;
}

.partner-grid-bg {
  position: absolute;
  inset: 0;
  z-index: -3;
  opacity: .22;
  background-image:
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size: 58px 58px;
  mask-image: linear-gradient(to bottom, black, transparent 95%);
}

.partner-glow {
  position: absolute;
  z-index: -2;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(110px);
  pointer-events: none;
}

.partner-glow-one {
  top: -250px;
  left: -180px;
  background: rgba(67,230,166,.13);
}

.partner-glow-two {
  right: -220px;
  bottom: -200px;
  background: rgba(123,111,255,.12);
}

.partner-shell {
  width: min(1200px, calc(100% - 64px));
  margin: 0 auto;
}

.partner-header {
  margin-bottom: 38px;
}

.partner-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(124,247,196,.19);
  background: rgba(124,247,196,.055);
  border-radius: 100px;
  padding: 9px 14px;
  color: #b6c9c1;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.partner-live-pip,
.partner-count-dot {
  width: 7px;
  height: 7px;
  display: inline-block;
  border-radius: 50%;
  background: #7cf7c4;
  box-shadow: 0 0 14px rgba(124,247,196,.8);
  animation: partnerPulse 2s infinite;
}

.partner-eyebrow-divider {
  height: 13px;
  width: 1px;
  background: rgba(255,255,255,.2);
  margin: 0 2px;
}

.partner-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 44px;
  margin-top: 30px;
}

.partner-kicker {
  margin: 0 0 14px;
  color: #7cf7c4;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .19em;
  text-transform: uppercase;
}

.partner-heading {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: clamp(38px, 6.2vw, 76px);
  line-height: 1.04;
  font-weight: 700;
  letter-spacing: -.065em;
  max-width: 780px;
}

.partner-heading span {
  color: transparent;
  background: linear-gradient(100deg, #7cf7c4 5%, #c1f8db 42%, #a5a4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.partner-mobile-break {
  display: none;
}

.partner-intro {
  max-width: 310px;
  margin: 0 0 6px;
  color: #8c9894;
  font-size: 14px;
  line-height: 1.85;
}

.partner-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 34px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,.1);
}

.partner-count {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #b4c2bc;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
}

.partner-meta-note {
  font-size: 12px;
  color: #65716c;
}

.partner-campaign-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.partner-card {
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.105);
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(255,255,255,.065), rgba(255,255,255,.018) 48%, rgba(255,255,255,.025));
  box-shadow: 0 16px 44px rgba(0,0,0,.15);
  transition: border-color .25s, box-shadow .25s;
}

.partner-card:hover {
  border-color: rgba(var(--accent-rgb), .42);
  box-shadow: 0 24px 60px rgba(0,0,0,.3), 0 0 35px rgba(var(--accent-rgb),.055);
}

/* Artwork is fixed-height; image remains fully visible and uncropped. */
.partner-card-visual {
  height: 250px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(ellipse at 50% 55%, rgba(var(--accent-rgb), .16), transparent 60%),
    linear-gradient(135deg, #101c1b, #080d11 75%);
  border-bottom: 1px solid rgba(255,255,255,.07);
}

.partner-card-visual::before {
  content: "";
  position: absolute;
  z-index: -1;
  width: 210px;
  height: 210px;
  border: 1px solid rgba(var(--accent-rgb), .12);
  border-radius: 50%;
}

.partner-card-visual::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(135deg, rgba(255,255,255,.045), transparent 45%, rgba(0,0,0,.12));
  pointer-events: none;
}

.partner-card-number {
  position: absolute;
  top: 17px;
  left: 18px;
  z-index: 3;
  color: rgba(255,255,255,.48);
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .1em;
}

.partner-card-orbit {
  position: absolute;
  width: 142px;
  height: 142px;
  border: 1px solid rgba(var(--accent-rgb), .15);
  border-radius: 50%;
  pointer-events: none;
}

.orbit-a {
  width: 180px;
  height: 180px;
  transform: rotate(34deg) scaleX(1.2);
}

.orbit-b {
  width: 132px;
  height: 132px;
  border-style: dashed;
  opacity: .65;
  transform: rotate(-25deg) scaleX(1.3);
}

/* The image is contained, centered, and never stretched. */
.partner-card-image {
  position: relative;
  z-index: 1;
  display: block;
  width: auto;
  height: auto;
  max-width: 78%;
  max-height: 155px;
  object-fit: contain;
  object-position: center;
  border-radius: 10px;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,.25));
  transition: transform .6s cubic-bezier(.2,.7,.2,1);
}

.partner-card:hover .partner-card-image {
  transform: scale(1.04);
}

.partner-brand-monogram {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(var(--accent-rgb), .48);
  border-radius: 25px;
  background: linear-gradient(145deg, rgba(var(--accent-rgb), .22), rgba(8,11,16,.8));
  color: var(--accent);
  font-family: 'Manrope', sans-serif;
  font-size: 27px;
  font-weight: 800;
  box-shadow: 0 0 50px rgba(var(--accent-rgb), .13);
  transform: rotate(-7deg);
}

.partner-visual-label {
  position: absolute;
  bottom: 16px;
  left: 18px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ba8a2;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .13em;
}

.partner-visual-label span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px rgba(var(--accent-rgb), .65);
}

.partner-card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 22px 21px 18px;
}

.partner-card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
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

.partner-status span {
  width: 5px;
  height: 5px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 9px rgba(var(--accent-rgb), .7);
}

.partner-type {
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 100px;
  padding: 6px 9px;
  color: #8d9993;
  font-size: 9px;
  text-transform: capitalize;
}

.partner-brand-name {
  margin: 21px 0 7px;
  color: #8f9e96;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .035em;
}

.partner-card-title {
  margin: 0;
  color: #f2f6f3;
  font-family: 'Manrope', sans-serif;
  font-size: 23px;
  line-height: 1.28;
  font-weight: 800;
  letter-spacing: -.045em;
  overflow-wrap: anywhere;
}

.partner-card-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 62px;
  margin: 12px 0 20px;
  color: #89958f;
  font-size: 12px;
  line-height: 1.75;
  overflow-wrap: anywhere;
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
  place-items: center;
  flex: 0 0 30px;
  height: 30px;
  border: 1px solid rgba(var(--accent-rgb), .2);
  border-radius: 10px;
  color: var(--accent);
}

.partner-open-button {
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(var(--accent-rgb), .35);
  border-radius: 13px;
  background: rgba(var(--accent-rgb), .08);
  color: var(--accent);
  font-size: 18px;
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
  width: 100%;
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

.partner-footer-mark {
  color: #7cf7c4;
  font-size: 16px;
}

.partner-footer-rule {
  height: 1px;
  flex: 1;
  background: rgba(255,255,255,.09);
}

.partner-footer-count {
  color: #9ba79f;
  font-size: 10px;
  white-space: nowrap;
}

.partner-state {
  min-height: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 24px;
  background: rgba(255,255,255,.025);
}

.partner-state h3,
.partner-empty h3 {
  margin: 18px 0 8px;
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  letter-spacing: -.04em;
}

.partner-state p,
.partner-empty > p:not(.partner-kicker) {
  max-width: 430px;
  margin: 0;
  color: #84918a;
  font-size: 13px;
  line-height: 1.8;
}

.partner-loader {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 20px;
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

.partner-state-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255,145,145,.24);
  border-radius: 16px;
  color: #ffb3b3;
  font-size: 23px;
}

.partner-retry {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
  padding: 12px 16px;
  border: 1px solid rgba(124,247,196,.3);
  border-radius: 12px;
  background: rgba(124,247,196,.08);
  color: #b9f9dc;
  font: 600 12px 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background .2s, transform .2s;
}

.partner-retry:hover {
  background: rgba(124,247,196,.15);
  transform: translateY(-2px);
}

.partner-empty {
  position: relative;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 44px 20px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 24px;
  background: radial-gradient(ellipse at 50% 0%, rgba(124,247,196,.07), transparent 58%), rgba(255,255,255,.02);
  text-align: center;
}

.partner-empty-art {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  display: grid;
  place-items: center;
}

.empty-ring {
  position: absolute;
  border: 1px solid rgba(124,247,196,.3);
  border-radius: 50%;
  animation: partnerSpin 14s linear infinite;
}

.empty-ring-one {
  inset: 5px;
}

.empty-ring-two {
  inset: 18px;
  border-style: dashed;
  animation-direction: reverse;
}

.empty-star {
  color: #7cf7c4;
  font-size: 35px;
}

.empty-seed {
  position: absolute;
  right: 2px;
  top: 10px;
  color: #a5a4ff;
  font-size: 17px;
}

.partner-empty .partner-kicker {
  margin-bottom: 0;
}

.partner-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2,5,7,.78);
  backdrop-filter: blur(12px);
}

.partner-modal {
  position: relative;
  width: min(520px, 100%);
  max-height: min(88vh, 760px);
  overflow: auto;
  padding: 30px;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 26px;
  background: #0e1418;
  box-shadow: 0 35px 100px rgba(0,0,0,.5);
}

.partner-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 12px;
  background: rgba(0,0,0,.3);
  color: #fff;
  font-size: 23px;
  cursor: pointer;
}

.partner-modal-art {
  height: 180px;
  display: grid;
  place-items: center;
  margin-bottom: 25px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  background: radial-gradient(circle, rgba(124,247,196,.12), transparent 70%), rgba(255,255,255,.025);
}

.partner-modal-art img {
  display: block;
  max-width: 78%;
  max-height: 150px;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
}

.partner-modal-art span {
  color: #7cf7c4;
  font: 800 34px 'Manrope', sans-serif;
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
  justify-content: space-between;
  align-items: center;
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
  to {
    transform: translateY(-7px);
    opacity: .5;
  }
}

@keyframes partnerSpin {
  to { transform: rotate(360deg); }
}

@media (min-width: 1400px) {
  .partner-campaign-grid { gap: 22px; }
  .partner-card-visual { height: 250px; }
  .partner-card-content { padding: 24px; }
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

  .partner-intro { max-width: 540px; }

  .partner-campaign-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .partner-section { padding: 68px 0 64px; }

  .partner-shell { width: calc(100% - 32px); }

  .partner-eyebrow {
    gap: 7px;
    padding: 8px 10px;
    font-size: 8px;
    letter-spacing: .08em;
  }

  .partner-heading-row { margin-top: 25px; }

  .partner-heading { font-size: clamp(38px, 10vw, 52px); }

  .partner-mobile-break { display: block; }

  .partner-intro { font-size: 13px; }

  .partner-meta-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    margin-top: 25px;
  }

  .partner-campaign-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .partner-card-visual { height: 250px; }

  .partner-card-image {
    max-width: 78%;
    max-height: 155px;
  }

  .partner-card-content { padding: 19px; }

  .partner-card-title { font-size: 22px; }

  .partner-footer-note {
    flex-wrap: wrap;
    line-height: 1.6;
  }

  .partner-footer-rule { min-width: 40px; }

  .partner-modal { padding: 22px; }

  .partner-modal h3 { font-size: 25px; }

  .partner-modal-details { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .partner-section * {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
`;
