
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const BASE_URL = "https://back-end-project-group.onrender.com";

const INITIAL_MESSAGE = {
  from: "bot",
  text: "Hey there! 👋 I'm your DWJD food-saving sidekick. Ask me about donations, pickups, or how the platform works. Beep boop — let's make a difference! 🤖",
};

const QUICK_QUESTIONS = [
  { icon: "🌱", text: "What is DWJD?" },
  { icon: "🍱", text: "How can I donate food?" },
  { icon: "🔗", text: "Give me the donation link" },
];

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
      <a className="dwjd-link" href={url.href}>
        {children} <span aria-hidden="true">↗</span>
      </a>
    );
  } catch {
    return <>{children}</>;
  }
}

function getStoredProfile() {
  // These are common storage keys. Adjust them to match
  // the exact key used by your DWJD login implementation.
  const keys = ["user", "rider", "userInfo", "profile", "loggedInUser"];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") continue;

      // Some apps store details inside a nested user object.
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
      // Ignore invalid JSON and try the next key.
    }
  }

  return "";
}

export default function AI_Bot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("happy");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Read the current user's or rider's photo from saved login data.
  useEffect(() => {
    const loadPhoto = () => {
      const photo = getStoredProfile();
      setProfilePhoto(photo);
      setPhotoFailed(false);
    };

    loadPhoto();

    // The storage event fires in other tabs. The custom event also
    // supports login components that dispatch "dwjd-profile-updated".
    window.addEventListener("storage", loadPhoto);
    window.addEventListener("dwjd-profile-updated", loadPhoto);

    return () => {
      window.removeEventListener("storage", loadPhoto);
      window.removeEventListener("dwjd-profile-updated", loadPhoto);
    };
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text = message) => {
    const cleanMessage = text.trim();

    if (!cleanMessage || loading) return;

    setChat((prev) => [
      ...prev,
      { from: "user", text: cleanMessage },
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
        body: JSON.stringify({ message: cleanMessage }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.reply ||
          data.message ||
          "The assistant couldn't answer right now."
        );
      }

      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : "Beep boop! 🤖 Could you try asking that another way?";

      setChat((prev) => [...prev, { from: "bot", text: reply }]);
      setMood("happy");
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            error.message ||
            "Uh-oh! My food-saving circuits can't reach the server right now. Please try again shortly. 🤖",
        },
      ]);
      setMood("confused");
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    if (loading) return;
    setChat([INITIAL_MESSAGE]);
    setMood("happy");
  };

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

    return <span aria-hidden="true">👤</span>;
  };

  return (
    <div className="dwjd-ai">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .dwjd-ai {
          --green: #42e8a5;
          --green-soft: #9af8ce;
          --panel: #0c101b;
          --text: #f4f7fb;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .dwjd-ai-launcher {
          position: fixed;
          left: 23px;
          bottom: 23px;
          z-index: 9998;
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform .3s ease;
        }

        .dwjd-ai-launcher:hover {
          transform: translateY(-5px) scale(1.07) rotate(-5deg);
        }

        .dwjd-ai-face {
          position: relative;
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          font-size: 47px;
          filter: drop-shadow(0 5px 11px rgba(66,232,165,.28));
          animation: dwjd-float 3s ease-in-out infinite;
        }

        .dwjd-ai-spark {
          position: absolute;
          top: 0;
          right: 0;
          color: var(--green-soft);
          font-size: 17px;
          animation: dwjd-spark 2s ease-in-out infinite;
        }

        .dwjd-ai-orbit {
          position: absolute;
          inset: 5px;
          border: 1px dashed rgba(66,232,165,.3);
          border-radius: 50%;
          pointer-events: none;
          animation: dwjd-orbit 12s linear infinite;
        }

        .dwjd-ai-close-face {
          font-size: 34px;
          color: var(--green);
        }

        @keyframes dwjd-float {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-7px) rotate(3deg); }
        }

        @keyframes dwjd-spark {
          0%,100% { opacity: .35; transform: scale(.7) rotate(0); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }

        @keyframes dwjd-orbit {
          to { transform: rotate(360deg); }
        }

        .dwjd-ai-panel {
          position: fixed;
          z-index: 9999;
          left: 24px;
          bottom: 104px;
          width: min(390px, calc(100vw - 32px));
          height: min(610px, calc(100dvh - 125px));
          min-height: 340px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(174,195,222,.14);
          border-radius: 25px;
          background:
            radial-gradient(ellipse at 0% 0%,rgba(28,145,105,.1),transparent 43%),
            var(--panel);
          box-shadow: 0 28px 90px rgba(0,0,0,.55),
                      0 0 50px rgba(40,225,155,.055);
          backdrop-filter: blur(24px);
          animation: dwjd-panel-in .35s ease-out both;
        }

        .dwjd-ai-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg,transparent,var(--green),transparent);
          pointer-events: none;
        }

        @keyframes dwjd-panel-in {
          from { opacity: 0; transform: translateY(18px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dwjd-ai-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 17px 16px;
          border-bottom: 1px solid rgba(174,195,222,.1);
          flex-shrink: 0;
          background: linear-gradient(120deg,rgba(66,232,165,.055),transparent 75%);
        }

        .dwjd-ai-header-face {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          background: transparent;
          font-size: 31px;
          animation: dwjd-head-mood 5s ease-in-out infinite;
        }

        @keyframes dwjd-head-mood {
          0%,84%,100% { transform: rotate(0); }
          88% { transform: rotate(-12deg); }
          92% { transform: rotate(12deg); }
        }

        .dwjd-ai-heading { flex: 1; min-width: 0; }

        .dwjd-ai-title {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
        }

        .dwjd-ai-status {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 5px;
          color: #73e9bb;
          font: 10px 'Space Mono', monospace;
        }

        .dwjd-ai-status-dot {
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 9px rgba(66,232,165,.65);
          animation: dwjd-pulse 2s infinite;
        }

        @keyframes dwjd-pulse {
          50% { opacity: .45; }
        }

        .dwjd-ai-icon-button {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(174,195,222,.12);
          border-radius: 11px;
          background: rgba(255,255,255,.025);
          color: #a4afc2;
          cursor: pointer;
          font-size: 17px;
        }

        .dwjd-ai-icon-button:hover {
          color: white;
          background: rgba(255,255,255,.09);
        }

        .dwjd-ai-messages {
          display: flex;
          flex: 1;
          min-height: 0;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
          padding: 16px 13px;
          scrollbar-width: thin;
          scrollbar-color: rgba(66,232,165,.22) transparent;
          overscroll-behavior: contain;
        }

        .dwjd-ai-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: dwjd-message-in .25s ease-out both;
        }

        .dwjd-ai-row.user { flex-direction: row-reverse; }

        @keyframes dwjd-message-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dwjd-ai-mini-face {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid rgba(66,232,165,.17);
          border-radius: 10px;
          background: rgba(66,232,165,.055);
          font-size: 14px;
        }

        .dwjd-ai-mini-face.user {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border-color: rgba(139,125,255,.3);
          background: rgba(139,125,255,.12);
        }

        .dwjd-user-avatar-image {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          object-fit: cover;
        }

        .dwjd-ai-bubble {
          max-width: 84%;
          min-width: 0;
          padding: 11px 13px;
          border: 1px solid rgba(174,195,222,.1);
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.65;
          overflow-wrap: anywhere;
        }

        .dwjd-ai-bubble.bot {
          border-bottom-left-radius: 5px;
          background: rgba(255,255,255,.035);
          color: #dbe3ef;
        }

        .dwjd-ai-bubble.user {
          border-color: rgba(66,232,165,.19);
          border-bottom-right-radius: 5px;
          background: linear-gradient(140deg,rgba(21,148,103,.2),rgba(21,148,103,.08));
          color: #f2fff9;
        }

        .dwjd-ai-bubble p { margin: 0 0 7px; }
        .dwjd-ai-bubble p:last-child { margin-bottom: 0; }
        .dwjd-ai-bubble ul, .dwjd-ai-bubble ol {
          padding-left: 19px;
          margin: 7px 0;
        }
        .dwjd-ai-bubble li { margin: 4px 0; }
        .dwjd-ai-bubble strong { color: white; }

        .dwjd-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          max-width: 100%;
          margin: 5px 0;
          padding: 7px 11px;
          border: 1px solid rgba(66,232,165,.26);
          border-radius: 10px;
          background: rgba(66,232,165,.075);
          color: #77edbd;
          font-weight: 800;
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .dwjd-link:hover {
          background: rgba(66,232,165,.15);
        }

        .dwjd-ai-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 14px;
          border: 1px solid rgba(174,195,222,.1);
          border-radius: 15px;
          border-bottom-left-radius: 5px;
          background: rgba(255,255,255,.035);
        }

        .dwjd-ai-typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          animation: dwjd-thinking 1s infinite;
        }

        .dwjd-ai-typing span:nth-child(2) { animation-delay: .15s; }
        .dwjd-ai-typing span:nth-child(3) { animation-delay: .3s; }

        @keyframes dwjd-thinking {
          0%,60%,100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        .dwjd-ai-quick {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          padding: 0 13px 12px;
          flex-shrink: 0;
        }

        .dwjd-ai-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          max-width: 100%;
          padding: 8px 10px;
          border: 1px solid rgba(66,232,165,.17);
          border-radius: 999px;
          background: rgba(66,232,165,.045);
          color: #b8f6dc;
          font: 11px 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background .2s, transform .2s;
        }

        .dwjd-ai-chip:hover {
          transform: translateY(-2px);
          background: rgba(66,232,165,.11);
        }

        .dwjd-ai-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(174,195,222,.1);
          background: rgba(255,255,255,.015);
          flex-shrink: 0;
        }

        .dwjd-ai-input {
          flex: 1;
          width: 0;
          height: 45px;
          padding: 0 13px;
          border: 1px solid rgba(174,195,222,.13);
          border-radius: 14px;
          outline: none;
          background: rgba(255,255,255,.03);
          color: white;
          font: 13px 'DM Sans', sans-serif;
        }

        .dwjd-ai-input::placeholder { color: #69758a; }

        .dwjd-ai-input:focus {
          border-color: rgba(66,232,165,.45);
          box-shadow: 0 0 0 3px rgba(66,232,165,.055);
        }

        .dwjd-ai-send {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(135deg,#72f2bd,#21cb91);
          color: #062c20;
          font-size: 19px;
          cursor: pointer;
          transition: transform .2s, opacity .2s;
        }

        .dwjd-ai-send:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.03);
        }

        .dwjd-ai-send:disabled {
          opacity: .38;
          cursor: not-allowed;
        }

        .dwjd-ai-note {
          padding: 0 12px 10px;
          color: #657187;
          background: rgba(255,255,255,.015);
          text-align: center;
          font-size: 10px;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .dwjd-ai-launcher {
            left: 12px;
            bottom: 13px;
            width: 62px;
            height: 62px;
          }

          .dwjd-ai-face { font-size: 42px; }

          .dwjd-ai-panel {
            left: 8px;
            bottom: 82px;
            width: calc(100vw - 16px);
            height: min(650px, calc(100dvh - 94px));
            min-height: 300px;
            border-radius: 22px;
          }

          .dwjd-ai-header { padding: 13px; }
          .dwjd-ai-messages { padding: 13px 10px; gap: 12px; }

          .dwjd-ai-bubble {
            max-width: 88%;
            padding: 10px 12px;
          }

          .dwjd-ai-quick {
            padding-left: 10px;
            padding-right: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dwjd-ai *,
          .dwjd-ai *::before,
          .dwjd-ai *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <button
        className="dwjd-ai-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close DWJD Assistant" : "Open DWJD Assistant"}
        aria-expanded={open}
      >
        {open ? (
          <span className="dwjd-ai-close-face">×</span>
        ) : (
          <span className="dwjd-ai-face">
            🤖
            <span className="dwjd-ai-spark">✦</span>
            <span className="dwjd-ai-orbit" />
          </span>
        )}
      </button>

      {open && (
        <section className="dwjd-ai-panel" aria-label="DWJD Assistant">
          <header className="dwjd-ai-header">
            <div className="dwjd-ai-header-face" aria-hidden="true">
              {mood === "thinking"
                ? "🤔"
                : mood === "confused"
                ? "😵‍💫"
                : "🤖"}
            </div>

            <div className="dwjd-ai-heading">
              <h2 className="dwjd-ai-title">DWJD Assistant</h2>
              <div className="dwjd-ai-status">
                <span className="dwjd-ai-status-dot" />
                {loading
                  ? "Thinking really hard..."
                  : mood === "confused"
                  ? "Oops! Let's try again"
                  : "Online — ready to help"}
              </div>
            </div>

            <button
              className="dwjd-ai-icon-button"
              onClick={resetChat}
              disabled={loading}
              title="Start a new conversation"
              aria-label="Start a new conversation"
            >
              ↻
            </button>

            <button
              className="dwjd-ai-icon-button"
              onClick={() => setOpen(false)}
              title="Close chat"
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="dwjd-ai-messages" aria-live="polite">
            {chat.map((item, index) => (
              <div
                className={`dwjd-ai-row ${item.from}`}
                key={`${index}-${item.from}`}
              >
                <div className={`dwjd-ai-mini-face ${item.from}`}>
                  {item.from === "bot" ? "🤖" : renderUserAvatar()}
                </div>

                <div className={`dwjd-ai-bubble ${item.from}`}>
                  {item.from === "bot" ? (
                    <ReactMarkdown
                      components={{ a: SafeMarkdownLink }}
                    >
                      {item.text}
                    </ReactMarkdown>
                  ) : (
                    item.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="dwjd-ai-row bot">
                <div className="dwjd-ai-mini-face">🤖</div>
                <div className="dwjd-ai-typing" aria-label="AI is thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {chat.length === 1 && !loading && (
            <div className="dwjd-ai-quick">
              {QUICK_QUESTIONS.map((item) => (
                <button
                  key={item.text}
                  className="dwjd-ai-chip"
                  onClick={() => sendMessage(item.text)}
                >
                  <span>{item.icon}</span>
                  {item.text}
                </button>
              ))}
            </div>
          )}

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
              disabled={loading}
            />

            <button
              className="dwjd-ai-send"
              type="submit"
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <div className="dwjd-ai-note">
            Saving food, one conversation at a time 🌱
          </div>
        </section>
      )}
    </div>
  );
}
