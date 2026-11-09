
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Gift,
  Heart,
  Clock,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  PartyPopper,
  LockKeyhole,
} from "lucide-react";

import { apiRequest } from "../api.js";

const API = "/api/occasion-donations";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const getCountdown = (target) => {
  const difference = new Date(target).getTime() - Date.now();

  if (!Number.isFinite(difference) || difference <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    expired: false,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
};

function CountdownBox({ value, label }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/20 bg-white/10 px-3 py-4 text-center shadow-lg backdrop-blur-md sm:px-5 sm:py-6">
      <p className="text-3xl font-black text-white sm:text-5xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
      <div className="text-center">
        <RefreshCw
          size={38}
          className="mx-auto animate-spin text-pink-400"
        />

        <p className="mt-5 text-sm font-semibold text-white">
          Preparing your surprise...
        </p>
      </div>
    </main>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300">
          <AlertCircle size={30} />
        </div>

        <h1 className="mt-6 text-2xl font-black text-white">
          Oops! Something went wrong.
        </h1>

        <p className="mt-3 text-sm leading-7 text-white/65">
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-pink-100"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        )}
      </div>
    </main>
  );
}

function LockedWish({ wish, countdown }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950 px-4 py-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-pink-300 shadow-2xl backdrop-blur-lg">
          <Gift size={38} />
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
          <LockKeyhole size={14} />
          A surprise is waiting
        </div>

        <h1 className="mt-7 text-4xl font-black leading-tight text-white sm:text-6xl">
          Something special
          <span className="block bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            is waiting for you!
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
          Hey {wish?.recipientName || "there"}! Someone has prepared
          a special surprise just for you. Your wishes will be
          revealed at the perfect moment.
        </p>

        {wish?.occasionTitle && (
          <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-200">
              The occasion
            </p>

            <p className="mt-2 text-xl font-black text-white">
              {wish.occasionTitle}
            </p>

            <p className="mt-1 text-sm text-white/60">
              {wish.occasionType}
            </p>
          </div>
        )}

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70">
            <Clock size={17} />
            Your surprise unlocks in
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <CountdownBox
              value={countdown.days}
              label="Days"
            />

            <CountdownBox
              value={countdown.hours}
              label="Hours"
            />

            <CountdownBox
              value={countdown.minutes}
              label="Minutes"
            />

            <CountdownBox
              value={countdown.seconds}
              label="Seconds"
            />
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
          <CalendarDays
            size={22}
            className="shrink-0 text-pink-300"
          />

          <div>
            <p className="text-xs text-white/50">
              Scheduled reveal time (IST)
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {formatDate(wish?.scheduledAt)}
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/40">
          Made with love through DWJD ❤️
        </p>
      </div>
    </main>
  );
}

function PublishedWish({ wish }) {
  const media = Array.isArray(wish.media) ? wish.media : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-purple-50 px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-pink-200/50 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-xl shadow-pink-200">
            <PartyPopper size={38} />
          </div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-pink-700">
            <Sparkles size={14} />
            A special moment for you
          </div>

          <h1 className="mt-7 text-4xl font-black leading-tight text-slate-900 sm:text-6xl">
            Happy {wish.occasionType || "Special Day"},
            <span className="mt-2 block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {wish.recipientName}!
            </span>
          </h1>

          {wish.occasionTitle && (
            <p className="mt-5 text-lg font-semibold text-slate-600">
              {wish.occasionTitle}
            </p>
          )}

          <div className="mx-auto mt-7 flex max-w-md items-center justify-center gap-2 text-sm text-slate-500">
            <CalendarDays size={17} className="text-pink-500" />
            {formatDate(wish.scheduledAt)}
          </div>
        </div>

        {wish.dedicationName && (
          <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-pink-100 bg-white/80 p-7 text-center shadow-xl shadow-pink-100/50 backdrop-blur-sm sm:p-10">
            <Heart
              size={30}
              className="mx-auto text-pink-500"
              fill="currentColor"
            />

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-pink-500">
              A dedication for you
            </p>

            <p className="mt-3 text-2xl font-black text-slate-800">
              {wish.dedicationName}
            </p>
          </div>
        )}

        {wish.donorMessage && (
          <section className="mx-auto mt-8 max-w-2xl rounded-3xl border border-purple-100 bg-white/90 p-7 shadow-xl shadow-purple-100/50 sm:p-10">
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <Heart size={19} />
              <h2 className="text-sm font-black uppercase tracking-widest">
                A message for you
              </h2>
            </div>

            <p className="mt-6 whitespace-pre-wrap text-center text-lg leading-9 text-slate-700">
              {wish.donorMessage}
            </p>
          </section>
        )}

        {media.length > 0 && (
          <section className="mt-14">
            <div className="mb-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                <ImageIcon size={26} />
              </div>

              <h2 className="mt-4 text-2xl font-black text-slate-900">
                Special memories
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Moments captured just for you.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {media.map((item, index) => {
                const isVideo =
                  item.resourceType === "video" ||
                  item.mimeType?.startsWith("video/");

                return (
                  <div
                    key={item._id || item.driveFileId || index}
                    className="overflow-hidden rounded-3xl border border-white bg-white p-2 shadow-xl shadow-purple-100/50"
                  >
                    {isVideo ? (
                      <video
                        src={item.url}
                        controls
                        playsInline
                        className="h-64 w-full rounded-2xl bg-black object-contain"
                      >
                        Your browser does not support video playback.
                      </video>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={item.url}
                          alt={item.name || "Special memory"}
                          loading="lazy"
                          className="h-64 w-full rounded-2xl bg-slate-100 object-cover"
                        />
                      </a>
                    )}

                    {item.name && (
                      <p className="px-3 py-3 text-center text-xs font-semibold text-slate-500">
                        {item.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
            <Heart size={27} fill="currentColor" />
          </div>

          <h2 className="mt-5 text-2xl font-black text-slate-900">
            Keep smiling!
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            This special moment was made possible through DWJD.
          </p>

          <p className="mt-6 text-xs font-bold tracking-widest text-slate-400">
            WITH LOVE · DWJD
          </p>
        </div>
      </div>
    </main>
  );
}

export default function Wishes() {
  const { token } = useParams();

  const [wish, setWish] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);

  const loadWish = useCallback(async () => {
    if (!token) {
      setError("This wishes link is invalid.");
      setPageStatus("error");
      return;
    }

    setPageStatus("loading");
    setError("");

    try {
      const result = await apiRequest(
        `${API}/public/wishes/${encodeURIComponent(token)}`,
        {
          method: "GET",
        }
      );

      if (!result?.ok) {
        if (result?.status === "expired") {
          setPageStatus("expired");
          setError(
            result.message || "This wishes link has expired."
          );
          return;
        }

        if (result?.status === "disabled") {
          setPageStatus("disabled");
          setError(
            result.message || "This wishes page is unavailable."
          );
          return;
        }

        throw new Error(
          result?.message || "Unable to load this wishes page."
        );
      }

      if (!result.wish) {
        throw new Error("The wishes information is unavailable.");
      }

      setWish(result.wish);

      if (result.status === "locked") {
        setPageStatus("locked");
      } else if (result.status === "published") {
        setPageStatus("published");
      } else {
        throw new Error("Unexpected wishes page status.");
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading the wishes."
      );
      setPageStatus("error");
    }
  }, [token]);

  useEffect(() => {
    loadWish();
  }, [loadWish]);

  // Update countdown every second.
  useEffect(() => {
    if (pageStatus !== "locked" || !wish?.scheduledAt) {
      return undefined;
    }

    const updateCountdown = () => {
      const nextCountdown = getCountdown(wish.scheduledAt);

      setCountdown(nextCountdown);

      // Once the timer reaches zero, ask the backend whether
      // the page has been published. The backend remains the
      // authority for unlocking the wishes.
      if (nextCountdown.expired) {
        loadWish();
      }
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [pageStatus, wish?.scheduledAt, loadWish]);

  if (pageStatus === "loading") {
    return <LoadingScreen />;
  }

  if (pageStatus === "error") {
    return (
      <ErrorScreen
        message={error}
        onRetry={loadWish}
      />
    );
  }

  if (pageStatus === "expired" || pageStatus === "disabled") {
    return (
      <ErrorScreen
        message={error}
        onRetry={null}
      />
    );
  }

  if (pageStatus === "locked") {
    if (!countdown) {
      return <LoadingScreen />;
    }

    return (
      <LockedWish
        wish={wish}
        countdown={countdown}
      />
    );
  }

  if (pageStatus === "published") {
    return <PublishedWish wish={wish} />;
  }

  return (
    <ErrorScreen
      message="This wishes page is unavailable."
      onRetry={loadWish}
    />
  );
}
