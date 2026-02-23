import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://back-end-project-group.onrender.com";
// const API = "http://localhost:5000";

export default function YoutubeList() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.get(`${API}/youtube-content`);

        if (res.data?.status === "success") {
          const contents = res.data.contents || [];

          // 🔥 REMOVE DUPLICATES
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
        ⏳ Loading contents...
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
    <div className="min-h-screen bg-black text-white">

      {/* ===== HEADER ===== */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10"
          >
            ⬅ Back
          </button>

          <h1 className="text-2xl font-bold">
            📚 Learning Contents
          </h1>

          <div className="w-20" />
        </div>
      </div>

      {/* ===== LIST ===== */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {list.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            No content available yet 🚫
          </div>
        ) : (
          <div className="grid gap-5">
            {list.map(item => (
              <div
                key={item._id}
                onClick={() =>
                  window.open(`/youtube/${item._id}`, "_blank")
                }
                className="
                  p-6 rounded-2xl cursor-pointer
                  bg-white/5 hover:bg-white/10
                  border border-white/10
                  transition
                "
              >
                <h2 className="text-xl font-semibold mb-2">
                  {item.title}
                </h2>

                <div className="flex gap-6 text-xs text-gray-400">
                  <span>👀 {item.views} views</span>
                  <span>
                    📅 {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}