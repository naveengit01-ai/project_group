import { useState, useRef, useEffect } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";
// const BASE_URL = "http://localhost:5000";

export default function AI_Bot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      from: "bot",
      text: "Hey there! 👋 I'm your DWJD Assistant. How can I help you today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.toLowerCase();

    // 🟢 CLIENT-SIDE GREETINGS (NO API CALL)
    const greetings = ["hi", "hello", "hey", "good morning", "good evening"];
    if (greetings.some(g => userMessage.includes(g))) {
      setChat(prev => [
        ...prev,
        { from: "user", text: message },
        { from: "bot", text: "Hey 👋 How can I help you today?" }
      ]);
      setMessage("");
      return;
    }

    setChat(prev => [...prev, { from: "user", text: message }]);
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      if (!res.ok) {
        setChat(prev => [
          ...prev,
          { from: "bot", text: data.error || "Please login to continue." }
        ]);
        return;
      }

      setChat(prev => [
        ...prev,
        { from: "bot", text: data.reply }
      ]);
    } catch (err) {
      setChat(prev => [
        ...prev,
        { from: "bot", text: "⚠️ Server not reachable right now." }
      ]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');

        .ai-bot-wrap * {
          font-family: 'Sora', sans-serif;
          box-sizing: border-box;
        }

        /* Toggle Button */
        .ai-toggle-btn {
          position: fixed;
          bottom: 28px;
          left: 28px;
          z-index: 9999;
          width: 58px;
          height: 58px;
          border-radius: 18px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          color: white;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.45), 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ai-toggle-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.55), 0 4px 12px rgba(0,0,0,0.2);
        }
        .ai-toggle-btn:active {
          transform: scale(0.96);
        }

        /* Chat Window */
        .ai-chat-window {
          position: fixed;
          bottom: 100px;
          left: 28px;
          z-index: 9998;
          width: 340px;
          height: 480px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(15, 12, 30, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(139, 92, 246, 0.25);
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.08);
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .ai-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .ai-header::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 100px; height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }
        .ai-header-avatar {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .ai-header-info {
          flex: 1;
        }
        .ai-header-title {
          color: white;
          font-weight: 600;
          font-size: 14px;
          line-height: 1.2;
        }
        .ai-header-status {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }
        .ai-status-dot {
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .ai-status-text {
          color: rgba(255,255,255,0.75);
          font-size: 11px;
          font-weight: 400;
        }
        .ai-close-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.15s;
        }
        .ai-close-btn:hover { background: rgba(255,255,255,0.25); }

        /* Messages Area */
        .ai-messages {
          flex: 1;
          padding: 16px 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(139,92,246,0.3) transparent;
        }
        .ai-messages::-webkit-scrollbar { width: 4px; }
        .ai-messages::-webkit-scrollbar-track { background: transparent; }
        .ai-messages::-webkit-scrollbar-thumb {
          background: rgba(139,92,246,0.3);
          border-radius: 4px;
        }

        .ai-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ai-msg-row.user { flex-direction: row-reverse; }

        .ai-msg-avatar {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .ai-msg-avatar.bot {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .ai-msg-avatar.user {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .ai-bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 400;
        }
        .ai-bubble.bot {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom-left-radius: 4px;
        }
        .ai-bubble.user {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-bottom-right-radius: 4px;
        }

        /* Typing Indicator */
        .ai-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          width: fit-content;
        }
        .ai-typing span {
          width: 6px;
          height: 6px;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        /* Input Area */
        .ai-input-area {
          padding: 12px 14px;
          background: rgba(255,255,255,0.03);
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }
        .ai-input {
          flex: 1;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .ai-input::placeholder { color: rgba(255,255,255,0.3); }
        .ai-input:focus {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(255,255,255,0.1);
        }
        .ai-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .ai-send-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.55);
        }
        .ai-send-btn:active { transform: scale(0.95); }
        .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Noise texture overlay */
        .ai-chat-window::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: 24px;
          z-index: 0;
        }
        .ai-header, .ai-messages, .ai-input-area { position: relative; z-index: 1; }
      `}</style>

      <div className="ai-bot-wrap">
        {/* Toggle Button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="ai-toggle-btn"
          title="Chat with AI"
        >
          {open ? "✕" : "🤖"}
        </button>

        {/* Chat Window */}
        {open && (
          <div className="ai-chat-window">
            {/* Header */}
            <div className="ai-header">
              <div className="ai-header-avatar">🤖</div>
              <div className="ai-header-info">
                <div className="ai-header-title">DWJD Assistant</div>
                <div className="ai-header-status">
                  <div className="ai-status-dot" />
                  <span className="ai-status-text">Online — ready to help</span>
                </div>
              </div>
              <button className="ai-close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="ai-messages">
              {chat.map((c, i) => (
                <div key={i} className={`ai-msg-row ${c.from}`}>
                  <div className={`ai-msg-avatar ${c.from}`}>
                    {c.from === "bot" ? "🤖" : "👤"}
                  </div>
                  <div className={`ai-bubble ${c.from}`}>{c.text}</div>
                </div>
              ))}

              {loading && (
                <div className="ai-msg-row bot">
                  <div className="ai-msg-avatar bot">🤖</div>
                  <div className="ai-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="ai-input-area">
              <input
                className="ai-input"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
                placeholder="Ask me anything..."
                disabled={loading}
              />
              <button
                className="ai-send-btn"
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                title="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}