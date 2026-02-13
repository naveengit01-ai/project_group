import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const API = "https://back-end-project-group.onrender.com";
// const API = "http://localhost:5000";

export default function YoutubeView() {
  const { id } = useParams();
  const codeRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

  /* 🔥 Highlight after render */
  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [data]);

  const copyEmbedCode = async () => {
    await navigator.clipboard.writeText(data.embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="border-b border-white/20 pb-4">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>👀 {data.views} views</span>
            <span>{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-300">
            Description
          </h2>
          <p className="text-gray-400">{data.description}</p>
        </div>

        {/* EMBED CODE */}
        <div className="border border-white/20 rounded-xl bg-black/60">
          <div className="flex justify-between items-center px-5 py-3 border-b border-white/10">
            <span className="text-sm text-gray-400">
              Embed Code (Auto-detected)
            </span>
            <button
              onClick={copyEmbedCode}
              className="text-xs px-3 py-1 border border-white/20 rounded hover:bg-white/20"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <pre className="overflow-x-auto p-5 text-sm">
            <code ref={codeRef} className="language-html">
              {data.embedCode}
            </code>
          </pre>
        </div>

      </div>
    </div>
  );
}
