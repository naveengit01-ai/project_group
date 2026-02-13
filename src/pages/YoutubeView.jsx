import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "https://dwjd-backend.onrender.com";
// const API = "http://localhost:5000";

export default function YoutubeView() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true; // prevent state update after unmount

    const fetchContent = async () => {
      try {
        const res = await axios.get(`${API}/youtube/${id}`, {
          timeout: 10000 // avoid hanging forever
        });

        if (
          isMounted &&
          res.data &&
          res.data.status === "success" &&
          res.data.content
        ) {
          setData(res.data.content);
        } else if (isMounted) {
          setError("Content not found");
        }
      } catch (err) {
        console.error("Failed to load content:", err.message);
        if (isMounted) {
          setError("Unable to reach server");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [id]);

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
    <div className="min-h-screen bg-black text-white p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        {data.title}
      </h1>

      <p className="mb-6 text-gray-300">
        {data.description}
      </p>

      {/* VIDEO / EMBED */}
      <div
        className="w-full aspect-video rounded overflow-hidden bg-black mb-6"
        dangerouslySetInnerHTML={{ __html: data.embedCode }}
      />

      <p className="text-sm text-gray-400">
        👀 {data.views} views
      </p>
    </div>
  );
}
