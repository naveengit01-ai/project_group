import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://dwjd-backend.onrender.com";
// const API = "http://localhost:5000";

export default function YoutubeList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.get(`${API}/youtube-content`);

        // ✅ Defensive check (important)
        if (res.data && res.data.status === "success") {
          setList(res.data.contents || []);
        } else {
          setError("Failed to load contents");
        }
      } catch (err) {
        console.error("Failed to load youtube contents", err);
        setError("Server not reachable");
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  /* ================= CONTENT ================= */
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">
        📺 YouTube Contents
      </h1>

      {list.length === 0 ? (
        <p className="text-gray-400">
          No content available
        </p>
      ) : (
        <div className="space-y-4">
          {list.map(item => (
            <div
              key={item._id}
              onClick={() =>
                window.open(`/youtube/${item._id}`, "_blank")
              }
              className="p-5 bg-white/10 rounded cursor-pointer
                         hover:bg-white/20 transition"
            >
              <h2 className="text-xl font-bold">
                {item.title}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {item.description}
              </p>

              <p className="text-xs mt-2 text-gray-500">
                👀 {item.views} views
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
