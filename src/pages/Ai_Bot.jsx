
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const BASE_URL = "https://back-end-project-group.onrender.com";

const INITIAL_MESSAGE = {
  from: "bot",
  text: "Hey there! 👋 I'm your DWJD food-saving sidekick. Ask me about donations, pickups, or how the platform works. Let's make a difference! 🤖💚",
};

const QUICK_QUESTIONS = [
  { icon: "🌱", text: "What is DWJD?" },
  { icon: "🍱", text: "How can I donate food?" },
  { icon: "🔗", text: "Give me the donation link" },
];

const BOT_MOODS = {
  idle: { emoji: "🤖", label: "Ready to help" },
  thinking: { emoji: "🧐", label: "Thinking..." },
  happy: { emoji: "😄", label: "Happy to help" },
  idea: { emoji: "💡", label: "Got an idea!" },
  food: { emoji: "🥗", label: "Food-saving mode" },
  celebrating: { emoji: "🥳", label: "Amazing!" },
  empathetic: { emoji: "💚", label: "Here for you" },
  confused: { emoji: "😵‍💫", label: "Let's try again" },
};

function detectBotMood(text = "") {
  const value = text.toLowerCase();

  if (/congratulations|successfully|well done|great job|amazing|fantastic|completed|excellent/.test(value)) {
    return "celebrating";
  }

  if (/error|failed|unable|cannot|can't|problem|issue|sorry|unfortunately/.test(value)) {
    return "empathetic";
  }

  if (/donation|food|meal|waste|hunger|hungry|donate|pickup|delivery/.test(value)) {
    return "food";
  }

  if (/idea|solution|suggest|recommend|tip|approach|consider/.test(value)) {
    return "idea";
  }

  if (/explain|understand|meaning|concept|how does|what is|why does/.test(value)) {
    return "thinking";
  }

  if (/thank you|thanks|welcome|happy to help|glad to help/.test(value)) {
    return "happy";
  }

  return "happy";
}

// --------------------------------------------------
// SAFE MARKDOWN LINKS
// --------------------------------------------------

function SafeMarkdownLink({ href, children }) {
  try {
    const url = new URL(href || "");

    if (
      url.protocol !== "https:" ||
      url.hostname !== "dwjd.vercel.app"
    ) {
      return <>{children}</>;
    }

    return (
      <a
        className="dwjd-link"
        href={url.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children} ↗
      </a>
    );
  } catch {
    return <>{children}</>;
  }
}

// --------------------------------------------------
// GET PROFILE PHOTO
// --------------------------------------------------

function getStoredProfile() {
  const keys = [
    "user",
    "rider",
    "userInfo",
    "profile",
    "loggedInUser",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") continue;

      const candidates = [
        data,
        data.user,
        data.rider,
        data.profile,
        data.data,
      ].filter(Boolean);

      for (const item of candidates) {
        const photo =
          item.profilePhoto ||
          item.profile_photo ||
          item.profileImage ||
          item.profile_image ||
          item.photoURL ||
          item.photoUrl ||
          item.photo ||
          item.image ||
          item.avatar;

        if (typeof photo === "string" && photo.trim()) {
          return photo.trim();
        }
      }
    } catch {
      // Ignore invalid stored values.
    }
  }

  return "";
}

// --------------------------------------------------
// SSE STREAM READER
// --------------------------------------------------

async function readAIStream(response, onToken) {
  if (!response.body) {
    throw new Error("Your browser does not support streaming.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let receivedText = "";

  const processEvent = (eventText) => {
    const lines = eventText.split(/\r?\n/);

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      const payload = line.slice(5).trim();

      if (!payload || payload === "[DONE]") continue;

      let data;

      try {
        data = JSON.parse(payload);
      } catch {
        console.error("Invalid SSE event:", payload);
        continue;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (typeof data.token === "string") {
        receivedText += data.token;
        onToken(data.token, receivedText);
      }
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";

      events.forEach(processEvent);
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      processEvent(buffer);
    }

    if (!receivedText.trim()) {
      throw new Error("The AI returned an empty response.");
    }

    return receivedText;
  } finally {
    reader.releaseLock();
  }
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function AI_Bot() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("idle");

  const [profilePhoto, setProfilePhoto] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const closeTimerRef = useRef(null);

  const currentMood = BOT_MOODS[mood] || BOT_MOODS.idle;

  // ----------------------------------------------
  // CLEAN UP CLOSING TIMER
  // ----------------------------------------------

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // ----------------------------------------------
  // PROFILE PHOTO
  // ----------------------------------------------

  useEffect(() => {
    const loadPhoto = () => {
      setProfilePhoto(getStoredProfile());
      setPhotoFailed(false);
    };

    loadPhoto();

    window.addEventListener("storage", loadPhoto);
    window.addEventListener("dwjd-profile-updated", loadPhoto);

    return () => {
      window.removeEventListener("storage", loadPhoto);
      window.removeEventListener("dwjd-profile-updated", loadPhoto);
    };
  }, []);

  // ----------------------------------------------
  // AUTO SCROLL
  // ----------------------------------------------

  useEffect(() => {
    if (open && !closing) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chat, loading, open, closing]);

  // ----------------------------------------------
  // AUTO FOCUS
  // ----------------------------------------------

  useEffect(() => {
    if (open && !closing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [open, closing]);

  // ----------------------------------------------
  // OPEN CHAT
  // ----------------------------------------------

  const openChat = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setClosing(false);
    setOpen(true);
    setMood("idle");
  };

  // ----------------------------------------------
  // CLOSE CHAT WITH REVERSE DOOR ANIMATION
  // ----------------------------------------------

  const closeChat = () => {
    if (!open || closing) return;

    setClosing(true);

    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);

      if (!loading) {
        setMood("idle");
      }

      closeTimerRef.current = null;
    }, 750);
  };

  // ----------------------------------------------
  // TOGGLE CHAT
  // ----------------------------------------------

  const toggleChat = () => {
    if (open) {
      closeChat();
    } else {
      openChat();
    }
  };

  // ----------------------------------------------
  // SEND MESSAGE
  // ----------------------------------------------

  const sendMessage = async (text = message) => {
    const cleanMessage = text.trim();

    if (!cleanMessage || loading || closing) return;

    setChat((prev) => [
      ...prev,
      { from: "user", text: cleanMessage },
      { from: "bot", text: "" },
    ]);

    setMessage("");
    setLoading(true);
    setMood("thinking");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: cleanMessage,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.reply ||
          data.message ||
          "The assistant couldn't answer right now."
        );
      }

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("text/event-stream")) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.reply ||
          "The server did not return a streaming response."
        );
      }

      const finalText = await readAIStream(
        response,
        (tokenText, fullText) => {
          setChat((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;

            if (updated[lastIndex]?.from === "bot") {
              updated[lastIndex] = {
                ...updated[lastIndex],
                text: fullText,
              };
            }

            return updated;
          });

          setMood(detectBotMood(fullText));
        }
      );

      setMood(detectBotMood(finalText));

    } catch (error) {
      console.error("DWJD AI error:", error);

      const errorMessage =
        error.message ||
        "My food-saving circuits can't reach the server right now. Please try again shortly. 🤖";

      setChat((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (
          updated[lastIndex]?.from === "bot" &&
          !updated[lastIndex].text
        ) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            text: errorMessage,
          };
        } else {
          updated.push({
            from: "bot",
            text: errorMessage,
          });
        }

        return updated;
      });

      setMood("confused");

    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------
  // RESET CHAT
  // ----------------------------------------------

  const resetChat = () => {
    if (loading) return;

    setChat([INITIAL_MESSAGE]);
    setMood("idle");
    setMessage("");
  };

  // ----------------------------------------------
  // USER AVATAR
  // ----------------------------------------------

  const renderUserAvatar = () => {
    if (profilePhoto && !photoFailed) {
      return (
        <img
          src={profilePhoto}
          alt="Your profile"
          className="dwjd-user-avatar-image"
          referrerPolicy="no-referrer"
          onError={() => setPhotoFailed(true)}
        />
      );
    }

    return <span>👤</span>;
  };

  // ----------------------------------------------
  // UI
  // ----------------------------------------------

  return (
    <div className="dwjd-ai">

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .dwjd-ai {
          --green: #42e8a5;
          --green-light: #a1ffda;
          --text: #f4f7fb;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .dwjd-ai *,
        .dwjd-ai *::before,
        .dwjd-ai *::after {
          box-sizing: border-box;
        }

        /* =====================================
           FLOATING ROBOT LAUNCHER
        ===================================== */

        .dwjd-ai-launcher {
          position: fixed;
          left: 22px;
          bottom: 22px;
          z-index: 9998;

          width: 86px;
          height: 86px;

          display: grid;
          place-items: center;

          padding: 0;
          border: 0;
          border-radius: 50%;

          background: transparent;
          cursor: pointer;

          perspective: 500px;
          transition: transform .35s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .dwjd-ai-launcher:hover {
          transform: translateY(-7px) scale(1.08);
        }

        .dwjd-launcher-glow {
          position: absolute;
          inset: 10px;

          border-radius: 50%;

          background: rgba(31,255,151,.28);
          filter: blur(24px);

          animation: dwjd-ambient-glow 3s ease-in-out infinite;
        }

        @keyframes dwjd-ambient-glow {
          0%,100% {
            transform: scale(.75);
            opacity: .45;
          }
          50% {
            transform: scale(1.2);
            opacity: .9;
          }
        }

        /* Robot body */

        .dwjd-launcher-robot {
          position: relative;
          width: 49px;
          height: 43px;

          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;

          border: 1px solid rgba(255,255,255,.75);
          border-radius: 14px 14px 12px 12px;

          background: linear-gradient(
            145deg,
            #ffffff,
            #d8c5ff 35%,
            #8b75ce 75%,
            #554b94
          );

          box-shadow:
            0 0 17px rgba(85,255,176,.4),
            0 8px 16px rgba(0,0,0,.4),
            inset 0 2px 4px rgba(255,255,255,.8);

          transform-style: preserve-3d;

          animation: dwjd-robot-breathe 3.5s ease-in-out infinite;
        }

        .dwjd-launcher-robot::before {
          content: "";
          position: absolute;

          top: 4px;
          left: 7px;
          right: 7px;

          height: 8px;
          border-radius: 50%;

          background: rgba(255,255,255,.4);
          filter: blur(2px);
        }

        .dwjd-launcher-robot::after {
          content: "";
          position: absolute;
          bottom: -5px;

          width: 16px;
          height: 5px;

          border-radius: 0 0 5px 5px;
          background: #7c6bb5;
        }

        .dwjd-launcher-eye {
          position: relative;
          z-index: 1;

          width: 7px;
          height: 13px;

          border-radius: 5px;

          background: linear-gradient(
            180deg,
            #1bfff2,
            #1786ff
          );

          box-shadow: 0 0 8px rgba(0,220,255,.8);
        }

        .dwjd-launcher-mouth {
          position: absolute;
          bottom: 8px;

          width: 12px;
          height: 4px;

          border-bottom: 2px solid #453b76;
          border-radius: 50%;
        }

        .dwjd-launcher-antenna {
          position: absolute;
          top: -8px;
          left: 15px;

          width: 17px;
          height: 5px;

          border-radius: 5px;

          background: #ffd54f;
          box-shadow: 0 0 8px rgba(255,213,79,.5);
        }

        .dwjd-launcher-side {
          position: absolute;
          top: 10px;

          width: 4px;
          height: 18px;

          border-radius: 4px;
          background: #ff3f88;
        }

        .dwjd-launcher-side.left {
          left: -5px;
        }

        .dwjd-launcher-side.right {
          right: -5px;
          height: 15px;
        }

        .dwjd-launcher-side::before {
          content: "";
          position: absolute;

          top: -4px;
          left: -1px;

          width: 6px;
          height: 6px;

          border-radius: 50%;
          background: #ff3f88;
          box-shadow: 0 0 7px #ff3f88;
        }

        @keyframes dwjd-robot-breathe {
          0%,100% {
            transform: translateY(0) rotate(-2deg) scale(1);
          }
          50% {
            transform: translateY(-6px) rotate(2deg) scale(.98);
          }
        }

        /* Robot wakes up */

        .dwjd-ai-launcher.waking .dwjd-launcher-robot {
          animation: dwjd-wake-up .65s ease both;
        }

        @keyframes dwjd-wake-up {
          0% {
            transform: translateY(0) scale(.95);
          }
          45% {
            transform: translateY(-13px) rotate(-10deg) scale(1.15);
          }
          100% {
            transform: translateY(0) rotate(0) scale(1);
          }
        }

        .dwjd-ai-close-face {
          display: grid;
          place-items: center;

          width: 48px;
          height: 48px;

          border: 1px solid rgba(66,232,165,.4);
          border-radius: 50%;

          background: rgba(9,35,28,.8);
          color: var(--green);

          font-size: 32px;

          box-shadow: 0 0 25px rgba(66,232,165,.3);

          transition: .25s ease;
        }

        .dwjd-ai-close-face:hover {
          transform: rotate(90deg);
        }

        /* =====================================
           3D DOOR OPEN AND CLOSE
        ===================================== */

        .dwjd-ai-panel-wrap {
          position: fixed;
          z-index: 9999;

          left: 24px;
          bottom: 108px;

          width: min(420px, calc(100vw - 32px));
          height: min(670px, calc(100dvh - 125px));

          perspective: 1400px;
          transform-style: preserve-3d;
          transform-origin: left center;

          animation: dwjd-door-open .75s cubic-bezier(.18,.85,.25,1) both;
        }

        .dwjd-ai-panel-wrap.closing {
          pointer-events: none;
          animation: dwjd-door-close .75s cubic-bezier(.65,0,.8,.25) both;
        }

        .dwjd-ai-panel-wrap::before {
          content: "";
          position: absolute;

          top: 5%;
          left: -12px;

          width: 28px;
          height: 90%;

          border-radius: 50%;

          background: rgba(66,232,165,.7);
          filter: blur(25px);

          opacity: 0;
          pointer-events: none;

          animation: dwjd-door-light .85s ease-out both;
        }

        .dwjd-ai-panel-wrap.closing::before {
          animation: dwjd-door-light-close .75s ease-in both;
        }

        @keyframes dwjd-door-open {
          0% {
            opacity: 0;
            transform:
              perspective(1400px)
              translateX(-65px)
              rotateY(-82deg)
              scale(.82);
            filter: blur(9px);
          }

          45% {
            opacity: 1;
            filter: blur(1px);
          }

          75% {
            transform:
              perspective(1400px)
              translateX(5px)
              rotateY(5deg)
              scale(1.015);
          }

          100% {
            opacity: 1;
            transform:
              perspective(1400px)
              translateX(0)
              rotateY(0)
              scale(1);
            filter: blur(0);
          }
        }

        @keyframes dwjd-door-close {
          0% {
            opacity: 1;
            transform:
              perspective(1400px)
              translateX(0)
              rotateY(0)
              scale(1);
            filter: blur(0);
          }

          30% {
            opacity: 1;
            transform:
              perspective(1400px)
              translateX(5px)
              rotateY(5deg)
              scale(1.015);
          }

          100% {
            opacity: 0;
            transform:
              perspective(1400px)
              translateX(-65px)
              rotateY(-82deg)
              scale(.82);
            filter: blur(9px);
          }
        }

        @keyframes dwjd-door-light {
          0% {
            opacity: 0;
            transform: scaleY(.2);
          }
          35% {
            opacity: .8;
            transform: scaleY(1.1);
          }
          100% {
            opacity: 0;
            transform: scaleY(1);
          }
        }

        @keyframes dwjd-door-light-close {
          0% {
            opacity: 0;
            transform: scaleY(1);
          }
          45% {
            opacity: .8;
            transform: scaleY(1.1);
          }
          100% {
            opacity: 0;
            transform: scaleY(.2);
          }
        }

        /* =====================================
           GLASS CHAT PANEL
        ===================================== */

        .dwjd-ai-panel {
          position: relative;
          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: column;

          overflow: hidden;

          border: 1px solid rgba(255,255,255,.2);
          border-radius: 28px;

          background:
            radial-gradient(
              ellipse at 5% 0%,
              rgba(31,204,143,.19),
              transparent 42%
            ),
            radial-gradient(
              ellipse at 100% 100%,
              rgba(105,90,255,.15),
              transparent 45%
            ),
            linear-gradient(
              145deg,
              rgba(21,32,45,.91),
              rgba(8,13,25,.95)
            );

          backdrop-filter: blur(30px) saturate(160%);
          -webkit-backdrop-filter: blur(30px) saturate(160%);

          box-shadow:
            0 35px 100px rgba(0,0,0,.62),
            0 0 50px rgba(66,232,165,.12),
            inset 0 1px 1px rgba(255,255,255,.16);
        }

        .dwjd-ai-panel::before {
          content: "";
          position: absolute;
          z-index: 4;

          top: 0;
          left: 10%;
          right: 10%;

          height: 1px;

          background: linear-gradient(
            90deg,
            transparent,
            #a1ffda,
            transparent
          );

          pointer-events: none;
        }

        .dwjd-ai-panel::after {
          content: "";
          position: absolute;
          inset: 0;

          border-radius: inherit;

          background: linear-gradient(
            125deg,
            rgba(255,255,255,.055),
            transparent 40%,
            transparent 75%,
            rgba(255,255,255,.025)
          );

          pointer-events: none;
        }

        /* =====================================
           HEADER
        ===================================== */

        .dwjd-ai-header {
          position: relative;
          z-index: 3;

          display: flex;
          align-items: center;
          gap: 12px;

          padding: 14px 15px;

          border-bottom: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.035);

          flex-shrink: 0;
        }

        .dwjd-ai-heading {
          flex: 1;
          min-width: 0;
        }

        .dwjd-ai-title {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -.3px;
        }

        .dwjd-ai-status {
          display: flex;
          align-items: center;
          gap: 7px;

          margin-top: 5px;

          color: #a2e9cb;
          font: 9px 'Space Mono', monospace;
        }

        .dwjd-ai-status-dot {
          width: 7px;
          height: 7px;

          flex-shrink: 0;
          border-radius: 50%;

          background: var(--green);
          box-shadow: 0 0 12px rgba(66,232,165,.8);

          animation: dwjd-status-pulse 1.8s infinite;
        }

        @keyframes dwjd-status-pulse {
          50% {
            opacity: .35;
            transform: scale(.8);
          }
        }

        .dwjd-ai-icon-button {
          width: 34px;
          height: 34px;

          display: grid;
          place-items: center;

          border: 1px solid rgba(255,255,255,.13);
          border-radius: 12px;

          background: rgba(255,255,255,.055);
          color: #d4e0ed;

          cursor: pointer;
          font-size: 18px;

          transition: .2s ease;
        }

        .dwjd-ai-icon-button:hover:not(:disabled) {
          background: rgba(66,232,165,.15);
          border-color: rgba(66,232,165,.4);
          color: white;
          transform: translateY(-2px);
        }

        .dwjd-ai-icon-button:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        /* =====================================
           3D ROBOT HEADER
        ===================================== */

        .dwjd-robot-stage {
          --robot-glow: rgba(66,232,165,.6);

          position: relative;
          width: 66px;
          height: 66px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          perspective: 500px;
          isolation: isolate;
        }

        .dwjd-robot-stage::before {
          content: "";
          position: absolute;
          inset: 5px;

          border: 1px solid var(--robot-glow);
          border-radius: 50%;

          opacity: .4;

          box-shadow:
            0 0 15px var(--robot-glow),
            inset 0 0 15px var(--robot-glow);

          animation: dwjd-ring 8s linear infinite;
        }

        .dwjd-robot-glow {
          position: absolute;

          width: 45px;
          height: 45px;

          border-radius: 50%;
          background: var(--robot-glow);

          filter: blur(20px);
          opacity: .65;

          animation: dwjd-glow 2.5s ease-in-out infinite;
        }

        .dwjd-robot-head {
          position: relative;
          z-index: 2;

          width: 47px;
          height: 39px;

          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;

          border: 1px solid rgba(255,255,255,.65);
          border-radius: 15px 15px 13px 13px;

          background: linear-gradient(
            145deg,
            rgba(255,255,255,.9),
            rgba(190,255,229,.65) 24%,
            rgba(42,135,119,.85) 65%,
            rgba(9,50,54,.96)
          );

          box-shadow:
            0 7px 12px rgba(0,0,0,.3),
            0 0 20px var(--robot-glow),
            inset 0 2px 3px rgba(255,255,255,.8),
            inset 0 -5px 8px rgba(0,0,0,.25);

          transform-style: preserve-3d;

          animation: dwjd-robot-float 3s ease-in-out infinite;
        }

        .dwjd-robot-head::before {
          content: "";
          position: absolute;

          top: 4px;
          left: 8px;
          right: 8px;

          height: 8px;
          border-radius: 50%;

          background: rgba(255,255,255,.42);
          filter: blur(2px);
        }

        .dwjd-robot-head::after {
          content: "";
          position: absolute;
          bottom: -7px;

          width: 17px;
          height: 5px;

          border-radius: 0 0 7px 7px;

          background: linear-gradient(
            90deg,
            #317d71,
            #a4ffe0,
            #317d71
          );
        }

        .dwjd-robot-antenna {
          position: absolute;
          top: -12px;

          width: 3px;
          height: 12px;

          border-radius: 5px;
          background: linear-gradient(to top, #75f2bd, white);
        }

        .dwjd-robot-antenna::after {
          content: "";
          position: absolute;

          top: -5px;
          left: -3px;

          width: 9px;
          height: 9px;

          border-radius: 50%;
          background: #a7ffda;

          box-shadow:
            0 0 7px #a7ffda,
            0 0 15px var(--robot-glow);

          animation: dwjd-antenna 1.8s infinite;
        }

        .dwjd-robot-eye {
          width: 7px;
          height: 9px;

          border-radius: 50%;
          background: #052c31;

          box-shadow: inset 0 1px 1px rgba(255,255,255,.5);

          animation: dwjd-blink 5s infinite;
        }

        @keyframes dwjd-robot-float {
          0%,100% {
            transform: translateY(0) rotateY(-8deg);
          }
          50% {
            transform: translateY(-5px) rotateY(8deg);
          }
        }

        @keyframes dwjd-ring {
          to { transform: rotate(360deg); }
        }

        @keyframes dwjd-glow {
          0%,100% { transform: scale(.8); opacity: .4; }
          50% { transform: scale(1.25); opacity: .8; }
        }

        @keyframes dwjd-antenna {
          50% { opacity: .45; transform: scale(.8); }
        }

        @keyframes dwjd-blink {
          0%,46%,50%,100% { transform: scaleY(1); }
          48% { transform: scaleY(.12); }
        }

        /* =====================================
           RESPONSE-BASED MOOD ANIMATIONS
        ===================================== */

        .dwjd-robot-stage.thinking {
          --robot-glow: rgba(101,213,255,.85);
        }

        .dwjd-robot-stage.thinking .dwjd-robot-head {
          animation: dwjd-thinking 1s infinite ease-in-out;
        }

        @keyframes dwjd-thinking {
          0%,100% { transform: rotate(-8deg) translateY(0); }
          50% { transform: rotate(8deg) translateY(-5px); }
        }

        .dwjd-robot-stage.happy {
          --robot-glow: rgba(255,207,91,.85);
        }

        .dwjd-robot-stage.happy .dwjd-robot-head {
          animation: dwjd-happy 1.5s infinite ease-in-out;
        }

        @keyframes dwjd-happy {
          0%,100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-5px) rotate(-7deg); }
          75% { transform: translateY(-5px) rotate(7deg); }
        }

        .dwjd-robot-stage.idea {
          --robot-glow: rgba(255,214,83,.9);
        }

        .dwjd-robot-stage.idea .dwjd-robot-head {
          animation: dwjd-idea 1.2s infinite;
        }

        @keyframes dwjd-idea {
          0%,100% { transform: rotate(0); }
          40% { transform: rotate(-12deg) translateY(-6px); }
          70% { transform: rotate(8deg) translateY(-2px); }
        }

        .dwjd-robot-stage.food {
          --robot-glow: rgba(91,255,161,.9);
        }

        .dwjd-robot-stage.food .dwjd-robot-head {
          animation: dwjd-food 2s infinite;
        }

        @keyframes dwjd-food {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-7px) rotate(3deg); }
        }

        .dwjd-robot-stage.celebrating {
          --robot-glow: rgba(255,130,200,.95);
        }

        .dwjd-robot-stage.celebrating .dwjd-robot-head {
          animation: dwjd-celebrate .65s infinite;
        }

        @keyframes dwjd-celebrate {
          0%,100% { transform: translateY(0) rotate(-8deg) scale(1); }
          50% { transform: translateY(-9px) rotate(8deg) scale(1.08); }
        }

        .dwjd-robot-stage.empathetic {
          --robot-glow: rgba(108,255,197,.8);
        }

        .dwjd-robot-stage.empathetic .dwjd-robot-head {
          animation: dwjd-empathy 2.4s infinite;
        }

        @keyframes dwjd-empathy {
          0%,100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(2px) rotate(-5deg); }
        }

        .dwjd-robot-stage.confused {
          --robot-glow: rgba(255,119,119,.9);
        }

        .dwjd-robot-stage.confused .dwjd-robot-head {
          animation: dwjd-confused .5s infinite;
        }

        @keyframes dwjd-confused {
          0%,100% { transform: rotate(-12deg); }
          50% { transform: rotate(12deg); }
        }

        /* =====================================
           MESSAGES
        ===================================== */

        .dwjd-ai-messages {
          position: relative;
          z-index: 2;

          display: flex;
          flex: 1;
          min-height: 0;

          flex-direction: column;
          gap: 14px;

          overflow-y: auto;
          padding: 17px 14px;

          scrollbar-width: thin;
          scrollbar-color: rgba(66,232,165,.3) transparent;

          overscroll-behavior: contain;
        }

        .dwjd-ai-row {
          display: flex;
          align-items: flex-end;
          gap: 9px;

          animation: dwjd-message-in .25s ease-out both;
        }

        .dwjd-ai-row.user {
          flex-direction: row-reverse;
        }

        @keyframes dwjd-message-in {
          from {
            opacity: 0;
            transform: translateY(9px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================
           AVATARS
        ===================================== */

        .dwjd-ai-mini-face {
          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          flex-shrink: 0;
          overflow: hidden;

          border: 1px solid rgba(66,232,165,.25);
          border-radius: 11px;

          background: rgba(66,232,165,.09);
          font-size: 15px;
        }

        .dwjd-ai-mini-face.user {
          width: 35px;
          height: 35px;

          border-radius: 50%;

          border-color: rgba(167,139,250,.35);
          background: rgba(167,139,250,.15);
        }

        .dwjd-user-avatar-image {
          display: block;
          width: 100%;
          height: 100%;

          border-radius: inherit;
          object-fit: cover;
        }

        /* =====================================
           CHAT BUBBLES
        ===================================== */

        .dwjd-ai-bubble {
          max-width: 84%;
          min-width: 0;

          padding: 12px 14px;

          border: 1px solid rgba(255,255,255,.1);
          border-radius: 17px;

          font-size: 13px;
          line-height: 1.7;

          overflow-wrap: anywhere;

          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .dwjd-ai-bubble.bot {
          border-bottom-left-radius: 5px;

          background: linear-gradient(
            140deg,
            rgba(255,255,255,.095),
            rgba(255,255,255,.035)
          );

          color: #e1e9f4;

          box-shadow:
            0 5px 18px rgba(0,0,0,.1),
            inset 0 1px 1px rgba(255,255,255,.08);
        }

        .dwjd-ai-bubble.user {
          border-color: rgba(66,232,165,.25);
          border-bottom-right-radius: 5px;

          background: linear-gradient(
            140deg,
            rgba(21,180,124,.27),
            rgba(21,148,103,.12)
          );

          color: #f2fff9;
        }

        .dwjd-ai-bubble p {
          margin: 0 0 8px;
        }

        .dwjd-ai-bubble p:last-child {
          margin-bottom: 0;
        }

        .dwjd-ai-bubble ul,
        .dwjd-ai-bubble ol {
          padding-left: 19px;
          margin: 8px 0;
        }

        .dwjd-ai-bubble li {
          margin: 4px 0;
        }

        .dwjd-ai-bubble strong {
          color: white;
        }

        .dwjd-ai-bubble code {
          padding: 2px 5px;
          border-radius: 5px;
          background: rgba(0,0,0,.3);
          color: #9af8ce;
        }

        .dwjd-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          max-width: 100%;
          margin: 5px 0;
          padding: 7px 11px;

          border: 1px solid rgba(66,232,165,.3);
          border-radius: 10px;

          background: rgba(66,232,165,.1);
          color: #8bf4c5;

          font-weight: 800;
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .dwjd-link:hover {
          background: rgba(66,232,165,.2);
        }

        /* =====================================
           TYPING INDICATOR
        ===================================== */

        .dwjd-ai-typing {
          display: flex;
          align-items: center;
          gap: 5px;

          padding: 14px;

          border: 1px solid rgba(255,255,255,.1);
          border-radius: 15px;
          border-bottom-left-radius: 5px;

          background: rgba(255,255,255,.055);
        }

        .dwjd-ai-typing span {
          width: 7px;
          height: 7px;

          border-radius: 50%;
          background: var(--green);

          animation: dwjd-thinking-dots 1s infinite;
        }

        .dwjd-ai-typing span:nth-child(2) {
          animation-delay: .15s;
        }

        .dwjd-ai-typing span:nth-child(3) {
          animation-delay: .3s;
        }

        @keyframes dwjd-thinking-dots {
          0%,60%,100% {
            transform: translateY(0);
            opacity: .4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }

        /* =====================================
           QUICK QUESTIONS
        ===================================== */

        .dwjd-ai-quick {
          position: relative;
          z-index: 2;

          display: flex;
          flex-wrap: wrap;
          gap: 7px;

          padding: 0 14px 13px;
          flex-shrink: 0;
        }

        .dwjd-ai-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          max-width: 100%;
          padding: 8px 11px;

          border: 1px solid rgba(66,232,165,.2);
          border-radius: 999px;

          background: rgba(66,232,165,.065);
          color: #b8f6dc;

          font: 11px 'DM Sans', sans-serif;
          cursor: pointer;

          transition: .2s ease;
        }

        .dwjd-ai-chip:hover {
          transform: translateY(-3px);
          border-color: rgba(66,232,165,.5);
          background: rgba(66,232,165,.14);
        }

        /* =====================================
           INPUT
        ===================================== */

        .dwjd-ai-footer {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 12px;

          border-top: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.025);

          flex-shrink: 0;
        }

        .dwjd-ai-input {
          flex: 1;
          width: 0;
          height: 46px;

          padding: 0 14px;

          border: 1px solid rgba(255,255,255,.14);
          border-radius: 15px;

          outline: none;

          background: rgba(255,255,255,.055);
          color: white;

          font: 13px 'DM Sans', sans-serif;
          transition: .2s ease;
        }

        .dwjd-ai-input::placeholder {
          color: #8290a5;
        }

        .dwjd-ai-input:focus {
          border-color: rgba(66,232,165,.55);

          box-shadow:
            0 0 0 3px rgba(66,232,165,.08),
            0 0 18px rgba(66,232,165,.08);
        }

        .dwjd-ai-send {
          width: 45px;
          height: 45px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border: 1px solid rgba(255,255,255,.3);
          border-radius: 15px;

          background: linear-gradient(
            135deg,
            #9bffda,
            #31d99b
          );

          color: #073b2a;
          font-size: 19px;

          cursor: pointer;

          box-shadow:
            0 5px 18px rgba(49,217,155,.2),
            inset 0 1px 1px rgba(255,255,255,.6);

          transition: .2s ease;
        }

        .dwjd-ai-send:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.04);
        }

        .dwjd-ai-send:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .dwjd-ai-note {
          position: relative;
          z-index: 2;

          padding: 0 12px 11px;

          background: rgba(255,255,255,.025);
          color: #8290a5;

          text-align: center;
          font-size: 10px;

          flex-shrink: 0;
        }

        /* =====================================
           RESPONSIVE
        ===================================== */

        @media (max-width: 480px) {
          .dwjd-ai-launcher {
            left: 12px;
            bottom: 13px;
            width: 75px;
            height: 75px;
          }

          .dwjd-ai-panel-wrap {
            left: 8px;
            bottom: 83px;

            width: calc(100vw - 16px);
            height: min(680px, calc(100dvh - 95px));
          }

          .dwjd-ai-panel {
            border-radius: 23px;
          }

          .dwjd-ai-header {
            padding: 12px;
          }

          .dwjd-robot-stage {
            width: 58px;
            height: 58px;
          }

          .dwjd-ai-messages {
            padding: 13px 10px;
            gap: 12px;
          }

          .dwjd-ai-bubble {
            max-width: 88%;
            padding: 10px 12px;
          }

          .dwjd-ai-quick {
            padding-left: 10px;
            padding-right: 10px;
          }
        }

        /* =====================================
           ACCESSIBILITY
        ===================================== */

        @media (prefers-reduced-motion: reduce) {
          .dwjd-ai *,
          .dwjd-ai *::before,
          .dwjd-ai *::after {
            animation: none !important;
            transition: none !important;
          }
        }

      `}</style>

      {/* ======================================
          ROBOT LAUNCHER
      ====================================== */}

      <button
        className={`dwjd-ai-launcher ${open ? "waking" : ""}`}
        onClick={toggleChat}
        aria-label={
          open ? "Close DWJD Assistant" : "Open DWJD Assistant"
        }
        aria-expanded={open}
      >
        {!open ? (
          <>
            <span className="dwjd-launcher-glow" />

            <span className="dwjd-launcher-robot">
              <span className="dwjd-launcher-antenna" />

              <span className="dwjd-launcher-side left" />
              <span className="dwjd-launcher-side right" />

              <span className="dwjd-launcher-eye" />
              <span className="dwjd-launcher-eye" />

              <span className="dwjd-launcher-mouth" />
            </span>
          </>
        ) : (
          <span className="dwjd-ai-close-face">×</span>
        )}
      </button>

      {/* ======================================
          CHAT PANEL
      ====================================== */}

      {open && (
        <div
          className={`dwjd-ai-panel-wrap ${closing ? "closing" : ""}`}
        >
          <section
            className="dwjd-ai-panel"
            aria-label="DWJD Assistant"
          >

            {/* HEADER */}

            <header className="dwjd-ai-header">

              <div className={`dwjd-robot-stage ${mood}`}>
                <div className="dwjd-robot-glow" />

                <div className="dwjd-robot-head">
                  <span className="dwjd-robot-antenna" />
                  <span className="dwjd-robot-eye" />
                  <span className="dwjd-robot-eye" />
                </div>
              </div>

              <div className="dwjd-ai-heading">
                <h2 className="dwjd-ai-title">
                  DWJD Assistant
                </h2>

                <div className="dwjd-ai-status">
                  <span className="dwjd-ai-status-dot" />
                  {currentMood.label}
                </div>
              </div>

              <button
                className="dwjd-ai-icon-button"
                onClick={resetChat}
                disabled={loading || closing}
                title="Start a new conversation"
                aria-label="Start a new conversation"
              >
                ↻
              </button>

              <button
                className="dwjd-ai-icon-button"
                onClick={closeChat}
                disabled={closing}
                title="Close chat"
                aria-label="Close chat"
              >
                ×
              </button>

            </header>

            {/* CHAT MESSAGES */}

            <div className="dwjd-ai-messages" aria-live="polite">

              {chat.map((item, index) => (
                <div
                  className={`dwjd-ai-row ${item.from}`}
                  key={`${index}-${item.from}`}
                >

                  <div className={`dwjd-ai-mini-face ${item.from}`}>
                    {item.from === "bot"
                      ? "🤖"
                      : renderUserAvatar()}
                  </div>

                  <div className={`dwjd-ai-bubble ${item.from}`}>
                    {item.from === "bot" ? (
                      <ReactMarkdown
                        components={{
                          a: SafeMarkdownLink,
                        }}
                      >
                        {item.text}
                      </ReactMarkdown>
                    ) : (
                      item.text
                    )}
                  </div>

                </div>
              ))}

              {/* THINKING INDICATOR */}

              {loading &&
                chat[chat.length - 1]?.from === "bot" &&
                chat[chat.length - 1]?.text === "" && (
                  <div className="dwjd-ai-row bot">

                    <div className="dwjd-ai-mini-face">
                      🧐
                    </div>

                    <div
                      className="dwjd-ai-typing"
                      aria-label="AI is thinking"
                    >
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>
                )}

              <div ref={bottomRef} />

            </div>

            {/* QUICK QUESTIONS */}

            {chat.length === 1 && !loading && (
              <div className="dwjd-ai-quick">

                {QUICK_QUESTIONS.map((item) => (
                  <button
                    key={item.text}
                    className="dwjd-ai-chip"
                    onClick={() => sendMessage(item.text)}
                    disabled={closing}
                  >
                    <span>{item.icon}</span>
                    {item.text}
                  </button>
                ))}

              </div>
            )}

            {/* INPUT */}

            <form
              className="dwjd-ai-footer"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >

              <input
                ref={inputRef}
                className="dwjd-ai-input"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask me anything..."
                aria-label="Message the DWJD Assistant"
                maxLength={2000}
                disabled={loading || closing}
              />

              <button
                className="dwjd-ai-send"
                type="submit"
                disabled={loading || closing || !message.trim()}
                aria-label="Send message"
              >
                ➤
              </button>

            </form>

            <div className="dwjd-ai-note">
              Saving food, one conversation at a time 💚
            </div>

          </section>
        </div>
      )}
    </div>
  );
}
