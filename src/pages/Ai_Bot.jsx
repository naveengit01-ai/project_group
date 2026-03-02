import { useState, useRef, useEffect } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function AI_Bot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      from: "bot",
      text: "Hey there! 👋 I'm your DWJD Assistant. Ask me anything about food donation, pickups, or how the platform works."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const cleanMessage = message.trim();
    const lowerMessage = cleanMessage.toLowerCase();

    const greetings = ["hi", "hello", "hey", "good morning", "good evening"];
    if (greetings.includes(lowerMessage)) {
      setChat(prev => [
        ...prev,
        { from: "user", text: cleanMessage },
        { from: "bot", text: "Hey 👋 How can I help you today?" }
      ]);
      setMessage("");
      return;
    }

    setChat(prev => [...prev, { from: "user", text: cleanMessage }]);
    setMessage("");
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ message: cleanMessage })
      });
      const data = await res.json();
      setChat(prev => [...prev, { from: "bot", text: data.reply || "I'm here 🙂 How can I help you?" }]);
    } catch {
      setChat(prev => [...prev, { from: "bot", text: "⚠️ Server not reachable right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        /* ── TOGGLE BUTTON ── */
        .ab-toggle {
          position: fixed;
          bottom: 28px;
          left: 28px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 18px;
          border: 1px solid rgba(52,211,153,0.35);
          cursor: pointer;
          background: linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.1));
          backdrop-filter: blur(12px);
          color: #34d399;
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.4),
            0 0 0 1px rgba(52,211,153,0.08) inset,
            0 0 24px rgba(52,211,153,0.12);
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .ab-toggle:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow:
            0 12px 40px rgba(0,0,0,0.5),
            0 0 0 1px rgba(52,211,153,0.15) inset,
            0 0 32px rgba(52,211,153,0.2);
          border-color: rgba(52,211,153,0.55);
        }

        .ab-toggle:active { transform: scale(0.96); }

        .ab-toggle-ring {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 9998;
          width: 64px;
          height: 64px;
          border-radius: 22px;
          border: 1px solid rgba(52,211,153,0.12);
          pointer-events: none;
          animation: abRingPulse 3s ease-in-out infinite;
        }

        @keyframes abRingPulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.15); }
        }

        /* ── WINDOW ── */
        .ab-window {
          position: fixed;
          bottom: 100px;
          left: 28px;
          z-index: 9998;
          width: 348px;
          height: 500px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #0d0e1a;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 32px 64px rgba(0,0,0,0.6),
            0 0 0 1px rgba(52,211,153,0.04) inset;
          animation: abSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes abSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.94); transform-origin: bottom left; }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ab-window::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          z-index: 2;
        }

        /* ── HEADER ── */
        .ab-header {
          padding: 16px 18px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .ab-header-icon {
          width: 38px; height: 38px;
          border-radius: 12px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .ab-header-info { flex: 1; }

        .ab-header-name {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #eeeaf4;
          letter-spacing: -0.01em;
        }

        .ab-header-status {
          display: flex; align-items: center; gap: 5px;
          margin-top: 2px;
        }

        .ab-status-dot {
          width: 6px; height: 6px;
          background: #34d399;
          border-radius: 50%;
          animation: abBlink 2s ease-in-out infinite;
        }

        @keyframes abBlink { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .ab-status-text {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(52,211,153,0.7);
          letter-spacing: 0.05em;
        }

        .ab-close {
          width: 30px; height: 30px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(238,234,244,0.5);
          font-size: 13px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .ab-close:hover {
          background: rgba(255,255,255,0.09);
          color: #eeeaf4;
          border-color: rgba(255,255,255,0.15);
        }

        /* ── MESSAGES ── */
        .ab-messages {
          flex: 1;
          padding: 14px 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(52,211,153,0.15) transparent;
          position: relative;
          z-index: 1;
        }

        .ab-messages::-webkit-scrollbar { width: 3px; }
        .ab-messages::-webkit-scrollbar-thumb {
          background: rgba(52,211,153,0.2);
          border-radius: 3px;
        }

        .ab-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: abMsgIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes abMsgIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ab-msg-row.user { flex-direction: row-reverse; }

        .ab-avatar {
          width: 26px; height: 26px;
          border-radius: 8px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .ab-avatar.bot {
          background: rgba(52,211,153,0.1);
          border-color: rgba(52,211,153,0.2);
        }

        .ab-avatar.user {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.25);
        }

        .ab-bubble {
          max-width: 80%;
          padding: 10px 13px;
          border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 400;
        }

        .ab-bubble.bot {
          background: rgba(255,255,255,0.04);
          color: rgba(238,234,244,0.85);
          border: 1px solid rgba(255,255,255,0.07);
          border-bottom-left-radius: 4px;
        }

        .ab-bubble.user {
          background: rgba(52,211,153,0.12);
          color: #eeeaf4;
          border: 1px solid rgba(52,211,153,0.2);
          border-bottom-right-radius: 4px;
        }

        /* ── TYPING ── */
        .ab-typing {
          display: flex; align-items: center; gap: 4px;
          padding: 10px 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          border-bottom-left-radius: 4px;
          width: fit-content;
        }

        .ab-typing span {
          width: 5px; height: 5px;
          background: rgba(52,211,153,0.5);
          border-radius: 50%;
          animation: abBounce 1.2s infinite;
        }

        .ab-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ab-typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes abBounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        /* ── DATE CHIP ── */
        .ab-date-chip {
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.2);
          letter-spacing: 0.07em;
          padding: 2px 0 4px;
        }

        /* ── INPUT AREA ── */
        .ab-input-area {
          padding: 12px 12px;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .ab-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 13px;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }

        .ab-input::placeholder { color: rgba(238,234,244,0.2); }

        .ab-input:focus {
          border-color: rgba(52,211,153,0.35);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.07);
        }

        .ab-input:disabled { opacity: 0.5; }

        .ab-send {
          width: 38px; height: 38px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, #34d399, #10b981);
          color: #07080f;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 4px 14px rgba(52,211,153,0.35);
          position: relative;
          overflow: hidden;
        }

        .ab-send::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
        }

        .ab-send:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(52,211,153,0.5);
        }

        .ab-send:active:not(:disabled) { transform: scale(0.95); }
        .ab-send:disabled { opacity: 0.4; cursor: not-allowed; }

        @media (max-width: 400px) {
          .ab-window { width: calc(100vw - 32px); left: 16px; }
          .ab-toggle { left: 16px; bottom: 20px; }
          .ab-toggle-ring { left: 12px; bottom: 16px; }
        }
      `}</style>

      {/* PULSE RING */}
      {!open && <div className="ab-toggle-ring" />}

      {/* TOGGLE */}
      <button
        className="ab-toggle"
        onClick={() => setOpen(o => !o)}
        title="Chat with AI"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* WINDOW */}
      {open && (
        <div className="ab-window">
          {/* HEADER */}
          <div className="ab-header">
            <div className="ab-header-icon">🤖</div>
            <div className="ab-header-info">
              <div className="ab-header-name">DWJD Assistant</div>
              <div className="ab-header-status">
                <div className="ab-status-dot" />
                <span className="ab-status-text">Online — ready to help</span>
              </div>
            </div>
            <button className="ab-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* MESSAGES */}
          <div className="ab-messages">
            <div className="ab-date-chip">Today</div>

            {chat.map((c, i) => (
              <div key={i} className={`ab-msg-row ${c.from}`}>
                <div className={`ab-avatar ${c.from}`}>
                  {c.from === "bot" ? "🤖" : "👤"}
                </div>
                <div className={`ab-bubble ${c.from}`}>{c.text}</div>
              </div>
            ))}

            {loading && (
              <div className="ab-msg-row bot">
                <div className="ab-avatar bot">🤖</div>
                <div className="ab-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="ab-input-area">
            <input
              className="ab-input"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button
              className="ab-send"
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              title="Send"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{position:"relative",zIndex:1}}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}