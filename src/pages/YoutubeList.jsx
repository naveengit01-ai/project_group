import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://back-end-project-group.onrender.com";

export default function YoutubeList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.get(`${API}/youtube-content`);

        if (res.data?.status === "success") {
          const contents = res.data.contents || [];

          const uniqueMap = new Map();
          contents.forEach(item => {
            if (!uniqueMap.has(item._id)) {
              uniqueMap.set(item._id, item);
            }
          });

          setList(Array.from(uniqueMap.values()));
        } else {
          setError("Failed to load contents");
        }
      } catch {
        setError("Server not reachable");
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  /* ================= LOADING (FOOD THEME) ================= */
  if (loading) {
    return (
      <>
        <style>{`
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

          .food-loader {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            z-index: 1;
            position: relative;
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
              <div className="food-icon">🍲</div>
            </div>

            <div className="food-text">
              Preparing fresh learning content
            </div>
            <div className="food-sub">
              Knowledge served hot, waste kept low 🌱
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#07080f",
        color: "#f87171",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Mono"
      }}>
        {error}
      </div>
    );
  }

  /* ================= CONTENT ================= */
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
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 24px 120px;
          position: relative;
          z-index: 1;
        }

        .cr-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .cr-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .cr-sub {
          font-family: 'DM Mono';
          font-size: 13px;
          color: rgba(238,234,244,0.45);
        }

        .cr-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 26px;
          cursor: pointer;
          transition: all .3s cubic-bezier(.34,1.56,.64,1);
        }

        .cr-card:hover {
          transform: translateY(-4px);
          border-color: rgba(52,211,153,0.35);
          background: rgba(52,211,153,0.06);
          box-shadow: 0 20px 40px rgba(0,0,0,.4);
        }

        .cr-meta {
          font-family: 'DM Mono';
          font-size: 12px;
          color: rgba(238,234,244,0.4);
          margin-top: 6px;
        }
      `}</style>

      <div className="cr-root">
        <div className="cr-grid-bg" />

        <div className="cr-wrap">
          <div className="cr-header">
            <h1 className="cr-title">Learning Kitchen 🍽️</h1>
            <p className="cr-sub">
              Bite-sized lessons, cooked with care
            </p>
          </div>

          {list.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(238,234,244,0.4)" }}>
              No content available yet 🌱
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {list.map(item => (
                <div
                  key={item._id}
                  className="cr-card"
                  onClick={() =>
                    window.open(`/youtube/${item._id}`, "_blank")
                  }
                >
                  <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
                    {item.title}
                  </h2>

                  <div className="cr-meta">
                    👀 {item.views} views · 📅{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}