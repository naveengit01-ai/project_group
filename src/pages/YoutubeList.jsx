import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://back-end-project-group.onrender.com";
// const API = "http://localhost:5000";

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

          // 🔥 REMOVE DUPLICATES (by _id → safest)
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
        📚 Contents
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
              className="
                p-5 rounded-xl cursor-pointer
                bg-white/5 hover:bg-white/10
                border border-white/10
                transition
              "
            >
              <h2 className="text-xl font-semibold">
                {item.title}
              </h2>

              <div className="flex gap-4 text-xs text-gray-400 mt-2">
                <span>👀 {item.views} views</span>
                <span>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
