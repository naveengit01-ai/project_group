import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const API = "https://back-end-project-group.onrender.com";

export default function YoutubeView() {
  const { id } = useParams();
  const codeRefs = useRef([]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`${API}/youtube/${id}`);
        if (res.data?.status === "success") {
          setData(res.data.content);
        } else {
          setError("Content not found");
        }
      } catch {
        setError("Unable to reach server");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  /* ================= HIGHLIGHT ================= */
  useEffect(() => {
    codeRefs.current.forEach(el => el && hljs.highlightElement(el));
  }, [data]);

  const copyCode = async (code, index) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  /* ================= LOADING ================= */
/* ================= LOADING ================= */
if (loading) {
  return (
    <>
      <style>{`
        /* FORCE DARK BACKGROUND */
        html, body {
          background: #07080f;
          margin: 0;
        }

        .cr-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .cr-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none;
        }

        .cr-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }

        /* FOOD LOADER */
        .food-loader {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .food-plate {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 2px dashed rgba(52,211,153,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: plateSpin 6s linear infinite;
          margin-bottom: 22px;
        }

        .food-icon {
          font-size: 36px;
          animation: foodPop 1.6s ease-in-out infinite;
        }

        @keyframes plateSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes foodPop {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .food-text {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .food-sub {
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          color: rgba(238,234,244,0.45);
        }
      `}</style>

      <div className="cr-root">
        <div className="cr-grid-bg" />

        <div className="food-loader">
          <div className="food-plate">
            <div className="food-icon">🥗</div>
          </div>

          <div className="food-text">
            Preparing fresh learning content
          </div>
          <div className="food-sub">
            Reducing waste, one lesson at a time 🌱
          </div>
        </div>
      </div>
    </>
  );
}

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="cr-root">
        <div className="cr-empty">{error}</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

        .cr-root {
          min-height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          position: relative;
        }

        .cr-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%, rgba(52,211,153,0.07), transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06), transparent 60%);
          pointer-events: none;
        }

        .cr-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }

        .cr-wrap {
          max-width: 1000px;
          margin: 0 auto;
          padding: 90px 24px 120px;
          position: relative;
          z-index: 1;
        }

        .cr-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 28px;
          margin-bottom: 28px;
          animation: crCardIn .5s ease both;
        }

        @keyframes crCardIn {
          from { opacity:0; transform:translateY(18px); }
          to { opacity:1; transform:translateY(0); }
        }

        .cr-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .cr-meta {
          font-family: 'DM Mono';
          font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        .cr-code {
          margin-top: 16px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .cr-code-head {
          display:flex;
          justify-content:space-between;
          padding:10px 14px;
          background: rgba(255,255,255,0.05);
          font-size:11px;
          font-family:'DM Mono';
        }

        .cr-copy {
          cursor:pointer;
          padding:4px 10px;
          border-radius:8px;
          border:1px solid rgba(255,255,255,0.2);
        }

        .cr-copy:hover {
          background:#34d399;
          color:#07080f;
        }

        .cr-empty {
          text-align:center;
          padding:120px 0;
          color: rgba(238,234,244,0.4);
          font-family:'DM Mono';
        }

        .cr-spinner {
          width:32px;height:32px;
          border:2px solid rgba(52,211,153,.2);
          border-top-color:#34d399;
          border-radius:50%;
          animation:spin .8s linear infinite;
          margin:0 auto 14px;
        }

        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="cr-root">
        <div className="cr-grid-bg" />

        <div className="cr-wrap">
          {/* TITLE */}
          <div className="cr-section">
            <div className="cr-title">{data.title}</div>
            <div className="cr-meta">
              👀 {data.views} views · {new Date(data.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* EMBED */}
          {data.embedCode && (
            <div className="cr-section">
              <div className="cr-code">
                <div className="cr-code-head">
                  Embed Code
                  <span
                    className="cr-copy"
                    onClick={() => copyCode(data.embedCode, "embed")}
                  >
                    {copiedIndex === "embed" ? "Copied" : "Copy"}
                  </span>
                </div>
                <pre><code className="language-html">{data.embedCode}</code></pre>
              </div>
            </div>
          )}

          {/* TOPICS */}
          {data.mainTopics?.map((main, m) => (
            <div key={m} className="cr-section">
              <h2 style={{ color: "#34d399" }}>{main.title}</h2>
              {main.notes && <p className="cr-meta">{main.notes}</p>}

              {main.code && (
                <div className="cr-code">
                  <div className="cr-code-head">
                    Code
                    <span
                      className="cr-copy"
                      onClick={() => copyCode(main.code, `m-${m}`)}
                    >
                      {copiedIndex === `m-${m}` ? "Copied" : "Copy"}
                    </span>
                  </div>
                  <pre>
                    <code
                      ref={el => (codeRefs.current[m] = el)}
                      className="language-javascript"
                    >
                      {main.code}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}